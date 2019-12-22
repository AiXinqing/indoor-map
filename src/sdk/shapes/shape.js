export default class IndoorShape {
  constructor () {
    this.$el = null
  }

  setMap (map) {
    map.$svg.appendChild(this.$el)
  }
}
