import { useQuery } from "@tanstack/react-query";

import { executeClientQuery } from "@/utils/BigQuery/CVR";
import { useUser } from "@/contexts/UserContext";
import { type TDatasets } from "@/utils/BigQuery/clientQueries";

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

  const { data: _clientQueryResult, isLoading: isQueryLoading } = useQuery({
    queryKey: [
      "clientQuery",
      projectId,
      datasetId,
      startTableName,
      endTableName,
    ],
    queryFn: executeClientQueryFn,
    enabled: shouldEnableFetching,
  });

  const clientQueryResult = _clientQueryResult ?? [];

  return { clientQueryResult, isQueryLoading };
}

export function executeClientQueryFn({
  queryKey,
}: {
  queryKey: [string, string, TDatasets, string, string];
}) {
  const [, projectId, datasetId, startTableName, endTableName] = queryKey;

  return executeClientQuery({
    projectId,
    datasetId,

    startTableName,
    endTableName,
  });
}
