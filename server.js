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

const getToken = req => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1]
  } else {
    return null
  }
}

app.get('/api/query', (req, res) => {
  const params = req.query
  const token = getToken(req)
  const args = {
    host: argv['host'],
    model: params.modelId,
    query: params.query,
    token: token
  }
  queryCommand
    .queryModel(args)
    .then(output => {
      console.log('Query execution successfully completed!')
      res.status(200).send(output)
    })
    .catch(err => {
      console.error(err)
      if (
        err.name === QUERY_ERROR_NAMES.ParseError ||
        err.name === QUERY_ERROR_NAMES.SyntaxError ||
        err.name === QUERY_ERROR_NAMES.UnknownPredicateError ||
        err.name === QUERY_ERROR_NAMES.PropertyNotEnumerableError
      ) {
        res.status(400).send({
          status: 400,
          error: err.name,
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
          status: 401,
          error: 'Unauthorized',
          message: `Request has been unauthorized, token may be invalid or missing`
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
