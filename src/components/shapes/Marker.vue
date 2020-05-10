<template>
  <g
    v-bind="rotateParams"
  >
    <path
      v-bind="styles"
      :d="pathParams"
    />
    <text
      v-if="centerText"
      :font-size="shapeSize * 0.66"
      :x="textCenter[0]"
      :y="textCenter[1]"
      fill="white"
      dy="0.1em"
      text-anchor="middle"
      dominant-baseline="middle"
    >
      {{ centerText }}
    </text>
  </g>
</template>

<script>
import ShapeMixins from './shapes_mixin'

export default {
  mixins: [ShapeMixins],

  props: {
    type: {
      type: String,
      default: 'pop',
      validator (val) {
        return ['pop', 'arrow'].indexOf(val) > -1
      },
    },

    // only effect when type is pop
    centerText: {
      type: String,
      default: '',
    },

    // only effect when type is arrow
    direction: {
      type: Number,
      default: 0,
    },

    size: {
      type: Number,
      default: 20,
    },
  },

  computed: {
    shapeSize () {
      return this.size * this.scale * this.zoom
    },

    point () {
      return this.shape.geometry.coordinates
    },

    // shapeSize 表示字体尺寸
    popPath () {
      const [x, y] = this.point
      const r = (this.size + 6) * this.scale * this.zoom / 2
      const d = r * Math.sqrt(2) / 2
      return `M${x},${y}L${x-d},${y-d}A${r} ${r} 0 1 1 ${x+d} ${y-d}Z`
    },

    textCenter () {
      const r = (this.size + 6) * this.scale * this.zoom / 2
      const d = r * Math.sqrt(2)
      return [this.point[0], this.point[1] - d]
    },

    arrowParams () {
      const [x, y] = this.point
      const r = this.shapeSize / (1 + Math.sqrt(2))
      const [spx, spy] = [0, Math.sqrt(2) * r]
      const tmp = 0.5 * r * Math.sqrt(2)
      const [mpx, mpy] = [-tmp, tmp]
      const [epx, epy] = [tmp, tmp]
      return `M${spx + x},${spy + y}L${mpx + x},${mpy + y}A${r} ${r} 0 1 1 ${epx + x} ${epy + y}Z`
    },

    pathParams () {
      return this.type === 'pop'
        ? this.popPath
        : this.arrowParams
    },

    circleParams () {
      const [x, y] = this.point
      const r = this.shapeSize / 3
      return {
        cx: x,
        cy: y - 2 * r,
        r: r * 0.7,
      }
    },

    rotateParams () {
      const angle = this.type === 'pop'
        ? 360 - (this.rotate % 360)
        : (270 - this.direction) % 360
      const [x, y] = this.point
      return {
        transform: `rotate(${angle}, ${x}, ${y})`
      }
    },
  },

  watch: {
    direction: {
      immediate: true,
      handler (val, old) {
        if (old === undefined) this.$emit('nav-rotate', this.direction)
        if (Math.abs(val - (old || 0)) > 5) {
          this.$emit('nav-rotate', this.direction)
        }
      },
    },
  },
}
</script>
