<template>
  <div
    class="shape-details"
    @click.stop
  >
    <div class="shape-details__wrapper">
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
        <div
          class="navigate-button"
          @click="showNavigateLayer"
        >
          <icon type="md-trending-up" size="20" />
          <span>去这里</span>
        </div>
      </div>
      <div
        class="share-button"
        @click="share"
      >
        <icon type="md-paper-plane" size="18" />
        <span>发送位置给好友</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
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

  methods: {
    showNavigateLayer () {
      this.$emit('show-navigate-ui')
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
    padding: 6px 16px 18px;

    .shape-details__wrapper {
      border-radius: 4px;
      box-shadow: 0 1px 4px 0 gray;
      padding: 0 8px;
      background: white;
      position: relative;
    }

    .detail-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 10px 8px;
      min-height: 55px;
      justify-content: space-between;

      .shape-name {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .shape-description {
        font-size: 0.8em;
        color: #888;
      }
    }

    .navigate-button {
      width: 54px;
      height: 54px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: absolute;
      right: 12px;
      top: -27px;
      background-color: #19be6b;
      padding: 4px;
      border-radius: 50%;
      font-size: 12px;
      color: white;
      box-shadow: 0 1px 5px 0 #19be6b;
      cursor: pointer;
    }

    .share-button {
      display: block;
      text-align: center;
      cursor: pointer;
      padding: 10px 24px;
      font-size: 14px;
      border-top: 1px solid hsl(0, 0%, 87%);
      color: #888;
    }
  }
</style>
