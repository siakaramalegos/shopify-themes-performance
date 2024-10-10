const { readDataFile } = require('./helpers');

const fs = require('fs')

const INPUT_FOLDER = '_processed_data'
const allFiles = fs.readdirSync(INPUT_FOLDER).sort().reverse()
const latestDataFile = allFiles[0]
const previousDataFile = allFiles[1]
const themesCurrent = readDataFile(`${INPUT_FOLDER}/${latestDataFile}`).themes
const themesPrevious = readDataFile(`${INPUT_FOLDER}/${previousDataFile}`).themes

// New and dropped themes
const themesCurrentNames = themesCurrent.map(theme => theme.name)
const themesPreviousNames = themesPrevious.map(theme => theme.name)
const newThemes = themesCurrentNames.filter(name => !themesPreviousNames.includes(name))
const droppedThemes = themesPreviousNames.filter(name => !themesCurrentNames.includes(name))
console.log("**************************************************");
console.log("*** NEW & DROPPED THEMES ***");
console.log({newThemes, droppedThemes});
console.log("**************************************************");

// Most improved themes
const summarizedThemes = themesCurrent.map(theme => {
  const previousData = themesPrevious.filter(themePrevious => theme.id === themePrevious.id)

  // Only include themes with previous month data
  if (previousData.length < 1) {
    return null
  }

  const originsImprovementMobile = previousData[0].summary.mobile.origins ? theme.summary.mobile.origins - previousData[0].summary.mobile.origins : null
  const originsImprovementDesktop = previousData[0].summary.desktop.origins ? theme.summary.desktop.origins - previousData[0].summary.desktop.origins : null
  const cwvImproveMobile = previousData[0].summary.mobile.passingCWVnum ? theme.summary.mobile.passingCWVnum - previousData[0].summary.mobile.passingCWVnum : null
  const cwvImproveDesktop = previousData[0].summary.desktop.passingCWVnum ? theme.summary.desktop.passingCWVnum - previousData[0].summary.desktop.passingCWVnum : null

  return {
    name: theme.name,
    originsMobile: theme.summary.mobile.origins,
    originsDesktop: theme.summary.desktop.origins,
    originsImprovementMobile,
    originsImprovementDesktop,
    cwvImproveMobile,
    cwvImproveDesktop,
  }
}).filter(theme => theme)

function sortByField(array, field) {
  return array.toSorted((a, b) => b[field] - a[field])
}

const PRINT_LIMIT = 5
function prettyPrint(array, field, extra) {
  array.slice(0, PRINT_LIMIT).forEach(element => {
    let str = `  ${element.name}: ${element[field]}`
    if (extra) {
      str += ` (${element[extra]} origins)`
    }
    console.log(str);
  })
}

const mostImprovedMobile =  sortByField(summarizedThemes, 'cwvImproveMobile')
const mostImprovedDesktop =  sortByField(summarizedThemes, 'cwvImproveDesktop')

console.log("*** MOST IMPROVED THEMES (mobile) ***");
prettyPrint(mostImprovedMobile, 'cwvImproveMobile', 'originsMobile')
console.log("**************************************************");
console.log("*** MOST IMPROVED THEMES (desktop) ***");
prettyPrint(mostImprovedDesktop, 'cwvImproveDesktop', 'originsDesktop')

// Highest market (origins) growth
const mostOriginGrowthMobile =  sortByField(summarizedThemes, 'originsImprovementMobile')
const mostOriginGrowthDesktop =  sortByField(summarizedThemes, 'originsImprovementDesktop')

console.log("**************************************************");
console.log("*** MOST ORIGIN GROWTH (mobile) ***");
prettyPrint(mostOriginGrowthMobile, 'originsImprovementMobile')
console.log("**************************************************");
console.log("*** MOST ORIGIN GROWTH (desktop) ***");
prettyPrint(mostOriginGrowthDesktop, 'originsImprovementDesktop')
console.log("**************************************************");
