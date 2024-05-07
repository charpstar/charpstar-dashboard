"use server";

import { BigQuery } from "@google-cloud/bigquery";

export async function getCountByEventName({
  projectId,
  datasetId,
  tableName,

  event_name,
  fromTimestamp,
  toTimestamp,
}: {
  projectId: string;
  datasetId: string;
  tableName: string;

  event_name: string;
  fromTimestamp: number;
  toTimestamp: number;
}): Promise<number> {
  const bigqueryClient = new BigQuery({
    projectId,
  });

  const query = `
    SELECT
      COUNT(*) as count
    FROM
      \`${projectId}.${datasetId}.${tableName}\`
    WHERE
      event_name = "${event_name}"
      AND event_timestamp >= ${fromTimestamp}
      AND event_timestamp <= ${toTimestamp};
  `;

  const options = {
    query: query,
    projectId,
  };

  const [job] = await bigqueryClient.createQueryJob(options);
  const result = await job.getQueryResults();

  const { count } = result[0][0];

  return count;
}
