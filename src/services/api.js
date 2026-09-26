const API_BASE = "";

export const api = {
  // Store & WhatsApp
  async getSettings() {
    const res = await fetch(`${API_BASE}/api/settings`);
    return res.json();
  },
  async updateSettings(settings) {
    const res = await fetch(`${API_BASE}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });
    return res.json();
  },
  async getWhatsAppQR() {
    const res = await fetch(`${API_BASE}/api/whatsapp/qr`);
    return res.json();
  },
  async connectSimulated(phone) {
    const res = await fetch(`${API_BASE}/api/whatsapp/connect-simulated`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });
    return res.json();
  },
  async disconnectWhatsApp() {
    const res = await fetch(`${API_BASE}/api/whatsapp/disconnect`, {
      method: "POST"
    });
    return res.json();
  },

  // Products
  async getProducts() {
    const res = await fetch(`${API_BASE}/api/products`);
    return res.json();
  },
  async createProduct(product) {
    const res = await fetch(`${API_BASE}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    });
    return res.json();
  },
  async updateProduct(id, product) {
    const res = await fetch(`${API_BASE}/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    });
    return res.json();
  },
  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/api/products/${id}`, {
      method: "DELETE"
    });
    return res.json();
  },

  // Orders
  async getOrders() {
    const res = await fetch(`${API_BASE}/api/orders`);
    return res.json();
  },
  async toggleItemChecklist(orderId, itemId, isDone) {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/items/${itemId}/checklist`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDone })
    });
    return res.json();
  },
  async updateOrderStatus(orderId, updates) {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    return res.json();
  },
  async notifyCustomer(orderId, customMessage) {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/notify-customer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customMessage })
    });
    return res.json();
  },

  // Financial Analytics
  async getFinancialReport() {
    const res = await fetch(`${API_BASE}/api/analytics/financial-report`);
    return res.json();
  },

  // Visual Flows
  async getFlows() {
    const res = await fetch(`${API_BASE}/api/flows`);
    return res.json();
  },
  async updateFlow(id, flow) {
    const res = await fetch(`${API_BASE}/api/flows/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flow)
    });
    return res.json();
  },

  // Live Chat & WhatsApp Simulator
  async getChats() {
    const res = await fetch(`${API_BASE}/api/chats`);
    return res.json();
  },
  async sendIncomingMessage(phone, senderName, text) {
    const res = await fetch(`${API_BASE}/api/whatsapp/incoming-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, senderName, text })
    });
    return res.json();
  }
};
