<template>
  <polyline
    :points="points"
    :style="lineStyles"
  />
</template>

<script>
import ShapeMixins from './shapes_mixin'

export default {
  mixins: [ShapeMixins],

  computed: {
    points () {
      const points = this.shape.geometry.coordinates
      return points.map(point => `${point[0]},${point[1]}`).join(' ')
    },

    lineStyles () {
      return {
        ...this.styles,
        fill: 'transparent',
      }
    },
  },
}
</script>
