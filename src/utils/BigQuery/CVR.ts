// cvr.ts
import { getBigQueryClient } from "./client";
import { getEventsBetween } from "./utils";
import { queries } from "./clientQueries";
import { executeBigQuery } from "./executeQuery";
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
  
  return executeBigQuery<BigQueryResponse[]>(bigqueryClient, query, projectId);
}