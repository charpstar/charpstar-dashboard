import { executeClientQuery } from "@/utils/BigQuery/CVR";

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
