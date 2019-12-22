export default class IndoorShape {
  constructor () {
    this.$el = null
  }

  setMap (map) {
    if (map) {
      map.$svg.appendChild(this.$el)
    } else {
      this.$el.parentElement.removeChild(this.$el)
    }
  }
}
