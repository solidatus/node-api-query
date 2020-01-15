const fs = require('fs')

module.exports = (file, tests) => {
  fs.writeFileSync(file, JSON.stringify(tests, null, 2))
}
