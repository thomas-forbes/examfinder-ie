# Exam data scraper

Scrapes the examinations.ie exam material archive into
`apps/web/public/data.json`. Requires Bun and the repository dependencies;
run `pnpm install --frozen-lockfile` from the repository root first.

Run scraper commands from `packages/data`, because data paths are relative to
the working directory.

## Using an existing Chrome session when Turnstile loops

On November 1, 2026, ordinary Chrome could complete Turnstile while Chrome
launched by Puppeteer kept looping. The workflow below lets you complete the
challenge manually before attaching Puppeteer to the same browser and tab.

1. On macOS, launch installed Google Chrome with a dedicated profile and a
   local debugging port:

   ```sh
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
     --remote-debugging-port=9222 \
     --user-data-dir="$HOME/.examfinder-chrome" \
     "https://www.examinations.ie/exammaterialarchive/"
   ```

2. Complete Turnstile manually in that Chrome window. Wait until the exam
   archive appears, and leave its tab open.

3. In a second terminal, from the repository root:

   ```sh
   cd packages/data
   SCRAPE_BROWSER_URL=http://127.0.0.1:9222 bun run scrape
   ```

The scraper connects with `puppeteer.connect()`, reuses the archive tab without
reloading it, and checks the archive agreement checkbox if needed. It disconnects
when finished, leaving Chrome open. Close that dedicated Chrome window manually
when done; the profile remains available for future runs.

### Troubleshooting

- **Turnstile loops before attaching:** the manually launched session is still
  being challenged. Complete the challenge successfully before running the
  scraper; attaching does not solve it automatically.
- **Cannot connect to port 9222:** confirm the dedicated Chrome process is still
  running. If that profile was already open without debugging enabled, close
  its windows and relaunch with the command above.
- **Archive tab not found:** open the exact archive URL above in the dedicated
  Chrome window, complete Turnstile, and rerun the scraper.
- **Challenge returns during scraping:** the site can challenge subsequent
  requests. This workflow does not guarantee that the session stays cleared.

## Regular automated launch

If the site accepts a Puppeteer-launched browser, run from this directory:

```sh
pnpm exec puppeteer browsers install chrome
bun run scrape
```

Without `SCRAPE_BROWSER_URL`, the scraper launches and closes its own browser.
Scrape settings (`HEADLESS`, `ONLY_CURRENT_YEAR`, `SKIP_FILLED`, and pacing) live
in `CONFIG` in `scraper.ts`. Data is saved after each subject; empty results are
skipped to preserve existing entries. Review the `data.json` diff before committing.
