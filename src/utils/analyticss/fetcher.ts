import type { BigQueryResponse } from "@/utils/BigQuery/types";
import type { PaginatedResponse, PaginationParams } from "@/types/pagination";

export async function fetchAnalytics(config: {
  projectId: string;
  datasetId: string;
  startTableName: string;
  endTableName: string;
  pageToken?: string;
  pageSize?: number;
}): Promise<PaginatedResponse<BigQueryResponse>> {
  const response = await fetch("/api/analytics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch analytics data");
  }

  return response.json(); 
}