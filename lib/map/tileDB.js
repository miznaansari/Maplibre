const DB_NAME = "MapCacheDB";
const STORE_NAME = "tiles";
const DB_VERSION = 2;

let dbPromise = null;
let recoverAttempts = 0;
const MAX_RECOVER_ATTEMPTS = 1;

function isIndexedDBAvailable() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function resetOpenCache() {
  dbPromise = null;
}

function deleteDatabaseSafe(name) {
  return new Promise((resolve) => {
    if (!isIndexedDBAvailable()) {
      resolve(false);
      return;
    }

    try {
      const req = indexedDB.deleteDatabase(name);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
      req.onblocked = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

// 🔥 open DB
export function openTileDB() {
  if (!isIndexedDBAvailable()) {
    return Promise.resolve(null);
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve) => {
    let settled = false;

    const finish = (db) => {
      if (settled) return;
      settled = true;
      resolve(db);
    };

    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = () => {
        try {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: "key" });
          }
        } catch (err) {
          console.warn("IndexedDB upgrade failed:", err);
        }
      };

      req.onsuccess = async () => {
        const db = req.result;

        db.onversionchange = () => {
          try {
            db.close();
          } catch {
            // no-op
          }
          resetOpenCache();
        };

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          console.warn("Tile store missing. Attempting safe recovery.");

          try {
            db.close();
          } catch {
            // no-op
          }

          resetOpenCache();

          if (recoverAttempts < MAX_RECOVER_ATTEMPTS) {
            recoverAttempts += 1;
            await deleteDatabaseSafe(DB_NAME);
            openTileDB().then(finish);
            return;
          }

          finish(null);
          return;
        }

        recoverAttempts = 0;
        finish(db);
      };

      req.onerror = () => {
        console.warn("IndexedDB open error:", req.error);
        resetOpenCache();
        finish(null);
      };

      req.onblocked = () => {
        console.warn("IndexedDB open blocked.");
      };
    } catch (err) {
      console.warn("IndexedDB open threw:", err);
      resetOpenCache();
      finish(null);
    }
  });

  return dbPromise;
}
// 🔥 get tile
export async function getTile(key) {
  if (typeof key !== "string" || key.length === 0) {
    return null;
  }

  const db = await openTileDB();
  if (!db) {
    return null;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);

      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);

      tx.onabort = () => resolve(null);
      tx.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// 🔥 save tile
export async function saveTile(key, data) {
  if (typeof key !== "string" || key.length === 0 || data == null) {
    return false;
  }

  const db = await openTileDB();
  if (!db) {
    return false;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);

      store.put({ key, data, ts: Date.now() });
    } catch {
      resolve(false);
    }
  });
}