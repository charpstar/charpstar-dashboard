-------------------------------------------- Total page views for a specific page.
WITH UserInfo AS (
  SELECT user_pseudo_id,
    COUNTIF(event_name = 'page_view') AS page_view_count,
    COUNTIF(event_name IN ('in_app_purchase', 'purchase')) AS purchase_event_count,
    FROM `fast-lattice-421210.analytics_370057646.events_*`,
    UNNEST(event_params) AS EP
  WHERE _TABLE_SUFFIX BETWEEN '20240501' AND '20240520'
    AND EP.value.string_value = "Trip - Portable Light - Design By Us"
  GROUP BY 1
)
SELECT (purchase_event_count > 0) AS purchaser,
  COUNT(*) AS user_count,
  SUM(page_view_count) AS total_page_views,
  SUM(page_view_count) / COUNT(*) AS avg_page_views,
  FROM UserInfo
GROUP BY 1;
--------------------------------------------
SELECT event_params
FROM `fast-lattice-421210.analytics_370057646.events_*`,
  UNNEST(event_params) AS EP
WHERE _TABLE_SUFFIX BETWEEN '20240501' AND '20240520'
  AND EP.key = "page_location"
  AND EP.value.string_value LIKE "%design-by-us.com/product/trip-portable-light%"
  AND traffic_source.medium IS NOT NULL
  AND event_name = "page_view";
--------------------------------------------
WITH data_prep AS (
  SELECT user_pseudo_id,
    (
      SELECT value.int_value
      FROM unnest(event_params)
      WHERE event_name = 'page_view'
        AND KEY = 'ga_session_id'
    ) AS session_id,
    (
      SELECT value.string_value
      FROM unnest(event_params)
      WHERE event_name = 'page_view'
        AND KEY = 'page_title'
    ) AS page_title,
    FROM `fast-lattice-421210.analytics_370057646.events_*`
  WHERE event_name = 'page_view'
    AND _TABLE_SUFFIX BETWEEN '20240501' AND '20240520'
)
SELECT page_title,
  COUNT(*) AS total_pageviews,
  COUNT(DISTINCT concat(user_pseudo_id, session_id)) AS unique_pageviews
FROM data_prep
WHERE page_title LIKE '%Trip - Portable Light - Design By Us%'
GROUP BY 1
ORDER BY 3 DESC;
--------------------------------------------
WITH data_prep AS (
  SELECT user_pseudo_id,
    (
      SELECT value.string_value
      FROM unnest(event_params)
      WHERE KEY = 'page_title'
    ) AS page_title,
    FROM `fast-lattice-421210.analytics_370057646.events_*`
)
SELECT page_title,
  COUNT(*) AS total_pageviews
FROM data_prep
WHERE page_title LIKE '%Trip - Portable Light - Design By Us%'
GROUP BY 1;
--------------------------------------------
WITH data_prep AS (
  SELECT user_pseudo_id,
    (
      SELECT value.int_value
      FROM UNNEST(event_params)
      WHERE event_name = 'page_view'
        AND KEY = 'ga_session_id'
    ) AS session_id,
    (
      SELECT value.string_value
      FROM UNNEST(event_params)
      WHERE event_name = 'page_view'
        AND KEY = 'page_title'
    ) AS page_title,
    (
      SELECT value.string_value
      FROM UNNEST(event_params)
      WHERE event_name = 'page_view'
        AND KEY = 'page_location'
    ) AS page_location
  FROM `fast-lattice-421210.analytics_370057646.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20240501' AND '20240520'
    AND event_name = 'page_view'
)
SELECT page_title,
  COUNT(*) AS total_pageviews,
  COUNT(DISTINCT CONCAT(user_pseudo_id, session_id)) AS unique_pageviews
FROM data_prep
WHERE page_title LIKE '%Trip - Portable Light - Design By Us%'
GROUP BY 1;
--------------------------------------------
SELECT landing_page,
  SUM(screen_page_views) AS screen_page_views,
  COUNT(DISTINCT session_id) AS sessions,
  SUM(CAST(engaged_sessions AS INT)) AS engaged_sessions,
  COUNT(DISTINCT user_pseudo_id) AS total_users,
  1 - SAFE_DIVIDE(
    SUM(CAST(engaged_sessions AS INT)),
    COUNT(DISTINCT session_id)
  ) AS bounce_rate,
  SAFE_DIVIDE(
    SUM(engagement_time_seconds),
    COUNT(DISTINCT user_pseudo_id)
  ) AS average_engagement_time_per_user
FROM (
    SELECT MAX(
        (
          SELECT value.string_value
          FROM UNNEST (event_params)
          WHERE event_name = 'session_start'
            AND KEY = 'page_location'
        )
      ) AS landing_page,
      COUNT(
        CASE
          WHEN event_name = 'page_view' THEN 1
        END
      ) AS screen_page_views,
      CONCAT(
        user_pseudo_id,
        (
          SELECT value.int_value
          FROM UNNEST (event_params)
          WHERE KEY = 'ga_session_id'
        )
      ) AS session_id,
      MAX(
        (
          SELECT value.string_value
          FROM UNNEST (event_params)
          WHERE KEY = 'session_engaged'
        )
      ) AS engaged_sessions,
      user_pseudo_id,
      SAFE_DIVIDE(
        SUM(
          (
            SELECT value.int_value
            FROM UNNEST (event_params)
            WHERE KEY = 'engagement_time_msec'
          )
        ),
        1000
      ) AS engagement_time_seconds
    FROM `add_yor_dataset_name_here_202310*`
    WHERE event_date BETWEEN '20231001' AND '20231031'
    GROUP BY session_id,
      user_pseudo_id
  )
GROUP BY landing_page
ORDER BY screen_page_views DESC;
--------------------------------------------
WITH ClickEvents AS (
  SELECT user_id,
    event_date AS click_date
  FROM `fast-lattice-421210.analytics_370057646.events_*`
  WHERE event_name IN (
      'charpstAR_AR_Button_Click',
      'charpstAR_3D_Button_Click'
    )
),
PurchaseEvents AS (
  SELECT user_id,
    event_date AS purchase_date
  FROM `fast-lattice-421210.analytics_370057646.events_*`
  WHERE event_name IN ('in_app_purchase', 'purchase')
)
SELECT COUNT(DISTINCT c.user_id) AS user_count
FROM ClickEvents c
  JOIN PurchaseEvents p ON c.user_id = p.user_id
WHERE p.purchase_date BETWEEN c.click_date - INTERVAL '7 days'
  AND c.click_date + INTERVAL '7 days';