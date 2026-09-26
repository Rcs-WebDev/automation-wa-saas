import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { api } from "./services/api";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { OrderManagement } from "./components/Orders/OrderManagement";
import { FlowBuilder } from "./components/FlowBuilder/FlowBuilder";
import { ProductCatalog } from "./components/Products/ProductCatalog";
import { FinancialReport } from "./components/Finance/FinancialReport";
import { WhatsAppConnect } from "./components/WhatsApp/WhatsAppConnect";
import { ChatInbox } from "./components/Inbox/ChatInbox";
import { LiveWhatsAppSimulator } from "./components/Simulator/LiveWhatsAppSimulator";
import { StoreSettingsModal } from "./components/StoreSettingsModal";

export function App() {
  const [activeTab, setActiveTab] = useState("orders"); // orders | flows | products | finance | inbox | whatsapp
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [flows, setFlows] = useState([]);
  const [settings, setSettings] = useState({
    storeName: "Kopi & Roti Nusantara",
    phoneNumber: "6281234567890",
    status: "SIMULATED",
    autoReplyEnabled: true,
    businessHours: "08:00 - 22:00 WIB"
  });
  const [chats, setChats] = useState([]);
  const [qrCodeData, setQrCodeData] = useState("");
  const [pairingCode, setPairingCode] = useState("");
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio Chime Generator using Web Audio API for kitchen order notifications
  const playNewOrderAudio = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.24); // D6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.log("Audio not allowed yet:", e);
    }
  };

  // Initial Load from API
  const loadAllData = async () => {
    try {
      const [settRes, prodRes, ordRes, flowRes, chatRes, qrRes] = await Promise.all([
        api.getSettings(),
        api.getProducts(),
        api.getOrders(),
        api.getFlows(),
        api.getChats(),
        api.getWhatsAppQR()
      ]);

      setSettings(settRes);
      setProducts(prodRes);
      setOrders(ordRes);
      setFlows(flowRes);
      setChats(chatRes);
      if (qrRes && qrRes.qrCode) setQrCodeData(qrRes.qrCode);
    } catch (err) {
      console.error("Error loading initial data:", err);
    }
  };

  useEffect(() => {
    loadAllData();

    // Connect Socket.io — pakai env var di production, localhost di dev
    const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const socket = io(BACKEND_URL);

    socket.on("connect", () => {
      console.log("Connected to FlowWA realtime socket!");
    });

    socket.on("whatsapp_qr_updated", ({ qrCode, status }) => {
      if (qrCode) setQrCodeData(qrCode);
      if (status) setSettings(prev => ({ ...prev, status }));
    });

    socket.on("whatsapp_pairing_code", ({ code }) => {
      if (code) setPairingCode(code);
    });

    socket.on("orders_list_updated", (updatedOrders) => {
      setOrders(updatedOrders);
    });

    socket.on("new_order_created", (newOrder) => {
      setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
      playNewOrderAudio();
    });

    socket.on("products_updated", (updatedProducts) => {
      setProducts(updatedProducts);
    });

    socket.on("flows_updated", (updatedFlows) => {
      setFlows(updatedFlows);
    });

    socket.on("settings_updated", (updatedSettings) => {
      setSettings(updatedSettings);
    });

    socket.on("whatsapp_status_changed", (statusData) => {
      setSettings(prev => ({ ...prev, ...statusData }));
    });

    socket.on("chat_message_received", ({ phone, message, chat }) => {
      setChats(prev => {
        const index = prev.findIndex(c => c.phone === phone);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = chat;
          return updated;
        } else {
          return [chat, ...prev];
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Handlers
  const handleToggleAutoReply = async () => {
    const updated = { ...settings, autoReplyEnabled: !settings.autoReplyEnabled };
    setSettings(updated);
    await api.updateSettings(updated);
  };

  const handleToggleItemChecklist = async (orderId, itemId, isDone) => {
    // Optimistic UI update
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const items = o.items.map(i => i.id === itemId ? { ...i, isDone } : i);
        const allDone = items.every(i => i.isDone);
        return {
          ...o,
          items,
          status: allDone && o.status === "PREPARING" ? "READY" : o.status
        };
      }
      return o;
    }));

    await api.toggleItemChecklist(orderId, itemId, isDone);
  };

  const handleUpdateOrderStatus = async (orderId, updates) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
    await api.updateOrderStatus(orderId, updates);
  };

  const handleNotifyCustomer = async (orderId, customMessage) => {
    await api.notifyCustomer(orderId, customMessage);
  };

  const handleAddProduct = async (productData) => {
    const res = await api.createProduct(productData);
    if (res.data) setProducts(prev => [...prev, res.data]);
  };

  const handleUpdateProduct = async (id, productData) => {
    const res = await api.updateProduct(id, productData);
    if (res.data) setProducts(prev => prev.map(p => p.id === id ? res.data : p));
  };

  const handleDeleteProduct = async (id) => {
    await api.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateFlow = async (id, flowData) => {
    await api.updateFlow(id, flowData);
  };

  const handleConnectSimulated = async (phone) => {
    await api.connectSimulated(phone);
    setSettings(prev => ({ ...prev, status: "SIMULATED", simulatedMode: true, phoneNumber: phone }));
  };

  const handleDisconnect = async () => {
    await api.disconnectWhatsApp();
    setSettings(prev => ({ ...prev, status: "DISCONNECTED" }));
  };

  const handleRefreshQR = async () => {
    const res = await api.getWhatsAppQR();
    setQrCodeData(res.qrCode);
  };

  const handleSendMessage = async (phone, senderName, text) => {
    await api.sendIncomingMessage(phone, senderName, text);
  };

  const handleSendReportViaWA = async (reportText) => {
    await api.sendIncomingMessage(settings.phoneNumber, "Owner Admin", "Laporan hari ini");
    setIsSimulatorOpen(true);
  };

  const handleUpdateStoreSettings = async (formData) => {
    const updated = { ...settings, ...formData };
    setSettings(updated);
    await api.updateSettings(updated);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#090D16]">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ordersCount={orders.filter(o => o.status === "NEW" || o.status === "PREPARING").length}
        isConnected={settings.status === "CONNECTED" || settings.status === "SIMULATED"}
        toggleSimulator={() => setIsSimulatorOpen(!isSimulatorOpen)}
        isSimulatorOpen={isSimulatorOpen}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenSettings={() => { setIsSettingsModalOpen(true); setIsSidebarOpen(false); }}
        storeName={settings.storeName}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          activeTab={activeTab}
          settings={settings}
          onToggleAutoReply={handleToggleAutoReply}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === "orders" && (
            <OrderManagement
              orders={orders}
              onToggleItemChecklist={handleToggleItemChecklist}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onNotifyCustomer={handleNotifyCustomer}
            />
          )}

          {activeTab === "flows" && (
            <FlowBuilder
              flows={flows}
              onUpdateFlow={handleUpdateFlow}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
            />
          )}

          {activeTab === "products" && (
            <ProductCatalog
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === "finance" && (
            <FinancialReport
              orders={orders}
              settings={settings}
              onSendReportViaWA={handleSendReportViaWA}
            />
          )}

          {activeTab === "inbox" && (
            <ChatInbox
              chats={chats}
              onSendMessage={handleSendMessage}
              settings={settings}
            />
          )}

          {activeTab === "whatsapp" && (
            <WhatsAppConnect
              settings={settings}
              onConnectSimulated={handleConnectSimulated}
              onDisconnect={handleDisconnect}
              onRefreshQR={handleRefreshQR}
              qrCodeData={qrCodeData}
              pairingCode={pairingCode}
            />
          )}
        </main>
      </div>

      {/* Floating Interactive Live WhatsApp Simulator */}
      <LiveWhatsAppSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSendMessage={handleSendMessage}
        chats={chats}
        settings={settings}
      />

      {/* Store Settings Modal */}
      <StoreSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={handleUpdateStoreSettings}
      />
    </div>
  );
}

export default App;
