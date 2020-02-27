<template>
  <polygon
    :points="points"
    :style="shapeStyle"
    @click.stop="handleClick"
  />
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

    shapeStyle () {
      return {
        ...this.styles,
        ...this.highlightStyle,
      }
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
  },
}
</script>
