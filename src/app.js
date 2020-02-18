import 'assets/style.css'

import axios from 'axios'
import IndoorMap from './sdk/map.js'
import Geojson from './sdk/shapes/geojson'
import styleMaps from './style'
import reduceFloorData from './reduce'
import IndoorCircle from './sdk/shapes/circle.js'
import IndoorLineShape from './sdk/shapes/line.js'

const EXAMPLE_POSITION = [46010, 43122]
let fetching = false

const map = new IndoorMap('app', {
  zoom: 5,
})

const source = axios.CancelToken.source()

function fetchFloor (floor) {
  if (fetching) {
    source.cancel('cancel')
  }
  fetching = true
  return axios.get(`http://39.106.77.97:8081/getByFloor/${floor}`, {
    cancelToken: source.token,
  }).then(({ data }) => {
    return reduceFloorData(data.data)
  }).finally(() => {
    fetching = false
  })
}

function getFloorCache (floor) {
  const cache = localStorage.getItem(`${floor}-floor`)
  if (cache) {
    return JSON.parse(cache)
  }
  return undefined
}

function storeCache (floor, data) {
  debugger
  try {
    localStorage.setItem(`${floor}-floor`, JSON.stringify(data))
  } catch {
    localStorage.removeItem(`${floor}-floor`)
  }
}

function drawFloorMap (data) {
  const shapes = new Geojson(data.reducedData, styleMaps)
  map.offset = data.offset
  map.removeShapes()
  shapes.setMap(map)
  map.setFitView()
}

function drawFloor (floor) {
  const cache = getFloorCache(floor)
  if (cache) {
    drawFloorMap(cache)
  } else {
    fetchFloor(floor).then((data) => {
      storeCache(floor, data)
      drawFloorMap(data)
    }).catch(() => console.log('请求楼层数据失败'))
  }
}

function getPosition () {
  // return axios.get('position/url', {
  //   cancelToken: source.token,
  // })
  return Promise.resolve({
    location: EXAMPLE_POSITION,
    floor: 'B3',
  })
}

function init() {
  getPosition().then((position) => {
    drawFloor(position.floor)
  }).catch(() => console.log('获取定位失败'))
}

init()


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
      shape.setMap(map, 'marker')
      break
    case 'navigate':
      const nav = new IndoorLineShape({
        id: 'navigate',
        geometry: {
          coordinates: [
            [46010, 43122],
            [76010, 43122],
            [76010, 69122],
            [87010, 69122],
          ],
        },
      }, {
        stroke: 'blue',
        'stroke-width': 500,
        fill: 'none',
      })
      nav.setMap(map, 'shape')
      break
  }
}, false)
