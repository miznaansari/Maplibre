const DB_NAME = "MapLogsDB";
const STORE_NAME = "logs";
const DB_VERSION = 1;

// 🔥 Open DB
export function openLogDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// 🔥 Add Log
export async function addLog(log) {
  const db = await openLogDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put(log);
}

// 🔥 Get All Logs
export async function getLogs() {
  const db = await openLogDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result.reverse());
  });
}

// 🔥 Clear Logs (optional)
export async function clearLogs() {
  const db = await openLogDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).clear();
}