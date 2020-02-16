import IndoorShape from './shape'
import { SvgNs } from '../constant'

const convertLineToPath = (polygon) => {
  const points = polygon.geometry.coordinates
  const pointsStr = points.map(point => `${point[0]},${point[1]}`).join('L')
  return `M${pointsStr}`
}

export default class IndoorLineShape extends IndoorShape {
  constructor () {
    super(...arguments)
  }

  initialShape (line, styles) {
    const path = document.createElementNS(SvgNs, 'path')
    const dstr = convertLineToPath(line)
    path.setAttribute('d', dstr)
    this.setElement(path)
  }

  setAreas () {
    const [...points] = this.shape.geometry.coordinates
    const pointsX = points.map(point => point[0])
    const pointsY = points.map(point => point[1])
    this.areas = [Math.min(...pointsX), Math.min(...pointsY), Math.max(...pointsX), Math.max(...pointsY)]
  }
}
