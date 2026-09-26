import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from "@whiskeysockets/baileys";
import pino from "pino";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, "baileys_auth_info");

export class RealWhatsAppService {
  constructor(db, botEngine, io) {
    this.db = db;
    this.botEngine = botEngine;
    this.io = io;
    this.sock = null;
    this.qrCodeData = "";
    this.connectionStatus = "DISCONNECTED"; // DISCONNECTED | SCAN_QR | CONNECTING | CONNECTED
    this.connectedPhone = "";
    this.pairingCode = "";
  }

  // Initialize WhatsApp Socket
  async initialize(usePairingPhone = null) {
    try {
      if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
      const { version, isLatest } = await fetchLatestBaileysVersion();
      console.log(`Using WA Baileys v${version.join(".")}, isLatest: ${isLatest}`);

      const logger = pino({ level: "silent" }); // suppress verbose logs

      this.sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: true,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        generateHighQualityLinkPreview: true,
        browser: ["FlowWA SaaS", "Chrome", "120.0.0.0"]
      });

      // If user wants 8-digit Pairing Code without QR
      if (usePairingPhone && !this.sock.authState.creds.registered) {
        setTimeout(async () => {
          try {
            const cleanPhone = usePairingPhone.replace(/[^0-9]/g, "");
            const code = await this.sock.requestPairingCode(cleanPhone);
            this.pairingCode = code;
            console.log(`Generated Real WhatsApp Pairing Code: ${code}`);
            this.io.emit("whatsapp_pairing_code", { code });
          } catch (err) {
            console.error("Failed to request pairing code:", err);
          }
        }, 3000);
      }

      // Save credentials when updated
      this.sock.ev.on("creds.update", saveCreds);

      // Connection update handler
      this.sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          try {
            this.qrCodeData = await QRCode.toDataURL(qr, {
              margin: 2,
              width: 320,
              color: { dark: "#0F172A", light: "#FFFFFF" }
            });
            this.connectionStatus = "SCAN_QR";
            console.log("👉 New Real WhatsApp QR Generated. Scan with your phone!");
            this.io.emit("whatsapp_qr_updated", { qrCode: this.qrCodeData, status: "SCAN_QR" });
          } catch (err) {
            console.error("Error creating QR DataURL:", err);
          }
        }

        if (connection === "connecting") {
          this.connectionStatus = "CONNECTING";
          this.io.emit("whatsapp_status_changed", { status: "CONNECTING" });
        }

        if (connection === "open") {
          this.connectionStatus = "CONNECTED";
          const rawJid = this.sock.user?.id || "";
          const phoneNum = rawJid.split(":")[0] || rawJid.split("@")[0] || "628xxx";
          this.connectedPhone = phoneNum;

          this.db.storeSettings.status = "CONNECTED";
          this.db.storeSettings.phoneNumber = phoneNum;
          this.db.storeSettings.deviceInfo = {
            name: this.sock.user?.name || "WhatsApp Connected Device",
            platform: "WhatsApp Multi-Device (Real Baileys)",
            battery: "100%",
            connectedSince: new Date().toISOString()
          };

          console.log(`✅ Real WhatsApp Connected successfully as +${phoneNum}!`);
          this.io.emit("whatsapp_status_changed", {
            status: "CONNECTED",
            phoneNumber: phoneNum,
            deviceInfo: this.db.storeSettings.deviceInfo
          });
          this.io.emit("settings_updated", this.db.storeSettings);
        }

        if (connection === "close") {
          const statusCode = (lastDisconnect?.error)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          console.log(`Connection closed due to statusCode ${statusCode}. Reconnecting: ${shouldReconnect}`);

          this.connectionStatus = "DISCONNECTED";
          this.db.storeSettings.status = "DISCONNECTED";
          this.io.emit("whatsapp_status_changed", { status: "DISCONNECTED" });

          if (shouldReconnect) {
            setTimeout(() => this.initialize(), 4000);
          } else {
            console.log("Logged out from WhatsApp. Clear session auth.");
            this.clearSession();
          }
        }
      });

      // Handle Real Incoming Messages from real WhatsApp users!
      this.sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;

        for (const msg of messages) {
          if (!msg.message || msg.key.fromMe) continue; // Skip bot's own messages

          const remoteJid = msg.key.remoteJid;
          if (!remoteJid || remoteJid.includes("@g.us") || remoteJid === "status@broadcast") {
            continue; // Skip group chats or status updates for now
          }

          // Extract text
          const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            "";

          if (!text.trim()) continue;

          const senderPhone = remoteJid.split("@")[0];
          const senderName = msg.pushName || `WA User (${senderPhone})`;

          console.log(`📩 Real WhatsApp Message Received from +${senderPhone} (${senderName}): "${text}"`);

          // 1. Sync to Chat Inbox
          let chat = this.db.chats.find((c) => c.phone === senderPhone);
          if (!chat) {
            chat = {
              id: `chat-${senderPhone}`,
              contactName: senderName,
              phone: senderPhone,
              lastMessage: text,
              lastTime: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
              unread: 0,
              botActive: true,
              messages: []
            };
            this.db.chats.unshift(chat);
          }

          const userMsg = {
            id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            sender: "customer",
            text: text,
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            status: "read"
          };
          chat.messages.push(userMsg);
          chat.lastMessage = text;
          chat.lastTime = userMsg.time;

          this.io.emit("chat_message_received", { phone: senderPhone, message: userMsg, chat });

          // 2. Process with AI / NLP Bot Engine & Send Real Reply
          if (chat.botActive && this.db.storeSettings.autoReplyEnabled) {
            try {
              const botResponse = await this.botEngine.processIncomingMessage(senderPhone, senderName, text);

              if (botResponse && botResponse.replyText) {
                // Send Real WhatsApp Message back to sender's phone!
                await this.sock.sendMessage(remoteJid, { text: botResponse.replyText });
                console.log(`🤖 Auto-replied to +${senderPhone} via WhatsApp`);

                const botMsg = {
                  id: `m-bot-${Date.now()}`,
                  sender: "bot",
                  text: botResponse.replyText,
                  time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                  status: "delivered"
                };
                chat.messages.push(botMsg);
                chat.lastMessage = botResponse.replyText;
                chat.lastTime = botMsg.time;

                this.io.emit("chat_message_received", { phone: senderPhone, message: botMsg, chat });

                // If an order was created, alert the dashboard & checklist!
                if (botResponse.orderCreated) {
                  this.io.emit("new_order_created", botResponse.orderCreated);
                  this.io.emit("orders_list_updated", this.db.orders);
                }
              }
            } catch (err) {
              console.error("Error processing bot auto-reply:", err);
            }
          }
        }
      });
    } catch (error) {
      console.error("Failed to initialize Real WhatsApp socket:", error);
    }
  }

  // Send real WhatsApp message to any phone number
  async sendMessage(phone, text) {
    if (!this.sock || this.connectionStatus !== "CONNECTED") {
      console.warn("Cannot send WhatsApp message: Socket is not connected");
      return false;
    }

    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("08")) {
      cleanPhone = "62" + cleanPhone.substring(1);
    }
    const jid = `${cleanPhone}@s.whatsapp.net`;

    try {
      await this.sock.sendMessage(jid, { text });
      console.log(`📤 Sent real WhatsApp message to ${jid}`);
      return true;
    } catch (err) {
      console.error(`Failed to send WhatsApp message to ${jid}:`, err);
      return false;
    }
  }

  // Disconnect & logout
  async logout() {
    try {
      if (this.sock) {
        await this.sock.logout();
      }
      this.clearSession();
      this.connectionStatus = "DISCONNECTED";
      this.db.storeSettings.status = "DISCONNECTED";
      this.io.emit("whatsapp_status_changed", { status: "DISCONNECTED" });
      setTimeout(() => this.initialize(), 2000);
      return true;
    } catch (err) {
      console.error("Error during logout:", err);
      return false;
    }
  }

  clearSession() {
    try {
      if (fs.existsSync(AUTH_DIR)) {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        console.log("Cleared Baileys auth session directory.");
      }
    } catch (e) {
      console.error("Error clearing auth directory:", e);
    }
  }
}
