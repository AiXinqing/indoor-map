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
          <div class="point-input">
            <search
              :initValue="shapeName"
              placeholder="当前位置，可搜索更换"
              @select-shape="updateStartShape"
              @clean-search="cleanStartShape"
            />
            <div class="point-input-tag">起点</div>
          </div>
          <div class="point-input">
            <search
              :initValue="targetName"
              placeholder="当前位置，可搜索更换"
              @select-shape="updateEndShape"
              @clean-search="cleanEndShape"
            />
            <div class="point-input-tag">终点</div>
          </div>
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
      <i-button
        class="cancel-button"
        type="primary"
        shape="circle"
        @click="cancelNavigate"
      >
        取消
      </i-button>
      <i-button @click="startNavigate" type="success" shape="circle">
        导航
      </i-button>
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
      size: [0, 0],
    }
  },

  computed: {
    shapeName () {
      return this.startShape ? this.startShape.properties.name : ''
    },

    targetName () {
      return this.endShape ? this.endShape.properties.name : ''
    },
  },

  mounted () {
    const { width, height } = document.querySelector('.layer-body').getBoundingClientRect()
    this.size = [width, height]
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
    background-color: hsl(176, 74%, 46%);
    background-image: linear-gradient(to bottom, hsl(176, 74%, 46%), hsl(166, 36%, 77%));
  }

  .layer-header,
  .layer-footer {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }

  .layer-header {
    padding: 12px 12px;

    .back-icon {
      margin-top: 8px;
      margin-right: 8px;
      display: flex;
      color: white;
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
        margin-right: -25px;

        .point-input {
          display: flex;
          flex-direction: row;
          align-items: center;
          margin-bottom: 6px;

          &:last-child {
            margin-bottom: 0;
          }

          .search-component {
            flex: 1 0 0;
          }

          .point-input-tag {
            margin-left: 11px;
            font-size: 12px;
            color: white;
          }
        }
      }

      .points-exchanger {
        margin-left: -2px;
        color: white;
      }
    }
  }

  .layer-body {
    flex: 1 0 0;
  }

  .layer-footer {
    justify-content: flex-end;
    padding: 12px 24px;

    .cancel-button {
      margin-right: 12px;
    }
  }
</style>
