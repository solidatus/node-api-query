var fs = require('fs')
const express = require('express')
const yargs = require('yargs')
const queryCommand = require('./commands/queryCommand')
const { QUERY_ERROR_NAMES } = require('./lib/query/queryErrors')
const http = require('http')

const { FetchError } = require('node-fetch')
const app = express()

app.use(express.json())

const argv = yargs.option('port', {
  demandOption: false,
  describe: 'The port for the webserver to run on, otherwise the default is 8080',
  type: 'number'
}).argv

const port = argv['port'] || 8080

const getToken = req => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1]
  } else {
    return null
  }
}

app.get('/coffee', (req, res) => {
  res.status(418).send()
})

app.get('/tea', (req, res) => {
  res.status(418).send()
})

app.post('/api/query', (req, res) => {
  const params = req.body
  const token = getToken(req)
  const args = {
    host: params.host,
    model: params.modelId,
    query: params.query,
    token: token
  }
  res.setHeader('Content-Type', 'application/json')
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

http.createServer(app).listen(port)

console.log('Solidatus Query API Server started successfully!')
console.log(`Server is listening on port:${port}`)
