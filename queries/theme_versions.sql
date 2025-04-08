-- Change temp table address
SELECT
  theme_schema_name AS theme_name,
  theme_store_id AS theme_id,
  schema_version AS theme_version,
  COUNT(DISTINCT url) as count
FROM `httparchive-bigquery-316519._d6e68ddfa7b6887fe2c9264d97e893d71ae496c7.anonc8f0f89d35c4017b01bef661d51846f345fb843f8e9f02e0602e78e357a92535`
WHERE theme_schema_name IS NOT NULL AND theme_store_id IS NOT NULL AND schema_version IS NOT NULL
GROUP BY theme_schema_name, theme_store_id, schema_version
-- HAVING COUNT(DISTINCT url) > 1
ORDER BY theme_schema_name ASC, theme_store_id ASC, schema_version ASC
