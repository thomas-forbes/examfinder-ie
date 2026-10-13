# ExamFinder Ireland - Monorepo

This is a pnpm monorepo for ExamFinder Ireland.

## Structure

```
examfinder-ie/
├── apps/
│   └── web/              # Next.js web application (@examfinder/web)
│       ├── src/
│       ├── public/
│       └── package.json
├── packages/
│   └── data/             # Data scraper package (@examfinder/data)
│       ├── scraper.ts
│       ├── helpers.ts
│       └── package.json
├── package.json          # Root package.json
└── pnpm-workspace.yaml   # Workspace configuration
```

## Getting Started

### Install Dependencies

Use Node.js 24 and pnpm 10.34.7 (pinned in `package.json`). The scraper also
requires Bun 1.4.2 or newer. Install from the repository root so both workspace
packages share `pnpm-lock.yaml`; do not generate a separate Bun lockfile.

```bash
pnpm install --frozen-lockfile
```

### Development

Run the Next.js development server:

```bash
pnpm dev
```

### Build

Build the web app for production:

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

### Scrape Exam Data

Run the data scraper:

```bash
pnpm scrape
```

This will scrape exam data and save it to `apps/web/public/data.json`.

### Verification

```bash
pnpm exec playwright install chromium
pnpm --filter @examfinder/data exec puppeteer browsers install chrome
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:trace
pnpm test:e2e
pnpm audit --prod --audit-level high
```

The unit tests generate PDF fixtures in memory and test scraper helpers against
local HTML and temporary JSON files. They do not scrape examinations.ie or update
the checked-in exam data. Browser tests run the production build in isolated
desktop and mobile Chromium contexts, block external requests, and check paper
filters, persisted preferences, points calculations, navigation and page overflow.
`pnpm build` must run before `pnpm test:e2e`.
`pnpm test:trace` reconstructs the PDF route from its traced deployment files
in a temporary directory and verifies that it loads without the full workspace
dependency tree, catching missing serverless runtime packages.

Next.js 16 uses the ESLint CLI and Tailwind 4 uses `@tailwindcss/postcss`.
The PDF endpoint uses the maintained `@muhammara/native` package; its install
script is explicitly allowed in `pnpm-workspace.yaml` so native prebuilds are
available on supported platforms. Browser downloads remain explicit.

## Packages

### @examfinder/web

The main Next.js web application that displays exam papers and marking schemes.

### @examfinder/data

Data scraper that fetches exam information from examinations.ie using Puppeteer.

## License

Private
