<template>
  <circle
    :cx="center[0]"
    :cy="center[1]"
    :r="radius"
    :style="styles"
  />
</template>

<script>
import ShapeMixins from './shapes_mixin'

export default {
  mixins: [ShapeMixins],

  props: {
    radius: {
      type: Number,
      default: 1,
    },
  },

  computed: {
    center () {
      return this.shape.center
    },
  },
}
</script>
