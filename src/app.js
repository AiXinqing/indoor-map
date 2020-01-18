import 'assets/style.css'

import axios from 'axios'
import IndoorMap from './sdk/map.js'
import IndoorPolygon from './sdk/shapes/polygon'

const map = new IndoorMap('app', {
  zoom: -4,
  offsetX: 3.08e8,
  offsetY: 5.065e8,
  width: 2e2,
})

axios.get('http://39.106.77.97:8081/getByFloor/B2')
  .then(({ data }) => {
    const polygon = data.data.features[0]
    const polygon_instance = new IndoorPolygon(polygon, {
      fill: 'red',
      'stroke-width': 1,
    })

    polygon_instance.setMap(map)
  })
