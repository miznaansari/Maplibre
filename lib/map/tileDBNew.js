const DB_NAME = "MapCacheDB";
const VISIT_STORE_NAME = "visit_logs";
const CAFE_STORE_NAME = "cafes";
const LEGACY_TILE_STORE_NAME = "tiles";
const DB_VERSION = 3;

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

          if (db.objectStoreNames.contains(LEGACY_TILE_STORE_NAME)) {
            db.deleteObjectStore(LEGACY_TILE_STORE_NAME);
          }

          if (!db.objectStoreNames.contains(VISIT_STORE_NAME)) {
            const visitStore = db.createObjectStore(VISIT_STORE_NAME, {
              keyPath: "id",
            });
            visitStore.createIndex("routeKey", "routeKey", { unique: false });
            visitStore.createIndex("createdAt", "createdAt", { unique: false });
          }

          if (!db.objectStoreNames.contains(CAFE_STORE_NAME)) {
            db.createObjectStore(CAFE_STORE_NAME, { keyPath: "id" });
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

        if (
          !db.objectStoreNames.contains(VISIT_STORE_NAME) ||
          !db.objectStoreNames.contains(CAFE_STORE_NAME)
        ) {
          console.warn("Map cache stores missing. Attempting safe recovery.");

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
export async function getLatestSuccessfulVisit(routeKey) {
  if (typeof routeKey !== "string" || routeKey.length === 0) {
    return null;
  }

  const db = await openTileDB();
  if (!db) {
    return null;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(VISIT_STORE_NAME, "readonly");
      const store = tx.objectStore(VISIT_STORE_NAME);
      const index = store.index("routeKey");

      const req = index.getAll(IDBKeyRange.only(routeKey));
      req.onsuccess = () => {
        const rows = Array.isArray(req.result) ? req.result : [];
        const latestSuccess = rows
          .filter((row) => row?.status === "success")
          .sort((a, b) => Number(b?.createdAt || 0) - Number(a?.createdAt || 0))[0];
        resolve(latestSuccess || null);
      };
      req.onerror = () => resolve(null);

      tx.onabort = () => resolve(null);
      tx.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveVisitLog(entry) {
  const routeKey = String(entry?.routeKey ?? "");
  if (!routeKey) {
    return false;
  }

  const db = await openTileDB();
  if (!db) {
    return false;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(VISIT_STORE_NAME, "readwrite");
      const store = tx.objectStore(VISIT_STORE_NAME);

      const createdAt = Number(entry?.createdAt) || Date.now();
      const id = `${createdAt}_${Math.random().toString(36).slice(2, 8)}`;

      const value = {
        id,
        routeType: String(entry?.routeType || "tile"),
        routeKey,
        status: entry?.status === "success" ? "success" : "fail",
        responseTimeMs:
          Number.isFinite(entry?.responseTimeMs) && entry.responseTimeMs >= 0
            ? Math.round(entry.responseTimeMs)
            : null,
        cafeIds: Array.isArray(entry?.cafeIds)
          ? Array.from(
              new Set(
                entry.cafeIds
                  .map((idValue) => String(idValue ?? "").trim())
                  .filter(Boolean)
              )
            )
          : [],
        createdAt,
      };

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);

      store.put(value);
    } catch {
      resolve(false);
    }
  });
}

function normalizeCafe(cafe) {
  const id = String(cafe?.id ?? "").trim();
  const name = String(cafe?.name ?? "").trim();
  const image = String(cafe?.image ?? "").trim();
  const lat = Number(cafe?.lat);
  const lng = Number(cafe?.lng);

  if (!id) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    id,
    name,
    image,
    lat,
    lng,
    updatedAt: Date.now(),
  };
}

export async function saveCafesBatch(cafes) {
  if (!Array.isArray(cafes) || cafes.length === 0) {
    return false;
  }

  const db = await openTileDB();
  if (!db) {
    return false;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(CAFE_STORE_NAME, "readwrite");
      const store = tx.objectStore(CAFE_STORE_NAME);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);

      cafes.forEach((cafe) => {
        const normalized = normalizeCafe(cafe);
        if (normalized) {
          store.put(normalized);
        }
      });
    } catch {
      resolve(false);
    }
  });
}

export async function getCafesByIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return [];
  }

  const db = await openTileDB();
  if (!db) {
    return [];
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(CAFE_STORE_NAME, "readonly");
      const store = tx.objectStore(CAFE_STORE_NAME);
      const uniqueIds = Array.from(
        new Set(ids.map((id) => String(id ?? "").trim()).filter(Boolean))
      );

      Promise.all(
        uniqueIds.map(
          (id) =>
            new Promise((idResolve) => {
              const req = store.get(id);
              req.onsuccess = () => idResolve(req.result || null);
              req.onerror = () => idResolve(null);
            })
        )
      )
        .then((rows) => {
          resolve(rows.filter(Boolean));
        })
        .catch(() => {
          resolve([]);
        });

      tx.onabort = () => resolve([]);
      tx.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}