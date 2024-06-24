import { BigQuery } from "@google-cloud/bigquery";
import { GlobalRef } from "@/utils/GlobalRef";

export function getBigQueryClient({ projectId }: { projectId: string }) {
  const bigqueryClient = new GlobalRef("bigqueryClient:" + projectId);

  if (!bigqueryClient.value) {
    bigqueryClient.value = new BigQuery({
      projectId,
    });
  }

  return bigqueryClient as {
    value: BigQuery;
  };
}
