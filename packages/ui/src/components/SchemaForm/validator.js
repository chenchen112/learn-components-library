import { VALIDATION_TYPES, TRIGGER_TYPES } from './types'

export class SchemaValidator {
  constructor(schema) {
    this.schema = schema
    this.rules = this.parseRules(schema)
  }

  parseRules(fieldSchema) {
    const rules = []
    
    if (!fieldSchema.rules || !Array.isArray(fieldSchema.rules)) {
      return rules
    }

    fieldSchema.rules.forEach(rule => {
      if (typeof rule === 'string') {
        rules.push(this.createBuiltinRule(rule, fieldSchema))
      } else if (typeof rule === 'object') {
        rules.push(this.createRule(rule, fieldSchema))
      } else if (typeof rule === 'function') {
        rules.push({
          validator: rule,
          trigger: TRIGGER_TYPES.BLUR
        })
      }
    })

    return rules
  }

  createBuiltinRule(type, fieldSchema) {
    const label = fieldSchema.label || fieldSchema.field
    
    switch (type) {
      case VALIDATION_TYPES.REQUIRED:
        return {
          required: true,
          message: `${label}不能为空`,
          trigger: TRIGGER_TYPES.BLUR
        }
      
      default:
        return {}
    }
  }

  createRule(ruleConfig, fieldSchema) {
    const label = fieldSchema.label || fieldSchema.field
    const rule = {}

    switch (ruleConfig.type) {
      case VALIDATION_TYPES.REQUIRED:
        rule.required = true
        rule.message = ruleConfig.message || `${label}不能为空`
        break
      
      case VALIDATION_TYPES.MIN:
        rule.min = ruleConfig.value
        rule.message = ruleConfig.message || `${label}不能小于${ruleConfig.value}`
        break
      
      case VALIDATION_TYPES.MAX:
        rule.max = ruleConfig.value
        rule.message = ruleConfig.message || `${label}不能大于${ruleConfig.value}`
        break
      
      case VALIDATION_TYPES.MIN_LENGTH:
        rule.min = ruleConfig.value
        rule.message = ruleConfig.message || `${label}长度不能少于${ruleConfig.value}个字符`
        break
      
      case VALIDATION_TYPES.MAX_LENGTH:
        rule.max = ruleConfig.value
        rule.message = ruleConfig.message || `${label}长度不能超过${ruleConfig.value}个字符`
        break
      
      case VALIDATION_TYPES.PATTERN:
        rule.pattern = typeof ruleConfig.value === 'string' 
          ? new RegExp(ruleConfig.value) 
          : ruleConfig.value
        rule.message = ruleConfig.message || `${label}格式不正确`
        break
      
      case VALIDATION_TYPES.ENUM:
        rule.type = 'enum'
        rule.enum = ruleConfig.value
        rule.message = ruleConfig.message || `${label}必须是${ruleConfig.value.join('、')}之一`
        break
      
      case VALIDATION_TYPES.CUSTOM:
        if (ruleConfig.validator) {
          rule.validator = this.wrapCustomValidator(ruleConfig.validator)
        }
        rule.message = ruleConfig.message || `${label}校验失败`
        break
      
      default:
        Object.assign(rule, ruleConfig)
    }

    rule.trigger = ruleConfig.trigger || TRIGGER_TYPES.BLUR

    return rule
  }

  wrapCustomValidator(validatorFn) {
    return (rule, value, callback) => {
      try {
        const result = validatorFn(value, rule)
        if (result === true) {
          callback()
        } else if (typeof result === 'string') {
          callback(new Error(result))
        } else {
          callback(new Error('校验失败'))
        }
      } catch (error) {
        callback(error)
      }
    }
  }

  validate(value, formData) {
    return new Promise((resolve) => {
      const errors = []
      
      this.rules.forEach(rule => {
        const error = this.validateRule(rule, value, formData)
        if (error) {
          errors.push(error)
        }
      })

      resolve(errors.length > 0 ? errors : null)
    })
  }

  validateRule(rule, value, formData) {
    if (rule.validator) {
      return new Promise((resolve) => {
        rule.validator(rule, value, (error) => {
          resolve(error ? error.message : null)
        }, formData)
      })
    }

    if (rule.required) {
      if (value === undefined || value === null || value === '') {
        return Promise.resolve(rule.message)
      }
      if (Array.isArray(value) && value.length === 0) {
        return Promise.resolve(rule.message)
      }
    }

    if (rule.type === VALIDATION_TYPES.MIN && typeof value === 'number') {
      if (value < rule.value) {
        return Promise.resolve(rule.message)
      }
    }

    if (rule.type === VALIDATION_TYPES.MAX && typeof value === 'number') {
      if (value > rule.value) {
        return Promise.resolve(rule.message)
      }
    }

    if (rule.type === VALIDATION_TYPES.MIN_LENGTH && typeof value === 'string') {
      if (value.length < rule.value) {
        return Promise.resolve(rule.message)
      }
    }

    if (rule.type === VALIDATION_TYPES.MAX_LENGTH && typeof value === 'string') {
      if (value.length > rule.value) {
        return Promise.resolve(rule.message)
      }
    }

    if (rule.type === VALIDATION_TYPES.PATTERN && rule.pattern) {
      if (!rule.pattern.test(value)) {
        return Promise.resolve(rule.message)
      }
    }

    if (rule.type === VALIDATION_TYPES.ENUM && Array.isArray(rule.value)) {
      if (!rule.value.includes(value)) {
        return Promise.resolve(rule.message)
      }
    }

    return Promise.resolve(null)
  }

  getRules() {
    return this.rules
  }
}

export function createValidator(schema) {
  return new SchemaValidator(schema)
}
