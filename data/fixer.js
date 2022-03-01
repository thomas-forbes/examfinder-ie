const fs = require('fs')

fs.readFile('./data.json', (e, dataRaw) => {
  let data = JSON.parse(dataRaw)
  let subNamesToNums = {}
  for (const [key, value] of Object.entries(data.subNumsToNames)) {
    console.log(`${key}: ${value}`)
    if (!subNamesToNums[value]) subNamesToNums[value] = []
    subNamesToNums[value].push(key)
  }
  console.log(subNamesToNums)
  data.subNamesToNums = subNamesToNums
  fs.writeFile('./data.json', JSON.stringify(data), (err) => {})
})
