export type TDatasets = keyof typeof queries;

export const queries = {
  analytics_296845812: (eventsBetween: string) => `
  WITH
    base_events AS (
      SELECT
        user_pseudo_id,
        event_timestamp,
        event_name,
        event_params,
        items
      FROM \`fast-lattice-421210.analytics_296845812.events_*\`
      WHERE ${eventsBetween}
        AND user_pseudo_id IS NOT NULL
    ),

    -- Product definitions
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
      FROM base_events,
      UNNEST(items) AS i
    ),

    -- Basic user counts and events
   ar_load_user_count AS (
      SELECT COUNT(DISTINCT user_pseudo_id) AS total_ar_load_users
      FROM base_events
      WHERE event_name = 'charpstAR_Load'
    ),

    ar_user_count AS (
      SELECT COUNT(DISTINCT user_pseudo_id) AS total_ar_users
      FROM base_events
      WHERE event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
    ),

    event_counts AS (
      SELECT event_name, COUNT(*) AS total_events
      FROM base_events
      WHERE event_name IN ('charpstAR_Load', 'charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
      GROUP BY event_name
    ),

    -- Views and session metrics
    total_views_overall AS (
      SELECT COUNT(DISTINCT e.user_pseudo_id) AS total_views
      FROM base_events e,   
      UNNEST(e.event_params) AS ep
      WHERE e.event_name = 'page_view'
        AND ep.key = 'page_title'
    ),

    total_views_with_ar AS (
      SELECT COUNT(DISTINCT user_pseudo_id) AS total_views_with_ar
      FROM base_events
      WHERE event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
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
      FROM base_events e
      WHERE e.event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
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
        (SELECT value.double_value FROM UNNEST(e.event_params) WHERE key = 'value') AS purchase_value,
        TRIM(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              SPLIT((SELECT i.item_name FROM UNNEST(e.items) AS i LIMIT 1), '|')[SAFE_OFFSET(0)],
              r'[-–—\\s]+', ' '
            ),
            r'\\s+', ' '
          )
        ) AS product_name
      FROM base_events e
      WHERE e.event_name = 'purchase'
    ),

purchases_with_ar AS (
  SELECT
    p.user_pseudo_id,
    p.transaction_id,
    p.product_name,
    p.purchase_value,
    IF(
      EXISTS (
        SELECT 1
        FROM click_events_with_products AS c
        WHERE c.user_pseudo_id = p.user_pseudo_id
      ),
      'yes',
      'no'
    ) AS purchased_after_ar
  FROM purchases AS p
),


    total_purchases_overall AS (
      SELECT COUNT(DISTINCT transaction_id) AS total_purchases
      FROM purchases
    ),

 total_purchases_with_ar AS (
  SELECT COUNT(DISTINCT p.transaction_id) AS total_purchases_with_ar
  FROM purchases_with_ar p
  JOIN (
    SELECT DISTINCT LOWER(TRIM(product_name)) as product_name
    FROM (
      SELECT product_name FROM ar_clicks
      UNION ALL
      SELECT product_name FROM _3d_clicks
    )
  ) service_products
  ON LOWER(TRIM(p.product_name)) = service_products.product_name
  WHERE p.purchased_after_ar = 'yes'
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
      FROM base_events e,
      UNNEST(e.event_params) AS param,
      UNNEST(e.items) AS items
      WHERE param.key = 'ga_session_id'
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
        FROM base_events, 
        UNNEST(items) AS i
        WHERE event_name = 'purchase'
        GROUP BY product_name
      )
      GROUP BY product_name
    ),

    -- Conversion rates
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

    ar_percentage AS (
      SELECT LEAST(
        ROUND(
          SAFE_DIVIDE(
            (SELECT total_ar_users FROM ar_user_count),
            (SELECT total_ar_load_users FROM ar_load_user_count)
          ) * 100,
          2
        ),
        100.00
      ) AS percentage_ar_users
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

purchases_by_all_users AS (
  SELECT 
    p.user_pseudo_id, 
    p.transaction_id, 
    p.purchase_value
  FROM purchases p
  INNER JOIN non_ar_users n ON p.user_pseudo_id = n.user_pseudo_id
  WHERE 
    transaction_id IS NOT NULL 
    AND purchase_value IS NOT NULL 
    AND purchase_value > 0
),

purchases_by_ar_users AS (
  SELECT DISTINCT 
    p.user_pseudo_id, 
    p.transaction_id, 
    p.purchase_value
  FROM ar_events ar
  JOIN purchases p 
    ON ar.user_pseudo_id = p.user_pseudo_id
    AND p.event_timestamp > ar.event_timestamp  -- Only count purchases after AR interaction
  WHERE 
    p.transaction_id IS NOT NULL 
    AND p.purchase_value IS NOT NULL 
    AND p.purchase_value > 0
),

avg_order_value_all_users AS (
  SELECT 
    ROUND(
      SAFE_DIVIDE(
        SUM(CAST(p.purchase_value AS FLOAT64)), 
        NULLIF(COUNT(DISTINCT p.transaction_id), 0)
      ), 
      2
    ) AS avg_order_value
  FROM purchases p
  INNER JOIN non_ar_users n ON p.user_pseudo_id = n.user_pseudo_id
  WHERE 
    p.transaction_id IS NOT NULL 
    AND p.purchase_value IS NOT NULL 
    AND p.purchase_value > 0
),

avg_order_value_ar_users AS (
  SELECT 
    ROUND(
      SAFE_DIVIDE(
        SUM(CAST(purchase_value AS FLOAT64)), 
        NULLIF(COUNT(DISTINCT transaction_id), 0)
      ), 
      2
    ) AS avg_order_value
  FROM purchases_by_ar_users
),


    total_activated_users AS (
    SELECT COUNT(DISTINCT user_pseudo_id) AS total_users
    FROM \`fast-lattice-421210.analytics_296845812.events_*\`
    WHERE event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
      AND user_pseudo_id IS NOT NULL
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

  avg_engagement_time AS (
    SELECT AVG((SELECT value.int_value FROM UNNEST(event_params) ep WHERE ep.key = 'engagement_time_msec') / 1000.0) AS avg_session_duration_seconds
    FROM \`fast-lattice-421210.analytics_296845812.events_*\` e
    WHERE event_name IN ('page_view', 'user_engagement') 
      AND user_pseudo_id IS NOT NULL
      AND ${eventsBetween}
      AND EXISTS (
        SELECT 1 FROM non_ar_users n
        WHERE n.user_pseudo_id = e.user_pseudo_id
      )
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

conversion_rates AS (
  SELECT
    ROUND(SAFE_DIVIDE(
      -- Numerator: Count purchases from non-AR users (only Load, no AR/3D)
      (SELECT COUNT(DISTINCT p.transaction_id) 
       FROM purchases p
       INNER JOIN non_ar_users n ON p.user_pseudo_id = n.user_pseudo_id),
      -- Denominator: Total number of users who only loaded but never used AR/3D
      (SELECT COUNT(DISTINCT user_pseudo_id) FROM non_ar_users)
    ) * 100, 2) AS overall_avg_conversion_rate,
      ROUND(SAFE_DIVIDE(tp_ar.total_purchases_with_ar, tv_ar.total_views_with_ar) * 100, 2) AS overall_avg_conversion_rate_with_ar
      FROM
      total_views_overall AS tv,
      total_purchases_overall AS tp,
      total_views_with_ar AS tv_ar,
      total_purchases_with_ar AS tp_ar
  ),

    product_metrics AS (
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
          'default_conv_rate', CAST(COALESCE(dc.default_conv_rate, 0) AS STRING)
        ) AS metrics
      FROM all_products a
      LEFT JOIN ar_clicks ar ON LOWER(a.product_name) = LOWER(ar.product_name)
      LEFT JOIN _3d_clicks td ON LOWER(a.product_name) = LOWER(td.product_name)
      LEFT JOIN products_purchased_after_click_events p ON LOWER(a.product_name) = LOWER(p.product_name)
      LEFT JOIN total_purchases tp ON LOWER(a.product_name) = LOWER(tp.product_name)
      LEFT JOIN total_views v ON LOWER(a.product_name) = LOWER(v.product_name)
      LEFT JOIN default_conversion_rate dc ON LOWER(a.product_name) = LOWER(dc.product_name)
      WHERE COALESCE(ar.AR_Button_Clicks, 0) + COALESCE(td._3D_Button_Clicks, 0) > 0 
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
          SELECT 'total_purchases_after_ar' AS event_name, CAST(total_purchases_with_ar.total_purchases_with_ar AS FLOAT64) as count FROM total_purchases_with_ar
    ) m
    )

  SELECT * FROM product_metrics
  UNION ALL
  SELECT * FROM overall_metrics
  ORDER BY data_type, metric_name`,

  analytics_274422295: (eventsBetween: string) => `
  WITH
    base_events AS (
      SELECT
        user_pseudo_id,
        event_timestamp,
        event_name,
        event_params,
        items
      FROM \`fast-lattice-421210.analytics_274422295.events_*\`
      WHERE ${eventsBetween}
        AND user_pseudo_id IS NOT NULL
    ),

     all_products AS (
    SELECT DISTINCT TRIM(i.item_name) AS product_name
    FROM base_events, 
    UNNEST(items) AS i
    ),

    -- Click events with consistent product name handling
    click_events_with_products AS (
      SELECT DISTINCT
        e.event_timestamp AS click_timestamp,
        e.user_pseudo_id,
        e.event_name,
      SPLIT(REGEXP_REPLACE((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title'), '–', '-'), '-')[SAFE_OFFSET(0)] AS product_name
      FROM base_events e
      WHERE e.event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
    ),

    -- AR/3D click counts
    ar_clicks AS (
      SELECT
        TRIM(product_name) AS product_name,
        COUNT(DISTINCT click_timestamp) AS AR_Button_Clicks
      FROM click_events_with_products
      WHERE event_name = 'charpstAR_AR_Button_Click'
      GROUP BY product_name
    ),

    _3d_clicks AS (
      SELECT
         TRIM(product_name) AS product_name,
        COUNT(DISTINCT click_timestamp) AS _3D_Button_Clicks
      FROM click_events_with_products
      WHERE event_name = 'charpstAR_3D_Button_Click'
      GROUP BY product_name
    ),

    -- Purchases with consistent product name handling
    purchases AS (
      SELECT DISTINCT
        e.user_pseudo_id,
        e.event_timestamp,
        (SELECT value.int_value FROM UNNEST(e.event_params) WHERE key = 'ga_session_id' LIMIT 1) AS ga_session_id,
        (SELECT value.string_value FROM UNNEST(e.event_params) WHERE key = 'transaction_id' LIMIT 1) AS transaction_id,
        (SELECT value.double_value FROM UNNEST(e.event_params) WHERE key = 'value') AS purchase_value,
        (SELECT TRIM(i.item_name) FROM UNNEST(items) AS i LIMIT 1) AS product_name
      FROM base_events e
      WHERE e.event_name = 'purchase'
    ),

    -- AR events tracking
    ar_events AS (
      SELECT user_pseudo_id, event_timestamp
      FROM base_events
      WHERE event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
    ),

purchases_with_ar AS (
  SELECT
    p.user_pseudo_id,
    p.transaction_id,
    p.product_name,
    p.purchase_value,
    p.event_timestamp as purchase_timestamp,
    IF(
      EXISTS (
        SELECT 1
        FROM click_events_with_products c 
        WHERE c.user_pseudo_id = p.user_pseudo_id
        AND c.click_timestamp < p.event_timestamp
      ),
      'yes',
      'no'
    ) AS purchased_after_ar
  FROM purchases p
),

-- New CTE to track all product interactions with our service
product_interactions AS (
  SELECT
    user_pseudo_id,
    TRIM(product_name) as product_name,
    MIN(click_timestamp) as first_interaction,
    MAX(click_timestamp) as last_interaction,
    COUNT(*) as total_interactions
  FROM click_events_with_products
  GROUP BY user_pseudo_id, TRIM(product_name)
),

products_purchased_after_click_events AS (
  SELECT
    p.product_name,
    COUNT(DISTINCT p.transaction_id) as purchases_with_service,
  FROM purchases_with_ar p
  WHERE p.purchased_after_ar = 'yes'
  GROUP BY p.product_name
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
   ar_load_user_count AS (
    SELECT COUNT(DISTINCT user_pseudo_id) AS total_ar_load_users
    FROM \`fast-lattice-421210.analytics_274422295.events_*\`
    WHERE event_name = 'charpstAR_Load'
      AND ${eventsBetween}
  ),

  ar_user_count AS (
    SELECT COUNT(DISTINCT user_pseudo_id) AS total_ar_users
    FROM \`fast-lattice-421210.analytics_274422295.events_*\`
    WHERE event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
      AND ${eventsBetween}
  ),

  event_counts AS (
    SELECT event_name, COUNT(*) AS total_events
    FROM \`fast-lattice-421210.analytics_274422295.events_*\`
    WHERE event_name IN ('charpstAR_Load', 'charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
      AND ${eventsBetween}
    GROUP BY event_name
  ),

  total_views_overall AS (
    SELECT COUNT(DISTINCT e.user_pseudo_id) AS total_views
    FROM \`fast-lattice-421210.analytics_274422295.events_*\` e
    WHERE e.event_name = 'page_view'
      AND ${eventsBetween}
  ),

  total_purchases_overall AS (
    SELECT COUNT(DISTINCT transaction_id) AS total_purchases
    FROM purchases
  ),

  total_views_with_ar AS (
    SELECT COUNT(DISTINCT user_pseudo_id) AS total_views_with_ar
    FROM \`fast-lattice-421210.analytics_274422295.events_*\`
    WHERE event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
      AND ${eventsBetween}
  ),

  total_purchases_with_ar AS (
  SELECT COUNT(DISTINCT p.transaction_id) AS total_purchases_with_ar
  FROM purchases_with_ar p
  JOIN (
    SELECT DISTINCT LOWER(TRIM(product_name)) as product_name
    FROM (
      SELECT product_name FROM ar_clicks
      UNION ALL
      SELECT product_name FROM _3d_clicks
    )
  ) service_products
  ON LOWER(TRIM(p.product_name)) = service_products.product_name
  WHERE p.purchased_after_ar = 'yes'
),

  ar_percentage AS (
    SELECT 
      LEAST(
        ROUND(
          SAFE_DIVIDE(
            (SELECT total_ar_users FROM ar_user_count),
            (SELECT total_ar_load_users FROM ar_load_user_count)
          ) * 100,
          2
        ),
        100.00
      ) AS percentage_ar_users
  ),

  conversion_rates AS (
    SELECT
      ROUND(SAFE_DIVIDE(tp.total_purchases, tv.total_views) * 100, 2) AS overall_avg_conversion_rate,
      ROUND(SAFE_DIVIDE(tp_ar.total_purchases_with_ar, tv_ar.total_views_with_ar) * 100, 2) AS overall_avg_conversion_rate_with_ar
    FROM
      total_views_overall AS tv,
      total_purchases_overall AS tp,
      total_views_with_ar AS tv_ar,
      total_purchases_with_ar AS tp_ar
  ),

  cart_events AS (
    SELECT
      COUNT(DISTINCT user_pseudo_id) AS users_with_cart
    FROM \`fast-lattice-421210.analytics_274422295.events_*\`
    WHERE event_name = 'add_to_cart'
      AND ${eventsBetween}
  ),

  next_events AS (
    SELECT ar.user_pseudo_id, ar.event_timestamp AS ar_event_timestamp,
           MIN(e.event_timestamp) / 1000 AS next_event_timestamp
    FROM ar_events ar
    JOIN \`fast-lattice-421210.analytics_274422295.events_*\` e
      ON ar.user_pseudo_id = e.user_pseudo_id 
      AND e.event_timestamp > ar.event_timestamp
      AND ${eventsBetween}
    GROUP BY ar.user_pseudo_id, ar.event_timestamp
  ),

  cart_after_ar AS (
    SELECT COUNT(DISTINCT ac.user_pseudo_id) AS users_with_cart_after_ar
    FROM ar_events ar
    JOIN \`fast-lattice-421210.analytics_274422295.events_*\` ac
      ON ar.user_pseudo_id = ac.user_pseudo_id
      AND ac.event_timestamp > ar.event_timestamp
    WHERE ac.event_name = 'add_to_cart'
      AND ${eventsBetween}
  ),

  cart_percentages AS (
    SELECT
      ROUND(SAFE_DIVIDE(
        (SELECT users_with_cart FROM cart_events),
        (SELECT total_ar_load_users FROM ar_load_user_count)
      ) * 100, 2) AS cart_percentage_default,
      ROUND(SAFE_DIVIDE(
        (SELECT users_with_cart_after_ar FROM cart_after_ar),
        (SELECT total_ar_users FROM ar_user_count)
      ) * 100, 2) AS cart_after_ar_percentage
  ),

  avg_order_values AS (
    SELECT
      ROUND(AVG(CASE WHEN purchased_after_ar = 'no' THEN purchase_value END), 2) AS avg_order_value_all_users,
      ROUND(AVG(CASE WHEN purchased_after_ar = 'yes' THEN purchase_value END), 2) AS avg_order_value_ar_users
    FROM purchases_with_ar
  ),


  avg_engagement_time AS (
    SELECT AVG((SELECT value.int_value FROM UNNEST(event_params) ep WHERE ep.key = 'engagement_time_msec') / 1000.0) AS avg_session_duration_seconds
    FROM \`fast-lattice-421210.analytics_274422295.events_*\`
    WHERE event_name IN ('page_view', 'user_engagement') 
      AND user_pseudo_id IS NOT NULL
      AND ${eventsBetween}
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
      FROM \`fast-lattice-421210.analytics_274422295.events_*\` a
      WHERE a.event_name = 'charpstAR_Load'
        AND a.user_pseudo_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 
          FROM \`fast-lattice-421210.analytics_274422295.events_*\` b
          WHERE b.user_pseudo_id = a.user_pseudo_id
            AND b.event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
            AND ${eventsBetween}
        )
        AND ${eventsBetween}
  ),
  cart_default_percentage AS (
      SELECT ROUND(
        SAFE_DIVIDE(
          (SELECT COUNT(DISTINCT ac.user_pseudo_id)
          FROM non_ar_users nar
          JOIN \`fast-lattice-421210.analytics_274422295.events_*\` ac
            ON nar.user_pseudo_id = ac.user_pseudo_id
            AND ${eventsBetween}
          WHERE ac.event_name = 'add_to_cart'),
          (SELECT COUNT(DISTINCT user_pseudo_id) FROM non_ar_users)
        ) * 100, 2
      ) AS default_cart_percentage
  ),

purchases_by_all_users AS (
  SELECT 
    user_pseudo_id, 
    transaction_id, 
    purchase_value
  FROM purchases
  WHERE 
    transaction_id IS NOT NULL 
    AND purchase_value IS NOT NULL 
    AND purchase_value > 0
),

purchases_by_ar_users AS (
  SELECT DISTINCT 
    p.user_pseudo_id, 
    p.transaction_id, 
    p.purchase_value
  FROM ar_events ar
  JOIN purchases p 
    ON ar.user_pseudo_id = p.user_pseudo_id
    AND p.event_timestamp > ar.event_timestamp  -- Only count purchases after AR interaction
  WHERE 
    p.transaction_id IS NOT NULL 
    AND p.purchase_value IS NOT NULL 
    AND p.purchase_value > 0
),

avg_order_value_all_users AS (
  SELECT 
    ROUND(
      SAFE_DIVIDE(
        SUM(CAST(purchase_value AS FLOAT64)), 
        NULLIF(COUNT(DISTINCT transaction_id), 0)
      ), 
      2
    ) AS avg_order_value
  FROM purchases p
  WHERE EXISTS (
    SELECT 1 FROM non_ar_users n
    WHERE n.user_pseudo_id = p.user_pseudo_id
  )
),

avg_order_value_ar_users AS (
  SELECT 
    ROUND(
      SAFE_DIVIDE(
        SUM(CAST(purchase_value AS FLOAT64)), 
        NULLIF(COUNT(DISTINCT transaction_id), 0)
      ), 
      2
    ) AS avg_order_value
  FROM purchases_by_ar_users
),

    total_activated_users AS (
    SELECT COUNT(DISTINCT activated.user_pseudo_id) AS total_users
    FROM \`fast-lattice-421210.analytics_274422295.events_*\` activated
    WHERE activated.event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
      AND activated.user_pseudo_id IS NOT NULL
      AND ${eventsBetween}
      AND EXISTS (
        SELECT 1
        FROM \`fast-lattice-421210.analytics_274422295.events_*\` load
        WHERE load.event_name = 'charpstAR_Load'
        AND load.user_pseudo_id = activated.user_pseudo_id
        AND ${eventsBetween}
      )
),

    add_to_cart_after_ar AS (
    SELECT COUNT(DISTINCT ac.user_pseudo_id) AS users_with_cart_after_ar
    FROM ar_events ar
    JOIN \`fast-lattice-421210.analytics_274422295.events_*\` ac
      ON ar.user_pseudo_id = ac.user_pseudo_id 
      AND ac.event_timestamp > ar.event_timestamp
      AND ${eventsBetween}
    WHERE ac.event_name = 'add_to_cart'
  ),



  cart_percentage AS (
    SELECT ROUND(
      SAFE_DIVIDE(
        (SELECT users_with_cart_after_ar FROM add_to_cart_after_ar),
        (SELECT COUNT(DISTINCT ar.user_pseudo_id) 
         FROM \`fast-lattice-421210.analytics_274422295.events_*\` ar
         WHERE ar.event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
           AND ${eventsBetween})
      ) * 100, 2
    ) AS percentage_cart_after_ar
  ),

  product_metrics AS (
  SELECT
    'product' AS data_type,
    a.product_name AS metric_name,
    JSON_OBJECT(
      'AR_Button_Clicks', CAST(COALESCE(ar.AR_Button_Clicks, 0) AS STRING),
      '_3D_Button_Clicks', CAST(COALESCE(td._3D_Button_Clicks, 0) AS STRING),
      'purchases_with_service', CAST(COALESCE(p.purchases_with_service, 0) AS STRING),
      'total_purchases', CAST(COALESCE(tp.total_purchases, 0) AS STRING),
      'total_button_clicks', CAST(COALESCE(ar.AR_Button_Clicks, 0) + COALESCE(td._3D_Button_Clicks, 0) AS STRING),
      'product_conv_rate', CAST(
        ROUND(
          SAFE_DIVIDE(
            COALESCE(p.purchases_with_service, 0), 
            NULLIF(COALESCE(ar.AR_Button_Clicks, 0) + COALESCE(td._3D_Button_Clicks, 0), 0)
          ) * 100, 
          2
        ) AS STRING
      ),
      'total_views', CAST(COALESCE(v.total_views, 0) AS STRING),
      'default_conv_rate', CAST(COALESCE(dc.default_conv_rate, 0) AS STRING)
    ) AS metrics
  FROM all_products a
  LEFT JOIN ar_clicks ar ON LOWER(TRIM(a.product_name)) = LOWER(TRIM(ar.product_name))
  LEFT JOIN _3d_clicks td ON LOWER(TRIM(a.product_name)) = LOWER(TRIM(td.product_name))
  LEFT JOIN products_purchased_after_click_events p ON LOWER(TRIM(a.product_name)) = LOWER(TRIM(p.product_name))
  LEFT JOIN total_purchases tp ON LOWER(TRIM(a.product_name)) = LOWER(TRIM(tp.product_name))
  LEFT JOIN total_views v ON LOWER(TRIM(a.product_name)) = LOWER(TRIM(v.product_name))
  LEFT JOIN default_conversion_rate dc ON LOWER(TRIM(a.product_name)) = LOWER(TRIM(dc.product_name))
  WHERE COALESCE(ar.AR_Button_Clicks, 0) + COALESCE(td._3D_Button_Clicks, 0) > 0 
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
        SELECT 'cart_percentage_default', percentage_cart_after_ar FROM cart_percentage
        UNION ALL
        SELECT 'average_order_value_all_users', avg_order_value FROM avg_order_value_all_users
        UNION ALL
        SELECT 'average_order_value_ar_users', avg_order_value FROM avg_order_value_ar_users
        UNION ALL
          SELECT 'total_purchases_after_ar' AS event_name, CAST(total_purchases_with_ar.total_purchases_with_ar AS FLOAT64) as count FROM total_purchases_with_ar
    ) m
    )

  SELECT * FROM product_metrics
  UNION ALL
  SELECT * FROM overall_metrics
  ORDER BY data_type, metric_name`
,
};