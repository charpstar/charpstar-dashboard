import { NextResponse } from "next/server";
import { getBigQueryClient } from "@/utils/BigQuery/client";
import { queries } from "@/utils/BigQuery/clientQueries";
import { getEventsBetween } from "@/utils/BigQuery/utils";
import { executePagedQuery } from "@/utils/BigQuery/pagination";
import type { BigQueryResponse } from "@/utils/BigQuery/types";

export async function POST(request: Request) {
  try {
    const { 
      projectId, 
      datasetId, 
      startTableName, 
      endTableName,
      pageToken,
      pageSize = 1000
    } = await request.json();

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

    const result = await executePagedQuery(bigqueryClient, query, {
      pageSize,
      pageToken,
      timeoutMs: 60000
    });

    return NextResponse.json({
      data: result.rows as BigQueryResponse[],
      nextPageToken: result.nextPageToken,
      totalRows: result.totalRows
    });
  } catch (error) {
    console.error("BigQuery API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}