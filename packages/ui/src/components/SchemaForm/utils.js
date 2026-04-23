export function getValueByPath(obj, path) {
  if (!obj || !path) {
    return undefined;
  }

  const keys = Array.isArray(path) ? path : path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return undefined;
    }
    result = result[key];
  }

  return result;
}

export function setValueByPath(obj, path, value) {
  if (!obj || !path) {
    return obj;
  }

  const keys = Array.isArray(path) ? path : path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return obj;
}

export function deleteValueByPath(obj, path) {
  if (!obj || !path) {
    return obj;
  }

  const keys = Array.isArray(path) ? path : path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      return obj;
    }
    current = current[key];
  }

  delete current[keys[keys.length - 1]];
  return obj;
}

export function deepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item));
  }

  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }

  return cloned;
}

export function deepMerge(target, source) {
  if (!source) {
    return target;
  }

  if (!target) {
    return deepClone(source);
  }

  const result = deepClone(target);

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(result[key], source[key]);
      } else {
        result[key] = deepClone(source[key]);
      }
    }
  }

  return result;
}

export function flattenObject(obj, prefix = "") {
  const result = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (value && typeof value === "object" && !Array.isArray(value)) {
        Object.assign(result, flattenObject(value, newKey));
      } else {
        result[newKey] = value;
      }
    }
  }

  return result;
}

export function unflattenObject(obj) {
  const result = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      setValueByPath(result, key, obj[key]);
    }
  }

  return result;
}

export function isEmpty(value) {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  return false;
}

export function generateId() {
  return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
