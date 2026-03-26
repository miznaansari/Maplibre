import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma"; // adjust path if needed
if (!global.whatsapp) {
  global.whatsapp = {
    client: null,
    ready: false,
    readyPromise: null,
    resolveReady: null,
  };
}

export function initWhatsApp() {
  // If already initialized, return existing promise
  if (global.whatsapp.client) {
    console.log("⚠️ WhatsApp already initialized");
    return global.whatsapp.readyPromise;
  }

  console.log("🚀 Starting WhatsApp client...");

  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: ".wwebjs_auth",
    }),
   puppeteer: {
  headless: true,
  executablePath: "/usr/bin/google-chrome",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-zygote",
    "--single-process",
  ],
},
  });

  // QR event
 client.on("qr", async (qr) => {
  console.log("📱 Scan this QR to login:");

  // Terminal QR
  qrcode.generate(qr, { small: true });

  // Convert QR to image/base64
  const qrImage = await QRCode.toDataURL(qr);

  // Save QR to database
  await prisma.whatsAppSession.upsert({
    where: { id: 1 },
    update: {
      last_qr: qrImage,
      is_connected: false,
    },
    create: {
      id: 1,
      last_qr: qrImage,
      is_connected: false,
      session_name: "default",
    },
  });
});

  // Ready event
 client.on("ready", async () => {
  console.log("✅ WhatsApp READY");

  global.whatsapp.ready = true;

  const info = client.info;

  await prisma.whatsAppSession.update({
    where: { id: 1 },
    data: {
      is_connected: true,
      phone_number: info?.wid?.user,
      last_connected_at: new Date(),
      last_qr: null,
    },
  });

  if (global.whatsapp.resolveReady) {
    global.whatsapp.resolveReady(client);
    global.whatsapp.resolveReady = null;
  }
});

  // Disconnect event
client.on("disconnected", async (reason) => {
  console.log("⚠️ WhatsApp disconnected:", reason);

  global.whatsapp.ready = false;

  await prisma.whatsAppSession.update({
    where: { id: 1 },
    data: {
      is_connected: false,
      last_disconnected_at: new Date(),
      disconnect_reason: reason,
    },
  });
});

  client.initialize();

  global.whatsapp.client = client;

  // Promise that resolves when ready
  global.whatsapp.readyPromise = new Promise((resolve) => {
    if (global.whatsapp.ready) resolve(client);
    else global.whatsapp.resolveReady = resolve;
  });

  return global.whatsapp.readyPromise;
}

export async function sendWhatsAppMessage(phone, message) {
  console.log("📤 sendWhatsAppMessage()");

  const client = await initWhatsApp();

  const chatId = `${phone}@c.us`;

  console.log("📨 Sending to:", chatId);

  try {
    const result = await client.sendMessage(chatId, message);
    console.log("✅ Message sent");
    return result;
  } catch (error) {
    console.error("❌ Failed to send message:", error);
    throw error;
  }
}