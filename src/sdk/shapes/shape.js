export default class IndoorShape {
  constructor () {
    this.$el = null
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
}
