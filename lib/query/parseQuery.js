const peg = require('pegjs')
const fs = require('fs')
const path = require('path')

const grammar = fs.readFileSync(path.resolve(__dirname, 'grammar.peg'), 'utf8')
const GeneratedParser = peg.generate(grammar)

function parseQuery(query) {
  try {
    return GeneratedParser.parse(query)
  } catch (e) {
    //console.warn(e)
    throw e
  }
}

module.exports = parseQuery
