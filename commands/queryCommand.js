const _ = require('lodash')
const fetch = require('node-fetch')
const Model = require('../lib/model/Model')
const executeQuery = require('../lib/query/executeQuery')
const HttpsProxyAgent = require('https-proxy-agent')
const loadModel = require('./util/loadModel')

// change to be consistent with the other API
const getOutputForEntity = e => {
  if (e.isTransition) {
    return {
      type: 'transition',
      id: e.id,
      source: getOutputForEntity(e.source),
      target: getOutputForEntity(e.target),
      properties: e.properties
    }
  } else {
    return {
      type: e.getType(),
      id: e.id,
      path: [...e.getParentsDescending(), e].map(e => e.name),
      properties: e.properties
    }
  }
}

const queryModel = async argv => {
  console.log(`Fetching model from: '${argv.host}/api/v1/models/${argv.model}/load'`)
  const modelResponse = await loadModel(argv)
  const model = new Model(modelResponse)
  console.log(`Model ${model.id} loaded successfully!`)
  console.log(`Executing query:${argv.query} to model ${model.id}`)
  const entities = executeQuery(argv.query, model)
  const output = _.map(entities, e => getOutputForEntity(e))
  return output
}

const queryCommand = argv => {
  queryModel(argv).then(output => {
    console.log('\nResult:')
    console.log(JSON.stringify(output, null, 2))
    console.log('----')
  })
}

module.exports = {
  queryCommand: queryCommand,
  queryModel: queryModel
}
