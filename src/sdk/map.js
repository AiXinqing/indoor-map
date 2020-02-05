import { SvgNs } from './constant'

const ZoomMap = {
  '1': 0.3,
  '2': 0.5,
  '3': 0.67,
  '4': 1,
  '5': 1.5,
  '6': 2,
  '7': 3,
  '8': 5,
  '9': 8,
  '10': 12,
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
    this.shapes = []
    this.center = [0, 0]
    this.size = [0, 0]
    this.scale = 1
    this.generateElements()
  }

  get viewBox () {
    const [cx, cy] = this.center
    const [w, h] = this.size
    const zoom = ZoomMap[this.options.zoom]
    return [
      cx - w / 2 * this.scale * zoom,
      cy - h / 2 * this.scale * zoom,
      w * this.scale * zoom,
      h * this.scale * zoom
    ]
  }

  generateElements () {
    this.$svg = document.createElementNS(SvgNs, 'svg')
    this.$svg.style.width = '100%'
    this.$svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    this.$svg.style.height = '100%'
    this.$el.appendChild(this.$svg)
    this._setViewBox()
  }

  setViewBox (view) {
    const [x, y, w, h] = view || this.viewBox
    this.$svg.setAttribute(
      'viewBox',
      `${x} ${y} ${w} ${h}`
    )
  }

  setZoom (zoom) {
    this.options.zoom = zoom
    this.setViewBox()
  }

  translate (x, y) {
    const [cx, cy] = this.center
    this.center = [cx - x * this.scale, cy - y * this.scale]
    this.setViewBox()
  }

  setFitView () {
    if (this.shapes.length < 1) return
    const [Xmin, Ymin, Xmax, Ymax] = this.getAreas()
    const { width, height } = this.$svg.getBoundingClientRect()
    const scale = Math.max((Xmax - Xmin) / width, (Ymax - Ymin) / height)
    this.center = [(Xmax + Xmin) / 2, (Ymax + Ymin) / 2]
    this.size = [width, height]
    this.scale = scale
    this.setViewBox()
  }

  getAreas () {
    const areas = this.shapes.map(shape => shape.getAreas())
    return [
      Math.min(...areas.map(item => item[0])) || 0,
      Math.min(...areas.map(item => item[1])) || 0,
      Math.max(...areas.map(item => item[2])) || 0,
      Math.max(...areas.map(item => item[3])) || 0,
    ]
  }

  removeShapes () {
    this.shapes.forEach((shape) => {
      shape.remove()
    })
  }

  _setViewBox () {
    const { width, height } = this.$svg.getBoundingClientRect()
    this.center = [width / 2, height / 2]
    this.size = [width, height]
    this.setViewBox()
  }
}
