<template>
  <div class="app">
    <svg-map
      ref="mapRef"
      v-if="json"
      :size="size"
      :geojson="json"
      :shapes="shapes"
      :styles="styles"
      :markers="markers"
      :selected-shape="selectedShape"
      @click-shape="handleShapeClick"
    />
    <div class="ui-layer">
      <div class="search-component">
        <div class="search-input">
          <input
            v-model="searchKey"
            placeholder="输入搜索关键词"
            type="text"
            @change="doSearch"
          />
          <svg
            v-if="searchResults"
            width="14px"
            height="14px"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            @click="cleanSearch"
          >
            <path
              d="M1,1L15,15L8,8L1,15L15,1"
              fill="none"
              stroke="currentColor"
              stroke-width="2px"
            />
          </svg>
        </div>
        <div
          v-if="searchResults"
          class="search-results"
          @touchmove="handleScrollTouchMove"
        >
          <div
            v-for="result in searchResults"
            :key="result.properties.uuid"
            class="search-result-item"
            @click="focusShape(result)"
          >
            <div class="search-result-item-title">
              {{ result.properties.name }}
            </div>
            <div class="search-result-item-description">
              所属楼层: {{ result.properties.floor }}
            </div>
          </div>
          <div
            v-if="!searchResults.length"
            class="blankslate"
          >
            没有找到相关的信息
          </div>
        </div>
      </div>
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
    <div
      v-if="message.content"
      class="message-box"
      @click="handleMessageClick"
    >
      <div>{{ message.content }}</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import SvgMap from './components/svgmap.vue'
import styles from './style'

const ExamplePosition = {
  positionX: 308258249.8175751,
  positionY: 506969415.9401813,
  positionZ: -2,
}

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
      searchKey: '',
      searchResults: null,
      floors: Floors,
      size: [0, 0],
      floor: null,
      position: null,
      json: null,
      fetching: false,
      shapes: [],
      source: axios.CancelToken.source(),
      styles: styles,
      selectedShape: null,
      activeShapeVm: null,
      message: {
        closeable: true,
        content: '',
      },
    }
  },

  computed: {
    positionFloor () {
      return this.position && this.position[2]
    },

    currentPosition () {
      return this.position
        ? {
            type: 'Feature',
            properties: {
              name: '当前位置',
              uuid: 'current-location',
              class: '-2',
              floor: this.positionFloor,
            },
            geometry: {
              type: 'Point',
              coordinates: this.positionCenter,
            },
          }
        : null
    },

    positionCenter () {
      return this.position && this.position.slice(0, 2)
    },

    markers () {
      return this.currentPosition ? [this.currentPosition] : []
    },
  },

  mounted () {
    const { width, height } = document.body.getBoundingClientRect()
    this.size = [width, height]

    this.createSocketConnect()
    this.fetchStyles()
  },

  methods: {
    doSearch () {
      if (!this.searchKey) {
        this.searchResults = null
        return
      }
      axios.get('/search', {
        baseURL: 'http://39.106.77.97:8081/',
        params: {
          name: this.searchKey,
        },
      })
      .then(({ data }) => {
        this.searchResults = data.data
      })
    },

    cleanSearch () {
      this.searchResults = null
      this.searchKey = ''
    },

    focusShape (shape) {
      this.cleanSearch()
      const floor = this.floors.find(item => item.alias === shape.properties.floor)
      this.switchFloor(floor)
      this.selectedShape = shape
    },

    // 禁止滚动被橡皮筋弄失效
    handleScrollTouchMove (event) {
      event._isScroll = true
    },

    fetchStyles () {
      axios.get('/typeList', {
        baseURL: 'http://39.106.77.97:8081/',
      })
        .then(({ data }) => {
          this.styles = data.data.reduce((acc, style) => {
            const data = typeof style.typeData === 'string'
              ? JSON.parse(style.typeData)
              : style.typeData
            acc[style.typeName] = data
            return acc
          }, { ...styles })
        })
        .catch((err) => {
          console.log(err)
        })
    },

    setMessage (content, options = {}) {
      this.message_timer && clearTimeout(this.message_timer)
      const closeable = options.hasOwnProperty('closeable')
        ? options.closeable
        : true
      const duration = options.hasOwnProperty('duration')
        ? options.duration
        : -1
      this.message = {
        content,
        closeable,
      }
      if (duration > 0) {
        this.message_timer = setTimeout(() => {
          this.message.content = ''
          options.cb && options.cb()
        }, duration)
      }
    },

    createSocketConnect () {
      const search = window.location.search
      const openId = search && (search.match(/openid=([^&]*)/) || ['', ''])[1]
      const ws = new WebSocket('wss://xsocket.yunzaitech.com')

      if (!openId) {
        this.floor = this.floors[0]
        this.drawFloor()
        return
      }

      ws.onopen = () => {
        const connectdata = {
          from: 'Web',
          type: 'Connect',
          openid: openId,
        }
        ws.send(JSON.stringify(connectdata))
      }

      ws.onmessage = (evt) => {
        this.updatePosition(JSON.parse(evt.data))
      }

      ws.onerror = () => {
        this.setMessage('获取不到你的定位，请确认是否开启了蓝牙', { duration: 2000 })
      }
    },

    drawFloor () {
      this.fetchFloor(this.floor)
        .then(({ data }) => {
          this.json = data.data
        })
        .catch(() => {
          this.setMessage('获取楼层数据失败', { duration: 3000 })
        })
    },

    updatePosition (position) {
      const { positionX, positionY, positionZ } = position
      this.position = [positionX, positionY, positionZ]
      if (!this.floor) this.switchFloor(this.getFloor(positionZ))
    },

    locateToCenter () {
      if (this.floor.id != this.positionFloor) {
        this.switchFloor(this.getFloor(this.positionFloor))
        this.$refs.mapRef.$once('floor-change', (vm) => {
          vm.setCenter(this.positionCenter)
        })
      } else {
        if (!this.$refs.mapRef) return
        this.$refs.mapRef.setCenter(this.positionCenter)
      }
    },

    fetchFloor (floor) {
      if (this.storage) {
        const cache = localStorage.getItem(`floor-id-${floor.id}`)
        if (cache) {
          return Promise.resolve(JSON.parse(cache))
        }
      }
      if (this.fetching) {
        this.source.cancel('cancel')
        this.source = axios.CancelToken.source()
      }
      this.fetching = true
      this.setMessage('正在载入地图数据', { closeable: false })
      return axios.get(`/getByFloor/${floor.alias}`, {
        cancelToken: this.source.token
      }).then((res) => {
        this.setMessage('正在载入地图数据', { closeable: true, duration: 300 })
        if (this.storage) {
          localStorage.setItem(`floor-id-${floor.id}`, JSON.stringify(res))
        }
        return res
      }).finally(() => {
        this.fetching = false
      })
    },

    switchFloor (floor) {
      if (!floor) return
      if (floor === this.floor) return
      this.floor = floor
      this.drawFloor()
      this.cleanNavigate()
    },

    getFloor (floorId, offset = 0) {
      const floorIndex = this.floors.findIndex(item => item.id === floorId)
      const index = floorIndex + offset
      if (index < 0 || index >= this.floors.length) return undefined
      return this.floors[index]
    },

    cleanNavigate () {
      this.shapes = []
    },

    displayNavigate () {
      const message = `正在为您规划到${this.activeShapeVm.shape.properties.name}的路线`
      this.setMessage(message, { closeable: false })
      axios.get('/direction')
        .then(({ data }) => {
          this.setMessage(message, {
            cb: () => {
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
            },
            duration: 1000,
          })
        })
        .catch(() => {
          this.setMessage('获取路线失败', { duration: 2000 })
        })
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
      const highlightStyle = { fill: 'hsl(37, 45%, 72%)' }
      shapeVm.highlight(highlightStyle)
      this.activeShapeVm = shapeVm
    },

    handleMessageClick () {
      if (this.message.closeable) {
        this.message.content = ''
      }
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
    z-index: 2;
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
    background-color: hsl(208, 86%, 31%);
    border-color: hsl(208, 86%, 31%);
    color: white;
  }

  .locate-button {
    width: 40px;
    height: 40px;
    padding: 8px;
    border: 1px solid #ddd;
    background-color: white;
    border-radius: 5px;
    color: #333;
    cursor: pointer;
    position: absolute;
    bottom: 100%;
    left: 16px;
    margin-bottom: 12px;
  }

  .locate-button.active {
    color: hsl(208, 86%, 31%);
  }

  .button {
    flex-shrink: 0;
    background: hsl(208, 86%, 31%);
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

  .message-box {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    color: #666;
  }

  .search-component {
    position: fixed;
    top: 24px;
    left: 24px;
    right: 24px;
    color: #666;
    font-size: 14px;
  }

  .search-input input {
    width: 100%;
    padding: 8px 26px 8px 12px;
    font-size: inherit;
    color: inherit;
    border: 1px solid #ddd;
    box-shadow: none;
    border-radius: 5px;
    outline: none;
    background-color: white;
    -webkit-appearance: none;
  }

  .search-input svg {
    position: absolute;
    right: 12px;
    top: 11px;
  }

  .search-input input::-webkit-input-placeholder {
    color: #999;
  }

  .search-input input:focus {
    outline: none;
    box-shadow: 0 1px 5px 0px hsl(208, 86%, 31%);
    border-color: hsl(208, 86%, 31%);
  }

  .search-results {
    position: absolute;
    top: 100%;
    margin-top: 4px;
    left: 0;
    right: 0;
    max-height: calc(60vh - 65px);
    overflow: auto;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .search-result-item {
    padding: 4px 12px;
    border-top: 1px solid #f6f6f6;
  }

  .search-result-item:first-child {
    border-top: none;
  }

  .search-result-item-description {
    color: #999;
    font-size: 12px;
    margin-top: 4px;
  }

  .search-results .blankslate {
    padding: 20px 12px;
    text-align: center;
    font-size: 16px;
  }
</style>
