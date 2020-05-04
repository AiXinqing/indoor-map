<template>
  <div
    class="navigate-layer"
    @click.stop
  >
    <div class="layer-header">
      <svg
        class="back-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        @click="cancelNavigate"
      >
        <path d="M11,2L5,8L11,14" fill="transparent" stroke-width="2" stroke="currentColor" />
      </svg>
      <div class="inputs">
        <search
          :class="{ 'default-input': startShape }"
          :placeholder="shapeName"
          @select-shape="updateStartShape"
          @clean-search="cleanStartShape"
        />
        <input
          :value="targetName"
          class="target-input"
          readonly
          type="text"
        />
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
      return this.startShape ? this.startShape.properties.name : '当前位置, 可搜索更换'
    },

    targetName () {
      return this.targetShape.properties.name
    },
  },

  methods: {
    updateStartShape (shape) {
      this.startShape = shape
    },

    cleanStartShape () {
      this.startShape = null
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
    padding: 12px 18px;

    .back-icon {
      margin-top: 8px;
      margin-right: 8px;
      display: flex;
      width: 18px;
      height: 18px;
      color: gray;
    }

    .inputs {
      padding: 0 6px;
      flex-grow: 1;
      color: #333;

      .default-input input::-webkit-input-placeholder {
        color: inherit !important;
      }
    }

    .target-input {
      margin-top: 8px;
      width: 100%;
      padding: 8px 26px 8px 12px;
      font-size: inherit;
      color: inherit;
      border: 1px solid #ddd;
      box-shadow: none;
      border-radius: 5px;
      outline: none;
      background-color: #eee;
      -webkit-appearance: none;

      &:focus {
        outline: none;
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
