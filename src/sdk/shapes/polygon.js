import IndoorShape from './shape'
import { SvgNs } from '../constant'

const convertPolygonToPath = (polygon) => {
  const [start, ...points] = polygon.geometry.coordinates[0]
  const pointsStr = points.map(point => `${point[0]},${point[1]}`).join('L')
  return `M${start[0]},${start[1]}L${pointsStr}Z`
}

export default class IndoorPolygonShape extends IndoorShape {
  constructor () {
    super(...arguments)
  }

  initialShape (polygon, styles = {}) {
    const path = document.createElementNS(SvgNs, 'path')
    const dstr = convertPolygonToPath(polygon)
    path.setAttribute('d', dstr)
    const stylestr = Object.keys(styles).reduce((acc, item) => {
      return `${acc}${item}: ${styles[item]};`
    }, '')
    path.setAttribute('style', stylestr)
    this.setElement(path)
  }

  setAreas () {
    const [...points] = this.shape.geometry.coordinates[0]
    const pointsX = points.map(point => point[0])
    const pointsY = points.map(point => point[1])
    this.areas = [Math.min(...pointsX), Math.min(...pointsY), Math.max(...pointsX), Math.max(...pointsY)]
  }

  bindEvents () {
    this.$el.addEventListener('click', () => {
      console.log(this.shape)
    }, false)
  }
}
