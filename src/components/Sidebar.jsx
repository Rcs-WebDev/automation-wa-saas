import React from "react";
import { 
  GitFork, 
  ShoppingBag, 
  Package, 
  BarChart3, 
  MessageSquare, 
  Smartphone, 
  Store,
  Sparkles,
  Settings,
  X
} from "lucide-react";

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  ordersCount, 
  isConnected, 
  toggleSimulator, 
  isSimulatorOpen,
  isOpen,
  onClose,
  onOpenSettings,
  storeName
}) {
  const navItems = [
    { id: "orders", label: "Pesanan & Checklist", icon: ShoppingBag, badge: ordersCount },
    { id: "flows", label: "Flow Otomasi (n8n)", icon: GitFork, isNew: true },
    { id: "products", label: "Katalog & Harga", icon: Package },
    { id: "finance", label: "Laporan Keuangan", icon: BarChart3, highlight: true },
    { id: "inbox", label: "Live Chat CS", icon: MessageSquare },
    { id: "whatsapp", label: "Koneksi WhatsApp", icon: Smartphone, statusDot: true },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (onClose) onClose(); // tutup sidebar di mobile setelah pilih menu
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 w-72
          bg-[#0F172A]/98 border-r border-slate-800/80 
          flex flex-col justify-between p-4
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto lg:w-64 lg:min-h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div>
          {/* Header: Brand Logo + Mobile Close button */}
          <div className="flex items-center justify-between px-2 py-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-white">Flow<span className="text-emerald-400">WA</span></span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">SaaS</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">WhatsApp Automation Hub</p>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Store Profile Badge — dengan tombol edit */}
          <button
            id="store-settings-trigger"
            onClick={onOpenSettings}
            className="w-full mx-0 mb-5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                <Store className="w-4 h-4" />
              </div>
              <div className="truncate text-left">
                <p className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">
                  {storeName || "Nama Toko"}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                  <span className="text-[11px] text-slate-400">{isConnected ? "WA Terhubung" : "Menunggu QR"}</span>
                </div>
              </div>
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 transition-colors" />
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? "bg-white text-emerald-700" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.isNew && !isActive && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        NEW
                      </span>
                    )}
                    {item.highlight && !isActive && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Omset
                      </span>
                    )}
                    {item.statusDot && isConnected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Simulator Button */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <button
            id="sidebar-simulator-toggle"
            onClick={toggleSimulator}
            className={`w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isSimulatorOpen
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-sm"
                : "bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>{isSimulatorOpen ? "Tutup Simulator WA" : "Buka Simulator WA"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
