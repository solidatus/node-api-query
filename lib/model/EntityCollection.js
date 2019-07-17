const _ = require('lodash')

module.exports = class EntityCollection {
  constructor(entities = []) {
    this.list = entities
    this.byId = _.keyBy(entities, 'id')
  }

  get length() {
    return this.list.length
  }

  get ids() {
    return _.keys(this.byId)
  }

  add(entity) {
    if (this.byId[entity.id]) {
      return false
    }

    this.list.push(entity)
    this.byId[entity.id] = entity
    return true
  }

  addCollection(entityCollection) {
    for (let i = 0, len = entityCollection.list.length; i < len; i++) {
      this.add(entityCollection.list[i])
    }
  }

  remove(entityId) {
    if (!this.byId[entityId]) {
      return false
    }

    _.remove(this.list, e => e.id === entityId)
    delete this.byId[entityId]
    return true
  }

  contains(entityId) {
    return !!this.byId[entityId]
  }

  equals(other) {
    return !_.difference(this.byId, other.Id).length
  }
}
