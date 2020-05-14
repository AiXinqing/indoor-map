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
        :selected-shape="selectedShape"
        @click-shape="handleShapeClick"
      />
      <MarkerShape
        v-if="endMarker"
        type="pop"
        center-text="终"
        :shape="endMarker"
        :scale="scale"
        :zoom="currentZoom"
        :style="styles.target"
      />
      <MarkerShape
        v-if="startMarker"
        type="pop"
        center-text="起"
        :shape="startMarker"
        :scale="scale"
        :zoom="currentZoom"
        :style="styles.location"
      />
    </svg>
  </div>
</template>

<script>
import AlloyFinger from 'alloyfinger'
import reduceFloorData, { reduceData } from '../reduce'
import GeoJson from './shapes/GeoJSON.vue'
import MarkerShape from './shapes/Marker.vue'

export default {
  inheritAttrs: false,

  components: {
    GeoJson,
    MarkerShape,
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
    endPoint: {
      type: Object,
      default: null,
    },
    startPoint: {
      type: Object,
      default: null,
    },
    selectedShape: {
      type: Object,
      default: null,
    },
    currentFloor: {
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

    endMarker () {
      if (!this.endPoint) return null
      const { floor } = this.endPoint.properties
      if (floor && (floor !== this.currentFloor.alias)) return null
      return reduceData(this.endPoint, this.offset)
    },

    startMarker () {
      if (!this.startPoint) return null
      const { floor } = this.startPoint.properties
      if (floor && (floor !== this.currentFloor.alias)) return null
      return reduceData(this.startPoint, this.offset)
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
    handleShapeClick (shapeVm, event) {
      this.$emit('shape-clicked', shapeVm, this.getPoint(event))
    },

    getPoint (event) {
      const { clientX, clientY } = event
      const { top, left } = this.$el.getBoundingClientRect()
      const px = (clientX - left) * this.scale * this.currentZoom + this.viewBox[0]
      const py = (clientY - top) * this.scale * this.currentZoom + this.viewBox[1]
      return this.getOriginPoint([px, py])
    },

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

    getOriginPoint (point) {
      const [x, y, ...rest] = point
      const [offsetX, offsetY] = this.offset
      return [x + offsetX, -y - offsetY, ...rest]
    },

    getOffsetPoint (point) {
      const [x, y, ...rest] = point
      const [offsetX, offsetY] = this.offset
      return [x - offsetX, offsetY - y, ...rest]
    },
  },
}
</script>
