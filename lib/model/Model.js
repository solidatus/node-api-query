const _ = require('lodash')
const Entity = require('./Entity')
const Transition = require('./Transition')

class Model {
  constructor(modelResponse) {
    this._init(modelResponse)
  }

  _init({ model, data }) {
    this.id = model.id
    this.name = model.name
    this._entities = {}
    this._transitions = {}
    this._roots = {}

    _.forEach(data.roots, rootId => {
      const entity = this._initEntity(data, rootId)
      this._roots[rootId] = entity
    })

    _.forEach(data.transitions, (transitionData, transitionId) =>
      this._initTransition(transitionData, transitionId)
    )
  }

  _initEntity(modelData, id, parent) {
    const entityData = modelData.entities[id]
    const e = new Entity({ ...entityData, id, parent }, this)
    this._entities[id] = e

    if (e.children) {
      e.children = _.map(e.children, childId => this._initEntity(modelData, childId, e))
    }

    return e
  }

  _initTransition(transitionData, id) {
    const t = new Transition({ ...transitionData, id }, this)
    this._transitions[id] = t

    t.source = this.getEntity(transitionData.source)
    t.target = this.getEntity(transitionData.target)
    t.source._addOutgoing(t)
    t.target._addIncoming(t)

    return t
  }

  getRoots() {
    return this._roots
  }

  getAllEntities() {
    return _.flatMap(this._roots, r => [r].concat(r.getChildrenDeep()))
  }

  getAllEntitiesAndTransitions() {
    return _.flatMap(this._roots, r => [r].concat(r.getChildrenDeep().concat(r.getOutgoingDeep())))
  }

  getEntity(id) {
    return this._entities[id] || this._transitions[id]
  }

  getTransitions() {
    return _.flatMap(this._roots, r => r.getOutgoingDeep())
  }
}

module.exports = Model
