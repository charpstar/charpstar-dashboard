// src/app/api/analytics/route.ts
import { NextResponse } from "next/server";
import { BigQuery, JobOptions, QueryRowsResponse } from "@google-cloud/bigquery";
import { getBigQueryClient } from "@/utils/BigQuery/client";
import { queries } from "@/utils/BigQuery/clientQueries";
import { getEventsBetween } from "@/utils/BigQuery/utils";
import type { BigQueryResponse } from "@/utils/BigQuery/types";

const MAX_RETRIES = 3;
const TIMEOUT_MS = 180000; // 3 minutes
const BYTES_LIMIT = 6000000000; // 6GB

interface QueryOptions extends JobOptions {
  query: string;
  projectId: string;
  timeoutMs?: number;
  maximumBytesBilled?: string | number;
}

async function executeQueryWithRetry(
  bigqueryClient: BigQuery,
  options: QueryOptions,
  attempt = 1
): Promise<QueryRowsResponse> {
  try {
    const [job] = await bigqueryClient.createQueryJob(options);
    const [response] = await job.getQueryResults({
      timeoutMs: TIMEOUT_MS,
    });
    return response;
  } catch (error) {
    if (attempt === MAX_RETRIES) throw error;
    
    const delay = Math.min(Math.pow(2, attempt) * 1000, 30000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return executeQueryWithRetry(bigqueryClient, options, attempt + 1);
  }
}

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

    const options: QueryOptions = {
      query,
      projectId,
      timeoutMs: TIMEOUT_MS,
      maximumBytesBilled: BYTES_LIMIT,
    };

    const response = await executeQueryWithRetry(bigqueryClient, options);
    return NextResponse.json(response as BigQueryResponse[]);

  } catch (error) {
    if (error instanceof Error && error.message?.includes('bytes billed')) {
      return NextResponse.json(
        { 
          error: "Query too large for current settings. Please try a smaller date range.",
          details: error.message 
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("BigQuery API Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch analytics data",
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}