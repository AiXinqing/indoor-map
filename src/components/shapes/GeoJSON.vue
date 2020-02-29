<template>
  <g class="geojson-shape">
    <component
      v-for="shape in shapes"
      :key="shape.properties.uuid"
      :is="getComponent(shape)"
      :styles="getStyle(shape)"
      :shape="shape"
      v-on="$listeners"
    />
  </g>
</template>

<script>
import ShapeMixins from './shapes_mixin'
import PolygonShape from './Polygon.vue'
import LineString from './LineString.vue'

export default {
  inheritAttrs: false,

  components: {
    PolygonShape,
    LineString,
  },
  mixins: [ShapeMixins],

  computed: {
    shapes () {
      return this.shape.features
    },
  },

  methods: {
    getStyle (shape) {
      switch (shape.geometry.type) {
        case 'Polygon':
          return this.styles[shape.properties.class || 'fallback']
        case 'LineString':
          return { stroke: this.randomColor(), 'stroke-width': shape.properties.LineWt, fill: 'none' }
      }
    },

    getComponent (shape) {
      switch (shape.geometry.type) {
        case 'Polygon':
          return 'polygon-shape'
        case 'LineString':
          return 'line-string'
        default:
      }
    },

    randomColor () {
      const r = Math.round(Math.random() * 255)
      const g = Math.round(Math.random() * 255)
      const b = Math.round(Math.random() * 255)
      return `rgb(${r},${g},${b})`
    },
  },
}
</script>