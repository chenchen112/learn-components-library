# Vue2 虚拟列表组件库

基于 Element UI 开发的虚拟列表组件库。

## 项目结构

```
packages/
├── ui/                  # 组件库源码
│   ├── src/
│   │   ├── components/  # 组件
│   │   └── index.js     # 入口文件
│   ├── package.json
│   └── webpack.config.js
└── demo/               # 演示项目
    ├── src/
    │   ├── App.vue     # 演示页面
    │   └── main.js     # 入口文件
    ├── public/
    │   └── index.html
    └── package.json
```

## 特性

- 🚀 基于 Element UI 设计规范
- 📱 支持自定义内容插槽
- 🎯 支持动态高度
- 🔄 虚拟滚动，高性能渲染
- 🔧 配置简单，易于使用

## 快速开始

### 安装依赖

```bash
# 安装依赖（需要先安装 pnpm）
pnpm install
```

### 开发组件库

```bash
cd packages/ui
npm run dev
```

### 运行演示

```bash
cd packages/demo
npm run dev
```

### 构建组件库

```bash
cd packages/ui
npm run build
```

## 组件使用

```vue
<template>
  <virtual-list
    :list-data="listData"
    :item-height="50"
    :container-height="400"
  >
    <template #default="{ item, index }">
      <div class="item">{{ item.name }}</div>
    </template>
  </virtual-list>
</template>

<script>
export default {
  data() {
    return {
      listData: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `项目 ${i + 1}`
      }))
    }
  }
}
</script>
```

## Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| listData | Array | [] | 数据列表 |
| itemHeight | Number | 50 | 每项高度（固定高度时使用） |
| containerHeight | Number | 400 | 容器高度 |
| bufferSize | Number | 5 | 缓冲项数量 |

## 插槽

| 名称 | 参数 | 说明 |
|------|------|------|
| default | `{ item, index }` | 自定义内容渲染 |