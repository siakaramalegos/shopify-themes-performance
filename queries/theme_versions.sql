SELECT
  theme_schema_name AS theme_name,
  theme_store_id AS theme_id,
  schema_version AS theme_version,
  COUNT(DISTINCT url) as count
FROM `httparchive-bigquery-316519._d6e68ddfa7b6887fe2c9264d97e893d71ae496c7.anon561f1875a18cc77b03df56b6bb7dc218d0befdf3b69f7454d28e26a95ffdf9d7`
WHERE theme_schema_name != 'null' AND theme_store_id != 'null' AND schema_version != 'null'
GROUP BY theme_schema_name, theme_store_id, schema_version
-- HAVING COUNT(DISTINCT url) > 1
ORDER BY theme_schema_name ASC, theme_store_id ASC, schema_version ASC
