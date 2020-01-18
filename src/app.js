import 'assets/style.css'

import axios from 'axios'
import IndoorMap from './sdk/map.js'
import IndoorPolygon from './sdk/shapes/polygon'
import IndoorLine from './sdk/shapes/line'

const map = new IndoorMap('app', {
  zoom: 3,
  offsetX: 3.0812e8,
  offsetY: 5.069e8,
  width: 2e2,
})

axios.get('http://39.106.77.97:8081/getByFloor/B3')
  .then(({ data }) => {
    data.data.features.forEach((polygon) => {
      switch (polygon.geometry.type) {
        case 'Polygon':
          const polygon_instance = new IndoorPolygon(polygon, {
            fill: `rgb(${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)})`,
          })
          polygon_instance.setMap(map)
          break
        case 'LineString':
          const line_instance = new IndoorLine(polygon, {
            stroke: `rgb(${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)})`,
            'stroke-width': 1000,
          })
          line_instance.setMap(map)
          break
      }
    })
  })
