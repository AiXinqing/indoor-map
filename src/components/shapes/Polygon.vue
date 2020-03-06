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

  props: {
    selectedShape: {
      type: Object,
      default: null,
    },
  },

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
      const { Xmax, Xmin, Ymin, Ymax } = this.range
      // 一个形状最多能显示的字数为8个
      const max = Math.max((Xmax - Xmin), (Ymax - Ymin)) / 8
      // 最小显示字号为7px
      if (this.zoom * this.scale * 7 > max) {
        return 0
      }
      // 最大显示的字号为14px
      return Math.min(max, this.zoom * this.scale * 14)
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

  watch: {
    selectedShape: {
      immediate: true,
      handler () {
        if (!this.selectedShape) return
        if (this.selectedShape.properties.uuid === this.shape.properties.uuid) {
          this.$emit('click-shape', this)
        }
      },
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
