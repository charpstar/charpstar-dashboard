"use server";

import { BigQuery } from "@google-cloud/bigquery";

export async function getEventsCount({
  projectId,
  datasetId,

  startTableName,
  endTableName,
}: {
  projectId: string;
  datasetId: string;

  startTableName: string;
  endTableName: string;
}): Promise<{
  [eventName: string]: number;
}> {
  const bigqueryClient = new BigQuery({
    projectId,
  });

  const query = `
    SELECT
      event_name,
      COUNT(*) as count
    FROM
      \`${projectId}.${datasetId}.events_*\`
    WHERE
      _TABLE_SUFFIX BETWEEN '${startTableName}' AND '${endTableName}'
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
