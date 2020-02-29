<template>
  <div class="app">
    <svg-map
      v-if="json"
      :size="size"
      :geojson="json"
      :shapes="shapes"
      :styles="styles"
      :markers="markers"
      @click-shape="handleShapeClick"
    />
    <div class="ui-layer">
      <div class="button-group">
        <div
          v-for="item in floors"
          :key="item.id"
          :class="{ active: item === floor }"
          class="floor-button"
          @click="switchFloor(item)"
        >
          {{ item.alias }}
        </div>
      </div>
      <div
        class="locate-button"
        @click="locateToCenter"
      >
        <svg
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 413.099 413.099"
        >
          <path d="M206.549,0L206.549,0c-82.6,0-149.3,66.7-149.3,149.3c0,28.8,9.2,56.3,22,78.899l97.3,168.399c6.1,11,18.4,16.5,30,16.5
			c11.601,0,23.3-5.5,30-16.5l97.3-168.299c12.9-22.601,22-49.601,22-78.901C355.849,66.8,289.149,0,206.549,0z M206.549,193.4
			c-30,0-54.5-24.5-54.5-54.5s24.5-54.5,54.5-54.5s54.5,24.5,54.5,54.5C261.049,169,236.549,193.4,206.549,193.4z"/>
        </svg>
      </div>
      <div
        v-if="activeShapeVm"
        class="detail-container"
      >
        <span>{{ activeShapeVm.shape.properties.name }}</span>
        <button
          class="button"
          @click="displayNavigate"
        >
          导航
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import SvgMap from './components/svgmap.vue'
import styles from './style'

const ExamplePosition = [46010, 43122]
const Floors = [
  {
    id: -2,
    alias: 'B2',
  },
  {
    id: -3,
    alias: 'B3',
  },
]
const BACKEND_HOST = 'https://xrequest.yunzaitech.com'

export default {
  components: {
    SvgMap,
  },

  props: {
    // 是否开启缓存
    storage: {
      type: Boolean,
      default: true,
    },
  },

  data () {
    return {
      floors: Floors,
      size: [0, 0],
      floor: Floors[0],
      position: ExamplePosition,
      json: null,
      fetching: false,
      shapes: [],
      source: axios.CancelToken.source(),
      styles: styles,
      activeShapeVm: null,
      currentPosition: null,
    }
  },

  computed: {
    markers () {
      return this.currentPosition ? [this.currentPosition] : []
    },
  },

  mounted () {
    const { width, height } = document.body.getBoundingClientRect()
    this.size = [width, height]

    this.createSocketConnect()
    this.drawFloor()
    this.showPosition()
  },

  methods: {
    createSocketConnect () {
      const search = window.location.search
      const openId = search
        ? search.match(/openid=([^&]*)/)[1] || ''
        : 'oRYKI5Jp3tPhKOib8Xm6Ie4zb7xs'
      const ws = new WebSocket('wss://xsocket.yunzaitech.com')

      ws.onopen = () => {
        const connectdata = {
          from: 'Web',
          type: 'Connect',
          openid: openId,
        }
        ws.send(JSON.stringify(connectdata))
        console.log('connect-data', connectdata)
        console.log('socket onpen')
      }

      ws.onmessage = (evt) => {
        console.log('socket message')
        console.log(evt)
        this.updatePosition(evt.data)
      }

      ws.onerror = (evt) => {
        console.log('socket error')
        console.log(evt)
      }

      ws.onclose = () => {
        console.log('socket close')
      }
    },

    drawFloor () {
      this.fetchFloor(this.floor)
        .then(({ data }) => {
          this.json = data.data
        })
        .catch(() => console.log('获取楼层数据失败'))
    },

    // position:
    //   positionX: x,
    //   PositionY: y,
    //   PositionZ: floor,
    updatePosition (position) {
      const { positionX, positionY, positionZ } = position
      this.position = [positionX, positionY]
      this.switchFloor(this.getFloor(positionZ))
    },

    locateToCenter () {},

    fetchFloor (floor) {
      if (this.fetching) {
        this.source.cancel('cancel')
        this.source = axios.CancelToken.source()
      }
      this.fetching = true
      return axios.get(`${BACKEND_HOST}/getByFloor/${floor.alias}`, {
        cancelToken: this.source.token
      }).finally(() => {
        this.fetching = false
      })
    },

    switchFloor (floor) {
      if (floor === this.floor) return
      this.floor = floor
      this.drawFloor()
    },

    getFloor (floorId, offset = 0) {
      const floorIndex = this.floors.findIndex(item => item.id === floorId)
      const index = floorIndex + offset
      if (index < 0 || index >= this.floors.length) return undefined
      return this.floors[index]
    },

    displayNavigate () {
      axios.get(`${BACKEND_HOST}/direction`)
        .then(({ data }) => {
          this.shapes = [
            {
              type: 'Feature',
              properties: {
                name: '导航线',
                uuid: Date.now(),
                class: '-1',
              },
              geometry: {
                type: 'LineString',
                coordinates: data.data,
              },
            },
          ]
        })
        .catch(() => console.log('获取导航数据失败'))
    },

    showPosition () {
      this.currentPosition = {
        type: 'Feature',
        properties: {
          name: '当前位置',
          uuid: Date.now(),
          class: '-2',
        },
        geometry: {
          type: 'Point',
          coordinates: this.position,
        },
      }
    },

    handleShapeClick (shapeVm) {
      if (this.activeShapeVm) {
        this.activeShapeVm.blur()
        if (shapeVm === this.activeShapeVm) {
          return this.activeShapeVm = null
        }
      }
      if (!shapeVm.shape.properties.name) {
        return this.activeShapeVm = null
      }
      const highlightStyle = { fill: 'red' }
      shapeVm.highlight(highlightStyle)
      this.activeShapeVm = shapeVm
    },
  },
}
</script>

<style>
  .app {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  .map-container {
    width: 100%;
    height: 100%;
  }

  .ui-layer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .detail-container {
    background-color: hsl(0, 0%, 100%);
    box-shadow: 0 0 5px 1px #ccc;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px 16px;
  }

  .ui-layer span {
    font-size: 20px;
    color: #333;
    flex-grow: 1;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    width: 40px;
    background: hsl(0, 0%, 100%);
    border-radius: 5px;
    position: absolute;
    left: 16px;
    bottom: 100%;
    margin-bottom: 64px;
  }

  .floor-button {
    text-align: center;
    padding: 8px;
    cursor: pointer;
    border: 1px solid #ddd;
    margin-top: -1px;
  }

  .floor-button:first-child {
    margin-top: 0;
    border-radius: 5px 5px 0 0;
  }

  .floor-button:last-child {
    border-radius: 0 0 5px 5px;
  }

  .floor-button.active {
    background-color: hsl(209, 100%, 74%);
    border-color: hsl(209, 100%, 74%);
    color: white;
  }

  .locate-button {
    width: 40px;
    height: 40px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 5px;
    color: #333;
    cursor: pointer;
    position: absolute;
    bottom: 100%;
    left: 16px;
    margin-bottom: 12px;
  }

  .locate-button.active {
    color: hsl(209, 100%, 74%);
  }

  .button {
    flex-shrink: 0;
    background: hsl(209, 100%, 74%);
    font-size: 14px;
    line-height: 21px;
    padding: 6px 16px;
    letter-spacing: 2px;
    border: none;
    border-radius: 17px;
    outline: none;
    cursor: pointer;
    color: white;
  }
</style>
