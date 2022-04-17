const fs = require('fs')
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
        out[exam][subject][year] = []

        // Goes through type ie exam paper/marking schemes
        for (const [type, d] of Object.entries(data[exam][num][year])) {
          out[exam][subject][year] = out[exam][subject][year].concat(
            d.map((x) => ({ ...x, year: year, type: typeConverter[type] }))
          )
          console.log(out[exam][subject][year])
          exit(0)
        }
      }
    }
  }
})
