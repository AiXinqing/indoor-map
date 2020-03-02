<template>
  <div class="map-container">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :width="size[0] + 'px'"
      :height="size[1] + 'px'"
      :viewBox="viewBox"
    >
      <g
        aria-label="transform-group"
        :transform="rotateTransform"
      >
        <g aria-label="normal-shapes">
          <geo-json
            v-if="reducedData"
            :shape="reducedData"
            :styles="styles"
            :zoom="currentZoom"
            :scale="scale"
            :rotate="rotateAngle"
            v-on="$listeners"
          />
          <component
            v-for="shape in reducedShapes"
            :key="shape.properties.uuid"
            :is="_getComponent(shape)"
            :styles="_getStyle(shape)"
            :shape="shape"
            :zoom="currentZoom"
            :scale="scale"
            v-on="$listeners"
          />
        </g>
        <g aria-label="makers-group">
          <point-shape
            v-for="marker in reducedMarkers"
            :key="marker.properties.uuid"
            :shape="marker"
            :radius="1000 * currentZoom"
            :styles="_getStyle(marker)"
          />
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
import AlloyFinger from 'alloyfinger'
import reduceFloorData, { reduceData } from '../reduce'

import GeoJson from './shapes/GeoJSON.vue'
import PolygonShape from './shapes/Polygon.vue'
import PointShape from './shapes/Point.vue'
import LineString from './shapes/LineString.vue'

export default {
  inheritAttrs: false,

  components: {
    GeoJson,
    PolygonShape,
    LineString,
    PointShape,
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
    shapes: {
      type: Array,
      default: () => [],
    },
    geojson: {
      type: Object,
      required: true,
    },
    markers: {
      type: Array,
      default: () => [],
    },
    zoom: {
      type: Number,
      default: 1.2,
    },
  },

  data () {
    return {
      offset: [0, 0],
      scale: 1,
      center: [0, 0],
      reducedData: null,
      rotateAngle: 0,
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
        this.$emit('floor-change', this)
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

    rotateTransform () {
      const [w, h] = this.center
      return `rotate(${this.rotateAngle}, ${w}, ${h})`
    },

    reducedShapes () {
      return this.shapes.map(item => reduceData(item, this.offset))
    },

    reducedMarkers () {
      return this.markers.map(item => reduceData(item, this.offset))
    },
  },

  mounted () {
    new AlloyFinger(this.$el, {
      pressMove: (event) => {
        const theta = this.rotateAngle / 180 * Math.PI
        const { deltaX, deltaY } = event
        const dx = deltaX * Math.cos(theta) + deltaY * Math.sin(theta)
        const dy = deltaY * Math.cos(theta) - deltaX * Math.sin(theta)
        this.translate(dx, dy)
      },
      pinch: (evt) => {
        this.setZoom(this.originZoom / evt.zoom)
      },
      multipointEnd: () => {
        this.setOriginZoom()
      },
      doubleTap: () => {
        this.setZoom(this.currentZoom * 0.85)
        this.setOriginZoom()
      },
      rotate: (evt) => {
        this.rotate(evt.angle)
      },
    })
  },

  methods: {
    rotate (angle) {
      this.rotateAngle += angle
    },

    setZoom (zoom) {
      this.currentZoom = zoom
    },

    setOriginZoom () {
      this.originZoom = this.currentZoom
    },

    translate (x, y) {
      const [cx, cy] = this.center
      const zoom = this.currentZoom
      this.center = [cx - x * this.scale * zoom, cy - y * this.scale * zoom]
    },

    // 平移图形到以 point 为中心
    setCenter (point) {
      const [offsetX, offsetY] = this.offset
      const [px, py] = point
      this.center = [px - offsetX, -py - offsetY]
    },

    getOriginPoint (point) {
      const [x, y] = point
      const [offsetX, offsetY] = this.offset
      return [x + offsetX, -y - offsetY]
    },

    setFitView (range) {
      const { Xmin, Xmax, Ymin, Ymax } = range
      const [width, height] = this.size
      this.scale = Math.max((Xmax - Xmin) / width, (Ymax -Ymin) / height)
      this.center = [(Xmax + Xmin) / 2, (Ymax + Ymin) / 2]
      this.rotateAngle = 0
      this.setZoom(1.2)
      this.setOriginZoom()
    },

    _getComponent (shape) {
      switch (shape.geometry.type) {
        case 'Polygon':
          return 'polygon-shape'
        case 'LineString':
          return 'line-string'
        default:
          return 'point-shape'
      }
    },

    _getStyle (shape) {
      return this.styles[shape.properties.class || 'fallback'] || this.styles.fallback
    },
  },
}
</script>
