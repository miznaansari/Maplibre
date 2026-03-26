import { NextRequest } from "next/server";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("Secure Vercel cron executed");

  return Response.json({ success: true });
}
