// Depth first traversal
class TraceIterator {
  constructor({ start, direction }) {
    this._start = start
    if (direction === 'left') {
      this._dir = 'incoming'
      this._end = 'source'
    } else {
      this._dir = 'outgoing'
      this._end = 'target'
    }
    this._stack = []
    this._current = {
      entity: this._start,
      i: -1
    }
    this._seen = {}

    // Advance over the start entity.
    this._advance()
  }

  hasNext() {
    return !!this._current.entity
  }

  contains(entity) {
    let el = null
    while (this.hasNext()) {
      el = this.next()
      if (el === entity) {
        return true
      }
    }
    return false
  }

  next() {
    if (!this.hasNext()) {
      throw new Error('No more elements')
    }

    let result = null
    if (this._current.i === -1) {
      result = this._current.entity
    } else {
      // Current entity is a transitions
      result = this._current.entity[this._dir][this._current.i]

      // Push its source
      const source = result[this._end]

      if (!this._seen[source.id]) {
        this._stack.push(source)
        this._seen[source.id] = true
      }
    }

    this._advance()

    return result
  }

  _advance() {
    const transitions = this._current.entity[this._dir]
    if (transitions && ++this._current.i < transitions.length) {
      // Index in range of incoming transitions. Continue.
      return
    }

    // Need to change attribute.
    this._current.entity = this._stack.pop()
    this._current.i = -1
    return
  }
}

module.exports = TraceIterator
