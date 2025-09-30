import type { NextApiRequest, NextApiResponse } from 'next'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'

type ResponseData = {
  message: string
  success: boolean
  error?: string
}

// This endpoint is protected by Upstash QStash signature verification
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  try {
    console.log('Starting scraping job...')

    // Import the scraper dynamically to avoid loading puppeteer on every request
    const { scrapeExamData } = await import('../../../../packages/data/scraper-runner')

    // Run the scraper
    const data = await scrapeExamData()

    console.log('Scraping completed successfully')

    return res.status(200).json({
      success: true,
      message: 'Scraping completed successfully',
    })
  } catch (error) {
    console.error('Scraping failed:', error)

    return res.status(500).json({
      success: false,
      message: 'Scraping failed',
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

// Wrap with QStash signature verification
export default verifySignatureAppRouter(handler)

// Increase timeout for Vercel serverless function (max 60s on hobby plan)
export const config = {
  api: {
    bodyParser: false, // QStash sends raw body for signature verification
    externalResolver: true,
  },
  maxDuration: 300, // 5 minutes (requires Pro plan on Vercel)
}