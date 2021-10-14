const express = require('express')
const yargs = require('yargs')
const queryCommand = require('./commands/queryCommand')
const { QUERY_ERROR_NAMES } = require('./lib/query/queryErrors')
const https = require('https')
const http = require('http')
const { FetchError } = require('node-fetch')
const app = express()

const argv = yargs.option('host', {
  demandOption: true,
  describe: 'The URL of the Solidatus instance',
  type: 'string'
}).argv

app.get('/api/query', (req, res, next) => {
  const params = req.query
  const apiKey = req.headers['solidatus-api']
  const args = {
    host: argv['host'],
    model: params.modelId,
    query: params.query,
    token: apiKey
  }
  queryCommand
    .queryModel(args)
    .then(output => {
      res.status(200).send(output)
    })
    .catch(err => {
      if (
        err.name == QUERY_ERROR_NAMES.ParseError ||
        QUERY_ERROR_NAMES.SyntaxError ||
        QUERY_ERROR_NAMES.UnknownPredicateError ||
        QUERY_ERROR_NAMES.PropertyNotEnumerableError
      ) {
        res.status(400).send({
          status: 400,
          error: 'Bad Request',
          message: err.message
        })
      } else if (err instanceof FetchError) {
        res.status(400).send({
          status: 400,
          error: 'Bad Request',
          message: `A fetch error has occurred for domain ${argv['host']}`
        })
      } else if (err.message == 'Unauthorized') {
        res.status(401).send({
          status: 404,
          error: 'Not Found',
          message: `Model with id:${params.modelId} not found`
        })
      } else if (err.message == 'Not Found') {
        res.status(404).send({
          status: 404,
          error: 'Not Found',
          message: `Model with id:${params.modelId} not found`
        })
      } else {
        res.status(500).send({
          status: 500,
          error: 'Internal Server Error',
          message: 'No message available'
        })
      }
    })
})

http.createServer(app).listen(80, () => console.log(`listeing at http://localhost:80`))
https.createServer(app).listen(443, () => console.log(`listeing at http://localhost:443`))
