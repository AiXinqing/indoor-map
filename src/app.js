import 'assets/style.css'

import axios from 'axios'
import IndoorMap from './sdk/map.js'
import Geojson from './sdk/shapes/geojson'
import styleMaps from './style'
import reduceFloorData from './reduce'
import IndoorCircle from './sdk/shapes/circle.js'

const map = new IndoorMap('app', {
  zoom: 5,
})

const B3Floor = localStorage.getItem('B3-floor')

if (B3Floor) {
  const { reducedData } = JSON.parse(B3Floor)
  const shapes = new Geojson(reducedData, styleMaps)
  shapes.setMap(map)
  map.setFitView()
} else {
  axios.get('http://39.106.77.97:8081/getByFloor/B3')
    .then(({ data }) => {
      const reducedData = reduceFloorData(data.data)
      try {
        localStorage.setItem('B3-floor', JSON.stringify(reducedData))
      } catch (err) {
        localStorage.removeItem('B3-floor')
        console.log(err)
      }
      const shapes = new Geojson(reducedData.reducedData, styleMaps)
      shapes.setMap(map)
      map.setFitView()
    })
}

document.getElementById('ui-layer').addEventListener('click', (event) => {
  const type = event.target.getAttribute('data-type')
  const floor = event.target.getAttribute('target')
  const cache = localStorage.getItem(`${floor}-floor`)

  switch (type) {
    case 'switchFloor':
      if (cache) {
        const shapes = new Geojson(JSON.parse(cache).reducedData, styleMaps)
        map.removeShapes()
        shapes.setMap(map)
        map.setFitView()
      } else {
        axios.get(`http://39.106.77.97:8081/getByFloor/${floor}`)
          .then(({ data }) => {
            const reducedData = reduceFloorData(data.data)
            try {
              localStorage.setItem(`${floor}-floor`, JSON.stringify(reducedData))
            } catch (err) {
              localStorage.removeItem(`${floor}-floor`)
            }
            map.removeShapes()
            const shapes = new Geojson(reducedData.reducedData, styleMaps)
            shapes.setMap(map)
            map.setFitView()
          })
      }
      break
    case 'position':
      const shape = new IndoorCircle({
        center: [46010, 43122],
        radius: 1000,
      }, {
        fill: 'red',
      })
      shape.setMap(map)
  }
}, false)
