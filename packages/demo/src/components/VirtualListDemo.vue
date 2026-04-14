<template>
  <div class="virtual-list-demo">
    <demo-card
      title="基础用法"
      :show-code="true"
      :code-content="basicUsageCode"
    >
      <div class="demo-controls">
        <el-form :inline="true" size="small">
          <el-form-item label="数据量:">
            <el-input-number
              v-model="basicDataSize"
              :min="100"
              :max="10000"
              :step="100"
              @change="updateBasicList"
            />
          </el-form-item>
          <el-form-item label="项高度:">
            <el-input-number
              v-model="basicItemHeight"
              :min="30"
              :max="100"
              :step="5"
            />
          </el-form-item>
        </el-form>
      </div>

      <virtual-list
        :list-data="basicList"
        :item-height="basicItemHeight"
        :container-height="400"
        style="width: 100%; border: 1px solid #ebeef5"
      >
        <template #default="{ item, index }">
          <div class="list-item">
            <el-tag type="primary" size="small">{{ index + 1 }}</el-tag>
            <span class="content">{{ item.name }}</span>
            <el-tag v-if="item.highlight" type="success" size="small"
              >重点</el-tag
            >
          </div>
        </template>
      </virtual-list>

      <template #code>
        <pre><code>{{ basicUsageCode }}</code></pre>
      </template>
    </demo-card>

    <demo-card
      title="自定义内容"
      :show-code="true"
      :code-content="customContentCode"
    >
      <virtual-list
        :list-data="userList"
        :item-height="80"
        :container-height="500"
        style="width: 100%; border: 1px solid #ebeef5"
      >
        <template #default="{ item }">
          <div class="user-item">
            <el-avatar :src="item.avatar" :size="40" />
            <div class="user-info">
              <div class="user-name">{{ item.name }}</div>
              <div class="user-desc">{{ item.description }}</div>
              <div class="user-tags">
                <el-tag size="small" type="info">用户ID: {{ item.id }}</el-tag>
                <el-tag size="small" type="warning"
                  >VIP{{ item.vipLevel }}</el-tag
                >
              </div>
            </div>
          </div>
        </template>
      </virtual-list>

      <template #code>
        <pre><code>{{ customContentCode }}</code></pre>
      </template>
    </demo-card>

    <demo-card
      title="动态高度"
      :show-code="true"
      :code-content="dynamicHeightCode"
    >
      <virtual-list
        :list-data="messageList"
        :container-height="400"
        style="width: 100%; border: 1px solid #ebeef5"
      >
        <template #default="{ item }">
          <div class="message-item" :style="{ height: item.height + 'px' }">
            <el-avatar :size="40" :style="{ backgroundColor: item.color }">
              {{ item.name[0] }}
            </el-avatar>
            <div class="message-content">
              <div class="message-header">
                <span class="message-name">{{ item.name }}</span>
                <el-tag size="mini" :type="item.type">{{ item.type }}</el-tag>
              </div>
              <div class="message-text">{{ item.content }}</div>
              <div class="message-time">{{ item.time }}</div>
            </div>
          </div>
        </template>
      </virtual-list>

      <template #code>
        <pre><code>{{ dynamicHeightCode }}</code></pre>
      </template>
    </demo-card>
  </div>
</template>

<script>
import DemoCard from "./DemoCard.vue";
import { VirtualList } from "ui";

export default {
  name: "VirtualListDemo",
  components: {
    DemoCard,
    VirtualList,
  },
  data() {
    return {
      basicDataSize: 1000,
      basicItemHeight: 50,
      basicList: [],
      userList: [],
      messageList: [],

      basicUsageCode: `<!-- 基础用法 -->
<virtual-list
  :list-data="basicList"
  :item-height="50"
  :container-height="400"
>
  <template #default="{ item, index }">
    <div class="list-item">
      <span class="index">{{ index + 1 }}</span>
      <span class="content">{{ item.name }}</span>
    </div>
  </template>
</virtual-list>`,

      customContentCode: `<!-- 自定义内容 -->
<virtual-list
  :list-data="userList"
  :item-height="80"
  :container-height="500"
>
  <template #default="{ item }">
    <div class="user-item">
      <el-avatar :src="item.avatar" />
      <div class="user-info">
        <div class="user-name">{{ item.name }}</div>
        <div class="user-desc">{{ item.description }}</div>
      </div>
    </div>
  </template>
</virtual-list>`,

      dynamicHeightCode: `<!-- 动态高度 -->
<virtual-list
  :list-data="messageList"
  :container-height="400"
>
  <template #default="{ item }">
    <div class="message-item" :style="{ height: item.height + 'px' }">
      <div class="message-avatar">{{ item.name[0] }}</div>
      <div class="message-content">
        <div class="message-name">{{ item.name }}</div>
        <div class="message-text">{{ item.content }}</div>
      </div>
    </div>
  </template>
</virtual-list>`,
    };
  },
  mounted() {
    this.updateBasicList();
    this.generateUserList();
    this.generateMessageList();
  },
  methods: {
    updateBasicList() {
      this.basicList = Array.from({ length: this.basicDataSize }, (_, i) => ({
        id: i,
        name: `项目 ${i + 1}`,
        highlight: i % 10 === 0,
      }));
    },

    generateUserList() {
      this.userList = Array.from({ length: 200 }, (_, i) => ({
        id: i,
        name: `用户 ${i + 1}`,
        avatar: `https://randomuser.me/api/portraits/men/${i % 100}.jpg`,
        description: `这是用户 ${i + 1} 的描述信息，包含详细的个人介绍`,
        vipLevel: Math.floor(Math.random() * 5) + 1,
      }));
    },

    generateMessageList() {
      const types = ["success", "info", "warning", "danger"];
      const colors = ["#409eff", "#67c23a", "#e6a23c", "#f56c6c"];

      this.messageList = Array.from({ length: 100 }, (_, i) => {
        const type = types[Math.floor(Math.random() * types.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];

        return {
          id: i,
          name: `发送者 ${i + 1}`,
          content: `这是第 ${i + 1} 条消息的内容，长度不一`.repeat(
            Math.ceil(Math.random() * 3) + 1,
          ),
          height: 60 + Math.random() * 40,
          type: type,
          color: color,
          time: new Date(
            Date.now() - Math.random() * 86400000,
          ).toLocaleTimeString(),
        };
      });
    },
  },
};
</script>

<style scoped>
.virtual-list-demo {
  padding: 0;
}

.demo-controls {
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.list-item {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  background: white;
  border-bottom: 1px solid #ebeef5;
  gap: 10px;
}

.list-item .content {
  flex: 1;
  color: #303133;
}

.user-item {
  height: 80px;
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background: white;
  border-bottom: 1px solid #ebeef5;
  gap: 15px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.user-desc {
  color: #909399;
  font-size: 12px;
  margin-bottom: 5px;
}

.user-tags {
  display: flex;
  gap: 5px;
}

.message-item {
  display: flex;
  padding: 10px 15px;
  background: white;
  border-bottom: 1px solid #ebeef5;
  box-sizing: border-box;
  gap: 15px;
}

.message-content {
  flex: 1;
  overflow: hidden;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.message-name {
  font-weight: bold;
  color: #303133;
}

.message-text {
  color: #606266;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 5px;
}

.message-time {
  color: #909399;
  font-size: 12px;
}
</style>
