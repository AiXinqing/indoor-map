import IndoorShape from './shape'
import { SvgNs } from '../constant'

const convertGeojsonToPath = (geojson) => {
  return ''
}

export default class IndoorGeoJson extends IndoorShape {
  constructor (geojson) {
    super()
    const path = document.createElementNS(SvgNs, 'path')
    const dstr = convertGeojsonToPath(geojson)
    path.setAttribute('d', dstr)
    this.$el = path
  }
}
