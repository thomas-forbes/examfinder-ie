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

#### Local Scraping (Development)

Run the data scraper locally:

```bash
pnpm scrape
```

This will scrape exam data and save it to `apps/web/public/data.json`.

#### Production Deployment

The scraper runs automatically in production via Railway + Upstash QStash. See [DEPLOYMENT.md](./DEPLOYMENT.md) for setup instructions.

**Quick Setup:**
1. Deploy scraper service to Railway
2. Configure Upstash QStash cron job  
3. Scraper runs daily at 3 AM UTC from Ireland region

See detailed deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

## Packages

### @examfinder/web

The main Next.js web application that displays exam papers and marking schemes.

### @examfinder/data

Original data scraper package (for local development).

### @examfinder/scraper-service

Production scraper service - Express server with Puppeteer that runs on Railway and is triggered by Upstash QStash cron jobs from Ireland (EU-West-1).

## License

Private
