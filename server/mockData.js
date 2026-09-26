// Default initial mock database for FlowWA SaaS

export const initialStoreSettings = {
  storeName: "Kopi & Roti Nusantara",
  phoneNumber: "6281234567890",
  adminPin: "1234",
  status: "CONNECTED",
  deviceInfo: {
    name: "Samsung Galaxy S24 Ultra",
    platform: "WhatsApp Multi-Device",
    battery: "92%",
    connectedSince: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  autoReplyEnabled: true,
  businessHours: "08:00 - 22:00 WIB",
  welcomeMessage: "Halo! Selamat datang di Kopi & Roti Nusantara ☕🥪. Ada yang bisa kami bantu? Anda bisa ketik *Menu* untuk lihat katalog atau langsung ketik pesanan Anda.",
  currency: "IDR",
  taxRate: 0,
};

export const initialProducts = [
  {
    id: "prod-1",
    name: "Kopi Gula Aren",
    category: "Minuman Kopi",
    price: 18000,
    unit: "cup",
    stock: 45,
    inStock: true,
    description: "Espresso robusta & arabica blend dengan susu segar dan gula aren murni.",
    aliases: ["kopi gula aren", "kopi aren", "aren", "es kopi aren"]
  },
  {
    id: "prod-2",
    name: "Kopi Susu Creamy",
    category: "Minuman Kopi",
    price: 20000,
    unit: "cup",
    stock: 30,
    inStock: true,
    description: "Kopi susu dengan tekstur extra creamy dan rasa gurih manis seimbang.",
    aliases: ["kopi susu creamy", "kopi creamy", "creamy coffee", "kopi susu"]
  },
  {
    id: "prod-3",
    name: "Americano Ice / Hot",
    category: "Minuman Kopi",
    price: 15000,
    unit: "cup",
    stock: 50,
    inStock: true,
    description: "Double shot espresso dengan air dingin/panas, fresh dan bold.",
    aliases: ["americano", "kopi hitam", "black coffee", "americano ice"]
  },
  {
    id: "prod-4",
    name: "Matcha Latte Signature",
    category: "Non Kopi",
    price: 22000,
    unit: "cup",
    stock: 25,
    inStock: true,
    description: "Matcha Uji Jepang premium dipadu susu segar lembut.",
    aliases: ["matcha", "matcha latte", "green tea", "es matcha"]
  },
  {
    id: "prod-5",
    name: "Roti Bakar Coklat Keju",
    category: "Makanan / Snack",
    price: 20000,
    unit: "porsi",
    stock: 20,
    inStock: true,
    description: "Roti bakar tebal dengan limpahan meises coklat dan keju cheddar parut.",
    aliases: ["roti bakar coklat keju", "roti bakar", "roti coklat keju", "roti"]
  },
  {
    id: "prod-6",
    name: "Croissant Butter",
    category: "Bakery",
    price: 25000,
    unit: "pcs",
    stock: 15,
    inStock: true,
    description: "French croissant renyah berlapis dengan butter aromatik.",
    aliases: ["croissant", "croissant butter", "butter croissant", "kroisan"]
  },
  {
    id: "prod-7",
    name: "Nasi Goreng Spesial Telur",
    category: "Makanan Utama",
    price: 28000,
    unit: "porsi",
    stock: 35,
    inStock: true,
    description: "Nasi goreng bumbu gurih rempah dengan suwiran ayam, sosis, dan telur mata sapi.",
    aliases: ["nasi goreng", "nasgor", "nasi goreng spesial", "nasgor telur"]
  },
  {
    id: "prod-8",
    name: "Dimsum Ayam Udang (4 pcs)",
    category: "Makanan / Snack",
    price: 22000,
    unit: "porsi",
    stock: 40,
    inStock: true,
    description: "Dimsum kukus lembut dengan daging ayam dan udang cincang gurih saus cocolan chili oil.",
    aliases: ["dimsum", "dimsum ayam", "siomay", "dimsum 4 pcs"]
  }
];

export const initialOrders = [
  {
    id: "ORD-9821",
    customerName: "Budi Santoso",
    customerPhone: "081298765432",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "PREPARING", // NEW | PREPARING | READY | COMPLETED | CANCELLED
    paymentStatus: "PAID", // UNPAID | PAID
    paymentMethod: "QRIS",
    notes: "Gula arennya dikurangin ya (less sweet), pisah es.",
    totalAmount: 56000,
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        productName: "Kopi Gula Aren",
        price: 18000,
        qty: 2,
        subtotal: 36000,
        isDone: true // Checklist in kitchen
      },
      {
        id: "item-2",
        productId: "prod-5",
        productName: "Roti Bakar Coklat Keju",
        price: 20000,
        qty: 1,
        subtotal: 20000,
        isDone: false // Checklist in kitchen
      }
    ]
  },
  {
    id: "ORD-9822",
    customerName: "Siti Rahmawati",
    customerPhone: "085712349988",
    createdAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    status: "READY",
    paymentStatus: "PAID",
    paymentMethod: "Transfer BCA",
    notes: "Tolong kirim garpu plastik ya kak.",
    totalAmount: 72000,
    items: [
      {
        id: "item-3",
        productId: "prod-6",
        productName: "Croissant Butter",
        price: 25000,
        qty: 2,
        subtotal: 50000,
        isDone: true
      },
      {
        id: "item-4",
        productId: "prod-4",
        productName: "Matcha Latte Signature",
        price: 22000,
        qty: 1,
        subtotal: 22000,
        isDone: true
      }
    ]
  },
  {
    id: "ORD-9820",
    customerName: "Dimas Aditya",
    customerPhone: "081987654321",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: "COMPLETED",
    paymentStatus: "PAID",
    paymentMethod: "Cash / Tunai",
    notes: "Makan di tempat meja 4.",
    totalAmount: 50000,
    items: [
      {
        id: "item-5",
        productId: "prod-7",
        productName: "Nasi Goreng Spesial Telur",
        price: 28000,
        qty: 1,
        subtotal: 28000,
        isDone: true
      },
      {
        id: "item-6",
        productId: "prod-8",
        productName: "Dimsum Ayam Udang (4 pcs)",
        price: 22000,
        qty: 1,
        subtotal: 22000,
        isDone: true
      }
    ]
  }
];

export const initialFlows = [
  {
    id: "flow-main",
    name: "Master WhatsApp CS & Auto-Order Flow",
    description: "Alur utama bot untuk menyapa pelanggan, menjawab daftar harga, menghitung pesanan, dan mencatat order.",
    active: true,
    nodes: [
      {
        id: "node-1",
        type: "trigger",
        title: "WhatsApp Message Received",
        description: "Memicu ketika ada pesan WA masuk dari pelanggan",
        position: { x: 50, y: 150 },
        config: { matchType: "ANY_MESSAGE" }
      },
      {
        id: "node-2",
        type: "condition",
        title: "AI & Keyword Router",
        description: "Mendeteksi apakah pelanggan tanya menu, mau order, atau minta laporan keuangan",
        position: { x: 380, y: 150 },
        config: {
          intents: ["CEK_MENU_HARGA", "ORDER_PESANAN", "LAPORAN_KEUANGAN", "BANTUAN_CS"]
        }
      },
      {
        id: "node-3",
        type: "action_catalog",
        title: "Katalog & Price Lookup",
        description: "Mencari data harga produk secara real-time dan menyusun respon",
        position: { x: 720, y: 50 },
        config: { format: "DETAILED_PRICE_LIST" }
      },
      {
        id: "node-4",
        type: "action_order",
        title: "Auto-Calculate & Create Order",
        description: "Menghitung total pesanan (qty x harga) & menyimpan ke checklist dapur",
        position: { x: 720, y: 220 },
        config: { autoConfirm: true, notifyKitchen: true }
      },
      {
        id: "node-5",
        type: "action_finance",
        title: "Hitung Laporan Pendapatan",
        description: "Menghitung omset hari ini, pesanan sukses, dan rekap keuangan untuk Owner",
        position: { x: 720, y: 390 },
        config: { checkAdminAuth: true }
      },
      {
        id: "node-6",
        type: "action_reply",
        title: "Kirim Balasan WhatsApp",
        description: "Mengirim pesan teks balasan resmi ke nomor WhatsApp pelanggan/owner",
        position: { x: 1080, y: 220 },
        config: { appendFooter: true }
      }
    ],
    edges: [
      { id: "e1-2", from: "node-1", to: "node-2", label: "Pesan Masuk" },
      { id: "e2-3", from: "node-2", to: "node-3", label: "Tanya Menu / Harga" },
      { id: "e2-4", from: "node-2", to: "node-4", label: "Pesan Makanan/Minuman" },
      { id: "e2-5", from: "node-2", to: "node-5", label: "Minta Laporan Keuangan" },
      { id: "e3-6", from: "node-3", to: "node-6", label: "Format Pesan Harga" },
      { id: "e4-6", from: "node-4", to: "node-6", label: "Nota & Konfirmasi Order" },
      { id: "e5-6", from: "node-5", to: "node-6", label: "Kirim Rekap Omset" }
    ]
  }
];

export const initialChats = [
  {
    id: "chat-081298765432",
    contactName: "Budi Santoso",
    phone: "081298765432",
    lastMessage: "Oke kak, sudah ditransfer via QRIS ya!",
    lastTime: "12:45",
    unread: 0,
    botActive: true,
    messages: [
      { id: "m1", sender: "customer", text: "Halo kak, mau tanya menu kopi dan roti bakar harganya berapa?", time: "12:30", status: "read" },
      { id: "m2", sender: "bot", text: "Halo Kak Budi Santoso! ☕\nBerikut daftar harga produk kami:\n- *Kopi Gula Aren*: Rp 18.000 / cup\n- *Kopi Susu Creamy*: Rp 20.000 / cup\n- *Roti Bakar Coklat Keju*: Rp 20.000 / porsi\n\nUntuk memesan, kakak bisa langsung ketik pesanannya ya (contoh: *Pesan 2 Kopi Gula Aren dan 1 Roti Bakar*).", time: "12:30", status: "read" },
      { id: "m3", sender: "customer", text: "Saya mau pesan 2 Kopi Gula Aren dan 1 Roti Bakar Coklat Keju kak. Kurangin manisnya ya.", time: "12:35", status: "read" },
      { id: "m4", sender: "bot", text: "📋 *RINGKASAN PESANAN KAKAK*\nID: #ORD-9821\n---------------------------------\n• 2x Kopi Gula Aren @ Rp 18.000 = Rp 36.000\n• 1x Roti Bakar Coklat Keju @ Rp 20.000 = Rp 20.000\n---------------------------------\n*TOTAL PEMBAYARAN: Rp 56.000*\nCatatan: Gula arennya dikurangin ya (less sweet)\n\nPesanan telah kami catat di antrean dapur! 🍳 Mohon konfirmasi metode pembayaran (QRIS / Transfer / Tunai).", time: "12:35", status: "read" },
      { id: "m5", sender: "customer", text: "Oke kak, sudah ditransfer via QRIS ya!", time: "12:45", status: "read" }
    ]
  }
];
