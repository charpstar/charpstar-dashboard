export const queries = {
  analytics_274422295: `WITH
        all_products AS (
        SELECT
        DISTINCT
          TRIM(i.item_name) AS products_name
        FROM
          \`fast-lattice-421210.analytics_274422295.events_*\`, UNNEST(items) AS i
        )
        ,
        # This CTE Grabs all the two click events and their timestamp along with their session id for every user this will help identifying the purchases that take place after one of these events were triggered in that session
        click_events AS (
          SELECT
        DISTINCT
            user_pseudo_id,
            event_name,
            event_timestamp AS click_timestamp,
            (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS
        ga_session_id,
          FROM
            \`fast-lattice-421210.analytics_274422295.events_*\`
          WHERE
            event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
        )
        # This CTE extracts the product name from the event parameter 'page_title' because there is not any parameter except this which provides us the product name.
        # NOTE: FOR OTHER DATASETS USER MAY NEED TO CHANGE THE LOGIC DESCRIBED TO GET “page_title_product_name” WE HAVE CHECKED ACROSS THE DATASETS AND THERE IS NO UNIFORMITY IN THE NAMES SO THIS LOGIC IS TO BE BUILT ACCORDING TO THE PRODUCT NAMES IN ITEM ARRAY AND PRODUCT PAGE NAME FROM “PAGE_TITLE” EVENT PARAMETER.
        ,
        click_events_with_products AS
        (
        SELECT
          DISTINCT
          event_timestamp AS click_timestamp,
          user_pseudo_id,
          event_name,
          SPLIT(REGEXP_REPLACE((SELECT value.string_value FROM UNNEST(event_params) WHERE key
        = 'page_title'), '–', '-'), '-')[SAFE_OFFSET(0)] AS page_title_product_name
        FROM
          \`fast-lattice-421210.analytics_274422295.events_*\`
        WHERE
          event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
        )
        ,
        # This CTE counts the number of times the 'charpstAR_AR_Button_Click' event was triggered
        ar_clicks AS

        (
        SELECT
          TRIM(page_title_product_name) AS page_title_product_name,
          COUNT(DISTINCT click_timestamp) AS AR_Button_Clicks
        FROM
          click_events_with_products
        WHERE
          event_name = 'charpstAR_AR_Button_Click'
        GROUP BY 1 )
        ,
        # This CTE counts the number of times the charpstAR_3D_Button_Click event was triggered
        _3d_clicks AS
        (
        SELECT
        TRIM(page_title_product_name) AS page_title_product_name,
          COUNT(DISTINCT click_timestamp) AS _3D_Button_Clicks
        FROM
          click_events_with_products
        WHERE
          event_name = 'charpstAR_3D_Button_Click'
        GROUP BY 1 )
        ,
        # This CTE gets the transaction id once a purchase event happens for a user
        purchase AS (
        SELECT
        DISTINCT
          user_pseudo_id,
          event_timestamp,
          (SELECT value.int_value FROM UNNEST(event_params)
        WHERE key = 'ga_session_id')
        AS ga_session_id,
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id')
        AS transaction_id
        FROM
          \`fast-lattice-421210.analytics_274422295.events_*\`

        WHERE
          event_name = 'purchase'
        )
        ,
        # This CTE accounts only those transaction id that are required i.e that happened after those click events in that session.
        tran_ids_required AS (
        SELECT
        DISTINCT
          purchase.transaction_id
        FROM
          click_events AS click
        INNER JOIN
        purchase
        ON
          click.ga_session_id  = purchase.ga_session_id
          AND
          click.user_pseudo_id = purchase.user_pseudo_id
          AND
          purchase.event_timestamp > click.click_timestamp
        )
        ,
        # This CTE grabs the product name with their transaction ids so that we know what was the name of the product that was purchased.
        products_purchased_cte AS
        (
        SELECT
          TRIM(i.item_name) AS products_name,
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id')
        AS transaction_id
        FROM
          \`fast-lattice-421210.analytics_274422295.events_*\`,UNNEST(items) AS i
        WHERE
          event_name = "purchase"
        )
        ,
        # In this CTE we have our final products that were being purchased after the click events along with the cleaned product names

        prodcuts_purchased_after_click_events AS
        (
        SELECT
          products_name,
          COUNT(DISTINCT transaction_id) AS products_purchased
        FROM
          products_purchased_cte
        WHERE
          transaction_id IN (SELECT DISTINCT transaction_id FROM tran_ids_required)
        GROUP BY 1 )
        # Joining the cte’s to get the final table
        , final AS (
        SELECT
          a.products_name,
          IFNULL(_3D_Button_Clicks,0)   AS _3D_Button_Clicks,
          IFNULL(AR_Button_Clicks,0)    AS AR_Button_Clicks,
          IFNULL(products_purchased,0)  AS products_purchased,
          IFNULL(_3D_Button_Clicks,0) + IFNULL(AR_Button_Clicks,0) AS total_button_clicks,
          ROUND(IEEE_DIVIDE(IFNULL(products_purchased,0),IFNULL(_3D_Button_Clicks,0) +
        IFNULL(AR_Button_Clicks,0)) *100,2) AS product_conv_rate
        FROM
          all_products a
        LEFT JOIN
          ar_clicks b ON LOWER(a.products_name) =
        LOWER(b.page_title_product_name)
        LEFT JOIN
          _3d_clicks c ON LOWER(a.products_name) =
        LOWER(c.page_title_product_name)
        LEFT JOIN
          prodcuts_purchased_after_click_events   d ON  a.products_name = d.products_name
        ORDER BY _3D_Button_Clicks DESC
        )
        SELECT * FROM final  WHERE (total_button_clicks >0 OR products_purchased> 0) ORDER BY
        products_purchased DESC
`,
  analytics_311675532: `WITH
  -- This CTE Grabs all the product names from the items array
  all_products AS (
    SELECT DISTINCT
      CASE
        WHEN TRIM(i.item_name) = 'Modern sort spot  til loftudtag/lampeudtag' THEN CONCAT('Modern sort spot til loftudtag/lampeudtag',' - ',i.item_category)
        ELSE TRIM(CONCAT(i.item_name,' - ',i.item_category))
      END AS product_name
    FROM
      \`fast-lattice-421210.analytics_311675532.events_*\`, UNNEST(items) AS i
  ),
  -- This CTE Grabs all the two click events and their timestamp along with their session id for every user this will help identifying the purchases that take place after one of these events were triggered in that session
  click_events AS (
    SELECT DISTINCT
      user_pseudo_id,
      event_name,
      event_timestamp AS click_timestamp,
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id
    FROM
      \`fast-lattice-421210.analytics_311675532.events_*\`
    WHERE
      event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
  ),
  -- This CTE extracts the product name from the event parameter 'page_title' because there is not any parameter except this which provides us the product name.
  click_events_with_products AS (
    SELECT DISTINCT
      event_timestamp AS click_timestamp,
      user_pseudo_id,
      event_name,
      REGEXP_REPLACE(
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title'),
        r' - Dyberg Larsen$', ''
      ) AS page_title_product_name
    FROM
      \`fast-lattice-421210.analytics_311675532.events_*\`
    WHERE
      event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
  ),
  -- This CTE counts the number of times the 'charpstAR_AR_Button_Click' event was triggered
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
  -- This CTE counts the number of times the 'charpstAR_3D_Button_Click' event was triggered
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
  -- This CTE gets the transaction id once a purchase event happens for a user
  purchase AS (
    SELECT DISTINCT
      user_pseudo_id,
      event_timestamp,
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id') AS transaction_id
    FROM
      \`fast-lattice-421210.analytics_311675532.events_*\`
    WHERE
      event_name = 'purchase'
  ),
  -- This CTE accounts only those transaction id that are required i.e that happened after those click events in that session.
  tran_ids_required AS (
    SELECT DISTINCT purchase.transaction_id
    FROM click_events AS click
    INNER JOIN purchase AS purchase
      ON click.ga_session_id = purchase.ga_session_id
      AND click.user_pseudo_id = purchase.user_pseudo_id
      AND purchase.event_timestamp > click.click_timestamp
  ),
  -- This CTE grabs the product name with their transaction ids so that we know what was the name of the product that was purchased.
  products_purchased_cte AS (
    SELECT DISTINCT
      CASE
        WHEN TRIM(i.item_name) = 'Modern sort spot  til loftudtag/lampeudtag' THEN CONCAT('Modern sort spot til loftudtag/lampeudtag',' - ',i.item_category)
        ELSE TRIM(CONCAT(i.item_name,' - ',i.item_category))
      END AS product_name,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id') AS transaction_id
    FROM
      \`fast-lattice-421210.analytics_311675532.events_*\`, UNNEST(items) AS i
    WHERE
      event_name = 'purchase'
  ),
  -- In this CTE we have our final products that were being purchased after the click events along with the cleaned product names
  products_purchased_after_click_events AS (
    SELECT
      product_name,
      COUNT(DISTINCT transaction_id) AS purchases_with_service
    FROM
      products_purchased_cte
    WHERE
      transaction_id IN (SELECT DISTINCT transaction_id FROM tran_ids_required)
    GROUP BY product_name
  ),
  -- Total views per product
  total_views AS (
    SELECT
      TRIM(REGEXP_REPLACE(
        ep.value.string_value,
        r' - Dyberg Larsen$', ''
      )) AS product_name,
      COUNT(*) AS total_views
    FROM
      \`fast-lattice-421210.analytics_311675532.events_*\`,
      UNNEST(event_params) AS ep
    WHERE
      event_name = 'page_view'
      AND ep.key = 'page_title'
    GROUP BY TRIM(REGEXP_REPLACE(
      ep.value.string_value,
      r' - Dyberg Larsen$', ''
    ))
  ),
  -- Total purchases per product
  total_purchases AS (
    SELECT
      TRIM(CONCAT(i.item_name,' - ',i.item_category)) AS product_name,
      COUNT(DISTINCT (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id')) AS total_purchases
    FROM
      \`fast-lattice-421210.analytics_311675532.events_*\`, UNNEST(items) AS i
    WHERE
      event_name = 'purchase'
    GROUP BY TRIM(CONCAT(i.item_name,' - ',i.item_category))
  ),
  -- Default conversion rate calculation
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
  -- Joining the CTEs to get the final table
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
      COALESCE(dc.default_conv_rate, 0) AS default_conv_rate
    FROM all_products AS a
    LEFT JOIN ar_clicks AS b ON LOWER(a.product_name) = LOWER(b.page_title_product_name)
    LEFT JOIN _3d_clicks AS c ON LOWER(a.product_name) = LOWER(c.page_title_product_name)
    LEFT JOIN products_purchased_after_click_events AS d ON a.product_name = d.product_name
    LEFT JOIN default_conversion_rate AS dc ON LOWER(a.product_name) = LOWER(dc.product_name)
    WHERE COALESCE(c._3D_Button_Clicks, 0) + COALESCE(b.AR_Button_Clicks, 0) > 0
    ORDER BY d.purchases_with_service DESC
  )

SELECT * FROM final
WHERE total_button_clicks > 0 OR purchases_with_service > 0
`,

  analytics_351120479: `WITH
  all_products AS (
    SELECT DISTINCT TRIM(i.item_name) AS product_name
    FROM \`fast-lattice-421210.analytics_351120479.events_*\`, UNNEST(items) AS i
  ),
  click_events AS (
    SELECT DISTINCT
      user_pseudo_id,
      event_name,
      event_timestamp AS click_timestamp,
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id
    FROM \`fast-lattice-421210.analytics_351120479.events_*\`
    WHERE event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
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
    WHERE event_name IN ('charpstAR_AR_Button_Click', 'charpstAR_3D_Button_Click')
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
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id') AS transaction_id
    FROM \`fast-lattice-421210.analytics_351120479.events_*\`
    WHERE event_name = 'purchase'
  ),
  tran_ids_required AS (
    SELECT DISTINCT p.transaction_id
    FROM click_events AS c
    INNER JOIN purchases AS p
      ON c.ga_session_id = p.ga_session_id
      AND c.user_pseudo_id = p.user_pseudo_id
      AND p.event_timestamp > c.click_timestamp
  ),
  products_purchased_after_click_events AS (
    SELECT
      TRIM(i.item_name) AS product_name,
      COUNT(DISTINCT p.transaction_id) AS purchases_with_service
    FROM \`fast-lattice-421210.analytics_351120479.events_*\` AS e, UNNEST(items) AS i
    JOIN tran_ids_required AS p
      ON p.transaction_id = (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id')
    WHERE event_name = 'purchase'
    GROUP BY TRIM(i.item_name)
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
    WHERE event_name = 'purchase'
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
      COALESCE(dc.default_conv_rate, 0) AS default_conv_rate
    FROM all_products AS a
    LEFT JOIN ar_clicks AS b ON LOWER(a.product_name) = LOWER(b.page_title_product_name)
    LEFT JOIN _3d_clicks AS c ON LOWER(a.product_name) = LOWER(c.page_title_product_name)
    LEFT JOIN products_purchased_after_click_events AS d ON a.product_name = d.product_name
    LEFT JOIN default_conversion_rate AS dc ON LOWER(a.product_name) = LOWER(dc.product_name)
    WHERE COALESCE(c._3D_Button_Clicks, 0) + COALESCE(b.AR_Button_Clicks, 0) > 0
    ORDER BY d.purchases_with_service DESC
  )

SELECT * FROM final
WHERE total_button_clicks > 0 OR purchases_with_service > 0
`,
};
