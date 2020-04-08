<template>
  <text
    v-bind="textProps"
    dy="0.1em"
    text-anchor="middle"
    dominant-baseline="middle"
  >
    {{ pointText }}
  </text>
</template>

<script>
import ShapeMixins from './shapes_mixin'

export default {
  mixins: [ShapeMixins],

  computed: {
    pointText () {
      return this.shape.properties.name
    },

    textProps () {
      const angle = 360 - (this.rotate % 360)
      const [x, y] = this.shape.geometry.coordinates
      return {
        transform: `rotate(${angle}, ${x}, ${y})`,
        fill: 'red',
        'font-size': this.zoom * this.scale * (this.shape.properties.size || 14),
        x,
        y,
        ...this.styles,
      }
    },
  },
}
</script>
