<template>
  <div class="search-component">
    <div class="search-input">
      <input
        v-model="searchKey"
        :placeholder="placeholder"
        type="text"
        @input="debounceSearch"
      >
      <svg
        v-if="searchKey"
        width="14px"
        height="14px"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        @click="cleanSearch"
      >
        <path
          d="M1,1L15,15L8,8L1,15L15,1"
          fill="none"
          stroke="currentColor"
          stroke-width="2px"
        />
      </svg>
    </div>
    <div
      v-if="showResults"
      class="search-results"
      @touchmove="handleScrollTouchMove"
    >
      <div
        v-for="result in searchResults"
        :key="result.properties.uuid"
        class="search-result-item"
        @click="handleShapeSelect(result)"
      >
        <div class="search-result-item-title">
          {{ result.properties.name }}
        </div>
        <div class="search-result-item-description">
          所属楼层: {{ result.properties.floor }}
        </div>
      </div>
      <div
        v-if="!searchResults.length"
        class="blankslate"
      >
        没有找到相关的信息
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  props: {
    placeholder: {
      type: String,
      default: '输入搜索关键词',
    },
  },

  data () {
    return {
      searchKey: '',
      searchResults: [],
      searchTimer: null,
      searching: false,
      source: axios.CancelToken.source(),
    }
  },

  computed: {
    showResults () {
      return this.searchKey && !this.searching
    },
  },

  methods: {
    debounceSearch (event) {
      const value = event.target.value
      this.$emit('input', value)
      this._cleanTimer()
      this.searchTimer = setTimeout(() => {
        this.doSearch()
        this.searchTimer = null
      }, 600)
    },

    doSearch () {
      if (!this.searchKey) {
        this.searchResults = []
        return
      }
      if (this.searching) {
        this.source.cancel('cancel')
        this.source = axios.CancelToken.source()
      }
      this.searching = true
      return axios.get('/search', {
        params: {
          name: this.searchKey,
        },
        cancelToken: this.source.token
      }).then(({ data }) => {
        this.searchResults = data.data
      }).finally(() => this.searching = false)
    },

    cleanSearch () {
      this.searchResults = []
      this.searchKey = ''
      this._cleanTimer()
    },

    handleScrollTouchMove (event) {
      event._isScroll = true
    },

    handleShapeSelect (shape) {
      this.cleanSearch()
      this.$emit('select-shape', shape)
    },

    _cleanTimer () {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
        this.searchTimer = null
      }
    },
  },
}
</script>

<style lang="scss">
  .search-component {
    position: relative;
    z-index: 30;

    .search-input {
      input {
        width: 100%;
        padding: 8px 26px 8px 12px;
        font-size: inherit;
        color: inherit;
        border: 1px solid #ddd;
        box-shadow: none;
        border-radius: 5px;
        outline: none;
        background-color: white;
        -webkit-appearance: none;

        &::-webkit-input-placeholder {
          color: #999;
        }

        &:focus {
          outline: none;
          box-shadow: 0 1px 5px 0 hsl(208, 86%, 31%);
          border-color: hsl(208, 86%, 31%);
        }
      }

      svg {
        position: absolute;
        right: 12px;
        top: 12px;
      }
    }

    .search-results {
      position: absolute;
      top: 100%;
      margin-top: 4px;
      left: 0;
      right: 0;
      max-height: calc(60vh - 65px);
      overflow: auto;
      background-color: white;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .search-result-item {
      padding: 4px 12px;
      border-top: 1px solid #f6f6f6;

      &:first-child {
        border-top: none;
      }

      .search-result-item-description {
        color: #999;
        font-size: 12px;
        margin-top: 4px;
      }
    }

    .blankslate {
      padding: 20px 12px;
      text-align: center;
      font-size: 16px;
    }
  }
</style>
