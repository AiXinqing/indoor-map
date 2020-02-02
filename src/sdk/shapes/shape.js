export default class IndoorShape {
  constructor (shape) {
    this.shape = shape
    this.initialShape(...arguments)
    this.setAreas()
  }

  initialShape () {}

  setElement (el = null) {
    this.$el = el
    this.bindEvents()
  }

  setMap (map) {
    if (map) {
      this.map = map
      map.shapes.push(this)
      this.setRoot(map.$svg)
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
      this.map.shapes = this.map.shapes.filter((shape) => shape !== this)
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
