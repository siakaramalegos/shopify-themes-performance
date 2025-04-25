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
  fs.writeFileSync(`${cacheDir}/${writeFilePath}`, fileContent, err => {
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

function getAtIndex(sortedArray, divisor = 2) {
  const indexDecimal = sortedArray.length / divisor
  const index = Math.floor(indexDecimal)
  let val

  if (indexDecimal % 1 === 0) {
    // Even array, return average of 2 neighbor values
    val = (sortedArray[index - 1] + sortedArray[index]) / 2
  } else {
    // Odd array, return item
    val = sortedArray[index]
  }

  return val
}

function getAggregations(array) {
  const sortedArray = array.toSorted((a, b) => a - b)
  const median = getAtIndex(sortedArray, divisor = 2)
  const p25 = getAtIndex(sortedArray, divisor = 4)
  const p75 = getAtIndex(sortedArray, divisor = 4 / 3)

  return {
    min: sortedArray[0],
    p25: p25 ? p25 : null,
    median: median ? median : null,
    p75: p75 ? p75 : null,
    max: sortedArray[sortedArray.length - 1],
  }
}

function aggrPerfDataByMonth(aggregationsObj) {
  let data
  if (aggregationsObj.cwvAggregations) {
    data = aggregationsObj.cwvAggregations
  } else {
    data = aggregationsObj
  }

  return data
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

function getKeyByContainsValue(object, value) {
  return Object.keys(object).find(key => value.includes(object[key].name));
}

module.exports = {
  readDataFile,
  getDateFileString,
  mungeData,
  writeDataFile,
  getTrend,
  getAggregations,
  sortFloats,
  aggrPerfDataByMonth,
  getKeyByContainsValue,
}
