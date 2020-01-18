import 'assets/style.css'

import axios from 'axios'
import IndoorMap from './sdk/map.js'
import Geojson from './sdk/shapes/geojson'

const map = new IndoorMap('app', {
  zoom: 3,
  offsetX: 3.0823e8,
  offsetY: 5.069e8,
  width: 2e2,
})

axios.get('http://39.106.77.97:8081/getByFloor/B2')
  .then(({ data }) => {
    const shapes = new Geojson(data.data)
    shapes.setMap(map)
  })
