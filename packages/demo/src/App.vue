<template>
  <el-container class="app-container">
    <el-main class="app-main">
      <el-card class="main-card" shadow="hover">
        <template #header>
          <div class="main-header">
            <h2>组件演示</h2>
            <el-tag type="primary">v1.0.0</el-tag>
          </div>
        </template>

        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="虚拟列表" name="virtual-list">
            <virtual-list-demo />
          </el-tab-pane>

          <el-tab-pane label="远程选择器" name="remote-select">
            <remote-select-demo />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
import VirtualListDemo from "./components/VirtualListDemo.vue";
import RemoteSelectDemo from "./components/RemoteSelectDemo.vue";

export default {
  name: "App",
  components: {
    VirtualListDemo,
    RemoteSelectDemo,
  },
  data() {
    return {
      activeTab: "virtual-list",
      logo: "https://element.eleme.cn/static/theme-index-blue.c38b733.png",
    };
  },
  methods: {
    openGitHub() {
      this.$message.info("GitHub 仓库链接");
    },
    openDocs() {
      this.$message.info("文档链接");
    },
  },
};
</script>

<style>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-main {
  padding: 20px;
  flex: 1;
}

.main-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-header h2 {
  margin: 0;
  color: #303133;
}

.features-section {
  padding: 20px 0;
}

.feature-card {
  text-align: center;
  border-radius: 8px;
  border: none;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.feature-card h3 {
  margin: 0 0 10px 0;
  color: #303133;
}

.feature-card p {
  color: #606266;
  line-height: 1.5;
}

.usage-example {
  margin-top: 30px;
}

.usage-example h4 {
  margin: 0 0 15px 0;
  color: #303133;
}
</style>
