const CleanCSS = require('clean-css');

module.exports = {
  cssmin: code => {
    return new CleanCSS({}).minify(code).styles;
  },
  sortThemes: (themes) => {
    return themes.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      // a must be equal to b
      return 0;
    })
  },
}
