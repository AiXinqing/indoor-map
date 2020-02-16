export default class IndoorShape {
  constructor (shape) {
    this.id = `shape-${this.constructor.Count}`
    this.constructor.Count += 1
    this.shape = shape
    this.initialShape(...arguments)
    this.setAreas()
  }

  initialShape () {}

  setElement (el = null) {
    this.$el = el
    this.$el.setAttribute('id', this.id)
    this.bindEvents()
  }

  // type: shape | marker
  setMap (map, type='shape') {
    if (map) {
      this.map = map
      map.addShape(this, type)
    } else {
      this.remove()
    }
  }

  setRoot (el) {
    el.appendChild(this.$el)
  }

  remove () {
    this.$el.parentElement.removeChild(this.$el)
    if (this.map) {
      this.map.removeShape(this)
    }
  }

  getAreas () {
    return this.areas
  }

  setAreas () {
    this.areas = [0, 0, 0, 0]
  }

  bindEvents () {}
}

IndoorShape.Count = 0
