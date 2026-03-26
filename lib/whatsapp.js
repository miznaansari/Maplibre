import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode";
import { prisma } from "@/lib/prisma";

if (!global.whatsapp) {
  global.whatsapp = {
    client: null,
    ready: false,
  };
}

export function initWhatsApp() {
  if (global.whatsapp.client) {
    return global.whatsapp.client;
  }

  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: ".wwebjs_auth",
    }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  /* QR EVENT */
  client.on("qr", async (qr) => {
    console.log("📱 Scan QR in admin panel");

    const qrImage = await qrcode.toDataURL(qr);

    await prisma.whatsAppSession.upsert({
      where: { id: 1 },
      update: {
        last_qr: qrImage,
        is_connected: false,
      },
      create: {
        id: 1,
        last_qr: qrImage,
      },
    });
  });

  /* READY EVENT */
  client.on("ready", async () => {
    console.log("✅ WhatsApp READY");

    global.whatsapp.ready = true;

    const info = client.info;

    await prisma.whatsAppSession.upsert({
      where: { id: 1 },
      update: {
        is_connected: true,
        phone_number: info.wid.user,
        last_connected_at: new Date(),
        last_qr: null,
      },
      create: {
        id: 1,
        is_connected: true,
        phone_number: info.wid.user,
        last_connected_at: new Date(),
      },
    });
  });

  /* DISCONNECT EVENT */
  client.on("disconnected", async (reason) => {
    console.log("❌ WhatsApp Disconnected:", reason);

    global.whatsapp.ready = false;

    await prisma.whatsAppSession.update({
      where: { id: 1 },
      data: {
        is_connected: false,
        disconnect_reason: reason,
        last_disconnected_at: new Date(),
      },
    });
  });

  client.initialize();

  global.whatsapp.client = client;

  return client;
}

/* SEND MESSAGE */

export async function sendWhatsAppMessage(phone, message) {
  if (!global.whatsapp.client) {
    initWhatsApp();
  }

  const client = global.whatsapp.client;

  if (!global.whatsapp.ready) {
    console.log("⏳ Waiting for WhatsApp ready...");

    await new Promise((resolve) => {
      client.once("ready", resolve);
    });
  }

  const chatId = `${phone}@c.us`;

  return client.sendMessage(chatId, message);
}