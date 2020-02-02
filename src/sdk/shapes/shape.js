export default class IndoorShape {
  constructor (shape) {
    this.shape = shape
  }

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

  bindEvents () {}
}
