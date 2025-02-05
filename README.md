# Core Web Vitals (CrUX) by Shopify Theme

Website built with 11ty and query ran on BigQuery.

Monthly process:

1. Run the query from `query.sql` in BigQuery. Don't forget to change the dates (lines 23 and 159).
1. Add new data file to `/_raw_data/` with a filename of `YYYY_MM.json` (remember to use the previous month as data is published the month after).
2. Process the data by running `npm run process`. Note anything out of the ordinary logged to the CLI. Ignore unconfirmed themes with ID's below about 2000 - most of those are junk. Add any real new themes (confirm on theme store) to the `currentThemes.json` file.
3. Start the dev server with `npm start` and confirm everything looks good before deploying.

Payment links:

- Monthly: https://buy.stripe.com/aEU00N9hg5BoeLSaEE
- Yearly: https://buy.stripe.com/6oE6pb1OOgg20V29AB

