import SchemaForm from './SchemaForm.vue'
import SchemaField from './SchemaField.vue'

export { SchemaForm, SchemaField }

export { FIELD_TYPES, VALIDATION_TYPES, TRIGGER_TYPES, LINKAGE_TYPES } from './types'
export { SchemaValidator, createValidator } from './validator'
export { ExpressionEngine, createExpressionEngine } from './expression-engine'
export { DraftStorage, getDraftStorage } from './draft-storage'
export * from './utils'

export default {
  install(Vue) {
    Vue.component('SchemaForm', SchemaForm)
    Vue.component('SchemaField', SchemaField)
  }
}
