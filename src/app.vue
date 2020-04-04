<template>
  <div
    :class="{ 'ui-layer-open': showNavigateUI }"
    class="app"
    @click="handleOtherClick"
  >
    <header>
      <search @select-shape="focusShape" />
    </header>
    <main>
      <svg-map
        ref="mapRef"
        v-if="json"
        :size="size"
        :geojson="json"
        :shapes="navigateLine"
        :styles="styles"
        :markers="markers"
        :selected-shape="selectedShape"
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
      </div>
    </main>
    <footer
      class="footer"
    >
      <div
        v-if="activeShapeVm"
        class="floater"
        @click.stop
      >
        <div class="detail-container">
          <div class="shape-detail">
            <span class="shape-name">
              {{ activeShapeVm.shape.properties.name }}
            </span>
            <div
              v-if="activeShapeVm.shape.properties.description"
              class="shape-description"
            >
              {{ activeShapeVm.shape.properties.description }}
            </div>
          </div>
          <button
            v-if="navigateLine.length"
            class="button"
            @click="cleanNavigate"
          >
            取消路线
          </button>
          <button
            v-else
            class="button"
            @click="showNavigateLayer"
          >
            去这里
          </button>
        </div>
        <div
          class="share-button"
          @click="fireShareFunc"
        >
          分享给朋友
        </div>
      </div>
      <div
        v-else
        class="message-box">
        {{ message.content }}
      </div>
    </footer>
    <navigate-layer
      v-if="showNavigateUI && activeShapeVm"
      :target-shape="activeShapeVm.shape"
      @cancel="showNavigateUI = false"
      @navigate="displayNavigate"
    />
    <div class="logo">
      <img src="./assets/1.png" alt="logo">
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import SvgMap from './components/svgmap.vue'
import Search from './components/search.vue'
import NavigateLayer from './components/navigate.vue'
import styles from './style'

export default {
  components: {
    SvgMap,
    Search,
    NavigateLayer,
  },

  data () {
    return {
      floors: [],
      size: [0, 0],
      floor: null,
      position: null,
      sharePosition: null,
      json: null,
      fetching: false,
      navigatePathPoints: [],
      source: axios.CancelToken.source(),
      styles: styles,
      selectedShape: null,
      activeShapeVm: null,
      showNavigateUI: false,
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

    navigateLine () {
      const points = this.floor
        ? this.navigatePathPoints.filter(item => item[2] === this.floor.id)
        : []
      return points.length
        ? [{
            type: 'Feature',
            properties: {
              name: '导航线',
              uuid: `navigate-path-${this.floor.id}`,
              class: '导航线',
            },
            geometry: {
              type: 'LineString',
              coordinates: points,
            },
          }]
        : []
    },

    currentPosition () {
      return this.position
        ? {
            type: 'Feature',
            properties: {
              name: '当前位置',
              uuid: 'current-location',
              class: '定位点',
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

  watch: {
    activeShapeVm () {
      if (!this.activeShapeVm) return
      if (!this.selectedShape) return
      if (!this.activeShapeVm.shapeText) return
      this.$refs.mapRef.setOffsetCenter(this.activeShapeVm.textCenter)
      this.selectedShape = null
    },
  },

  mounted () {
    const { width, height } = document.querySelector('main').getBoundingClientRect()
    this.size = [width, height]

    this.fetchStyles()
    this.checkShareInfo()
    this.createSocketConnect()
  },

  methods: {
    checkUpdate () {
      return new Promise((resolve, reject) => {
        const dataVersion = localStorage.getItem('data-version')
        if (dataVersion) {
          axios.get('/refresh/currentVersion')
            .then((res) => {
              resolve(res.data !== dataVersion)
            })
            .catch((err) => reject(err))
        } else {
          resolve(true)
        }
      })
    },

    checkShareInfo () {
      const search = window.location.search
      const share = search && (search.match(/share=([^&]*)/) || ['', ''])[1]
      if (share) {
        const shareData = decodeURIComponent(share)
        this.sharePosition = shareData
      }
    },

    fireShareFunc () {
      if (this.shareStamp && (Date.now() - this.shareStamp < 600)) return
      this.shareStamp = Date.now()
      this.$emit('fireShare')
    },

    shareToFriend (ws) {
      const search = window.location.search
      const openId = search && (search.match(/openid=([^&]*)/) || ['', ''])[1]
      const position = this.activeShapeVm.textCenter
      const shareData = {
        form: 'Web',
        type: 'Message',
        openid: openId,
        data: {
          name: this.activeShapeVm.shape.properties.name,
          positionX: position[0],
          positionY: position[1],
          positionZ: this.floor.id,
          uuid: this.activeShapeVm.shape.properties.uuid,
        },
      }
      ws.send(JSON.stringify(shareData))
    },

    focusShape (shape) {
      const floor = this.floors.find(item => item.alias === shape.properties.floor)
      this.switchFloor(floor)
      this.selectedShape = shape
    },

    fetchFloors () {
      return axios.get('/floor/mapping')
        .then(({ data }) => {
          this.floors = Object.keys(data.data).map(alias => ({
            alias: alias,
            id: data.data[alias],
          }))
        })
    },

    fetchStyles () {
      axios.get('/typeList')
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
      const floorsRequest = this.fetchFloors()

      if (!openId) {
        floorsRequest.then(() => {
          this.floor = this.floors[0]
          this.drawFloor()
        })
      }

      ws.onopen = () => {
        console.log('onopen')
        const connectdata = {
          from: 'Web',
          type: 'Connect',
          openid: openId,
        }
        ws.send(JSON.stringify(connectdata))
        this.$on('fireShare', () => {
          const position = this.activeShapeVm.textCenter
          const shareData = {
            form: 'Web',
            type: 'Message',
            openid: openId,
            data: {
              name: this.activeShapeVm.shape.properties.name,
              positionX: position[0],
              positionY: position[1],
              positionZ: this.floor.id,
              uuid: this.activeShapeVm.shape.properties.uuid,
            },
          }
          console.log('发送分享数据')
          console.log(shareData)
          ws.send(JSON.stringify(shareData))
        })
      }

      ws.onmessage = (evt) => {
        console.log('onmessage')
        this.updatePosition(JSON.parse(evt.data), floorsRequest)
      }

      ws.onerror = () => {
        console.log('onerror')
        this.setMessage('获取位置失败，请确认是否开启了蓝牙，如果没有，分享和定位功能均不能使用')
      }
    },

    drawFloor () {
      this.fetchFloor(this.floor)
        .then(({ data }) => {
          this.json = data.data
        })
        .catch(() => {
          this.setMessage('获取楼层数据失败')
        })
    },

    updatePosition (position, floorsRequest = null) {
      const { positionX, positionY, positionZ } = position
      this.position = [parseFloat(positionX), parseFloat(positionY), parseInt(positionZ)]
      if (!this.floor) {
        if (this.floors.length) {
          this.switchFloor(this.getFloor(positionZ) || this.floors[0])
        } else {
          floorsRequest.then(() => {
            this.switchFloor(this.getFloor(positionZ) || this.floors[0])
          })
        }
      }
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

    _fetchFloor (floor) {
      if (this.fetching) {
        this.source.cancel('cancel')
        this.source = axios.CancelToken.source()
      }
      this.fetching = true
      this.setMessage('正在载入地图数据')
      return axios.get(`/getByFloor/${floor.alias}`, {
        cancelToken: this.source.token
      }).then((res) => {
        localStorage.setItem(`floor-id-${floor.id}`, JSON.stringify(res))
        return res
      }).finally(() => {
        this.fetching = false
        this.setMessage('')
      })
    },

    fetchFloor (floor) {
      const cache = localStorage.getItem(`floor-id-${floor.id}`)
      if (cache) {
        return new Promise((resolve, reject) => {
          this.checkUpdate().then((needUpdate) => {
            if (needUpdate) {
              this._fetchFloor(floor)
                .then(res => resolve(res))
                .catch(err => reject(err))
            } else {
              resolve(JSON.parse(cache))
            }
          }).catch(err => reject(err))
        })
      }
      return this._fetchFloor(floor)
    },

    switchFloor (floor) {
      if (!floor) return
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

    cleanNavigate () {
      this.navigatePathPoints = []
    },

    showNavigateLayer () {
      this.selectedShape = null
      this.showNavigateUI = true
    },

    displayNavigate (targets) {
      this.showNavigateUI = false
      const { start, end } = targets
      const message = `正在为您规划到${end.properties.name}的路线`
      const [sx, sy, sz] = start
        ? [start.properties.x_center, start.properties.y_center, start.properties.floor]
        : this.position
      if (!start && !this.position) {
        return
      }
      const [ex, ey, ez] = [
        end.properties.x_center,
        end.properties.y_center,
        end.properties.floor || this.floor.id
      ]
      this.setMessage(message, { closeable: false })
      axios.post('/direction', {
        startPosition: {
          positionX: `${sx}`,
          positionY: `${sy}`,
          positionZ: `${sz}`,
        },
        endPosition: {
          positionX: `${ex}`,
          positionY: `${sy}`,
          positionZ: `${ez}`,
        }
      })
        .then(({ data }) => {
          this.setMessage(message, {
            cb: () => {
              this.navigatePathPoints = data.data
            },
            duration: 1000,
          })
        })
        .catch(() => {
          this.setMessage('获取路线失败', { duration: 2000 })
        })
    },

    handleOtherClick () {
      if (this.activeShapeVm) {
        this.activeShapeVm.blur()
        this.activeShapeVm = null
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
      shapeVm.highlight(this.styles['区块选中'])
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

<style lang="scss">
  .app {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  main {
    flex: 1 0 0;
    position: relative;
  }

  .ui-layer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
  }

  .floater {
    display: block;
    box-shadow: 0 1px 4px 1px gray;
    border-radius: 4px;
    background-color: hsl(0, 0%, 100%);
  }

  .detail-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px 16px;
    justify-content: space-between;

    .shape-name {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .shape-description {
      font-size: 0.8em;
      color: #666;
    }
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
    border: 1px solid hsl(208, 85%, 31%);
    border-radius: 17px;
    outline: none;
    cursor: pointer;
    color: white;
  }

  .share-button {
    display: block;
    text-align: center;
    padding: 10px 24px;
    font-size: 14px;
    border-top: 1px solid hsl(0, 0%, 87%);
    color: hsl(208, 86%, 31%);
  }

  .message-box {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #666;
    position: absolute;
    bottom: 10px;
    left: 80px;
    text-align: left;
    padding: 5px 24px 5px 0;
  }

  header {
    padding: 12px 24px;
    color: #666;
    font-size: 14px;
    height: 59px;
    position: relative;
    z-index: 2;
    box-shadow: 0 0 4px 0 gray;
  }

  footer {
    height: 120px;
    padding: 10px 24px 10px 80px;
    position: relative;
  }

  .navigate-layer {
    height: 100%;
    width: 100%;
    z-index: 100;
    position: fixed;
    top: 100%;
    background-color: white;
    left: 0;
    transition: top ease-in-out .3s;
  }

  .ui-layer-open {
    header {
      visibility: hidden;
    }

    .navigate-layer {
      top: 0;
      box-shadow: 0 0 5px 1px #ccc;
    }
  }

  .logo {
    position: fixed;
    bottom: 0;
    left: 0px;
    z-index: 200;
    width: 80px;
    height: 81px;
    display: flex;

    img {
      max-width: 100%;
    }
  }
</style>
