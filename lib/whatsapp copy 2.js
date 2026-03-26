import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

if (!global.whatsapp) {
  global.whatsapp = {
    client: null,
    ready: false,
  };
}

export function initWhatsApp() {
  console.log("🚀 initWhatsApp() called");

  if (global.whatsapp.client) {
    console.log("⚠️ WhatsApp client already exists");
    return global.whatsapp.client;
  }

  console.log("🟡 Creating new WhatsApp client...");

  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: ".wwebjs_auth",
    }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("qr", (qr) => {
    console.log("📱 QR RECEIVED - Scan to login");
    qrcode.generate(qr, { small: true });
  });

  client.on("authenticated", () => {
    console.log("🔐 WhatsApp authenticated successfully");
  });

  client.on("auth_failure", (msg) => {
    console.log("❌ Authentication failed:", msg);
  });

  client.on("loading_screen", (percent, message) => {
    console.log(`⏳ Loading WhatsApp: ${percent}% - ${message}`);
  });

  client.on("ready", () => {
    console.log("✅ WhatsApp READY");
    global.whatsapp.ready = true;
  });

  client.on("disconnected", (reason) => {
    console.log("⚠️ WhatsApp disconnected:", reason);
    global.whatsapp.ready = false;
  });

  client.on("message", (msg) => {
    console.log("📩 Message received:", msg.body);
  });

  console.log("⚡ Initializing WhatsApp client...");
  client.initialize();

  global.whatsapp.client = client;

  return client;
}

export async function sendWhatsAppMessage(phone, message) {
  console.log("📤 sendWhatsAppMessage() called");
  console.log("📞 Phone:", phone);
  console.log("💬 Message:", message);

  if (!global.whatsapp.client) {
    console.log("⚠️ WhatsApp client not initialized. Initializing...");
    initWhatsApp();
  }

  const client = global.whatsapp.client;

  if (!global.whatsapp.ready) {
    console.log("⏳ Waiting for WhatsApp to be ready...");
    await new Promise((resolve) => {
      client.once("ready", () => {
        console.log("✅ WhatsApp is now ready");
        resolve();
      });
    });
  }

  const chatId = `${phone}@c.us`;
  console.log("📨 Sending message to:", chatId);

  try {
    const result = await client.sendMessage(chatId, message);
    console.log("✅ Message sent successfully");
    return result;
  } catch (error) {
    console.error("❌ Failed to send message:", error);
    throw error;
  }
}