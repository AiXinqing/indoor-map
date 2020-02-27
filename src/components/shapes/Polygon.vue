<template>
  <polygon
    :points="points"
    :style="styles"
  />
</template>

<script>
import ShapeMixins from './shapes_mixin'

export default {
  mixins: [ShapeMixins],

  computed: {
    points () {
      const points = this.shape.geometry.coordinates[0]
      return points.map(point => `${point[0]},${point[1]}`).join(' ')
    },
  },
}
</script>
