const parseQuery = require('./parseQuery')
const AST = require('./AST')
const { QUERY_ERROR_NAMES } = require('./utils')

class Query {
  constructor(query) {
    try {
      const data = parseQuery(query)
      this.ast = AST.SentenceNode.create(data)
    } catch (e) {
      e.name = QUERY_ERROR_NAMES.ParseError
      throw e
    }
  }

  toString() {
    return this.ast.toString()
  }
}

module.exports = Query
