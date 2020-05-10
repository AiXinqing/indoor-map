<template>
  <div class="navigate-info" @click.stop>
    <div class="navigate-info__wrapper">
      <i-row class="buttons" :gutter="16">
        <i-col span="12">
          <i-button
            long
            shape="circle"
            @click="cancelNavigate"
          >
            取消
          </i-button>
        </i-col>
        <i-col span="12">
          <i-button
            icon="ios-paper-plane"
            long
            type="success"
            shape="circle"
            :disabled="simulating"
            @click="simulateNavigate"
          >
            模拟导航
          </i-button>
        </i-col>
      </i-row>
      <div class="navigate-message" v-if="navigateFloors.length > 0">
        本次路径规划共跨越{{ navigateFloors.length }}层楼，当前只显示了{{currentFloor && currentFloor.alias}}的路径。你可以切换楼层查看全部其余楼层的路径
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    navigatePoints: {
      type: Array,
      default: () => [],
    },

    getFloor: {
      type: Function,
      required: true,
    },

    floorId: {
      type: [String, Number],
    },

    simulating: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    groupedPoints () {
      const result = {}
      this.navigatePoints.forEach((point) => {
        const [x, y, z] = point
        result[z] = (result[z] || []).concat([point])
      })
      return result
    },

    navigateFloors () {
      return Object.keys(this.groupedPoints).map(item => this.getFloor(item))
    },

    currentFloor () {
      return this.getFloor(this.floorId)
    },
  },

  methods: {
    simulateNavigate () {
      this.$emit('simulate-navigate')
    },

    cancelNavigate () {
      this.$emit('cancel-navigate')
    },
  }
}
</script>

<style lang="scss">
  .navigate-info {
    padding: 12px 16px;

    .navigate-info__wrapper {
      padding: 8px 12px;
      background-color: white;
      border-radius: 4px;
    }

    .navigate-message {
      margin-top: 8px;
    }
  }
</style>
