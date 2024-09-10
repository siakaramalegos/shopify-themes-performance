const fs = require('fs')

// get data from json file
function readDataFile(readFilePath) {
  if (fs.existsSync(readFilePath)) {
    const file = fs.readFileSync(readFilePath)
    return JSON.parse(file)
  }

  // no cache found.
  return {
    lastFetched: null,
    children: []
  }
}

// 2024_09
function getDateFileString(date) {
  return date.toISOString().split('T')[0].slice(0,7).replace('-','_')
}

function mungeData(origins, rawPercents, dateString, client) {
  const convertedPercents = {}
  Object.keys(rawPercents).forEach(key => {
    convertedPercents[key] = Math.round(parseFloat(rawPercents[key]) * 1000) / 10
  })

  return {
    date: dateString,
    client,
    origins,
    ...convertedPercents,
  }
}

// save combined webmentions in cache file
function writeDataFile(data, cacheDir, writeFilePath, descriptor) {
  const fileContent = JSON.stringify(data, null, 2)
  // create cache folder if it doesnt exist already
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir)
  }
  // write data to cache json file
  fs.writeFile(`${cacheDir}/${writeFilePath}`, fileContent, err => {
    if (err) throw err
    console.log(`>>> ${descriptor} cached to ${cacheDir}/${writeFilePath}`)
  })
}

module.exports = {
  readDataFile,
  getDateFileString,
  mungeData,
  writeDataFile,
}
