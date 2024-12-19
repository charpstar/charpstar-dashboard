import { useQuery } from "@tanstack/react-query";
import { transformProductMetrics, transformOverallMetrics } from "@/utils/BigQuery/transformers";
import { useUser } from "@/contexts/UserContext";
import { fetchAnalytics } from "@/utils/analytics/fetcher";
import type { BigQueryResponse } from "@/utils/BigQuery/types";

export function useClientQuery({
  startTableName,
  endTableName,
  limit = 1000,
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
      limit,
    ],
    queryFn: async () => {
      const response = await fetchAnalytics({
        projectId,
        datasetId,
        startTableName,
        endTableName,
        pageSize: limit,
      });
      
      return response;
    },
    enabled: shouldEnableFetching,
  });

  // Split and transform the data
  const productMetrics = data?.data?.filter(item => item.data_type === 'product') ?? [];
  const overallMetrics = data?.data?.filter(item => item.data_type === 'overall') ?? [];

  const clientQueryResult = transformProductMetrics(productMetrics);
  const eventsCount = transformOverallMetrics(overallMetrics);

  return { 
    clientQueryResult, 
    eventsCount,
    isQueryLoading: isLoading,
    pagination: {
      nextPageToken: data?.nextPageToken,
      totalRows: data?.totalRows
    }
  };
}