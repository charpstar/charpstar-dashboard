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
  WITH
  total_views AS (
    SELECT
      COUNT(DISTINCT user_pseudo_id) AS total_views
    FROM
      \`${projectId}.${datasetId}.events_*\`,
      UNNEST(event_params) AS ep
    WHERE
      event_name = 'page_view'
      AND ep.key = 'page_title'
      AND _TABLE_SUFFIX BETWEEN '${startTableName}' AND '${endTableName}'
  ),
  total_purchases AS (
    SELECT
      COUNT(DISTINCT (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id')) AS total_purchases
    FROM
      \`${projectId}.${datasetId}.events_*\`
    WHERE
      event_name = 'purchase'
      AND _TABLE_SUFFIX BETWEEN '${startTableName}' AND '${endTableName}'
  ),
  ar_clicks AS (
    SELECT
      user_pseudo_id,
      event_timestamp
    FROM
      \`${projectId}.${datasetId}.events_*\`
    WHERE
      event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
      AND _TABLE_SUFFIX BETWEEN '${startTableName}' AND '${endTableName}'
  ),
  purchases AS (
    SELECT
      user_pseudo_id,
      event_timestamp,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id') AS transaction_id
    FROM
      \`${projectId}.${datasetId}.events_*\`
    WHERE
      event_name = 'purchase'
      AND _TABLE_SUFFIX BETWEEN '${startTableName}' AND '${endTableName}'
  ),
  total_views_with_ar AS (
    SELECT
      COUNT(DISTINCT ar.user_pseudo_id) AS total_views_with_ar
    FROM
      ar_clicks AS ar
  ),
  total_purchases_with_ar AS (
    SELECT
      COUNT(DISTINCT p.transaction_id) AS total_purchases_with_ar
    FROM
      ar_clicks AS ar
      JOIN purchases AS p
      ON ar.user_pseudo_id = p.user_pseudo_id
      AND p.event_timestamp > ar.event_timestamp
  ),
  conversion_rates AS (
    SELECT
      ROUND(SAFE_DIVIDE(tp.total_purchases, tv.total_views) * 100, 2) AS overall_avg_conversion_rate,
      ROUND(SAFE_DIVIDE(tp_ar.total_purchases_with_ar, tv_ar.total_views_with_ar) * 100, 2) AS overall_avg_conversion_rate_with_ar
    FROM
      total_views AS tv,
      total_purchases AS tp,
      total_views_with_ar AS tv_ar,
      total_purchases_with_ar AS tp_ar
  ),
  event_counts AS (
    SELECT
      'charpstAR_Load' AS event_name,
      COUNT(*) AS total_events
    FROM
      \`${projectId}.${datasetId}.events_*\`
    WHERE
      event_name = 'charpstAR_Load'
      AND _TABLE_SUFFIX BETWEEN '${startTableName}' AND '${endTableName}'
    UNION ALL
    SELECT
      'charpstAR_AR_Button_Click' AS event_name,
      COUNT(*) AS total_events
    FROM
      \`${projectId}.${datasetId}.events_*\`
    WHERE
      event_name = 'charpstAR_AR_Button_Click'
      AND _TABLE_SUFFIX BETWEEN '${startTableName}' AND '${endTableName}'
    UNION ALL
    SELECT
      'charpstAR_3D_Button_Click' AS event_name,
      COUNT(*) AS total_events
    FROM
      \`${projectId}.${datasetId}.events_*\`
    WHERE
      event_name = 'charpstAR_3D_Button_Click'
      AND _TABLE_SUFFIX BETWEEN '${startTableName}' AND '${endTableName}'
  ),
  ar_percentage AS (
    SELECT
      ROUND(
        SAFE_DIVIDE(
          (SELECT SUM(total_events) FROM event_counts WHERE event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')),
          (SELECT total_events FROM event_counts WHERE event_name = 'charpstAR_Load')
        ) * 100,
        2
      ) AS percentage_ar_users
  )
  
  SELECT
    'overall_conv_rate' AS event_name,
    overall_avg_conversion_rate AS value
  FROM
    conversion_rates
  
  UNION ALL
  
  SELECT
    'overall_conv_rate_CharpstAR' AS event_name,
    overall_avg_conversion_rate_with_ar AS value
  FROM
    conversion_rates
  
  UNION ALL
  
  SELECT
    event_name AS event_name,
    total_events AS value
  FROM
    event_counts
  
  UNION ALL
  
  SELECT
    'percentage_charpstAR' AS event_name,
    percentage_ar_users AS value
  FROM
    ar_percentage;
  `;
  

  const options = {
    query: query,
    projectId,
  };

  const [job] = await bigqueryClient.createQueryJob(options);
  const response = await job.getQueryResults();

  // Output the response in the console
  console.log("Query Results:", response);

  const result = response[0] as unknown as {
    event_name: string;
    count: number;
  }[];

  return Object.fromEntries(
    result.map(({ event_name, count }) => [event_name, count]),
  );
}