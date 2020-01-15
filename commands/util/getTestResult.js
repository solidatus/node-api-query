const _ = require('lodash')
const executeQuery = require('../../lib/query/executeQuery')

module.exports = (test, model) => {
  const entities = executeQuery(test.query, model)
  return _.map(entities, 'id')
}
