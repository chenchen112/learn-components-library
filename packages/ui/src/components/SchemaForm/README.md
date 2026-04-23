# JSON Schema Form 表单组件

一个功能强大的 Vue2 + ElementUI JSON Schema 驱动的表单组件，支持动态配置、校验、联动和草稿持久化。

## 特性

- ✅ **Schema 驱动** - 通过 JSON Schema 配置动态生成表单
- ✅ **双向绑定** - 完整支持 v-model 双向数据绑定
- ✅ **嵌套结构** - 支持对象和数组类型的嵌套数据结构
- ✅ **丰富控件** - 支持所有 ElementUI 常用表单控件
- ✅ **灵活校验** - 内置多种校验规则，支持自定义校验函数
- ✅ **宽度配置** - 支持表单项宽度自定义配置
- ✅ **联动机制** - 通过求值引擎实现表单项值、显隐、权限联动
- ✅ **草稿持久化** - 支持 IndexedDB/localStorage 自动降级存储
- ✅ **敏感字段排除** - 草稿存储支持排除指定敏感字段

## 安装

```bash
npm install @your-org/schema-form
```

## 基础用法

```vue
<template>
  <schema-form
    :schema="formSchema"
    v-model="formData"
    @submit="handleSubmit"
  />
</template>

<script>
import { FIELD_TYPES, VALIDATION_TYPES } from '@your-org/schema-form'

export default {
  data() {
    return {
      formData: {},
      formSchema: [
        {
          field: 'username',
          label: '用户名',
          type: FIELD_TYPES.INPUT,
          width: 300,
          rules: [
            VALIDATION_TYPES.REQUIRED,
            { type: VALIDATION_TYPES.MIN_LENGTH, value: 3 }
          ],
          props: {
            clearable: true,
            placeholder: '请输入用户名'
          }
        },
        {
          field: 'gender',
          label: '性别',
          type: FIELD_TYPES.RADIO,
          options: [
            { label: '男', value: 'male' },
            { label: '女', value: 'female' }
          ]
        }
      ]
    }
  },
  methods: {
    handleSubmit(data) {
      console.log('表单数据:', data)
    }
  }
}
</script>
```

## Schema 配置

### 字段类型 (FIELD_TYPES)

| 类型 | 说明 | ElementUI 组件 |
|------|------|----------------|
| `INPUT` | 输入框 | el-input |
| `TEXTAREA` | 文本域 | el-input type="textarea" |
| `SELECT` | 下拉选择 | el-select |
| `RADIO` | 单选框组 | el-radio-group |
| `CHECKBOX` | 复选框 | el-checkbox / el-checkbox-group |
| `DATE` | 日期选择 | el-date-picker |
| `TIME` | 时间选择 | el-time-picker |
| `DATETIME` | 日期时间选择 | el-date-picker type="datetime" |
| `NUMBER` | 数字输入 | el-input-number |
| `SWITCH` | 开关 | el-switch |
| `SLIDER` | 滑块 | el-slider |
| `RATE` | 评分 | el-rate |
| `COLOR` | 颜色选择 | el-color-picker |

### 字段配置项

```javascript
{
  field: 'fieldName',           // 字段名（必填）
  label: '字段标签',             // 标签文本
  type: FIELD_TYPES.INPUT,      // 字段类型（必填）
  width: 300,                   // 字段宽度（数字或字符串）
  rules: [],                    // 校验规则数组
  options: [],                  // 选项（用于 select/radio/checkbox）
  props: {},                    // 传递给组件的 props
  linkage: {},                  // 联动配置
  visible: true,                // 是否显示
  disabled: false,              // 是否禁用
  className: '',                // 自定义类名
  labelWidth: '120px'           // 标签宽度
}
```

## 校验规则

### 内置校验类型 (VALIDATION_TYPES)

```javascript
import { VALIDATION_TYPES } from '@your-org/schema-form'

// 必填校验
VALIDATION_TYPES.REQUIRED

// 数值范围校验
{ type: VALIDATION_TYPES.MIN, value: 0, message: '不能小于0' }
{ type: VALIDATION_TYPES.MAX, value: 100, message: '不能大于100' }

// 长度校验
{ type: VALIDATION_TYPES.MIN_LENGTH, value: 6, message: '至少6个字符' }
{ type: VALIDATION_TYPES.MAX_LENGTH, value: 20, message: '最多20个字符' }

// 正则校验
{
  type: VALIDATION_TYPES.PATTERN,
  value: '^[a-zA-Z0-9]+$',
  message: '只能包含字母和数字'
}

// 枚举校验
{
  type: VALIDATION_TYPES.ENUM,
  value: ['option1', 'option2'],
  message: '请选择有效选项'
}
```

### 自定义校验函数

```javascript
{
  field: 'password',
  label: '密码',
  type: FIELD_TYPES.INPUT,
  rules: [
    VALIDATION_TYPES.REQUIRED,
    {
      type: VALIDATION_TYPES.CUSTOM,
      validator: (value, rule, callback, formData) => {
        if (value.length < 6) {
          return '密码至少6个字符'
        }
        if (!/[A-Z]/.test(value)) {
          return '密码必须包含大写字母'
        }
        return true
      }
    }
  ]
}
```

## 表单联动

通过 `linkage` 配置实现表单项之间的联动关系。

### 显隐联动

```javascript
{
  field: 'companyName',
  label: '公司名称',
  type: FIELD_TYPES.INPUT,
  linkage: {
    visible: 'formData.userType === "enterprise"'
  }
}
```

### 值联动

```javascript
{
  field: 'autoFillField',
  label: '自动填充',
  type: FIELD_TYPES.INPUT,
  linkage: {
    value: 'formData.firstName + " " + formData.lastName'
  }
}
```

### 禁用联动

```javascript
{
  field: 'companyCode',
  label: '企业代码',
  type: FIELD_TYPES.INPUT,
  linkage: {
    disabled: '!formData.companyName'
  }
}
```

### 选项联动

```javascript
{
  field: 'idType',
  label: '证件类型',
  type: FIELD_TYPES.SELECT,
  linkage: {
    options: `formData.userType === 'enterprise' 
      ? [{label:'营业执照',value:'license'},{label:'组织机构代码',value:'orgCode'}] 
      : [{label:'身份证',value:'idCard'},{label:'护照',value:'passport'}]`
  }
}
```

## 草稿持久化

### 启用草稿功能

```vue
<schema-form
  :schema="formSchema"
  v-model="formData"
  :enable-draft="true"
  draft-key="my-form-draft"
  :exclude-draft-fields="['password', 'creditCard']"
  @draft-saved="handleDraftSaved"
  @draft-restored="handleDraftRestored"
/>
```

### 草稿配置项

- `enable-draft` - 是否启用草稿功能
- `draft-key` - 草稿存储的唯一标识
- `exclude-draft-fields` - 排除的敏感字段数组
- `show-draft-reminder` - 是否显示草稿恢复提醒

### 存储机制

组件会自动检测浏览器支持情况：
1. 优先使用 **IndexedDB** 存储
2. 不支持时自动降级为 **localStorage**
3. 都不支持时禁用草稿功能

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| schema | 表单 Schema 配置 | Array | [] |
| value/v-model | 表单数据对象 | Object | {} |
| label-width | 标签宽度 | String | '120px' |
| label-position | 标签位置 | String | 'right' |
| size | 表单尺寸 | String | 'small' |
| disabled | 是否禁用所有字段 | Boolean | false |
| show-buttons | 是否显示按钮 | Boolean | true |
| submit-text | 提交按钮文本 | String | '提交' |
| reset-text | 重置按钮文本 | String | '重置' |
| enable-draft | 启用草稿功能 | Boolean | false |
| draft-key | 草稿存储键 | String | 'default' |
| exclude-draft-fields | 排除的草稿字段 | Array | [] |
| show-draft-reminder | 显示草稿提醒 | Boolean | true |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| submit | 表单提交时触发 | formData |
| reset | 表单重置时触发 | formData |
| field-change | 字段值变化时触发 | { field, value, schema, formData } |
| field-blur | 字段失焦时触发 | { field, schema, formData } |
| validation-failed | 校验失败时触发 | formData |
| draft-saved | 草稿保存成功时触发 | formData |
| draft-restored | 草稿恢复成功时触发 | formData |
| draft-discarded | 草稿被丢弃时触发 | - |

### Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| validate | 验证整个表单 | - |
| validateField | 验证单个字段 | prop: string |
| resetForm | 重置表单 | - |
| clearValidate | 清除校验结果 | props?: array |
| getFormData | 获取表单数据 | - |
| setFormData | 设置表单数据 | data: object |
| setFieldValue | 设置单个字段值 | path: string, value: any |
| getFieldValue | 获取单个字段值 | path: string |
| handleSaveDraft | 手动保存草稿 | - |
| handleRestoreDraft | 手动恢复草稿 | - |
| clearDraft | 清除草稿数据 | - |

## 完整示例

查看 [SchemaFormDemo.vue](./packages/demo/src/components/SchemaFormDemo.vue) 获取完整的使用示例。

## 浏览器支持

- Chrome >= 60
- Firefox >= 55
- Safari >= 12
- Edge >= 79

## License

MIT
