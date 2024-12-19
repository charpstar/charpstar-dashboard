import { useQuery } from "@tanstack/react-query";
import { transformProductMetrics, transformOverallMetrics } from "@/utils/BigQuery/transformers";
import { useUser } from "@/contexts/UserContext";
import type { TDatasets } from "@/utils/BigQuery/clientQueries";
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
}: {
  startTableName: string;
  endTableName: string;
  limit: number;
}) {
  const user = useUser();
  const { projectId, datasetId } = user.metadata;

  const shouldEnableFetching = Boolean(user && startTableName && endTableName);

  const { data, isLoading } = useQuery({
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
  });

  // Split and transform the data
  const productMetrics = data?.filter(item => item.data_type === 'product') ?? [];
  const overallMetrics = data?.filter(item => item.data_type === 'overall') ?? [];

  const clientQueryResult = transformProductMetrics(productMetrics);
  const eventsCount = transformOverallMetrics(overallMetrics);

  return { 
    clientQueryResult, 
    eventsCount,
    isQueryLoading: isLoading 
  };
}