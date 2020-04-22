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
        :styles="styles"
        :markers="markers"
        :navigate-points="navigatePoints"
        :selected-shape="selectedShape"
        @click-shape="handleShapeClick"
        @simulate-end="endSimulate"
      />
      <UILayer
        :floorId="floor && floor.id"
        :floors="floors"
        @onlocate="locateToCenter"
        @switch-floor="switchFloor"
      />
    </main>
    <footer
      class="footer"
    >
      <shape-detail
        v-if="activeShapeVm && !simulating"
        :shape="activeShapeVm.shape"
        :navigate-points="navigatePoints"
        @fire-share="fireShareFunc"
        @show-navigate-ui="showNavigateLayer"
        @cancel-navigate="cleanNavigate"
      />
      <div class="message-box">
        {{ message }}
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
import ShapeDetail from './components/detail.vue'
import NavigateLayer from './components/navigate.vue'
import UILayer from './components/ui.vue'
import styles from './style'

export default {
  components: {
    SvgMap,
    Search,
    UILayer,
    ShapeDetail,
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
      message: '',
      simulating: false,
    }
  },

  computed: {
    positionFloor () {
      return this.position && this.position[2]
    },

    navigatePoints () {
      return this.floor
        ? this.navigatePathPoints.filter(item => item[2] === this.floor.id)
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
        const shareData = JSON.parse(decodeURIComponent(share))
        this.sharePosition = shareData
      }
    },

    fireShareFunc () {
      this.$emit('fireShare')
    },

    shareToFriend (ws) {
      const search = window.location.search
      const openId = search && (search.match(/openid=([^&]*)/) || ['', ''])[1]
      const position = this.activeShapeVm.textCenter
      const shareData = {
        from: 'Web',
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
          if (this.sharePosition) {
            const shareFloor = this.getFloor(this.sharePosition.positionZ)
            this.switchFloor(shareFloor)
            this.selectedShape = {
              properties: {
                uuid: this.sharePosition.uuid,
                name: this.sharePosition.name,
              }
            }
          }
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
        .catch(() => {})
    },

    setMessage (content, duration = 0) {
      this.message = content
      if (duration > 0) {
        if (this._message_timer) clearTimeout(this._message_timer)
        this._message_timer = setTimeout(() => {
          this.message = ''
          this._message_timer = null
        }, duration)
      }
    },

    createSocketConnect () {
      const search = window.location.search
      const openId = search && (search.match(/openid=([^&]*)/) || ['', ''])[1]
      const ws = new WebSocket('wss://xsocket.yunzaitech.com')
      const floorsRequest = this.fetchFloors()

      ws.onopen = () => {
        const connectdata = {
          from: 'Web',
          type: 'Connect',
          openid: openId,
        }
        ws.send(JSON.stringify(connectdata))
        this.setMessage('正在获取定位')
        this.$on('fireShare', () => {
          this.shareToFriend(ws)
        })
        // 1s 后没有拿到定位信息，就显示第一楼的数据
        setTimeout(() => {
          // 如果有分享的位置，则优先展示分享的位置的楼层
          if (this.sharePosition) return
          this.setMessage('没有获取到定位信息')
          if (!this.position && !this.floor) {
            if (this.floors.length) {
              this.switchFloor(this.floors[0])
              if (this.positionFloor) {
                this.setMessage('')
              } else {
                this.setMessage('定位失败，请确认是否允许开启蓝牙', 4000)
              }
            } else {
              floorsRequest.then(() => {
                this.switchFloor(this.floors[0])
                if (this.positionFloor) {
                  this.setMessage('')
                } else {
                  this.setMessage('定位失败，请确认是否允许开启蓝牙', 4000)
                }
              })
            }
          }
        }, 1000)
      }

      ws.onmessage = (evt) => {
        this.setMessage('')
        this.updatePosition(JSON.parse(evt.data), floorsRequest)
      }

      ws.onerror = () => {
        this.setMessage('获取位置失败，请确认是否开启了蓝牙')
      }
    },

    drawFloor () {
      this.fetchFloor(this.floor)
        .then(({ data }) => {
          this.json = data.data
        })
        .catch(() => {
          this.setMessage('获取楼层数据失败', 2000)
        })
    },

    updatePosition (position, floorsRequest = null) {
      const { positionX, positionY, positionZ } = position
      this.position = [parseFloat(positionX), parseFloat(positionY), parseInt(positionZ)]
      if (this.sharePosition) return
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
      if (!this.positionFloor) {
        this.setMessage('定位失败，请确认是否允许开启蓝牙', 4000)
        return
      }
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

    getFloorByName (floorName) {
      return this.floors.find(item => item.alias === floorName)
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

    endSimulate () {
      this.simulating = false
    },

    showNavigateLayer () {
      if (this.navigatePoints.length) {
        this.simulating = true
        this.$refs.mapRef.simulateNav()
      } else {
        this.selectedShape = null
        this.showNavigateUI = true
      }
    },

    displayNavigate (targets) {
      this.showNavigateUI = false
      const { start, end } = targets
      if (!start && !this.position) {
        this.setMessage('当前位置不可用')
        return
      }
      const message = `正在为您规划到${end.properties.name}的路线`
      this.setMessage(message)
      const [sx, sy, sz] = start
        ? [
          start.properties.x_center,
          start.properties.y_center,
          this.getFloorByName(start.properties.floor).id
        ]
        : this.position
      const [ex, ey, ez] = [
        end.properties.x_center,
        end.properties.y_center,
        this.getFloorByName(end.properties.floor).id || this.floor.id
      ]
      axios.post('/direction', {
        startPosition: {
          positionX: `${sx}`,
          positionY: `${sy}`,
          positionZ: `${sz}`,
        },
        endPosition: {
          positionX: `${ex}`,
          positionY: `${ey}`,
          positionZ: `${ez}`,
        }
      })
        .then(({ data }) => {
          if (data.data.length < 2) {
            this.setMessage('路线规划失败, 请重试', 5000)
          } else {
            this.navigatePathPoints = data.data
            this.setMessage('')
          }
        })
        .catch(() => {
          this.setMessage('路线规划失败, 请确认起止点是否正确', 5000)
        })
    },

    handleOtherClick () {
      if (this.activeShapeVm) {
        this.activeShapeVm.blur()
        this.activeShapeVm = null
      }
    },

    handleShapeClick (shapeVm) {
      if (!shapeVm) {
        this.activeShapeVm && this.activeShapeVm.blur()
        return
      }
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
  $side-space: 16px;

  .app {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  header {
    padding: 12px $side-space;
    color: #666;
    font-size: 14px;
    height: 59px;
    position: relative;
    z-index: 2;
    box-shadow: 0 0 4px 0 gray;
  }

  main {
    flex: 1 0 0;
    position: relative;
  }

  footer {
    height: 9vh;
    padding: 10px $side-space 10px 80px;
    position: relative;
    z-index: 2;
    box-shadow: 0 0 4px 0 gray;
  }

  .button {
    flex-shrink: 0;
    background: hsl(208, 86%, 31%);
    font-size: 14px;
    line-height: 21px;
    padding: 4px 10px;
    letter-spacing: 1px;
    border: 1px solid hsl(208, 85%, 31%);
    border-radius: 17px;
    outline: none;
    cursor: pointer;
    color: white;

    &.button-reverse {
      color: hsl(208, 86%, 31%);
      background-color: white;
    }
  }

  .message-box {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #666;
    position: absolute;
    bottom: 4px;
    left: 80px;
    text-align: left;
    padding: 5px $side-space 5px 0;
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
    bottom: 9vh;
    left: 6px;
    z-index: 200;
    width: 60px;
    height: 61px;
    display: flex;
    margin-bottom: -40px;

    img {
      max-width: 100%;
    }
  }
</style>
