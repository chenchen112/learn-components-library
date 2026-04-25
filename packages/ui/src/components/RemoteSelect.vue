<template>
  <el-select
    ref="selectRef"
    v-model="selectedValue"
    v-bind="$attrs"
    filterable
    remote
    :remote-method="handleRemoteSearch"
    :loading="loading || loadingMore"
    @change="handleChange"
    @visible-change="handleVisibleChange"
  >
    <el-option
      v-for="item in mergedOptions"
      :key="getOptionKey(item)"
      :label="getOptionLabel(item)"
      :value="getOptionValue(item)"
      :disabled="isOptionDisabled(item)"
    >
      <slot name="option" :item="item">
        {{ getOptionLabel(item) }}
      </slot>
    </el-option>

    <template v-if="pagination && hasMore && mergedOptions.length > 0" #footer>
      <div class="remote-select-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
    </template>

    <template #empty>
      <div class="remote-select-empty">
        <slot name="empty">
          {{ emptyText }}
        </slot>
      </div>
    </template>
  </el-select>
</template>

<script>
import { debounce } from "../utils/debounce";

export default {
  name: "RemoteSelect",
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number, Array],
      default: "",
    },
    remoteMethod: {
      type: Function,
      required: true,
    },
    options: {
      type: Array,
      default: () => [],
    },
    debounce: {
      type: Number,
      default: 300,
    },
    emptyText: {
      type: String,
      default: "暂无数据",
    },
    optionConfig: {
      type: Object,
      default: () => ({
        key: "id",
        label: "label",
        value: "value",
        disabled: "disabled",
      }),
    },
    cache: {
      type: Boolean,
      default: true,
    },
    initialLoad: {
      type: Boolean,
      default: false,
    },
    pagination: {
      type: Boolean,
      default: false,
    },
    pageSize: {
      type: Number,
      default: 20,
    },
  },
  data() {
    return {
      loading: false,
      selectedValue: this.value,
      searchCache: new Map(),
      currentPage: 1,
      hasMore: true,
      currentQuery: "",
      loadingMore: false,
      internalOptions: [],
      scrollHandler: null,
    };
  },
  computed: {
    mergedOptions() {
      return this.pagination ? this.internalOptions : this.options;
    },
    debouncedSearch() {
      return debounce(this.performSearch, this.debounce);
    },
  },
  watch: {
    value(newVal) {
      this.selectedValue = newVal;
    },
    selectedValue(newVal) {
      this.$emit("input", newVal);
    },
    options: {
      handler(newVal) {
        if (!this.pagination) {
          this.internalOptions = newVal;
        }
      },
      immediate: true,
    },
  },
  mounted() {
    if (this.initialLoad) {
      this.handleRemoteSearch("");
    }
  },
  beforeDestroy() {
    this.removeScrollListener();
  },
  methods: {
    getOptionKey(item) {
      return item[this.optionConfig.key] || item.value;
    },

    getOptionLabel(item) {
      return item[this.optionConfig.label] || item.label || item.value;
    },

    getOptionValue(item) {
      return item[this.optionConfig.value] || item.value;
    },

    isOptionDisabled(item) {
      return item[this.optionConfig.disabled] || item.disabled || false;
    },

    handleRemoteSearch(query) {
      if (this.pagination) {
        this.currentQuery = query;
        this.currentPage = 1;
        this.hasMore = true;
        this.internalOptions = [];
      }
      this.debouncedSearch(query, this.pagination ? 1 : undefined);
    },

    async performSearch(query, page = 1) {
      if (!this.pagination) {
        if (this.cache && this.searchCache.has(query)) {
          const cachedData = this.searchCache.get(query);
          this.$emit("update:options", cachedData);
          return;
        }
      }

      this.loading = page === 1;
      this.loadingMore = page > 1;

      try {
        let result;
        if (this.pagination) {
          result = await this.remoteMethod(query, page, this.pageSize);
          const list = Array.isArray(result) ? result : result.list || [];
          const hasMore =
            result.hasMore !== undefined
              ? result.hasMore
              : list.length >= this.pageSize;

          if (page === 1) {
            this.internalOptions = list;
          } else {
            this.internalOptions = [...this.internalOptions, ...list];
          }
          this.hasMore = hasMore;
          this.currentPage = page;

          this.$emit("update:options", this.internalOptions);
          this.$emit("search", query, this.internalOptions, { page, hasMore });
        } else {
          result = await this.remoteMethod(query);
          if (this.cache) {
            this.searchCache.set(query, result);
          }
          this.$emit("update:options", result);
          this.$emit("search", query, result);
        }
      } catch (error) {
        this.$emit("error", error);
        console.error("RemoteSelect search error:", error);
      } finally {
        this.loading = false;
        this.loadingMore = false;
      }
    },

    async loadMore() {
      if (!this.pagination || !this.hasMore || this.loadingMore) {
        return;
      }
      await this.performSearch(this.currentQuery, this.currentPage + 1);
    },

    setupScrollListener() {
      this.$nextTick(() => {
        const selectEl = this.$refs.selectRef;
        if (!selectEl) return;

        const popperEl =
          selectEl.popperElm || selectEl.$el?.closest?.(".el-popper");
        if (!popperEl) return;

        const dropdown = popperEl.querySelector(".el-select-dropdown__wrap");
        if (dropdown && !this.scrollHandler) {
          this.scrollHandler = this.handleScroll.bind(this);
          dropdown.addEventListener("scroll", this.scrollHandler);
        }
      });
    },

    removeScrollListener() {
      if (this.scrollHandler) {
        const selectEl = this.$refs.selectRef;
        if (selectEl) {
          const popperEl =
            selectEl.popperElm || selectEl.$el?.closest?.(".el-popper");
          if (popperEl) {
            const dropdown = popperEl.querySelector(
              ".el-select-dropdown__wrap",
            );
            if (dropdown) {
              dropdown.removeEventListener("scroll", this.scrollHandler);
            }
          }
        }
        this.scrollHandler = null;
      }
    },

    handleScroll(event) {
      const target = event.target;
      const scrollTop = target.scrollTop;
      const scrollHeight = target.scrollHeight;
      const clientHeight = target.clientHeight;

      if (scrollHeight - scrollTop - clientHeight < 50) {
        this.loadMore();
      }
    },

    handleVisibleChange(visible) {
      this.$emit("visible-change", visible);

      if (visible && this.pagination) {
        this.setupScrollListener();
      } else if (!visible) {
        this.removeScrollListener();
      }
    },

    handleChange(value) {
      const selectedOption = this.mergedOptions.find(
        (option) => this.getOptionValue(option) === value,
      );
      this.$emit("change", value, selectedOption);
    },

    clearCache() {
      this.searchCache.clear();
    },

    clear() {
      this.selectedValue = "";
      this.$refs.selectRef?.blur();
    },

    focus() {
      this.$refs.selectRef?.focus();
    },

    blur() {
      this.$refs.selectRef?.blur();
    },

    resetPagination() {
      this.currentPage = 1;
      this.hasMore = true;
      this.currentQuery = "";
      this.internalOptions = [];
    },
  },
};
</script>

<style scoped>
.remote-select-empty {
  padding: 10px 0;
  text-align: center;
  color: #909399;
}
.remote-select-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  color: #909399;
  gap: 6px;
}
.remote-select-loading .el-icon {
  animation: rotating 2s linear infinite;
}
@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
