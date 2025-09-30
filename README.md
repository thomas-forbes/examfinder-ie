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

```bash
pnpm install
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

## Packages

### @examfinder/web

The main Next.js web application that displays exam papers and marking schemes.

### @examfinder/data

Data scraper that fetches exam information from examinations.ie using Puppeteer.

## License

Private
