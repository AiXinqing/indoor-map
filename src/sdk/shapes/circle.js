import IndoorShape from "./shape"
import { SvgNs } from "../constant"

export default class IndoorCircle extends IndoorShape {
  constructor () {
    super(...arguments)
  }

  initialShape (shape, styles = {}) {
    const circle = document.createElementNS(SvgNs, 'circle')
    const [cx, cy] = shape.center
    circle.setAttribute('cx', cx)
    circle.setAttribute('cy', cy)
    circle.setAttribute('r', shape.radius)
    this.setElement(circle)
  }

  setAreas () {
    const [cx, cy] = this.shape.center
    const radius = this.shape.radius
    this.areas = [cx - radius, cy - radius, cx + radius, cy + radius]
  }
}
