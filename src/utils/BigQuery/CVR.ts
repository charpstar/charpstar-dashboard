import { getBigQueryClient } from "./client";
import { getEventsBetween } from "./utils";
import { queries } from "./clientQueries";
import type { BigQueryResponse, QueryConfig } from "./types";

export async function executeClientQuery({
  projectId,
  datasetId,
  startTableName,
  endTableName,
}: QueryConfig): Promise<BigQueryResponse[]> {
  const bigqueryClient = getBigQueryClient({ projectId });
  const query = queries[datasetId as keyof typeof queries](
    getEventsBetween({ startTableName, endTableName })
  );

  if (!query) throw new Error(`Query not found for datasetId: ${datasetId}`);

  const options = {
    query: query,
    projectId,
  };

  const [job] = await bigqueryClient.createQueryJob(options);
  const [response] = await job.getQueryResults();

  return response as BigQueryResponse[];
}

// Re-export types
export type { BigQueryResponse, ProductMetrics, QueryConfig } from "./types";