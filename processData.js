const { readDataFile, getDateFileString, mungeData, writeDataFile, getLineSvg, getPassingCwvSvg, getStackedBarSvg, getTrend, getSparkColumnSvg } = require('./helpers');
const RAW_FOLDER = '_raw_data/';
const CACHE_DIR = '_processed_data'
const MIN_ORIGINS = 100
const CLIENTS = ['mobile', 'desktop']
const CREATE_CHARTS = true // set to false when testing other parts

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
let themesObj = {}
let ignoredThemes = 0
let unconfirmedThemes = {}
let allOtherOriginsCounts = { mobile: {}, desktop: {} }
CLIENTS.forEach(client => {
  currentMonths.forEach(monthStr => { allOtherOriginsCounts[client][monthStr] = 0 })
})
let totalOriginsCounts = { mobile: {}, desktop: {} }
CLIENTS.forEach(client => {
  currentMonths.forEach(monthStr => { totalOriginsCounts[client][monthStr] = 0 })
})

console.log("**************************************************");
console.log("*** Beginning data parsing and chart building...");

// For each monthly data file, dump each theme's monthly data into the theme object
currentMonths.forEach(date => {
  const file = `${RAW_FOLDER}${date}.json`
  const fileData = readDataFile(file)

  // Early exit if no file data (file doesn't exist)
  if (!fileData[0]) {
    console.log(`*** Skipping ${date} file with no data!`);
    return
  }

  fileData.forEach(theme => {
    const {client, top_theme_name, origins, id, ...rawPercents} = theme
    const monthlyData = mungeData(origins, rawPercents, date, client)
    totalOriginsCounts[client][monthlyData.date] = totalOriginsCounts[client][monthlyData.date] + monthlyData.origins

    // Set id to null string if null
    const theme_store_id = id || 'null'

    if (!themesObj[theme_store_id]) {
      // check if confirmed theme, if so add it
      if (confirmedThemes[theme_store_id]) {
        const confirmedName = confirmedThemes[theme_store_id].name
        if (confirmedName !== top_theme_name){
          console.warn(`THEME NAME MISMATCH FOR ${theme_store_id}: Top theme name is ${top_theme_name} but confirmed theme name is ${confirmedName}. Using confirmed name.`);
        }
        themesObj[theme_store_id] = {
          id: theme_store_id,
          name: confirmedName,
          sunset: confirmedThemes[theme_store_id].sunset,
          slug: confirmedThemes[theme_store_id].slug,
          monthlyData: [ monthlyData ]
        }
      } else {
        // If not confirmed, add to other origins count
        allOtherOriginsCounts[client][monthlyData.date] = allOtherOriginsCounts[client][monthlyData.date] + monthlyData.origins

        // Add to unconfirmed themes list if not already there and have enough origins to matter
        if (!unconfirmedThemes[theme_store_id] && monthlyData.origins < MIN_ORIGINS) {
          unconfirmedThemes[theme_store_id] = top_theme_name
        }
      }
    } else {
      // Confirmed themes already in object, pass new month's data to it
      themesObj[id].monthlyData.push(monthlyData)
    }
  })

})

// Filter out low origins count for last month
const themes = Object.keys(themesObj).map(themeName => themesObj[themeName]).filter(theme => {
  const ignore = theme.monthlyData[theme.monthlyData.length - 1].origins < MIN_ORIGINS
  if (ignore) {
    ignoredThemes++

    theme.monthlyData.forEach(data => {
      allOtherOriginsCounts[data.client][data.date] = allOtherOriginsCounts[data.client][data.date] + data.origins
    });
  }
  return !ignore
})

// Housekeeping about bad theme names or theme_store_ids and general themes data
if (Object.keys(unconfirmedThemes).length > 1) {
  console.error(`*** UNCONFIRMED THEMES (with greater than ${MIN_ORIGINS}):`);
  console.log("*** ", {unconfirmedThemes});
}
if (ignoredThemes > 0) {
  console.log(`*** Ignored ${ignoredThemes} themes with less than ${MIN_ORIGINS} origins`);
}
console.log(`*** All other origins count is:`);
console.log({allOtherOriginsCounts});
console.log(`*** All origins count is:`);
console.log({totalOriginsCounts});

// Create the themes data object and SVG charts for use in page building
console.log(`*** Creating charts for months: ${currentMonthsReadable.join(', ')}.`);

const themesWithCharts = themes.map(theme => {
  const {id, name, monthlyData, sunset, slug} = theme
  const metrics = ['origins', 'passingCWV', 'passingLCP', 'needsImproveLCP', 'poorLCP', 'passingCLS', 'needsImproveCLS', 'poorCLS', 'passingINP', 'needsImproveINP', 'poorINP', 'passingTTFB', 'needsImproveTTFB', 'poorTTFB', 'passingFCP', 'needsImproveFCP', 'poorFCP']

  // Initialize data object with null arrays. Array indexes are in date order.
  const data = { mobile: {}, desktop: {} }
  CLIENTS.forEach(client => {
    metrics.forEach(metric => { data[client][metric] = Array(6).fill() })
  })
  monthlyData.forEach(dataset => {
    const {client, date, origins, pct_good_cwv, pct_good_lcp, pct_ni_lcp, pct_poor_lcp, pct_good_cls, pct_ni_cls, pct_poor_cls, pct_good_inp, pct_ni_inp, pct_poor_inp, pct_good_ttfb, pct_ni_ttfb, pct_poor_ttfb, pct_good_fcp, pct_ni_fcp, pct_poor_fcp} = dataset
    const index = currentMonths.indexOf(date)
    if (index >= 0) {
      data[client].origins[index] = origins
      if (origins > MIN_ORIGINS) {
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
        data[client].passingTTFB[index] = pct_good_ttfb
        data[client].needsImproveTTFB[index] = pct_ni_ttfb
        data[client].poorTTFB[index] = pct_poor_ttfb
        data[client].passingFCP[index] = pct_good_fcp
        data[client].needsImproveFCP[index] = pct_ni_fcp
        data[client].poorFCP[index] = pct_poor_fcp
      }
    }
  })

  const charts = {}

  if (CREATE_CHARTS) {
    Object.keys(data).forEach(client => {
      const {origins, passingCWV, passingLCP, needsImproveLCP, poorLCP, passingCLS, needsImproveCLS, poorCLS, passingINP, needsImproveINP, poorINP, passingTTFB, needsImproveTTFB, poorTTFB, passingFCP, needsImproveFCP, poorFCP} = data[client]

      charts[client] = {
        originsSvg: getLineSvg(origins, currentMonthsReadable),
        originsAria: `Origins by month line chart. The data is: ${origins.join(', ')} origins for the months ${currentMonthsReadable.join(', ')}.`,
        passingCwvSvg: getPassingCwvSvg(passingCWV, currentMonthsReadable),
        passingCwvAria: `Origins Passing All Core Web Vitals bar chart. The data is: ${passingCWV.join(', ')}% passing for the months ${currentMonthsReadable.join(', ')}.`,
        lcp: getStackedBarSvg(passingLCP, needsImproveLCP, poorLCP, currentMonthsReadable),
        lcpAria: `LCP bar chart. The data is: ${passingLCP.join(', ')}% of origins passing for the months ${currentMonthsReadable.join(', ')}.`,
        cls: getStackedBarSvg(passingCLS, needsImproveCLS, poorCLS, currentMonthsReadable),
        clsAria: `CLS bar chart. The data is: ${passingCLS.join(', ')}% of origins passing for the months ${currentMonthsReadable.join(', ')}.`,
        inp: getStackedBarSvg(passingINP, needsImproveINP, poorINP, currentMonthsReadable),
        inpAria: `INP bar chart. The data is: ${passingINP.join(', ')}% of origins passing for the months ${currentMonthsReadable.join(', ')}.`,
        ttfb: getStackedBarSvg(passingTTFB, needsImproveTTFB, poorTTFB, currentMonthsReadable),
        ttfbAria: `TTFB bar chart. The data is: ${passingTTFB.join(', ')}% of origins passing for the months ${currentMonthsReadable.join(', ')}.`,
        fcp: getStackedBarSvg(passingFCP, needsImproveFCP, poorFCP, currentMonthsReadable),
        fcpAria: `FCP bar chart. The data is: ${passingFCP.join(', ')}% of origins passing for the months ${currentMonthsReadable.join(', ')}.`,
      }
    })
  }

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

const latestTotalOrigins = {
  mobile: totalOriginsCounts.mobile[Object.keys(totalOriginsCounts.mobile).sort().reverse()[0]],
  desktop: totalOriginsCounts.desktop[Object.keys(totalOriginsCounts.desktop).sort().reverse()[0]]
}

const themesWithChartsAndAggr = themesWithCharts.map((theme, i) => {
  const {data, ...rest} = theme
  const aggregData = { mobile: {}, desktop: {} }

  Object.keys(aggregData).forEach(client => {
    const {origins, passingCWV, passingLCP, passingCLS, passingINP} = data[client]
    const lastOrigin = origins[origins.length - 1]
    const marketSharePct = Math.round(lastOrigin / latestTotalOrigins[client] * 10000) / 100
    const passingCWVnum = passingCWV[passingCWV.length - 1]

    aggregData[client] = {
      origins: lastOrigin,
      marketSharePct: marketSharePct.toFixed(2),
      passingCWVnum,
      passingCWV: passingCWVnum.toFixed(1),
      passingCWVchart: getSparkColumnSvg(passingCWVnum, lastMonth),
      passingLCP: passingLCP[passingLCP.length - 1].toFixed(1),
      passingCLS: passingCLS[passingCLS.length - 1].toFixed(1),
      passingINP: passingINP[passingINP.length - 1].toFixed(1),
      cwvTrend: getTrend(passingCWV),
      lcpTrend: getTrend(passingLCP),
      clsTrend: getTrend(passingCLS),
      inpTrend: getTrend(passingINP),
    }
  })


  return {
    summary: aggregData,
    ...rest,
  }
})

// Create rank fields.....
// Warning: sort mutates
CLIENTS.forEach(client => {
  themesWithChartsAndAggr.sort((a, b) => {
    // Sorting by largest first (reverse)
    if (a.summary[client].origins > b.summary[client].origins) {
      return -1;
    }
    if (a.summary[client].origins < b.summary[client].origins) {
      return 1;
    }
    // a must be equal to b
    return 0;
  }).map((theme, index) => {
    theme.summary[client].marketRank = index + 1
    return theme
  })
})

CLIENTS.forEach(client => {
  themesWithChartsAndAggr.sort((a, b) => {
    const aNum = parseFloat(a.summary[client].passingCWV)
    const bNum = parseFloat(b.summary[client].passingCWV)

    // Sorting by largest first (reverse)
    if (aNum > bNum) {
      return -1;
    }
    if (aNum < bNum) {
      return 1;
    }
    // a must be equal to b
    return 0;
  }).map((theme, index) => {
    theme.summary[client].cwvRank = index + 1
    return theme
  })
})

const output = {
  themes: themesWithChartsAndAggr,
}

const outputFileName = getDateFileString(new Date())
writeDataFile(output, CACHE_DIR, `${outputFileName}.json`, 'Theme data')
