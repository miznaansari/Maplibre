import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req) {
  try {
    const { phone, message } = await req.json();

    await sendWhatsAppMessage(phone, message);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
}