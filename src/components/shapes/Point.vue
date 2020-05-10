<template>
  <g
    v-if="iconAttrs"
    v-bind="textRotate"
  >
    <path :d="iconPath" fill="white"/>
    <image
      v-bind="iconAttrs"
      :xlink:href="require('../../assets/' + shape.properties.icon + '.png')"
    />
  </g>
  <text
    v-else
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

    size () {
      return this.shape.properties.size || 18
    },

    center () {
      return this.shape.geometry.coordinates
    },

    iconAttrs () {
      if (this.shape.properties.icon) {
        const d = (this.size + 4) / 4 * this.zoom * this.scale * Math.sqrt(2)
        return {
          x: this.center[0] - this.zoom * this.scale * this.size / 2,
          y: this.center[1] - this.zoom * this.scale * this.size / 2 - 2 * d,
          width: this.zoom * this.scale * this.size,
          height: this.zoom * this.scale * this.size,
        }
      }
      return null
    },

    iconPath () {
      const size = this.size + 6
      const [x, y] = this.center
      const r = size / 2 * this.zoom * this.scale
      const d = r * Math.sqrt(2) / 2
      return `M${x},${y}L${x-d},${y-d}A${r} ${r} 0 1 1 ${x + d} ${y - d}Z`
    },

    textRotate () {
      const angle = 360 - (this.rotate % 360)
      const [x, y] = this.center
      return {
        transform: `rotate(${angle}, ${x}, ${y})`,
      }
    },

    textProps () {
      return {
        ...this.textRotate,
        fill: 'red',
        'font-size': this.zoom * this.scale * this.size,
        x,
        y,
        ...this.styles,
      }
    },
  },
}
</script>
