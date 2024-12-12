export type TDatasets = keyof typeof queries;

export const queries = {
  analytics_311675532: (eventsBetween : string) => `
  WITH
  all_products AS (
    SELECT DISTINCT
      CASE
        WHEN TRIM(i.item_name) = 'Modern sort spot  til loftudtag/lampeudtag' THEN CONCAT('Modern sort spot til loftudtag/lampeudtag', ' - ', i.item_category)
        ELSE TRIM(CONCAT(i.item_name, ' - ', i.item_category))
      END AS product_name
    FROM
      \`fast-lattice-421210.analytics_311675532.events_*\`, UNNEST(items) AS i
  ),
  click_events AS (
    SELECT DISTINCT
      user_pseudo_id,
      event_name,
      event_timestamp AS click_timestamp,
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id
    FROM
      \`fast-lattice-421210.analytics_311675532.events_*\`
    WHERE
      event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click') AND ${eventsBetween}
  ),
  click_events_with_products AS (
    SELECT DISTINCT
      event_timestamp AS click_timestamp,
      user_pseudo_id,
      event_name,
      REGEXP_REPLACE((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title'), r' - Dyberg Larsen$', '') AS page_title_product_name
    FROM
      \`fast-lattice-421210.analytics_311675532.events_*\`
    WHERE
      event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click') AND ${eventsBetween}
  ),
  ar_clicks AS (
    SELECT
      TRIM(page_title_product_name) AS page_title_product_name,
      COUNT(DISTINCT click_timestamp) AS AR_Button_Clicks
    FROM
      click_events_with_products
    WHERE
      event_name = 'charpstAR_AR_Button_Click'
    GROUP BY TRIM(page_title_product_name)
  ),
  _3d_clicks AS (
    SELECT
      TRIM(page_title_product_name) AS page_title_product_name,
      COUNT(DISTINCT click_timestamp) AS _3D_Button_Clicks
    FROM
      click_events_with_products
    WHERE
      event_name = 'charpstAR_3D_Button_Click'
    GROUP BY TRIM(page_title_product_name)
  ),
  purchases AS (
    SELECT DISTINCT
      user_pseudo_id,
      event_timestamp,
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id') AS transaction_id,
      (SELECT TRIM(CONCAT(i.item_name, ' - ', i.item_category)) FROM UNNEST(items) AS i LIMIT 1) AS product_name
    FROM
      \`fast-lattice-421210.analytics_311675532.events_*\`
    WHERE event_name = 'purchase' AND ${eventsBetween}
  ),
  tran_ids_required AS (
    SELECT DISTINCT
      p.transaction_id
    FROM
      click_events AS c
    INNER JOIN
      purchases AS p
      ON c.ga_session_id = p.ga_session_id
      AND c.user_pseudo_id = p.user_pseudo_id
      AND p.event_timestamp > c.click_timestamp
  ),
  products_purchased_cte AS (
    SELECT DISTINCT
      CASE
        WHEN TRIM(i.item_name) = 'Modern sort spot  til loftudtag/lampeudtag' THEN CONCAT('Modern sort spot til loftudtag/lampeudtag', ' - ', i.item_category)
        ELSE TRIM(CONCAT(i.item_name, ' - ', i.item_category))
      END AS product_name,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id') AS transaction_id
    FROM
      \`fast-lattice-421210.analytics_311675532.events_*\`, UNNEST(items) AS i
    WHERE
      event_name = 'purchase' AND ${eventsBetween}
  ),
  products_purchased_after_click_events AS (
    SELECT
      product_name,
      COUNT(DISTINCT transaction_id) AS purchases_with_service
    FROM
      products_purchased_cte
    WHERE
      transaction_id IN (SELECT DISTINCT transaction_id FROM tran_ids_required)
    GROUP BY
      product_name
  ),
  total_views AS (
    SELECT
      CASE
        WHEN TRIM(i.item_name) = 'Modern sort spot  til loftudtag/lampeudtag' THEN CONCAT('Modern sort spot til loftudtag/lampeudtag', ' - ', i.item_category)
        ELSE TRIM(CONCAT(i.item_name, ' - ', i.item_category))
      END AS product_name,
      COUNT(DISTINCT CONCAT(param.value.int_value, user_pseudo_id)) AS total_views
    FROM
      \`fast-lattice-421210.analytics_311675532.events_*\`,
      UNNEST(event_params) AS param,
      UNNEST(items) AS i
    WHERE
      param.key = "ga_session_id"
    GROUP BY
      product_name
  ),
  total_purchases AS (
    SELECT
      CASE
        WHEN TRIM(i.item_name) = 'Modern sort spot  til loftudtag/lampeudtag' THEN CONCAT('Modern sort spot til loftudtag/lampeudtag', ' - ', i.item_category)
        ELSE TRIM(CONCAT(i.item_name, ' - ', i.item_category))
      END AS product_name,
      COUNT(DISTINCT (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id')) AS total_purchases
    FROM
      \`fast-lattice-421210.analytics_311675532.events_*\`, UNNEST(items) AS i
    WHERE event_name = 'purchase' AND ${eventsBetween}
    GROUP BY
      product_name
  ),
  default_conversion_rate AS (
    SELECT
      v.product_name,
      v.total_views,
      p.total_purchases,
      ROUND(SAFE_DIVIDE(p.total_purchases, v.total_views) * 100, 2) AS default_conv_rate
    FROM total_views AS v
    JOIN total_purchases AS p
      ON LOWER(v.product_name) = LOWER(p.product_name)
  ),
  avg_session_duration AS (
    SELECT
      TRIM(REGEXP_REPLACE((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title'), r' - Dyberg Larsen$', '')) AS product_name,
      AVG((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engagement_time_msec')) / 1000 AS avg_session_duration_seconds,
      COUNT(1) AS count_engagement_time
    FROM
      \`fast-lattice-421210.analytics_311675532.events_*\`
    WHERE event_name IN ('page_view', 'scroll', 'user_engagement') AND ${eventsBetween}
    GROUP BY product_name
  ),
  ar_events AS (
    SELECT
      user_pseudo_id,
      event_timestamp,
      TRIM(REGEXP_REPLACE((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title'), r' - Dyberg Larsen$', '')) AS page_title_product_name
    FROM
      \`fast-lattice-421210.analytics_311675532.events_*\`
    WHERE event_name = 'charpstAR_AR_Button_Click' AND ${eventsBetween}
  ),
  next_events AS (
    SELECT
      ar.user_pseudo_id,
      ar.event_timestamp AS ar_event_timestamp,
      ar.page_title_product_name,
      MIN(e.event_timestamp) / 1000 AS next_event_timestamp
    FROM
      ar_events AS ar
    JOIN
      \`fast-lattice-421210.analytics_311675532.events_*\` AS e
    ON
      ar.user_pseudo_id = e.user_pseudo_id
      AND e.event_timestamp > ar.event_timestamp
    GROUP BY
      ar.user_pseudo_id,
      ar.event_timestamp,
      ar.page_title_product_name
  ),
  ar_durations AS (
    SELECT
      ar.page_title_product_name AS product_name,
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
      product_name,
      AVG(interaction_duration_seconds) AS avg_ar_duration
    FROM
      ar_durations
    GROUP BY
      product_name
  ),
  _3d_events AS (
    SELECT
      user_pseudo_id,
      event_timestamp,
      TRIM(REGEXP_REPLACE((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title'), r' - Dyberg Larsen$', '')) AS page_title_product_name
    FROM
      \`fast-lattice-421210.analytics_311675532.events_*\`
    WHERE
      event_name = 'charpstAR_3D_Button_Click' AND ${eventsBetween}
  ),
  next_3d_events AS (
    SELECT
      ar.user_pseudo_id,
      ar.event_timestamp AS ar_event_timestamp,
      ar.page_title_product_name,
      MIN(e.event_timestamp) / 1000 AS next_event_timestamp
    FROM
      _3d_events AS ar
    JOIN
      \`fast-lattice-421210.analytics_311675532.events_*\` AS e
    ON
      ar.user_pseudo_id = e.user_pseudo_id
      AND e.event_timestamp > ar.event_timestamp
    GROUP BY
      ar.user_pseudo_id,
      ar.event_timestamp,
      ar.page_title_product_name
  ),
  _3d_durations AS (
    SELECT
      ar.page_title_product_name AS product_name,
      SAFE_DIVIDE(ne.next_event_timestamp - ar.event_timestamp / 1000, 1000) AS interaction_duration_seconds
    FROM
      _3d_events AS ar
    LEFT JOIN
      next_3d_events AS ne
    ON
      ar.user_pseudo_id = ne.user_pseudo_id
      AND ar.event_timestamp = ne.ar_event_timestamp
    WHERE
      ne.next_event_timestamp IS NOT NULL
      AND SAFE_DIVIDE(ne.next_event_timestamp - ar.event_timestamp / 1000, 1000) BETWEEN 0 AND 3600
  ),
  avg_3d_duration AS (
    SELECT
      product_name,
      AVG(interaction_duration_seconds) AS avg_3d_duration
    FROM
      _3d_durations
    GROUP BY
      product_name
  ),
  final AS (
    SELECT
      a.product_name,
      COALESCE(c._3D_Button_Clicks, 0) AS _3D_Button_Clicks,
      COALESCE(b.AR_Button_Clicks, 0) AS AR_Button_Clicks,
      COALESCE(d.purchases_with_service, 0) AS purchases_with_service,
      COALESCE(tp.total_purchases, 0) AS total_purchases,
      COALESCE(c._3D_Button_Clicks, 0) + COALESCE(b.AR_Button_Clicks, 0) AS total_button_clicks,
      ROUND(SAFE_DIVIDE(COALESCE(d.purchases_with_service, 0), COALESCE(c._3D_Button_Clicks, 0) + COALESCE(b.AR_Button_Clicks, 0)) * 100, 2) AS product_conv_rate,
      COALESCE(v.total_views, 0) AS total_views,
      COALESCE(dc.default_conv_rate, 0) AS default_conv_rate,
      ROUND(COALESCE(ad.avg_session_duration_seconds, 0), 2) AS avg_session_duration_seconds,
      ROUND(COALESCE(ar.avg_ar_duration, 0), 2) AS avg_ar_duration,
      ROUND(COALESCE(td.avg_3d_duration, 0), 2) AS avg_3d_duration,
      ROUND(COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(ar.avg_ar_duration, 0), 2) AS avg_ar_session_duration,
      ROUND(COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(td.avg_3d_duration, 0), 2) AS avg_3d_session_duration,
      ROUND((COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(ar.avg_ar_duration, 0) + COALESCE(td.avg_3d_duration, 0)) / 2, 2) AS avg_combined_session_duration
    FROM
      all_products AS a
    LEFT JOIN
      ar_clicks AS b
      ON LOWER(a.product_name) = LOWER(b.page_title_product_name)
    LEFT JOIN
      _3d_clicks AS c
      ON LOWER(a.product_name) = LOWER(c.page_title_product_name)
    LEFT JOIN
      products_purchased_after_click_events AS d
      ON LOWER(a.product_name) = LOWER(d.product_name)
    LEFT JOIN
      total_views AS v
      ON LOWER(a.product_name) = LOWER(v.product_name)
    LEFT JOIN
      total_purchases AS tp
      ON LOWER(a.product_name) = LOWER(tp.product_name)
    LEFT JOIN
      default_conversion_rate AS dc
      ON LOWER(a.product_name) = LOWER(dc.product_name)
    LEFT JOIN
      avg_session_duration AS ad
      ON LOWER(a.product_name) = LOWER(ad.product_name)
    LEFT JOIN
      avg_ar_duration AS ar
      ON LOWER(a.product_name) = LOWER(ar.product_name)
    LEFT JOIN
      avg_3d_duration AS td
      ON LOWER(a.product_name) = LOWER(td.product_name)
    WHERE
      COALESCE(c._3D_Button_Clicks, 0) + COALESCE(b.AR_Button_Clicks, 0) > 0
    ORDER BY
      d.purchases_with_service DESC
  )
SELECT
  *
FROM
  final
WHERE
  total_button_clicks > 0 OR purchases_with_service > 0
ORDER BY
  purchases_with_service DESC;
  `,
  

  analytics_351120479: (eventsBetween: string) => `WITH
  all_products AS (
    SELECT DISTINCT TRIM(i.item_name) AS product_name
    FROM \`fast-lattice-421210.analytics_351120479.events_*\`, UNNEST(items) AS i
    WHERE ${eventsBetween}
 ),
  click_events AS (
    SELECT DISTINCT
      user_pseudo_id,
      event_name,
      event_timestamp AS click_timestamp,
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id
    FROM \`fast-lattice-421210.analytics_351120479.events_*\`
    WHERE event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click') AND ${eventsBetween}
  ),
  click_events_with_products AS (
    SELECT DISTINCT
      event_timestamp AS click_timestamp,
      user_pseudo_id,
      event_name,
      REGEXP_REPLACE(
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title'),
        r' (?:- Handla hos|- Shop at).*$',
        ''
      ) AS page_title_product_name
    FROM \`fast-lattice-421210.analytics_351120479.events_*\`
    WHERE event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click') AND ${eventsBetween}
  ),
  ar_clicks AS (
    SELECT
      TRIM(page_title_product_name) AS page_title_product_name,
      COUNT(DISTINCT click_timestamp) AS AR_Button_Clicks
    FROM click_events_with_products
    WHERE event_name = 'charpstAR_AR_Button_Click'
    GROUP BY TRIM(page_title_product_name)
  ),
  _3d_clicks AS (
    SELECT
      TRIM(page_title_product_name) AS page_title_product_name,
      COUNT(DISTINCT click_timestamp) AS _3D_Button_Clicks
    FROM click_events_with_products
    WHERE event_name = 'charpstAR_3D_Button_Click'
    GROUP BY TRIM(page_title_product_name)
  ),

  purchases AS (
    SELECT DISTINCT
      user_pseudo_id,
      event_timestamp,
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id') AS transaction_id,
      (SELECT TRIM(i.item_name) FROM UNNEST(items) AS i LIMIT 1) AS product_name
      FROM \`fast-lattice-421210.analytics_351120479.events_*\`
      WHERE event_name = 'purchase' AND ${eventsBetween}
  ),

  tran_ids_required AS (
    SELECT DISTINCT p.transaction_id
    FROM click_events AS c
    INNER JOIN purchases AS p
      ON c.ga_session_id = p.ga_session_id
      AND c.user_pseudo_id = p.user_pseudo_id
      AND p.event_timestamp > c.click_timestamp
  ),
  purchases_with_ar AS (
    SELECT
      p.user_pseudo_id,
      p.transaction_id,
      p.product_name,
      IF(
        EXISTS (
          SELECT 1
          FROM click_events_with_products AS c
          WHERE c.user_pseudo_id = p.user_pseudo_id
          AND c.click_timestamp < p.event_timestamp
        ),
        'yes',
        'no'
      ) AS purchased_after_ar
    FROM
      purchases AS p
  ),
  products_purchased_after_click_events AS (
    SELECT
      product_name,
      COUNT(DISTINCT transaction_id) AS purchases_with_service
    FROM
      purchases_with_ar
    WHERE
      purchased_after_ar = 'yes'
    GROUP BY
      product_name
  ),
  total_views AS (
    SELECT
      TRIM(REGEXP_REPLACE(
        value.string_value,
        r' (?:- Handla hos|- Shop at).*$',
        ''
      )) AS product_name,
      COUNT(DISTINCT user_pseudo_id) AS total_views
      FROM \`fast-lattice-421210.analytics_351120479.events_*\`,
    UNNEST(event_params) AS ep
    WHERE event_name = 'page_view'
    AND ep.key = 'page_title'
    AND ${eventsBetween}
    GROUP BY TRIM(REGEXP_REPLACE(
      value.string_value,
      r' (?:- Handla hos|- Shop at).*$',
      ''
    ))
  ),
  total_purchases AS (
    SELECT
      TRIM(i.item_name) AS product_name,
      COUNT(DISTINCT (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id')) AS total_purchases
      FROM \`fast-lattice-421210.analytics_351120479.events_*\`, UNNEST(items) AS i
    WHERE event_name = 'purchase' AND ${eventsBetween}
    GROUP BY TRIM(i.item_name)
  ),
  default_conversion_rate AS (
    SELECT
      v.product_name,
      v.total_views,
      p.total_purchases,
      ROUND(SAFE_DIVIDE(p.total_purchases, v.total_views) * 100, 2) AS default_conv_rate
    FROM total_views AS v
    JOIN total_purchases AS p
      ON LOWER(v.product_name) = LOWER(p.product_name)
  ),
  avg_session_duration AS (
    SELECT
      TRIM(REGEXP_REPLACE(
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title'),
        r' (?:- Handla hos|- Shop at).*$',
        ''
      )) AS product_name,
      AVG((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engagement_time_msec')) / 1000 AS avg_session_duration_seconds,
      COUNT(1) AS count_engagement_time
      FROM \`fast-lattice-421210.analytics_351120479.events_*\`
    WHERE event_name IN ('page_view', 'scroll', 'user_engagement')
    GROUP BY product_name
  ),
  ar_events AS (
    SELECT
      user_pseudo_id,
      event_timestamp,
      REGEXP_REPLACE(
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title'),
        r' (?:- Handla hos|- Shop at).*$',
        ''
      ) AS page_title_product_name
      FROM \`fast-lattice-421210.analytics_351120479.events_*\`
    WHERE
      event_name = 'charpstAR_AR_Button_Click'
  ),
  next_events AS (
    SELECT
      ar.user_pseudo_id,
      ar.event_timestamp AS ar_event_timestamp,
      ar.page_title_product_name,
      MIN(e.event_timestamp) / 1000 AS next_event_timestamp
    FROM
      ar_events AS ar
    JOIN
      \`fast-lattice-421210.analytics_351120479.events_*\` AS e
    ON
      ar.user_pseudo_id = e.user_pseudo_id
      AND e.event_timestamp > ar.event_timestamp
    GROUP BY
      ar.user_pseudo_id,
      ar.event_timestamp,
      ar.page_title_product_name
  ),
  ar_durations AS (
    SELECT
      ar.page_title_product_name AS product_name,
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
      product_name,
      AVG(interaction_duration_seconds) AS avg_ar_duration
    FROM
      ar_durations
    GROUP BY
      product_name
  ),
  _3d_events AS (
    SELECT
      user_pseudo_id,
      event_timestamp,
      REGEXP_REPLACE(
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title'),
        r' (?:- Handla hos|- Shop at).*$',
        ''
      ) AS page_title_product_name
    FROM
      \`fast-lattice-421210.analytics_351120479.events_*\`
    WHERE
      event_name = 'charpstAR_3D_Button_Click'
  ),
  next_3d_events AS (
    SELECT
      ar.user_pseudo_id,
      ar.event_timestamp AS ar_event_timestamp,
      ar.page_title_product_name,
      MIN(e.event_timestamp) / 1000 AS next_event_timestamp
    FROM
      _3d_events AS ar
    JOIN
      \`fast-lattice-421210.analytics_351120479.events_*\` AS e
    ON
      ar.user_pseudo_id = e.user_pseudo_id
         AND e.event_timestamp > ar.event_timestamp
    GROUP BY
      ar.user_pseudo_id,
      ar.event_timestamp,
      ar.page_title_product_name
  ),
  _3d_durations AS (
    SELECT
      ar.page_title_product_name AS product_name,
      SAFE_DIVIDE(ne.next_event_timestamp - ar.event_timestamp / 1000, 1000) AS interaction_duration_seconds
    FROM
      _3d_events AS ar
    LEFT JOIN
      next_3d_events AS ne
    ON
      ar.user_pseudo_id = ne.user_pseudo_id
      AND ar.event_timestamp = ne.ar_event_timestamp
    WHERE
      ne.next_event_timestamp IS NOT NULL
      AND SAFE_DIVIDE(ne.next_event_timestamp - ar.event_timestamp / 1000, 1000) BETWEEN 0 AND 3600
  ),
  avg_3d_duration AS (
    SELECT
      product_name,
      AVG(interaction_duration_seconds) AS avg_3d_duration
    FROM
      _3d_durations
    GROUP BY
      product_name
  ),
  final AS (
    SELECT
      a.product_name,
      COALESCE(c._3D_Button_Clicks, 0) AS _3D_Button_Clicks,
      COALESCE(b.AR_Button_Clicks, 0) AS AR_Button_Clicks,
      COALESCE(d.purchases_with_service, 0) AS purchases_with_service,
      COALESCE(dc.total_purchases, 0) AS total_purchases,
      COALESCE(c._3D_Button_Clicks, 0) + COALESCE(b.AR_Button_Clicks, 0) AS total_button_clicks,
      ROUND(SAFE_DIVIDE(COALESCE(d.purchases_with_service, 0), COALESCE(c._3D_Button_Clicks, 0) + COALESCE(b.AR_Button_Clicks, 0)) * 100, 2) AS product_conv_rate,
      COALESCE(dc.total_views, 0) AS total_views,
      COALESCE(dc.default_conv_rate, 0) AS default_conv_rate,
      ROUND(COALESCE(ad.avg_session_duration_seconds, 0),2) AS avg_session_duration_seconds,
      ROUND(COALESCE(ar.avg_ar_duration, 0),2) AS avg_ar_duration,
      ROUND(COALESCE(td.avg_3d_duration, 0),2) AS avg_3d_duration,
      ROUND(COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(ar.avg_ar_duration, 0),2) AS avg_ar_session_duration,
      ROUND(COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(td.avg_3d_duration, 0),2) AS avg_3d_session_duration,
      ROUND((COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(ar.avg_ar_duration, 0) + COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(td.avg_3d_duration, 0) / 2),2) AS avg_combined_session_duration
    FROM all_products AS a
    LEFT JOIN ar_clicks AS b ON LOWER(a.product_name) = LOWER(b.page_title_product_name)
    LEFT JOIN _3d_clicks AS c ON LOWER(a.product_name) = LOWER(c.page_title_product_name)
    LEFT JOIN products_purchased_after_click_events AS d ON a.product_name = d.product_name
    LEFT JOIN default_conversion_rate AS dc ON LOWER(a.product_name) = LOWER(dc.product_name)
    LEFT JOIN avg_session_duration AS ad ON LOWER(a.product_name) = LOWER(ad.product_name)
    LEFT JOIN avg_ar_duration AS ar ON LOWER(a.product_name) = LOWER(ar.product_name)
    LEFT JOIN avg_3d_duration AS td ON LOWER(a.product_name) = LOWER(td.product_name)
    WHERE COALESCE(c._3D_Button_Clicks, 0) + COALESCE(b.AR_Button_Clicks, 0) > 0
    ORDER BY d.purchases_with_service DESC
  )

SELECT * FROM final
WHERE total_button_clicks > 0 OR purchases_with_service > 0
`,

  analytics_274422295: (eventsBetween: string) => `WITH
  all_products AS (
    SELECT DISTINCT TRIM(i.item_name) AS product_name
    FROM \`fast-lattice-421210.analytics_274422295.events_*\`, UNNEST(items) AS i
    WHERE ${eventsBetween}
  ),
  click_events_with_products AS (
    SELECT DISTINCT
      event_timestamp AS click_timestamp,
      user_pseudo_id,
      event_name,
      SPLIT(REGEXP_REPLACE((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title'), '–', '-'), '-')[SAFE_OFFSET(0)] AS page_title_product_name
    FROM
     \`fast-lattice-421210.analytics_274422295.events_*\`
    WHERE
      event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click') AND ${eventsBetween}
  ),
  ar_clicks AS (
    SELECT
      TRIM(page_title_product_name) AS page_title_product_name,
      COUNT(DISTINCT click_timestamp) AS AR_Button_Clicks
    FROM click_events_with_products
    WHERE event_name = 'charpstAR_AR_Button_Click'
    GROUP BY TRIM(page_title_product_name)
  ),
  _3d_clicks AS (
    SELECT
      TRIM(page_title_product_name) AS page_title_product_name,
      COUNT(DISTINCT click_timestamp) AS _3D_Button_Clicks
    FROM click_events_with_products
    WHERE event_name = 'charpstAR_3D_Button_Click'
    GROUP BY TRIM(page_title_product_name)
  ),
  purchases AS (
    SELECT DISTINCT
      user_pseudo_id,
      event_timestamp,
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id') AS transaction_id,
      (SELECT TRIM(i.item_name) FROM UNNEST(items) AS i LIMIT 1) AS product_name
    FROM \`fast-lattice-421210.analytics_274422295.events_*\`
    WHERE event_name = 'purchase' AND ${eventsBetween}
  ),
  purchases_with_ar AS (
    SELECT
      p.user_pseudo_id,
      p.transaction_id,
      p.product_name,
      IF(
        EXISTS (
          SELECT 1
          FROM click_events_with_products AS c
          WHERE c.user_pseudo_id = p.user_pseudo_id
          AND c.click_timestamp < p.event_timestamp
        ),
        'yes',
        'no'
      ) AS purchased_after_ar
    FROM
      purchases AS p
  ),
  products_purchased_after_click_events AS (
    SELECT
      product_name,
      COUNT(DISTINCT transaction_id) AS purchases_with_service
    FROM
      purchases_with_ar
    WHERE
      purchased_after_ar = 'yes'
    GROUP BY
      product_name
  ),
   total_views AS (
    SELECT
      items.item_name AS product_name,
      COUNT(DISTINCT CONCAT(param.value.int_value, user_pseudo_id)) AS total_views
    FROM
     \`fast-lattice-421210.analytics_274422295.events_*\`,
      UNNEST(event_params) AS param,
      UNNEST(items) AS items
    WHERE
      param.key = "ga_session_id" AND ${eventsBetween}
    GROUP BY
      items.item_name
  ),
  total_purchases AS (
    SELECT
      TRIM(i.item_name) AS product_name,
      COUNT(DISTINCT (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id')) AS total_purchases
    FROM \`fast-lattice-421210.analytics_274422295.events_*\`, UNNEST(items) AS i
    WHERE event_name = 'purchase' AND ${eventsBetween}
    GROUP BY TRIM(i.item_name)
  ),
  default_conversion_rate AS (
    SELECT
      v.product_name,
      v.total_views,
      p.total_purchases,
      ROUND(SAFE_DIVIDE(p.total_purchases, v.total_views) * 100, 2) AS default_conv_rate
    FROM total_views AS v
    JOIN total_purchases AS p
      ON LOWER(v.product_name) = LOWER(p.product_name)
  ),
  avg_session_duration AS (
    SELECT
      TRIM(SPLIT(REGEXP_REPLACE((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title'), '–', '-'), '-')[SAFE_OFFSET(0)]) AS product_name,
      AVG((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engagement_time_msec')) / 1000 AS avg_session_duration_seconds,
      COUNT(1) AS count_engagement_time
    FROM \`fast-lattice-421210.analytics_274422295.events_*\`
    WHERE event_name IN ('page_view', 'scroll', 'user_engagement')
    GROUP BY product_name
  ),
  ar_events AS (
    SELECT
      user_pseudo_id,
      event_timestamp,
      TRIM(SPLIT(REGEXP_REPLACE((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title'), '–', '-'), '-')[SAFE_OFFSET(0)])  AS page_title_product_name
    FROM
     \`fast-lattice-421210.analytics_274422295.events_*\`
    WHERE
      event_name = 'charpstAR_AR_Button_Click'
  ),
  next_events AS (
    SELECT
      ar.user_pseudo_id,
      ar.event_timestamp AS ar_event_timestamp,
      ar.page_title_product_name,
      MIN(e.event_timestamp) / 1000 AS next_event_timestamp
    FROM
      ar_events AS ar
    JOIN
     \`fast-lattice-421210.analytics_274422295.events_*\` AS e
    ON
      ar.user_pseudo_id = e.user_pseudo_id
      AND e.event_timestamp > ar.event_timestamp
    GROUP BY
      ar.user_pseudo_id,
      ar.event_timestamp,
      ar.page_title_product_name
  ),
  ar_durations AS (
    SELECT
      ar.page_title_product_name AS product_name,
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
      product_name,
      AVG(interaction_duration_seconds) AS avg_ar_duration
    FROM
      ar_durations
    GROUP BY
      product_name
  ),
  _3d_events AS (
    SELECT
      user_pseudo_id,
      event_timestamp,
     TRIM(SPLIT(REGEXP_REPLACE((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title'), '–', '-'), '-')[SAFE_OFFSET(0)]) AS page_title_product_name
    FROM
      \`fast-lattice-421210.analytics_274422295.events_*\`
    WHERE
      event_name = 'charpstAR_3D_Button_Click'
  ),
  next_3d_events AS (
    SELECT
      ar.user_pseudo_id,
      ar.event_timestamp AS ar_event_timestamp,
      ar.page_title_product_name,
      MIN(e.event_timestamp) / 1000 AS next_event_timestamp
    FROM
      _3d_events AS ar
    JOIN
    \`fast-lattice-421210.analytics_274422295.events_*\` AS e
    ON
      ar.user_pseudo_id = e.user_pseudo_id
         AND e.event_timestamp > ar.event_timestamp
    GROUP BY
      ar.user_pseudo_id,
      ar.event_timestamp,
      ar.page_title_product_name
  ),
  _3d_durations AS (
    SELECT
      ar.page_title_product_name AS product_name,
      SAFE_DIVIDE(ne.next_event_timestamp - ar.event_timestamp / 1000, 1000) AS interaction_duration_seconds
    FROM
      _3d_events AS ar
    LEFT JOIN
      next_3d_events AS ne
    ON
      ar.user_pseudo_id = ne.user_pseudo_id
      AND ar.event_timestamp = ne.ar_event_timestamp
    WHERE
      ne.next_event_timestamp IS NOT NULL
      AND SAFE_DIVIDE(ne.next_event_timestamp - ar.event_timestamp / 1000, 1000) BETWEEN 0 AND 3600
  ),
  avg_3d_duration AS (
    SELECT
      product_name,
      AVG(interaction_duration_seconds) AS avg_3d_duration
    FROM
      _3d_durations
    GROUP BY
      product_name
  ),
  final AS (
    SELECT
      a.product_name,
      COALESCE(c._3D_Button_Clicks, 0) AS _3D_Button_Clicks,
      COALESCE(b.AR_Button_Clicks, 0) AS AR_Button_Clicks,
      COALESCE(d.purchases_with_service, 0) AS purchases_with_service,
      COALESCE(dc.total_purchases, 0) AS total_purchases,
      COALESCE(c._3D_Button_Clicks, 0) + COALESCE(b.AR_Button_Clicks, 0) AS   total_button_clicks,
  ROUND(SAFE_DIVIDE(COALESCE(d.purchases_with_service, 0), COALESCE(c._3D_Button_Clicks, 0) + COALESCE(b.AR_Button_Clicks, 0)) * 100, 2) AS product_conv_rate,
  COALESCE(v.total_views, 0) AS total_views,
  COALESCE(dc.default_conv_rate, 0) AS default_conv_rate,
  ROUND(COALESCE(ad.avg_session_duration_seconds, 0),2) AS avg_session_duration_seconds,
  ROUND(COALESCE(ar.avg_ar_duration, 0),2) AS avg_ar_duration,
  ROUND(COALESCE(td.avg_3d_duration, 0),2) AS avg_3d_duration,
  ROUND(COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(ar.avg_ar_duration, 0),2) AS avg_ar_session_duration,
  ROUND(COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(td.avg_3d_duration, 0),2) AS avg_3d_session_duration,
  ROUND((COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(ar.avg_ar_duration, 0) + COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(td.avg_3d_duration, 0) / 2),2) AS avg_combined_session_duration
FROM
  all_products AS a
LEFT JOIN
  ar_clicks AS b
  ON LOWER(a.product_name) = LOWER(b.page_title_product_name)
LEFT JOIN
  _3d_clicks AS c
  ON LOWER(a.product_name) = LOWER(c.page_title_product_name)
LEFT JOIN
  products_purchased_after_click_events AS d
  ON a.product_name = d.product_name
LEFT JOIN
  total_views AS v
  ON LOWER(a.product_name) = LOWER(v.product_name)
LEFT JOIN
  default_conversion_rate AS dc
  ON LOWER(a.product_name) = LOWER(dc.product_name)
LEFT JOIN
  avg_session_duration AS ad
  ON LOWER(a.product_name) = LOWER(ad.product_name)
LEFT JOIN
  avg_ar_duration AS ar
  ON LOWER(a.product_name) = LOWER(ar.product_name)
LEFT JOIN
  avg_3d_duration AS td
  ON LOWER(a.product_name) = LOWER(td.product_name)
WHERE
  COALESCE(c._3D_Button_Clicks, 0) + COALESCE(b.AR_Button_Clicks, 0) > 0
ORDER BY
  d.purchases_with_service DESC
)

SELECT
  *
FROM
  final
WHERE
  total_button_clicks > 0 OR purchases_with_service > 0

`,

  analytics_320210445: (eventsBetween: string) => `
  WITH
    purchases AS (
      SELECT
        TRIM(i.item_name) AS original_product_name,
        REGEXP_REPLACE(
          LOWER(TRIM(SPLIT(REGEXP_REPLACE(i.item_name, r'[/,]', '|'), '|')[SAFE_OFFSET(0)])),
          r'[^a-z0-9\\s]', ''
        ) AS product_name,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id' LIMIT 1) AS transaction_id,
        user_pseudo_id,
        event_timestamp
      FROM
        \`fast-lattice-421210.analytics_320210445.events_*\` AS e,
        UNNEST(e.items) AS i
      WHERE
        e.event_name = 'purchase' AND ${eventsBetween}
    ),

    purchases_agg AS (
      SELECT
        product_name,
        ANY_VALUE(original_product_name) AS original_product_name,
        COUNT(DISTINCT transaction_id) AS total_purchases
      FROM
        purchases
      GROUP BY
        product_name
    ),

    click_events AS (
      SELECT
        event_timestamp AS click_timestamp,
        user_pseudo_id,
        event_name,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title' LIMIT 1) AS original_product_name,
        -- Cleaned and standardized product name
        REGEXP_REPLACE(
          LOWER(TRIM(SPLIT(REGEXP_REPLACE(
            (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title' LIMIT 1),
            r'[/,]', '|'
          ), '|')[SAFE_OFFSET(0)])),
          r'[^a-z0-9\\s]', ''
        ) AS product_name
      FROM
        \`fast-lattice-421210.analytics_320210445.events_*\` AS e
      WHERE
        e.event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click') AND ${eventsBetween}
    ),

    ar_clicks AS (
      SELECT
        product_name,
        ANY_VALUE(original_product_name) AS original_product_name,
        COUNT(DISTINCT click_timestamp) AS AR_Button_Clicks
      FROM
        click_events
      WHERE
        event_name = 'charpstAR_AR_Button_Click'
      GROUP BY
        product_name
    ),

    _3d_clicks AS (
      SELECT
        product_name,
        ANY_VALUE(original_product_name) AS original_product_name,
        COUNT(DISTINCT click_timestamp) AS _3D_Button_Clicks
      FROM
        click_events
      WHERE
        event_name = 'charpstAR_3D_Button_Click'
      GROUP BY
        product_name
    ),

    purchases_with_ar AS (
      SELECT
        p.user_pseudo_id,
        p.transaction_id,
        p.product_name,
        IF(
          EXISTS (
            SELECT 1
            FROM click_events AS c
            WHERE c.user_pseudo_id = p.user_pseudo_id
            AND c.click_timestamp < p.event_timestamp
          ),
          'yes',
          'no'
        ) AS purchased_after_ar
      FROM
        purchases AS p
    ),

    products_purchased_after_click_events AS (
      SELECT
        product_name,
        COUNT(DISTINCT transaction_id) AS purchases_with_service
      FROM
        purchases_with_ar
      WHERE
        purchased_after_ar = 'yes'
      GROUP BY
        product_name
    ),

    total_views AS (
      SELECT
        REGEXP_REPLACE(
          LOWER(TRIM(SPLIT(REGEXP_REPLACE(items.item_name, r'[/,]', '|'), '|')[SAFE_OFFSET(0)])),
          r'[^a-z0-9\\s]', ''
        ) AS product_name,
        ANY_VALUE(TRIM(items.item_name)) AS original_product_name,
        COUNT(DISTINCT CONCAT(param.value.int_value, user_pseudo_id)) AS total_views
      FROM
        \`fast-lattice-421210.analytics_320210445.events_*\` AS e,
        UNNEST(e.event_params) AS param,
        UNNEST(e.items) AS items
      WHERE
        param.key = 'ga_session_id' AND ${eventsBetween}
      GROUP BY
        product_name
    ),

    default_conversion_rate AS (
      SELECT
        v.product_name,
        ANY_VALUE(v.original_product_name) AS original_product_name,
        v.total_views,
        p.total_purchases,
        ROUND(SAFE_DIVIDE(p.total_purchases, v.total_views) * 100, 2) AS default_conv_rate
      FROM
        total_views AS v
      JOIN
        purchases_agg AS p
      ON
        v.product_name = p.product_name
      GROUP BY
        v.product_name, v.total_views, p.total_purchases
    ),

    avg_session_duration AS (
      SELECT
        -- Extract and standardize product name
        REGEXP_REPLACE(
          LOWER(TRIM(SPLIT(REGEXP_REPLACE(
            (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title' LIMIT 1),
            r'[/,]', '|'
          ), '|')[SAFE_OFFSET(0)])),
          r'[^a-z0-9\\s]', ''
        ) AS product_name,
        ANY_VALUE((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title' LIMIT 1)) AS original_product_name,
        AVG((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engagement_time_msec' LIMIT 1)) / 1000 AS avg_session_duration_seconds
      FROM
        \`fast-lattice-421210.analytics_320210445.events_*\` AS e
      WHERE
        e.event_name IN ('page_view', 'scroll', 'user_engagement') AND ${eventsBetween}
      GROUP BY
        product_name
    ),

    avg_ar_duration AS (
      SELECT
        -- Extract and standardize product name
        REGEXP_REPLACE(
          LOWER(TRIM(SPLIT(REGEXP_REPLACE(
            (SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1),
            r'[/,]', '|'
          ), '|')[SAFE_OFFSET(0)])),
          r'[^a-z0-9\\s]', ''
        ) AS product_name,
        ANY_VALUE((SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1)) AS original_product_name,
        AVG((SELECT value.int_value FROM UNNEST(e.event_params) WHERE key = 'engagement_time_msec' LIMIT 1)) / 1000 AS avg_ar_duration
      FROM
        \`fast-lattice-421210.analytics_320210445.events_*\` AS e
      WHERE
        e.event_name = 'charpstAR_AR_Button_Click' AND ${eventsBetween}
      GROUP BY
        product_name
    ),

    avg_3d_duration AS (
      SELECT
        -- Extract and standardize product name
        REGEXP_REPLACE(
          LOWER(TRIM(SPLIT(REGEXP_REPLACE(
            (SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1),
            r'[/,]', '|'
          ), '|')[SAFE_OFFSET(0)])),
          r'[^a-z0-9\\s]', ''
        ) AS product_name,
        ANY_VALUE((SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1)) AS original_product_name,
        AVG((SELECT value.int_value FROM UNNEST(e.event_params) WHERE key = 'engagement_time_msec' LIMIT 1)) / 1000 AS avg_3d_duration
      FROM
        \`fast-lattice-421210.analytics_320210445.events_*\` AS e
      WHERE
        e.event_name = 'charpstAR_3D_Button_Click' AND ${eventsBetween}
      GROUP BY
        product_name
    ),

    product_names AS (
      SELECT
        product_name,
        ANY_VALUE(original_product_name) AS original_product_name
      FROM (
        SELECT product_name, original_product_name FROM purchases_agg
        UNION ALL
        SELECT product_name, original_product_name FROM ar_clicks
        UNION ALL
        SELECT product_name, original_product_name FROM _3d_clicks
        UNION ALL
        SELECT product_name, original_product_name FROM total_views
      )
      GROUP BY
        product_name
    ),

    avg_session_durations AS (
      SELECT
        all_products.product_name,
        pn.original_product_name,
        ROUND(COALESCE(ad.avg_session_duration_seconds, 0), 2) AS avg_session_duration_seconds,
        ROUND(COALESCE(ar.avg_ar_duration, 0), 2) AS avg_ar_duration,
        ROUND(COALESCE(td.avg_3d_duration, 0), 2) AS avg_3d_duration,
        -- Modify avg_ar_session_duration: only add base session duration if avg_ar_duration > 0
        CASE
          WHEN COALESCE(ar.avg_ar_duration, 0) > 0 THEN
            ROUND(COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(ar.avg_ar_duration, 0), 2)
          ELSE
            0
        END AS avg_ar_session_duration,
        -- Modify avg_3d_session_duration: only add base session duration if avg_3d_duration > 0
        CASE
          WHEN COALESCE(td.avg_3d_duration, 0) > 0 THEN
            ROUND(COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(td.avg_3d_duration, 0), 2)
          ELSE
            0
        END AS avg_3d_session_duration
      FROM
        (
          SELECT product_name FROM purchases_agg
          UNION DISTINCT
          SELECT product_name FROM ar_clicks
          UNION DISTINCT
          SELECT product_name FROM _3d_clicks
          UNION DISTINCT
          SELECT product_name FROM total_views
        ) AS all_products
      LEFT JOIN
        product_names AS pn ON all_products.product_name = pn.product_name
      LEFT JOIN
        avg_session_duration AS ad ON all_products.product_name = ad.product_name
      LEFT JOIN
        avg_ar_duration AS ar ON all_products.product_name = ar.product_name
      LEFT JOIN
        avg_3d_duration AS td ON all_products.product_name = td.product_name
    ),

    avg_combined_duration AS (
      SELECT
        product_name,
        CASE
          WHEN COALESCE(avg_ar_duration, 0) > 0 AND COALESCE(avg_3d_duration, 0) > 0 THEN
            ROUND(avg_session_duration_seconds + ((avg_ar_duration + avg_3d_duration) / 2), 2)
          WHEN COALESCE(avg_ar_duration, 0) > 0 THEN
            ROUND(avg_session_duration_seconds + avg_ar_duration, 2)
          WHEN COALESCE(avg_3d_duration, 0) > 0 THEN
            ROUND(avg_session_duration_seconds + avg_3d_duration, 2)
          ELSE
            0
        END AS avg_combined_session_duration
      FROM
        avg_session_durations
    ),

    final AS (
      SELECT
        pn.original_product_name AS product_name,
        COALESCE(c._3D_Button_Clicks, 0) AS _3D_Button_Clicks,
        COALESCE(a.AR_Button_Clicks, 0) AS AR_Button_Clicks,
        COALESCE(d.purchases_with_service, 0) AS purchases_with_service,
        COALESCE(pu.total_purchases, 0) AS total_purchases,
        COALESCE(c._3D_Button_Clicks, 0) + COALESCE(a.AR_Button_Clicks, 0) AS total_button_clicks,
        ROUND(
          SAFE_DIVIDE(
            COALESCE(d.purchases_with_service, 0),
            NULLIF(COALESCE(c._3D_Button_Clicks, 0) + COALESCE(a.AR_Button_Clicks, 0), 0)
          ) * 100,
          2
        ) AS product_conv_rate,
        COALESCE(t.total_views, 0) AS total_views,
        COALESCE(dc.default_conv_rate, 0) AS default_conv_rate,
        sd.avg_session_duration_seconds,
        sd.avg_ar_duration,
        sd.avg_3d_duration,
        sd.avg_ar_session_duration,
        sd.avg_3d_session_duration,
        cd.avg_combined_session_duration
      FROM
        (
          SELECT product_name FROM purchases_agg
          UNION DISTINCT
          SELECT product_name FROM ar_clicks
          UNION DISTINCT
          SELECT product_name FROM _3d_clicks
          UNION DISTINCT
          SELECT product_name FROM total_views
        ) AS all_products
      LEFT JOIN
        product_names AS pn ON all_products.product_name = pn.product_name
      LEFT JOIN
        purchases_agg AS pu ON all_products.product_name = pu.product_name
      LEFT JOIN
        ar_clicks AS a ON all_products.product_name = a.product_name
      LEFT JOIN
        _3d_clicks AS c ON all_products.product_name = c.product_name
      LEFT JOIN
        products_purchased_after_click_events AS d ON all_products.product_name = d.product_name
      LEFT JOIN
        total_views AS t ON all_products.product_name = t.product_name
      LEFT JOIN
        default_conversion_rate AS dc ON all_products.product_name = dc.product_name
      LEFT JOIN
        avg_session_durations AS sd ON all_products.product_name = sd.product_name
      LEFT JOIN
        avg_combined_duration AS cd ON all_products.product_name = cd.product_name
    )

  SELECT
    *
  FROM
    final
  WHERE
    AR_Button_Clicks > 0 OR _3D_Button_Clicks > 0
  `,

 analytics_371791627: (eventsBetween: string) => `
WITH
  -- List all unique products
  all_products AS (
    SELECT DISTINCT 
      TRIM(SPLIT(REGEXP_REPLACE(i.item_name, r'–', '-'), '-')[SAFE_OFFSET(0)]) AS product_name
    FROM \`fast-lattice-421210.analytics_371791627.events_*\`, UNNEST(items) AS i
    WHERE ${eventsBetween}
  ),

  -- Extract click events with associated products
  click_events_with_products AS (
    SELECT DISTINCT
      e.event_timestamp AS click_timestamp,
      e.user_pseudo_id,
      e.event_name,
      TRIM(SPLIT(REGEXP_REPLACE(
        (SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1),
        r'–', '-'), '-')[SAFE_OFFSET(0)]) AS product_name
    FROM
      \`fast-lattice-421210.analytics_371791627.events_*\` AS e
    WHERE
      e.event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click') AND ${eventsBetween}
  ),

  -- Count AR button clicks per product
  ar_clicks AS (
    SELECT
      product_name,
      COUNT(DISTINCT click_timestamp) AS AR_Button_Clicks
    FROM click_events_with_products
    WHERE event_name = 'charpstAR_AR_Button_Click'
    GROUP BY product_name
  ),

  -- Count 3D button clicks per product
  _3d_clicks AS (
    SELECT
      product_name,
      COUNT(DISTINCT click_timestamp) AS _3D_Button_Clicks
    FROM click_events_with_products
    WHERE event_name = 'charpstAR_3D_Button_Click'
    GROUP BY product_name
  ),

  -- Extract purchase events with standardized product names
  purchases AS (
    SELECT DISTINCT
      e.user_pseudo_id,
      e.event_timestamp,
      (SELECT value.int_value FROM UNNEST(e.event_params) WHERE key = 'ga_session_id' LIMIT 1) AS ga_session_id,
      (SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'transaction_id' LIMIT 1) AS transaction_id,
      TRIM(SPLIT(REGEXP_REPLACE(
        (SELECT i.item_name FROM UNNEST(e.items) AS i LIMIT 1),
        r'–', '-'), '-')[SAFE_OFFSET(0)]) AS product_name
    FROM \`fast-lattice-421210.analytics_371791627.events_*\` AS e
    WHERE e.event_name = 'purchase' AND ${eventsBetween}
  ),

  -- Determine if purchase happened after an AR or 3D click on the same product
  purchases_with_ar AS (
    SELECT
      p.user_pseudo_id,
      p.transaction_id,
      p.product_name,
      IF(
        EXISTS (
          SELECT 1
          FROM click_events_with_products AS c
          WHERE c.user_pseudo_id = p.user_pseudo_id
            AND c.click_timestamp < p.event_timestamp
            AND LOWER(c.product_name) = LOWER(p.product_name)
        ),
        'yes',
        'no'
      ) AS purchased_after_ar
    FROM
      purchases AS p
  ),

  -- Count purchases after AR/3D click per product
  products_purchased_after_click_events AS (
    SELECT
      product_name,
      COUNT(DISTINCT transaction_id) AS purchases_with_service
    FROM
      purchases_with_ar
    WHERE
      purchased_after_ar = 'yes'
    GROUP BY
      product_name
  ),

  -- Get total views per product with standardized product names
  total_views AS (
    SELECT
      TRIM(SPLIT(REGEXP_REPLACE(items.item_name, r'–', '-'), '-')[SAFE_OFFSET(0)]) AS product_name,
      COUNT(DISTINCT CONCAT(param.value.int_value, e.user_pseudo_id)) AS total_views
    FROM
      \`fast-lattice-421210.analytics_371791627.events_*\` AS e,
      UNNEST(e.event_params) AS param,
      UNNEST(e.items) AS items
    WHERE
      param.key = 'ga_session_id' AND ${eventsBetween}
    GROUP BY
      product_name
  ),

  -- Count total purchases per product with standardized product names
  total_purchases AS (
    SELECT
      product_name,
      SUM(total_purchases) AS total_purchases
    FROM (
      SELECT
        TRIM(SPLIT(REGEXP_REPLACE(i.item_name, r'–', '-'), '-')[SAFE_OFFSET(0)]) AS product_name,
        COUNT(DISTINCT (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id' LIMIT 1)) AS total_purchases
      FROM \`fast-lattice-421210.analytics_371791627.events_*\`, UNNEST(items) AS i
      WHERE event_name = 'purchase' AND ${eventsBetween}
      GROUP BY product_name
    )
    GROUP BY product_name
  ),

  -- Calculate default conversion rate per product
  default_conversion_rate AS (
    SELECT
      v.product_name,
      v.total_views,
      p.total_purchases,
      COALESCE(ROUND(SAFE_DIVIDE(p.total_purchases, v.total_views) * 100, 2), 0) AS default_conv_rate
    FROM total_views AS v
    JOIN total_purchases AS p
      ON LOWER(v.product_name) = LOWER(p.product_name)
  ),

  -- Calculate average session duration per product
  avg_session_duration AS (
    SELECT
      product_name,
      AVG(COALESCE(avg_session_duration_seconds, 0)) AS avg_session_duration_seconds
    FROM (
      SELECT
        TRIM(SPLIT(REGEXP_REPLACE(
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title' LIMIT 1),
          r'–', '-'), '-')[SAFE_OFFSET(0)]) AS product_name,
        (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engagement_time_msec' LIMIT 1) / 1000 AS avg_session_duration_seconds
      FROM \`fast-lattice-421210.analytics_371791627.events_*\` AS e
      WHERE event_name IN ('page_view', 'scroll', 'user_engagement') AND ${eventsBetween}
    )
    GROUP BY product_name
  ),

  -- Calculate average AR interaction duration per product
  avg_ar_duration AS (
    SELECT
      product_name,
      AVG(COALESCE(avg_ar_duration, 0)) AS avg_ar_duration
    FROM (
      SELECT
        ar.product_name,
        SAFE_DIVIDE(ne.next_event_timestamp - ar.event_timestamp / 1000, 1000) AS avg_ar_duration
      FROM
        (
          SELECT
            e.user_pseudo_id,
            e.event_timestamp,
            TRIM(SPLIT(REGEXP_REPLACE(
              (SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1),
              r'–', '-'), '-')[SAFE_OFFSET(0)]) AS product_name
          FROM \`fast-lattice-421210.analytics_371791627.events_*\` AS e
          WHERE e.event_name = 'charpstAR_AR_Button_Click' AND ${eventsBetween}
        ) AS ar
      LEFT JOIN
        (
          SELECT
            ar.user_pseudo_id,
            ar.event_timestamp AS ar_event_timestamp,
            ar.product_name,
            MIN(e.event_timestamp) / 1000 AS next_event_timestamp
          FROM
            (
              SELECT
                e.user_pseudo_id,
                e.event_timestamp,
                TRIM(SPLIT(REGEXP_REPLACE(
                  (SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1),
                  r'–', '-'), '-')[SAFE_OFFSET(0)]) AS product_name
              FROM \`fast-lattice-421210.analytics_371791627.events_*\` AS e
              WHERE e.event_name = 'charpstAR_AR_Button_Click' AND ${eventsBetween}
            ) AS ar
          JOIN
            \`fast-lattice-421210.analytics_371791627.events_*\` AS e
          ON
            ar.user_pseudo_id = e.user_pseudo_id
            AND e.event_timestamp > ar.event_timestamp AND ${eventsBetween}
          GROUP BY
            ar.user_pseudo_id,
            ar.event_timestamp,
            ar.product_name
        ) AS ne
      ON
        ar.user_pseudo_id = ne.user_pseudo_id
        AND ar.event_timestamp = ne.ar_event_timestamp
      WHERE
        ne.next_event_timestamp IS NOT NULL
        AND SAFE_DIVIDE(ne.next_event_timestamp - ar.event_timestamp / 1000, 1000) BETWEEN 0 AND 3600
    )
    GROUP BY product_name
  ),

  -- Calculate average 3D interaction duration per product
  avg_3d_duration AS (
    SELECT
      product_name,
      AVG(COALESCE(avg_3d_duration, 0)) AS avg_3d_duration
    FROM (
      SELECT
        ar.product_name,
        SAFE_DIVIDE(ne.next_event_timestamp - ar.event_timestamp / 1000, 1000) AS avg_3d_duration
      FROM
        (
          SELECT
            e.user_pseudo_id,
            e.event_timestamp,
            TRIM(SPLIT(REGEXP_REPLACE(
              (SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1),
              r'–', '-'), '-')[SAFE_OFFSET(0)]) AS product_name
          FROM \`fast-lattice-421210.analytics_371791627.events_*\` AS e
          WHERE e.event_name = 'charpstAR_3D_Button_Click' AND ${eventsBetween}
        ) AS ar
      LEFT JOIN
        (
          SELECT
            ar.user_pseudo_id,
            ar.event_timestamp AS ar_event_timestamp,
            ar.product_name,
            MIN(e.event_timestamp) / 1000 AS next_event_timestamp
          FROM
            (
              SELECT
                e.user_pseudo_id,
                e.event_timestamp,
                TRIM(SPLIT(REGEXP_REPLACE(
                  (SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1),
                  r'–', '-'), '-')[SAFE_OFFSET(0)]) AS product_name
              FROM \`fast-lattice-421210.analytics_371791627.events_*\` AS e
              WHERE e.event_name = 'charpstAR_3D_Button_Click' AND ${eventsBetween}
            ) AS ar
          JOIN
            \`fast-lattice-421210.analytics_371791627.events_*\` AS e
          ON
            ar.user_pseudo_id = e.user_pseudo_id
            AND e.event_timestamp > ar.event_timestamp AND ${eventsBetween}
          GROUP BY
            ar.user_pseudo_id,
            ar.event_timestamp,
            ar.product_name
        ) AS ne
      ON
        ar.user_pseudo_id = ne.user_pseudo_id
        AND ar.event_timestamp = ne.ar_event_timestamp
      WHERE
        ne.next_event_timestamp IS NOT NULL
        AND SAFE_DIVIDE(ne.next_event_timestamp - ar.event_timestamp / 1000, 1000) BETWEEN 0 AND 3600
    )
    GROUP BY product_name
  ),

  -- Compile the final results
  final AS (
    SELECT
      a.product_name,
      SUM(COALESCE(c._3D_Button_Clicks, 0)) AS _3D_Button_Clicks,
      SUM(COALESCE(b.AR_Button_Clicks, 0)) AS AR_Button_Clicks,
      SUM(COALESCE(d.purchases_with_service, 0)) AS purchases_with_service,
      SUM(COALESCE(tp.total_purchases, 0)) AS total_purchases,
      SUM(COALESCE(c._3D_Button_Clicks, 0)) + SUM(COALESCE(b.AR_Button_Clicks, 0)) AS total_button_clicks,
      ROUND(
        SAFE_DIVIDE(
          SUM(COALESCE(d.purchases_with_service, 0)),
          NULLIF(SUM(COALESCE(c._3D_Button_Clicks, 0)) + SUM(COALESCE(b.AR_Button_Clicks, 0)), 0)
        ) * 100,
        2
      ) AS product_conv_rate,
      SUM(COALESCE(v.total_views, 0)) AS total_views,
      COALESCE(AVG(dc.default_conv_rate), 0) AS default_conv_rate,
      COALESCE(AVG(ad.avg_session_duration_seconds), 0) AS avg_session_duration_seconds,
      COALESCE(AVG(ar.avg_ar_duration), 0) AS avg_ar_duration,
      COALESCE(AVG(td.avg_3d_duration), 0) AS avg_3d_duration,

      -- Adjusted avg_ar_session_duration calculation
      COALESCE(
        AVG(
          COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(ar.avg_ar_duration, 0)
        ),
        0
      ) AS avg_ar_session_duration,

      -- Adjusted avg_3d_session_duration calculation
      COALESCE(
        AVG(
          COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(td.avg_3d_duration, 0)
        ),
        0
      ) AS avg_3d_session_duration,

      -- Adjusted avg_combined_session_duration calculation
      COALESCE(
        AVG(
          (
            COALESCE(ad.avg_session_duration_seconds, 0) +
            COALESCE(ar.avg_ar_duration, 0) +
            COALESCE(td.avg_3d_duration, 0)
          ) / 2
        ),
        0
      ) AS avg_combined_session_duration
    FROM
      all_products AS a
    LEFT JOIN
      ar_clicks AS b ON LOWER(a.product_name) = LOWER(b.product_name)
    LEFT JOIN
      _3d_clicks AS c ON LOWER(a.product_name) = LOWER(c.product_name)
    LEFT JOIN
      products_purchased_after_click_events AS d ON LOWER(a.product_name) = LOWER(d.product_name)
    LEFT JOIN
      total_purchases AS tp ON LOWER(a.product_name) = LOWER(tp.product_name)
    LEFT JOIN
      total_views AS v ON LOWER(a.product_name) = LOWER(v.product_name)
    LEFT JOIN
      default_conversion_rate AS dc ON LOWER(a.product_name) = LOWER(dc.product_name)
    LEFT JOIN
      avg_session_duration AS ad ON LOWER(a.product_name) = LOWER(ad.product_name)
    LEFT JOIN
      avg_ar_duration AS ar ON LOWER(a.product_name) = LOWER(ar.product_name)
    LEFT JOIN
      avg_3d_duration AS td ON LOWER(a.product_name) = LOWER(td.product_name)
    GROUP BY
      a.product_name
  )

SELECT
  *
FROM
  final
WHERE
  total_button_clicks > 0 OR purchases_with_service > 0
ORDER BY
  purchases_with_service DESC
`,

  analytics_389903836: (eventsBetween: string) => `
  WITH
    purchases AS (
      SELECT
        TRIM(i.item_name) AS original_product_name,
        REGEXP_REPLACE(
          LOWER(TRIM(SPLIT(REGEXP_REPLACE(i.item_name, r'[/,]', '|'), '|')[SAFE_OFFSET(0)])),
          r'[^a-z0-9\\s]', ''
        ) AS product_name,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id' LIMIT 1) AS transaction_id,
        user_pseudo_id,
        event_timestamp
      FROM
        \`fast-lattice-421210.analytics_389903836.events_*\` AS e,
        UNNEST(e.items) AS i
      WHERE
        e.event_name = 'purchase' AND ${eventsBetween}
    ),

    purchases_agg AS (
      SELECT
        product_name,
        ANY_VALUE(original_product_name) AS original_product_name,
        COUNT(DISTINCT transaction_id) AS total_purchases
      FROM
        purchases
      GROUP BY
        product_name
    ),

    click_events AS (
      SELECT
        event_timestamp AS click_timestamp,
        user_pseudo_id,
        event_name,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title' LIMIT 1) AS original_product_name,
        -- Cleaned and standardized product name
        REGEXP_REPLACE(
          LOWER(TRIM(SPLIT(REGEXP_REPLACE(
            (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title' LIMIT 1),
            r'[/,]', '|'
          ), '|')[SAFE_OFFSET(0)])),
          r'[^a-z0-9\\s]', ''
        ) AS product_name
      FROM
        \`fast-lattice-421210.analytics_389903836.events_*\` AS e
      WHERE
        e.event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click') AND ${eventsBetween}
    ),

    ar_clicks AS (
      SELECT
        product_name,
        ANY_VALUE(original_product_name) AS original_product_name,
        COUNT(DISTINCT click_timestamp) AS AR_Button_Clicks
      FROM
        click_events
      WHERE
        event_name = 'charpstAR_AR_Button_Click'
      GROUP BY
        product_name
    ),

    _3d_clicks AS (
      SELECT
        product_name,
        ANY_VALUE(original_product_name) AS original_product_name,
        COUNT(DISTINCT click_timestamp) AS _3D_Button_Clicks
      FROM
        click_events
      WHERE
        event_name = 'charpstAR_3D_Button_Click'
      GROUP BY
        product_name
    ),

    purchases_with_ar AS (
      SELECT
        p.user_pseudo_id,
        p.transaction_id,
        p.product_name,
        IF(
          EXISTS (
            SELECT 1
            FROM click_events AS c
            WHERE c.user_pseudo_id = p.user_pseudo_id
            AND c.click_timestamp < p.event_timestamp
          ),
          'yes',
          'no'
        ) AS purchased_after_ar
      FROM
        purchases AS p
    ),

    products_purchased_after_click_events AS (
      SELECT
        product_name,
        COUNT(DISTINCT transaction_id) AS purchases_with_service
      FROM
        purchases_with_ar
      WHERE
        purchased_after_ar = 'yes'
      GROUP BY
        product_name
    ),

    total_views AS (
      SELECT
        REGEXP_REPLACE(
          LOWER(TRIM(SPLIT(REGEXP_REPLACE(items.item_name, r'[/,]', '|'), '|')[SAFE_OFFSET(0)])),
          r'[^a-z0-9\\s]', ''
        ) AS product_name,
        ANY_VALUE(TRIM(items.item_name)) AS original_product_name,
        COUNT(DISTINCT CONCAT(param.value.int_value, user_pseudo_id)) AS total_views
      FROM
        \`fast-lattice-421210.analytics_389903836.events_*\` AS e,
        UNNEST(e.event_params) AS param,
        UNNEST(e.items) AS items
      WHERE
        param.key = 'ga_session_id' AND ${eventsBetween}
      GROUP BY
        product_name
    ),

    default_conversion_rate AS (
      SELECT
        v.product_name,
        ANY_VALUE(v.original_product_name) AS original_product_name,
        v.total_views,
        p.total_purchases,
        ROUND(SAFE_DIVIDE(p.total_purchases, v.total_views) * 100, 2) AS default_conv_rate
      FROM
        total_views AS v
      JOIN
        purchases_agg AS p
      ON
        v.product_name = p.product_name
      GROUP BY
        v.product_name, v.total_views, p.total_purchases
    ),

    avg_session_duration AS (
      SELECT
        -- Extract and standardize product name
        REGEXP_REPLACE(
          LOWER(TRIM(SPLIT(REGEXP_REPLACE(
            (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title' LIMIT 1),
            r'[/,]', '|'
          ), '|')[SAFE_OFFSET(0)])),
          r'[^a-z0-9\\s]', ''
        ) AS product_name,
        ANY_VALUE((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title' LIMIT 1)) AS original_product_name,
        AVG((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engagement_time_msec' LIMIT 1)) / 1000 AS avg_session_duration_seconds
      FROM
        \`fast-lattice-421210.analytics_389903836.events_*\` AS e
      WHERE
        e.event_name IN ('page_view', 'scroll', 'user_engagement') AND ${eventsBetween}
      GROUP BY
        product_name
    ),

    avg_ar_duration AS (
      SELECT
        -- Extract and standardize product name
        REGEXP_REPLACE(
          LOWER(TRIM(SPLIT(REGEXP_REPLACE(
            (SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1),
            r'[/,]', '|'
          ), '|')[SAFE_OFFSET(0)])),
          r'[^a-z0-9\\s]', ''
        ) AS product_name,
        ANY_VALUE((SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1)) AS original_product_name,
        AVG((SELECT value.int_value FROM UNNEST(e.event_params) WHERE key = 'engagement_time_msec' LIMIT 1)) / 1000 AS avg_ar_duration
      FROM
        \`fast-lattice-421210.analytics_389903836.events_*\` AS e
      WHERE
        e.event_name = 'charpstAR_AR_Button_Click' AND ${eventsBetween}
      GROUP BY
        product_name
    ),

    avg_3d_duration AS (
      SELECT
        -- Extract and standardize product name
        REGEXP_REPLACE(
          LOWER(TRIM(SPLIT(REGEXP_REPLACE(
            (SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1),
            r'[/,]', '|'
          ), '|')[SAFE_OFFSET(0)])),
          r'[^a-z0-9\\s]', ''
        ) AS product_name,
        ANY_VALUE((SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1)) AS original_product_name,
        AVG((SELECT value.int_value FROM UNNEST(e.event_params) WHERE key = 'engagement_time_msec' LIMIT 1)) / 1000 AS avg_3d_duration
      FROM
        \`fast-lattice-421210.analytics_389903836.events_*\` AS e
      WHERE
        e.event_name = 'charpstAR_3D_Button_Click' AND ${eventsBetween}
      GROUP BY
        product_name
    ),

    product_names AS (
      SELECT
        product_name,
        ANY_VALUE(original_product_name) AS original_product_name
      FROM (
        SELECT product_name, original_product_name FROM purchases_agg
        UNION ALL
        SELECT product_name, original_product_name FROM ar_clicks
        UNION ALL
        SELECT product_name, original_product_name FROM _3d_clicks
        UNION ALL
        SELECT product_name, original_product_name FROM total_views
      )
      GROUP BY
        product_name
    ),

    avg_session_durations AS (
      SELECT
        all_products.product_name,
        pn.original_product_name,
        ROUND(COALESCE(ad.avg_session_duration_seconds, 0), 2) AS avg_session_duration_seconds,
        ROUND(COALESCE(ar.avg_ar_duration, 0), 2) AS avg_ar_duration,
        ROUND(COALESCE(td.avg_3d_duration, 0), 2) AS avg_3d_duration,
        -- Modify avg_ar_session_duration: only add base session duration if avg_ar_duration > 0
        CASE
          WHEN COALESCE(ar.avg_ar_duration, 0) > 0 THEN
            ROUND(COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(ar.avg_ar_duration, 0), 2)
          ELSE
            0
        END AS avg_ar_session_duration,
        -- Modify avg_3d_session_duration: only add base session duration if avg_3d_duration > 0
        CASE
          WHEN COALESCE(td.avg_3d_duration, 0) > 0 THEN
            ROUND(COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(td.avg_3d_duration, 0), 2)
          ELSE
            0
        END AS avg_3d_session_duration
      FROM
        (
          SELECT product_name FROM purchases_agg
          UNION DISTINCT
          SELECT product_name FROM ar_clicks
          UNION DISTINCT
          SELECT product_name FROM _3d_clicks
          UNION DISTINCT
          SELECT product_name FROM total_views
        ) AS all_products
      LEFT JOIN
        product_names AS pn ON all_products.product_name = pn.product_name
      LEFT JOIN
        avg_session_duration AS ad ON all_products.product_name = ad.product_name
      LEFT JOIN
        avg_ar_duration AS ar ON all_products.product_name = ar.product_name
      LEFT JOIN
        avg_3d_duration AS td ON all_products.product_name = td.product_name
    ),

    avg_combined_duration AS (
      SELECT
        product_name,
        CASE
          WHEN COALESCE(avg_ar_duration, 0) > 0 AND COALESCE(avg_3d_duration, 0) > 0 THEN
            ROUND(avg_session_duration_seconds + ((avg_ar_duration + avg_3d_duration) / 2), 2)
          WHEN COALESCE(avg_ar_duration, 0) > 0 THEN
            ROUND(avg_session_duration_seconds + avg_ar_duration, 2)
          WHEN COALESCE(avg_3d_duration, 0) > 0 THEN
            ROUND(avg_session_duration_seconds + avg_3d_duration, 2)
          ELSE
            0
        END AS avg_combined_session_duration
      FROM
        avg_session_durations
    ),

    final AS (
      SELECT
        pn.original_product_name AS product_name,
        COALESCE(c._3D_Button_Clicks, 0) AS _3D_Button_Clicks,
        COALESCE(a.AR_Button_Clicks, 0) AS AR_Button_Clicks,
        COALESCE(d.purchases_with_service, 0) AS purchases_with_service,
        COALESCE(pu.total_purchases, 0) AS total_purchases,
        COALESCE(c._3D_Button_Clicks, 0) + COALESCE(a.AR_Button_Clicks, 0) AS total_button_clicks,
        ROUND(
          SAFE_DIVIDE(
            COALESCE(d.purchases_with_service, 0),
            NULLIF(COALESCE(c._3D_Button_Clicks, 0) + COALESCE(a.AR_Button_Clicks, 0), 0)
          ) * 100,
          2
        ) AS product_conv_rate,
        COALESCE(t.total_views, 0) AS total_views,
        COALESCE(dc.default_conv_rate, 0) AS default_conv_rate,
        sd.avg_session_duration_seconds,
        sd.avg_ar_duration,
        sd.avg_3d_duration,
        sd.avg_ar_session_duration,
        sd.avg_3d_session_duration,
        cd.avg_combined_session_duration
      FROM
        (
          SELECT product_name FROM purchases_agg
          UNION DISTINCT
          SELECT product_name FROM ar_clicks
          UNION DISTINCT
          SELECT product_name FROM _3d_clicks
          UNION DISTINCT
          SELECT product_name FROM total_views
        ) AS all_products
      LEFT JOIN
        product_names AS pn ON all_products.product_name = pn.product_name
      LEFT JOIN
        purchases_agg AS pu ON all_products.product_name = pu.product_name
      LEFT JOIN
        ar_clicks AS a ON all_products.product_name = a.product_name
      LEFT JOIN
        _3d_clicks AS c ON all_products.product_name = c.product_name
      LEFT JOIN
        products_purchased_after_click_events AS d ON all_products.product_name = d.product_name
      LEFT JOIN
        total_views AS t ON all_products.product_name = t.product_name
      LEFT JOIN
        default_conversion_rate AS dc ON all_products.product_name = dc.product_name
      LEFT JOIN
        avg_session_durations AS sd ON all_products.product_name = sd.product_name
      LEFT JOIN
        avg_combined_duration AS cd ON all_products.product_name = cd.product_name
    )

  SELECT
    *
  FROM
    final
  WHERE
    AR_Button_Clicks > 0 OR _3D_Button_Clicks > 0
  `,


  analytics_296845812: (eventsBetween: string) => `
  WITH
    all_products AS (
      SELECT DISTINCT 
        TRIM(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(
                SPLIT(i.item_name, '|')[SAFE_OFFSET(0)],
                r"'", ''
              ),
              r'[-–—\\s]+', ' '
            ),
            r'\\s+', ' '
          )
        ) AS product_name
      FROM \`fast-lattice-421210.analytics_296845812.events_*\`,
      UNNEST(items) AS i
      WHERE ${eventsBetween}
    ),

    click_events_with_products AS (
    SELECT DISTINCT
      e.event_timestamp AS click_timestamp,
      e.user_pseudo_id,
      e.event_name,
      TRIM(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              SPLIT((SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1), '|')[SAFE_OFFSET(0)],
              r"'", ''
            ),
            r'[-–—\\s]+', ' '
          ),
          r'\\s+', ' '
        )
      ) AS product_name
    FROM \`fast-lattice-421210.analytics_296845812.events_*\` AS e
    WHERE e.event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
      AND ${eventsBetween}
  ),

  ar_clicks AS (
    SELECT
      product_name,
      COUNT(DISTINCT click_timestamp) AS AR_Button_Clicks
    FROM click_events_with_products
    WHERE event_name = 'charpstAR_AR_Button_Click'
    GROUP BY product_name
  ),

  _3d_clicks AS (
    SELECT
      product_name,
      COUNT(DISTINCT click_timestamp) AS _3D_Button_Clicks
    FROM click_events_with_products
    WHERE event_name = 'charpstAR_3D_Button_Click'
    GROUP BY product_name
  ),

  purchases AS (
    SELECT DISTINCT
      e.user_pseudo_id,
      e.event_timestamp,
      (SELECT value.int_value FROM UNNEST(e.event_params) WHERE key = 'ga_session_id' LIMIT 1) AS ga_session_id,
      (SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'transaction_id' LIMIT 1) AS transaction_id,
      TRIM(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            SPLIT((SELECT i.item_name FROM UNNEST(e.items) AS i LIMIT 1), '|')[SAFE_OFFSET(0)],
            r'[-–—\\s]+', ' '
          ),
          r'\\s+', ' '
        )
      ) AS product_name
    FROM \`fast-lattice-421210.analytics_296845812.events_*\` AS e
    WHERE e.event_name = 'purchase' AND ${eventsBetween}
  ),

  purchases_with_ar AS (
    SELECT
      p.user_pseudo_id,
      p.transaction_id,
      p.product_name,
      IF(
        EXISTS (
          SELECT 1
          FROM click_events_with_products AS c
          WHERE c.user_pseudo_id = p.user_pseudo_id
            AND c.click_timestamp < p.event_timestamp
            AND c.product_name = p.product_name
        ),
        'yes',
        'no'
      ) AS purchased_after_ar
    FROM purchases AS p
  ),
products_purchased_after_click_events AS (
    SELECT
      product_name,
      COUNT(DISTINCT transaction_id) AS purchases_with_service
    FROM purchases_with_ar
    WHERE purchased_after_ar = 'yes'
    GROUP BY product_name
  ),

  total_views AS (
    SELECT
      TRIM(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              SPLIT(items.item_name, '|')[SAFE_OFFSET(0)],
              r"'", ''
            ),
            r'[-–—\\s]+', ' '
          ),
          r'\\s+', ' '
        )
      ) AS product_name,
      COUNT(DISTINCT CONCAT(param.value.int_value, e.user_pseudo_id)) AS total_views
    FROM \`fast-lattice-421210.analytics_296845812.events_*\` AS e,
    UNNEST(e.event_params) AS param,
    UNNEST(e.items) AS items
    WHERE param.key = 'ga_session_id' AND ${eventsBetween}
    GROUP BY product_name
  ),

  total_purchases AS (
    SELECT
      product_name,
      SUM(total_purchases) AS total_purchases
    FROM (
      SELECT
        TRIM(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(
                SPLIT(i.item_name, '|')[SAFE_OFFSET(0)],
                r"'", ''
              ),
              r'[-–—\\s]+', ' '
            ),
            r'\\s+', ' '
          )
        ) AS product_name,
        COUNT(DISTINCT (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id' LIMIT 1)) AS total_purchases
      FROM \`fast-lattice-421210.analytics_296845812.events_*\`, UNNEST(items) AS i
      WHERE event_name = 'purchase' AND ${eventsBetween}
      GROUP BY product_name
    )
    GROUP BY product_name
  ),

  default_conversion_rate AS (
    SELECT
      v.product_name,
      v.total_views,
      p.total_purchases,
      COALESCE(ROUND(SAFE_DIVIDE(p.total_purchases, v.total_views) * 100, 2), 0) AS default_conv_rate
    FROM total_views AS v
    JOIN total_purchases AS p
      ON LOWER(v.product_name) = LOWER(p.product_name)
  ),

  avg_session_duration AS (
    SELECT
      TRIM(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              SPLIT((SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1), '|')[SAFE_OFFSET(0)],
              r"'", ''
            ),
            r'[-–—\\s]+', ' '
          ),
          r'\\s+', ' '
        )
      ) AS product_name,
      AVG(COALESCE((SELECT value.int_value FROM UNNEST(e.event_params) WHERE key = 'engagement_time_msec' LIMIT 1)/1000, 0)) AS avg_session_duration_seconds
    FROM \`fast-lattice-421210.analytics_296845812.events_*\` AS e
    WHERE event_name IN ('page_view', 'scroll', 'user_engagement')
      AND (SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1) IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 
        FROM UNNEST(e.event_params) AS params
        WHERE params.key = 'event_name' 
        AND params.value.string_value IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
      )
      AND ${eventsBetween}
    GROUP BY product_name
  ),
  avg_ar_duration AS (
    SELECT
      product_name,
      AVG(COALESCE(avg_ar_duration, 0)) AS avg_ar_duration
    FROM (
      SELECT
        ar.product_name,
        SAFE_DIVIDE(ne.next_event_timestamp - ar.event_timestamp / 1000, 1000) AS avg_ar_duration
      FROM (
          SELECT
            e.user_pseudo_id,
            e.event_timestamp,
            TRIM(
              REGEXP_REPLACE(
                REGEXP_REPLACE(
                  SPLIT((SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1), '|')[SAFE_OFFSET(0)],
                  r'[-–—\\s]+', ' '
                ),
                r'\\s+', ' '
              )
            ) AS product_name
          FROM \`fast-lattice-421210.analytics_296845812.events_*\` AS e
          WHERE e.event_name = 'charpstAR_AR_Button_Click' AND ${eventsBetween}
        ) AS ar
      LEFT JOIN (
          SELECT
            ar.user_pseudo_id,
            ar.event_timestamp AS ar_event_timestamp,
            ar.product_name,
            MIN(e.event_timestamp) / 1000 AS next_event_timestamp
          FROM (
              SELECT
                e.user_pseudo_id,
                e.event_timestamp,
                TRIM(
                  REGEXP_REPLACE(
                    REGEXP_REPLACE(
                      SPLIT((SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1), '|')[SAFE_OFFSET(0)],
                      r'[-–—\\s]+', ' '
                    ),
                    r'\\s+', ' '
                  )
                ) AS product_name
              FROM \`fast-lattice-421210.analytics_296845812.events_*\` e
              WHERE e.event_name = 'charpstAR_AR_Button_Click' AND ${eventsBetween}
            ) AS ar
          JOIN \`fast-lattice-421210.analytics_296845812.events_*\` e
          ON ar.user_pseudo_id = e.user_pseudo_id
            AND e.event_timestamp > ar.event_timestamp
            AND ${eventsBetween}
          GROUP BY ar.user_pseudo_id, ar.event_timestamp, ar.product_name
        ) AS ne
      ON ar.user_pseudo_id = ne.user_pseudo_id AND ar.event_timestamp = ne.ar_event_timestamp
      WHERE ne.next_event_timestamp IS NOT NULL
        AND SAFE_DIVIDE(ne.next_event_timestamp - ar.event_timestamp / 1000, 1000) BETWEEN 0 AND 3600
    )
    GROUP BY product_name
  ),

  avg_3d_duration AS (
    SELECT
      product_name,
      AVG(COALESCE(avg_3d_duration, 0)) AS avg_3d_duration
    FROM (
      SELECT
        ar.product_name,
        SAFE_DIVIDE(ne.next_event_timestamp - ar.event_timestamp / 1000, 1000) AS avg_3d_duration
      FROM (
          SELECT
            e.user_pseudo_id,
            e.event_timestamp,
            TRIM(
              REGEXP_REPLACE(
                REGEXP_REPLACE(
                  SPLIT((SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1), '|')[SAFE_OFFSET(0)],
                  r'[-–—\\s]+', ' '
                ),
                r'\\s+', ' '
              )
            ) AS product_name
          FROM \`fast-lattice-421210.analytics_296845812.events_*\` AS e
          WHERE e.event_name = 'charpstAR_3D_Button_Click' AND ${eventsBetween}
        ) AS ar
      LEFT JOIN (
          SELECT
            ar.user_pseudo_id,
            ar.event_timestamp AS ar_event_timestamp,
            ar.product_name,
            MIN(e.event_timestamp) / 1000 AS next_event_timestamp
          FROM (
              SELECT
                e.user_pseudo_id,
                e.event_timestamp,
                TRIM(
                  REGEXP_REPLACE(
                    REGEXP_REPLACE(
                      SPLIT((SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'page_title' LIMIT 1), '|')[SAFE_OFFSET(0)],
                      r'[-–—\\s]+', ' '
                    ),
                    r'\\s+', ' '
                  )
                ) AS product_name
              FROM \`fast-lattice-421210.analytics_296845812.events_*\` e
              WHERE e.event_name = 'charpstAR_3D_Button_Click' AND ${eventsBetween}
            ) AS ar
          JOIN \`fast-lattice-421210.analytics_296845812.events_*\` e
          ON ar.user_pseudo_id = e.user_pseudo_id
            AND e.event_timestamp > ar.event_timestamp
            AND ${eventsBetween}
          GROUP BY ar.user_pseudo_id, ar.event_timestamp, ar.product_name
        ) AS ne
      ON ar.user_pseudo_id = ne.user_pseudo_id AND ar.event_timestamp = ne.ar_event_timestamp
      WHERE ne.next_event_timestamp IS NOT NULL
        AND SAFE_DIVIDE(ne.next_event_timestamp - ar.event_timestamp / 1000, 1000) BETWEEN 0 AND 3600
    )
    GROUP BY product_name
  ),

  total_activated_users AS (
    SELECT COUNT(DISTINCT user_pseudo_id) AS total_users
    FROM \`fast-lattice-421210.analytics_296845812.events_*\`
    WHERE event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
      AND user_pseudo_id IS NOT NULL
      AND ${eventsBetween}
  ),

  avg_engagement_time AS (
    SELECT AVG((SELECT value.int_value FROM UNNEST(event_params) ep WHERE ep.key = 'engagement_time_msec') / 1000.0) AS avg_session_duration_seconds
    FROM \`fast-lattice-421210.analytics_296845812.events_*\`
    WHERE event_name IN ('page_view', 'user_engagement') 
      AND user_pseudo_id IS NOT NULL
      AND ${eventsBetween}
  ),

  ar_events AS (
    SELECT user_pseudo_id, event_timestamp
    FROM \`fast-lattice-421210.analytics_296845812.events_*\`
    WHERE event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
      AND user_pseudo_id IS NOT NULL
      AND ${eventsBetween}
  ),

  next_events AS (
    SELECT ar.user_pseudo_id, ar.event_timestamp AS ar_event_timestamp,
           MIN(e.event_timestamp) / 1000 AS next_event_timestamp
    FROM ar_events ar
    JOIN \`fast-lattice-421210.analytics_296845812.events_*\` e
      ON ar.user_pseudo_id = e.user_pseudo_id 
      AND e.event_timestamp > ar.event_timestamp
      AND ${eventsBetween}
    GROUP BY ar.user_pseudo_id, ar.event_timestamp
  ),

  ar_durations AS (
    SELECT SAFE_DIVIDE(ne.next_event_timestamp - ar.event_timestamp / 1000, 1000) AS interaction_duration_seconds
    FROM ar_events ar
    LEFT JOIN next_events ne 
      ON ar.user_pseudo_id = ne.user_pseudo_id 
      AND ar.event_timestamp = ne.ar_event_timestamp
    WHERE ne.next_event_timestamp IS NOT NULL
      AND SAFE_DIVIDE(ne.next_event_timestamp - ar.event_timestamp / 1000, 1000) BETWEEN 0 AND 3600
  ),

  avg_ar_duration AS (
    SELECT AVG(interaction_duration_seconds) AS avg_ar_session_duration_seconds
    FROM ar_durations
  ),

  combined_durations AS (
    SELECT (SELECT avg_ar_session_duration_seconds FROM avg_ar_duration) + 
           (SELECT avg_session_duration_seconds FROM avg_engagement_time) AS total_avg_session_duration
  ),

  non_ar_users AS (
    SELECT DISTINCT a.user_pseudo_id
    FROM \`fast-lattice-421210.analytics_296845812.events_*\` a
    WHERE a.event_name = 'charpstAR_Load'
      AND a.user_pseudo_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM \`fast-lattice-421210.analytics_296845812.events_*\` b
        WHERE b.user_pseudo_id = a.user_pseudo_id
          AND b.event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
          AND ${eventsBetween}
      )
      AND ${eventsBetween}
  ),

  add_to_cart_after_ar AS (
    SELECT COUNT(DISTINCT ac.user_pseudo_id) AS users_with_cart_after_ar
    FROM ar_events ar
    JOIN \`fast-lattice-421210.analytics_296845812.events_*\` ac
      ON ar.user_pseudo_id = ac.user_pseudo_id 
      AND ac.event_timestamp > ar.event_timestamp
      AND ${eventsBetween}
    WHERE ac.event_name = 'add_to_cart'
  ),

  cart_default_percentage AS (
    SELECT ROUND(
      SAFE_DIVIDE(
        (SELECT COUNT(DISTINCT ac.user_pseudo_id)
         FROM non_ar_users nar
         JOIN \`fast-lattice-421210.analytics_296845812.events_*\` ac
           ON nar.user_pseudo_id = ac.user_pseudo_id
         WHERE ac.event_name = 'add_to_cart'
           AND ${eventsBetween}),
        (SELECT COUNT(DISTINCT user_pseudo_id) FROM non_ar_users)
      ) * 100, 2
    ) AS default_cart_percentage
  ),

  cart_percentage AS (
    SELECT ROUND(
      SAFE_DIVIDE(
        (SELECT users_with_cart_after_ar FROM add_to_cart_after_ar),
        (SELECT COUNT(DISTINCT ar.user_pseudo_id) 
         FROM \`fast-lattice-421210.analytics_296845812.events_*\` ar
         WHERE ar.event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
           AND ${eventsBetween})
      ) * 100, 2
    ) AS percentage_cart_after_ar
  ),

  purchases_by_all_users AS (
    SELECT user_pseudo_id, transaction_id, purchase_value
    FROM purchases
  ),

  purchases_by_ar_users AS (
    SELECT DISTINCT p.user_pseudo_id, p.transaction_id, p.purchase_value
    FROM ar_events ar
    JOIN purchases p ON ar.user_pseudo_id = p.user_pseudo_id
  ),

  avg_order_value_all_users AS (
    SELECT ROUND(SUM(purchase_value) / COUNT(DISTINCT transaction_id), 2) AS avg_order_value
    FROM purchases_by_all_users
  ),

  avg_order_value_ar_users AS (
    SELECT ROUND(SUM(purchase_value) / COUNT(DISTINCT transaction_id), 2) AS avg_order_value
    FROM purchases_by_ar_users
  )

   final AS (
    SELECT
      'product' AS data_type,
      a.product_name AS metric_name,
      JSON_OBJECT(
        'AR_Button_Clicks', CAST(COALESCE(ar.AR_Button_Clicks, 0) AS STRING),
        '_3D_Button_Clicks', CAST(COALESCE(td._3D_Button_Clicks, 0) AS STRING),
        'purchases_with_service', CAST(COALESCE(p.purchases_with_service, 0) AS STRING),
        'total_purchases', CAST(COALESCE(tp.total_purchases, 0) AS STRING),
        'total_button_clicks', CAST(COALESCE(ar.AR_Button_Clicks, 0) + COALESCE(td._3D_Button_Clicks, 0) AS STRING),
        'product_conv_rate', CAST(ROUND(SAFE_DIVIDE(COALESCE(p.purchases_with_service, 0), 
            NULLIF(COALESCE(ar.AR_Button_Clicks, 0) + COALESCE(td._3D_Button_Clicks, 0), 0)) * 100, 2) AS STRING),
        'total_views', CAST(COALESCE(v.total_views, 0) AS STRING),
        'default_conv_rate', CAST(COALESCE(dc.default_conv_rate, 0) AS STRING),
        'avg_session_duration_seconds', CAST(ROUND(COALESCE(ad.avg_session_duration_seconds, 0), 2) AS STRING),
        'avg_ar_duration', CAST(ROUND(COALESCE(ar_d.avg_ar_duration, 0), 2) AS STRING),
        'avg_3d_duration', CAST(ROUND(COALESCE(td_d.avg_3d_duration, 0), 2) AS STRING),
        'avg_ar_session_duration', CAST(ROUND(COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(ar_d.avg_ar_duration, 0), 2) AS STRING),
        'avg_3d_session_duration', CAST(ROUND(COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(td_d.avg_3d_duration, 0), 2) AS STRING),
        'avg_combined_session_duration', CAST(ROUND((COALESCE(ad.avg_session_duration_seconds, 0) + 
            COALESCE(ar_d.avg_ar_duration, 0) + COALESCE(td_d.avg_3d_duration, 0))/2, 2) AS STRING)
      ) AS metrics
    FROM all_products a
    LEFT JOIN ar_clicks ar ON LOWER(a.product_name) = LOWER(ar.product_name)
    LEFT JOIN _3d_clicks td ON LOWER(a.product_name) = LOWER(td.product_name)
    LEFT JOIN products_purchased_after_click_events p ON LOWER(a.product_name) = LOWER(p.product_name)
    LEFT JOIN total_purchases tp ON LOWER(a.product_name) = LOWER(tp.product_name)
    LEFT JOIN total_views v ON LOWER(a.product_name) = LOWER(v.product_name)
    LEFT JOIN default_conversion_rate dc ON LOWER(a.product_name) = LOWER(dc.product_name)
    LEFT JOIN avg_session_duration ad ON LOWER(a.product_name) = LOWER(ad.product_name)
    LEFT JOIN avg_ar_duration ar_d ON LOWER(a.product_name) = LOWER(ar_d.product_name)
    LEFT JOIN avg_3d_duration td_d ON LOWER(a.product_name) = LOWER(td_d.product_name)
    WHERE COALESCE(ar.AR_Button_Clicks, 0) + COALESCE(td._3D_Button_Clicks, 0) > 0 
       OR COALESCE(p.purchases_with_service, 0) > 0
  ),

  overall_metrics AS (
    SELECT 'overall' AS data_type, m.event_name AS metric_name,
    JSON_OBJECT('value', CAST(m.count AS STRING)) AS metrics
    FROM (
      SELECT 'overall_conv_rate' AS event_name, overall_avg_conversion_rate AS count FROM conversion_rates
      UNION ALL
      SELECT 'overall_conv_rate_CharpstAR', overall_avg_conversion_rate_with_ar FROM conversion_rates
      UNION ALL
      SELECT event_name, total_events FROM event_counts
      UNION ALL
      SELECT 'percentage_charpstAR', percentage_ar_users FROM ar_percentage
      UNION ALL
      SELECT 'session_time_charpstAR', ROUND(avg_ar_session_duration_seconds, 2) FROM avg_ar_duration
      UNION ALL
      SELECT 'session_time_default', ROUND(avg_session_duration_seconds, 2) FROM avg_engagement_time
      UNION ALL
      SELECT 'combined_session_time', ROUND(total_avg_session_duration, 2) FROM combined_durations
      UNION ALL
      SELECT 'cart_after_ar_percentage', percentage_cart_after_ar FROM cart_percentage
      UNION ALL
      SELECT 'total_purchases', CAST(total_purchases AS FLOAT64) FROM total_purchases_overall
      UNION ALL
      SELECT 'total_unique_users', CAST(total_ar_load_users AS FLOAT64) FROM ar_load_user_count
      UNION ALL
      SELECT 'total_activated_users', CAST(total_users AS FLOAT64) FROM total_activated_users
      UNION ALL
      SELECT 'cart_percentage_default', default_cart_percentage FROM cart_default_percentage
      UNION ALL
      SELECT 'average_order_value_all_users', avg_order_value FROM avg_order_value_all_users
      UNION ALL
      SELECT 'average_order_value_ar_users', avg_order_value FROM avg_order_value_ar_users
      UNION ALL
      SELECT 'total_purchases_after_ar', CAST(total_purchases_with_ar AS FLOAT64) FROM total_purchases_with_ar
    ) m
  )

SELECT * FROM product_metrics
UNION ALL
SELECT * FROM overall_metrics
ORDER BY data_type, metric_name`,
  };