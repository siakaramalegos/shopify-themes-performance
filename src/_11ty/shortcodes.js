const CLOUDNAME = "siacodes"
const FOLDER = "v1726601364/themevitals/"
const BASE_URL = `https://res.cloudinary.com/${CLOUDNAME}/image/upload/`;
const FALLBACK_WIDTHS = [ 600, 928, 1856 ];
const FALLBACK_WIDTH = 680;

// Social share image configuration
const SHARE_IMAGE_FILE = "share_image_tmpl_llund3.jpg"
// If font not in the root of your Cloudinary media library, need to prepend with `foldername:`
const TITLE_FONT = "titillium.woff2"
const TITLE_FONT_SIZE = "60"
const TITLE_BOTTOM_OFFSET = 406
const TAGLINE_FONT = "Arial"
const TAGLINE_FONT_SIZE = "36"
const TAGLINE_TOP_OFFSET = 306
const TAGLINE_LINE_HEIGHT = "10"
const TEXT_AREA_WIDTH = "710"
const TEXT_LEFT_OFFSET = 505
const TEXT_COLOR = "194238"

function getSrcset(file, widths) {
  const widthSet = widths ? widths : FALLBACK_WIDTHS
  return widthSet.map(width => {
    return `${getSrc(file, width)} ${width}w`;
  }).join(", ")
}

function getSrc(file, width) {
  return `${BASE_URL}q_auto,f_auto,w_${width ? width : FALLBACK_WIDTH}/${FOLDER}${file}`
}

// https://support.cloudinary.com/hc/en-us/articles/202521512-How-to-add-a-slash-character-or-any-other-special-characters-in-text-overlays-
function cloudinarySafeText(text) {
  return encodeURIComponent(text).replace(/(%2C)/g, '%252C').replace(/(%2F)/g, '%252F')
}

function socialImageUrl(title, description) {
  const width = "1280"
  const height = "640"
  const imageConfig = [
    `w_${width}`,
    `h_${height}`,
    "q_auto:best",
    "c_fill",
    "f_jpg",
  ].join(",")

  const titleConfig = [
    `w_${TEXT_AREA_WIDTH}`,
    'c_fit',
    `co_rgb:${TEXT_COLOR}`,
    'g_south_west',
    `x_${TEXT_LEFT_OFFSET}`,
    `y_${TITLE_BOTTOM_OFFSET}`,
    `l_text:${TITLE_FONT}_${TITLE_FONT_SIZE}:${cloudinarySafeText(title)}`,
  ].join(",")

  const taglineConfig = [
    `w_${TEXT_AREA_WIDTH}`,
    'c_fit',
    `co_rgb:${TEXT_COLOR}`,
    'g_north_west',
    `x_${TEXT_LEFT_OFFSET}`,
    `y_${TAGLINE_TOP_OFFSET}`,
    `l_text:${TAGLINE_FONT}_${TAGLINE_FONT_SIZE}_line_spacing_${TAGLINE_LINE_HEIGHT}:${cloudinarySafeText(description)}`,
  ].join(',');

  return `${BASE_URL}${imageConfig}/${titleConfig}/${taglineConfig}/${FOLDER}${SHARE_IMAGE_FILE}`
}

module.exports = {
  copyright: () => {
    const establishedYear = 2024
    const currentYear = new Date().getFullYear()

    if (establishedYear !== currentYear) {
      return `${establishedYear} - ${currentYear}`
    } else {
      return `${currentYear}`
    }
  },
  srcset: (file, widths) => getSrcset(file, widths),
  src: (file, width) => getSrc(file, width),
  socialImage: (title, description) => socialImageUrl(title, description),
  defaultSizes: () => "(min-width: 980px) 928px, calc(95.15vw + 15px)",
}