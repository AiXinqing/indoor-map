<template>
  <g class="geojson-shape">
    <component
      v-for="shape in shapes"
      :key="shape.properties.uuid"
      :is="getComponent(shape)"
      :styles="getStyle(shape)"
      :shape="shape"
      :zoom="zoom"
      :scale="scale"
      :rotate="rotate"
      :selected-shape="selectedShape"
      v-on="$listeners"
    />
  </g>
</template>

<script>
import ShapeMixins from './shapes_mixin'
import PolygonShape from './Polygon.vue'
import LineString from './LineString.vue'
import PointShape from './Point.vue'

export default {
  inheritAttrs: false,

  components: {
    PolygonShape,
    LineString,
    PointShape,
  },
  mixins: [ShapeMixins],

  props: {
    selectedShape: {
      type: Object,
      default: null,
    },
  },

  computed: {
    shapes () {
      return this.shape.features
    },
  },

  methods: {
    getStyle (shape) {
      switch (shape.geometry.type) {
        case 'Polygon':
          return this.styles[shape.properties.class || 'fallback'] || this.styles.fallback
        case 'LineString':
          return {
            ...this.styles['车流线'],
            'strokeWidth': shape.properties.LineWt,
          }
      }
    },

    getComponent (shape) {
      switch (shape.geometry.type) {
        case 'Polygon':
          return 'polygon-shape'
        case 'LineString':
          return 'line-string'
        case 'Point':
          return 'point-shape'
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
