// src/queries/useClientQuery.ts
import { useQuery } from "@tanstack/react-query";
import { transformProductMetrics, transformOverallMetrics } from "@/utils/BigQuery/transformers";
import { useUser } from "@/contexts/UserContext";
import type { BigQueryResponse } from "@/utils/BigQuery/types";

async function fetchAnalytics(config: {
  projectId: string;
  datasetId: string;
  startTableName: string;
  endTableName: string;
}): Promise<BigQueryResponse[]> {
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

export function useClientQuery({
  startTableName,
  endTableName,
  limit,
}: {
  startTableName: string;
  endTableName: string;
  limit: number;
}) {
  const user = useUser();
  const { projectId, datasetId } = user.metadata;
  const shouldEnableFetching = Boolean(user && startTableName && endTableName);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "clientQuery",
      projectId,
      datasetId,
      startTableName,
      endTableName,
    ],
    queryFn: () => fetchAnalytics({
      projectId,
      datasetId,
      startTableName,
      endTableName,
    }),
    enabled: shouldEnableFetching,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,   // Changed from cacheTime to gcTime
  });

  const productMetrics = data?.filter(item => item.data_type === 'product') ?? [];
  const overallMetrics = data?.filter(item => item.data_type === 'overall') ?? [];
  
  const clientQueryResult = transformProductMetrics(productMetrics);
  const eventsCount = transformOverallMetrics(overallMetrics);

  return { 
    clientQueryResult, 
    eventsCount,
    isQueryLoading: isLoading,
    error 
  };
}