const echarts = require('echarts');

// Green-red stacked bar chart
function getPassingCwvSvg(monthlyData, currentMonthsReadable, animation=false) {
  // In SSR mode the first container parameter is not required
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
function getLineSvg(monthlyData, currentMonthsReadable, animation = false) {
  // In SSR mode the first container parameter is not required
  let chart = echarts.init(null, null, {
    renderer: 'svg', // must use SVG rendering mode
    ssr: true, // enable SSR
    width: 460, // need to specify height and width
    height: 350
  });

  chart.setOption({
    animation,
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

function clamp(val, min, max) {
  return val > max ? max : val < min ? min : val;
}

// Single series bar chart (origins by theme version)
function getBarSvg(x, y, animation = false) {
  const bestWidth = x.length * 38 + 40
  const width = clamp(bestWidth, 350, 1048)

  let chart = echarts.init(null, null, {
    renderer: 'svg', // must use SVG rendering mode
    ssr: true, // enable SSR
    width, // need to specify height and width
    height: 350
  });

  chart.setOption({
    animation,
    xAxis: {
      data: x,
      name: 'Theme Version',
      nameLocation: 'center',
      nameTextStyle: { padding: [8, 0, 0, 0] },
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: y,
        type: 'bar',
        // label: {
        //   show: true,
        //   position: 'insideTop'
        // },
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
  getLineSvg,
  getPassingCwvSvg,
  getSparkColumnSvg,
  getStackedBarSvg,
  getBarSvg,
}
