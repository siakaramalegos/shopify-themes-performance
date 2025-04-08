# Core Web Vitals (CrUX) by Shopify Theme

Website built with 11ty and query ran on BigQuery.

How I built this site (architecture overview diagram): https://www.figma.com/board/AZAQlZcC3mvppHalTxnyAr/Theme-Vitals-architecture?node-id=0-1&t=Esm2i8h0uHUra2eA-1

Monthly process:

1. In BigQuery, run **queries/archive_pages.sql** (with the latest month changed on line 10), saving as a temporary table. In the UI, open up that table and click "query" to get the table name.
2. Run the query from **queries/crux_data.sql** in BigQuery. Use the temporary table name on line 17. Don't forget to update the date on line 151. Export as JSON. Add new data file to `/_raw_data/` with a filename of `YYYY_MM.json`.
3. Run the query from **queries/theme_versions.sql** in BigQuery. Update the temporary table name. Export as JSON. Add new data file to `/_raw_versions_data/` with a filename of `YYYY_MM.json`.
4. Process the data by running `npm run process`. Note anything out of the ordinary logged to the CLI. Ignore unconfirmed themes with ID's below about 2000 - most of those are junk. Add any real new themes (confirm on theme store) to the `currentThemes.json` file.
5. Start the dev server with `npm start` and confirm everything looks good before deploying.

Payment links:

- Monthly: https://buy.stripe.com/aEU00N9hg5BoeLSaEE
- Yearly: https://buy.stripe.com/6oE6pb1OOgg20V29AB

