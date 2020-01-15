const Mocha = require('mocha')
const fs = require('fs')
const path = require('path')

function runMocha(test_file, tests, model) {
  global.solidatus_mocha_args = { test_file, tests, model }

  // Instantiate a Mocha instance.
  var mocha = new Mocha()

  mocha.addFile('commands/util/mochaDefs')

  // Run the tests.
  mocha.run(failures => {
    process.exitCode = failures ? 1 : 0 // exit with non-zero status if there were failures
  })
}

module.exports = runMocha
