import { saveCafes, getCafesInBounds } from "@/lib/indexedDB";

const fetchData = async () => {
  const boundsObj = {
    north: map.getBounds().getNorth(),
    south: map.getBounds().getSouth(),
    east: map.getBounds().getEast(),
    west: map.getBounds().getWest(),
  };

  const zoom = map.getZoom();
  const requestId = Date.now();

  // 🔥 1. CHECK INDEXED DB FIRST
  const cacheStart = performance.now();
  const cached = await getCafesInBounds(boundsObj);
  const cacheTime = Math.round(performance.now() - cacheStart);

  if (cached.length > 50) {
    // ✅ CACHE HIT
    setApiLogs((prev) => [
      {
        id: requestId,
        url: "indexedDB",
        status: "cache-hit",
        time: cacheTime,
      },
      ...prev.slice(0, 5),
    ]);

    setCafes((prev) => {
      const mapData = new Map(prev.map((c) => [c.id, c]));
      cached.forEach((c) => mapData.set(c.id, c));
      return Array.from(mapData.values());
    });

    setLoading(false);
    return; // 🚀 STOP API CALL
  }

  // ❌ CACHE MISS
  setApiLogs((prev) => [
    {
      id: requestId,
      url: "indexedDB",
      status: "cache-miss",
      time: cacheTime,
    },
    ...prev.slice(0, 5),
  ]);

  // 🔥 2. API CALL
  const url = `/api/map/get?north=${boundsObj.north}&south=${boundsObj.south}&east=${boundsObj.east}&west=${boundsObj.west}&zoom=${zoom}`;

  const start = performance.now();

  setApiLogs((prev) => [
    {
      id: requestId,
      url: "api/map/get",
      status: "pending",
      time: null,
    },
    ...prev.slice(0, 5),
  ]);

  try {
    const res = await fetch(url);
    const data = await res.json();

    const duration = Math.round(performance.now() - start);

    // ✅ success log
    setApiLogs((prev) =>
      prev.map((log) =>
        log.id === requestId
          ? { ...log, status: "success", time: duration }
          : log
      )
    );

    // 🔥 STORE IN INDEXED DB
    await saveCafes(data.cafes);

    setCafes((prev) => {
      const mapData = new Map(prev.map((c) => [c.id, c]));
      data.cafes.forEach((c) => mapData.set(c.id, c));
      return Array.from(mapData.values());
    });

    setLoading(false);
  } catch (err) {
    const duration = Math.round(performance.now() - start);

    setApiLogs((prev) =>
      prev.map((log) =>
        log.id === requestId
          ? { ...log, status: "error", time: duration }
          : log
      )
    );

    console.error(err);
    setLoading(false);
  }
};