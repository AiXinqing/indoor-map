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
      this.setRoot(map.$svg)
    } else {
      this.remove()
    }
  }

  setRoot (el) {
    el.appendChild(this.$el)
  }

  remove (el) {
    this.$el.parentElement.removeChild(this.$el)
  }

  bindEvents () {}
}
