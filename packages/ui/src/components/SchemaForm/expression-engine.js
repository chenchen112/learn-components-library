import { LINKAGE_TYPES } from './types'

export class ExpressionEngine {
  constructor(formData) {
    this.formData = formData
    this.cache = new Map()
  }

  updateFormData(formData) {
    this.formData = formData
    this.cache.clear()
  }

  evaluate(expression, context = {}) {
    if (!expression) {
      return undefined
    }

    if (typeof expression !== 'string') {
      return expression
    }

    const cacheKey = `${expression}_${JSON.stringify(context)}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const func = new Function('formData', 'context', `
        with(formData) {
          with(context) {
            return ${expression}
          }
        }
      `)
      
      const result = func(this.formData, context)
      this.cache.set(cacheKey, result)
      return result
    } catch (error) {
      console.warn('Expression evaluation error:', error)
      return undefined
    }
  }

  evaluateCondition(condition, context = {}) {
    if (!condition) {
      return true
    }

    if (typeof condition === 'boolean') {
      return condition
    }

    if (typeof condition === 'string') {
      return this.evaluate(condition, context)
    }

    if (typeof condition === 'function') {
      return condition(this.formData, context)
    }

    return true
  }

  evaluateLinkage(linkageConfig, context = {}) {
    if (!linkageConfig) {
      return null
    }

    const result = {}

    if (linkageConfig[LINKAGE_TYPES.VALUE]) {
      result.value = this.evaluate(linkageConfig[LINKAGE_TYPES.VALUE], context)
    }

    if (linkageConfig[LINKAGE_TYPES.VISIBLE]) {
      result.visible = this.evaluateCondition(linkageConfig[LINKAGE_TYPES.VISIBLE], context)
    }

    if (linkageConfig[LINKAGE_TYPES.DISABLED]) {
      result.disabled = this.evaluateCondition(linkageConfig[LINKAGE_TYPES.DISABLED], context)
    }

    if (linkageConfig[LINKAGE_TYPES.OPTIONS]) {
      result.options = this.evaluate(linkageConfig[LINKAGE_TYPES.OPTIONS], context)
    }

    return result
  }

  clearCache() {
    this.cache.clear()
  }
}

export function createExpressionEngine(formData) {
  return new ExpressionEngine(formData)
}
