// Intelligent Bot Execution Engine with Product Price Lookup, Order Parsing, and Financial Reporter

export class BotEngine {
  constructor(database) {
    this.db = database;
  }

  // Format currency in Indonesian Rupiah (Rp XX.XXX)
  formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(number);
  }

  // Handle incoming WhatsApp message and determine response & actions
  async processIncomingMessage(senderPhone, senderName, messageText) {
    const rawText = messageText.trim();
    const lowerText = rawText.toLowerCase();

    // 1. Check for Financial Report / Omset Query
    if (
      lowerText.includes("laporan") ||
      lowerText.includes("omset") ||
      lowerText.includes("pendapatan") ||
      lowerText.includes("rekap hari ini") ||
      lowerText.includes("keuangan") ||
      lowerText === "rekap"
    ) {
      return this.handleFinancialReport(senderPhone, senderName);
    }

    // 2. Check for Menu / Price Inquiry
    if (
      lowerText.includes("menu") ||
      lowerText.includes("harga") ||
      lowerText.includes("pricelist") ||
      lowerText.includes("daftar harga") ||
      lowerText.includes("katalog") ||
      lowerText.includes("ada apa aja") ||
      lowerText.includes("jual apa")
    ) {
      return this.handleMenuAndPriceQuery(lowerText);
    }

    // 3. Check for Ordering Intent
    if (
      lowerText.includes("pesan") ||
      lowerText.includes("order") ||
      lowerText.includes("beli") ||
      lowerText.includes("mau") ||
      lowerText.includes("ambil") ||
      this.detectOrderItems(lowerText).length > 0
    ) {
      const orderResult = this.handleOrderCreation(senderPhone, senderName, rawText);
      if (orderResult && orderResult.orderCreated) {
        return orderResult;
      }
    }

    // 4. Delivery / COD / Ongkir Intent
    if (
      lowerText.includes("kirim") ||
      lowerText.includes("antar") ||
      lowerText.includes("delivery") ||
      lowerText.includes("cod") ||
      lowerText.includes("cash on delivery") ||
      lowerText.includes("ongkir") ||
      lowerText.includes("ongkos") ||
      lowerText.includes("ke rumah") ||
      lowerText.includes("diantar") ||
      lowerText.includes("ojek") ||
      lowerText.includes("grab") ||
      lowerText.includes("gojek")
    ) {
      return {
        type: "DELIVERY_INFO",
        replyText: `🛵 *INFO PENGIRIMAN & DELIVERY*\n\n` +
          `Halo Kak *${senderName}*! Berikut info pengiriman kami:\n\n` +
          `📦 *Layanan Delivery (Antar ke Rumah):*\n` +
          `• Kami melayani antar pesanan via kurir (Gojek / Grab / Kurir Toko)\n` +
          `• Estimasi pengiriman: 15-30 menit tergantung jarak\n` +
          `• Ongkos kirim menyesuaikan jarak & platform\n\n` +
          `💵 *Metode Pembayaran yang Diterima:*\n` +
          `• ✅ COD (Cash on Delivery / Bayar di Tempat)\n` +
          `• ✅ Transfer Bank (BCA, Mandiri, BRI, BNI)\n` +
          `• ✅ QRIS (GoPay, OVO, DANA, ShopeePay, dll)\n\n` +
          `📍 *Cara Order Delivery:*\nKetik pesanan + alamat lengkap kakak, contoh:\n_"Pesan 2 Kopi Gula Aren, antar ke Jl. Melati No. 5, bayar COD"_\n\n` +
          `Ada yang ingin kakak pesan sekarang? 😊`,
        orderCreated: null
      };
    }

    // 5. Payment Confirmation Intent
    if (
      lowerText.includes("sudah transfer") ||
      lowerText.includes("udah transfer") ||
      lowerText.includes("sudah bayar") ||
      lowerText.includes("udah bayar") ||
      lowerText.includes("sudah ditransfer") ||
      lowerText.includes("bukti") ||
      lowerText.includes("konfirmasi") ||
      lowerText.includes("bayar") ||
      lowerText.includes("transfer") ||
      lowerText.includes("qris") ||
      lowerText.includes("gopay") ||
      lowerText.includes("ovo") ||
      lowerText.includes("dana")
    ) {
      return {
        type: "PAYMENT_CONFIRM",
        replyText: `✅ *KONFIRMASI PEMBAYARAN DITERIMA!*\n\n` +
          `Terima kasih Kak *${senderName}*! 🙏\n\n` +
          `📸 Jika belum, mohon kirimkan *bukti transfer / screenshot pembayaran* ke chat ini agar kami bisa verifikasi lebih cepat ya kak.\n\n` +
          `⏳ Tim kami akan memverifikasi pembayaran Anda dalam *1-5 menit*.\n` +
          `👨‍🍳 Setelah verified, pesanan akan langsung kami proses di dapur!\n\n` +
          `ℹ️ *Info Rekening & QRIS:*\n` +
          `• BCA: 1234567890 (a/n Kopi & Roti Nusantara)\n` +
          `• QRIS tersedia di kasir / toko\n\n` +
          `Mohon ditunggu ya kak! 😊☕`,
        orderCreated: null
      };
    }

    // 6. Operating Hours / Location Intent
    if (
      lowerText.includes("jam") ||
      lowerText.includes("buka") ||
      lowerText.includes("tutup") ||
      lowerText.includes("operasional") ||
      lowerText.includes("lokasi") ||
      lowerText.includes("alamat") ||
      lowerText.includes("dimana") ||
      lowerText.includes("di mana") ||
      lowerText.includes("maps") ||
      lowerText.includes("google maps")
    ) {
      return {
        type: "STORE_INFO",
        replyText: `🏪 *INFO TOKO — ${this.db.storeSettings.storeName}*\n\n` +
          `⏰ *Jam Operasional:*\n${this.db.storeSettings.businessHours}\n(Senin — Minggu, termasuk hari libur nasional)\n\n` +
          `📍 *Lokasi Toko:*\nJl. Contoh No. 123, Jakarta Selatan\n_(Dekat halte busway, parkir tersedia)_\n\n` +
          `🗺️ Google Maps: https://maps.google.com\n\n` +
          `📞 *Hubungi Kami:*\nWhatsApp: ${this.db.storeSettings.phoneNumber}\n\n` +
          `Ada yang bisa kami bantu lagi kak? 😊`,
        orderCreated: null
      };
    }

    // 7. Greeting / Salam Intent
    if (
      lowerText === "halo" ||
      lowerText === "hi" ||
      lowerText === "hai" ||
      lowerText === "hello" ||
      lowerText === "halo kak" ||
      lowerText === "assalamualaikum" ||
      lowerText.startsWith("halo") ||
      lowerText.startsWith("hai ") ||
      lowerText.startsWith("hi ")
    ) {
      return {
        type: "GREETING",
        replyText: `Halo Kak *${senderName || "Pelanggan Setia"}*! 👋 Selamat datang di *${this.db.storeSettings.storeName}* ☕🥪\n\n` +
          `Kami siap melayani kak! Berikut yang bisa kami bantu:\n\n` +
          `☕ Ketik *Menu* untuk lihat daftar produk & harga\n` +
          `🛒 Langsung ketik pesanan, contoh: _"Pesan 2 Kopi Gula Aren"_\n` +
          `🛵 Ketik *Delivery* atau *COD* untuk info pengiriman\n` +
          `⏰ Ketik *Jam buka* / *Lokasi* untuk info toko\n\n` +
          `Ada yang bisa kami bantu kak? 😊`,
        orderCreated: null
      };
    }

    // 8. Thank you Intent
    if (
      lowerText.includes("terima kasih") ||
      lowerText.includes("makasih") ||
      lowerText.includes("thanks") ||
      lowerText.includes("thank you") ||
      lowerText.includes("thx") ||
      lowerText.includes("tq")
    ) {
      return {
        type: "THANKS",
        replyText: `Sama-sama Kak *${senderName}*! 🙏😊\n\nSenang bisa membantu! Ditunggu kunjungan dan pesanan berikutnya ya kak ☕🥐\n\nJangan ragu hubungi kami lagi kapan saja!`,
        orderCreated: null
      };
    }

    // 9. Fallback — lebih helpful, tidak sekadar greeting ulang
    return {
      type: "FALLBACK",
      replyText: `Halo Kak *${senderName || "Kak"}*! 😊 Maaf, kami belum mengerti maksud pesan kakak.\n\n` +
        `Berikut yang bisa kami bantu:\n` +
        `☕ Ketik *Menu* → Lihat daftar produk & harga\n` +
        `🛒 Ketik *Pesan [item]* → Langsung buat pesanan\n` +
        `🛵 Ketik *Delivery* / *COD* → Info pengiriman\n` +
        `⏰ Ketik *Jam buka* / *Lokasi* → Info toko\n` +
        `📊 Ketik *Laporan* → Rekap omset (Admin)\n\n` +
        `Atau hubungi CS kami langsung jika butuh bantuan khusus. 🙏`,
      orderCreated: null
    };
  }

  // Handle Menu & Price Queries
  handleMenuAndPriceQuery(queryText) {
    const products = this.db.products.filter(p => p.inStock);

    // If query asks for specific product price (e.g., "harga kopi susu berapa?")
    const specificMatches = products.filter(p => {
      const nameMatch = queryText.includes(p.name.toLowerCase());
      const aliasMatch = p.aliases && p.aliases.some(a => queryText.includes(a.toLowerCase()));
      return nameMatch || aliasMatch;
    });

    if (specificMatches.length > 0 && !queryText.includes("semua") && !queryText.includes("menu")) {
      let reply = `Halo kak! Berikut informasi harga produk yang kakak tanyakan:\n\n`;
      specificMatches.forEach(item => {
        reply += `✨ *${item.name}* (${item.category})\n`;
        reply += `   💵 Harga: *${this.formatRupiah(item.price)}* / ${item.unit}\n`;
        reply += `   📝 ${item.description}\n\n`;
      });
      reply += `Ketik *Pesan [jumlah] [nama item]* untuk langsung kami proses ya kak! 😊`;

      return {
        type: "PRICE_INQUIRY",
        replyText: reply,
        orderCreated: null
      };
    }

    // General Menu & Price List categorized
    const categories = {};
    products.forEach(p => {
      if (!categories[p.category]) categories[p.category] = [];
      categories[p.category].push(p);
    });

    let reply = `📋 *DAFTAR MENU & HARGA RESMI*\n🏪 *${this.db.storeSettings.storeName}*\n🕒 Jam Buka: ${this.db.storeSettings.businessHours}\n==============================\n\n`;

    for (const [category, items] of Object.entries(categories)) {
      reply += `📌 *${category.toUpperCase()}*\n`;
      items.forEach(p => {
        reply += `• *${p.name}* : ${this.formatRupiah(p.price)} / ${p.unit}\n`;
      });
      reply += `\n`;
    }

    reply += `==============================\n`;
    reply += `💡 *CARA PESAN CEPAT:*\nLangsung ketik pesanan Anda, contoh:\n👉 *"Pesan 2 Kopi Gula Aren dan 1 Roti Bakar Coklat Keju"*`;

    return {
      type: "MENU_CATALOG",
      replyText: reply,
      orderCreated: null
    };
  }

  // Helper to detect items in text
  detectOrderItems(text) {
    const products = this.db.products;
    const detected = [];

    // Indonesian numbers map
    const wordNumbers = {
      "satu": 1, "dua": 2, "tiga": 3, "empat": 4, "lima": 5,
      "enam": 6, "tujuh": 7, "delapan": 8, "sembilan": 9, "sepuluh": 10
    };

    products.forEach(product => {
      const terms = [product.name.toLowerCase(), ...(product.aliases || [])];
      for (const term of terms) {
        const index = text.indexOf(term);
        if (index !== -1) {
          // Look for number before or after the term
          let qty = 1;
          const contextBefore = text.substring(Math.max(0, index - 20), index);
          const contextAfter = text.substring(index + term.length, Math.min(text.length, index + term.length + 15));

          // Regex for numbers e.g. "2 ", "2x", "3 cup"
          const numMatchBefore = contextBefore.match(/(\d+)\s*(?:x|pcs|cup|porsi|bungkus|buah)?\s*$/);
          const numMatchAfter = contextAfter.match(/^\s*(?:sebanyak|jumlah|isi)?\s*(\d+)/);

          if (numMatchBefore) {
            qty = parseInt(numMatchBefore[1], 10);
          } else if (numMatchAfter) {
            qty = parseInt(numMatchAfter[1], 10);
          } else {
            // Check for Indonesian word numbers (e.g. "dua kopi")
            for (const [word, numVal] of Object.entries(wordNumbers)) {
              if (contextBefore.trim().endsWith(word)) {
                qty = numVal;
                break;
              }
            }
          }

          if (qty > 0 && qty < 100) {
            // Avoid duplicate detected product
            if (!detected.some(d => d.product.id === product.id)) {
              detected.push({
                product,
                qty
              });
            }
          }
        }
      }
    });

    return detected;
  }

  // Handle Order Creation and Total Calculation
  handleOrderCreation(senderPhone, senderName, rawText) {
    const detectedItems = this.detectOrderItems(rawText.toLowerCase());

    if (detectedItems.length === 0) {
      return null;
    }

    let totalAmount = 0;
    const orderItems = detectedItems.map((item, idx) => {
      const subtotal = item.product.price * item.qty;
      totalAmount += subtotal;
      return {
        id: `item-${Date.now()}-${idx}`,
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        qty: item.qty,
        subtotal: subtotal,
        isDone: false // Kitchen checklist
      };
    });

    // Generate Order ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${randomNum}`;

    // Extract optional notes (e.g., "kurangin manis", "pedas", "less ice")
    let notes = "Standar / Normal";
    if (rawText.toLowerCase().includes("kurang") || rawText.toLowerCase().includes("pedas") || rawText.toLowerCase().includes("less") || rawText.toLowerCase().includes("meja") || rawText.toLowerCase().includes("antar")) {
      notes = rawText;
    }

    const newOrder = {
      id: orderId,
      customerName: senderName || "Pelanggan WA",
      customerPhone: senderPhone || "0812xxxx",
      createdAt: new Date().toISOString(),
      status: "NEW", // NEW -> PREPARING -> READY -> COMPLETED
      paymentStatus: "UNPAID",
      paymentMethod: "QRIS / Transfer",
      notes: notes,
      totalAmount: totalAmount,
      items: orderItems
    };

    // Save to database
    this.db.orders.unshift(newOrder);

    // Build structured WhatsApp Invoice confirmation message
    let reply = `🎉 *PESANAN ANDA BERHASIL DICATAT!*\n`;
    reply += `🆔 No. Pesanan: *#${orderId}*\n`;
    reply += `👤 Nama: *${newOrder.customerName}*\n`;
    reply += `📅 Waktu: ${new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB\n`;
    reply += `-------------------------------------------\n`;
    reply += `*RINCIAN PESANAN:*\n`;

    orderItems.forEach(item => {
      reply += `• ${item.qty}x *${item.productName}*\n`;
      reply += `  @ ${this.formatRupiah(item.price)} = *${this.formatRupiah(item.subtotal)}*\n`;
    });

    reply += `-------------------------------------------\n`;
    reply += `💰 *TOTAL BAYAR: ${this.formatRupiah(totalAmount)}*\n`;
    if (notes !== "Standar / Normal") {
      reply += `📝 Catatan: _${notes}_\n`;
    }
    reply += `\n👨‍🍳 Pesanan Anda telah masuk ke sistem antrean dapur dan siap diproses!`;
    reply += `\nSilakan lakukan pembayaran via *QRIS Toko* atau *Transfer*. Tim kami akan update status pesanan kakak secara otomatis di WhatsApp ini. Terima kasih! 🙏`;

    return {
      type: "ORDER_CREATED",
      replyText: reply,
      orderCreated: newOrder
    };
  }

  // Handle Financial & Revenue Report Query for Owner/Admin
  handleFinancialReport(senderPhone, senderName) {
    const today = new Date().toISOString().split("T")[0];
    
    // Filter orders for today
    const todayOrders = this.db.orders.filter(o => {
      const orderDate = new Date(o.createdAt).toISOString().split("T")[0];
      return orderDate === today && o.status !== "CANCELLED";
    });

    const totalOrdersCount = todayOrders.length;
    const completedOrders = todayOrders.filter(o => o.status === "COMPLETED" || o.paymentStatus === "PAID");
    
    let totalRevenue = 0;
    const itemSalesMap = {};
    const paymentMethods = {};

    todayOrders.forEach(order => {
      totalRevenue += order.totalAmount;
      
      // Payment method breakdown
      paymentMethods[order.paymentMethod] = (paymentMethods[order.paymentMethod] || 0) + order.totalAmount;

      // Item breakdown
      order.items.forEach(item => {
        if (!itemSalesMap[item.productName]) {
          itemSalesMap[item.productName] = { qty: 0, revenue: 0 };
        }
        itemSalesMap[item.productName].qty += item.qty;
        itemSalesMap[item.productName].revenue += item.subtotal;
      });
    });

    // Sort top selling items
    const topItems = Object.entries(itemSalesMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.qty - a.qty);

    const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    let reply = `📊 *LAPORAN KEUANGAN & OMSET HARI INI*\n`;
    reply += `🏪 Toko: *${this.db.storeSettings.storeName}*\n`;
    reply += `📅 Tanggal: *${new Date().toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}*\n`;
    reply += `⏰ Update: ${new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB\n`;
    reply += `====================================\n\n`;

    reply += `💰 *TOTAL PENDAPATAN HARI INI:*\n`;
    reply += `👉 *${this.formatRupiah(totalRevenue)}*\n\n`;

    reply += `📈 *RINGKASAN TRANSAKSI:*\n`;
    reply += `• Total Pesanan Masuk: *${totalOrdersCount} Transaksi*\n`;
    reply += `• Pesanan Selesai/Lunas: *${completedOrders.length} Pesanan*\n`;
    reply += `• Rata-rata per Transaksi: *${this.formatRupiah(averageOrderValue)}*\n\n`;

    reply += `🏆 *PRODUK PALING LARIS:*\n`;
    if (topItems.length === 0) {
      reply += `• Belum ada transaksi tercatat hari ini.\n`;
    } else {
      topItems.slice(0, 5).forEach((item, index) => {
        reply += `${index + 1}. *${item.name}* : ${item.qty} terjual (${this.formatRupiah(item.revenue)})\n`;
      });
    }

    reply += `\n💳 *METODE PEMBAYARAN:*\n`;
    for (const [method, amount] of Object.entries(paymentMethods)) {
      reply += `• ${method}: ${this.formatRupiah(amount)}\n`;
    }

    reply += `\n====================================\n`;
    reply += `_Laporan dihasilkan otomatis oleh FlowWA Automation Engine._`;

    return {
      type: "FINANCIAL_REPORT",
      replyText: reply,
      financialData: {
        totalRevenue,
        totalOrdersCount,
        completedCount: completedOrders.length,
        averageOrderValue,
        topItems
      }
    };
  }
}
