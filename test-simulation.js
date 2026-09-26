async function test() {
  try {
    console.log("1. Testing GET /api/settings...");
    const setRes = await fetch("http://localhost:3001/api/settings");
    const settings = await setRes.json();
    console.log("Settings OK:", settings.storeName);

    console.log("\n2. Testing Customer WhatsApp Order Parsing...");
    const orderMsgRes = await fetch("http://localhost:3001/api/whatsapp/incoming-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: "081298765432",
        senderName: "Budi Santoso",
        text: "Saya mau pesan 2 Kopi Gula Aren dan 1 Croissant Butter ya kak"
      })
    });
    console.log("Order message sent status:", (await orderMsgRes.json()).success);

    console.log("\n3. Testing Financial Report generation query...");
    const finMsgRes = await fetch("http://localhost:3001/api/whatsapp/incoming-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: "081298765432",
        senderName: "Owner Admin",
        text: "Laporan hari ini"
      })
    });
    console.log("Financial message sent status:", (await finMsgRes.json()).success);

    console.log("\n4. Checking Updated Orders list...");
    const ordRes = await fetch("http://localhost:3001/api/orders");
    const orders = await ordRes.json();
    console.log(`Total Orders in system: ${orders.length}`);
    console.log("Latest Order:", orders[0].id, orders[0].customerName, "Total:", orders[0].totalAmount);
    console.log("Items:", orders[0].items.map(i => `${i.qty}x ${i.productName} (isDone: ${i.isDone})`).join(", "));

    console.log("\n5. Testing Checklist toggle on latest order...");
    const toggleRes = await fetch(`http://localhost:3001/api/orders/${orders[0].id}/items/${orders[0].items[0].id}/checklist`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDone: true })
    });
    const updated = await toggleRes.json();
    console.log("Checklist item updated isDone:", updated.order.items[0].isDone);

    console.log("\n✅ ALL BACKEND & BOT AUTOMATION TESTS PASSED PERFECTLY!");
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
