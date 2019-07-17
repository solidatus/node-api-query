const _ = require('lodash')
const yargs = require('yargs')
const fetch = require('node-fetch')
const Model = require('./lib/model/Model')
const EntityCollection = require('./lib/model/EntityCollection')
const executeQuery = require('./lib/query/executeQuery')

// Extract arguments from the command line
const argv = yargs
  .usage('Usage: node index.js <command> [arguments...]')
  .command('query', 'Execute a Solidatus Query against a given model', yargs => {
    return yargs
      .option('host', {
        demandOption: true,
        describe: 'The URL of the Solidatus instance',
        type: 'string'
      })
      .option('model', {
        demandOption: true,
        describe: 'ID of the model to query',
        type: 'string'
      })
      .option('query', {
        demandOption: true,
        describe: 'Solidatus query to execute',
        type: 'string'
      })
      .option('token', {
        demandOption: true,
        describe: 'Solidatus API token',
        type: 'string'
      })
  })
  .example(
    '$0 load --model 5d1c66e06137c40001013b80 --query "isAttribute() and $numIncoming = 0" --host https://trial.solidatus.com --token <API_TOKEN>'
  )
  .demandCommand()
  .help().argv

console.log(`Executing query:\n${argv.query}`)

async function loadModel() {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + argv.token
  }

  return await fetch(`${argv.host}/api/v1/models/${argv.model}/load`, {
    method: 'GET',
    headers
  }).then(function(response) {
    if (!response.ok) {
      throw Error(response.statusText)
    }
    return response.json()
  })
}

loadModel().then(modelResponse => {
  const model = new Model(modelResponse)
  const entities = executeQuery(argv.query, model)
  const output = _.map(entities, e => [...e.getParentsDescending(), e].map(e => e.name))
  console.log('\nResult:')
  console.log(JSON.stringify(output, null, 2))
})
