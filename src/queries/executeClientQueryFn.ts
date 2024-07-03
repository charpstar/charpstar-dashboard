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
  ];
}) {
  const [_, projectId, datasetId, startTableName, endTableName] = queryKey;

  return executeClientQuery({
    projectId,
    datasetId,

    startTableName,
    endTableName,

    limit: 10,
  });
}
