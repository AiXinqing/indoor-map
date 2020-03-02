<template>
  <g>
    <polygon
      :points="points"
      :style="shapeStyle"
      :class="shape.properties.class"
      @click.stop="handleClick"
    />
    <text
      v-if="shapeText"
      v-bind="textRotate"
      :font-size="textSize"
      :x="textCenter[0]"
      :y="textCenter[1]"
      dy="0.1em"
      fill="#666"
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
      return this.shape.properties.class !== '0' && this.shape.properties.name
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

    textSize () {
      const { Xmax, Xmin } = this.range
      const max = Xmax - Xmin
      if (this.zoom * this.scale * 10 > max / 6) {
        return 0
      }
      return Math.min(max / 6, this.zoom * this.scale * 24)
    },

    range () {
      const points = this.shape.geometry.coordinates[0]
      return points.reduce((acc, point) => {
        const [x, y] = point
        if (acc.hasOwnProperty('Xmin')) {
          acc.Xmin = Math.min(acc.Xmin, x)
          acc.Xmax = Math.max(acc.Xmax, x)
          acc.Ymin = Math.min(acc.Ymin, y)
          acc.Ymax = Math.max(acc.Ymax, y)
        } else {
          acc.Xmin = x
          acc.Xmax = x
          acc.Ymin = y
          acc.Ymax = y
        }
        return acc
      }, {})
    },

    textRotate () {
      const angle = 360 - (this.rotate % 360)
      const [x, y] = this.textCenter
      return { transform: `rotate(${angle}, ${x}, ${y})` }
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
