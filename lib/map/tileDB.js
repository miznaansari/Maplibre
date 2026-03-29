const DB_NAME = "MapCacheDB";
const STORE_NAME = "tiles";
const DB_VERSION = 2;

// 🔥 open DB
export function openTileDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    req.onsuccess = () => {
      const db = req.result;

      // 🔥 SAFETY CHECK (VERY IMPORTANT)
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.warn("⚠️ Store missing, recreating DB");

        db.close();
        indexedDB.deleteDatabase(DB_NAME);

        // 🔥 reopen (recursive)
        resolve(openTileDB());
        return;
      }

      resolve(db);
    };

    req.onerror = () => reject(req.error);
  });
}
// 🔥 get tile
export async function getTile(key) {
  const db = await openTileDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

// 🔥 save tile
export async function saveTile(key, data) {
  const db = await openTileDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put({ key, data, ts: Date.now() });
}