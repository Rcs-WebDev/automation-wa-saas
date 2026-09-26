import React, { useState, useEffect } from "react";
import { X, Store, Clock, Phone, MessageSquare, Save, CheckCircle } from "lucide-react";

export function StoreSettingsModal({ isOpen, onClose, settings, onSave }) {
  const [form, setForm] = useState({
    storeName: "",
    phoneNumber: "",
    businessHours: "",
    welcomeMessage: ""
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync form HANYA saat modal baru dibuka — bukan setiap settings berubah
  useEffect(() => {
    if (isOpen) {
      setForm({
        storeName: settings?.storeName || "",
        phoneNumber: settings?.phoneNumber || "",
        businessHours: settings?.businessHours || "08:00 - 22:00 WIB",
        welcomeMessage: settings?.welcomeMessage || ""
      });
      setSaved(false);
    }
  }, [isOpen]); // ✅ hanya depend pada isOpen, bukan settings

  const handleSave = async () => {
    if (!form.storeName.trim()) return;
    setSaving(true);
    try {
      await onSave(form);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1200);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-md bg-[#0F172A] border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/60 pointer-events-auto animate-slideUp"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <Store className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Pengaturan Toko</h2>
                <p className="text-[11px] text-slate-400">Ubah profil & informasi toko</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-5 space-y-4">
            {/* Nama Toko */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                Nama Toko <span className="text-red-400">*</span>
              </label>
              <input
                id="store-name-input"
                type="text"
                value={form.storeName}
                onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))}
                placeholder="contoh: Kopi & Roti Nusantara"
                className="w-full bg-slate-900/80 border border-slate-700 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
              <p className="text-[10px] text-slate-500 mt-1">Nama ini muncul di pesan bot & header simulator WA</p>
            </div>

            {/* Nomor WhatsApp */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Nomor WhatsApp Toko
              </label>
              <input
                id="store-phone-input"
                type="text"
                value={form.phoneNumber}
                onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                placeholder="contoh: 6281234567890"
                className="w-full bg-slate-900/80 border border-slate-700 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
              />
            </div>

            {/* Jam Operasional */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Jam Operasional
              </label>
              <input
                id="store-hours-input"
                type="text"
                value={form.businessHours}
                onChange={e => setForm(f => ({ ...f, businessHours: e.target.value }))}
                placeholder="contoh: 08:00 - 22:00 WIB"
                className="w-full bg-slate-900/80 border border-slate-700 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* Pesan Sambutan Bot */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                Pesan Sambutan Bot
              </label>
              <textarea
                id="store-welcome-input"
                rows={3}
                value={form.welcomeMessage}
                onChange={e => setForm(f => ({ ...f, welcomeMessage: e.target.value }))}
                placeholder="Halo! Selamat datang di toko kami..."
                className="w-full bg-slate-900/80 border border-slate-700 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all resize-none leading-relaxed"
              />
              <p className="text-[10px] text-slate-500 mt-1">Pesan pertama yang dikirim bot ke pelanggan baru</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 pb-5 flex gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              Batal
            </button>
            <button
              id="store-settings-save-btn"
              onClick={handleSave}
              disabled={!form.storeName.trim() || saving}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                saved
                  ? "bg-emerald-600 text-white"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              {saved ? (
                <><CheckCircle className="w-4 h-4" /> Tersimpan!</>
              ) : saving ? (
                <><div className="w-4 h-4 border-2 border-slate-900/50 border-t-slate-900 rounded-full animate-spin" /> Menyimpan...</>
              ) : (
                <><Save className="w-4 h-4" /> Simpan Perubahan</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
