import { readFileSync, writeFileSync } from 'fs'
import pino from 'pino'
import { Page } from 'puppeteer'

export const logger = pino({
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

// Generic utilities
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

// File I/O operations
export const fileIO = {
  loadJSON<T>(path: string, defaultValue: T): T {
    try {
      return JSON.parse(readFileSync(path, 'utf-8'))
    } catch {
      return defaultValue
    }
  },

  saveJSON(path: string, data: unknown): void {
    writeFileSync(path, JSON.stringify(data, null, 2))
  },
}

// DOM selector utilities
export const dom = {
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
      // Wait for network to be idle after selection to ensure new data has loaded
      await page.waitForNetworkIdle({ idleTime: 300, timeout: 10000 })
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
