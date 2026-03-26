// lib/serverFetch.js
import { cookies } from "next/headers";

export async function serverFetch(route, options = {}) {
  const cookieStore = await cookies();
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}${route}`;

  const label = `FETCH ${route}`;

  console.time(label); // ⏱️ start timer

  const res = await fetch(url, {
    cache: "no-store",
    ...options,
    headers: {
      ...(options.headers || {}),
      Cookie: cookieStore.toString(),
    },
  });

  console.timeEnd(label); // ⏱️ end timer (after fetch)

  if (!res.ok) {
    const text = await res.text();
    console.error("API ERROR:", res.status, text);
    throw new Error(`API failed: ${res.status}`);
  }

  return res;
}
