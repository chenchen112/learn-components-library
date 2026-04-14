/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} wait 等待时间（毫秒）
 * @param {boolean} immediate 是否立即执行
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait, immediate = false) {
  let timeoutId = null
  
  return function(...args) {
    const context = this
    
    const later = function() {
      timeoutId = null
      if (!immediate) {
        func.apply(context, args)
      }
    }
    
    const callNow = immediate && !timeoutId
    
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(later, wait)
    
    if (callNow) {
      func.apply(context, args)
    }
  }
}

/**
 * 防抖函数（支持取消）
 * @param {Function} func 要防抖的函数
 * @param {number} wait 等待时间（毫秒）
 * @param {boolean} immediate 是否立即执行
 * @returns {Object} 包含防抖函数和取消方法的对象
 */
export function debounceWithCancel(func, wait, immediate = false) {
  let timeoutId = null
  
  const debounced = function(...args) {
    const context = this
    
    const later = function() {
      timeoutId = null
      if (!immediate) {
        func.apply(context, args)
      }
    }
    
    const callNow = immediate && !timeoutId
    
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(later, wait)
    
    if (callNow) {
      func.apply(context, args)
    }
  }
  
  debounced.cancel = function() {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
  
  return debounced
}