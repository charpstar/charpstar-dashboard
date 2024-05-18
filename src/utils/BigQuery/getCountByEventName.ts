"use server";

import { BigQuery } from "@google-cloud/bigquery";

export async function getEventsCount({
  projectId,
  datasetId,

  fromTimestamp,
  toTimestamp,
}: {
  projectId: string;
  datasetId: string;

  fromTimestamp: number;
  toTimestamp: number;
}): Promise<{
  [eventName: string]: number;
}> {
  const bigqueryClient = new BigQuery({
    projectId,
  });

  // TODO: Optimization can be done by removing wildcard and using the exact tables related to the timestamps.

  const query = `
    SELECT
      event_name,
      COUNT(event_name) as count
    FROM
      \`${projectId}.${datasetId}.events_*\`
    WHERE
      event_timestamp BETWEEN ${fromTimestamp} AND ${toTimestamp}
    GROUP BY 1;
  `;

  const options = {
    query: query,
    projectId,
  };

  const [job] = await bigqueryClient.createQueryJob(options);
  const response = await job.getQueryResults();

  const result = response[0] as unknown as {
    event_name: string;
    count: number;
  }[];

  return Object.fromEntries(
    result.map(({ event_name, count }) => [event_name, count]),
  );
}
