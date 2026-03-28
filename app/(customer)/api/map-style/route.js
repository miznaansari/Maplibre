// export async function GET() {
//   const API_KEY = process.env.NEXT_PUBLIC_OLAMAP_API_KEY;

//   const res = await fetch(
//     `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=${API_KEY}`
//   );

//   if (!res.ok) {
//     return Response.json(
//       { error: "Failed to fetch style", status: res.status },
//       { status: res.status }
//     );
//   }

//   const data = await res.json();

//   return Response.json(data);
// }
export async function GET() {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_OLAMAP_API_KEY;
    const res = await fetch(
      `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=${API_KEY}`
    );

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch style" }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}