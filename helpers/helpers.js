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
    origins: parseInt(origins, 10),
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


function getTrend(arr) {
  const end = arr[arr.length - 1]
  const start = arr[arr.length - 2]

  if (end > start) {
    return "up"
  } else if (end < start) {
    return "down"
  } else {
    return "none"
  }
}

function getAggregations(array) {
  const sortedArray = array.toSorted((a, b) => a - b)
  const middleIndexDecimal = sortedArray.length / 2
  const middleIndex = Math.floor(middleIndexDecimal)
  let median

  if (middleIndexDecimal % 1 === 0) {
    // Even array, return average of 2 middle values
    median = (sortedArray[middleIndex - 1] + sortedArray[middleIndex]) / 2
  } else {
    // Odd array, return middle
    median = sortedArray[middleIndex]
  }

  return {
    min: sortedArray[0].toFixed(1),
    median: median ? median.toFixed(1) : null,
    max: sortedArray[sortedArray.length - 1].toFixed(1),
  }
}

function sortFloats(a, b) {
  const aNum = parseFloat(a)
  const bNum = parseFloat(b)

  // Sorting by largest first (reverse)
  if (aNum > bNum) {
    return -1;
  }
  if (aNum < bNum) {
    return 1;
  }
  // a must be equal to b
  return 0;
}

module.exports = {
  readDataFile,
  getDateFileString,
  mungeData,
  writeDataFile,
  getTrend,
  getAggregations,
  sortFloats,
}
