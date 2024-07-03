"use server";

import { getBigQueryClient } from "./client";

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
}): Promise<Record<string, number>> {
  const { value: bigqueryClient } = getBigQueryClient({ projectId });

  const query = `
    SELECT
      event_name,
      COUNT(*) as count
    FROM
      \`${projectId}.${datasetId}.events_*\`
    WHERE
      _TABLE_SUFFIX BETWEEN '${startTableName}' AND '${endTableName}'
      AND traffic_source.medium IS NOT NULL
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
