const _ = require('lodash')

class Transition {
  constructor(data, model) {
    const { id, properties } = data
    _.assign(this, { id, properties, model })
    this.isTransition = true
  }

  hasProperty(prop) {
    return _.has(this.properties, prop)
  }

  isRoot() {
    return false
  }

  getType() {
    return 'Transition'
  }
}

module.exports = Transition
