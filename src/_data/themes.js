// Server-side code
const echarts = require('echarts');
const fs = require('fs')
const { readDataFile } = require('../../helpers');

const INPUT_FOLDER = '_processed_data'

const latestDataFile = fs.readdirSync(INPUT_FOLDER).sort().reverse()[0]
const input = readDataFile(`${INPUT_FOLDER}/${latestDataFile}`)
const themesObj = input.themes
const currentMonths = input.dates.sort()
const currentMonthsReadable = currentMonths.map(dateStr => {
  const parts = dateStr.split('_')
  return `${parts[1]}/${parts[0].slice(2)}`
})
console.log("**************************************************");

console.log(`*** Creating charts for months: ${currentMonthsReadable.join(', ')}.`);


const themes = Object.keys(themesObj).map(themeId => {
  const inputData = themesObj[themeId]
  const {id, name, monthlyData, sunset, slug} = inputData

  // Array indexes are in date order
  const data = {
    'mobile': {
      origins: Array(6).fill(),
      passingCWV: Array(6).fill(),
      passingLCP: Array(6).fill(),
      needsImproveLCP: Array(6).fill(),
      poorLCP: Array(6).fill(),
      passingCLS: Array(6).fill(),
      needsImproveCLS: Array(6).fill(),
      poorCLS: Array(6).fill(),
      passingINP: Array(6).fill(),
      needsImproveINP: Array(6).fill(),
      poorINP: Array(6).fill(),
    },
    'desktop': {
      origins: Array(6).fill(),
      passingCWV: Array(6).fill(),
      passingLCP: Array(6).fill(),
      needsImproveLCP: Array(6).fill(),
      poorLCP: Array(6).fill(),
      passingCLS: Array(6).fill(),
      needsImproveCLS: Array(6).fill(),
      poorCLS: Array(6).fill(),
      passingINP: Array(6).fill(),
      needsImproveINP: Array(6).fill(),
      poorINP: Array(6).fill(),
    },
  }

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

function getPassingCwvSvg(monthlyData, currentMonthsReadable) {
  // In SSR mode the first container parameter is not required
  let chart = echarts.init(null, null, {
    renderer: 'svg', // must use SVG rendering mode
    ssr: true, // enable SSR
    width: 300, // need to specify height and width
    height: 300
  });

  chart.setOption({
    xAxis: {
      data: currentMonthsReadable
    },
    yAxis: {},
    series: [
      {
        data: monthlyData,
        type: 'bar',
        stack: 'x',
        label: {
          show: true,
          position: 'insideTop'
        },
        itemStyle: {
          color: '#00916eff',
          borderColor: '#fff',
        }
      },
      {
        data: monthlyData.map(x => 100 - x),
        type: 'bar',
        stack: 'x',
        itemStyle: {
          color: '#e01a4c',
          borderColor: '#fff',
        }
      }
    ]
  });

  const svgStr = chart.renderToSVGString();

  // Disposing chart to release memory.
  chart.dispose();
  chart = null;

  return svgStr
}

function getLineSvg(monthlyData, currentMonthsReadable) {
  // In SSR mode the first container parameter is not required
  let chart = echarts.init(null, null, {
    renderer: 'svg', // must use SVG rendering mode
    ssr: true, // enable SSR
    width: 460, // need to specify height and width
    height: 300
  });

  chart.setOption({
    xAxis: {
      type: 'category',
      data: currentMonthsReadable
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: monthlyData,
        type: 'line',
      }
    ]
  });

  const svgStr = chart.renderToSVGString();

  // Disposing chart to release memory.
  chart.dispose();
  chart = null;

  return svgStr
}

console.log(`*** ${themes.length} themes built.`);
console.log("**************************************************");

module.exports = themes
