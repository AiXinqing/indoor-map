<template>
  <div
    class="shape-details"
    @click.stop
  >
    <div class="detail-container">
      <div class="shape-text">
        <div class="shape-name">
          {{ shape.properties.name }}
        </div>
        <div
          v-if="shape.properties.description"
          class="shape-description"
        >
          {{ shape.properties.description }}
        </div>
      </div>
      <div class="buttons">
        <button
          v-if="navigatePoints.length"
          class="button button-reverse"
          @click="cancelNavigate"
        >
          取消
        </button>
        <button
          class="button"
          @click="showNavigateLayer"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>
    <div
      class="share-button"
      @click="share"
    >
      分享给朋友
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

    shape: {
      type: Object,
      required: true,
    },
  },

  data () {
    return {
      shareStamp: null,
    }
  },

  computed: {
    buttonText () {
      return this.navigatePoints.length
        ? '模拟导航'
        : '去这里'
    },
  },

  methods: {
    showNavigateLayer () {
      this.$emit('show-navigate-ui')
    },

    cancelNavigate () {
      this.$emit('cancel-navigate')
    },

    share () {
      // 避免连续点击分享操作
      if (this.shareStamp && (Date.now() - this.shareStamp < 400)) return
      this.shareStamp = Date.now()
      this.$emit('fire-share')
    },
  },
}
</script>

<style lang="scss">
  .shape-details {
    position: fixed;
    bottom: 9vh;
    left: 76px;
    right: 16px;
    border-radius: 4px;
    box-shadow: 0 1px 4px 0 gray;
    background: white;
    z-index: 3;

    .detail-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 10px 16px;
      min-height: 55px;
      justify-content: space-between;

      .shape-name {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .shape-description {
        font-size: 0.8em;
        color: #666;
      }
    }

    .share-button {
      display: block;
      text-align: center;
      padding: 10px 24px;
      font-size: 14px;
      border-top: 1px solid hsl(0, 0%, 87%);
      color: hsl(208, 86%, 31%);
    }

    .buttons {
      white-space: nowrap;
      display: flex;

      .button {
        margin-right: 6px;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
</style>
