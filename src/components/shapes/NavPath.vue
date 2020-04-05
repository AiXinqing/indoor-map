<template>
  <g class="navigate-path">
    <polyline
      :points="linePoints"
      :style="lineStyles"
    />
    <g v-show="!simulation">
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
    <marker-shape
      v-if="simulatePoint"
      :shape="simulatePoint"
      :zoom="this.zoom"
      :scale="this.scale"
      :rotate="this.rotate"
      :styles="simulatePoint.style"
      :size="16"
      :direction="simulatePoint.angle"
      type="arrow"
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

  data () {
    return {
      simulatePoint: null,
      simulation: false,
    }
  },

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

    pointsWithDistance () {
      return this.points.reduce((acc, point, index, arr) => {
        const [x1, y1] = point
        let distance = 0
        if (acc.length !== 0) {
          const [x2, y2] = arr[index - 1]
          distance = acc[index - 1].distance + Math.sqrt((x2 - x1)**2 + (y2 - y1)**2)
        }
        acc.push({
          point,
          distance,
        })
        return acc
      }, [])
    },
  },

  methods: {
    simulateNav () {
      const speed = 2
      const length = this.pointsWithDistance[this.pointsWithDistance.length - 1].distance
      const startTime = Date.now()
      const iterator = () => {
        const d = (Date.now() - startTime) * speed
        const point = this.getSimulatePoint(d)
        if (point) {
          this.simulatePoint = {
            type: 'Point',
            geometry: {
              coordinates: point.point,
            },
            angle: point.angle,
            style: {
              fill: 'red',
            },
          }

          if (d < length) requestAnimationFrame(iterator)
        }
      }

      this.simulation = true
      requestAnimationFrame(iterator)
    },

    getSimulatePoint (distance) {
      const pointIndex = this.pointsWithDistance.findIndex(i => i.distance > distance)
      if (pointIndex < 0) {
        this.simulation = false
        this.simulatePoint = null
        return null
      }
      const [p1, p2] = this.pointsWithDistance.slice(pointIndex - 1, pointIndex + 1)
      const la = (distance - p1.distance) / (p2.distance - p1.distance)
      const x = la * p2.point[0] + (1 - la) * p1.point[0]
      const y = la * p2.point[1] + (1 - la) * p1.point[1]
      const angle = Math.atan2((p1.point[1]-p2.point[1]), (p2.point[0]-p1.point[0]))
      return {
        point: [x, y],
        angle: angle / Math.PI * 180
      }
    },
  },
}
</script>