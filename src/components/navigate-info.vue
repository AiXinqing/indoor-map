<template>
  <div class="navigate-info" @click.stop>
    <div class="navigate-info__wrapper">
      <div class="navigate-message"></div>
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

    simulating: {
      type: Boolean,
      default: false,
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
  }
</style>
