<template>
  <div class="app">
    <svg-map
      v-if="json"
      :size="size"
      :geojson="json"
      :shapes="shapes"
      :styles="styles"
      @click-shape="handleShapeClick"
    />
    <div class="ui-layer">
      <div class="button-group">
        <div
          v-for="item in floors"
          :key="item"
          :class="{ active: item === floor }"
          class="floor-button"
          @click="switchFloor(item)"
        >
          {{ item }}
        </div>
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
const Floors = ['B2', 'B3']
const BACKEND_HOST = 'https://xrequest.yunzaitech.com'

export default {
  components: {
    SvgMap,
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
    }
  },
  mounted () {
    const { width, height } = document.body.getBoundingClientRect()
    this.size = [width, height]

    // this.createSocketConnect()
    this.drawFloor()
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
      }

      ws.onmessage = (evt) => {
        console.log(evt.data)
      }
    },

    drawFloor () {
      this.fetchFloor(this.floor)
        .then(({ data }) => {
          this.json = data.data
        })
        .catch(() => console.log('获取楼层数据失败'))
    },

    fetchFloor (floor) {
      if (this.fetching) {
        this.source.cancel('cancel')
        this.source = axios.CancelToken.source()
      }
      this.fetching = true
      return axios.get(`${BACKEND_HOST}/getByFloor/${floor}`, {
        cancelToken: this.source.token
      }).finally(() => {
        this.fetching = false
      })
    },

    switchFloor (floor) {
      this.floor = floor
      this.drawFloor()
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
                class: '30',
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
    margin-left: 16px;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    width: 40px;
    background: hsl(0, 0%, 100%);
    border-radius: 5px;
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
