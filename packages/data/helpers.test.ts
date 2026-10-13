import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import puppeteer, { type Browser, type Page } from 'puppeteer'
import { dom, fileIO } from './helpers'

describe('scraper helpers with an offline archive fixture', () => {
  let browser: Browser
  let page: Page

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true })
    page = await browser.newPage()
    await page.setContent(`
      <select id="subject">
        <option value="0">Choose</option><option value="">Empty</option>
        <option value="maths">Mathematics</option><option value="irish">Irish</option>
      </select>
      <table><tbody>
        <input type="hidden" value="LC001ALP1EV.pdf"><input type="hidden" value="LC001ALP2EV.pdf">
        <tr><td class="materialbody">Paper 1</td></tr>
        <tr><td class="materialbody">Paper 2</td></tr>
        <tr><td class="materialbody">Click Here to return</td></tr>
      </tbody></table>
    `)
  })

  afterAll(async () => {
    await browser?.close()
  })

  test('filters placeholder options and preserves labels', async () => {
    expect(await dom.getOptionValues(page, '#subject')).toEqual([
      'maths',
      'irish',
    ])
    expect(await dom.getSubjectOptions(page, '#subject')).toEqual([
      { value: 'maths', text: 'Mathematics' },
      { value: 'irish', text: 'Irish' },
    ])
  })

  test('selects a subject, waits, and extracts papers', async () => {
    await dom.selectAndWait(page, '#subject', 'irish', '.materialbody', 0)
    expect(
      await page.$eval('#subject', (el) => (el as HTMLSelectElement).value)
    ).toBe('irish')
    expect(await dom.extractPapers(page)).toEqual([
      { details: 'Paper 1', url: 'LC001ALP1EV.pdf' },
      { details: 'Paper 2', url: 'LC001ALP2EV.pdf' },
    ])
  })
})

test('JSON I/O round-trips in a temporary directory and handles missing files', () => {
  const directory = mkdtempSync(join(tmpdir(), 'examfinder-data-'))
  try {
    const path = join(directory, 'data.json')
    expect(fileIO.loadJSON(path, { lc: {} })).toEqual({ lc: {} })
    const fixture = { lc: { Mathematics: { '2026': [] } } }
    fileIO.saveJSON(path, fixture)
    expect(fileIO.loadJSON(path, {})).toEqual(fixture)
    expect(JSON.parse(readFileSync(path, 'utf8'))).toEqual(fixture)
  } finally {
    rmSync(directory, { recursive: true })
  }
})
