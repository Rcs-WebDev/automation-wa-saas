import React from "react";
import { 
  Bot, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Sparkles,
  Zap,
  Menu
} from "lucide-react";

export function Topbar({ 
  activeTab, 
  settings, 
  onToggleAutoReply, 
  soundEnabled, 
  setSoundEnabled,
  onOpenSimulator,
  onOpenSidebar
}) {
  const titles = {
    orders: { title: "Daftar & Checklist Pesanan", subtitle: "Pesanan masuk real-time dari WhatsApp dengan checklist pengerjaan dapur/toko" },
    flows: { title: "Visual Automation Builder", subtitle: "Rancang alur logika percakapan bot bergaya n8n node canvas" },
    products: { title: "Katalog Produk & Database Harga", subtitle: "Data harga real-time yang dibaca bot saat pelanggan bertanya atau order" },
    finance: { title: "Laporan Keuangan & Omset", subtitle: "Pantau omset harian & kirim rekap otomatis ke nomor WhatsApp owner" },
    inbox: { title: "Live Chat CS & Pelanggan", subtitle: "Pantau percakapan langsung dan ambil alih chat dari AI kapan saja" },
    whatsapp: { title: "Integrasi & Perangkat WhatsApp", subtitle: "Kelola koneksi QR Code dan status sesi WhatsApp multi-device" }
  };

  const current = titles[activeTab] || { title: "Dashboard", subtitle: "FlowWA WhatsApp Automation" };
  const isConnected = settings.status === "CONNECTED" || settings.status === "SIMULATED";

  return (
    <header className="h-16 lg:h-20 bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 gap-3">
      {/* Left: Hamburger (mobile) + Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          id="mobile-menu-toggle"
          onClick={onOpenSidebar}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Brand icon on mobile (replaces full sidebar logo) */}
        <div className="lg:hidden w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>

        <div className="min-w-0">
          <h1 className="text-sm lg:text-xl font-bold text-white tracking-tight truncate">
            {current.title}
          </h1>
          <p className="hidden lg:block text-xs text-slate-400 mt-0.5 truncate">{current.subtitle}</p>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 lg:gap-4 shrink-0">
        {/* Sound toggle — hide label on mobile */}
        <button
          id="sound-toggle-btn"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? "Notifikasi Suara Aktif" : "Notifikasi Suara Hening"}
          className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            soundEnabled 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
              : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline">{soundEnabled ? "Suara ON" : "Mute"}</span>
        </button>

        {/* Bot Auto-Reply Toggle — hide on small mobile */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
          <Bot className={`w-4 h-4 ${settings.autoReplyEnabled ? "text-emerald-400 animate-bounce" : "text-slate-500"}`} />
          <span className="hidden md:inline text-xs font-medium text-slate-300">Bot Auto-Reply</span>
          <button
            id="auto-reply-toggle"
            onClick={onToggleAutoReply}
            className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
              settings.autoReplyEnabled ? "bg-emerald-500" : "bg-slate-700"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                settings.autoReplyEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* WA Status Badge */}
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
          isConnected 
            ? "bg-emerald-950/40 border-emerald-500/30" 
            : "bg-amber-950/30 border-amber-500/30"
        }`}>
          <div className="relative">
            <span className={`w-2.5 h-2.5 rounded-full block ${isConnected ? "bg-emerald-400" : "bg-amber-400"}`} />
            {isConnected && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block absolute top-0 left-0 animate-ping" />
            )}
          </div>
          <span className={`text-xs font-bold ${isConnected ? "text-emerald-400" : "text-amber-400"}`}>
            {isConnected ? "WA Online" : "WA Offline"}
          </span>
        </div>

        {/* Simulator Button */}
        <button
          id="topbar-simulator-btn"
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span className="hidden sm:inline">Tes Simulasi WA</span>
        </button>
      </div>
    </header>
  );
}
