# Legacy page generator (retired)

These scripts used to generate the site's HTML pages. They are out of date: the pages have since been
edited directly (new prices, photos, SEO text, privacy page, the price guide post and more), so running
the generator would overwrite those edits with old content and fail on renamed images.

**Edit the `.html` files directly.** `npm run pages` now exits with a message. The old command is kept as
`npm run pages:legacy` for reference only. Do not run it unless you intend to rebuild every page.
