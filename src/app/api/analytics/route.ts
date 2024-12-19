import { NextResponse } from "next/server";
import { getBigQueryClient } from "@/utils/BigQuery/client";
import { buildOptimizedQuery } from "@/utils/BigQuery/optimizedQuery";
import type { BigQueryResponse } from "@/utils/BigQuery/types";

// Set response configuration
export const runtime = 'edge'; // Use edge runtime for better performance
export const dynamic = 'force-dynamic'; // Disable caching
export const fetchCache = 'force-no-store';

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
    const query = buildOptimizedQuery({
      projectId,
      datasetId,
      startTableName,
      endTableName,
    });

    const options = {
      query,
      projectId,
      maximumBytesBilled: "1000000000", // 1GB
    };

    const [job] = await bigqueryClient.createQueryJob(options);
    const [response] = await job.getQueryResults({ 
      maxResults: 1000,
      timeoutMs: 120000 // 2 minute timeout
    });

    // Stream the response
    return new NextResponse(
      JSON.stringify(response),
      {
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
          'Keep-Alive': 'timeout=120',
          'Transfer-Encoding': 'chunked'
        }
      }
    );

  } catch (error) {
    console.error("BigQuery API Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Failed to fetch analytics data", details: errorMessage },
      { status: 500 }
    );
  }
}