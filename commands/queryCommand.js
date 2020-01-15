const _ = require('lodash')
const fetch = require('node-fetch')
const Model = require('../lib/model/Model')
const executeQuery = require('../lib/query/executeQuery')
const HttpsProxyAgent = require('https-proxy-agent')
const loadModel = require('./util/loadModel')

module.exports = argv => {
  console.log(`Fetching model from: '${argv.host}/api/v1/models/${argv.model}/load'`)
  console.log(`Executing query:\n${argv.query}`)

  loadModel(argv).then(modelResponse => {
    const model = new Model(modelResponse)
    const entities = executeQuery(argv.query, model)
    const getOutputForEntity = e => {
      if (e.isTransition) {
        return {
          type: 'transition',
          source: getOutputForEntity(e.source),
          target: getOutputForEntity(e.target),
          properties: e.properties
        }
      } else {
        return {
          type: e.getType(),
          path: [...e.getParentsDescending(), e].map(e => e.name),
          properties: e.properties
        }
      }
    }
    const output = _.map(entities, e => getOutputForEntity(e))
    console.log('\nResult:')
    console.log(JSON.stringify(output, null, 2))
    console.log('----')
  })
}
