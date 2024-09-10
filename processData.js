const { readDataFile, getDateFileString, mungeData, writeDataFile } = require('./helpers');
const RAW_FOLDER = '_raw_data/';
const CACHE_DIR = '_processed_data'

const today = new Date()
// TODO - change to -1
const lastMonth = new Date(today.setMonth(today.getMonth() - 2))

const dateFileNames = Array(6).fill(0).map((_, i) => {
  const newDate = lastMonth.setMonth(today.getMonth() - i)
  return getDateFileString(new Date(newDate))
});

const confirmedThemes = readDataFile('currentThemes.json')

let themes = {}
let ignoredEntries = 0
let unconfirmedThemes = {}

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
    // TODO: combine nulls and not counted into 1 object for total origins data

    if (!themes[theme_store_id]) {
      // early exit
      if (monthlyData.origins < 30) {
        ignoredEntries++
        return
      }

      // check if confirmed theme
      if (confirmedThemes[theme_store_id]) {
        const confirmedName = confirmedThemes[theme_store_id].name
        if (confirmedName !== top_theme_name){
          console.warn(`THEME NAME MISMATCH FOR ${theme_store_id}: Top theme name is ${top_theme_name} but confirmed theme name is ${confirmedName}. Using confirmed name.`);
        }
        themes[theme_store_id] = {
          id: theme_store_id,
          name: confirmedName,
          sunset: confirmedThemes[theme_store_id].sunset,
          slug: confirmedThemes[theme_store_id].slug,
          monthlyData: [ monthlyData ]
        }
      } else if (!unconfirmedThemes[theme_store_id]) {
        // Add to unconfirmed themes list if not already there
        unconfirmedThemes[theme_store_id] = top_theme_name
      }
    } else {
      themes[id].monthlyData.push(monthlyData)
    }
  })

})

// Housekeeping
if (Object.keys(unconfirmedThemes).length > 1) {
  console.error("*****UNCONFIRMED THEMES*****");
  console.log({unconfirmedThemes});
}
if (ignoredEntries > 0) {
  console.log(`Ignored ${ignoredEntries} entries of unconfirmed themes with less than 5 origins`);
}


const output = {
  themes,
  dates: dateFileNames
}

const outputFileName = getDateFileString(new Date())
writeDataFile(output, CACHE_DIR, `${outputFileName}.json`, 'Theme data')
