<template>
  <path
    :d="pathParams"
    :stroke-width="3 * zoom * scale"
    stroke="blue"
    fill="blue"
  />
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
  },

  computed: {
    shapeSize () {
      return 25 * this.scale * this.zoom
    },

    popParams () {
      const [x, y] = this.shape.geometry.coordinates
      const r = this.shapeSize / 3
      const [spx, spy] = [0, 0]
      const [mpx, mpy] = [-0.5 * r * Math.sqrt(3), -1.5 * r]
      const [epx, epy] = [0.5 * r * Math.sqrt(3), -1.5 * r]
      return `M${spx + x},${spy + y}L${mpx + x},${mpy + y}A${r} ${r} 0 1 1 ${epx + x} ${epy + y}Z`
    },

    arrowParams () {
      const [x, y] = this.shape.geometry.coordinates
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
  },
}
</script>
