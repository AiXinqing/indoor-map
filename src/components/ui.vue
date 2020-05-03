<template>
  <div
    class="ui-layer"
    @click.stop
  >
    <div class="left-ui">
      <button-group
        vertical
        class="floors"
      >
        <i-button
          v-for="item in floors"
          :key="item.id"
          :type="item.id === floorId ? 'success' : 'default'"
          @click="switchFloor(item)"
        >
          {{ item.alias }}
        </i-button>
      </button-group>
      <div
        class="locate-button"
        @click="locateToCenter"
      >
        <icon
          type="md-locate"
          size="18"
        />
      </div>
    </div>
    <div class="right-ui">
      <button-group
        vertical
        class="controls"
      >
        <i-button @click="zoomIn">
          <icon type="md-add" size="18" />
        </i-button>
        <i-button @click="zoomOut">
          <icon type="md-remove" size="18" />
        </i-button>
      </button-group>
      <div
        class="logo"
      >
        <img src="../assets/1.png" alt="logo">
      </div>
    </div>
  </div>
</template>

<script>
import { ButtonGroup, Button, Icon } from 'view-design'

export default {
  components: {
    ButtonGroup,
    IButton: Button,
    Icon,
  },

  props: {
    floors: {
      type: Array,
      default: () => [],
    },

    floorId: {
      type: [Number, String],
      default: 0,
    },
  },

  methods: {
    locateToCenter () {
      this.$emit('onlocate')
    },

    switchFloor (floor) {
      this.$emit('switch-floor', floor)
    },

    zoomIn () {
      this.$emit('zoom-in')
    },

    zoomOut () {
      this.$emit('zoom-out')
    },
  },
}
</script>

<style lang="scss">
  .ui-layer {
    flex-direction: column;
    position: relative;
    bottom: 20px;
    z-index: 2;

    .left-ui,
    .right-ui {
      position: absolute;
      bottom: 0;
    }

    .left-ui {
      left: 16px;
    }

    .right-ui {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      right: 16px;
    }

    .floors {
      margin-bottom: 12px;
    }

    .controls,
    .floors {
      button {
        padding: 0;
      }
    }

    .locate-button {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: white;
      border-radius: 16px;
      color: #333;
      cursor: pointer;

      &.active {
        color: hsl(208, 86%, 31%);
      }
    }

    .logo {
      position: relative;
      bottom: -10px;
      right: -8px;
      z-index: 200;
      width: 50px;
      height: 51px;
      display: flex;

      img {
        max-width: 100%;
      }
    }
  }
</style>
