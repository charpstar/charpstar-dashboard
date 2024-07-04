"use server";

import { getBigQueryClient } from "./client";
import dotenv from "dotenv";



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
  const bigqueryClient  = getBigQueryClient({ projectId });
  if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
  }

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
  ),
  avg_engagement_time AS (
    SELECT
      AVG((SELECT value.int_value 
           FROM UNNEST(event_params) ep 
           WHERE ep.key = 'engagement_time_msec') / 1000.0) AS avg_session_duration_seconds
    FROM
    \`${projectId}.${datasetId}.events_*\`
    WHERE
      event_name IN ('page_view', 'user_engagement')
      AND _TABLE_SUFFIX BETWEEN '${startTableName}' AND '${endTableName}'
  ),
 ar_events AS (
  SELECT
    user_pseudo_id,
    event_timestamp,
  FROM
  \`${projectId}.${datasetId}.events_*\`
  WHERE
    event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
    AND _TABLE_SUFFIX BETWEEN '${startTableName}' AND '${endTableName}'
),
next_events AS (
  SELECT
    ar.user_pseudo_id,
    ar.event_timestamp AS ar_event_timestamp,
    MIN(e.event_timestamp) / 1000 AS next_event_timestamp,
  FROM
    ar_events AS ar
  JOIN
  \`${projectId}.${datasetId}.events_*\` AS e
  ON
    ar.user_pseudo_id = e.user_pseudo_id
    AND e.event_timestamp > ar.event_timestamp
  GROUP BY
    ar.user_pseudo_id, ar.event_timestamp
),
ar_durations AS (
  SELECT
    SAFE_DIVIDE(ne.next_event_timestamp - ar.event_timestamp / 1000, 1000) AS interaction_duration_seconds
  FROM
    ar_events AS ar
  LEFT JOIN
    next_events AS ne
  ON
    ar.user_pseudo_id = ne.user_pseudo_id
    AND ar.event_timestamp = ne.ar_event_timestamp
  WHERE
    ne.next_event_timestamp IS NOT NULL
    AND SAFE_DIVIDE(ne.next_event_timestamp - ar.event_timestamp / 1000, 1000) BETWEEN 0 AND 3600
),
avg_ar_duration AS (
  SELECT
    AVG(interaction_duration_seconds) AS avg_ar_session_duration_seconds
  FROM
    ar_durations
),

combined_durations AS (
  SELECT
    (SELECT avg_ar_session_duration_seconds FROM avg_ar_duration) + 
    (SELECT avg_session_duration_seconds FROM avg_engagement_time) AS total_avg_session_duration
)
  
  SELECT
    'overall_conv_rate' AS event_name,
    overall_avg_conversion_rate AS count
  FROM
    conversion_rates
  
  UNION ALL
  
  SELECT
    'overall_conv_rate_CharpstAR' AS event_name,
    overall_avg_conversion_rate_with_ar AS count
  FROM
    conversion_rates
  
  UNION ALL
  
  SELECT
    event_name AS event_name,
    total_events AS count
  FROM
    event_counts
  
  UNION ALL
  
  SELECT
    'percentage_charpstAR' AS event_name,
    percentage_ar_users AS count 
  FROM
    ar_percentage
  
  UNION ALL

  SELECT
  'session_time_charpstAR' AS event_name,
  ROUND(avg_ar_session_duration_seconds, 2) AS count
FROM
  avg_ar_duration

UNION ALL

SELECT
  'session_time_default' AS event_name,
  ROUND(avg_session_duration_seconds, 2) AS count
FROM
  avg_engagement_time

UNION ALL

SELECT
  'combined_session_time' AS event_name,
  ROUND(total_avg_session_duration, 2) AS count
FROM
  combined_durations;


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