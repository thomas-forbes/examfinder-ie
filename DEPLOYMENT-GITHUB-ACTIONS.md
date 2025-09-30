# ExamFinder Ireland - GitHub Actions + Railway Deployment

This guide shows how to deploy the scraper using **GitHub Actions + Railway** - the simplest and most integrated approach.

## Architecture

```
GitHub Actions (scheduled cron)
    ↓
Triggers Railway scraper (Ireland-adjacent region)
    ↓
Railway scrapes with Puppeteer
    ↓
Returns JSON data to GitHub Actions
    ↓
GitHub Actions commits data.json to repo
    ↓
Vercel/Netlify auto-deploys updated site
```

## Why This Approach?

✅ **No credential storage** - Uses built-in `GITHUB_TOKEN`  
✅ **Auto-commits** - Scraped data commits directly to repo  
✅ **Version control** - All data changes tracked in git  
✅ **Simple** - Just 2 secrets needed (Railway URL + secret)  
✅ **Free GitHub Actions** - 2000 minutes/month free tier  
✅ **Triggers deployments** - Commit auto-deploys your site

## Prerequisites

1. **Railway Account**: [railway.app](https://railway.app)
2. **GitHub Repository**: Your ExamFinder repo

## Step 1: Deploy Scraper to Railway

### 1.1 Push Code to GitHub

```bash
git add .
git commit -m "Add GitHub Actions scraper workflow"
git push origin main
```

### 1.2 Create Railway Project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect the Dockerfile

### 1.3 Configure Railway

1. **Set Root Directory**:
   - Settings → Root Directory → `packages/scraper-service`

2. **Add Environment Variables**:
   ```env
   PORT=3001
   NODE_ENV=production
   LOG_LEVEL=info
   CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
   OUTPUT_PATH=/app/data/data.json
   GITHUB_ACTION_SECRET=<generate-random-string-here>
   ```

   **Generate the secret:**
   ```bash
   openssl rand -hex 32
   # or
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Select Region**:
   - Settings → Region → **Europe (Frankfurt)** or **Europe (Paris)**
   - These are closest to Ireland

4. **Generate Domain**:
   - Settings → Networking → "Generate Domain"
   - Copy the URL (e.g., `https://your-service.up.railway.app`)

5. **Deploy**:
   - Railway auto-deploys
   - Wait for build to complete
   - Test: `curl https://your-service.up.railway.app/health`

## Step 2: Configure GitHub Secrets

Go to your GitHub repository: **Settings → Secrets and variables → Actions**

Add these repository secrets:

1. **`RAILWAY_SCRAPER_URL`**
   - Value: Your Railway URL (e.g., `https://your-service.up.railway.app`)

2. **`SCRAPER_SECRET`**
   - Value: The same `GITHUB_ACTION_SECRET` you set in Railway

## Step 3: Enable GitHub Actions

The workflow file is already created at `.github/workflows/scrape.yml`

### Workflow Details

- **Schedule**: Runs daily at 3 AM UTC
- **Manual trigger**: Can run manually from Actions tab
- **Process**:
  1. Triggers Railway scraper endpoint
  2. Receives scraped JSON data
  3. Saves to `apps/web/public/data.json`
  4. Commits and pushes if changed
  5. Auto-deploys site (if using Vercel/Netlify)

### Enable Workflow

1. Go to **Actions** tab in GitHub
2. Enable workflows if prompted
3. The workflow will run on schedule or manually

## Step 4: Test the Workflow

### Manual Test

1. Go to **Actions** tab
2. Click **"Scrape Exam Data"** workflow
3. Click **"Run workflow"** → **"Run workflow"**
4. Watch the workflow execute

### Check Results

After successful run:
- Check `apps/web/public/data.json` for updates
- See commit history for auto-commits
- Verify site deploys with new data

## How It Works

### The GitHub Action Workflow

```yaml
# Triggers Railway scraper
POST https://your-railway.app/scrape/action
Headers: x-github-action-secret: <secret>

# Receives response
{
  "success": true,
  "data": { /* scraped exam data */ }
}

# Saves and commits
data.json ← response.data
git commit -m "chore: update exam data 2025-09-30"
git push
```

### Security

- **Railway endpoint** protected by secret header
- **GitHub Actions** uses built-in `GITHUB_TOKEN` for commits
- **No credentials** stored on Railway
- **Secret** verified on every request

## Monitoring

### GitHub Actions Logs

1. Go to **Actions** tab
2. Click on workflow run
3. Expand steps to see detailed logs

### Railway Logs

1. Go to Railway dashboard
2. Click your service
3. View **Deployments** → Latest → **View Logs**

### Git History

All data updates are tracked:
```bash
git log --oneline -- apps/web/public/data.json
```

## Optional: Regional Considerations

### GitHub Actions Runners

GitHub Actions runners are in:
- US East (primary)
- US West
- EU (limited)

**To force Ireland region scraping:**
- Railway runs in EU (Frankfurt/Paris)
- Scraping happens from Railway's location
- GitHub Actions just orchestrates and commits

### Alternative: Self-Hosted Runner in Ireland

For true Ireland-based execution:

1. **Setup self-hosted runner in Ireland**:
   ```bash
   # On an Ireland-based server
   mkdir actions-runner && cd actions-runner
   curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
   tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
   ./config.sh --url https://github.com/your-org/your-repo --token YOUR_TOKEN
   ./run.sh
   ```

2. **Update workflow to use self-hosted**:
   ```yaml
   jobs:
     scrape:
       runs-on: [self-hosted, ireland]  # Use your Ireland runner
   ```

## Customization

### Change Schedule

Edit `.github/workflows/scrape.yml`:

```yaml
on:
  schedule:
    - cron: '0 3 * * *'  # Daily at 3 AM UTC
    # - cron: '0 */6 * * *'  # Every 6 hours
    # - cron: '0 0 * * 0'  # Weekly on Sunday
```

### Add Notifications

Add to workflow:

```yaml
- name: Notify on success
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Exam data updated successfully!'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### S3 Backup

If you want S3 backups, add to Railway env vars:

```env
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
S3_BUCKET=examfinder-data-ireland
```

The scraper automatically uploads to S3 if configured.

## Cost Estimate

- **Railway**: ~$5-10/month (only when running)
- **GitHub Actions**: Free (2000 min/month, uses ~5 min/run)
- **Total**: ~$5-10/month

## Troubleshooting

### Workflow Fails to Trigger Railway

**Check:**
- Railway URL is correct in secrets
- Secret matches between GitHub and Railway
- Railway service is running (check dashboard)

**Debug:**
```bash
curl -X POST https://your-railway.app/scrape/action \
  -H "x-github-action-secret: your-secret" \
  -H "Content-Type: application/json"
```

### Git Commit Fails

**Check:**
- Workflow has write permissions
- Go to: Settings → Actions → General → Workflow permissions
- Select: **Read and write permissions**

### No Data Changes Committed

This is normal if:
- Data hasn't changed since last scrape
- Workflow detects no diff and skips commit

### Railway Timeout

**Solutions:**
- Increase Railway timeout (requires Pro plan)
- Set `ONLY_CURRENT_YEAR=true` to scrape less data
- Split scraping into multiple runs

## Cleanup

### Disable Workflow

1. Go to `.github/workflows/scrape.yml`
2. Add `if: false` to job:
   ```yaml
   jobs:
     scrape:
       if: false  # Disable workflow
   ```

Or delete the workflow file:
```bash
git rm .github/workflows/scrape.yml
git commit -m "Disable scraping workflow"
git push
```

### Destroy Railway Service

```bash
railway down
```

Or delete from Railway dashboard.

## Comparison: GitHub Actions vs QStash

| Feature | GitHub Actions | Upstash QStash |
|---------|---------------|----------------|
| Cost | Free (2000 min/month) | Free (500 req/day) |
| Setup | Simple (2 secrets) | Medium (3 secrets) |
| Git commits | ✅ Built-in | ❌ Need webhook |
| Region control | Limited | ✅ Better |
| Monitoring | GitHub UI | QStash dashboard |
| **Best for** | **Integrated workflow** | **HTTP-only triggers** |

## Conclusion

**GitHub Actions + Railway** is the recommended approach because:
- Seamless git integration
- No credential management
- Auto-triggers deployments
- Simple to set up and maintain

The workflow handles everything: trigger → scrape → commit → deploy 🚀

## Support

- **Railway**: [docs.railway.app](https://docs.railway.app)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/actions)
- **Issues**: Open an issue on this repository