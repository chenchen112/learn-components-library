<template>
  <el-form-item
    v-if="visible"
    :label="fieldSchema.label"
    :prop="fieldPath"
    :rules="computedRules"
    :label-width="fieldSchema.labelWidth"
    :class="fieldSchema.className"
  >
    <component
      :is="fieldComponent"
      v-model="fieldValue"
      v-bind="fieldProps"
      :disabled="computedDisabled"
      :placeholder="computedPlaceholder"
      :style="fieldStyle"
      @change="handleFieldChange"
      @blur="handleFieldBlur"
    >
      <template v-if="fieldSchema.type === 'select'">
        <el-option
          v-for="option in computedOptions"
          :key="getOptionKey(option)"
          :label="getOptionLabel(option)"
          :value="getOptionValue(option)"
          :disabled="option.disabled"
        />
      </template>

      <template v-if="fieldSchema.type === 'radio'">
        <el-radio
          v-for="option in computedOptions"
          :key="getOptionKey(option)"
          :label="getOptionValue(option)"
          :disabled="option.disabled"
        >
          {{ getOptionLabel(option) }}
        </el-radio>
      </template>

      <template
        v-if="
          fieldSchema.type === 'checkbox' &&
          fieldSchema.checkboxType === 'group'
        "
      >
        <el-checkbox
          v-for="option in computedOptions"
          :key="getOptionKey(option)"
          :label="getOptionValue(option)"
          :disabled="option.disabled"
        >
          {{ getOptionLabel(option) }}
        </el-checkbox>
      </template>
    </component>
  </el-form-item>
</template>

<script>
import { FIELD_TYPES } from "./types";
import { SchemaValidator } from "./validator";
import { getValueByPath, setValueByPath, isEmpty } from "./utils";

export default {
  name: "SchemaField",
  inject: ["schemaForm"],
  props: {
    fieldSchema: {
      type: Object,
      required: true,
    },
    fieldPath: {
      type: String,
      required: true,
    },
    formData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      visible: true,
      validator: null,
    };
  },
  computed: {
    fieldValue: {
      get() {
        const value = getValueByPath(this.formData, this.fieldPath);
        if (
          this.fieldSchema.type === FIELD_TYPES.CHECKBOX &&
          this.fieldSchema.checkboxType === "group" &&
          !Array.isArray(value)
        ) {
          return [];
        }
        return value;
      },
      set(value) {
        const newFormData = { ...this.formData };
        setValueByPath(newFormData, this.fieldPath, value);
        this.$emit("update:formData", newFormData);
      },
    },
    fieldComponent() {
      const componentMap = {
        [FIELD_TYPES.INPUT]: "el-input",
        [FIELD_TYPES.TEXTAREA]: "el-input",
        [FIELD_TYPES.SELECT]: "el-select",
        [FIELD_TYPES.RADIO]: "el-radio-group",
        [FIELD_TYPES.CHECKBOX]:
          this.fieldSchema.checkboxType === "group"
            ? "el-checkbox-group"
            : "el-checkbox",
        [FIELD_TYPES.DATE]: "el-date-picker",
        [FIELD_TYPES.TIME]: "el-time-picker",
        [FIELD_TYPES.DATETIME]: "el-date-picker",
        [FIELD_TYPES.NUMBER]: "el-input-number",
        [FIELD_TYPES.SWITCH]: "el-switch",
        [FIELD_TYPES.SLIDER]: "el-slider",
        [FIELD_TYPES.RATE]: "el-rate",
        [FIELD_TYPES.COLOR]: "el-color-picker",
      };
      return componentMap[this.fieldSchema.type] || "el-input";
    },
    fieldProps() {
      const props = { ...this.fieldSchema.props };

      if (this.fieldSchema.type === FIELD_TYPES.TEXTAREA) {
        props.type = "textarea";
        props.rows = this.fieldSchema.rows || 4;
      }

      if (this.fieldSchema.type === FIELD_TYPES.DATETIME) {
        props.type = "datetime";
      }

      if (this.fieldSchema.type === FIELD_TYPES.DATE) {
        props.type = this.fieldSchema.dateType || "date";
      }

      return props;
    },
    fieldStyle() {
      const style = {};
      if (this.fieldSchema.width) {
        style.width =
          typeof this.fieldSchema.width === "number"
            ? `${this.fieldSchema.width}px`
            : this.fieldSchema.width;
      }
      return style;
    },
    computedPlaceholder() {
      if (this.fieldSchema.placeholder) {
        return this.fieldSchema.placeholder;
      }

      const label = this.fieldSchema.label || "";
      const typeMap = {
        [FIELD_TYPES.INPUT]: "请输入",
        [FIELD_TYPES.TEXTAREA]: "请输入",
        [FIELD_TYPES.SELECT]: "请选择",
        [FIELD_TYPES.RADIO]: "请选择",
        [FIELD_TYPES.CHECKBOX]: "请选择",
        [FIELD_TYPES.DATE]: "请选择日期",
        [FIELD_TYPES.TIME]: "请选择时间",
        [FIELD_TYPES.DATETIME]: "请选择日期时间",
      };

      return `${typeMap[this.fieldSchema.type] || "请输入"}${label}`;
    },
    computedDisabled() {
      if (this.fieldSchema.disabled !== undefined) {
        return this.fieldSchema.disabled;
      }
      return false;
    },
    computedOptions() {
      if (
        this.schemaForm.linkageResults &&
        this.schemaForm.linkageResults[this.fieldPath] &&
        this.schemaForm.linkageResults[this.fieldPath].options
      ) {
        return this.schemaForm.linkageResults[this.fieldPath].options;
      }
      return this.fieldSchema.options || [];
    },
    computedRules() {
      if (!this.validator) {
        this.validator = new SchemaValidator(this.fieldSchema);
      }
      return this.validator.getRules();
    },
  },
  watch: {
    "schemaForm.linkageResults": {
      handler(results) {
        if (results && results[this.fieldPath]) {
          const linkage = results[this.fieldPath];

          if (linkage.visible !== undefined) {
            this.visible = linkage.visible;
          }

          if (linkage.value !== undefined) {
            this.fieldValue = linkage.value;
          }
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    getOptionKey(option) {
      return option.value;
    },
    getOptionLabel(option) {
      return option.label || option.value;
    },
    getOptionValue(option) {
      return option.value;
    },
    handleFieldChange(value) {
      this.$emit("field-change", {
        field: this.fieldPath,
        value: value,
        schema: this.fieldSchema,
      });
    },
    handleFieldBlur() {
      this.$emit("field-blur", {
        field: this.fieldPath,
        schema: this.fieldSchema,
      });
    },
  },
};
</script>
