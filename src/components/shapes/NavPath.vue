<template>
  <g class="navigate-path">
    <polyline
      :points="linePoints"
      :style="lineStyles"
    />
    <marker-shape
      :scale="this.scale"
      :zoom="this.zoom"
      :rotate="this.rotate"
      :shape="startPoint"
      :styles="startPoint.style"
      type="pop"
      centerText="起"
    />
    <marker-shape
      :scale="this.scale"
      :zoom="this.zoom"
      :rotate="this.rotate"
      :shape="endPoint"
      :styles="endPoint.style"
      centerText="止"
      type="pop"
    />
  </g>
</template>

<script>
import MarkerShape from './Marker.vue'
import ShapeMixins from './shapes_mixin'

export default {
  components: {
    MarkerShape,
  },

  mixins: [ShapeMixins],

  computed: {
    points () {
      return this.shape.geometry.coordinates
    },

    linePoints () {
      return this.points.map(point => `${point[0]},${point[1]}`).join(' ')
    },

    lineStyles () {
      return {
        ...this.styles,
        stroke: 'red',
        'stroke-width': 1 * this.scale * this.zoom,
        fill: 'transparent',
      }
    },

    startPoint () {
      return {
        geometry: {
          coordinates: this.points[0],
        },
        style: {
          fill: 'hsl(208, 86%, 31%)',
        },
      }
    },

    endPoint () {
      return {
        geometry: {
          coordinates: this.points[this.points.length - 1],
        },
        style: {
          fill: 'hsl(116, 93%, 38%)',
        }
      }
    },
  },
}
</script>
