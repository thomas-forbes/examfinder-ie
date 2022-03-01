const puppeteer = require('puppeteer')
const fs = require('fs')
const { exit } = require('process')

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
  subNumsToNames: {},
}

async function getAllPapers() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  const getOpts = async (sel) => {
    return await page.$$eval(`${sel} > option`, (els) =>
      els.map((v) => v.getAttribute('value')).filter((v) => v != '')
    )
  }
  const getOptsAndText = async (sel) => {
    return await page.$$eval(`${sel} > option`, (els) =>
      els
        .map((v) => ({ value: v.getAttribute('value'), text: v.textContent }))
        .filter((v) => v.value != '')
    )
  }
  await page.goto('https://www.examinations.ie/exammaterialarchive/')

  await page.waitForSelector(sels.agree)
  await page.click(sels.agree)

  // TODO: create logic to input data from json and only go down path if it is not already done if examinations.ie gives error
  const doSelect = async (pSel, sel, nSel) => {
    await page.select(pSel, sel)
    // console.log('a')
    // page.once('response', async (res) => {
    //   if (res.status() == 429) {
    //     console.log('\n', 429, 'Waiting...')
    //     await page.waitForTimeout(60000)
    //     await page.reload()
    //     console.log('RELOADED\n')
    //   } else {
    //     console.log(res.status())
    //   }
    // })
    // console.log('b')
    await page.waitForSelector(nSel)
    await page.waitForTimeout(500)
    // console.log('d')
  }

  // TYPE
  await page.waitForSelector(sels.type)
  const typeOps = await getOpts(sels.type)
  for (const type of typeOps) {
    await doSelect(sels.type, type, sels.year)
    const yearOps = await getOpts(sels.year)
    for (const year of yearOps) {
      await doSelect(sels.year, year, sels.exam)
      const examOps = await getOpts(sels.exam)
      for (const exam of examOps) {
        await doSelect(sels.exam, exam, sels.subject)
        const subjectOps = await getOptsAndText(sels.subject)
        for (const subject of subjectOps) {
          await doSelect(sels.subject, subject.value, 'tbody > input')

          const endings = await page.$$eval('tbody > input', (els) =>
            els.map((el) => el.getAttribute('value'))
          )
          const details = await page.$$eval('tr > .materialbody', (els) =>
            els
              .map((el) => el.textContent)
              .filter((x) => !x.includes('Click Here'))
          )
          const out = endings.map((x, i) => ({ details: details[i], url: x }))

          if (!data[exam][subject.value]) data[exam][subject.value] = {}

          if (!data[exam][subject.value][year])
            data[exam][subject.value][year] = {}

          data[exam][subject.value][year][type] = out
          data.subNumsToNames[subject.value] = subject.text

          fs.writeFile('./data.json', JSON.stringify(data), (err) => {
            if (err) console.error(err)
            else console.log(exam, subject, year)
          })
          // await page.waitForTimeout(10000)
        }
      }
    }
  }

  await browser.close()
}
getAllPapers()

// getPapers(true, '2021', '32', 'lc').then((v) => console.log(v))
