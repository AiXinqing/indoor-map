import 'assets/style.css'

import IndoorMap from './sdk/map.js'
import IndoorCircle from './sdk/shapes/circle'

const map = new IndoorMap('app')

const circle = new IndoorCircle([10, 10], 5, {
  stroke: 'red',
  fill: 'blue',
  'stroke-width': 1,
})

circle.setMap(map)
