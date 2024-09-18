const fs = require('fs')
const { readDataFile } = require('../../helpers');

const INPUT_FOLDER = '_processed_data'
const latestDataFile = fs.readdirSync(INPUT_FOLDER).sort().reverse()[0]
const input = readDataFile(`${INPUT_FOLDER}/${latestDataFile}`)

module.exports = input.date
