import Polygon from './polygon'
import Line from './line'
import IndoorShape from './shape'

import { SvgNs } from '../constant'

const randomColor = () => {
  return `rgb(${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)})`
}

export default class IndoorGeojson extends IndoorShape {
  constructor () {
    super(...arguments)
  }

  initialShape (geojson, styleMaps = {}) {
    const group = document.createElementNS(SvgNs, 'g')
    this.setElement(group)

    this.shapes = geojson.features.map((shape) => {
      switch (shape.geometry.type) {
        case 'Polygon':
          const style = styleMaps[shape.properties.name || 'default']
          return new Polygon(shape, style || { fill: randomColor() })
        case 'LineString':
          return new Line(shape, {
            stroke: 'red',
            'stroke-width': shape.properties.LineWt,
            fill: 'none',
          })
        default:
          return new IndoorShape(shape)
      }
    })
    this.mount()
  }

  setAreas () {
    const areas = this.shapes.map(shape => shape.getAreas())
    this.areas = [0, 0, 0, 0]
    this.areas[0] = Math.min(...areas.map(area => area[0]))
    this.areas[1] = Math.min(...areas.map(area => area[1]))
    this.areas[2] = Math.max(...areas.map(area => area[2]))
    this.areas[3] = Math.max(...areas.map(area => area[3]))
  }

  setStyle () {
    this.shapes.forEach(item => item.setStyle())
  }

  mount () {
    this.shapes.forEach(item => item.setRoot(this.$el))
  }
}
