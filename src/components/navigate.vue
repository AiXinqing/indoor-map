<template>
  <div
    class="navigate-layer"
    @click.stop
  >
    <div class="layer-header">
      <icon
        class="back-icon"
        type="ios-arrow-back"
        size="18"
        @click.native="cancelNavigate"
      />
      <div class="inputs">
        <div class="point-inputs">
          <search
            :initValue="shapeName"
            placeholder="当前位置，可搜索更换"
            @select-shape="updateStartShape"
            @clean-search="cleanStartShape"
          />
          <search
            :initValue="targetName"
            placeholder="搜索更换"
            @select-shape="updateEndShape"
            @clean-search="cleanEndShape"
          />
        </div>
        <div class="points-exchanger" @click="swapPoints">
          <icon
            :style="{ transform: 'rotate(90deg)' }"
            type="md-swap"
            size="18"
          />
        </div>
      </div>
    </div>
    <div class="layer-body"></div>
    <div class="layer-footer">
      <button
        class="button"
        @click="startNavigate"
      >
        导航
      </button>
      <button
        class="button cancel-button"
        @click="cancelNavigate"
      >
        取消
      </button>
    </div>
  </div>
</template>

<script>
import Search from './search.vue'

export default {
  components: {
    Search
  },

  props: {
    targetShape: {
      type: Object,
      required: true,
    },
  },

  data () {
    return {
      startShape: null,
      endShape: this.targetShape,
    }
  },

  computed: {
    shapeName () {
      return this.startShape ? this.startShape.properties.name : ''
    },

    targetName () {
      return this.targetShape ? this.targetShape.properties.name : '当前位置'
    },
  },

  methods: {
    swapPoints () {
      const start = this.startShape
      this.startShape = this.endShape
      this.endShape = start
    },

    updateStartShape (shape) {
      this.startShape = shape
    },

    cleanStartShape () {
      this.startShape = null
    },

    updateEndShape (shape) {
      this.endShape = shape
    },

    cleanEndShape () {
      this.endShape = null
    },

    cancelNavigate () {
      this.$emit('cancel')
    },
    startNavigate () {
      this.$emit('navigate', {
        start: this.startShape,
        end: this.endShape,
      })
    },
  },
}
</script>

<style lang="scss">
  .navigate-layer {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .layer-header {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 12px 12px;

    .back-icon {
      margin-top: 8px;
      margin-right: 8px;
      display: flex;
      color: gray;
    }

    .inputs {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-grow: 1;
      color: #333;

      .point-inputs {
        flex-grow: 1;
        padding: 0 6px;

        .search-component {
          margin-bottom: 6px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      .points-exchanger {
        margin-left: 8px;
      }
    }
  }

  .layer-body {
    padding: 12px 24px;
    flex: 1 0 0;
  }

  .layer-footer {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    padding: 0 24px;
    margin-bottom: 9vh;
    position: relative;
    top: 20px;

    .cancel-button {
      background-color: transparent;
      color: hsl(208, 85%, 31%);
      margin-right: 12px;
    }
  }
</style>
