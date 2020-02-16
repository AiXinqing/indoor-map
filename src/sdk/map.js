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
    this.markers = []
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
    this.$svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    this.$el.appendChild(this.$svg)
    this.$shapeGroup = document.createElementNS(SvgNs, 'g')
    this.$markerGroup = document.createElementNS(SvgNs, 'g')
    this.$shapeGroup.setAttribute('aria-label', 'normal-shapes')
    this.$markerGroup.setAttribute('aria-label', 'markers-group')
    this.$svg.appendChild(this.$shapeGroup)
    this.$svg.appendChild(this.$markerGroup)
    const { width, height } = this.$el.getBoundingClientRect()
    this.$svg.style.width=`${width}px`
    this.$svg.style.height=`${height}px`
    this.size = [width, height]
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
    const [width, height] = this.size
    const scale = Math.max((Xmax - Xmin) / width, (Ymax - Ymin) / height)
    this.center = [(Xmax + Xmin) / 2, (Ymax + Ymin) / 2]
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

  addShape (shape, type = 'shape') {
    switch (type) {
      case 'shape':
        this.shapes.push(shape)
        break
      case 'marker':
        this.markers.push(shape)
        break
      default:
    }
    this.renderShape(shape, type)
  }

  renderShape (shape, type) {
    shape.setStyle()
    switch (type) {
      case 'shape':
        this.$shapeGroup.appendChild(shape.$el)
        break
      case 'marker':
        this.$markerGroup.appendChild(shape.$el)
        break
      default:
    }
  }

  removeShape (shape) {
    const markerIndex = this.markers.findIndex(item => item.id === shape.id)
    const shapeIndex = this.shapes.findIndex(item => item.id === shape.id)
    if (markerIndex > -1) {
      return this.markers.splice(markerIndex, 1)
    }
    if (shapeIndex > -1) {
      return this.shapes.splice(shapeIndex, 1)
    }
  }

  _setViewBox () {
    const [width, height] = this.size
    this.center = [width / 2, height / 2]
    this.setViewBox()
  }
}
