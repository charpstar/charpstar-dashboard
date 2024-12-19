// src/app/api/analytics/route.ts
import { NextResponse } from "next/server";
import { BigQuery, Job, QueryRowsResponse } from "@google-cloud/bigquery";
import { getBigQueryClient } from "@/utils/BigQuery/client";
import { queries } from "@/utils/BigQuery/clientQueries";
import { getEventsBetween } from "@/utils/BigQuery/utils";
import type { BigQueryResponse } from "@/utils/BigQuery/types";

const MAX_RETRIES = 3;
const TIMEOUT_MS = 180000; // 3 minutes
const BYTES_LIMIT = 6000000000; // 6GB

interface QueryOptions {
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
    // Properly type the createQueryJob response
    const jobResponse = await bigqueryClient.createQueryJob(options);
    const job = jobResponse[0] as Job;
    
    // Properly type the query results
    const queryResponse = await job.getQueryResults({
      timeoutMs: TIMEOUT_MS,
    });
    const rows = queryResponse[0];
    
    return rows;
  } catch (error) {
    if (attempt === MAX_RETRIES) throw error;
    
    const delay = Math.min(Math.pow(2, attempt) * 1000, 30000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return executeQueryWithRetry(bigqueryClient, options, attempt + 1);
  }
}

interface QueryRequestBody {
  projectId: string;
  datasetId: string;
  startTableName: string;
  endTableName: string;
}

export async function POST(request: Request) {
  try {
    // Type the request body
    const body = await request.json() as QueryRequestBody;
    const { projectId, datasetId, startTableName, endTableName } = body;
    
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
    
    // Ensure response matches expected BigQueryResponse type
    const typedResponse = response as unknown as BigQueryResponse[];
    return NextResponse.json(typedResponse);

  } catch (error) {
    // Type guard for error handling
    if (error instanceof Error) {
      if (error.message.includes('bytes billed')) {
        return NextResponse.json(
          { 
            error: "Query too large for current settings. Please try a smaller date range.",
            details: error.message 
          },
          { status: 400 }
        );
      }

      console.error("BigQuery API Error:", error);
      return NextResponse.json(
        { 
          error: "Failed to fetch analytics data",
          details: error.message 
        },
        { status: 500 }
      );
    }

    // Handle non-Error objects
    console.error("Unknown BigQuery Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch analytics data",
        details: "An unknown error occurred" 
      },
      { status: 500 }
    );
  }
}