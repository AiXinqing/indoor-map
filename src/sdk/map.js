import { SvgNs } from './constant'

const ZoomMap = {
  '-9': 1e-9,
  '-8': 1e-8,
  '-7': 1e-7,
  '-6': 1e-6,
  '-5': 1e-5,
  '-4': 1e-4,
  '-3': 1e-3,
  '-2': 1e-2,
  '-1': 1e-1,
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
    this.viewBox[0] = this.viewBox[0] - x
    this.viewBox[1] = this.viewBox[1] - y
    this.setViewBox()
  }

  _setViewBox () {
    const { width, height } = this.$svg.getBoundingClientRect()
    const h = this.width * height / width
    this.viewBox = [...this.offset, this.width, h]
    this.setViewBox()
  }
}
