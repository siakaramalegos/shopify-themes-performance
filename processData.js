const fs = require('fs')
const { readDataFile, getDateFileString, mungeData, writeDataFile } = require('./helpers');
const RAW_FOLDER = '_raw_data/';
const PROCESSED_FOLDER = '_processed_data/'

const today = new Date()
// TODO - change to -1
const lastMonth = new Date(today.setMonth(today.getMonth() - 2))

const dateFileNames = Array(6).fill(0).map((_, i) => {
  const newDate = lastMonth.setMonth(today.getMonth() - i)
  return getDateFileString(new Date(newDate))
});

let output = {}

dateFileNames.forEach(date => {
  const file = `${RAW_FOLDER}${date}.json`
  const fileData = readDataFile(file)

  // Early exit if no file data (file doesn't exist)
  if (!fileData[0]) { return }

  fileData.forEach(theme => {
    const {client, top_theme_name, origins, id, ...rawPercents} = theme
    const monthlyData = mungeData(origins, rawPercents, date, client)

    // Set id to null string if null
    const theme_store_id = id || 'null'

    if (!output[theme_store_id]) {
      output[theme_store_id] = {
        id: theme_store_id,
        top_theme_name,
        monthlyData: [ monthlyData ]
      }
    } else {
      output[id].monthlyData.push(monthlyData)
    }
  })

})

console.log(output['887']);


