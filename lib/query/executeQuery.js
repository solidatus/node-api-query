const _ = require('lodash')
const { toQuery, QUERY_ERROR_NAMES } = require('./utils')
const TraceIterator = require('../model/TraceIterator')

const DEFAULT_PREDICATES = {
  equals(a, b) {
    if (!isNaN(a) && !isNaN(b)) {
      return parseFloat(a) === parseFloat(b)
    }
    return `${a}`.toUpperCase() === `${b}`.toUpperCase()
  },
  less_than(a, b) {
    return parseFloat(a) < parseFloat(b)
  },
  greater_than(a, b) {
    return parseFloat(a) > parseFloat(b)
  },
  gt_or_equal(a, b) {
    return parseFloat(a) >= parseFloat(b)
  },
  lt_or_equal(a, b) {
    return parseFloat(a) <= parseFloat(b)
  },
  not_equals(a, b) {
    return !this.context.predicates.equals(a, b)
  }
}

const FALSE_STRINGS = {
  false: true,
  undefined: true,
  null: true,
  '': true,
  no: true,
  0: true,
  f: true
}

const ENTITY_PREDICATES = {
  ...DEFAULT_PREDICATES,
  cs_equals(a, b) {
    return `${a}` === `${b}`
  },
  contains(a, b) {
    if (a && _.isFunction(a.contains)) {
      return a.contains(b)
    }
    if (_.isString(a) && _.isString(b)) {
      return a.toLowerCase().indexOf(b.toLowerCase()) >= 0
    }
    return _.includes(a, b)
  },
  begins_with(a, b) {
    return _.startsWith(a, b)
  },
  ends_with(a, b) {
    return _.endsWith(a, b)
  },
  is_layer(e) {
    const entity = e || this.entity
    return entity.getType() == 'Layer'
  },
  is_object(e) {
    const entity = e || this.entity
    return entity.getType() == 'Object'
  },
  is_group(e) {
    const entity = e || this.entity
    return entity.getType() == 'Group'
  },
  is_attribute(e) {
    const entity = e || this.entity
    return entity.getType() == 'Attribute'
  },
  is_transition(e) {
    const entity = e || this.entity
    return entity.isTransition
  },
  is_trace_active() {
    return false
  },
  in_current_trace(e) {
    return false
  },
  has_property() {
    let entity = null
    let prop = null
    if (this.args.length === 2) {
      entity = this.args[0].val
      prop = this.args[1]
    } else {
      entity = this.entity
      prop = this.args[0]
    }

    if (prop && prop.type === 'value') {
      return _.has(entity.properties, prop.val)
    }
    if (prop && prop.type === 'property-value') {
      return !_.isUndefined(prop.val)
    }
    return false
  },
  is_empty() {
    if (this.args.length === 0) {
      return true
    }
    const arg = this.args[0]
    if (_.isString(arg.val)) {
      if (arg.type === 'value') {
        return `${this.entity.properties[arg.val]}`.trim() === ''
      }
      return arg.val.trim() === ''
    }

    return _.isEmpty(arg.val)
  },
  is_true(val) {
    return !FALSE_STRINGS[`${val}`.toLowerCase()]
  },
  is_false(val) {
    return FALSE_STRINGS[`${val}`.toLowerCase()]
  },
  true() {
    return true
  },
  false() {
    return false
  },
  display_rule(...args) {
    return false
  }
}

// Add camel case predicate names
_.each(ENTITY_PREDICATES, (fn, name) => {
  ENTITY_PREDICATES[_.camelCase(name)] = fn
})

const SPECIAL_PROPERTIES = {
  Array: {
    length: arr => arr.length,
    count: arr => arr.length
  },
  Entity: {
    $type: e => e.getType(),
    $name: e => e.name,
    $id: e => e.id,
    $parent: e => e.parent,
    $parents: e => e.getParentsDescending(),
    $object: e => _.find(e.getPath(), p => p.getType() == 'Object'),
    $root: e => e.getRoot(),
    $layer: e => e.getRoot(),
    $attributes: e => _.filter(e.getChildrenDeep(), c => c.getType() == 'Attribute'),
    $numChildren: e => (e.children && e.children.length) || 0,
    $children: e => (e.children && e.children.slice(0)) || [],
    $numChildrenDeep: e => e.getChildrenDeep().length,
    $childrenDeep: e => e.getChildrenDeep(),
    $numIncoming: e => e.getIncomingDeep().length,
    $numOutgoing: e => e.getOutgoingDeep().length,
    $incoming: e => e.getIncomingDeep(),
    $outgoing: e => e.getOutgoingDeep(),
    $incomingTrace(e) {
      return new TraceIterator({ start: e, direction: 'left' })
    },
    $outgoingTrace(e) {
      return new TraceIterator({ start: e, direction: 'right' })
    }
  },
  Transition: {
    $type: () => 'Transition',
    $id: e => e.id,
    $source: e => e.source,
    $target: e => e.target
  }
}

class EvaluationContext {
  constructor({ entity, predicates = ENTITY_PREDICATES, specialProperties = SPECIAL_PROPERTIES }) {
    this.entity = entity
    this._defs = []
    this.predicates = predicates
    this.specialProperties = specialProperties
  }

  pushDef(variable, value) {
    this._defs.push({ variable, value })
  }

  redef(value) {
    _.last(this._defs).value = value
  }

  popDef() {
    this._defs.pop()
  }

  getDef(variable) {
    return _.findLast(this._defs, def => def.variable === variable)
  }

  resolveProperty(entity, property) {
    // Try getting a special property
    const type =
      (entity.isEntity && 'Entity') ||
      (entity.isTransition && 'Transition') ||
      (_.isArray(entity) && 'Array') ||
      null

    if (type) {
      const specialPropertyAccessor = this.specialProperties[type][property]
      if (specialPropertyAccessor) {
        return { val: specialPropertyAccessor.call({ context: this }, entity) }
      }
    }

    // Not a special property - just a normal entity property
    if (entity.hasProperty && entity.hasProperty(property)) {
      return { val: entity.properties[property] }
    }

    return null
  }
}

const evaluate = {
  SENTENCE(node, context) {
    return evaluate[node.type](node, context)
  },

  NOT(node, context) {
    return !evaluate.SENTENCE(node.sentence, context)
  },

  AND(node, context) {
    return evaluate.SENTENCE(node.lhs, context) && evaluate.SENTENCE(node.rhs, context)
  },

  OR(node, context) {
    return evaluate.SENTENCE(node.lhs, context) || evaluate.SENTENCE(node.rhs, context)
  },

  ALL(node, context) {
    const list = evaluate.TERM(node.list, context).val
    if (!list) {
      return true
    }

    if (!_.isArray(list) && !_.isFunction(list.next)) {
      const err = new Error(`Property is not enumerable: '${node.variable.name}'`)
      err.name = QUERY_ERROR_NAMES.PropertyNotEnumerableError
      throw err
    }

    context.pushDef(node.variable.name)

    let result = true
    if (_.isArray(list)) {
      result = _.every(list, item => {
        context.redef(item)
        return evaluate.SENTENCE(node.sentence, context)
      })
    } else {
      while (list.hasNext()) {
        const item = list.next()
        context.redef(item)
        if (!evaluate.SENTENCE(node.sentence, context)) {
          result = false
          break
        }
      }
    }

    context.popDef()
    return result
  },

  ANY(node, context) {
    const list = evaluate.TERM(node.list, context).val
    if (!list) {
      return true
    }

    if (!_.isArray(list) && !_.isFunction(list.next)) {
      const err = new Error(`Property is not enumerable: '${node.variable.name}'`)
      err.name = QUERY_ERROR_NAMES.PropertyNotEnumerableError
      throw err
    }

    context.pushDef(node.variable.name)

    let result = false
    if (_.isArray(list)) {
      result = _.some(list, item => {
        context.redef(item)
        return evaluate.SENTENCE(node.sentence, context)
      })
    } else {
      while (list.hasNext()) {
        const item = list.next()
        context.redef(item)
        if (evaluate.SENTENCE(node.sentence, context)) {
          result = true
          break
        }
      }
    }

    context.popDef()
    return result
  },

  PREDICATE(node, context) {
    const predicate = context.predicates[node.name]
    if (!predicate) {
      const err = new Error(`Cannot get predicate '${node.name}'`)
      err.name = QUERY_ERROR_NAMES.UnknownPredicateError
      throw err
    }

    const predicateContext = {
      entity: context.entity,
      args: _.map(node.args, arg => evaluate.TERM(arg, context)),
      context
    }

    return predicate.apply(predicateContext, _.map(predicateContext.args, arg => arg.val))
  },

  TERM(node, context) {
    if (node.type === 'OBJECT') {
      return evaluate.OBJECT(node, context)
    }
    if (node.type === 'VALUE') {
      return evaluate.VALUE(node, context)
    }

    throw new Error(`Invalid TERM node type '${node.type}'`)
  },

  OBJECT(node, context) {
    let cur = context.entity
    const len = node.path.length

    for (let i = 0; i < len && cur; i++) {
      const part = node.path[i]
      if (i === 0) {
        // For the first part, try to match as a variable
        const def = context.getDef(part)
        if (def) {
          cur = def.value
          continue
        }
      }

      const result = context.resolveProperty(cur, part)
      if (!result) {
        return { val: undefined, type: 'property-value' }
      }

      cur = result.val
    }

    return { val: cur, type: 'property-value' }
  },

  VALUE(node) {
    return {
      val: node.value,
      type: 'value'
    }
  }
}

const executeQuery = (query, testSet) => {
  const compiledQuery = toQuery(query)
  let entities = null
  if (_.isArray(testSet)) {
    entities = testSet
  } else if (testSet.isEntity) {
    entities = [testSet]
  } else if (testSet.getAllEntitiesAndTransitions) {
    entities = testSet.getAllEntitiesAndTransitions()
  } else {
    throw new Error('Invalid argument: Requires entities to execute query against')
  }

  const results = _.filter(entities, entity => {
    const evalContext = new EvaluationContext({ entity })
    return evaluate.SENTENCE(compiledQuery.ast, evalContext)
  })
  return results
}

module.exports = executeQuery
