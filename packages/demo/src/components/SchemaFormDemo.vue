<template>
  <div class="schema-form-demo">
    <demo-card title="JSON Schema Form 表单组件示例">
      <div class="demo-section">
        <h3>基础表单示例</h3>
        <schema-form
          ref="basicForm"
          :schema="basicSchema"
          v-model="basicFormData"
          :enable-draft="true"
          draft-key="basic-form-demo"
          :exclude-draft-fields="['password']"
          @submit="handleBasicSubmit"
          @field-change="handleFieldChange"
          @draft-saved="handleDraftSaved"
          @draft-restored="handleDraftRestored"
        />
      </div>

      <div class="demo-section">
        <h3>表单数据</h3>
        <pre>{{ JSON.stringify(basicFormData, null, 2) }}</pre>
      </div>

      <div class="demo-section">
        <h3>联动表单示例</h3>
        <schema-form
          ref="linkageForm"
          :schema="linkageSchema"
          v-model="linkageFormData"
          @submit="handleLinkageSubmit"
        />
      </div>

      <div class="demo-section">
        <h3>联动表单数据</h3>
        <pre>{{ JSON.stringify(linkageFormData, null, 2) }}</pre>
      </div>
    </demo-card>
  </div>
</template>

<script>
import DemoCard from "./DemoCard.vue";
import { FIELD_TYPES, VALIDATION_TYPES } from "ui";

export default {
  name: "SchemaFormDemo",
  components: {
    DemoCard,
  },
  data() {
    return {
      basicFormData: {
        hobbies: [],
      },
      linkageFormData: {},
      basicSchema: [
        {
          field: "username",
          label: "用户名",
          type: FIELD_TYPES.INPUT,
          width: 300,
          rules: [
            VALIDATION_TYPES.REQUIRED,
            {
              type: VALIDATION_TYPES.MIN_LENGTH,
              value: 3,
              message: "用户名至少3个字符",
            },
            {
              type: VALIDATION_TYPES.MAX_LENGTH,
              value: 20,
              message: "用户名最多20个字符",
            },
          ],
          props: {
            clearable: true,
            prefixIcon: "el-icon-user",
          },
        },
        {
          field: "password",
          label: "密码",
          type: FIELD_TYPES.INPUT,
          width: 300,
          rules: [
            VALIDATION_TYPES.REQUIRED,
            {
              type: VALIDATION_TYPES.MIN_LENGTH,
              value: 6,
              message: "密码至少6个字符",
            },
          ],
          props: {
            showPassword: true,
            clearable: true,
            prefixIcon: "el-icon-lock",
          },
        },
        {
          field: "email",
          label: "邮箱",
          type: FIELD_TYPES.INPUT,
          width: 300,
          rules: [
            VALIDATION_TYPES.REQUIRED,
            {
              type: VALIDATION_TYPES.PATTERN,
              value: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
              message: "请输入正确的邮箱格式",
            },
          ],
          props: {
            clearable: true,
            prefixIcon: "el-icon-message",
          },
        },
        {
          field: "age",
          label: "年龄",
          type: FIELD_TYPES.NUMBER,
          width: 200,
          rules: [
            VALIDATION_TYPES.REQUIRED,
            { type: VALIDATION_TYPES.MIN, value: 1, message: "年龄必须大于0" },
            {
              type: VALIDATION_TYPES.MAX,
              value: 150,
              message: "年龄不能超过150",
            },
          ],
          props: {
            min: 1,
            max: 150,
            step: 1,
          },
        },
        {
          field: "gender",
          label: "性别",
          type: FIELD_TYPES.RADIO,
          width: 300,
          rules: [VALIDATION_TYPES.REQUIRED],
          options: [
            { label: "男", value: "male" },
            { label: "女", value: "female" },
          ],
        },
        {
          field: "hobbies",
          label: "爱好",
          type: FIELD_TYPES.CHECKBOX,
          checkboxType: "group",
          width: 400,
          options: [
            { label: "阅读", value: "reading" },
            { label: "运动", value: "sports" },
            { label: "音乐", value: "music" },
            { label: "旅行", value: "travel" },
          ],
        },
        {
          field: "city",
          label: "城市",
          type: FIELD_TYPES.SELECT,
          width: 300,
          rules: [VALIDATION_TYPES.REQUIRED],
          options: [
            { label: "北京", value: "beijing" },
            { label: "上海", value: "shanghai" },
            { label: "广州", value: "guangzhou" },
            { label: "深圳", value: "shenzhen" },
          ],
          props: {
            clearable: true,
            filterable: true,
          },
        },
        {
          field: "birthday",
          label: "出生日期",
          type: FIELD_TYPES.DATE,
          width: 300,
          rules: [VALIDATION_TYPES.REQUIRED],
          props: {
            valueFormat: "yyyy-MM-dd",
            placeholder: "选择出生日期",
          },
        },
        {
          field: "workTime",
          label: "工作时间",
          type: FIELD_TYPES.TIME,
          width: 300,
          props: {
            valueFormat: "HH:mm:ss",
            placeholder: "选择工作时间",
          },
        },
        {
          field: "introduction",
          label: "个人简介",
          type: FIELD_TYPES.TEXTAREA,
          width: 500,
          rows: 4,
          props: {
            maxlength: 500,
            showWordLimit: true,
            placeholder: "请输入个人简介",
          },
        },
        {
          field: "score",
          label: "评分",
          type: FIELD_TYPES.RATE,
          width: 300,
          props: {
            max: 5,
            allowHalf: true,
            showText: true,
          },
        },
      ],
      linkageSchema: [
        {
          field: "userType",
          label: "用户类型",
          type: FIELD_TYPES.SELECT,
          width: 300,
          rules: [VALIDATION_TYPES.REQUIRED],
          options: [
            { label: "个人用户", value: "personal" },
            { label: "企业用户", value: "enterprise" },
          ],
          props: {
            clearable: true,
          },
        },
        {
          field: "companyName",
          label: "公司名称",
          type: FIELD_TYPES.INPUT,
          width: 300,
          rules: [VALIDATION_TYPES.REQUIRED],
          linkage: {
            visible: 'formData.userType === "enterprise"',
          },
          props: {
            clearable: true,
          },
        },
        {
          field: "companyCode",
          label: "企业代码",
          type: FIELD_TYPES.INPUT,
          width: 300,
          linkage: {
            visible: 'formData.userType === "enterprise"',
            disabled: "!formData.companyName",
          },
          props: {
            clearable: true,
            placeholder: "请先填写公司名称",
          },
        },
        {
          field: "idType",
          label: "证件类型",
          type: FIELD_TYPES.SELECT,
          width: 300,
          rules: [VALIDATION_TYPES.REQUIRED],
          linkage: {
            options:
              'formData.userType === "enterprise" ? [{label:"营业执照",value:"license"},{label:"组织机构代码",value:"orgCode"}] : [{label:"身份证",value:"idCard"},{label:"护照",value:"passport"}]',
          },
          props: {
            clearable: true,
          },
        },
        {
          field: "idNumber",
          label: "证件号码",
          type: FIELD_TYPES.INPUT,
          width: 300,
          rules: [VALIDATION_TYPES.REQUIRED],
          props: {
            clearable: true,
          },
        },
        {
          field: "autoFillValue",
          label: "自动填充字段",
          type: FIELD_TYPES.INPUT,
          width: 300,
          linkage: {
            value: 'formData.userType + "-" + formData.idType',
          },
          props: {
            disabled: true,
          },
        },
      ],
    };
  },
  methods: {
    handleBasicSubmit(data) {
      console.log("基础表单提交:", data);
      this.$message.success("表单提交成功！");
    },

    handleLinkageSubmit(data) {
      console.log("联动表单提交:", data);
      this.$message.success("联动表单提交成功！");
    },

    handleFieldChange({ field, value, formData }) {
      console.log("字段变化:", field, value);
    },

    handleDraftSaved(data) {
      this.$message.success("草稿已保存:", data);
    },

    handleDraftRestored(data) {
      this.$message.success("草稿已恢复:", data);
    },
  },
};
</script>

<style scoped>
.schema-form-demo {
  padding: 20px;
}

.demo-section {
  margin-bottom: 30px;
}

.demo-section h3 {
  margin-bottom: 15px;
  color: #303133;
}

pre {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
}
</style>
