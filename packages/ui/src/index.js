import VirtualList from "./components/VirtualList.vue";
import RemoteSelect from "./components/RemoteSelect.vue";
import { SchemaForm as SchemaFormComponent } from "./components/SchemaForm";

export { VirtualList, RemoteSelect };
export { SchemaForm } from "./components/SchemaForm";
export * from "./components/SchemaForm";

export default {
  install(Vue) {
    Vue.component("VirtualList", VirtualList);
    Vue.component("RemoteSelect", RemoteSelect);
    Vue.component("SchemaForm", SchemaFormComponent);
  },
};
