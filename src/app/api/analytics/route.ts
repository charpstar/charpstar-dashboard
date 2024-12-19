// src/app/api/analytics/route.ts
import { NextResponse } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";
import { getGCPCredentials } from "@/utils/getGCPCredentials";
import { queries } from "@/utils/BigQuery/clientQueries";
import { getEventsBetween } from "@/utils/BigQuery/utils";
import type { BigQueryResponse } from "@/utils/BigQuery/types";

const MAX_RETRIES = 3;
const TIMEOUT_MS = 180000; // 3 minutes
const BYTES_LIMIT = 6000000000;

export const maxDuration = 300; // 5 minutes

// Move getBigQueryClient into the route file
function getBigQueryClient({ projectId }: { projectId: string }) {
  const { credentials, projectId: envProjectId } = getGCPCredentials();
  
  return new BigQuery({
    projectId: projectId || envProjectId,
    credentials,
    retryOptions: {
      retryDelayMultiplier: 2,
      totalTimeout: TIMEOUT_MS,
    },
  });
}

async function executeQueryWithRetry(
  bigqueryClient: BigQuery,
  options: any,
  attempt = 1
): Promise<BigQueryResponse[]> {
  try {
    const [job] = await bigqueryClient.createQueryJob(options);
    const [response] = await job.getQueryResults({
      timeoutMs: TIMEOUT_MS,
    });
    return response;
  } catch (error) {
    if (attempt === MAX_RETRIES) throw error;
    
    await new Promise(resolve => 
      setTimeout(resolve, Math.pow(2, attempt) * 1000)
    );
    
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

    const options = {
      query,
      projectId,
      timeout: TIMEOUT_MS,
      maximumBytesBilled: BYTES_LIMIT, // Increased from 1GB to 6GB
    };

    const response = await executeQueryWithRetry(bigqueryClient, options);
    return NextResponse.json(response);

  } catch (error: any) {
    // If it's still a bytes billed error, return a more specific error message
    if (error.message?.includes('bytes billed')) {
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
}