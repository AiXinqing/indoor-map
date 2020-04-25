<template>
  <g class="geojson-shape">
    <polygon-shape
      v-for="shape in polygonShapes"
      :key="shape.properties.uuid + '-shadow'"
      :styles="getStyle(shape)"
      :shape="shape"
      v-bind="attrs"
      shadow
      v-on="$listeners"
    />
    <polygon-shape
      v-for="shape in shadowedShapes"
      :key="shape.properties.uuid"
      :styles="getStyle(shape)"
      :shape="shape"
      v-bind="attrs"
      v-on="$listeners"
    />
    <line-string
      v-for="shape in lineShapes"
      :key="shape.properties.uuid"
      :styles="getStyle(shape)"
      :shape="shape"
      v-bind="attrs"
      v-on="$listeners"
    />
    <point-shape
      v-for="shape in pointShapes"
      :key="shape.properties.uuid"
      :styles="getStyle(shape)"
      :shape="shape"
      v-bind="attrs"
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
    attrs () {
      return {
        zoom: this.zoom,
        scale: this.scale,
        rotate: this.rotate,
        selectedShape: this.selectedShape,
      }
    },
    shapes () {
      return this.shape.features
    },

    polygonShapes () {
      return this.shapes.filter(item => item.geometry.type === 'Polygon')
    },

    pointShapes () {
      return this.shapes.filter(item => item.geometry.type === 'Point')
    },

    lineShapes () {
      return this.shapes.filter(item => item.geometry.type === 'LineString')
    },

    shadowedShapes () {
      return this.polygonShapes.filter((item) => {
        return item.properties.elev && (parseInt(item.properties.elev) > 0)
      })
    },

    unshadowedShapes () {
      return this.polygonShapes.filter((item) => {
        return !item.properties.elev || (parseInt(item.properties.elev) <= 0)
      })
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
  },
}
</script>
