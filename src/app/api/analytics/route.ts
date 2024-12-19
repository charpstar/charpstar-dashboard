import { NextResponse } from "next/server";
import { getBigQueryClient } from "@/utils/BigQuery/client";
import { queries } from "@/utils/BigQuery/clientQueries";
import { getEventsBetween } from "@/utils/BigQuery/utils";
import type { BigQueryResponse } from "@/utils/BigQuery/types";

const MAX_RESULTS = 10000; // Limit maximum results
const TIMEOUT = 60000; // 60 second timeout

export async function POST(request: Request) {
  try {
    const { projectId, datasetId, startTableName, endTableName } = await request.json();

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
      maximumBytesBilled: "10000000000", // 1GB limit
      timeoutMs: TIMEOUT,
      maxResults: MAX_RESULTS,
      useLegacySql: false
    };

    const [job] = await bigqueryClient.createQueryJob(options);
    const [response] = await job.getQueryResults({
      maxResults: MAX_RESULTS,
      timeoutMs: TIMEOUT
    });

    return NextResponse.json(response as BigQueryResponse[]);
  } catch (error) {
    console.error("BigQuery API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}