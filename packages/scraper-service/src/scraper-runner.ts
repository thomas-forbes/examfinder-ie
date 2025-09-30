import puppeteer, { Page } from 'puppeteer'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
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

// Configuration
const CONFIG = {
  SKIP_FILLED: false,
  ONLY_CURRENT_YEAR: true,
  TIMEOUT: 500,
  HEADLESS: true,
  SLOW_MO: 0,
} as const

// Selectors for the exam archive page
const SELECTORS = {
  agree: '#MaterialArchive__noTable__cbv__AgreeCheck',
  type: '#MaterialArchive__noTable__sbv__ViewType',
  year: '#MaterialArchive__noTable__sbv__YearSelect',
  exam: '#MaterialArchive__noTable__sbv__ExaminationSelect',
  subject: '#MaterialArchive__noTable__sbv__SubjectSelect',
} as const

// Type definitions
interface SubjectOption {
  value: string
  text: string
}

interface Paper {
  details: string
  url: string
  type: string
}

type ExamType = 'lc' | 'jc' | 'lb'

interface ExamData {
  [subjectName: string]: {
    [year: string]: Paper[]
  }
}

interface Data {
  lc: ExamData
  jc: ExamData
  lb: ExamData
}

const TYPE_CONVERTER = {
  exampapers: 'Exam Paper',
  markingschemes: 'Marking Scheme',
  deferredexams: 'Deferred Exam Paper',
  deferredmarkingschemes: 'Deferred Marking Scheme',
} as const

// Utility functions
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const getCurrentYear = () => new Date().getFullYear().toString()

// File I/O operations
const fileIO = {
  loadJSON<T>(path: string, defaultValue: T): T {
    try {
      if (existsSync(path)) {
        return JSON.parse(readFileSync(path, 'utf-8'))
      }
      return defaultValue
    } catch {
      return defaultValue
    }
  },

  saveJSON(path: string, data: unknown): void {
    const dir = dirname(path)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(path, JSON.stringify(data, null, 2))
  },
}

// DOM selector utilities
const dom = {
  async getOptionValues(page: Page, selector: string): Promise<string[]> {
    const values = await page.$$eval(`${selector} > option`, (els: Element[]) =>
      els
        .map((v: Element) => (v as HTMLInputElement).getAttribute('value'))
        .filter(
          (v: string | null): v is string => v != null && v !== '0' && v !== ''
        )
    )
    return values
  },

  async getSubjectOptions(
    page: Page,
    selector: string
  ): Promise<Array<{ value: string; text: string }>> {
    return await page.$$eval(`${selector} > option`, (els: Element[]) =>
      els
        .map((v: Element) => ({
          value: (v as HTMLInputElement).getAttribute('value'),
          text: v.textContent,
        }))
        .filter(
          (v): v is { value: string; text: string } =>
            v.value != null && v.value !== '' && v.value !== '0'
        )
    )
  },

  async selectAndWait(
    page: Page,
    selectSel: string,
    value: string,
    waitSel: string,
    timeout = 500
  ): Promise<void> {
    try {
      await page.select(selectSel, value)
      await page.waitForSelector(waitSel, { timeout: 10000 })
      await sleep(timeout)
    } catch (error) {
      logger.error(
        { selector: selectSel, value, error },
        'Failed to select and wait'
      )
      throw error
    }
  },

  async extractPapers(
    page: Page
  ): Promise<Array<{ details: string; url: string }>> {
    const urls = await page.$$eval('tbody > input', (els: Element[]) =>
      els
        .map((el: Element) => (el as HTMLInputElement).getAttribute('value'))
        .filter((v: string | null): v is string => v != null)
    )

    const details = await page.$$eval('tr > .materialbody', (els: Element[]) =>
      els
        .map((el: Element) => el.textContent)
        .filter(
          (detail: string | null): detail is string =>
            detail != null && !detail.includes('Click Here')
        )
    )

    return urls.map((url: string, i: number) => ({
      details: details[i] || '',
      url,
    }))
  },
}

// Data management
const dataManager = {
  load(): Data {
    const outputPath = process.env.OUTPUT_PATH || '/app/data/data.json'
    return fileIO.loadJSON(outputPath, {
      lc: {},
      jc: {},
      lb: {},
    })
  },

  save(data: Data): void {
    const outputPath = process.env.OUTPUT_PATH || '/app/data/data.json'
    fileIO.saveJSON(outputPath, data)
  },

  convertPaperType(type: string): string {
    return TYPE_CONVERTER[type as keyof typeof TYPE_CONVERTER] || type
  },

  shouldSkip(
    data: Data,
    exam: ExamType,
    subjectName: string,
    year: string,
    type: string
  ): boolean {
    if (!CONFIG.SKIP_FILLED) return false

    const yearData = data?.[exam]?.[subjectName]?.[year]
    if (!yearData) return false

    const convertedType = this.convertPaperType(type)
    return yearData.some((paper) => paper.type === convertedType)
  },

  saveSubject(
    data: Data,
    exam: ExamType,
    subjectName: string,
    year: string,
    type: string,
    papers: Omit<Paper, 'type'>[]
  ): void {
    if (!data[exam][subjectName]) {
      data[exam][subjectName] = {}
    }
    if (!data[exam][subjectName][year]) {
      data[exam][subjectName][year] = []
    }

    const convertedType = this.convertPaperType(type)
    const transformedPapers: Paper[] = papers.map((paper) => ({
      ...paper,
      type: convertedType,
    }))

    // Remove existing papers of this type and add new ones
    const initialPapers = data[exam][subjectName][year].length
    data[exam][subjectName][year] = [
      ...data[exam][subjectName][year].filter((p) => p.type !== convertedType),
      ...transformedPapers,
    ]
    const finalPapers = data[exam][subjectName][year].length
    logger.info(
      { subjectName, year, type, initialPapers, finalPapers },
      'Saved subject data'
    )
  },
}

// Page initialization and navigation
const pageSetup = {
  async initialize(page: Page): Promise<void> {
    await page.goto('https://www.examinations.ie/exammaterialarchive/')
    await page.waitForSelector(SELECTORS.agree)
    await page.click(SELECTORS.agree)
    await page.waitForSelector(SELECTORS.type)
    logger.info('Page initialized successfully')
  },

  getYearOptions(): string[] {
    const allYears = ['2024', '2023', '2022', '2021', '2020', '2019', '2018']
    return CONFIG.ONLY_CURRENT_YEAR ? [getCurrentYear()] : allYears
  },
}

// Main scraping orchestration
const scraper = {
  async processSubject(
    page: Page,
    data: Data,
    type: string,
    year: string,
    exam: ExamType,
    subject: SubjectOption
  ): Promise<void> {
    if (dataManager.shouldSkip(data, exam, subject.text, year, type)) {
      logger.debug(
        { exam, subject: subject.text, year },
        'Skipping already processed subject'
      )
      return
    }

    logger.info({ exam, subject: subject.text, year }, 'Processing subject')
    await dom.selectAndWait(
      page,
      SELECTORS.subject,
      subject.value,
      'tbody > input',
      CONFIG.TIMEOUT
    )
    const papers = await dom.extractPapers(page)

    dataManager.saveSubject(data, exam, subject.text, year, type, papers)
    dataManager.save(data)
    await sleep(CONFIG.TIMEOUT)
  },

  async processExam(
    page: Page,
    data: Data,
    type: string,
    year: string,
    exam: ExamType
  ): Promise<void> {
    logger.info({ exam, year, type }, 'Processing exam')
    await dom.selectAndWait(
      page,
      SELECTORS.exam,
      exam,
      SELECTORS.subject,
      CONFIG.TIMEOUT
    )
    const subjectOps = await dom.getSubjectOptions(page, SELECTORS.subject)
    logger.info({ subjectCount: subjectOps.length }, 'Got subject options')

    for (const subject of subjectOps) {
      await this.processSubject(page, data, type, year, exam, subject)
    }
  },

  async processYear(
    page: Page,
    data: Data,
    type: string,
    year: string
  ): Promise<void> {
    logger.info({ year, type }, 'Processing year')
    await dom.selectAndWait(
      page,
      SELECTORS.year,
      year,
      SELECTORS.exam,
      CONFIG.TIMEOUT
    )
    const examOps = await dom.getOptionValues(page, SELECTORS.exam)
    logger.info({ examCount: examOps.length }, 'Got exam options')

    for (const exam of examOps as ExamType[]) {
      await this.processExam(page, data, type, year, exam)
    }
  },

  async processType(page: Page, data: Data, type: string): Promise<void> {
    logger.info({ type }, 'Processing type')
    await dom.selectAndWait(
      page,
      SELECTORS.type,
      type,
      SELECTORS.year,
      CONFIG.TIMEOUT
    )
    logger.info('Selected type')

    for (const year of pageSetup.getYearOptions()) {
      await this.processYear(page, data, type, year)
    }
  },
}

/**
 * Uploads data to S3 if configured
 */
async function uploadToS3(data: Data): Promise<void> {
  const s3Bucket = process.env.S3_BUCKET
  const awsRegion = process.env.AWS_REGION || 'eu-west-1'

  if (!s3Bucket) {
    logger.info('S3_BUCKET not configured, skipping upload')
    return
  }

  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
    
    const client = new S3Client({ region: awsRegion })
    const timestamp = new Date().toISOString()
    
    // Upload current data
    await client.send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: 'data.json',
        Body: JSON.stringify(data, null, 2),
        ContentType: 'application/json',
      })
    )
    
    // Upload timestamped backup
    await client.send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: `backups/data-${timestamp}.json`,
        Body: JSON.stringify(data, null, 2),
        ContentType: 'application/json',
      })
    )
    
    logger.info({ bucket: s3Bucket, timestamp }, 'Successfully uploaded data to S3')
  } catch (error) {
    logger.error({ error, bucket: s3Bucket }, 'Failed to upload to S3')
    throw error
  }
}

/**
 * Scrapes exam data from examinations.ie
 */
export async function scrapeExamData(): Promise<Data> {
  const puppeteerConfig = {
    headless: CONFIG.HEADLESS,
    slowMo: CONFIG.SLOW_MO,
    defaultViewport: null,
    args: [
      '--ignore-certificate-errors',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--no-zygote',
    ],
    executablePath: process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable',
  }
  
  const browser = await puppeteer.launch(puppeteerConfig)
  logger.info({ puppeteerConfig }, 'Launched puppeteer')

  const page = await browser.newPage()
  logger.info('Got new page')

  const data = dataManager.load()
  logger.info('Loaded data')

  await pageSetup.initialize(page)
  logger.info('Initialized page')

  const typeOps = await dom.getOptionValues(page, SELECTORS.type)
  logger.info({ typeCount: typeOps.length, types: typeOps }, 'Starting scrape')

  for (const type of typeOps) {
    await scraper.processType(page, data, type)
  }

  await browser.close()
  
  // Upload to S3 if configured
  await uploadToS3(data)
  
  return data
}

/**
 * Main execution function for CLI usage
 */
async function main() {
  try {
    logger.info('Starting exam data scraping')
    const data = await scrapeExamData()
    
    const outputPath = process.env.OUTPUT_PATH || '/app/data/data.json'
    logger.info({ outputPath }, 'Successfully saved data locally')
    
    logger.info('Scraping completed successfully')
  } catch (error) {
    logger.error({ error }, `Fatal error during execution: ${error}`)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}