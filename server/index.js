import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import QRCode from "qrcode";
import { initialProducts, initialOrders, initialFlows, initialStoreSettings, initialChats } from "./mockData.js";
import { BotEngine } from "./botEngine.js";
import { RealWhatsAppService } from "./realWhatsApp.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }
});

app.use(cors());
app.use(express.json());

// In-Memory Database (Synced in real-time)
const db = {
  products: [...initialProducts],
  orders: [...initialOrders],
  flows: [...initialFlows],
  storeSettings: { 
    ...initialStoreSettings,
    status: "SIMULATED", // Start in simulated mode — bot replies always active
    simulatedMode: true,  // Simulator mode: bot replies without real WA connection
    phoneNumber: initialStoreSettings.phoneNumber || "6281234567890"
  },
  chats: [...initialChats]
};

const botEngine = new BotEngine(db);
const realWA = new RealWhatsAppService(db, botEngine, io);

// Start Real Baileys WhatsApp Engine
realWA.initialize();

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// 1. Store Settings & WhatsApp Status
app.get("/api/settings", (req, res) => {
  res.json(db.storeSettings);
});

app.put("/api/settings", (req, res) => {
  db.storeSettings = { ...db.storeSettings, ...req.body };
  io.emit("settings_updated", db.storeSettings);
  res.json({ success: true, data: db.storeSettings });
});

// Real QR code endpoint
app.get("/api/whatsapp/qr", async (req, res) => {
  res.json({
    qrCode: realWA.qrCodeData,
    status: realWA.connectionStatus,
    deviceInfo: db.storeSettings.deviceInfo,
    phoneNumber: realWA.connectedPhone
  });
});

// Pairing code endpoint (8-digit code for phone number)
app.post("/api/whatsapp/pair", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Nomor WhatsApp diperlukan" });
  
  await realWA.initialize(phone);
  res.json({ success: true, message: "Meminta kode pairing 8-digit dari WhatsApp..." });
});

// Disconnect Real WhatsApp
app.post("/api/whatsapp/disconnect", async (req, res) => {
  await realWA.logout();
  res.json({ success: true, message: "WhatsApp telah diputuskan" });
});

// Instant Simulated Mode (for testing without camera)
app.post("/api/whatsapp/connect-simulated", (req, res) => {
  const { phone } = req.body;
  db.storeSettings.phoneNumber = phone || "6281234567890";
  db.storeSettings.status = "SIMULATED";
  db.storeSettings.simulatedMode = true;
  db.storeSettings.deviceInfo = {
    name: "Simulator FlowWA (Virtual Device)",
    platform: "WhatsApp Simulator Mode",
    battery: "100%",
    connectedSince: new Date().toISOString()
  };
  io.emit("whatsapp_status_changed", {
    status: "SIMULATED",
    simulatedMode: true,
    phoneNumber: db.storeSettings.phoneNumber,
    deviceInfo: db.storeSettings.deviceInfo
  });
  res.json({ success: true, message: "WhatsApp Simulator aktif! Bot siap membalas pesan." });
});

// 2. Product Catalog Management (CRUD)
app.get("/api/products", (req, res) => {
  res.json(db.products);
});

app.post("/api/products", (req, res) => {
  const newProduct = {
    id: `prod-${Date.now()}`,
    name: req.body.name || "Produk Baru",
    category: req.body.category || "Umum",
    price: Number(req.body.price) || 0,
    unit: req.body.unit || "pcs",
    stock: Number(req.body.stock) || 10,
    inStock: req.body.inStock !== false,
    description: req.body.description || "",
    aliases: req.body.aliases || [req.body.name.toLowerCase()]
  };
  db.products.push(newProduct);
  io.emit("products_updated", db.products);
  res.json({ success: true, data: newProduct });
});

app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const index = db.products.findIndex(p => p.id === id);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...req.body };
    io.emit("products_updated", db.products);
    res.json({ success: true, data: db.products[index] });
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  db.products = db.products.filter(p => p.id !== id);
  io.emit("products_updated", db.products);
  res.json({ success: true });
});

// 3. Order Management & Realtime Checklist
app.get("/api/orders", (req, res) => {
  res.json(db.orders);
});

// Toggle individual item checklist inside an order (Kitchen checklist)
app.patch("/api/orders/:orderId/items/:itemId/checklist", (req, res) => {
  const { orderId, itemId } = req.params;
  const order = db.orders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });

  const item = order.items.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ error: "Item not found" });

  item.isDone = req.body.isDone !== undefined ? req.body.isDone : !item.isDone;

  const allItemsDone = order.items.every(i => i.isDone);
  if (allItemsDone && order.status === "PREPARING") {
    order.status = "READY";
  }

  io.emit("order_updated", order);
  io.emit("orders_list_updated", db.orders);
  res.json({ success: true, order });
});

// Update entire order status (NEW -> PREPARING -> READY -> COMPLETED -> CANCELLED)
app.patch("/api/orders/:orderId/status", (req, res) => {
  const { orderId } = req.params;
  const { status, paymentStatus, paymentMethod } = req.body;
  const order = db.orders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });

  if (status) order.status = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (paymentMethod) order.paymentMethod = paymentMethod;

  if (status === "COMPLETED") {
    order.items.forEach(i => (i.isDone = true));
  }

  io.emit("order_updated", order);
  io.emit("orders_list_updated", db.orders);
  res.json({ success: true, order });
});

// Send Real WhatsApp notification update to customer regarding order
app.post("/api/orders/:orderId/notify-customer", async (req, res) => {
  const { orderId } = req.params;
  const { customMessage } = req.body;
  const order = db.orders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });

  let statusMsg = "";
  if (order.status === "PREPARING") {
    statusMsg = `👨‍🍳 Halo Kak ${order.customerName}! Pesanan Anda #${order.id} saat ini sedang diracik dan dibuat di dapur kami. Mohon ditunggu ya kak! 🍳`;
  } else if (order.status === "READY") {
    statusMsg = `✨ Halo Kak ${order.customerName}! Pesanan Anda #${order.id} sudah SELESAI dibuat dan siap diambil / diantar! Silakan dinikmati. ☕🍽️`;
  } else if (order.status === "COMPLETED") {
    statusMsg = `🎉 Terima kasih Kak ${order.customerName}! Transaksi pesanan #${order.id} telah selesai. Semoga harimu menyenangkan & ditunggu pesanan berikutnya! 🙏`;
  } else {
    statusMsg = `Halo Kak ${order.customerName}! Pesanan Anda #${order.id} telah kami terima dan tercatat di antrean.`;
  }

  const messageToSend = customMessage || statusMsg;

  // Send real WhatsApp message if socket connected!
  if (realWA.connectionStatus === "CONNECTED") {
    await realWA.sendMessage(order.customerPhone, messageToSend);
  }

  // Also log to internal chat list
  let chat = db.chats.find(c => c.phone === order.customerPhone);
  if (!chat) {
    chat = {
      id: `chat-${order.customerPhone}`,
      contactName: order.customerName,
      phone: order.customerPhone,
      lastMessage: messageToSend,
      lastTime: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      unread: 0,
      botActive: true,
      messages: []
    };
    db.chats.unshift(chat);
  }

  const newMsg = {
    id: `m-${Date.now()}`,
    sender: "bot",
    text: messageToSend,
    time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    status: "delivered"
  };

  chat.messages.push(newMsg);
  chat.lastMessage = messageToSend;
  chat.lastTime = newMsg.time;

  io.emit("chat_message_received", { phone: order.customerPhone, message: newMsg, chat });
  res.json({ success: true, message: "Pesan WhatsApp berhasil dikirim ke pelanggan!" });
});

// 4. Financial Analytics & Summary API
app.get("/api/analytics/financial-report", (req, res) => {
  const report = botEngine.handleFinancialReport("admin", "Admin Owner");
  res.json(report.financialData);
});

// 5. Visual Flow Management (n8n node structure)
app.get("/api/flows", (req, res) => {
  res.json(db.flows);
});

app.put("/api/flows/:id", (req, res) => {
  const { id } = req.params;
  const index = db.flows.findIndex(f => f.id === id);
  if (index !== -1) {
    db.flows[index] = { ...db.flows[index], ...req.body };
    io.emit("flows_updated", db.flows);
    res.json({ success: true, data: db.flows[index] });
  } else {
    res.status(404).json({ error: "Flow not found" });
  }
});

// 6. Live Chat & Simulator Webhook
app.get("/api/chats", (req, res) => {
  res.json(db.chats);
});

// Incoming message handler (From Simulator or Manual CS)
app.post("/api/whatsapp/incoming-message", async (req, res) => {
  const { phone, senderName, text } = req.body;
  if (!text) return res.status(400).json({ error: "Message text required" });

  const senderPhone = phone || "081298765432";
  const contactName = senderName || "Pelanggan WA";

  let chat = db.chats.find(c => c.phone === senderPhone);
  if (!chat) {
    chat = {
      id: `chat-${senderPhone}`,
      contactName: contactName,
      phone: senderPhone,
      lastMessage: text,
      lastTime: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      unread: 0,
      botActive: true,
      messages: []
    };
    db.chats.unshift(chat);
  }

  const userMsg = {
    id: `m-cust-${Date.now()}`,
    sender: "customer",
    text: text,
    time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    status: "read"
  };
  chat.messages.push(userMsg);
  chat.lastMessage = text;
  chat.lastTime = userMsg.time;

  io.emit("chat_message_received", { phone: senderPhone, message: userMsg, chat });

  // Bot always active in simulator mode OR when autoReply is enabled
  const botShouldReply = chat.botActive && db.storeSettings.autoReplyEnabled;
  if (botShouldReply) {
    setTimeout(async () => {
      const botResponse = await botEngine.processIncomingMessage(senderPhone, contactName, text);
      if (!botResponse || !botResponse.replyText) return;

      // If real WA (Baileys) connected, also send via real socket to actual phone
      if (realWA.connectionStatus === "CONNECTED" && phone && !db.storeSettings.simulatedMode) {
        await realWA.sendMessage(senderPhone, botResponse.replyText);
      }

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

      io.emit("chat_message_received", { phone: senderPhone, message: botMsg, chat });

      if (botResponse.orderCreated) {
        io.emit("new_order_created", botResponse.orderCreated);
        io.emit("orders_list_updated", db.orders);
      }
    }, 800);
  }

  res.json({ success: true, message: "Received & processed" });
});

// Socket.io real-time connection
io.on("connection", socket => {
  console.log("Client connected to FlowWA real-time socket:", socket.id);

  // Send current QR immediately upon connection
  if (realWA.qrCodeData) {
    socket.emit("whatsapp_qr_updated", { qrCode: realWA.qrCodeData, status: realWA.connectionStatus });
  }
  if (realWA.pairingCode) {
    socket.emit("whatsapp_pairing_code", { code: realWA.pairingCode });
  }

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 FlowWA Production Backend running on http://localhost:${PORT}`);
});
