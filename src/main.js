import 'assets/style.css'

import Vue from 'vue'
import App from './app.vue'
import vConsole from 'vconsole'

new vConsole()

document.body.addEventListener('touchmove', function (e) {
  e.preventDefault() //阻止默认的处理方式(阻止下拉滑动的效果)
}, { passive: false })

new Vue({
  el: '#app',
  render: h => h(App),
})
// import axios from 'axios'
// import IndoorMap from './sdk/map.js'
// import Geojson from './sdk/shapes/geojson'
// import styleMaps from './style'
// import reduceFloorData from './reduce'
// import IndoorCircle from './sdk/shapes/circle.js'
// import IndoorLineShape from './sdk/shapes/line.js'

// localStorage.clear()
// localStorage.removeItem('B3-floor')
// localStorage.removeItem('B2-floor')
// const BACKEND_HOST = 'https://xrequest.yunzaitech.com'
// const EXAMPLE_POSITION = [46010, 43122]
// let fetching = false

// const map = new IndoorMap('app', {
//   zoom: 1.2,
// })

// function getQueryVariable (variable) {
//   const query = window.location.search.substring(1);
//   const vars = query.split("&")
//   for (let i = 0; i < vars.length; i++) {
//     const pair = vars[i].split("=")
//     if (pair[0] == variable) {
//       return pair[1]
//     }
//   }
//   return false
// }

// const source = axios.CancelToken.source()

// function fetchFloor (floor) {
//   if (fetching) {
//     source.cancel('cancel')
//   }
//   fetching = true
//   return axios.get(`${BACKEND_HOST}/getByFloor/${floor}`, {
//     cancelToken: source.token,
//   }).then(({ data }) => {
//     return reduceFloorData(data.data)
//   }).finally(() => {
//     fetching = false
//   })
// }

// function getFloorCache (floor) {
//   const cache = localStorage.getItem(`floor-${floor}`)
//   if (cache) {
//     return JSON.parse(cache)
//   }
//   return undefined
// }

// function storeCache (floor, data) {
//   try {
//     localStorage.setItem(`floor-${floor}`, JSON.stringify(data))
//   } catch {
//     localStorage.removeItem(`floor-${floor}`)
//   }
// }

// function drawFloorMap (data) {
//   const shapes = new Geojson(data.reducedData, styleMaps)
//   map.offset = data.offset
//   map.removeShapes()
//   shapes.setMap(map)
//   map.setFitView()
// }

// function drawFloor (floor) {
//   const cache = getFloorCache(floor)
//   if (cache) {
//     showInfo(`当前楼层: ${floor}`)
//     drawFloorMap(cache)
//   } else {
//     fetchFloor(floor).then((data) => {
//       storeCache(floor, data)
//       showInfo(`当前楼层: ${floor}`)
//       drawFloorMap(data)
//     }).catch(() => showInfo('获取楼层数据失败'))
//   }
// }

// function getNavigatePath (_from, _target) {
//   return axios.get(`${BACKEND_HOST}/direction`)
//     .then(({ data }) => {
//       return data.data
//     })
//     .catch(() => showInfo('获取导航数据失败'))
// }

// function displayPosition (position, map) {
//   const location = new IndoorCircle({
//     center: position,
//     radius: 1000,
//   }, {
//     fill: 'red',
//   })
//   location.setMap(map, 'marker')
// }

// function displayNavigate () {
//   getNavigatePath().then((navPath) => {
//     const points = navPath.map((point) => {
//       return [point[0] - map.offset[0], point[1] - map.offset[1]]
//     })

//     const nav = new IndoorLineShape({
//       geometry: {
//         coordinates: points,
//       },
//     }, {
//       stroke: 'blue',
//       'stroke-width': 500,
//       fill: 'none',
//     })
//     nav.setMap(map, 'shape')
//     map.setFitView()
//   })
// }

// function showInfo (info) {
//   document.getElementById('infoBox').innerHTML = info
// }

// function init() {
//   const openId = getQueryVariable('openid')
//   const ws = new WebSocket('wss://xsocket.yunzaitech.com')

//   ws.onopen = function () {
//     console.log('websocket open')
//     const connectdata = {
//       from: 'Web',
//       type: 'Connect',
//       openid: openId,
//     }
//     ws.send(JSON.stringify(connectdata))
//   }

//   ws.onclose = function () {
//     console.log('websocket close')
//   }

//   ws.onmessage = function (evt) {
//     // const position = JSON.parse(evt.data)
//   }
//   const position = {
//     location: EXAMPLE_POSITION,
//     floor: 'B2',
//   }
//   displayPosition(position.location, map)
//   drawFloor(position.floor)
//   showInfo('当前因为设备的原因，没法上正式的。现在采用的是仿真数据来定位')
// }

// init()

// document.getElementById('ui-layer').addEventListener('click', (event) => {
//   const type = event.target.getAttribute('data-type')
//   const floor = event.target.getAttribute('target')

//   switch (type) {
//     case 'switchFloor':
//       drawFloor(floor)
//       break
//     case 'position':
//       displayPosition(EXAMPLE_POSITION, map)
//       break
//     case 'navigate':
//       displayNavigate()
//       break
//   }
// }, false)
