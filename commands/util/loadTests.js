const fs = require('fs')

module.exports = file => {
  const json = fs.readFileSync(file)
  return JSON.parse(json)
}
