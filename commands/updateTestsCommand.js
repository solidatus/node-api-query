const _ = require('lodash')
const Model = require('../lib/model/Model')
const loadTests = require('./util/loadTests')
const saveTests = require('./util/saveTests')
const loadModel = require('./util/loadModel')
const getTestResult = require('./util/getTestResult')

async function updateTestsCommand(argv) {
  const tests = loadTests(argv.test_file)

  const modelResponse = await loadModel(argv)
  const model = new Model(modelResponse)

  _.each(tests, (test, name) => {
    tests[name].expect = getTestResult(test, model)
    tests[name].lastUpdated = new Date()
  })

  saveTests(argv.test_file, tests)

  console.log(`Updated test file ${argv.test_file}`)
}

module.exports = updateTestsCommand
