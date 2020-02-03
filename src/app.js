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

const styleMaps = {
  'default': {
    fill: '#f3f3f3',
  },
  // 停车位
  '停车位': {
    stroke: '#f3f3f3',
    fill: '#e6e6e6',
    'stroke-width': 50,
  },
  '支柱': {
    fill: '#333',
  },
  '冷冻机': {
    fill: 'rgb(26,79,176)',
  },
  '其他房': {
    fill: 'rgb(254,99,110)',
  },
  '电梯间': {
    fill: 'rgb(199,235,200)',
  },
  '楼梯': {
    fill: 'rgb(199,235,200)',
  },
  '淋浴间': {
    fill: 'rgb(7,178,195)',
  },
  '垃圾闸': {
    fill: '#cccccc',
  },
  '排风机': {
    fill: 'rgb(22, 137, 112)',
  },
  '值班室': {
    fill: 'rgb(195,7,132)',
  },
  '入口': {
    fill: 'rgb(254,99,110)',
  },
  '新风机': {
    fill: 'rgb(22, 187, 112)',
  },
  '弱电': {
    fill: 'rgb(30, 110, 150)',
  },
  '强电': {
    fill: 'rgb(30, 110, 220)',
  },
  '库房': {
    fill: 'rgb(160, 160, 22)',
  },
  '热交换': {
    fill: 'rgb(220, 40, 40)',
  },
  '配电间': {
    fill: 'rgb(104,11,223)',
  },
  '出口': {
    fill: 'rgb(110, 99, 254)',
  },
}

axios.get('http://39.106.77.97:8081/getByFloor/B2')
  .then(({ data }) => {
    const shapes = new Geojson(data.data, styleMaps)
    shapes.setMap(map)
  })

document.getElementById('ui-layer').addEventListener('click', (event) => {
  const floor = event.target.getAttribute('target')
  axios.get(`http://39.106.77.97:8081/getByFloor/${floor}`)
    .then(({ data }) => {
      map.removeShapes()
      const shapes = new Geojson(data.data, styleMaps)
      shapes.setMap(map)
    })
}, false)
