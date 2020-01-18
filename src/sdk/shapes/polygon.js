import IndoorShape from './shape'
import { SvgNs } from '../constant'

const convertPolygonToPath = (polygon) => {
  const [start, ...points] = polygon.geometry.coordinates[0]
  const allpoints = polygon.geometry.coordinates[0]
  const x = allpoints.map(item => item[0])
  const y = allpoints.map(item => item[1])
  console.log('x范围:')
  console.log(Math.min.apply(this, x), Math.max.apply(this, x))

  console.log('y范围:')
  console.log(Math.min.apply(this, y), Math.max.apply(this, y))
  const pointsStr = points.map(point => `${point[0]},${point[1]}`).join('L')
  return `M${start[0]},${start[1]}L${pointsStr}Z`
}

export default class IndoorPolygonShape extends IndoorShape {
  constructor (polygon, styles = {}) {
    super()
    const path = document.createElementNS(SvgNs, 'path')
    const dstr = convertPolygonToPath(polygon)
    path.setAttribute('d', dstr)
    const stylestr = Object.keys(styles).reduce((acc, item) => {
      return `${acc}${item}: ${styles[item]};`
    }, '')
    path.setAttribute('style', stylestr)
    this.$el = path
  }
}
