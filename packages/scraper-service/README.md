# ExamFinder Scraper Service

A standalone Express server that scrapes exam data from examinations.ie using Puppeteer. Designed to run on Railway and be triggered by Upstash QStash cron jobs.

## Features

- 🚀 **Express API server** with health checks
- 🤖 **Puppeteer-based scraping** with Chrome
- 🔒 **QStash signature verification** for security
- 📦 **S3 backup support** (optional)
- 🐳 **Docker-ready** for Railway deployment
- 📊 **Structured logging** with Pino

## Endpoints

### `GET /health`
Health check endpoint - returns service status.

**Response:**
```json
{
  "status": "ok",
  "service": "examfinder-scraper"
}
```

### `POST /scrape`
Main scraping endpoint - protected by QStash signature verification.

**Headers:**
- `upstash-signature`: QStash signature for verification

**Response:**
```json
{
  "success": true,
  "message": "Scraping completed successfully",
  "duration": 45000,
  "timestamp": "2025-09-30T12:00:00.000Z"
}
```

### `POST /scrape/manual`
Manual trigger endpoint for testing (requires secret).

**Headers:**
- `x-manual-secret`: Manual trigger secret

**Response:**
```json
{
  "success": true,
  "message": "Manual scraping completed successfully",
  "duration": 45000,
  "timestamp": "2025-09-30T12:00:00.000Z"
}
```

## Local Development

### Prerequisites

- Node.js 20+
- Chrome/Chromium installed

### Install Dependencies

```bash
npm install
```

### Set Environment Variables

Create a `.env` file:

```env
PORT=3001
LOG_LEVEL=info
OUTPUT_PATH=./data/data.json
MANUAL_TRIGGER_SECRET=test-secret
```

### Run Development Server

```bash
npm run dev
```

### Test Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Manual scrape
curl -X POST http://localhost:3001/scrape/manual \
  -H "x-manual-secret: test-secret"
```

## Docker Build

```bash
# Build image
docker build -t examfinder-scraper .

# Run container
docker run -p 3001:3001 \
  -e MANUAL_TRIGGER_SECRET=test-secret \
  examfinder-scraper
```

## Deployment

See [DEPLOYMENT.md](../../DEPLOYMENT.md) in the root directory for complete deployment instructions.

### Quick Deploy to Railway

1. Push to GitHub
2. Connect Railway to your repo
3. Set root directory to `packages/scraper-service`
4. Add environment variables
5. Deploy!

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | Environment (production/development) |
| `LOG_LEVEL` | No | Logging level (info/debug/error) |
| `OUTPUT_PATH` | No | Local file path for scraped data |
| `QSTASH_CURRENT_SIGNING_KEY` | Yes (prod) | QStash signature key |
| `QSTASH_NEXT_SIGNING_KEY` | Yes (prod) | QStash next signature key |
| `MANUAL_TRIGGER_SECRET` | Yes | Secret for manual triggers |
| `AWS_REGION` | No | AWS region for S3 (default: eu-west-1) |
| `AWS_ACCESS_KEY_ID` | No | AWS access key for S3 |
| `AWS_SECRET_ACCESS_KEY` | No | AWS secret key for S3 |
| `S3_BUCKET` | No | S3 bucket name for backups |
| `CHROME_EXECUTABLE_PATH` | No | Path to Chrome binary |

## Architecture

```
┌─────────────┐
│ Upstash     │
│ QStash      │ ──cron (daily 3AM)──┐
└─────────────┘                     │
                                    ▼
                            ┌──────────────┐
                            │ Railway      │
                            │              │
                            │ Express      │
                            │ + Puppeteer  │
                            └──────────────┘
                                    │
                                    ├──────▶ S3 (backup)
                                    │
                                    └──────▶ Local storage
```

## Security

- **QStash Signature Verification**: All `/scrape` requests verify QStash signatures
- **Manual Secret**: Manual triggers require a secret header
- **No Public Access**: Only QStash can trigger scraping (unless manual secret is known)

## Monitoring

- View logs in Railway dashboard
- Check QStash dashboard for request history
- Monitor S3 bucket for successful uploads

## Troubleshooting

### Puppeteer Fails to Launch

- Ensure Chrome is installed in the Docker image
- Check `CHROME_EXECUTABLE_PATH` is correct
- Verify Puppeteer args include `--no-sandbox`

### QStash Signature Fails

- Ensure `QSTASH_CURRENT_SIGNING_KEY` and `QSTASH_NEXT_SIGNING_KEY` are set
- Check QStash dashboard for key rotation
- Verify request is coming from QStash

### Out of Memory

- Increase Railway memory allocation
- Reduce scraping scope (fewer years/subjects)

## License

Private