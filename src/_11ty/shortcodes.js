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
}