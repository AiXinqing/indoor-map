<template>
  <g class="navigate-path">
    <polyline
      :points="linePoints"
      :style="lineStyles"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
    <g>
      <polyline
        v-for="(arrow, index) in arrowPoints"
        :key="index"
        :points="_pointsToPath(arrow)"
        :stroke-width="2 * scale * zoom"
        fill="transparent"
        stroke="white"
        stroke-linejoin="round"
        stroke-linecap="round"
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
      @nav-rotate="handleNavRotate"
    />
    <g>
      <marker-shape
        v-show="!simulation"
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
        centerText="终"
        type="pop"
      />
    </g>
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
      arrowDistance: 7000,
      minCurveDistance: 200,
      minCurveAngle: 60
    }
  },

  computed: {
    points () {
      return this.shape.geometry.coordinates
    },

    linePoints () {
      return this._pointsToPath(this.points)
    },

    arrowPoints () {
      let d = this.arrowDistance / 2
      return this.points.reduce((acc, point, index, arr) => {
        if (index !== 0) {
          const { points, scrap } = this.getOffsetPoints(arr[index - 1], point, d)
          d = scrap
          if (points.length) return acc.concat(points)
        }
        return acc
      }, [])
    },

    lineStyles () {
      return {
        ...this.styles[this.shape.properties.class],
        'stroke-width': 10 * this.scale * this.zoom,
        fill: 'transparent',
      }
    },

    startPoint () {
      return {
        geometry: {
          coordinates: this.points[0],
        },
        style: this.styles['location'],
      }
    },

    endPoint () {
      return {
        geometry: {
          coordinates: this.points[this.points.length - 1],
        },
        style: this.styles['target']
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
    handleNavRotate (angle) {
      if (this.simulation) {
        this.$emit('nav-rotate', angle)
      }
    },

    simulateNav () {
      const speed = 3
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
            style: this.styles['simulatePosition'],
          }

          if (d < length) requestAnimationFrame(iterator)
        }
      }

      this.simulation = true
      requestAnimationFrame(iterator)
    },

    getOffsetPoints (p1, p2, d) {
      const [x1, y1] = p1
      const [x2, y2] = p2
      const points = []
      const l = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
      // 未分配点的长度
      let scrap = d + l
      // 补足上一段的点所需的距离
      const delta = Math.max(this.arrowDistance - d, this.minCurveDistance)
      // 此段不存在任何箭头
      if (l < delta + this.minCurveDistance) return { points, scrap }
      if (delta <= this.minCurveDistance) {
        scrap = l - this.minCurveDistance
        points.push(this._getPoints(this.minCurveDistance / l, x1, y1, x2, y2))
      }
      while(scrap - this.minCurveDistance >= this.arrowDistance) {
        scrap = scrap - this.arrowDistance
        const lamda = (l - scrap) / l
        points.push(this._getPoints(lamda, x1, y1, x2, y2))
      }
      return {
        points,
        scrap,
      }
    },

    _pointsToPath (points) {
      return points.map(item => item.join(',')).join(' ')
    },

    _getPoints (lamda, x1, y1, x2, y2) {
      const m = 6 * this.scale * this.zoom
      const l = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
      const x = x2 * lamda + (1 - lamda) * x1
      const y = y2 * lamda + (1 - lamda) * y1
      // cos(a - 45)
      const upCos = Math.sqrt(2) / 2 * ((x2 - x1) / l + (y2 - y1) / l)
      // sin(a - 45)
      const upSin = Math.sqrt(2) / 2 * ((y2 - y1) / l - (x2 - x1) / l)
      // cos(a + 45)
      const downCos = Math.sqrt(2) / 2 * ((x2 - x1) / l - (y2 - y1) / l)
      // sin(a + 45)
      const downSin = Math.sqrt(2) / 2 * ((x2 - x1) / l + (y2 - y1) / l)
      return [
        [x - m * upCos, y - m * upSin],
        [x, y],
        [x - m * downCos, y - m * downSin]
      ]
    },

    getSimulatePoint (distance) {
      const pointIndex = this.pointsWithDistance.findIndex(i => i.distance > distance)
      if (pointIndex < 0) {
        this.simulation = false
        this.$emit('simulate-end')
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
