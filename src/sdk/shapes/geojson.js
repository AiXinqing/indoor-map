import Polygon from './polygon'
import Line from './line'
import IndoorShape from './shape'

import { SvgNs } from '../constant'

const randomColor = () => {
  return `rgb(${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)})`
}

export default class IndoorGeojson extends IndoorShape {
  constructor (geojson) {
    super(geojson)
    const group = document.createElementNS(SvgNs, 'g')
    this.setElement(group)

    this.shapes = geojson.features.map((shape) => {
      switch (shape.geometry.type) {
        case 'Polygon':
          return new Polygon(shape, { fill: randomColor() })
        case 'LineString':
          return new Line(shape, {
            stroke: randomColor(),
            'stroke-width': 500,
          })
        default:
          return new IndoorShape(shape)
      }
    })
    this.mount()
  }

  mount () {
    this.shapes.forEach(item => item.setRoot(this.$el))
  }
}
