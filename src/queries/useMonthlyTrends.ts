"use client";

import { useQuery } from "@tanstack/react-query";
import { getMonthlyTrends } from "@/utils/BigQuery/getMonthlyTrends";
import { useUser } from "@/contexts/UserContext";

export function useMonthlyTrends() {
  const user = useUser();
  const { projectId, datasetId } = user.metadata;

  return useQuery({
    queryKey: ["monthlyTrends", projectId, datasetId],
    queryFn: () => getMonthlyTrends({ projectId, datasetId }),
  });
}