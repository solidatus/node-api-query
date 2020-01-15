const _ = require('lodash')
const Model = require('../lib/model/Model')
const executeQuery = require('../lib/query/executeQuery')
const loadTests = require('./util/loadTests')
const loadModel = require('./util/loadModel')
const runMocha = require('./util/runMocha')

async function runTestsCommand(argv) {
  const tests = loadTests(argv.test_file)
  const modelResponse = await loadModel(argv)
  const model = new Model(modelResponse)

  runMocha(argv.test_file, tests, model)
}

module.exports = runTestsCommand
