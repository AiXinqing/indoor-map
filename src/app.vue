<template>
  <div class="app">
    <svg-map
      v-if="json"
      :size="size"
      :geojson="json"
      :styles="styles"
      @click-shape="handleShapeClick"
    />
    <div class="ui-layer">UI</div>
  </div>
</template>

<script>
import axios from 'axios'
import SvgMap from './components/svgmap.vue'
import styles from './style'

const ExamplePosition = [46010, 43122]
const BACKEND_HOST = 'https://xrequest.yunzaitech.com'

export default {
  components: {
    SvgMap,
  },

  data () {
    return {
      size: [0, 0],
      floor: 'B3',
      position: ExamplePosition,
      json: null,
      fetching: false,
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

    handleShapeClick (shapeVm) {
      if (this.activeShapeVm) {
        this.activeShapeVm.blur()
        if (shapeVm === this.activeShapeVm) return this.activeShapeVm = null
      }
      shapeVm.highlight({
        fill: 'red',
      })
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
</style>
