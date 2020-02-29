<template>
  <g>
    <polygon
      :points="points"
      :style="shapeStyle"
      @click.stop="handleClick"
    />
    <text
      v-if="shapeText"
      :x="textCenter[0]"
      :y="textCenter[1]"
      :font-size="14 * zoom"
      text-anchor="middle"
      dominant-baseline="middle"
    >
      {{ shapeText }}
    </text>
  </g>
</template>

<script>
import ShapeMixins from './shapes_mixin'

export default {
  mixins: [ShapeMixins],

  data () {
    return {
      highlightStyle: {},
    }
  },

  computed: {
    points () {
      const points = this.shape.geometry.coordinates[0]
      return points.map(point => `${point[0]},${point[1]}`).join(' ')
    },

    shapeText () {
      return this.shape.properties.name
    },

    textCenter () {
      return this.shapeText
        ? this.calculatePolygonGravityCenter(this.shape.geometry.coordinates[0])
        : [0, 0]
    },

    shapeStyle () {
      return {
        ...this.styles,
        ...this.highlightStyle,
      }
    },
  },

  methods: {
    handleClick () {
      this.$emit('click-shape', this)
    },

    highlight (style) {
      this.highlightStyle = style
    },

    blur () {
      this.highlightStyle = {}
    },

    calculatePolygonGravityCenter (points) {
      var area = 0
      const [x, y] = points.reduce((acc, item, index, arr) => {
        const [ax, ay] = acc
        const [px, py] = item
        const [nx, ny] = arr[(index + 1) % arr.length]
        const tmp = (nx * py - px * ny) / 2
        area += tmp
        return [ax + tmp * (px + nx) / 3, ay + tmp * (py + ny) / 3]
      }, [0, 0])

      return [x / area, y / area]
    },
  },
}
</script>
