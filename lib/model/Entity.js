const _ = require('lodash')

class Entity {
  constructor(data, model) {
    const { id, name, properties, parent, children } = data
    _.assign(this, { id, name, properties, parent, children, model })
    this.isEntity = true
  }

  hasChildren() {
    return this.children && this.children.length
  }

  isRoot() {
    return !this.parent
  }

  getType() {
    if (this.isRoot()) {
      return 'Layer'
    } else if (this.parent.isRoot()) {
      return 'Object'
    } else if (this.hasChildren()) {
      return 'Group'
    } else {
      return 'Attribute'
    }
  }

  getRoot() {
    if (this._root) {
      return this._root
    }
    let root = this
    while (root.parent) {
      root = root.parent
    }
    this._root = root
    return root
  }

  hasProperty(prop) {
    return _.has(this.properties, prop)
  }

  hasIncoming() {
    return this.incoming && this.incoming.length
  }

  hasOutgoing() {
    return this.outgoing && this.outgoing.length
  }

  getParents() {
    const parents = []
    let cur = this.parent
    while (cur) {
      parents.push(cur)
      cur = cur.parent
    }
    return parents
  }

  getParentsDescending() {
    const parents = []
    let cur = this.parent
    while (cur) {
      parents.unshift(cur)
      cur = cur.parent
    }
    return parents
  }

  getPath() {
    const path = this.getParentsDescending()
    path.push(this)
    return path
  }

  getChildrenDeep() {
    if (!this.children) {
      return []
    }

    return _.flatMapDeep(this.children, c => {
      return [c, c.getChildrenDeep()]
    })
  }

  getOutgoingDeep() {
    const children = [this, ...this.getChildrenDeep()]
    const transitions = _.flatMap(_.filter(children, c => c.outgoing), c => c.outgoing)
    return transitions
  }

  getIncomingDeep() {
    const children = [this, ...this.getChildrenDeep()]
    const transitions = _.flatMap(_.filter(children, c => c.incoming), c => c.incoming)
    return transitions
  }

  getTargetRootCounts() {
    const roots = {}

    _.forEach(this.getOutgoingDeep(), t => {
      const root = t.target.getRoot()
      if (!roots[root.id]) {
        roots[root.id] = 1
      } else {
        roots[root.id]++
      }
    })

    return roots
  }

  getSourceRootCounts() {
    const roots = {}

    _.forEach(this.getIncomingDeep(), t => {
      const root = t.source.getRoot()
      if (!roots[root.id]) {
        roots[root.id] = 1
      } else {
        roots[root.id]++
      }
    })

    return roots
  }

  getTransitionTo(target) {
    return _.find(this.outgoing, transition => transition.target === target)
  }

  getTransitionFrom(source) {
    return _.find(this.incoming, transition => transition.source === source)
  }

  _addIncoming(transition) {
    this.incoming = this.incoming || []
    this.incoming.push(transition)
  }

  _addOutgoing(transition) {
    this.outgoing = this.outgoing || []
    this.outgoing.push(transition)
  }
}

module.exports = Entity
