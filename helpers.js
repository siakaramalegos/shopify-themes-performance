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
    width: 350, // need to specify height and width
    height: 350
  });

  chart.setOption({
    xAxis: {
      data: currentMonthsReadable,
      name: 'Month/Year',
      nameLocation: 'center',
      nameTextStyle: { padding: [8, 0, 0, 0] },
    },
    yAxis: {
      name: '% of origins',
      max: 100,
    },
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

// Green-red mini column chart
function getSparkColumnSvg(passingCWV, lastMonth) {
  // In SSR mode the first container parameter is not required
  let chart = echarts.init(null, null, {
    renderer: 'svg', // must use SVG rendering mode
    ssr: true, // enable SSR
    width: 100, // need to specify height and width
    height: 24,
  });

  chart.setOption({
    xAxis: {
      show: false,
    },
    yAxis: {
      show: false,
      data: [lastMonth],
    },
    series: [
      {
        data: [passingCWV],
        type: 'bar',
        stack: 'y',
        itemStyle: {
          color: '#00916eff',
          borderColor: '#fff',
        }
      },
      {
        data: [100 - passingCWV],
        type: 'bar',
        stack: 'y',
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
    height: 350
  });

  chart.setOption({
    xAxis: {
      type: 'category',
      data: currentMonthsReadable,
      name: 'Month/Year',
      nameLocation: 'center',
      nameTextStyle: { padding: [8, 0, 0, 0] },
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
function getStackedBarSvg(passingMonthly, needsImproveMonthly, poorMonthly, currentMonthsReadable, animation = false) {
  let chart = echarts.init(null, null, {
    renderer: 'svg', // must use SVG rendering mode
    ssr: true, // enable SSR
    width: 350, // need to specify height and width
    height: 350
  });

  chart.setOption({
    animation,
    xAxis: {
      data: currentMonthsReadable,
      name: 'Month/Year',
      nameLocation: 'center',
      nameTextStyle: { padding: [8, 0, 0, 0] },
    },
    yAxis: {
      name: '% of origins',
      max: 100,
    },
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
          color: '#ebb000',
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

module.exports = {
  readDataFile,
  getDateFileString,
  mungeData,
  writeDataFile,
  getLineSvg,
  getPassingCwvSvg,
  getSparkColumnSvg,
  getStackedBarSvg,
  getTrend,
}
