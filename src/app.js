import 'assets/style.css'

import axios from 'axios'
import IndoorMap from './sdk/map.js'
import IndoorPolygon from './sdk/shapes/polygon'

const map = new IndoorMap('app', {
  zoom: 3,
  offsetX: 3.0823e8,
  offsetY: 5.069e8,
  width: 2e2,
})

axios.get('http://39.106.77.97:8081/getByFloor/B3')
  .then(({ data }) => {
    data.data.features.forEach((polygon) => {
      if (polygon.geometry.type !== 'Polygon') return
      const polygon_instance = new IndoorPolygon(polygon, {
        fill: `rgb(${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)})`,
      })
      polygon_instance.setMap(map)
    })
  })
