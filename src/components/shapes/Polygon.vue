<template>
  <g>
    <g
      class="polygon-shadow"
      v-if="shadow && shadowPoints.length"
    >
      <path
        v-for="path in sideShadowPaths"
        :key="path"
        :d="path"
        :fill="shadowColor"
        :stroke="shapeStyle.fill"
        :stroke-width="5"
      />
    </g>
    <template v-else>
      <polygon
        :points="points"
        :style="shapeStyle"
        :class="shape.properties.class"
        @click.stop="handleClick"
      />
      <g v-if="iconAttrs">
        <path :d="iconPath" fill="white"/>
        <image
          v-bind="iconAttrs"
          :xlink:href="require('../../assets/' + shape.properties.icon.toLowerCase() + '.png')"
        />
      </g>
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
        @click.stop="handleClick"
      >
        {{ shapeText }}
      </text>
    </template>
  </g>
</template>

<script>
const Color = require('color-js')
import ShapeMixins from './shapes_mixin'

export default {
  mixins: [ShapeMixins],

  props: {
    selectedShape: {
      type: Object,
      default: null,
    },

    shadow: {
      type: Boolean,
      default: false,
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

    shadowPoints () {
      const { elev } = this.shape.properties
      const shadowScaler = 0.2
      if (elev) {
        const shadowLength = parseInt(elev) * shadowScaler
        const dy = shadowLength * Math.cos(this.rotate * Math.PI / 180)
        const dx = shadowLength * Math.sin(this.rotate * Math.PI / 180)
        return this.shape.geometry.coordinates[0].map(([px, py]) => [px + dx, py + dy])
      }
      return []
    },

    sideShadowPaths () {
      const points = this.shape.geometry.coordinates[0]
      return points.map((item, index, arr) => {
        const prevIndex = index === 0 ? arr.length - 1 : index - 1
        const cs = this.shadowPoints[index]
        const pt = arr[prevIndex]
        const ps = this.shadowPoints[prevIndex]
        return `M${item[0]},${item[1]}L${cs[0]},${cs[1]}L${ps[0]},${ps[1]}L${pt[0]},${pt[1]}Z`
      })
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
        fill: 'transparent',
        ...this.styles,
        ...this.highlightStyle,
      }
    },

    shadowColor () {
      const { fill } = this.shapeStyle
      const result = Color(fill).darkenByRatio(0.2)
      result.alpha = result.alpha * (1 - 0.1)
      return result.toCSS()
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

    iconAttrs () {
      if (this.shape.properties.icon) {
        return {
          x: this.textCenter[0] - this.zoom * this.scale * 9,
          y: this.textCenter[1] - this.zoom * this.scale * 9
            - this.zoom * this.scale * 11 * Math.sqrt(2),
          width: this.zoom * this.scale * 18,
          height: this.zoom * this.scale * 18,
        }
      }
      return null
    },

    iconPath () {
      if (!this.iconAttrs) return ''
      const [x, y] = this.textCenter
      const r = 28 * this.zoom * this.scale / (1 + Math.sqrt(2))
      const dy = y - Math.sqrt(2) * r
      const [spx, spy] = [0, Math.sqrt(2) * r]
      const tmp = 0.5 * r * Math.sqrt(2)
      const [mpx, mpy] = [-tmp, tmp]
      const [epx, epy] = [tmp, tmp]
      return `M${spx + x},${spy + dy}L${mpx + x},${mpy + dy}A${r} ${r} 0 1 1 ${epx + x} ${epy + dy}Z`
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
          this.handleClick()
        }
      },
    },
  },

  methods: {
    handleClick () {
      if (this.shape.properties.disabled) {
        this.$emit('click-shape', null)
      } else {
        this.$emit('click-shape', this)
      }
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
