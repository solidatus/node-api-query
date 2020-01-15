const yargs = require('yargs')
const queryCommand = require('./commands/queryCommand')
const runTestsCommand = require('./commands/runTestsCommand')
const updateTestsCommand = require('./commands/updateTestsCommand')

const yargsAddHostParams = yargs =>
  yargs
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
    .option('token', {
      demandOption: true,
      describe: 'Solidatus API token',
      type: 'string'
    })
    .option('proxy', {
      describe: 'The URL of the proxy',
      type: 'string'
    })

// Extract arguments from the command line
const argv = yargs
  .usage('Usage: node index.js <command> [arguments...]')
  .command(
    'query',
    'Execute a Solidatus Query against a given model',
    yargs => {
      return yargsAddHostParams(yargs).option('query', {
        demandOption: true,
        describe: 'Solidatus query to execute',
        type: 'string'
      })
    },
    queryCommand
  )
  .command(
    'run-tests <test_file>',
    'Run a saved test file against a given model',
    yargs => {
      return yargsAddHostParams(yargs)
    },
    runTestsCommand
  )
  .command(
    'update-tests <test_file>',
    'Update the expected responses in the test file based on the current results',
    yargs => {
      return yargsAddHostParams(yargs)
    },
    updateTestsCommand
  )
  .example(
    '$0 query --model 5d1c66e06137c40001013b80 --query "isAttribute() and $numIncoming = 0" --host https://trial.solidatus.com --token <API_TOKEN>'
  )
  .demandCommand()
  .help().argv
