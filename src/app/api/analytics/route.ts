// src/app/api/analytics/route.ts
import { NextResponse } from "next/server";
import { getBigQueryClient } from "@/utils/BigQuery/client";
import { queries } from "@/utils/BigQuery/clientQueries";
import { getEventsBetween } from "@/utils/BigQuery/utils";
import type { BigQueryResponse } from "@/utils/BigQuery/types";

// Set a reasonable timeout
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
      timeout: QUERY_TIMEOUT,
      maximumBytesBilled: "50000000000", // 1GB
    };

    const [job] = await bigqueryClient.createQueryJob(options);
    
    // Use Promise.race to implement timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT);
    });

    const [response] = await Promise.race([
      job.getQueryResults(),
      timeoutPromise
    ]) as [BigQueryResponse[]];

    return NextResponse.json(response);
  } catch (error) {
    console.error("BigQuery API Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Failed to fetch analytics data", details: errorMessage },
      { status: error instanceof Error && error.message === 'Query timeout' ? 504 : 500 }
    );
  }
}
