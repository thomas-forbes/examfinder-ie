# ExamFinder Ireland - Deployment Guide

This guide explains how to deploy the scraper service to Railway and set up automated scraping with Upstash QStash from Ireland (EU-West-1).

## Architecture

- **Railway**: Hosts the Dockerized scraper service with Puppeteer
- **Upstash QStash**: Triggers the scraper on a schedule from Ireland region
- **AWS S3** (optional): Stores scraped data backups

## Why This Setup?

✅ **Region-specific scraping**: QStash can be configured to send requests from Ireland  
✅ **No infrastructure management**: Railway handles all the complexity  
✅ **Cost-effective**: Railway charges only when running (~$5-10/month)  
✅ **Puppeteer-friendly**: Full Chrome browser support  
✅ **Simple**: No VPC, ECS, or complex AWS setup needed

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Upstash Account**: Sign up at [upstash.com](https://upstash.com)
3. **GitHub Account**: For Railway deployment
4. **AWS Account** (optional): For S3 data backups

## Step 1: Deploy to Railway

### 1.1 Push Code to GitHub

```bash
git add .
git commit -m "Add scraper service"
git push origin main
```

### 1.2 Create Railway Project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect the Dockerfile

### 1.3 Configure Railway Service

1. **Set Root Directory**:
   - Go to Settings → Root Directory
   - Set to: `packages/scraper-service`

2. **Add Environment Variables**:
   - Go to Variables tab
   - Add these variables:

   ```env
   PORT=3001
   NODE_ENV=production
   LOG_LEVEL=info
   CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
   OUTPUT_PATH=/app/data/data.json
   MANUAL_TRIGGER_SECRET=<generate-random-string>
   ```

3. **Select Region**:
   - Go to Settings → Region
   - Select **Europe (Frankfurt)** or **Europe (Paris)** (closest to Ireland)
   - Note: Railway doesn't have Ireland, but Frankfurt/Paris are close

4. **Generate Domain**:
   - Go to Settings → Networking
   - Click "Generate Domain"
   - Copy the domain (e.g., `your-service.up.railway.app`)

### 1.4 Deploy

Railway will automatically build and deploy. Monitor logs to ensure it starts successfully.

Test the health endpoint:
```bash
curl https://your-service.up.railway.app/health
```

## Step 2: Set Up Upstash QStash

### 2.1 Create QStash Account

1. Go to [console.upstash.com](https://console.upstash.com)
2. Navigate to **QStash** section
3. Copy your QStash credentials:
   - `QSTASH_TOKEN`
   - `QSTASH_CURRENT_SIGNING_KEY`
   - `QSTASH_NEXT_SIGNING_KEY`

### 2.2 Add QStash Credentials to Railway

Go back to Railway and add these environment variables:

```env
QSTASH_CURRENT_SIGNING_KEY=<from-upstash>
QSTASH_NEXT_SIGNING_KEY=<from-upstash>
QSTASH_TOKEN=<from-upstash>
```

Railway will automatically redeploy.

### 2.3 Create Scheduled Job

Using the QStash Dashboard or API:

#### Option A: Using Dashboard

1. Go to [console.upstash.com/qstash](https://console.upstash.com/qstash)
2. Click **"Create Schedule"**
3. Configure:
   - **Destination**: `https://your-service.up.railway.app/scrape`
   - **Schedule**: `0 3 * * *` (daily at 3 AM UTC)
   - **Method**: `POST`
   - **Headers**: `Content-Type: application/json`
   - **Body**: `{}`

#### Option B: Using API

```bash
curl -X POST https://qstash.upstash.io/v2/schedules \
  -H "Authorization: Bearer <QSTASH_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "https://your-service.up.railway.app/scrape",
    "cron": "0 3 * * *",
    "body": "{}",
    "headers": {
      "Content-Type": "application/json"
    }
  }'
```

**Note**: QStash automatically routes requests through their Ireland edge location when targeting European endpoints.

## Step 3: Optional - AWS S3 Backup

If you want to backup scraped data to S3:

### 3.1 Create S3 Bucket

```bash
aws s3 mb s3://examfinder-data-ireland --region eu-west-1
```

### 3.2 Create IAM User

Create an IAM user with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::examfinder-data-ireland",
        "arn:aws:s3:::examfinder-data-ireland/*"
      ]
    }
  ]
}
```

### 3.3 Add AWS Credentials to Railway

```env
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
S3_BUCKET=examfinder-data-ireland
```

## Step 4: Testing

### Test Manual Trigger

```bash
curl -X POST https://your-service.up.railway.app/scrape/manual \
  -H "x-manual-secret: <your-manual-secret>"
```

### View Logs

In Railway dashboard, go to the **Deployments** tab and click on the latest deployment to view logs.

### Verify QStash Schedule

```bash
curl https://qstash.upstash.io/v2/schedules \
  -H "Authorization: Bearer <QSTASH_TOKEN>"
```

## Monitoring

### Railway Logs

View real-time logs in the Railway dashboard or use CLI:

```bash
railway logs
```

### QStash Logs

Check the QStash dashboard for:
- Request success/failure
- Response times
- Error messages

### S3 Data

If S3 is configured, check for:
- `data.json` (latest scrape)
- `backups/data-<timestamp>.json` (historical backups)

```bash
aws s3 ls s3://examfinder-data-ireland/ --recursive
aws s3 cp s3://examfinder-data-ireland/data.json ./data.json
```

## Cost Estimates

- **Railway**: ~$5-10/month (depends on usage)
- **Upstash QStash**: Free tier (500 requests/day, plenty for daily scraping)
- **AWS S3**: ~$0.50/month (for data storage)

**Total**: ~$5-11/month

## Troubleshooting

### Scraper Times Out

- Increase Railway timeout (Pro plan)
- Reduce `ONLY_CURRENT_YEAR` to true in scraper config

### Memory Issues

- Increase Railway memory allocation
- Optimize Puppeteer settings

### QStash Signature Verification Fails

- Ensure `QSTASH_CURRENT_SIGNING_KEY` and `QSTASH_NEXT_SIGNING_KEY` are correctly set
- Check QStash dashboard for key rotation

### Connection Errors

- Verify Railway domain is publicly accessible
- Check Railway logs for startup errors

## Updating the Scraper

1. Make changes to code
2. Commit and push to GitHub
3. Railway automatically rebuilds and deploys

## Cleanup

### Delete Railway Service
```bash
railway down
```

### Delete QStash Schedule
Use QStash dashboard or:
```bash
curl -X DELETE https://qstash.upstash.io/v2/schedules/<schedule-id> \
  -H "Authorization: Bearer <QSTASH_TOKEN>"
```

### Delete S3 Bucket
```bash
aws s3 rb s3://examfinder-data-ireland --force
```

## Alternative: Google Cloud Run

If you prefer Google Cloud Run (has Ireland region):

1. Build and push Docker image to Google Container Registry
2. Deploy to Cloud Run in `europe-west1` (Belgium, closest to Ireland)
3. Use QStash to trigger the Cloud Run endpoint

See `CLOUD_RUN.md` for detailed instructions (if needed).

## Security Notes

1. **Never commit `.env` files** - Use Railway's environment variables
2. **Rotate secrets regularly** - QStash keys, manual trigger secret, AWS credentials
3. **Enable QStash signature verification** - Already implemented in the code
4. **Use HTTPS only** - Railway provides this by default

## Support

For issues:
- Railway: [docs.railway.app](https://docs.railway.app)
- Upstash: [docs.upstash.com](https://docs.upstash.com)
- This project: Open an issue on GitHub