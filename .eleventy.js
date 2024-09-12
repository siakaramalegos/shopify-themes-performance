const fs = require("fs");
const filters = require('./src/_11ty/filters');
const shortcodes = require('./src/_11ty/shortcodes');

module.exports = function(eleventyConfig) {
  // Filters
  Object.keys(filters).forEach(filterName => {
    eleventyConfig.addFilter(filterName, filters[filterName])
  })

  // Shortcodes
  Object.keys(shortcodes).forEach(shortcodeName => {
    eleventyConfig.addShortcode(shortcodeName, shortcodes[shortcodeName])
  })

  eleventyConfig.setDataDeepMerge(true);
  eleventyConfig.addPassthroughCopy("src/img");
  // eleventyConfig.addPassthroughCopy("src/fonts");
  // eleventyConfig.addPassthroughCopy("src/javascript");
  // eleventyConfig.addPassthroughCopy("src/robots.txt");
  // eleventyConfig.addPassthroughCopy("_redirects");


  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = fs.readFileSync('_site/404.html');

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content_404);
          res.end();
        });
      }
    }
  });

  // Input directory: src
  // Output directory: _site
  return {
    templateFormats: [
      "md",
      "njk",
      "html",
    ],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: "/",

    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    passthroughFileCopy: true,
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
