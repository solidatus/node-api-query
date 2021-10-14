const _ = require('lodash')
const fetch = require('node-fetch')
const Model = require('../lib/model/Model')
const executeQuery = require('../lib/query/executeQuery')
const HttpsProxyAgent = require('https-proxy-agent')
const loadModel = require('./util/loadModel')

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

const queryModel = async argv => {
  console.log(`Loading model with id: ${argv.model}`)
  const modelResponse = await loadModel(argv)
  const model = new Model(modelResponse)
  console.log(`Model ${model.id}`)
  console.log(`Applying query ${argv.query} to model ${model.id}`)
  const entities = executeQuery(argv.query, model)
  const output = _.map(entities, e => getOutputForEntity(e))
  return output
}

const queryCommand = argv => {
  console.log(`Fetching model from: '${argv.host}/api/v1/models/${argv.model}/load'`)
  console.log(`Executing query:\n${argv.query}`)
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
