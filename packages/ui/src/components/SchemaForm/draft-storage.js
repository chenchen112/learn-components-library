const DB_NAME = "SchemaFormDraftDB";
const DB_VERSION = 1;
const STORE_NAME = "drafts";

class DraftStorage {
  constructor() {
    this.db = null;
    this.isIndexedDBSupported = this.checkIndexedDBSupport();
    this.isLocalStorageSupported = this.checkLocalStorageSupport();
  }

  checkIndexedDBSupport() {
    try {
      return "indexedDB" in window && window.indexedDB !== null;
    } catch (e) {
      return false;
    }
  }

  checkLocalStorageSupport() {
    try {
      const test = "__test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  async init() {
    if (!this.isIndexedDBSupported) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.warn("IndexedDB init failed, will fallback to localStorage");
        this.isIndexedDBSupported = false;
        resolve();
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
      };
    });
  }

  async save(key, data, excludeFields = []) {
    const processedData = this.processData(data, excludeFields);
    const draftData = {
      key,
      data: processedData,
      timestamp: Date.now(),
    };

    if (this.isIndexedDBSupported && this.db) {
      return this.saveToIndexedDB(draftData);
    } else if (this.isLocalStorageSupported) {
      return this.saveToLocalStorage(draftData);
    } else {
      console.warn("No storage available");
      return false;
    }
  }

  async load(key) {
    if (this.isIndexedDBSupported && this.db) {
      return this.loadFromIndexedDB(key);
    } else if (this.isLocalStorageSupported) {
      return this.loadFromLocalStorage(key);
    } else {
      return null;
    }
  }

  async remove(key) {
    if (this.isIndexedDBSupported && this.db) {
      return this.removeFromIndexedDB(key);
    } else if (this.isLocalStorageSupported) {
      return this.removeFromLocalStorage(key);
    } else {
      return false;
    }
  }

  async clear() {
    if (this.isIndexedDBSupported && this.db) {
      return this.clearIndexedDB();
    } else if (this.isLocalStorageSupported) {
      return this.clearLocalStorage();
    } else {
      return false;
    }
  }

  processData(data, excludeFields = []) {
    if (!data || typeof data !== "object") {
      return data;
    }

    const processed = Array.isArray(data) ? [] : {};

    for (const key in data) {
      if (excludeFields.includes(key)) {
        continue;
      }

      const value = data[key];
      if (value && typeof value === "object") {
        processed[key] = this.processData(value, excludeFields);
      } else {
        processed[key] = value;
      }
    }

    return processed;
  }

  async saveToIndexedDB(draftData) {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(draftData);

        request.onsuccess = () => resolve(true);
        request.onerror = () => {
          console.warn("Save to IndexedDB failed");
          resolve(false);
        };
      } catch (error) {
        console.warn("IndexedDB operation error:", error);
        resolve(false);
      }
    });
  }

  async loadFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = (event) => {
          const result = event.target.result;
          resolve(result ? result.data : null);
        };
        request.onerror = () => {
          console.warn("Load from IndexedDB failed");
          resolve(null);
        };
      } catch (error) {
        console.warn("IndexedDB operation error:", error);
        resolve(null);
      }
    });
  }

  async removeFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);

        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      } catch (error) {
        console.warn("IndexedDB operation error:", error);
        resolve(false);
      }
    });
  }

  async clearIndexedDB() {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      } catch (error) {
        console.warn("IndexedDB operation error:", error);
        resolve(false);
      }
    });
  }

  saveToLocalStorage(draftData) {
    try {
      const key = `schema_form_draft_${draftData.key}`;
      localStorage.setItem(key, JSON.stringify(draftData));
      return Promise.resolve(true);
    } catch (error) {
      console.warn("Save to localStorage failed:", error);
      return Promise.resolve(false);
    }
  }

  loadFromLocalStorage(key) {
    try {
      const storageKey = `schema_form_draft_${key}`;
      const data = localStorage.getItem(storageKey);
      const parsed = data ? JSON.parse(data) : null;
      return Promise.resolve(parsed ? parsed.data : null);
    } catch (error) {
      console.warn("Load from localStorage failed:", error);
      return Promise.resolve(null);
    }
  }

  removeFromLocalStorage(key) {
    try {
      const storageKey = `schema_form_draft_${key}`;
      localStorage.removeItem(storageKey);
      return Promise.resolve(true);
    } catch (error) {
      console.warn("Remove from localStorage failed:", error);
      return Promise.resolve(false);
    }
  }

  clearLocalStorage() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("schema_form_draft_")) {
          localStorage.removeItem(key);
        }
      });
      return Promise.resolve(true);
    } catch (error) {
      console.warn("Clear localStorage failed:", error);
      return Promise.resolve(false);
    }
  }

  getStorageType() {
    if (this.isIndexedDBSupported && this.db) {
      return "IndexedDB";
    } else if (this.isLocalStorageSupported) {
      return "localStorage";
    } else {
      return "none";
    }
  }
}

let draftStorageInstance = null;

export async function getDraftStorage() {
  if (!draftStorageInstance) {
    draftStorageInstance = new DraftStorage();
    await draftStorageInstance.init();
  }
  return draftStorageInstance;
}

export { DraftStorage };
