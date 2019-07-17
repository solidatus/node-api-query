var bind = function(fn, me) {
    return function() {
      return fn.apply(me, arguments)
    }
  },
  extend = function(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key]
    }
    function ctor() {
      this.constructor = child
    }
    ctor.prototype = parent.prototype
    child.prototype = new ctor()
    child.__super__ = parent.prototype
    return child
  },
  hasProp = {}.hasOwnProperty

var AllNode,
  AndNode,
  AnyNode,
  AstNode,
  DefinitionNode,
  NotNode,
  ObjectNode,
  OrNode,
  PredicateNode,
  SentenceNode,
  TermNode,
  ValueNode
AstNode = (function() {
  AstNode.prototype.getChildren = function() {
    return []
  }

  AstNode.prototype.walkAst = function(func) {
    var child, i, len, ref
    if (func(this) === false) {
      return
    }
    ref = this.getChildren()
    for (i = 0, len = ref.length; i < len; i++) {
      child = ref[i]
      child.walkAst(func)
    }
  }

  function AstNode(_data) {
    this._data = _data
    this.walkAst = bind(this.walkAst, this)
    this.getChildren = bind(this.getChildren, this)
    if (!this._data) {
      throw new Error('data parameter is not optional')
    }
  }

  return AstNode
})()
SentenceNode = (function(superClass) {
  extend(SentenceNode, superClass)

  SentenceNode.prototype.type = 'SENTENCE'

  SentenceNode.create = function(data) {
    switch (data.type) {
      case 'NOT':
        return NotNode.create(data)
      case 'AND':
        return AndNode.create(data)
      case 'OR':
        return OrNode.create(data)
      case 'PREDICATE':
        return PredicateNode.create(data)
      case 'ALL':
        return AllNode.create(data)
      case 'ANY':
        return AnyNode.create(data)
      default:
        throw new Error('Invalid SentenceNode')
    }
  }

  function SentenceNode() {
    SentenceNode.__super__.constructor.apply(this, arguments)
    if (this._data.type !== this.type) {
      throw new Error('Invalid SentenceNode')
    }
  }

  return SentenceNode
})(AstNode)
NotNode = (function(superClass) {
  extend(NotNode, superClass)

  NotNode.prototype.type = 'NOT'

  NotNode.prototype.getChildren = function() {
    return [this.sentence]
  }

  NotNode.create = function(data) {
    return new NotNode(data)
  }

  function NotNode() {
    this.getChildren = bind(this.getChildren, this)
    NotNode.__super__.constructor.apply(this, arguments)
    this.sentence = SentenceNode.create(this._data.sentence)
  }

  NotNode.prototype.toString = function() {
    return 'NOT (' + this.sentence + ')'
  }

  return NotNode
})(SentenceNode)
AndNode = (function(superClass) {
  extend(AndNode, superClass)

  AndNode.prototype.type = 'AND'

  AndNode.prototype.getChildren = function() {
    return [this.lhs, this.rhs]
  }

  AndNode.create = function(data) {
    return new AndNode(data)
  }

  function AndNode() {
    this.getChildren = bind(this.getChildren, this)
    AndNode.__super__.constructor.apply(this, arguments)
    this.lhs = SentenceNode.create(this._data.lhs)
    this.rhs = SentenceNode.create(this._data.rhs)
  }

  AndNode.prototype.toString = function() {
    return '(' + this.lhs + ') AND (' + this.rhs + ')'
  }

  return AndNode
})(SentenceNode)
OrNode = (function(superClass) {
  extend(OrNode, superClass)

  OrNode.prototype.type = 'OR'

  OrNode.prototype.getChildren = function() {
    return [this.lhs, this.rhs]
  }

  OrNode.create = function(data) {
    return new OrNode(data)
  }

  function OrNode() {
    this.getChildren = bind(this.getChildren, this)
    OrNode.__super__.constructor.apply(this, arguments)
    this.lhs = SentenceNode.create(this._data.lhs)
    this.rhs = SentenceNode.create(this._data.rhs)
  }

  OrNode.prototype.toString = function() {
    return '(' + this.lhs + ') OR (' + this.rhs + ')'
  }

  return OrNode
})(SentenceNode)
PredicateNode = (function(superClass) {
  extend(PredicateNode, superClass)

  PredicateNode.prototype.type = 'PREDICATE'

  PredicateNode.prototype.getChildren = function() {
    return this.args
  }

  PredicateNode.create = function(data) {
    return new PredicateNode(data)
  }

  function PredicateNode() {
    this.getChildren = bind(this.getChildren, this)
    var arg
    PredicateNode.__super__.constructor.apply(this, arguments)
    this.name = this._data.predicate.name || this._data.predicate
    this.character = this._data.predicate.character || this._data.predicate
    this.args = function() {
      var i, len, ref, results
      ref = this._data.args
      results = []
      for (i = 0, len = ref.length; i < len; i++) {
        arg = ref[i]
        results.push(TermNode.create(arg))
      }
      return results
    }.call(this)
  }

  PredicateNode.prototype.toString = function() {
    return this.name + '(' + this.args.join(' ,') + ')'
  }

  return PredicateNode
})(SentenceNode)
AllNode = (function(superClass) {
  extend(AllNode, superClass)

  AllNode.prototype.type = 'ALL'

  AllNode.prototype.getChildren = function() {
    return [this.variable, this.list, this.sentence]
  }

  AllNode.create = function(data) {
    return new AllNode(data)
  }

  function AllNode() {
    this.getChildren = bind(this.getChildren, this)
    AllNode.__super__.constructor.apply(this, arguments)
    this.variable = DefinitionNode.create(this._data['var'])
    this.list = TermNode.create(this._data.list)
    this.sentence = SentenceNode.create(this._data.sentence)
  }

  AllNode.prototype.toString = function() {
    return 'ALL[' + this.variable + ' IN ' + this.list + ', ' + this.sentence + ']'
  }

  return AllNode
})(SentenceNode)
AnyNode = (function(superClass) {
  extend(AnyNode, superClass)

  AnyNode.prototype.type = 'ANY'

  AnyNode.prototype.getChildren = function() {
    return [this.variable, this.list, this.sentence]
  }

  AnyNode.create = function(data) {
    return new AnyNode(data)
  }

  function AnyNode() {
    this.getChildren = bind(this.getChildren, this)
    AnyNode.__super__.constructor.apply(this, arguments)
    this.variable = DefinitionNode.create(this._data['var'])
    this.list = TermNode.create(this._data.list)
    this.sentence = SentenceNode.create(this._data.sentence)
  }

  AnyNode.prototype.toString = function() {
    return 'ANY[' + this.variable + ' IN ' + this.list + ', ' + this.sentence + ']'
  }

  return AnyNode
})(SentenceNode)
DefinitionNode = (function(superClass) {
  extend(DefinitionNode, superClass)

  DefinitionNode.prototype.type = 'DEFINITION'

  DefinitionNode.create = function(data) {
    return new DefinitionNode(data)
  }

  function DefinitionNode() {
    DefinitionNode.__super__.constructor.apply(this, arguments)
    this.name = this._data
  }

  DefinitionNode.prototype.toString = function() {
    return this.name
  }

  return DefinitionNode
})(AstNode)
TermNode = (function(superClass) {
  extend(TermNode, superClass)

  TermNode.prototype.type = 'TERM'

  TermNode.create = function(data) {
    switch (data.type) {
      case 'OBJECT':
        return ObjectNode.create(data)
      case 'STRING':
        return ValueNode.create(data)
      case 'NUMBER':
        return ValueNode.create(data)
      default:
        throw new Error('Invalid TermNode')
    }
  }

  function TermNode() {
    TermNode.__super__.constructor.apply(this, arguments)
  }

  return TermNode
})(AstNode)
ObjectNode = (function(superClass) {
  extend(ObjectNode, superClass)

  ObjectNode.prototype.type = 'OBJECT'

  ObjectNode.create = function(data) {
    return new ObjectNode(data)
  }

  function ObjectNode() {
    ObjectNode.__super__.constructor.apply(this, arguments)
    if (this._data.type !== 'OBJECT') {
      throw new Error('Invalid ObjectNode')
    }
    this.path = this._data.path
  }

  ObjectNode.prototype.toString = function() {
    return this.path.join('.')
  }

  return ObjectNode
})(TermNode)
ValueNode = (function(superClass) {
  extend(ValueNode, superClass)

  ValueNode.prototype.type = 'VALUE'

  ValueNode.create = function(data) {
    return new ValueNode(data)
  }

  function ValueNode() {
    ValueNode.__super__.constructor.apply(this, arguments)
    if (!(this._data.type === 'STRING' || this._data.type === 'NUMBER')) {
      throw new Error('Invalid ValueNode')
    }
    this.value = this._data.value
  }

  ValueNode.prototype.toString = function() {
    return "'" + ('' + this.value).replace(/'/g, "\\'") + "'"
  }

  return ValueNode
})(TermNode)

module.exports = {
  SentenceNode: SentenceNode,
  NotNode: NotNode,
  AndNode: AndNode,
  OrNode: OrNode,
  PredicateNode: PredicateNode,
  AllNode: AllNode,
  AnyNode: AnyNode,
  DefinitionNode: DefinitionNode,
  TermNode: TermNode,
  ObjectNode: ObjectNode,
  ValueNode: ValueNode
}
