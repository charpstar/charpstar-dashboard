import { useQuery } from "@tanstack/react-query";

import { executeClientQuery } from "@/utils/BigQuery/CVR";
import { useUser } from "@/contexts/UserContext";

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

  const { data: _clientQueryResult, isLoading: isQueryLoading } = useQuery({
    queryKey: [
      "clientQuery",
      projectId,
      datasetId,
      startTableName,
      endTableName,
      limit,
    ],
    queryFn: executeClientQueryFn,
    enabled: shouldEnableFetching,
  });

  const clientQueryResult = _clientQueryResult || [];

  return { clientQueryResult, isQueryLoading };
}

export function executeClientQueryFn({
  queryKey,
}: {
  queryKey: [
    string,
    string,
    Parameters<typeof executeClientQuery>[0]["datasetId"],
    string,
    string,
    number,
  ];
}) {
  const [_, projectId, datasetId, startTableName, endTableName, limit] =
    queryKey;

  return executeClientQuery({
    projectId,
    datasetId,

    startTableName,
    endTableName,

    limit,
  });
}
