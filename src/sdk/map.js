import { SvgNs } from './constant'

const ZoomMap = {
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 5,
  '5': 10,
  '6': 20,
  '7': 30,
  '8': 50,
  '9': 100,
  '10': 200,
  '11': 300,
  '12': 500,
  '13': 1000,
}

const DefaultOptions = {
  zoom: 5,
}

export default class IndoorMap {
  constructor(el, options = {}) {
    this.$el = document.getElementById(el)
    this.options = {
      ...DefaultOptions,
      ...options,
    }
    this.generateElements()
  }

  get scale() {
    return ZoomMap[`${this.options.zoom}`]
  }

  generateElements () {
    this.$svg = document.createElementNS(SvgNs, 'svg')
    this.$svg.style.width = '100%'
    this.$svg.style.height = '100%'
    this.$el.appendChild(this.$svg)
    this._setViewBox()
  }

  setViewBox (view) {
    const [x, y, w, h] = view || this.viewBox
    this.$svg.setAttribute(
      'viewBox',
      `${x / this.scale} ${y / this.scale} ${w / this.scale} ${h / this.scale}`
    )
  }

  setZoom (zoom) {
    this.options.zoom = zoom
    this.setViewBox()
  }

  _setViewBox () {
    const { width, height } = this.$svg.getBoundingClientRect()
    this.viewBox = [0, 0, width, height]
    this.setViewBox()
  }
}
