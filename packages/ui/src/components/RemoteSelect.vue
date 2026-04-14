<template>
  <el-select
    ref="selectRef"
    v-model="selectedValue"
    v-bind="$attrs"
    filterable
    remote
    :remote-method="handleRemoteSearch"
    :loading="loading"
    @change="handleChange"
    @visible-change="handleVisibleChange"
  >
    <el-option
      v-for="item in options"
      :key="getOptionKey(item)"
      :label="getOptionLabel(item)"
      :value="getOptionValue(item)"
      :disabled="isOptionDisabled(item)"
    >
      <slot name="option" :item="item">
        {{ getOptionLabel(item) }}
      </slot>
    </el-option>

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
    // 选中的值
    value: {
      type: [String, Number, Array],
      default: "",
    },
    // 远程搜索方法
    remoteMethod: {
      type: Function,
      required: true,
    },
    // 选项列表
    options: {
      type: Array,
      default: () => [],
    },
    // 防抖延迟时间（毫秒）
    debounce: {
      type: Number,
      default: 300,
    },
    // 空状态文本
    emptyText: {
      type: String,
      default: "暂无数据",
    },
    // 选项键名配置
    optionConfig: {
      type: Object,
      default: () => ({
        key: "id",
        label: "label",
        value: "value",
        disabled: "disabled",
      }),
    },
    // 是否启用缓存
    cache: {
      type: Boolean,
      default: true,
    },
    // 初始加载数据
    initialLoad: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      selectedValue: this.value,
      searchCache: new Map(),
    };
  },
  computed: {
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
  },
  mounted() {
    if (this.initialLoad) {
      this.handleRemoteSearch("");
    }
  },
  methods: {
    // 获取选项键值
    getOptionKey(item) {
      return item[this.optionConfig.key] || item.value;
    },

    // 获取选项显示文本
    getOptionLabel(item) {
      return item[this.optionConfig.label] || item.label || item.value;
    },

    // 获取选项值
    getOptionValue(item) {
      return item[this.optionConfig.value] || item.value;
    },

    // 判断选项是否禁用
    isOptionDisabled(item) {
      return item[this.optionConfig.disabled] || item.disabled || false;
    },

    // 处理远程搜索
    handleRemoteSearch(query) {
      this.debouncedSearch(query);
    },

    // 执行搜索
    async performSearch(query) {
      debugger;
      if (this.cache && this.searchCache.has(query)) {
        const cachedData = this.searchCache.get(query);
        this.$emit("update:options", cachedData);
        return;
      }

      this.loading = true;

      try {
        const result = await this.remoteMethod(query);

        if (this.cache) {
          this.searchCache.set(query, result);
        }

        this.$emit("update:options", result);
        this.$emit("search", query, result);
      } catch (error) {
        this.$emit("error", error);
        console.error("RemoteSelect search error:", error);
      } finally {
        this.loading = false;
      }
    },

    // 处理选择变化
    handleChange(value) {
      const selectedOption = this.options.find(
        (option) => this.getOptionValue(option) === value,
      );
      this.$emit("change", value, selectedOption);
    },

    // 处理下拉框显示/隐藏
    handleVisibleChange(visible) {
      this.$emit("visible-change", visible);
    },

    // 清空缓存
    clearCache() {
      this.searchCache.clear();
    },

    // 清空选择
    clear() {
      this.selectedValue = "";
      this.$refs.selectRef?.blur();
    },

    // 聚焦
    focus() {
      this.$refs.selectRef?.focus();
    },

    // 失焦
    blur() {
      this.$refs.selectRef?.blur();
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
</style>
