<template>
  <div class="schema-form-container">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-width="labelWidth"
      :label-position="labelPosition"
      :size="size"
      :disabled="disabled"
      @submit.native.prevent="handleSubmit"
    >
      <template v-for="field in processedSchema">
        <schema-field
          v-if="shouldShowField(field)"
          :key="field.field"
          :field-schema="field"
          :field-path="field.field"
          :form-data="formData"
          @update:formData="updateFormData"
          @field-change="handleFieldChange"
          @field-blur="handleFieldBlur"
        />
      </template>

      <el-form-item v-if="showButtons">
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ submitText }}
        </el-button>
        <el-button @click="handleReset">
          {{ resetText }}
        </el-button>
        <el-button v-if="enableDraft" @click="handleSaveDraft">
          保存草稿
        </el-button>
        <el-button
          v-if="enableDraft && hasDraft"
          type="warning"
          @click="handleRestoreDraft"
        >
          恢复草稿
        </el-button>
      </el-form-item>
    </el-form>

    <el-dialog
      :visible.sync="draftDialogVisible"
      title="发现草稿数据"
      width="400px"
    >
      <p>检测到未提交的草稿数据，是否恢复？</p>
      <span slot="footer">
        <el-button @click="handleDiscardDraft">放弃草稿</el-button>
        <el-button type="primary" @click="handleConfirmRestoreDraft"
          >恢复草稿</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import SchemaField from "./SchemaField.vue";
import { ExpressionEngine } from "./expression-engine";
import { getDraftStorage } from "./draft-storage";
import { deepClone, deepMerge, getValueByPath } from "./utils";

export default {
  name: "SchemaForm",
  components: {
    SchemaField,
  },
  provide() {
    return {
      schemaForm: this,
    };
  },
  props: {
    schema: {
      type: Array,
      required: true,
    },
    value: {
      type: Object,
      default: () => ({}),
    },
    labelWidth: {
      type: String,
      default: "120px",
    },
    labelPosition: {
      type: String,
      default: "right",
    },
    size: {
      type: String,
      default: "small",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    showButtons: {
      type: Boolean,
      default: true,
    },
    submitText: {
      type: String,
      default: "提交",
    },
    resetText: {
      type: String,
      default: "重置",
    },
    enableDraft: {
      type: Boolean,
      default: false,
    },
    draftKey: {
      type: String,
      default: "default",
    },
    excludeDraftFields: {
      type: Array,
      default: () => [],
    },
    showDraftReminder: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      formData: {},
      originalData: {},
      submitting: false,
      expressionEngine: null,
      linkageResults: {},
      draftStorage: null,
      hasDraft: false,
      draftDialogVisible: false,
      savedDraftData: null,
      isInternalUpdate: false,
      isEvaluatingLinkage: false,
    };
  },
  computed: {
    processedSchema() {
      return this.processSchema(this.schema);
    },
    formRules() {
      return {};
    },
  },
  watch: {
    value: {
      handler(newVal) {
        if (this.isInternalUpdate) {
          this.isInternalUpdate = false;
          return;
        }
        if (newVal && Object.keys(newVal).length > 0) {
          this.formData = deepClone(newVal);
          this.originalData = deepClone(newVal);
        }
      },
      immediate: true,
      deep: true,
    },
    formData: {
      handler(newVal) {
        if (this.isEvaluatingLinkage) {
          return;
        }
        this.isInternalUpdate = true;
        this.$emit("input", deepClone(newVal));
        this.evaluateLinkages();
      },
      deep: true,
    },
  },
  async created() {
    this.expressionEngine = new ExpressionEngine(this.formData);

    if (this.enableDraft) {
      await this.initDraftStorage();
    }
  },
  methods: {
    processSchema(schema) {
      const processed = [];

      schema.forEach((field) => {
        if (field.type === "object" && field.properties) {
          Object.keys(field.properties).forEach((key) => {
            const subField = field.properties[key];
            processed.push({
              ...subField,
              field: `${field.field}.${key}`,
            });
          });
        } else if (field.type === "array" && field.items) {
          processed.push({
            ...field,
            field: field.field,
          });
        } else {
          processed.push(field);
        }
      });

      return processed;
    },

    shouldShowField(field) {
      if (field.visible === false) {
        return false;
      }

      if (field.linkage && field.linkage.visible) {
        const result = this.expressionEngine.evaluateCondition(
          field.linkage.visible,
        );
        return result !== false;
      }

      return true;
    },

    updateFormData(newFormData) {
      this.formData = newFormData;
    },

    handleFieldChange({ field, value, schema }) {
      this.$emit("field-change", {
        field,
        value,
        schema,
        formData: deepClone(this.formData),
      });

      if (schema.linkage) {
        this.evaluateLinkages();
      }
    },

    handleFieldBlur({ field, schema }) {
      this.$emit("field-blur", {
        field,
        schema,
        formData: deepClone(this.formData),
      });
    },

    evaluateLinkages() {
      if (!this.expressionEngine || this.isEvaluatingLinkage) return;

      this.isEvaluatingLinkage = true;
      this.expressionEngine.updateFormData(this.formData);

      const results = {};

      this.processedSchema.forEach((field) => {
        if (field.linkage) {
          const linkageResult = this.expressionEngine.evaluateLinkage(
            field.linkage,
          );
          if (Object.keys(linkageResult).length > 0) {
            results[field.field] = linkageResult;
          }
        }
      });

      this.linkageResults = results;
      this.$nextTick(() => {
        this.isEvaluatingLinkage = false;
      });
    },

    async validate() {
      try {
        await this.$refs.formRef.validate();
        return true;
      } catch (error) {
        return false;
      }
    },

    async validateField(prop) {
      try {
        await this.$refs.formRef.validateField(prop);
        return true;
      } catch (error) {
        return false;
      }
    },

    resetForm() {
      this.formData = deepClone(this.originalData);
      this.$refs.formRef.resetFields();
      this.$emit("reset", deepClone(this.formData));
    },

    clearValidate(props) {
      this.$refs.formRef.clearValidate(props);
    },

    async handleSubmit() {
      const valid = await this.validate();

      if (!valid) {
        this.$emit("validation-failed", this.formData);
        return;
      }

      this.submitting = true;

      try {
        this.$emit("submit", deepClone(this.formData));

        if (this.enableDraft) {
          await this.clearDraft();
        }
      } catch (error) {
        this.$emit("submit-error", error);
      } finally {
        this.submitting = false;
      }
    },

    handleReset() {
      this.resetForm();
    },

    async initDraftStorage() {
      try {
        this.draftStorage = await getDraftStorage();

        const draftData = await this.draftStorage.load(this.draftKey);

        if (draftData && this.showDraftReminder) {
          this.savedDraftData = draftData;
          this.hasDraft = true;
          this.draftDialogVisible = true;
        }
      } catch (error) {
        console.warn("Draft storage initialization failed:", error);
      }
    },

    async handleSaveDraft() {
      if (!this.draftStorage) return;

      try {
        const success = await this.draftStorage.save(
          this.draftKey,
          this.formData,
          this.excludeDraftFields,
        );

        if (success) {
          this.hasDraft = true;
          this.$message.success("草稿保存成功");
          this.$emit("draft-saved", deepClone(this.formData));
        } else {
          this.$message.error("草稿保存失败");
        }
      } catch (error) {
        console.error("Save draft error:", error);
        this.$message.error("草稿保存失败");
      }
    },

    async handleRestoreDraft() {
      if (!this.draftStorage) return;

      try {
        const draftData = await this.draftStorage.load(this.draftKey);

        if (draftData) {
          this.formData = deepMerge(this.formData, draftData);
          this.$message.success("草稿恢复成功");
          this.$emit("draft-restored", deepClone(this.formData));
        }
      } catch (error) {
        console.error("Restore draft error:", error);
        this.$message.error("草稿恢复失败");
      }
    },

    handleConfirmRestoreDraft() {
      this.draftDialogVisible = false;
      if (this.savedDraftData) {
        this.formData = deepMerge(this.formData, this.savedDraftData);
        this.$message.success("草稿恢复成功");
        this.$emit("draft-restored", deepClone(this.formData));
      }
    },

    async handleDiscardDraft() {
      this.draftDialogVisible = false;
      await this.clearDraft();
      this.$emit("draft-discarded");
    },

    async clearDraft() {
      if (!this.draftStorage) return;

      try {
        await this.draftStorage.remove(this.draftKey);
        this.hasDraft = false;
        this.savedDraftData = null;
      } catch (error) {
        console.error("Clear draft error:", error);
      }
    },

    getFormData() {
      return deepClone(this.formData);
    },

    setFormData(data) {
      this.formData = deepMerge(this.formData, data);
    },

    setFieldValue(path, value) {
      const newFormData = deepClone(this.formData);
      const keys = path.split(".");
      let current = newFormData;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current)) {
          current[key] = {};
        }
        current = current[key];
      }

      current[keys[keys.length - 1]] = value;
      this.formData = newFormData;
    },

    getFieldValue(path) {
      return getValueByPath(this.formData, path);
    },
  },
};
</script>

<style scoped>
.schema-form-container {
  width: 100%;
}
</style>
