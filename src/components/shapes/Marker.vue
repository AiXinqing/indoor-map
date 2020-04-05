<template>
  <g
    v-bind="rotateParams"
  >
    <path
      v-bind="styles"
      :d="pathParams"
      :stroke-width="3 * zoom * scale"
    />
    <text
      v-if="centerText"
      :font-size="0.4 * size * scale * zoom"
      :x="point[0]"
      :y="point[1] - 2 * shapeSize / 3"
      dy="0.1em"
      fill="white"
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
      default: 25,
    },
  },

  computed: {
    shapeSize () {
      return this.size * this.scale * this.zoom
    },

    point () {
      return this.shape.geometry.coordinates
    },

    popParams () {
      const [x, y] = this.point
      const r = this.shapeSize / 3
      const [spx, spy] = [0, 0]
      const [mpx, mpy] = [-0.5 * r * Math.sqrt(3), -1.5 * r]
      const [epx, epy] = [0.5 * r * Math.sqrt(3), -1.5 * r]
      return `M${spx + x},${spy + y}L${mpx + x},${mpy + y}A${r} ${r} 0 1 1 ${epx + x} ${epy + y}Z`
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
        ? this.popParams
        : this.arrowParams
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
}
</script>
