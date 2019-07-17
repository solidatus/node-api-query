const _ = require('lodash')
const Query = require('./Query')

const escapeProperty = property => {
  const re = /^([a-z0-9-_$])+$/i
  if (!re.test(property)) {
    return `[${property.replace(/\\/g, '\\\\').replace(/]/g, '\\]')}]`
  }
  return property
}

const escapeString = string => {
  const re = /^([a-z0-9-_$])+$/i
  if (!re.test(string)) {
    return `${string.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}`
  }
  return string
}

const disjunction = queries => {
  return new Query(_.map(queries, q => `(${q})`).join(' or '))
}

const QUERY_ERROR_NAMES = {
  SyntaxError: 'SyntaxError',
  ParseError: 'ParseError',
  UnknownPredicateError: 'UnknownPredicateError',
  PropertyNotEnumerableError: 'PropertyNotEnumerableError'
}

const isQueryError = error => {
  return !!QUERY_ERROR_NAMES[error.name]
}

const toQuery = query => {
  let compiledQuery = null

  if (query instanceof Query) {
    compiledQuery = query
  } else if (_.isString(query)) {
    compiledQuery = new Query(query)
  } else {
    throw new Error(`Invalid argument 'query': ${query}`)
  }

  return compiledQuery
}

const isValid = query => {
  try {
    toQuery(query)
  } catch (e) {
    if (isQueryError(e)) {
      return false
    }
  }

  return true
}

module.exports = {
  escapeProperty,
  escapeString,
  disjunction,
  QUERY_ERROR_NAMES,
  isQueryError,
  toQuery,
  isValid
}
