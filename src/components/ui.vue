<template>
  <div class="ui-layer">
    <div class="button-group">
      <div
        v-for="item in floors"
        :key="item.id"
        :class="{ active: item.id === floorId }"
        class="floor-button"
        @click="switchFloor(item)"
      >
        {{ item.alias }}
      </div>
    </div>
    <div
      class="locate-button"
      @click="locateToCenter"
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 413.099 413.099"
      >
        <path d="M206.549,0L206.549,0c-82.6,0-149.3,66.7-149.3,149.3c0,28.8,9.2,56.3,22,78.899l97.3,168.399c6.1,11,18.4,16.5,30,16.5
    c11.601,0,23.3-5.5,30-16.5l97.3-168.299c12.9-22.601,22-49.601,22-78.901C355.849,66.8,289.149,0,206.549,0z M206.549,193.4
    c-30,0-54.5-24.5-54.5-54.5s24.5-54.5,54.5-54.5s54.5,24.5,54.5,54.5C261.049,169,236.549,193.4,206.549,193.4z"/>
      </svg>
    </div>
  </div>
</template>

<script>
export default {
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
  },
}
</script>

<style lang="scss">
  .ui-layer {
    position: absolute;
    bottom: 20px;
    width: 40px;
    left: 16px;
    right: 0;
    z-index: 2;

    .locate-button {
      width: 40px;
      height: 40px;
      padding: 8px;
      border: 1px solid #ddd;
      background-color: white;
      border-radius: 5px;
      color: #333;
      cursor: pointer;
      margin-bottom: 12px;

      &.active {
        color: hsl(208, 86%, 31%);
      }
    }

    .button-group {
      display: flex;
      flex-direction: column;
      width: 40px;
      background: hsl(0, 0%, 100%);
      border-radius: 5px;
      margin-bottom: 12px;

      .floor-button {
        text-align: center;
        padding: 8px;
        cursor: pointer;
        border: 1px solid #ddd;
        margin-top: -1px;

        &:first-child {
          margin-top: 0;
          border-radius: 5px 5px 0 0;
        }

        &:last-child {
          border-radius: 0 0 5px 5px;
        }

        &.active {
          background-color: hsl(208, 86%, 31%);
          border-color: hsl(208, 86%, 31%);
          color: white;
        }
      }
    }
  }
</style>
