import VirtualList from "./components/VirtualList.vue";
import RemoteSelect from "./components/RemoteSelect.vue";

// 导出组件
export { VirtualList, RemoteSelect };

export default {
  install(Vue) {
    Vue.component("VirtualList", VirtualList);
    Vue.component("RemoteSelect", RemoteSelect);
  },
};
