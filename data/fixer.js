const fs = require('fs')
const { levelList, langList } = require('../public/consts.json')
const { exit } = require('process')

// Added sub to num
// fs.readFile('./data.json', (e, dataRaw) => {
//   let data = JSON.parse(dataRaw)
//   let subNamesToNums = {}
//   for (const [key, value] of Object.entries(data.subNumsToNames)) {
//     console.log(`${key}: ${value}`)
//     if (!subNamesToNums[value]) subNamesToNums[value] = []
//     subNamesToNums[value].push(key)
//   }
//   console.log(subNamesToNums)
//   data.subNamesToNums = subNamesToNums
//   fs.writeFile('./data.json', JSON.stringify(data), (err) => {})
// })

fs.readFile('./data.json', (e, dataRaw) => {
  if (e) console.error(e)

  let out = {}

  const data = JSON.parse(dataRaw)
  const subjects = Object.keys(data.subNamesToNums)
  const numsToNames = data.subNumsToNames

  const exams = ['lc', 'jc', 'lb']
  const typeConverter = {
    exampapers: 'Exam Paper',
    markingschemes: 'Marking Scheme',
  }

  // Goes through all exam jc, lc, lb
  for (const exam of exams) {
    out[exam] = {}

    // Goes through all subjects
    for (const num of Object.keys(data[exam])) {
      const subject = numsToNames[num]
      out[exam][subject] = {}

      // Goes through all years of the subject
      for (const year of Object.keys(data[exam][num])) {
        out[exam][subject][year] = { data: [], metaData: {} }

        // Goes through type ie exam paper/marking schemes
        let papers = []
        for (const [type, d] of Object.entries(data[exam][num][year])) {
          papers = papers.concat(
            d.map((x) => ({ ...x, year: year, type: typeConverter[type] }))
          )
        }
        out[exam][subject][year].data = papers

        /* -----------------
        LEVELS
         ----------------- */
        // Adds possible level list to meta data
        out[exam][subject][year].metaData.levelList = levelList.map((x) => ({
          ...x,
          disabled: !papers.some((paper) => paper?.url?.includes(x.value)),
        }))

        // Finds the first not disabled level
        out[exam][subject][year].metaData.level = out[exam][subject][
          year
        ].metaData.levelList.find((x) => !x.disabled)?.value

        /* -----------------
        LANGS
         ----------------- */
        // Adds possible langs list to meta data
        out[exam][subject][year].metaData.langList = langList.map((x) => ({
          ...x,
          disabled: !papers.some((paper) => paper?.url?.includes(x.value)),
        }))
        // Finds the first not disabled lang
        out[exam][subject][year].metaData.lang = out[exam][subject][
          year
        ].metaData.langList.find((x) => !x.disabled)?.value
      }
    }

    fs.writeFile(`./${exam}.json`, JSON.stringify(out[exam]), (e) => {
      if (e) console.error(e)
    })
  }
})
