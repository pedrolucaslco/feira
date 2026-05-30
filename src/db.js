function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("items")) {
        db.createObjectStore("items", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("purchases")) {
        db.createObjectStore("purchases", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("purchaseSessions")) {
        db.createObjectStore("purchaseSessions", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("meals")) {
        db.createObjectStore("meals", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("categories")) {
        db.createObjectStore("categories", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("spaces")) {
        db.createObjectStore("spaces", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("syncOutbox")) {
        db.createObjectStore("syncOutbox", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("syncMeta")) {
        db.createObjectStore("syncMeta", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("syncConflicts")) {
        db.createObjectStore("syncConflicts", { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function store(name, mode = "readonly") {
  return state.db.transaction(name, mode).objectStore(name);
}

function getAll(name) {
  return new Promise((resolve, reject) => {
    const request = store(name).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getOne(name, id) {
  return new Promise((resolve, reject) => {
    const request = store(name).get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function putOne(name, value) {
  return new Promise((resolve, reject) => {
    const request = store(name, "readwrite").put(value);
    request.onsuccess = () => resolve(value);
    request.onerror = () => reject(request.error);
  });
}

function deleteOne(name, id) {
  return new Promise((resolve, reject) => {
    const request = store(name, "readwrite").delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function clearStore(name) {
  return new Promise((resolve, reject) => {
    const request = store(name, "readwrite").clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function bulkPut(name, values) {
  return new Promise((resolve, reject) => {
    const transaction = state.db.transaction(name, "readwrite");
    const objectStore = transaction.objectStore(name);
    values.forEach((value) => objectStore.put(value));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
