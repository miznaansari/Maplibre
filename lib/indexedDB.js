const DB_NAME = "MapCacheDB";
const STORE_NAME = "cafes";
const DB_VERSION = 2;

let dbPromise = null;

function isIndexedDBAvailable() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function isValidBounds(bounds) {
  return (
    bounds &&
    typeof bounds.north === "number" &&
    typeof bounds.south === "number" &&
    typeof bounds.east === "number" &&
    typeof bounds.west === "number"
  );
}

function normalizeCafe(cafe) {
  if (!cafe || typeof cafe !== "object") return null;
  if (cafe.id == null) return null;

  const lat = Number(cafe.lat);
  const lng = Number(cafe.lng);

  return {
    ...cafe,
    lat: Number.isFinite(lat) ? lat : cafe.lat,
    lng: Number.isFinite(lng) ? lng : cafe.lng,
  };
}

// 🔥 Open DB
export function openDB() {
  if (!isIndexedDBAvailable()) {
    return Promise.resolve(null);
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve) => {
    let settled = false;

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      const finish = (db) => {
        if (settled) return;
        settled = true;
        resolve(db);
      };

      request.onupgradeneeded = () => {
        try {
          const db = request.result;
          let store;

          if (!db.objectStoreNames.contains(STORE_NAME)) {
            store = db.createObjectStore(STORE_NAME, {
              keyPath: "id",
            });
          } else {
            store = request.transaction.objectStore(STORE_NAME);
          }

          if (store && !store.indexNames.contains("lat")) {
            store.createIndex("lat", "lat");
          }

          if (store && !store.indexNames.contains("lng")) {
            store.createIndex("lng", "lng");
          }
        } catch (err) {
          console.warn("IndexedDB upgrade error:", err);
        }
      };

      request.onsuccess = () => {
        const db = request.result;

        db.onversionchange = () => {
          try {
            db.close();
          } catch {
            // no-op
          }
          dbPromise = null;
        };

        finish(db);
      };

      request.onerror = () => {
        console.warn("IndexedDB open error:", request.error);
        dbPromise = null;
        finish(null);
      };

      request.onblocked = () => {
        console.warn("IndexedDB open blocked by another tab/process.");
      };
    } catch (err) {
      console.warn("IndexedDB open threw:", err);
      dbPromise = null;
      finish(null);
    }
  });

  return dbPromise;
}

// 🔥 Save cafes
export async function saveCafes(cafes) {
  if (!Array.isArray(cafes) || cafes.length === 0) {
    return false;
  }

  const db = await openDB();
  if (!db) {
    return false;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => {
        console.warn("IndexedDB save transaction error:", tx.error);
        resolve(false);
      };
      tx.onabort = () => resolve(false);

      cafes.forEach((rawCafe) => {
        const cafe = normalizeCafe(rawCafe);
        if (!cafe) return;

        try {
          store.put(cafe);
        } catch (err) {
          console.warn("IndexedDB put failed for cafe:", cafe?.id, err);
        }
      });
    } catch (err) {
      console.warn("IndexedDB save failed:", err);
      resolve(false);
    }
  });
}


// 🔥 Get cafes inside bounds
export async function getCafesInBounds(bounds) {
  if (!isValidBounds(bounds)) {
    return [];
  }

  const db = await openDB();
  if (!db) {
    return [];
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        let all = request.result;

        if (!Array.isArray(all)) {
          console.warn("IndexedDB returned non-array:", all);
          all = [];
        }

        const filtered = all.filter((c) => {
          if (!c) return false;

          const lat = Number(c.lat);
          const lng = Number(c.lng);

          return (
            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            lat <= bounds.north &&
            lat >= bounds.south &&
            lng <= bounds.east &&
            lng >= bounds.west
          );
        });

        resolve(filtered);
      };

      request.onerror = () => {
        console.warn("IndexedDB read request error:", request.error);
        resolve([]);
      };

      tx.onerror = () => {
        console.warn("IndexedDB read transaction error:", tx.error);
        resolve([]);
      };
      tx.onabort = () => resolve([]);
    } catch (err) {
      console.warn("IndexedDB read failed:", err);
      resolve([]);
    }
  });
}