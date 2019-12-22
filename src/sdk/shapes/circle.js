import IndoorShape from './shape'
import { SvgNs } from '../constant'

export default class IndoorCircle extends IndoorShape {
  constructor (center, radius, styles = {}) {
    super()
    const circle = document.createElementNS(SvgNs, 'circle')
    circle.setAttribute('cx', center[0])
    circle.setAttribute('cy', center[1])
    circle.setAttribute('r', radius)
    const stylestr = Object.keys(styles).reduce((acc, item) => {
      return `${acc}${item}: ${styles[item]};`
    }, '')
    circle.setAttribute('style', stylestr)
    this.$el = circle
  }
}
