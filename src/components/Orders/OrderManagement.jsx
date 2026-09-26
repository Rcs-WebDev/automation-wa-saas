import React, { useState } from "react";
import confetti from "canvas-confetti";
import { 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  ChefHat, 
  CheckSquare, 
  Square, 
  User, 
  Phone, 
  FileText, 
  Search,
  Filter,
  Check,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ExternalLink
} from "lucide-react";

export function OrderManagement({ orders, onToggleItemChecklist, onUpdateOrderStatus, onNotifyCustomer }) {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingOrderId, setSendingOrderId] = useState(null);
  const [notifSuccess, setNotifSuccess] = useState({});

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const filteredOrders = orders.filter(order => {
    const matchStatus = filterStatus === "ALL" || order.status === filterStatus;
    const matchSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== "CANCELLED" ? o.totalAmount : 0), 0);
  const newCount = orders.filter(o => o.status === "NEW").length;
  const preparingCount = orders.filter(o => o.status === "PREPARING").length;
  const readyCount = orders.filter(o => o.status === "READY").length;
  const completedCount = orders.filter(o => o.status === "COMPLETED").length;

  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === "COMPLETED") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    await onUpdateOrderStatus(orderId, { status: newStatus });
  };

  const handleSendNotif = async (order) => {
    setSendingOrderId(order.id);
    await onNotifyCustomer(order.id);
    setSendingOrderId(null);
    setNotifSuccess(prev => ({ ...prev, [order.id]: true }));
    setTimeout(() => {
      setNotifSuccess(prev => ({ ...prev, [order.id]: false }));
    }, 3000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "NEW":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 animate-pulse"><Clock className="w-3 h-3" /> Pesanan Baru</span>;
      case "PREPARING":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1.5"><ChefHat className="w-3 h-3" /> Sedang Dibuat</span>;
      case "READY":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Siap / Selesai Masak</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700/50 text-slate-300 border border-slate-600 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Selesai</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-slate-800 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Omset Pesanan</p>
              <h3 className="text-2xl font-black text-white mt-1">{formatRupiah(totalRevenue)}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-400/90 mt-3 flex items-center gap-1">
            <span>✨ {orders.length} total transaksi tercatat</span>
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Perlu Dibuat (Dapur)</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{newCount + preparingCount} <span className="text-sm font-normal text-slate-400">antrean</span></h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
          </div>
          <div className="flex gap-2 mt-3 text-xs text-slate-400">
            <span>{newCount} Baru</span> • <span>{preparingCount} Sedang Dirajang</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Siap Disajikan / Diantar</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{readyCount} <span className="text-sm font-normal text-slate-400">pesanan</span></h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Menunggu penyerahan customer</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pesanan Selesai</p>
              <h3 className="text-2xl font-black text-slate-200 mt-1">{completedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Transaksi beres hari ini</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-3.5 rounded-2xl border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: "ALL", label: "Semua Pesanan", count: orders.length },
            { id: "NEW", label: "Pesanan Baru", count: newCount, alert: newCount > 0 },
            { id: "PREPARING", label: "Sedang Dibuat", count: preparingCount },
            { id: "READY", label: "Siap / Ready", count: readyCount },
            { id: "COMPLETED", label: "Selesai", count: completedCount }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                filterStatus === tab.id
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                filterStatus === tab.id
                  ? "bg-slate-950 text-white font-bold"
                  : tab.alert ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse" : "bg-slate-800 text-slate-400"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari No. Order, Nama, No WA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Tidak ada pesanan ditemukan</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery ? "Coba ubah kata kunci pencarian Anda." : "Pesanan baru dari chat WhatsApp akan otomatis masuk dan tampil di sini!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredOrders.map((order) => {
            const completedItemsCount = order.items.filter(i => i.isDone).length;
            const progressPercent = Math.round((completedItemsCount / order.items.length) * 100);

            return (
              <div 
                key={order.id} 
                className={`glass-panel rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  order.status === "NEW" 
                    ? "border-amber-500/40 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20" 
                    : order.status === "READY" 
                    ? "border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                    : "border-slate-800"
                }`}
              >
                <div>
                  {/* Order Header */}
                  <div className="p-5 border-b border-slate-800/80 flex items-start justify-between bg-slate-900/40">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-white tracking-wider">#{order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                        <span className="flex items-center gap-1 font-semibold text-slate-100">
                          <User className="w-3.5 h-3.5 text-slate-400" /> {order.customerName}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                          <Phone className="w-3.5 h-3.5 text-slate-500" /> {order.customerPhone}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-slate-400">
                        {new Date(order.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                      </span>
                      <div className="mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          order.paymentStatus === "PAID" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        }`}>
                          {order.paymentStatus === "PAID" ? `LUNAS (${order.paymentMethod})` : `BELUM LUNAS (${order.paymentMethod})`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Checklist Section - The Core Requirement! */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-emerald-400" /> Checklist Dapur / Pengerjaan:
                      </span>
                      <span className={`font-semibold ${progressPercent === 100 ? "text-emerald-400" : "text-amber-400"}`}>
                        {completedItemsCount}/{order.items.length} Item Selesai ({progressPercent}%)
                      </span>
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${progressPercent === 100 ? "bg-emerald-400" : "bg-amber-400"}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* Interactive Checklist Items */}
                    <div className="space-y-2 mt-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => onToggleItemChecklist(order.id, item.id, !item.isDone)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                            item.isDone
                              ? "bg-emerald-950/20 border-emerald-500/30 text-slate-300 opacity-90"
                              : "bg-slate-900/80 border-slate-800 hover:border-slate-700 text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                              item.isDone ? "bg-emerald-500 text-slate-950" : "border border-slate-600 bg-slate-800"
                            }`}>
                              {item.isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                            </div>
                            <div>
                              <span className={`text-xs font-semibold ${item.isDone ? "line-through text-slate-400" : "text-slate-100"}`}>
                                {item.qty}x {item.productName}
                              </span>
                              <div className="text-[11px] text-slate-500">
                                @ {formatRupiah(item.price)}
                              </div>
                            </div>
                          </div>
                          <span className={`text-xs font-mono font-semibold ${item.isDone ? "text-slate-500" : "text-emerald-400"}`}>
                            {formatRupiah(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Customer Notes */}
                    {order.notes && order.notes !== "Standar / Normal" && (
                      <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                        <FileText className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                        <div>
                          <span className="font-bold">Catatan Pelanggan:</span> {order.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer & Action Buttons */}
                <div className="p-5 border-t border-slate-800/80 bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">Total Pembayaran:</span>
                    <h4 className="text-lg font-black text-white">{formatRupiah(order.totalAmount)}</h4>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Notify Customer WA button */}
                    <button
                      onClick={() => handleSendNotif(order)}
                      disabled={sendingOrderId === order.id}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        notifSuccess[order.id]
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                      }`}
                      title="Kirim pesan status WhatsApp ke nomor pelanggan"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{notifSuccess[order.id] ? "WA Terkirim!" : "Update WA"}</span>
                    </button>

                    {/* Status Workflow Progress Action */}
                    {order.status === "NEW" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "PREPARING")}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all active:scale-95"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Mulai Buat</span>
                      </button>
                    )}

                    {order.status === "PREPARING" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "READY")}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md transition-all active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Tandai Siap</span>
                      </button>
                    )}

                    {order.status === "READY" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "COMPLETED")}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Selesaikan</span>
                      </button>
                    )}

                    {order.status === "COMPLETED" && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-lg">
                        <Check className="w-4 h-4" /> Beres
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
