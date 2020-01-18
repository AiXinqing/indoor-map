import { SvgNs } from './constant'

const ZoomMap = {
  '1': 5e-4,
  '2': 1e-3,
  '3': 2e-3,
  '4': 5e-3,
  '5': 1e-2,
  '6': 2e-2,
  '7': 5e-2,
  '8': 1e-1,
  '9': 2e-1,
  '10': 5e-1,
}

const DefaultOptions = {
  zoom: 3,
}

export default class IndoorMap {
  constructor(el, options = {}) {
    this.$el = document.getElementById(el)
    this.options = {
      ...DefaultOptions,
      ...options,
    }
    this.offset = [this.options.offsetX || 0, this.options.offsetY || 0]
    this.width = this.options.width || 1
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
      `${x} ${y} ${w / this.scale} ${h / this.scale}`
    )
  }

  setZoom (zoom) {
    this.options.zoom = zoom
    this.setViewBox()
  }

  translate (x, y) {
    this.viewBox[0] = this.offset[0] - x
    this.viewBox[1] = this.offset[1] - y
    this.setViewBox()
  }

  _setViewBox () {
    const { width, height } = this.$svg.getBoundingClientRect()
    const h = this.width * height / width
    this.viewBox = [...this.offset, this.width, h]
    this.setViewBox()
  }
}
