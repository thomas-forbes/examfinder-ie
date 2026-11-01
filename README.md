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

### Requirements

Use Node.js 24 (`nvm use`) and the pinned pnpm version via Corepack.
The scraper also requires Bun. Install all dependencies from the repository root;
`pnpm-lock.yaml` is the shared lockfile for both packages.

### Install Dependencies

```bash
corepack enable
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

### Validation

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm audit
```

### Dependency compatibility

- Tailwind stays on v3.4 with `tailwind-merge` v2, which supports its class names.
  Tailwind v4 requires a separate styling and browser compatibility migration.
- TypeScript stays on v6 and ESLint on v9 to satisfy the lint plugins' peer ranges.
- pnpm stays on its updated v10 line to preserve the workspace configuration.
- `muhammara` has been replaced by its maintained successor, `@muhammara/native`.
- Two moderate `minimatch` audit findings remain in ESLint/TypeScript lint tooling.
  Their fix requires a major transitive upgrade; no incompatible override is applied.
- Lint reports existing hook/unused-variable warnings. New React Compiler effect
  and purity diagnostics are warnings during this dependency migration.

### Scrape Exam Data

Install the browser used by Puppeteer, then run the data scraper:

```bash
pnpm --filter @examfinder/data exec puppeteer browsers install chrome
```

```bash
pnpm scrape
```

This will scrape exam data and save it to `apps/web/public/data.json`.

## Packages

### @examfinder/web

The main Next.js web application that displays exam papers and marking schemes.

### @examfinder/data

Data scraper that fetches exam information from examinations.ie using Puppeteer.

## License

Private
