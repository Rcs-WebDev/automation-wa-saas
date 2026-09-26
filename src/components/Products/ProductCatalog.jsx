import React, { useState } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  DollarSign, 
  Tag, 
  Layers, 
  Sparkles,
  Calculator,
  MessageSquareQuote,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export function ProductCatalog({ products, onAddProduct, onUpdateProduct, onDeleteProduct }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Price Bot Test Query state
  const [testQuery, setTestQuery] = useState("kopi gula aren 2 cup dan 1 croissant");
  const [testResult, setTestResult] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "Minuman Kopi",
    price: "",
    unit: "cup",
    stock: 50,
    inStock: true,
    description: "",
    aliases: ""
  });

  const categories = ["ALL", ...new Set(products.map(p => p.category))];

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === "ALL" || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "Minuman Kopi",
      price: "",
      unit: "cup",
      stock: 50,
      inStock: true,
      description: "",
      aliases: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      price: p.price,
      unit: p.unit,
      stock: p.stock,
      inStock: p.inStock,
      description: p.description || "",
      aliases: (p.aliases || []).join(", ")
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const payload = {
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      unit: formData.unit,
      stock: Number(formData.stock),
      inStock: formData.inStock,
      description: formData.description,
      aliases: formData.aliases ? formData.aliases.split(",").map(s => s.trim().toLowerCase()) : [formData.name.toLowerCase()]
    };

    if (editingProduct) {
      await onUpdateProduct(editingProduct.id, payload);
    } else {
      await onAddProduct(payload);
    }
    setIsModalOpen(false);
  };

  // Live Test Price Calculator Simulation
  const runPriceTest = () => {
    const lower = testQuery.toLowerCase();
    const matched = [];
    let total = 0;

    products.forEach(p => {
      const terms = [p.name.toLowerCase(), ...(p.aliases || [])];
      for (const t of terms) {
        if (lower.includes(t)) {
          const numMatch = lower.match(new RegExp(`(\\d+)\\s*(?:x|pcs|cup|porsi)?\\s*${t}`)) ||
                           lower.match(new RegExp(`${t}\\s*(?:sebanyak|isi)?\\s*(\\d+)`));
          const qty = numMatch ? parseInt(numMatch[1], 10) : 1;
          const subtotal = p.price * qty;
          total += subtotal;
          matched.push({ product: p, qty, subtotal });
          break;
        }
      }
    });

    setTestResult({
      items: matched,
      totalAmount: total,
      generatedResponse: matched.length > 0 
        ? `📋 Kalkulasi Bot WA:\n` + matched.map(m => `• ${m.qty}x ${m.product.name} @ ${formatRupiah(m.product.price)} = ${formatRupiah(m.subtotal)}`).join("\n") + `\n💰 TOTAL HARGA: ${formatRupiah(total)}`
        : "Bot tidak menemukan nama produk yang cocok dalam pesan ini."
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" /> Katalog Produk & Data Harga
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Data harga ini menjadi acuan utama Chatbot WhatsApp saat membalas pertanyaan harga dan menghitung total order pelanggan.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tambah Menu / Produk</span>
        </button>
      </div>

      {/* Interactive Price Calculation Tester Box */}
      <div className="glass-panel p-5 rounded-2xl border-emerald-500/30 bg-emerald-950/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-emerald-300">Uji Kecerdasan Bot (Hitung Harga Otomatis)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Live Price Parser</span>
        </div>

        <p className="text-xs text-slate-300">
          Coba ketik pertanyaan pelanggan (misal: jumlah + nama produk), dan lihat bagaimana bot mencari harga dan menjumlahkan totalnya:
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Contoh: kopi gula aren 2 cup dan 1 croissant butter"
            className="flex-1 px-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            onClick={runPriceTest}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tes Respon Bot</span>
          </button>
        </div>

        {testResult && (
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-line animate-fadeIn">
            {testResult.generatedResponse}
          </div>
        )}
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-3.5 rounded-2xl border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {cat === "ALL" ? "Semua Kategori" : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama produk / kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <div 
            key={product.id}
            className="glass-panel rounded-2xl p-5 border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {product.category}
                  </span>
                  <h3 className="text-base font-bold text-white mt-2 group-hover:text-emerald-300 transition-colors">
                    {product.name}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-black text-emerald-400">
                    {formatRupiah(product.price)}
                  </span>
                  <p className="text-[11px] text-slate-500">per {product.unit}</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                {product.description || "Tidak ada deskripsi tambahan."}
              </p>

              {product.aliases && product.aliases.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {product.aliases.slice(0, 3).map((alias, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400">
                      #{alias}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${product.inStock ? "bg-emerald-400" : "bg-rose-500"}`} />
                <span className="text-slate-400">
                  {product.inStock ? `Tersedia (${product.stock} ${product.unit})` : "Stok Habis"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(product)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Edit Produk & Harga"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteProduct(product.id)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                  title="Hapus Produk"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-elevated w-full max-w-lg rounded-2xl border-slate-700 p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                {editingProduct ? "Edit Data Menu & Harga" : "Tambah Menu Baru"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Produk / Menu</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Kopi Susu Aren Spesial"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kategori</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Contoh: Minuman Kopi / Snack"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Contoh: 18000"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Satuan (Unit)</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="cup">cup</option>
                    <option value="porsi">porsi</option>
                    <option value="pcs">pcs</option>
                    <option value="box">box</option>
                    <option value="botol">botol</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Jumlah Stok</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Deskripsi Produk (Diberikan saat customer tanya)</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi rasa, bahan, porsi..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Kata Kunci / Alias Pencarian (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={formData.aliases}
                  onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                  placeholder="Contoh: kopi aren, aren, es kopi"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <label htmlFor="inStockCheck" className="text-slate-300 font-medium cursor-pointer">
                  Produk Tersedia (Bisa dipesan customer)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
                >
                  {editingProduct ? "Simpan Perubahan" : "Tambah Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
