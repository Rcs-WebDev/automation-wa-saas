import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Calendar, 
  CheckCircle2, 
  Send, 
  Download, 
  Sparkles,
  Smartphone,
  CreditCard,
  Flame,
  ArrowUpRight
} from "lucide-react";

export function FinancialReport({ orders, settings, onSendReportViaWA }) {
  const [selectedRange, setSelectedRange] = useState("TODAY");
  const [reportSent, setReportSent] = useState(false);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Compute Metrics from orders
  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter(o => o.status !== "CANCELLED");
  const completedOrders = todayOrders.filter(o => o.status === "COMPLETED" || o.paymentStatus === "PAID");

  const totalRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = todayOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Item Sales Aggregation
  const itemMap = {};
  const paymentMap = {};

  todayOrders.forEach(order => {
    paymentMap[order.paymentMethod] = (paymentMap[order.paymentMethod] || 0) + order.totalAmount;
    order.items.forEach(item => {
      if (!itemMap[item.productName]) {
        itemMap[item.productName] = { qty: 0, revenue: 0, price: item.price };
      }
      itemMap[item.productName].qty += item.qty;
      itemMap[item.productName].revenue += item.subtotal;
    });
  });

  const topItems = Object.entries(itemMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  // Generate WhatsApp Message Preview
  const generatePreviewMessage = () => {
    let text = `📊 *LAPORAN KEUANGAN & OMSET HARI INI*\n`;
    text += `🏪 Toko: *${settings.storeName || "Kopi & Roti Nusantara"}*\n`;
    text += `📅 Tanggal: *${new Date().toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}*\n`;
    text += `====================================\n\n`;
    text += `💰 *TOTAL OMSET HARI INI:*\n👉 *${formatRupiah(totalRevenue)}*\n\n`;
    text += `📈 *RINGKASAN TRANSAKSI:*\n`;
    text += `• Total Pesanan: *${totalOrdersCount} Pesanan*\n`;
    text += `• Selesai/Lunas: *${completedOrders.length} Pesanan*\n`;
    text += `• Rata-rata per Struk: *${formatRupiah(avgOrderValue)}*\n\n`;
    text += `🏆 *PRODUK TERLARIS:*\n`;
    if (topItems.length === 0) {
      text += `• Belum ada transaksi tercatat hari ini.\n`;
    } else {
      topItems.slice(0, 4).forEach((item, idx) => {
        text += `${idx + 1}. *${item.name}* : ${item.qty} terjual (${formatRupiah(item.revenue)})\n`;
      });
    }
    text += `\n💳 *METODE PEMBAYARAN:*\n`;
    for (const [pm, amt] of Object.entries(paymentMap)) {
      text += `• ${pm}: ${formatRupiah(amt)}\n`;
    }
    text += `\n====================================\n_Laporan dihasilkan otomatis oleh FlowWA Automation._`;
    return text;
  };

  const handleSendToOwner = async () => {
    setReportSent(true);
    if (onSendReportViaWA) {
      await onSendReportViaWA(generatePreviewMessage());
    }
    setTimeout(() => setReportSent(false), 3000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header and Quick WA Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" /> Laporan Keuangan & Rekap Pendapatan
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Data penjualan otomatis tercatat secara real-time dari setiap pesanan yang masuk melalui chatbot WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSendToOwner}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
              reportSent 
                ? "bg-emerald-500 text-slate-950 shadow-emerald-500/25" 
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{reportSent ? "Rekap Terkirim ke WA Owner! ✅" : "Kirim Rekap ke WA Owner Sekarang"}</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-slate-800 bg-gradient-to-br from-emerald-950/30 to-slate-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Total Pendapatan (Omset)</p>
              <h3 className="text-2xl font-black text-white mt-1">{formatRupiah(totalRevenue)}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Realtime dari {totalOrdersCount} pesanan hari ini</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pesanan Masuk</p>
              <h3 className="text-2xl font-black text-white mt-1">{totalOrdersCount} <span className="text-sm font-normal text-slate-400">transaksi</span></h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            {completedOrders.length} Pesanan Lunas / Selesai
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rata-rata Nilai Order (AOV)</p>
              <h3 className="text-2xl font-black text-white mt-1">{formatRupiah(avgOrderValue)}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Nilai rata-rata tiap pelanggan berbelanja
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu Terlaris</p>
              <h3 className="text-base font-black text-emerald-400 mt-1 truncate">
                {topItems[0]?.name || "Belum Ada"}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            {topItems[0] ? `${topItems[0].qty} porsi terjual (${formatRupiah(topItems[0].revenue)})` : "-"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Product Sales Table */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" /> Rincian Penjualan per Produk Hari Ini
            </h3>
            <span className="text-xs text-slate-400">{topItems.length} Produk Terjual</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80">
                  <th className="pb-3 font-semibold">Nama Produk</th>
                  <th className="pb-3 font-semibold text-center">Qty Terjual</th>
                  <th className="pb-3 font-semibold text-right">Harga Satuan</th>
                  <th className="pb-3 font-semibold text-right">Total Pendapatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {topItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      Belum ada produk terjual hari ini.
                    </td>
                  </tr>
                ) : (
                  topItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-3 font-medium text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        {item.name}
                      </td>
                      <td className="py-3 text-center font-mono font-bold text-slate-300">
                        {item.qty}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-400">
                        {formatRupiah(item.price)}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-400">
                        {formatRupiah(item.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Payment Method Breakdown */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-400" /> Metode Pembayaran Diterima:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(paymentMap).map(([method, amount]) => (
                <div key={method} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <span className="text-slate-400 block">{method}</span>
                  <span className="text-sm font-bold text-white font-mono mt-1 block">
                    {formatRupiah(amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: WhatsApp Bot Live Report Preview */}
        <div className="glass-panel rounded-2xl border-slate-800 p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white">Format Laporan WhatsApp</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Bot Auto-Reply
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              Kapan saja Owner/Admin mengetik <span className="text-emerald-300 font-mono font-bold">"Laporan hari ini"</span> atau <span className="text-emerald-300 font-mono font-bold">"Rekap omset"</span> di WhatsApp, Bot akan langsung membalas dengan format rapi ini:
            </p>

            {/* WA Bubble Preview */}
            <div className="mt-3 p-4 rounded-2xl bg-[#0b141a] border border-[#202c33] text-xs font-mono text-slate-200 whitespace-pre-line leading-relaxed shadow-inner max-h-96 overflow-y-auto">
              {generatePreviewMessage()}
            </div>
          </div>

          <button
            onClick={handleSendToOwner}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kirim Tes Pesan ke Simulator</span>
          </button>
        </div>
      </div>
    </div>
  );
}
