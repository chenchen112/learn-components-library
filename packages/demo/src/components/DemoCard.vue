<template>
  <el-card class="demo-card" :header="title" shadow="hover">
    <template #header>
      <div class="demo-card-header">
        <h3>{{ title }}</h3>
        <el-button 
          v-if="showCode" 
          type="text" 
          @click="toggleCode"
          class="code-toggle-btn"
        >
          {{ showCodeContent ? '隐藏代码' : '查看代码' }}
        </el-button>
      </div>
    </template>
    
    <div class="demo-content">
      <slot></slot>
    </div>
    
    <div v-if="showCode && showCodeContent" class="demo-code">
      <el-divider content-position="left">代码示例</el-divider>
      <slot name="code">
        <pre><code>{{ codeContent }}</code></pre>
      </slot>
    </div>
    
    <template v-if="$slots.footer" #footer>
      <slot name="footer"></slot>
    </template>
  </el-card>
</template>

<script>
export default {
  name: 'DemoCard',
  props: {
    title: {
      type: String,
      required: true
    },
    showCode: {
      type: Boolean,
      default: false
    },
    codeContent: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showCodeContent: false
    }
  },
  methods: {
    toggleCode() {
      this.showCodeContent = !this.showCodeContent
    }
  }
}
</script>

<style scoped>
.demo-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.demo-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.demo-card-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.code-toggle-btn {
  color: #409eff;
  font-size: 14px;
}

.demo-content {
  padding: 0;
}

.demo-code {
  margin-top: 20px;
}

.demo-code pre {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
}

.demo-code code {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #303133;
}
</style>