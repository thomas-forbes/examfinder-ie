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

The scraper runs automatically in production via **GitHub Actions + Railway**.

**Quick Setup:**
1. Deploy scraper service to Railway
2. Add Railway URL and secret to GitHub Secrets
3. GitHub Actions triggers scraper daily at 3 AM UTC
4. Scraped data auto-commits to repo
5. Site auto-deploys with updated data

**Deployment Options:**
- **🌟 Recommended**: [GitHub Actions + Railway](./DEPLOYMENT-GITHUB-ACTIONS.md) - Simplest, auto-commits to git
- **Alternative**: [Upstash QStash + Railway](./DEPLOYMENT.md) - HTTP-only triggers

See detailed deployment guide: [DEPLOYMENT-GITHUB-ACTIONS.md](./DEPLOYMENT-GITHUB-ACTIONS.md)

## Packages

### @examfinder/web

The main Next.js web application that displays exam papers and marking schemes.

### @examfinder/data

Original data scraper package (for local development).

### @examfinder/scraper-service

Production scraper service - Express server with Puppeteer that runs on Railway and is triggered by Upstash QStash cron jobs from Ireland (EU-West-1).

## License

Private
