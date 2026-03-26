// lib/clientFetch.js
export async function clientFetch(route, options = {}) {
  const res = await fetch(route, {
    cache: "no-store",
    credentials: "include", // 🔥 cookies automatically send honge
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("API ERROR:", res.status, text);
    throw new Error(`API failed: ${res.status}`);
  }

  return res;
}
