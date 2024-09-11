# Core Web Vitals (CrUX) by Shopify Theme

Website built with 11ty and query ran on BigQuery.

Monthly process:

1. Add new data file to `/_raw_data/` with a filename of `YYYY_MM.json`.
2. Process the data by running `npm run process`. Note anything out of the ordinary logged to the CLI.
3. Start the dev server with `npm start` and confirm everything looks good before deploying.
