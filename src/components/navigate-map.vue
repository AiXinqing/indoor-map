<template>
  <div class="map-container">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :width="size[0] + 'px'"
      :height="size[1] + 'px'"
      :viewBox="viewBox"
    >
      <geo-json
        ref="mapRef"
        v-if="reducedData"
        :shape="reducedData"
        :styles="styles"
        :zoom="currentZoom"
        :scale="scale"
        :rotate="0"
        :selected-shape="selectedShape"
        v-on="$listeners"
      />
    </svg>
  </div>
</template>

<script>
import AlloyFinger from 'alloyfinger'
import reduceFloorData from '../reduce'
import GeoJson from './shapes/GeoJSON.vue'

export default {
  inheritAttrs: false,

  components: {
    GeoJson,
  },

  props: {
    size: {
      type: Array,
      required: true,
    },
    styles: {
      type: Object,
      default: () => ({}),
    },
    geojson: {
      type: Object,
      required: true,
    },

    selectedShape: {
      type: Object,
      default: null,
    },
  },

  data () {
    return {
      offset: [0, 0],
      scale: 1,
      center: [0, 0],
      reducedData: null,
      originZoom: this.zoom,
      currentZoom: this.zoom,
    }
  },

  watch: {
    geojson: {
      immediate: true,
      handler () {
        const data = reduceFloorData(this.geojson)
        const [offsetX, offsetY] = data.offset
        this.offset = data.offset
        this.setFitView(data.range)
        this.reducedData = data.reducedData
      },
    },
  },

  computed: {
    viewBox () {
      const [cx, cy] = this.center
      const [w, h] = this.size
      const zoom = this.currentZoom
      return [
        cx - w / 2 * this.scale * zoom,
        cy - h / 2 * this.scale * zoom,
        w * this.scale * zoom,
        h * this.scale * zoom,
      ]
    },
  },

  mounted () {
    new AlloyFinger(this.$el, {
      pressMove: (event) => {
        const { deltaX, deltaY } = event
        this.translate(deltaX, deltaY)
      },
      pinch: (evt) => {
        this.setZoom(this.originZoom / evt.zoom)
      },
      multipointEnd: () => {
        this.setOriginZoom()
      },
      doubleTap: () => {
        this.zoomIn()
      },
    })
  },

  methods: {
    setFitView (range, zoom = 0.6) {
      const { Xmin, Xmax, Ymin, Ymax } = range
      const [width, height] = this.size
      this.scale = Math.max((Xmax - Xmin) / width, (Ymax -Ymin) / height)
      this.center = [(Xmax + Xmin) / 2, (Ymax + Ymin) / 2]
      this.setZoom(zoom)
      this.setOriginZoom()
    },

    setZoom (zoom) {
      this.currentZoom = Math.min(Math.max(zoom, 0.05), 2)
    },

    setOriginZoom () {
      this.originZoom = this.currentZoom
    },

    zoomIn () {
      this.setZoom(this.currentZoom * 0.85)
      this.setOriginZoom()
    },

    translate (x, y) {
      const [cx, cy] = this.center
      const zoom = this.currentZoom
      this.center = [cx - x * this.scale * zoom, cy - y * this.scale * zoom]
    },
  },
}
</script>
