const fs = require('fs')
const { readDataFile } = require('../../helpers/helpers');

const INPUT_FOLDER = '_processed_data'
const latestDataFile = fs.readdirSync(INPUT_FOLDER).sort().reverse()[0]
const { date, minOrigins, aggregations } = readDataFile(`${INPUT_FOLDER}/${latestDataFile}`)
const aggrCharts = readDataFile(`${INPUT_FOLDER}/0_aggrCharts.json`)

module.exports = {
  date,
  minOrigins,
  aggregations: aggregations.cwvAggregations,
  cwvChart: aggregations.cwvChart,
  totalOriginsChart: aggregations.originsChart,
  aggrCharts,
}
