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
            :shape="reducedData"
            :styles="styles"
          />
        </g>
        <g aria-label="makers-group"></g>
      </g>
    </svg>
  </div>
</template>

<script>
import GeoJson from './shapes/GeoJSON.vue'
import AlloyFinger from 'alloyfinger'
import reduceFloorData from '../reduce'

export default {
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
    const data = reduceFloorData(this.geojson)
    const [offsetX, offsetY] = data.offset
    const { Xmin, Ymin, Xmax, Ymax } = data.range
    const [width, height] = this.size
    return {
      offset: data.offset,
      scale: Math.max((Xmax - Xmin) / width, (Ymax -Ymin) / height),
      center: [(Xmax + Xmin) / 2 - offsetX, (Ymax + Ymin) / 2 - offsetY],
      reducedData: data.reducedData,
      rotateAngle: 0,
      originZoom: this.zoom,
      currentZoom: this.zoom,
    }
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
  },

  mounted () {
    new AlloyFinger(this.$el, {
      pressMove: (event) => {
        this.translate(event.deltaX, event.deltaY)
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
  },
}
</script>
