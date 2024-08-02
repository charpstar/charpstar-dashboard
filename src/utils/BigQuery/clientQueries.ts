export type TDatasets = keyof typeof queries;

export const queries = {
  analytics_311675532: (eventsBetween : string) => `
  WITH
    all_products AS (
      SELECT DISTINCT TRIM(i.item_name) AS product_name
      FROM \`fast-lattice-421210.analytics_311675532.events_*\`, UNNEST(items) AS i
      WHERE ${eventsBetween}
    ),
    click_events_with_products AS (
      SELECT
        event_timestamp AS click_timestamp,
        user_pseudo_id,
        event_name,
        SPLIT(REGEXP_REPLACE(ep.value.string_value, '–', '-'), '-')[SAFE_OFFSET(0)] AS page_title_product_name
      FROM
        \`fast-lattice-421210.analytics_311675532.events_*\`,
        UNNEST(event_params) AS ep
      WHERE
        event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click') AND ${eventsBetween}
        AND ep.key = 'page_title'
        AND user_pseudo_id IS NOT NULL
    ),
    ar_clicks AS (
      SELECT
        TRIM(page_title_product_name) AS page_title_product_name,
        COUNT(click_timestamp) AS AR_Button_Clicks
      FROM click_events_with_products
      WHERE event_name = 'charpstAR_AR_Button_Click'
      GROUP BY TRIM(page_title_product_name)
    ),
    _3d_clicks AS (
      SELECT
        TRIM(page_title_product_name) AS page_title_product_name,
        COUNT(click_timestamp) AS _3D_Button_Clicks
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
      FROM \`fast-lattice-421210.analytics_311675532.events_*\`
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
        \`fast-lattice-421210.analytics_311675532.events_*\`,
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
      FROM \`fast-lattice-421210.analytics_311675532.events_*\`, UNNEST(items) AS i
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
      FROM \`fast-lattice-421210.analytics_311675532.events_*\`
      WHERE event_name IN ('page_view', 'scroll', 'user_engagement') AND ${eventsBetween}
      GROUP BY product_name
    ),
    ar_events AS (
      SELECT
        user_pseudo_id,
        event_timestamp,
        TRIM(SPLIT(REGEXP_REPLACE((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title'), '–', '-'), '-')[SAFE_OFFSET(0)])  AS page_title_product_name
      FROM
        \`fast-lattice-421210.analytics_311675532.events_*\`
      WHERE
        event_name = 'charpstAR_AR_Button_Click' AND ${eventsBetween}
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
        ar.user_pseudo_id = e.user_pseudo_id AND ${eventsBetween}
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
        ar.user_pseudo_id = e.user_pseudo_id AND ${eventsBetween}
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
        COALESCE(v.total_views, 0) AS total_views,
        COALESCE(dc.default_conv_rate, 0) AS default_conv_rate,
        ROUND(COALESCE(ad.avg_session_duration_seconds, 0),2) AS avg_session_duration_seconds,
        ROUND(COALESCE(ar.avg_ar_duration, 0),2) AS avg_ar_duration,
        ROUND(COALESCE(td.avg_3d_duration, 0),2) AS avg_3d_duration,
        ROUND(COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(ar.avg_ar_duration, 0),2) AS avg_ar_session_duration,
        ROUND(COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(td.avg_3d_duration, 0),2) AS avg_3d_session_duration,
        ROUND((COALESCE(ad.avg_session_duration_seconds, 0) + COALESCE(ar.avg_ar_duration, 0) + COALESCE(td.avg_3d_duration, 0)) / 2, 2) AS avg_combined_session_duration
      FROM
        all_products AS a
      LEFT JOIN
        ar_clicks AS b ON LOWER(a.product_name) = LOWER(b.page_title_product_name)
      LEFT JOIN
        _3d_clicks AS c ON LOWER(a.product_name) = LOWER(c.page_title_product_name)
      LEFT JOIN
        products_purchased_after_click_events AS d ON a.product_name = d.product_name
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
      WHERE COALESCE(c._3D_Button_Clicks, 0) + COALESCE(b.AR_Button_Clicks, 0) > 0
      ORDER BY d.purchases_with_service DESC
    )
  SELECT
    *
  FROM
    final
  WHERE
    total_button_clicks > 0 OR purchases_with_service > 0
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
};
