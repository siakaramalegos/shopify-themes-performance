const fs = require('fs')
const echarts = require('echarts');

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

// Green-red stacked bar chart
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

// Line chart (for origins by month)
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

// Red-yellow-green stacked bar chart
function getStackedBarSvg(passingMonthly, needsImproveMonthly, poorMonthly, currentMonthsReadable) {
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
    yAxis: { max: 100 },
    series: [
      {
        data: passingMonthly,
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
        data: needsImproveMonthly,
        type: 'bar',
        stack: 'x',
        itemStyle: {
          color: '#ffcf00ff',
          borderColor: '#fff',
        }
      },
      {
        data: poorMonthly,
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

module.exports = {
  readDataFile,
  getDateFileString,
  mungeData,
  writeDataFile,
  getLineSvg,
  getPassingCwvSvg,
  getStackedBarSvg,
}