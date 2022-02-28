const puppeteer = require('puppeteer')
const fs = require('fs')

const sels = {
  agree: '#MaterialArchive__noTable__cbv__AgreeCheck',
  type: '#MaterialArchive__noTable__sbv__ViewType',
  year: '#MaterialArchive__noTable__sbv__YearSelect',
  exam: '#MaterialArchive__noTable__sbv__ExaminationSelect',
  subject: '#MaterialArchive__noTable__sbv__SubjectSelect',
}
async function getPapers(markingScheme, year, subjectNum, exam) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('https://www.examinations.ie/exammaterialarchive/')

  await page.waitForSelector(sels.agree)
  await page.click(sels.agree)

  await page.waitForSelector(sels.type)
  await page.select(sels.type, markingScheme ? 'markingschemes' : 'exampapers')

  await page.waitForSelector(sels.year)
  await page.select(sels.year, year)

  await page.waitForSelector(sels.exam)
  await page.select(sels.exam, exam)

  await page.waitForSelector(sels.subject)
  await page.select(sels.subject, subjectNum)

  await page.waitForSelector('tbody > input')
  const endings = await page.$$eval('tbody > input', (els) =>
    els.map((el) => el.getAttribute('value'))
  )

  // await page.waitForNavigation()
  // await page.setViewport({ width: 1000, height: 1000 })
  // await page.screenshot({ path: 'test.png', fullPage: true })
  await browser.close()
  return await endings
}

let data = {
  lc: {},
  jc: {},
  lb: {},
}

async function getAllPapers() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  const getOpts = async (sel) => {
    return await page.$$eval(`${sel} > option`, (els) =>
      els.map((v) => v.getAttribute('value')).filter((v) => v != '')
    )
  }
  await page.goto('https://www.examinations.ie/exammaterialarchive/')

  await page.waitForSelector(sels.agree)
  await page.click(sels.agree)

  // TYPE
  await page.waitForSelector(sels.type)
  const typeOps = await getOpts(sels.type)
  console.log(typeOps)
  for (const type of typeOps) {
    await page.select(sels.type, type)

    // YEAR
    await page.waitForSelector(sels.year)
    const yearOps = await getOpts(sels.year)
    for (const year of yearOps) {
      await page.select(sels.year, year)

      // EXAM
      await page.waitForSelector(sels.exam)
      const examOps = await getOpts(sels.exam)
      for (const exam of examOps) {
        await page.select(sels.exam, exam)

        // SUBJECT
        await page.waitForSelector(sels.subject)
        const subjectOps = await getOpts(sels.subject)
        for (const subject of subjectOps) {
          await page.select(sels.subject, subject)

          // OUTPUT
          await page.waitForSelector('tbody > input')
          const endings = await page.$$eval('tbody > input', (els) =>
            els.map((el) => el.getAttribute('value'))
          )
          data[exam][subject] = {}
          data[exam][subject][year] = endings
          fs.writeFile('./data.json', JSON.stringify(data), (err) => {
            if (err) console.error(err)
            else console.log(exam, subject, year)
          })
        }
      }
    }
  }

  await browser.close()
}
getAllPapers()

// getPapers(true, '2021', '32', 'lc').then((v) => console.log(v))
