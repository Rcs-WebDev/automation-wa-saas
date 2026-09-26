import React, { useState, useEffect } from "react";
import { 
  Smartphone, 
  QrCode, 
  Key, 
  Wifi, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  BatteryMedium, 
  LogOut, 
  Sparkles,
  Zap,
  Phone,
  Camera,
  Copy,
  Check,
  Radio,
  ArrowRight,
  Info
} from "lucide-react";

export function WhatsAppConnect({ 
  settings, 
  onConnectSimulated, 
  onDisconnect, 
  onRefreshQR, 
  qrCodeData, 
  pairingCode 
}) {
  const [method, setMethod] = useState("QR"); // QR | PAIRING | DEMO
  const [phoneNumberInput, setPhoneNumberInput] = useState("");
  const [pairLoading, setPairLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isConnected = settings.status === "CONNECTED" || settings.status === "SIMULATED";

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshQR();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleRequestPairingCode = async (e) => {
    e.preventDefault();
    if (!phoneNumberInput) return;
    setPairLoading(true);
    try {
      await fetch("/api/whatsapp/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumberInput })
      });
    } catch (e) {
      console.error(e);
    }
    setPairLoading(false);
  };

  const copyPairingCode = () => {
    if (!pairingCode) return;
    navigator.clipboard.writeText(pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-400" /> Hubungkan WhatsApp Nyata (Real Multi-Device)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Hubungkan nomor WhatsApp toko/bisnis Anda secara langsung. Setelah terhubung, nomor ini akan membalas chat pembeli asli secara otomatis 24 jam non-stop!
        </p>
      </div>

      {/* Connection Status Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isConnected 
          ? "glass-panel border-emerald-500/40 bg-emerald-950/20 shadow-lg shadow-emerald-500/10" 
          : "glass-panel border-amber-500/30 bg-amber-950/10"
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isConnected ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}>
              <Smartphone className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  {isConnected ? "WhatsApp Resmi Terhubung & Aktif" : "Menunggu Sambungan WhatsApp"}
                </h3>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  isConnected ? "bg-emerald-500 text-slate-950" : "bg-amber-500 text-slate-950 animate-pulse"
                }`}>
                  {isConnected ? "ONLINE & SIAP CS" : "BELUM TERSAMBUNG"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {isConnected 
                  ? `Nomor Terhubung: +${settings.phoneNumber || "628xxx"} • Chat yang masuk ke nomor ini akan dibalas otomatis oleh FlowWA.` 
                  : "Pilih salah satu metode di bawah untuk menghubungkan WhatsApp toko Anda ke sistem ini."}
              </p>
            </div>
          </div>

          {isConnected ? (
            <button
              onClick={onDisconnect}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Putuskan Koneksi</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onConnectSimulated("6281234567890")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                title="Bagi Anda yang ingin melihat demonstrasi tanpa scan"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Mode Coba Cepat (Demo)</span>
              </button>
            </div>
          )}
        </div>

        {isConnected && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 block">Status Mesin:</span>
              <span className="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-ping" /> Baileys Multi-Device Live
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Nomor WhatsApp:</span>
              <span className="font-semibold text-white font-mono mt-0.5 block">+{settings.phoneNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Penyimpanan Sesi:</span>
              <span className="font-semibold text-teal-400 mt-0.5 block">Tersimpan Permanen (Auto-Reconnect)</span>
            </div>
            <div>
              <span className="text-slate-400 block">Enkripsi:</span>
              <span className="font-semibold text-white mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Official E2E
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Connection Mode Selection Tabs */}
      {!isConnected && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 w-fit">
            <button
              onClick={() => setMethod("QR")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                method === "QR" 
                  ? "bg-emerald-500 text-slate-950 shadow-md" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Metode 1: Scan Kode QR (Paling Cepat)</span>
            </button>
            <button
              onClick={() => setMethod("PAIRING")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                method === "PAIRING" 
                  ? "bg-emerald-500 text-slate-950 shadow-md" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Key className="w-4 h-4" />
              <span>Metode 2: Kode Pairing 8-Digit (Tanpa Kamera)</span>
            </button>
          </div>

          {/* METHOD 1: QR CODE */}
          {method === "QR" && (
            <div className="glass-panel rounded-2xl border-slate-800 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-md">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  <Camera className="w-4 h-4" /> Scan dengan WhatsApp di HP Anda
                </div>

                <h4 className="text-base font-bold text-white">
                  Langkah-langkah menghubungkan via QR Code:
                </h4>

                <ol className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                    <span>Buka aplikasi <b>WhatsApp</b> di handphone Anda.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                    <span>Ketuk menu titik tiga <b>(⋮)</b> di Android, atau menu <b>Pengaturan / Settings</b> di iPhone.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                    <span>Pilih <b>Perangkat Tertaut (Linked Devices)</b> $\rightarrow$ ketuk <b>Tautkan Perangkat</b>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">4</span>
                    <span>Arahkan kamera HP Anda ke <b>Kode QR</b> di samping kanan ini.</span>
                  </li>
                </ol>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sistem otomatis menyambung seketika setelah scan berhasil tanpa perlu refresh halaman.</span>
                </div>
              </div>

              {/* QR Code Graphic Box */}
              <div className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-2xl border-4 border-slate-700/50 relative">
                {qrCodeData ? (
                  <img 
                    src={qrCodeData} 
                    alt="Real WhatsApp QR Code" 
                    className="w-64 h-64 object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-64 h-64 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-500 gap-2">
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                    <span className="text-xs font-semibold">Menyiapkan QR Code Resmi...</span>
                  </div>
                )}
                
                <button
                  onClick={handleRefresh}
                  className="mt-3 flex items-center gap-1.5 text-xs text-slate-700 hover:text-emerald-700 font-bold transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span>Muat Ulang QR Code</span>
                </button>
              </div>
            </div>
          )}

          {/* METHOD 2: PAIRING CODE */}
          {method === "PAIRING" && (
            <div className="glass-panel rounded-2xl border-slate-800 p-8 space-y-6">
              <div className="max-w-xl space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  <Key className="w-4 h-4" /> Sambungkan Pakai Nomor Telepon
                </div>
                <h4 className="text-base font-bold text-white">Masukkan Nomor WhatsApp Bisnis Anda:</h4>
                <p className="text-xs text-slate-400">
                  Sistem akan meminta kode 8 digit ke server WhatsApp. Anda cukup mengetikkan kode tersebut di notifikasi WhatsApp di HP Anda.
                </p>
              </div>

              <form onSubmit={handleRequestPairingCode} className="max-w-md flex gap-2">
                <input
                  type="text"
                  value={phoneNumberInput}
                  onChange={(e) => setPhoneNumberInput(e.target.value)}
                  placeholder="Contoh: 628123456789 (awalan 62)"
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={pairLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md transition-all active:scale-95 shrink-0"
                >
                  {pairLoading ? "Meminta Kode..." : "Dapatkan Kode 8-Digit"}
                </button>
              </form>

              {pairingCode && (
                <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/40 max-w-md space-y-3">
                  <span className="text-xs font-semibold text-slate-400 block">Kode Pairing Anda:</span>
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-2xl font-black font-mono text-emerald-400 tracking-widest">{pairingCode}</span>
                    <button
                      onClick={copyPairingCode}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Tersalin!" : "Salin"}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Buka notifikasi WhatsApp di HP Anda yang bertuliskan <i>"Masukkan kode untuk menautkan perangkat"</i> lalu masukkan kode di atas.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Real Customer CS Flow Card */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" /> Cara Kerja Bot WhatsApp Nyata Setelah Terhubung:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">1</span>
            <h5 className="font-bold text-white">Pelanggan Mengirim Pesan WA</h5>
            <p className="text-slate-400 text-[11px]">
              Customer mengetik di WA pribadinya, misalnya: <i>"Kak mau pesan 2 Kopi Gula Aren dan 1 Croissant"</i> atau <i>"Harga menu apa aja?"</i>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">2</span>
            <h5 className="font-bold text-white">Bot Membaca Harga & Menghitung</h5>
            <p className="text-slate-400 text-[11px]">
              Bot langsung membaca database harga di tab <b>Katalog</b>, menghitung total belanja, dan membalas pesan WhatsApp customer dalam hitungan detik.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">3</span>
            <h5 className="font-bold text-white">Pesanan Masuk ke Dashboard & Checklist</h5>
            <p className="text-slate-400 text-[11px]">
              Pesanan langsung muncul di tab <b>Pesanan & Checklist</b>. Dapur tinggal mencentang item yang sudah dibuat dan omset otomatis terakumulasi di <b>Laporan Keuangan</b>!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
