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
          <div
            :class="{ 'point-input--focus': mode == 0 }"
            class="point-input"
          >
            <search
              :initValue="shapeName"
              placeholder="当前位置，可搜索更换"
              @select-shape="updateStartShape"
              @clean-search="cleanStartShape"
              @input-focus="updateToZero"
            />
            <div class="point-input-tag">起点</div>
          </div>
          <div
            :class="{ 'point-input--focus': mode == 1 }"
            class="point-input"
          >
            <search
              :initValue="targetName"
              placeholder="当前位置，可搜索更换"
              @select-shape="updateEndShape"
              @clean-search="cleanEndShape"
              @input-focus="updateToOne"
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
    <div class="layer-body">
      <navigate-map
        v-if="mapReady"
        ref="navigateMapRef"
        :size="size"
        :geojson="geojson"
        :styles="styles"
        :start-point="startShape"
        :current-floor="getFloor(floorId)"
        :end-point="endShape"
        @shape-clicked="handleShapeClicked"
      />
      <div class="navigate-map-ui">
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
      </div>
    </div>
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
        路线
      </i-button>
    </div>
  </div>
</template>

<script>
import Search from './search.vue'
import NavigateMap from './navigate-map.vue'

export default {
  components: {
    Search,
    NavigateMap,
  },

  props: {
    floors: {
      type: Array,
      default: [],
    },

    floorId: {
      type: [Number, String],
      default: 0,
    },

    geojson: {
      type: Object,
    },

    styles: {
      type: Object,
    },

    getFloor: {
      type: [Function, Object],
      required: true,
    },

    targetShape: {
      type: Object,
      required: true,
    },
  },

  data () {
    return {
      startShape: null,
      endShape: this.getShapePoint(this.targetShape, '未知建筑'),
      size: [0, 0],
      mapReady: false,
      // 0 表示起点，1表示终点
      mode: 0,
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
    this.mapReady = true
  },

  methods: {
    switchFloor (floor) {
      this.$emit('switch-floor', floor)
    },
    updateToZero () {
      if (0 === this.mode) return
      this.mode = 0
    },

    updateToOne () {
      if (1 === this.mode) return
      this.mode = 1
    },

    handleShapeClicked (shapeVm, point) {
      const position = this.getShapePoint(shapeVm.shape, '未知地点', point)
      if (this.mode) {
        this.endShape = position
      } else {
        this.startShape = position
      }
    },

    swapPoints () {
      const start = this.startShape
      this.startShape = this.endShape
      this.endShape = start
    },

    updateStartShape (shape) {
      this.startShape = this.getShapePoint(shape, '未知建筑')
    },

    cleanStartShape () {
      this.startShape = null
    },

    updateEndShape (shape) {
      this.endShape = this.getShapePoint(shape, '未知建筑')
    },

    getShapePoint (shape, placeholder, coordinates) {
      const positionZ = shape.properties.floor
        ? this.$parent.getFloorByName(shape.properties.floor).id
        : this.floorId
      const cd = coordinates
        ? [...coordinates, positionZ]
        : [
            parseFloat(shape.properties.x_center),
            parseFloat(shape.properties.y_center),
            positionZ,
          ]
      return {
        type: 'Feature',
        properties: {
          floor: shape.properties.floor,
          uuid: shape.properties.uuid,
          name: shape.properties.name || placeholder,
        },
        geometry: {
          type: 'Point',
          coordinates: cd,
        },
      }
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
          margin-bottom: 10px;

          &.point-input--focus {
            input.ivu-input {
              border-color: hsl(211, 87%, 65%);
              box-shadow: 0 0 0 2px rgba(45, 140, 240, 0.2);
            }
          }

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
    position: relative;
  }

  .navigate-map-ui {
    position: absolute;
    left: 16px;
    bottom: 0;

    .floors {
      margin-bottom: 12px;

      button {
        padding: 0;
      }
    }
  }

  .layer-footer {
    justify-content: flex-end;
    padding: 12px 24px;

    .cancel-button {
      margin-right: 12px;
    }
  }
</style>
