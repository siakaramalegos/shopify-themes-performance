-- Original mega query, now run in 3 separate queries
-- Core web vitals by Shopify theme
CREATE TEMP FUNCTION IS_GOOD (good FLOAT64, needs_improvement FLOAT64, poor FLOAT64) RETURNS BOOL AS (
  good / (good + needs_improvement + poor) >= 0.75
);

CREATE TEMP FUNCTION IS_POOR (good FLOAT64, needs_improvement FLOAT64, poor FLOAT64) RETURNS BOOL AS (
  poor / (good + needs_improvement + poor) > 0.25
);

CREATE TEMP FUNCTION IS_NON_ZERO (good FLOAT64, needs_improvement FLOAT64, poor FLOAT64) RETURNS BOOL AS (
  good + needs_improvement + poor > 0
);

-- All Shopify shops in HTTPArchive
WITH archive_pages AS (
    SELECT
      client,
      page AS url,
      TO_JSON_STRING(custom_metrics.ecommerce.Shopify.theme.schema_name) AS theme_schema_name, --when querying prior to Nov 2024, use theme.name instead
      TO_JSON_STRING(custom_metrics.ecommerce.Shopify.theme.theme_store_id) AS theme_store_id,
    FROM `httparchive.crawl.pages`
    WHERE
      date = '2025-01-01'AND
      is_root_page AND
      custom_metrics.ecommerce.Shopify.theme.name IS NOT NULL --This is just a check for it being a theme. Maybe we should check that Shopify is not null instead? Or Shopify.theme. (first grab all shops for market share)
)

SELECT
  client,
  archive_pages.theme_store_id AS id,
  theme_names.theme_schema_name AS top_theme_name,
  COUNT(DISTINCT origin) AS origins,
  -- Origins with good LCP divided by origins with any LCP.
  SAFE_DIVIDE(
    COUNT(DISTINCT IF(IS_GOOD(fast_lcp, avg_lcp, slow_lcp), origin, NULL)),
    COUNT(DISTINCT IF(IS_NON_ZERO(fast_lcp, avg_lcp, slow_lcp), origin, NULL))) AS pct_good_lcp,
  -- Origins with needs improvement are anything not good, nor poor.
  1 -
    SAFE_DIVIDE(
      COUNT(DISTINCT IF(IS_GOOD(fast_lcp, avg_lcp, slow_lcp), origin, NULL)),
      COUNT(DISTINCT IF(IS_NON_ZERO(fast_lcp, avg_lcp, slow_lcp), origin, NULL)))
    -
    SAFE_DIVIDE(
      COUNT(DISTINCT IF(IS_POOR(fast_lcp, avg_lcp, slow_lcp), origin, NULL)),
      COUNT(DISTINCT IF(IS_NON_ZERO(fast_lcp, avg_lcp, slow_lcp), origin, NULL)))
    AS pct_ni_lcp,
  -- Origins with poor LCP divided by origins with any LCP.
  SAFE_DIVIDE(
    COUNT(DISTINCT IF(IS_POOR(fast_lcp, avg_lcp, slow_lcp), origin, NULL)),
    COUNT(DISTINCT IF(IS_NON_ZERO(fast_lcp, avg_lcp, slow_lcp), origin, NULL))) AS pct_poor_lcp,

  -- Origins with good TTFB divided by origins with any TTFB.
  SAFE_DIVIDE(
    COUNT(DISTINCT IF(IS_GOOD(fast_ttfb, avg_ttfb, slow_ttfb), origin, NULL)),
    COUNT(DISTINCT IF(IS_NON_ZERO(fast_ttfb, avg_ttfb, slow_ttfb), origin, NULL))) AS pct_good_ttfb,
  -- Origins with needs improvement are anything not good, nor poor.
  1 -
    SAFE_DIVIDE(
      COUNT(DISTINCT IF(IS_GOOD(fast_ttfb, avg_ttfb, slow_ttfb), origin, NULL)),
      COUNT(DISTINCT IF(IS_NON_ZERO(fast_ttfb, avg_ttfb, slow_ttfb), origin, NULL)))
    -
    SAFE_DIVIDE(
      COUNT(DISTINCT IF(IS_POOR(fast_ttfb, avg_ttfb, slow_ttfb), origin, NULL)),
      COUNT(DISTINCT IF(IS_NON_ZERO(fast_ttfb, avg_ttfb, slow_ttfb), origin, NULL)))
    AS pct_ni_ttfb,
  -- Origins with poor TTFB divided by origins with any TTFB.
  SAFE_DIVIDE(
    COUNT(DISTINCT IF(IS_POOR(fast_ttfb, avg_ttfb, slow_ttfb), origin, NULL)),
    COUNT(DISTINCT IF(IS_NON_ZERO(fast_ttfb, avg_ttfb, slow_ttfb), origin, NULL))) AS pct_poor_ttfb,

    -- Origins with good FCP divided by origins with any FCP.
  SAFE_DIVIDE(
    COUNT(DISTINCT IF(IS_GOOD(fast_fcp, avg_fcp, slow_fcp), origin, NULL)),
    COUNT(DISTINCT IF(IS_NON_ZERO(fast_fcp, avg_fcp, slow_fcp), origin, NULL))) AS pct_good_fcp,
  -- Origins with needs improvement are anything not good, nor poor.
  1 -
    SAFE_DIVIDE(
      COUNT(DISTINCT IF(IS_GOOD(fast_fcp, avg_fcp, slow_fcp), origin, NULL)),
      COUNT(DISTINCT IF(IS_NON_ZERO(fast_fcp, avg_fcp, slow_fcp), origin, NULL)))
    -
    SAFE_DIVIDE(
      COUNT(DISTINCT IF(IS_POOR(fast_fcp, avg_fcp, slow_fcp), origin, NULL)),
      COUNT(DISTINCT IF(IS_NON_ZERO(fast_fcp, avg_fcp, slow_fcp), origin, NULL)))
    AS pct_ni_fcp,
  -- Origins with poor FCP divided by origins with any FCP.
  SAFE_DIVIDE(
    COUNT(DISTINCT IF(IS_POOR(fast_fcp, avg_fcp, slow_fcp), origin, NULL)),
    COUNT(DISTINCT IF(IS_NON_ZERO(fast_fcp, avg_fcp, slow_fcp), origin, NULL))) AS pct_poor_fcp,

  -- Origins with good INP divided by origins with any INP.
  SAFE_DIVIDE(
    COUNT(DISTINCT IF(IS_GOOD(fast_inp, avg_inp, slow_inp), origin, NULL)),
    COUNT(DISTINCT IF(IS_NON_ZERO(fast_inp, avg_inp, slow_inp), origin, NULL))) AS pct_good_inp,
  -- Origins with needs improvement are anything not good, nor poor.
  1 -
    SAFE_DIVIDE(
      COUNT(DISTINCT IF(IS_GOOD(fast_inp, avg_inp, slow_inp), origin, NULL)),
      COUNT(DISTINCT IF(IS_NON_ZERO(fast_inp, avg_inp, slow_inp), origin, NULL)))
    -
    SAFE_DIVIDE(
      COUNT(DISTINCT IF(IS_POOR(fast_inp, avg_inp, slow_inp), origin, NULL)),
      COUNT(DISTINCT IF(IS_NON_ZERO(fast_inp, avg_inp, slow_inp), origin, NULL)))
    AS pct_ni_inp,
  -- Origins with poor INP divided by origins with any INP.
  SAFE_DIVIDE(
    COUNT(DISTINCT IF(IS_POOR(fast_inp, avg_inp, slow_inp), origin, NULL)),
    COUNT(DISTINCT IF(IS_NON_ZERO(fast_inp, avg_inp, slow_inp), origin, NULL))) AS pct_poor_inp,

  -- Origins with good CLS divided by origins with any CLS.
  SAFE_DIVIDE(
    COUNT(DISTINCT IF(IS_GOOD(small_cls, medium_cls, large_cls), origin, NULL)),
    COUNT(DISTINCT IF(IS_NON_ZERO(small_cls, medium_cls, large_cls), origin, NULL))) AS pct_good_cls,
  -- Origins with needs improvement are anything not good, nor poor.
  1 -
    SAFE_DIVIDE(
      COUNT(DISTINCT IF(IS_GOOD(small_cls, medium_cls, large_cls), origin, NULL)),
      COUNT(DISTINCT IF(IS_NON_ZERO(small_cls, medium_cls, large_cls), origin, NULL)))
    -
    SAFE_DIVIDE(
      COUNT(DISTINCT IF(IS_POOR(small_cls, medium_cls, large_cls), origin, NULL)),
      COUNT(DISTINCT IF(IS_NON_ZERO(small_cls, medium_cls, large_cls), origin, NULL)))
    AS pct_ni_cls,
  -- Origins with poor CLS divided by origins with any CLS.
  SAFE_DIVIDE(
    COUNT(DISTINCT IF(IS_POOR(small_cls, medium_cls, large_cls), origin, NULL)),
    COUNT(DISTINCT IF(IS_NON_ZERO(small_cls, medium_cls, large_cls), origin, NULL))) AS pct_poor_cls,

  -- Origins with good LCP, INP (optional), and CLS divided by origins with any LCP and CLS.
  SAFE_DIVIDE(
    COUNT(DISTINCT IF(
      IS_GOOD(fast_lcp, avg_lcp, slow_lcp) AND
      IS_GOOD(fast_inp, avg_inp, slow_inp) IS NOT FALSE AND
      IS_GOOD(small_cls, medium_cls, large_cls), origin, NULL)),
    COUNT(DISTINCT IF(
      IS_NON_ZERO(fast_lcp, avg_lcp, slow_lcp) AND
      IS_NON_ZERO(small_cls, medium_cls, large_cls), origin, NULL))) AS pct_good_cwv
FROM
  `chrome-ux-report.materialized.device_summary`
JOIN archive_pages
ON
  CONCAT(origin, '/') = url AND
  IF(device = 'desktop', 'desktop', 'mobile') = client
JOIN (
  -- Add in top theme name for a theme store id as this should usually be the real theme name
  SELECT
    COUNT(DISTINCT url) as pages_count,
    theme_store_id,
    theme_schema_name,
    row_number() over (partition by theme_store_id order by COUNT(DISTINCT url) desc) as rank
  FROM archive_pages
  GROUP BY
    theme_store_id,
    theme_schema_name
  ORDER BY COUNT(DISTINCT url) DESC
) theme_names
-- Include null theme store ids so that we can get full market share within CrUX
ON IFNULL(theme_names.theme_store_id, 'N/A') = IFNULL(archive_pages.theme_store_id, 'N/A')
WHERE
  date = '2025-01-01' AND
  theme_names.rank = 1
GROUP BY
  client,
  id,
  top_theme_name
ORDER BY
  origins DESC
