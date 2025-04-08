-- Run this first and save to a temporary table. Change the date on line 10.
SELECT
  client,
  page AS url,
  TO_JSON_STRING(custom_metrics.ecommerce.Shopify.theme.schema_name) AS theme_schema_name, --when querying prior to Nov 2024, use theme.name instead
  TO_JSON_STRING(custom_metrics.ecommerce.Shopify.theme.theme_store_id) AS theme_store_id,
  TO_JSON_STRING(custom_metrics.ecommerce.Shopify.theme.schema_version) AS schema_version,
FROM `httparchive.crawl.pages`
WHERE
  date = '2025-03-01'AND
  is_root_page AND
  custom_metrics.ecommerce.Shopify.theme.name IS NOT NULL --This is just a check for it being a theme. Maybe we should check that Shopify is not null instead? Or Shopify.theme. (first grab all shops for market share)
