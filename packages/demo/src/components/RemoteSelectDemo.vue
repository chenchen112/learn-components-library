<template>
  <div class="remote-select-demo">
    <demo-card
      title="基础远程选择"
      :show-code="true"
      :code-content="basicRemoteSelectCode"
    >
      <div class="demo-controls">
        <el-form :inline="true" size="small">
          <el-form-item label="防抖延迟:">
            <el-input-number
              v-model="debounceTime"
              :min="100"
              :max="2000"
              :step="100"
            />
            <span style="margin-left: 5px; color: #909399">ms</span>
          </el-form-item>
          <el-form-item label="启用缓存:">
            <el-switch v-model="enableCache" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="clearAllCache">
              清空缓存
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="demo-item">
        <h4>基础用法</h4>
        <remote-select
          v-model="selectedUser"
          :remote-method="searchUsers"
          v-model:options="userOptions"
          :debounce="debounceTime"
          :cache="enableCache"
          placeholder="请输入用户名搜索"
          style="width: 300px"
          @change="handleUserChange"
          @search="handleSearch"
        />
        <div class="result-info">
          <el-tag v-if="selectedUser" type="success"
            >选中用户: {{ selectedUser }}</el-tag
          >
          <el-tag v-else type="info">未选择用户</el-tag>
        </div>
      </div>

      <template #code>
        <pre><code>{{ basicRemoteSelectCode }}</code></pre>
      </template>
    </demo-card>

    <demo-card
      title="多选远程选择"
      :show-code="true"
      :code-content="multipleRemoteSelectCode"
    >
      <div class="demo-item">
        <h4>多选模式</h4>
        <remote-select
          v-model="selectedUsers"
          :remote-method="searchUsers"
          v-model:options="userOptions"
          :debounce="debounceTime"
          :cache="enableCache"
          multiple
          collapse-tags
          placeholder="请输入用户名搜索（多选）"
          style="width: 400px"
          @change="handleUsersChange"
        />
        <div class="result-info">
          <el-tag v-if="selectedUsers.length" type="success">
            选中 {{ selectedUsers.length }} 个用户
          </el-tag>
          <el-tag v-else type="info">未选择用户</el-tag>
        </div>
      </div>

      <template #code>
        <pre><code>{{ multipleRemoteSelectCode }}</code></pre>
      </template>
    </demo-card>

    <demo-card
      title="自定义选项显示"
      :show-code="true"
      :code-content="customOptionCode"
    >
      <div class="demo-item">
        <h4>自定义选项模板</h4>
        <remote-select
          v-model="selectedCustomUser"
          :remote-method="searchUsers"
          v-model:options="userOptions"
          :debounce="debounceTime"
          :cache="enableCache"
          placeholder="请输入用户名搜索"
          style="width: 350px"
        >
          <template #option="{ item }">
            <div class="custom-option">
              <el-avatar :src="item.avatar" :size="32" />
              <div class="option-info">
                <div class="option-name">{{ item.name }}</div>
                <div class="option-details">
                  <el-tag size="mini" type="info">ID: {{ item.id }}</el-tag>
                  <el-tag size="mini" type="warning"
                    >VIP{{ item.vipLevel }}</el-tag
                  >
                </div>
              </div>
            </div>
          </template>

          <template #empty>
            <div class="custom-empty">
              <el-icon>
                <search />
              </el-icon>
              <span>暂无匹配的用户数据</span>
            </div>
          </template>
        </remote-select>
        <div class="result-info">
          <el-tag v-if="selectedCustomUser" type="success"
            >选中用户: {{ selectedCustomUser }}</el-tag
          >
          <el-tag v-else type="info">未选择用户</el-tag>
        </div>
      </div>

      <template #code>
        <pre><code>{{ customOptionCode }}</code></pre>
      </template>
    </demo-card>

    <demo-card
      title="高级配置"
      :show-code="true"
      :code-content="advancedConfigCode"
    >
      <div class="demo-item">
        <h4>自定义选项配置</h4>
        <remote-select
          v-model="selectedAdvancedUser"
          :remote-method="searchUsers"
          v-model:options="userOptions"
          :option-config="customOptionConfig"
          :debounce="debounceTime"
          :cache="enableCache"
          placeholder="请输入用户名搜索"
          style="width: 300px"
        />
        <div class="config-info">
          <el-descriptions title="选项配置" :column="2" border size="small">
            <el-descriptions-item label="键名">{{
              customOptionConfig.key
            }}</el-descriptions-item>
            <el-descriptions-item label="标签">{{
              customOptionConfig.label
            }}</el-descriptions-item>
            <el-descriptions-item label="值">{{
              customOptionConfig.value
            }}</el-descriptions-item>
            <el-descriptions-item label="禁用">{{
              customOptionConfig.disabled
            }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <template #code>
        <pre><code>{{ advancedConfigCode }}</code></pre>
      </template>
    </demo-card>
  </div>
</template>

<script>
import DemoCard from "./DemoCard.vue";
import { RemoteSelect } from "ui";

export default {
  name: "RemoteSelectDemo",
  components: {
    DemoCard,
    RemoteSelect,
  },
  data() {
    return {
      debounceTime: 300,
      enableCache: true,
      selectedUser: "",
      selectedUsers: [],
      selectedCustomUser: "",
      selectedAdvancedUser: "",
      userOptions: [],

      customOptionConfig: {
        key: "id",
        label: "name",
        value: "value",
        disabled: "disabled",
      },

      basicRemoteSelectCode: `<!-- 基础远程选择 -->
<remote-select
  v-model="selectedUser"
  :remote-method="searchUsers"
  :options="userOptions"
  placeholder="请输入用户名搜索"
  @change="handleUserChange"
/>`,

      multipleRemoteSelectCode: `<!-- 多选远程选择 -->
<remote-select
  v-model="selectedUsers"
  :remote-method="searchUsers"
  :options="userOptions"
  multiple
  collapse-tags
  placeholder="请输入用户名搜索（多选）"
  @change="handleUsersChange"
/>`,

      customOptionCode: `<!-- 自定义选项显示 -->
<remote-select
  v-model="selectedCustomUser"
  :remote-method="searchUsers"
  :options="userOptions"
  placeholder="请输入用户名搜索"
>
  <template #option="{ item }">
    <div class="custom-option">
      <el-avatar :src="item.avatar" />
      <span class="user-name">{{ item.name }}</span>
      <span class="user-id">(ID: {{ item.id }})</span>
    </div>
  </template>
  
  <template #empty>
    <div class="custom-empty">
      <el-icon><search /></el-icon>
      <span>暂无匹配的用户数据</span>
    </div>
  </template>
</remote-select>`,

      advancedConfigCode: `<!-- 高级配置 -->
<remote-select
  v-model="selectedAdvancedUser"
  :remote-method="searchUsers"
  :options="userOptions"
  :option-config="customOptionConfig"
  placeholder="请输入用户名搜索"
/>`,
    };
  },
  methods: {
    // 模拟远程搜索用户
    async searchUsers(query) {
      // 模拟网络延迟
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 模拟搜索逻辑
      const allUsers = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `用户 ${i + 1}`,
        avatar: `https://randomuser.me/api/portraits/men/${i % 10}.jpg`,
        value: `user_${i + 1}`,
        vipLevel: Math.floor(Math.random() * 5) + 1,
        disabled: i % 7 === 0,
      }));

      if (!query) {
        return allUsers.slice(0, 10);
      }

      return allUsers
        .filter((user) => user.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10);
    },

    // 处理用户选择变化
    handleUserChange(value, option) {
      console.log("用户选择变化:", value, option);
      this.$message.success(`选中用户: ${value}`);
    },

    // 处理多选用户变化
    handleUsersChange(values, options) {
      console.log("多选用户变化:", values, options);
      this.$message.success(`选中 ${values.length} 个用户`);
    },

    // 处理搜索事件
    handleSearch(query, result) {
      debugger;
      console.log("搜索事件:", query, result);
    },

    // 清空所有缓存
    clearAllCache() {
      this.$message.info("缓存已清空");
    },
  },
};
</script>

<style scoped>
.remote-select-demo {
  padding: 0;
}

.demo-controls {
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.demo-item {
  margin-bottom: 30px;
}

.demo-item h4 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
}

.result-info {
  margin-top: 15px;
}

.config-info {
  margin-top: 15px;
}

.custom-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.option-info {
  flex: 1;
}

.option-name {
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.option-details {
  display: flex;
  gap: 5px;
}

.custom-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #909399;
}
</style>
