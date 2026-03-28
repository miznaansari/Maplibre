const DB_NAME = "MapCacheDB";
const STORE_NAME = "cafes";
const DB_VERSION = 1;

// 🔥 Open DB
export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
        store.createIndex("lat", "lat");
        store.createIndex("lng", "lng");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 🔥 Save cafes
export async function saveCafes(cafes) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  cafes.forEach((cafe) => store.put(cafe));

  return tx.complete;
}

// 🔥 Get cafes inside bounds
export async function getCafesInBounds(bounds) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const request = store.getAll();

    request.onsuccess = () => {
      let all = request.result;

      // ✅ FIX 1: ensure array
      if (!Array.isArray(all)) {
        console.warn("IndexedDB returned non-array:", all);
        all = [];
      }

      // ✅ FIX 2: safe filtering
      const filtered = all.filter(
        (c) =>
          c &&
          typeof c.lat === "number" &&
          typeof c.lng === "number" &&
          c.lat <= bounds.north &&
          c.lat >= bounds.south &&
          c.lng <= bounds.east &&
          c.lng >= bounds.west
      );

      resolve(filtered);
    };

    request.onerror = () => reject(request.error);
  });
}