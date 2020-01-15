const _ = require('lodash')
const expect = require('chai').expect
const getTestResult = require('./getTestResult')
const loadTests = require('./loadTests')

const { test_file, tests, model } = global.solidatus_mocha_args

describe(`Saved queries in ${test_file}`, function() {
  _.each(tests, (test, name) => {
    it(name, () => {
      const actual = getTestResult(test, model)
      expect(actual).to.have.ordered.members(test.expect)
    })
  })
})
