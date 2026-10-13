import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // All UI checks use local data; do not send analytics or open external papers.
  await page.route('**/*', (route) =>
    new URL(route.request().url()).hostname === '127.0.0.1'
      ? route.continue()
      : route.abort()
  )
})

test('searches papers, changes exam/year/level/language and persists selections', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      !message.text().includes('Failed to load resource')
    )
      errors.push(message.text())
  })
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Easily Search Irish Past Papers' })
  ).toBeVisible()
  expect((await page.request.get('/api/pdf')).status()).toBe(405)
  const choices = page.getByRole('combobox')
  await choices.nth(1).click()
  await page.getByPlaceholder('Search subject...').fill('Mathematics')
  const maths = page.getByRole('option', { name: 'Mathematics', exact: true })
  await maths.getByRole('button').click()
  await maths.click()
  await expect(choices.nth(1)).toContainText('Mathematics')
  const papers = page.locator('a[href*="/archive/"]')
  await expect(papers.first()).toBeVisible()
  await expect(papers.first()).toHaveAttribute(
    'href',
    /examinations\.ie\/archive\/.*\.pdf$/i
  )

  await choices.nth(2).click()
  const selectedYear = '2024'
  await page.getByRole('option', { name: selectedYear, exact: true }).click()
  await expect(papers.first()).toHaveAttribute(
    'href',
    new RegExp('/' + selectedYear + '/')
  )
  await choices.nth(3).click()
  await page
    .getByRole('option', { name: 'Ordinary Level', exact: true })
    .click()
  await expect(choices.nth(3)).toContainText('Ordinary Level')
  await page.getByRole('radio', { name: 'Irish', exact: true }).click()
  await expect(papers.first()).toHaveAttribute('href', /IV\.pdf$/i)
  await page.reload()
  await expect(choices.nth(1)).toContainText('Mathematics')
  await expect(choices.nth(2)).toContainText(selectedYear)
  await expect(choices.nth(3)).toContainText('Ordinary Level')
  await expect(
    page.getByRole('radio', { name: 'Irish', exact: true })
  ).toHaveAttribute('data-state', 'on')
  await expect
    .poll(async () =>
      (await page.context().cookies()).some(
        (c) =>
          c.name === 'favSubs' &&
          decodeURIComponent(c.value).includes('Mathematics')
      )
    )
    .toBe(true)

  for (const name of ['Junior Cert', 'Leaving Cert Applied', 'Leaving Cert']) {
    await choices.first().click()
    await page.getByRole('option', { name, exact: true }).click()
    await expect(choices.first()).toContainText(name)
    await expect(papers.first()).toBeVisible()
  }
  await expect(
    page.getByRole('link', { name: 'Formula and Tables Book' })
  ).toHaveAttribute('href', /examinations\.ie\/misc-doc\/.*\.pdf/)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  expect(errors).toEqual([])
  await page.screenshot({
    path: testInfo.outputPath('papers.png'),
    fullPage: true,
    animations: 'disabled',
  })
})

test('calculates points, updates grades and selects the best six', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      !message.text().includes('Failed to load resource')
    )
      errors.push(message.text())
  })
  await page.goto('/')
  await page
    .getByRole('link', { name: 'Points Calculator', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Leaving Cert Points Calculator' })
  ).toBeVisible()
  await expect(page.getByText('Total:')).toHaveText('Total: 625')
  const maths = page
    .locator('tbody tr')
    .filter({ has: page.locator('input[value="Maths"]') })
  await maths.locator('select').nth(1).selectOption('6')
  await expect(maths.locator('td').last()).toHaveText('71')
  await expect(page.getByText('Total:')).toHaveText('Total: 571')
  await maths.locator('select').first().selectOption('O')
  await expect(maths.locator('td').last()).toHaveText('12')
  await expect(page.getByText('Total:')).toHaveText('Total: 512')
  const lcvp = page
    .locator('tbody tr')
    .filter({ has: page.getByRole('link', { name: 'LCVP', exact: true }) })
  await lcvp.locator('select').selectOption('Distinction')
  await expect(page.getByText('Total:')).toHaveText('Total: 566')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  expect(errors).toEqual([])
  await page.screenshot({
    path: testInfo.outputPath('points.png'),
    fullPage: true,
    animations: 'disabled',
  })
  await page.getByRole('link', { name: 'Past Papers', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Easily Search Irish Past Papers' })
  ).toBeVisible()
})
