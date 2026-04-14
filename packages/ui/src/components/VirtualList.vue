<template>
  <div class="virtual-list-container" ref="container">
    <div class="virtual-list-phantom" :style="{ height: totalHeight + 'px' }"></div>
    <div class="virtual-list-content" :style="{ transform: `translateY(${offsetY}px)` }">
      <div
        v-for="item in visibleItems"
        :key="item.id"
        class="virtual-list-item"
        :style="{ height: itemHeight + 'px' }"
      >
        <slot :item="item.data" :index="item.index">
          {{ item.data }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VirtualList',
  props: {
    // 数据列表
    listData: {
      type: Array,
      required: true,
      default: () => []
    },
    // 每项高度
    itemHeight: {
      type: Number,
      default: 50
    },
    // 可视区域高度
    containerHeight: {
      type: Number,
      default: 400
    },
    // 每次渲染的额外缓冲项数
    bufferSize: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
      visibleStartIndex: 0,
      visibleEndIndex: 0,
      scrollTop: 0
    }
  },
  computed: {
    // 计算总高度
    totalHeight() {
      return this.listData.length * this.itemHeight
    },
    // 计算偏移量
    offsetY() {
      return this.visibleStartIndex * this.itemHeight
    },
    // 计算可见项
    visibleItems() {
      const start = Math.max(0, this.visibleStartIndex - this.bufferSize)
      const end = Math.min(
        this.listData.length,
        this.visibleEndIndex + this.bufferSize + 1
      )

      return this.listData.slice(start, end).map((item, index) => ({
        id: start + index,
        data: item,
        index: start + index
      }))
    }
  },
  mounted() {
    this.$refs.container.addEventListener('scroll', this.handleScroll)
    this.updateVisibleItems()
  },
  beforeDestroy() {
    this.$refs.container.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll() {
      this.scrollTop = this.$refs.container.scrollTop
      this.updateVisibleItems()
    },
    updateVisibleItems() {
      const startIndex = Math.floor(this.scrollTop / this.itemHeight)
      const endIndex = Math.min(
        this.listData.length - 1,
        Math.ceil((this.scrollTop + this.containerHeight) / this.itemHeight)
      )

      this.visibleStartIndex = startIndex
      this.visibleEndIndex = endIndex
    }
  }
}
</script>

<style scoped>
.virtual-list-container {
  position: relative;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
}

.virtual-list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.virtual-list-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}

.virtual-list-item {
  width: 100%;
  box-sizing: border-box;
}
</style>