const { readDataFile, getDateFileString, mungeData, writeDataFile, getLineSvg, getPassingCwvSvg, getStackedBarSvg } = require('./helpers');
const RAW_FOLDER = '_raw_data/';
const CACHE_DIR = '_processed_data'
const MIN_ORIGINS = 100
const CLIENTS = ['mobile', 'desktop']

const today = new Date()
const lastMonth = new Date(today.setMonth(today.getMonth() - 1))

// File names are YYYY_MM (e.g., 2024_07)
const currentMonths = Array(6).fill(0).map((_, i) => {
  const newDate = lastMonth.setMonth(today.getMonth() - i)
  return getDateFileString(new Date(newDate))
}).sort();
const currentMonthsReadable = currentMonths.map(dateStr => {
  const parts = dateStr.split('_')
  return `${parts[1]}/${parts[0].slice(2)}`
})

const confirmedThemes = readDataFile('currentThemes.json')

// Initialize counters
let themes = {}
let ignoredEntries = 0
let unconfirmedThemes = {}
let allOtherOriginsCounts = { mobile: {}, desktop: {} }
CLIENTS.forEach(client => {
  currentMonths.forEach(monthStr => { allOtherOriginsCounts[client][monthStr] = 0 })
})
let totalOriginsCounts = { mobile: {}, desktop: {} }
CLIENTS.forEach(client => {
  currentMonths.forEach(monthStr => { totalOriginsCounts[client][monthStr] = 0 })
})

// For each monthly data file, dump each theme's monthly data into the theme object
currentMonths.forEach(date => {
  const file = `${RAW_FOLDER}${date}.json`
  const fileData = readDataFile(file)

  // Early exit if no file data (file doesn't exist)
  if (!fileData[0]) { return }

  fileData.forEach(theme => {
    const {client, top_theme_name, origins, id, ...rawPercents} = theme
    const monthlyData = mungeData(origins, rawPercents, date, client)
    totalOriginsCounts[client][monthlyData.date] = totalOriginsCounts[client][monthlyData.date] + monthlyData.origins

    // Set id to null string if null
    const theme_store_id = id || 'null'

    if (!themes[theme_store_id]) {
      // early exit
      if (monthlyData.origins < MIN_ORIGINS) {
        ignoredEntries++

        allOtherOriginsCounts[client][monthlyData.date] = allOtherOriginsCounts[client][monthlyData.date] + monthlyData.origins
        return
      }

      // check if confirmed theme, if so add it
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
      } else {
        // If not confirmed, add to other origins count
        allOtherOriginsCounts[client][monthlyData.date] = allOtherOriginsCounts[client][monthlyData.date] + monthlyData.origins

        // Add to unconfirmed themes list if not already there
        if (!unconfirmedThemes[theme_store_id]) {
          unconfirmedThemes[theme_store_id] = top_theme_name
        }
      }
    } else {
      // Confirmed themes already in object, pass new month's data to it
      themes[id].monthlyData.push(monthlyData)
    }
  })

})

// Housekeeping about bad theme names or theme_store_ids and general themes data
console.log("**************************************************");
if (Object.keys(unconfirmedThemes).length > 1) {
  console.error("*** UNCONFIRMED THEMES:");
  console.log("*** ", {unconfirmedThemes});
}
if (ignoredEntries > 0) {
  console.log(`*** Ignored ${ignoredEntries} entries of unconfirmed themes with less than ${MIN_ORIGINS} origins`);
}
console.log(`*** All other origins count is:`);
console.log({allOtherOriginsCounts});
console.log(`*** All origins count is:`);
console.log({totalOriginsCounts});

// Create the themes data object and SVG charts for use in page building
console.log(`*** Creating charts for months: ${currentMonthsReadable.join(', ')}.`);

const themesWithCharts = Object.keys(themes).map(themeId => {
  const inputData = themes[themeId]
  const {id, name, monthlyData, sunset, slug} = inputData
  const metrics = ['origins', 'passingCWV', 'passingLCP', 'needsImproveLCP', 'poorLCP', 'passingCLS', 'needsImproveCLS', 'poorCLS', 'passingINP', 'needsImproveINP', 'poorINP']

  // Initialize data object with null arrays. Array indexes are in date order.
  const data = { mobile: {}, desktop: {} }
  CLIENTS.forEach(client => {
    metrics.forEach(metric => { data[client][metric] = Array(6).fill() })
  })

  monthlyData.forEach(dataset => {
    const {client, date, origins, pct_good_cwv, pct_good_lcp, pct_ni_lcp, pct_poor_lcp, pct_good_cls, pct_ni_cls, pct_poor_cls, pct_good_inp, pct_ni_inp, pct_poor_inp} = dataset
    const index = currentMonths.indexOf(date)
    if (index) {
      data[client].origins[index] = origins
      if (origins > 30) {
        data[client].passingCWV[index] = pct_good_cwv
        data[client].passingLCP[index] = pct_good_lcp
        data[client].needsImproveLCP[index] = pct_ni_lcp
        data[client].poorLCP[index] = pct_poor_lcp
        data[client].passingCLS[index] = pct_good_cls
        data[client].needsImproveCLS[index] = pct_ni_cls
        data[client].poorCLS[index] = pct_poor_cls
        data[client].passingINP[index] = pct_good_inp
        data[client].needsImproveINP[index] = pct_ni_inp
        data[client].poorINP[index] = pct_poor_inp
      }
    }

  })

  const charts = {}

  Object.keys(data).forEach(client => {
    const {origins, passingCWV, passingLCP, needsImproveLCP, poorLCP, passingCLS, needsImproveCLS, poorCLS, passingINP, needsImproveINP, poorINP} = data[client]

    charts[client] = {
      originsSvg: getLineSvg(origins, currentMonthsReadable),
      passingCwvSvg: getPassingCwvSvg(passingCWV, currentMonthsReadable),
      passingCwvAria: `Origins Passing All Core Web Vitals bar chart. The data is: ${passingCWV.join(', ')}% passing for the months ${currentMonthsReadable.join(', ')}.`,
      lcp: getStackedBarSvg(passingLCP, needsImproveLCP, poorLCP, currentMonthsReadable),
      cls: getStackedBarSvg(passingCLS, needsImproveCLS, poorCLS, currentMonthsReadable),
      inp: getStackedBarSvg(passingINP, needsImproveINP, poorINP, currentMonthsReadable),
    }
  })

  return {
    id,
    name,
    slug,
    sunset,
    data,
    charts,
  }
})

console.log(`*** ${themesWithCharts.length} themes generated.`);
console.log("**************************************************");

const output = {
  themes: themesWithCharts,
  dates: currentMonths,
  readableDates: currentMonthsReadable,
}

const outputFileName = getDateFileString(new Date())
writeDataFile(output, CACHE_DIR, `${outputFileName}.json`, 'Theme data')