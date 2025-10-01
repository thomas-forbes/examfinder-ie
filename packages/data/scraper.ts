#!/usr/bin/env bun

import puppeteer, { Page } from 'puppeteer'
import { dom, fileIO, getCurrentYear, logger, sleep } from './helpers'

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

// Data management
const dataManager = {
  load(): Data {
    return fileIO.loadJSON('../../apps/web/public/data.json', {
      lc: {},
      jc: {},
      lb: {},
    })
  },

  save(data: Data): void {
    fileIO.saveJSON('../../apps/web/public/data.json', data)
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

    await sleep(5000)
    const html = await page.content()
    logger.info({ html }, 'Page content')

    await page.screenshot({ path: 'artifacts/page.png' })
    logger.info('Screenshot saved')

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
 * Scrapes exam data from examinations.ie
 */
async function scrapeExamData(): Promise<Data> {
  const puppetterConfig = {
    headless: CONFIG.HEADLESS,
    slowMo: CONFIG.SLOW_MO,
    defaultViewport: null,
    args: [
      '--ignore-certificate-errors',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
    executablePath: '/usr/bin/google-chrome-stable',
  }
  const browser = await puppeteer.launch(puppetterConfig)
  logger.info({ puppetterConfig }, 'Launched puppeteer')

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
  return data
}

/**
 * Main execution function
 */
async function main() {
  try {
    logger.info('Starting exam data scraping')
    await scrapeExamData()
    logger.info('Successfully saved data to ../../apps/web/public/data.json')
  } catch (error) {
    logger.error({ error }, `Fatal error during execution: ${error}`)
    process.exit(1)
  }
}

// Run the script
main()
