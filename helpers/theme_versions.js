const { readDataFile, sortFloats } = require("./helpers");
const RAW_VERSIONS_FOLDER = '_raw_versions_data/';
const CLIENTS = ['mobile', 'desktop']

function getThemeVersions(month, confirmedThemes) {
  // Read in theme version data
  const themeVersionsRawData = readDataFile(`${RAW_VERSIONS_FOLDER}${month}.json`)
  const themeIds = Object.keys(confirmedThemes)
  const themes = themeIds.map(id => {
    const name = confirmedThemes[id].name
    const versionData = themeVersionsRawData.filter((rawData, i) => {
      return rawData.theme_name === name && rawData.theme_id === id
    })
    const data = {
      mobile: {
        x: [],
        y: [],
      },
      desktop: {
        x: [],
        y: [],
      },
    }

    versionData.forEach(ele => {
      const minorVer = ele.theme_version.split('.').slice(0, 2).join('.')
      if (data[ele.client][minorVer]) {
        data[ele.client][minorVer] = data[ele.client][minorVer] + parseInt(ele.count, 10)
      } else {
        data[ele.client][minorVer] = parseInt(ele.count, 10)
      }
    })


    CLIENTS.forEach(client => {
      const sortedKeys = Object.keys(data[client])
        .filter(ver => !Object.is(NaN, parseFloat(ver)))
        .sort((a, b) => {
          const aNum = parseFloat(a)
          const bNum = parseFloat(b)
          return aNum - bNum
        })

      sortedKeys.forEach(ver => {
        if (!['x', 'y'].includes(ver)) {
          data[client].x.push(ver)
          data[client].y.push(data[client][ver])
        }
      })
    })

    return {
      id,
      name,
      ...data,
    }
  })

  return themes
}

module.exports = { getThemeVersions }
