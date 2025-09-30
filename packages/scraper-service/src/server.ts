import express from 'express'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { scrapeExamData } from './scraper-runner.js'
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'HH:MM:ss',
    },
  },
})

const app = express()
const PORT = process.env.PORT || 3001

// Middleware to parse JSON and raw body for QStash signature verification
app.use(express.json())
app.use(express.raw({ type: 'application/json' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'examfinder-scraper' })
})

// Main scraping endpoint - protected by QStash signature
app.post('/scrape', async (req, res) => {
  const startTime = Date.now()
  
  try {
    // Verify QStash signature if configured
    const qstashToken = process.env.QSTASH_CURRENT_SIGNING_KEY
    if (qstashToken) {
      const signature = req.headers['upstash-signature'] as string
      
      if (!signature) {
        logger.warn('Missing QStash signature')
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - missing signature',
        })
      }

      // QStash signature verification
      try {
        const { Receiver } = await import('@upstash/qstash')
        const receiver = new Receiver({
          currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
          nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
        })

        const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
        const isValid = await receiver.verify({
          signature,
          body,
        })

        if (!isValid) {
          logger.warn('Invalid QStash signature')
          return res.status(401).json({
            success: false,
            error: 'Unauthorized - invalid signature',
          })
        }
      } catch (error) {
        logger.error({ error }, 'Signature verification failed')
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - signature verification failed',
        })
      }
    } else {
      logger.warn('QStash signature verification disabled - QSTASH_CURRENT_SIGNING_KEY not set')
    }

    logger.info('Starting scraping job...')
    
    // Run the scraper
    const data = await scrapeExamData()
    
    const duration = Date.now() - startTime
    logger.info({ duration }, 'Scraping completed successfully')

    res.json({
      success: true,
      message: 'Scraping completed successfully',
      duration,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error({ error, duration }, 'Scraping failed')

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration,
    })
  }
})

// Manual trigger endpoint (for testing, should be removed or protected in production)
app.post('/scrape/manual', async (req, res) => {
  // Check for manual trigger secret
  const secret = req.headers['x-manual-secret']
  if (secret !== process.env.MANUAL_TRIGGER_SECRET) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
    })
  }

  const startTime = Date.now()
  
  try {
    logger.info('Manual scraping triggered...')
    
    const data = await scrapeExamData()
    
    const duration = Date.now() - startTime
    logger.info({ duration }, 'Manual scraping completed')

    res.json({
      success: true,
      message: 'Manual scraping completed successfully',
      duration,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error({ error, duration }, 'Manual scraping failed')

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration,
    })
  }
})

app.listen(PORT, () => {
  logger.info({ port: PORT }, `Scraper service listening on port ${PORT}`)
  logger.info('Endpoints:')
  logger.info('  GET  /health         - Health check')
  logger.info('  POST /scrape         - Trigger scraping (QStash protected)')
  logger.info('  POST /scrape/manual  - Manual trigger (secret protected)')
})