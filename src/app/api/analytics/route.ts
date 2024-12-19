import { NextResponse } from "next/server";
import { getBigQueryClient } from "@/utils/BigQuery/client";
import { queries } from "@/utils/BigQuery/clientQueries";
import { getEventsBetween } from "@/utils/BigQuery/utils";
import type { BigQueryResponse } from "@/utils/BigQuery/types";

const QUERY_TIMEOUT = 60000; // 60 seconds

export async function POST(request: Request) {
  try {
    const { projectId, datasetId, startTableName, endTableName } = await request.json();

    if (!projectId || !datasetId || !startTableName || !endTableName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const bigqueryClient = getBigQueryClient({ projectId });
    const query = queries[datasetId as keyof typeof queries](
      getEventsBetween({ startTableName, endTableName })
    );

    if (!query) {
      return NextResponse.json(
        { error: `Query not found for datasetId: ${datasetId}` },
        { status: 400 }
      );
    }

    const options = {
      query,
      projectId,
      maximumBytesBilled: "1000000000", // 1GB
      // Add query optimization hints
      configuration: {
        query: {
          maximumBytesBilled: "1000000000",
          useQueryCache: true,
          priority: "INTERACTIVE",
          useLegacySql: false
        }
      }
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), QUERY_TIMEOUT);

    try {
      const [job] = await bigqueryClient.createQueryJob(options);
      const [response] = await job.getQueryResults({
        maxResults: 1000,
        timeoutMs: QUERY_TIMEOUT
      });

      clearTimeout(timeout);
      return NextResponse.json(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: "Query timeout exceeded" },
          { status: 504 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("BigQuery API Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Failed to fetch analytics data", details: errorMessage },
      { status: 500 }
    );
  }
}
