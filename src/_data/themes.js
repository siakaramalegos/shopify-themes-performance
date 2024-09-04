// Server-side code
const echarts = require('echarts');

const CURRENT_MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
const THEMES = [
  {
    name: "Dawn",
    origins: [32012,12324,12134,23242,27992,12328],
    passingCWV: [83, 82, 83, 83, 85, 86],
    lcp: [
      [92, 92, 93, 95, 96, 96],
      [1, 2, 2, 2, 1, 2, 2],
      [7, 6, 5, 4, 2, 2]
    ]
  },
  {
    name: "Impact",
    origins: [2012,2324,2134,3242,7992,2328],
    passingCWV: [70, 73, 72, 70, 73, 72],
    lcp: [
      [92, 92, 93, 95, 96, 96],
      [1, 2, 2, 2, 1, 2, 2],
      [7, 6, 5, 4, 2, 2]
    ]
  }
]

function getPassingCwvSvg(monthlyData) {
  // In SSR mode the first container parameter is not required
  let chart = echarts.init(null, null, {
    renderer: 'svg', // must use SVG rendering mode
    ssr: true, // enable SSR
    width: 300, // need to specify height and width
    height: 300
  });

  chart.setOption({
    xAxis: {
      data: CURRENT_MONTHS
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

function getLineSvg(monthlyData) {
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
      data: CURRENT_MONTHS
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

const themesWithCharts = THEMES.map(theme => {
  return {
    ...theme,
    originsSvg: getLineSvg(theme.origins),
    passingCwvSvg: getPassingCwvSvg(theme.passingCWV),
    passingCwvAria: `Origins Passing All Core Web Vitals bar chart. The data is: ${theme.passingCWV.join(', ')}% passing for the months ${CURRENT_MONTHS.join(', ')}.`,
  }
})

module.exports = themesWithCharts
