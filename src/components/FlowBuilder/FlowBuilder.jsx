import React, { useState } from "react";
import { 
  GitFork, 
  Play, 
  Plus, 
  Save, 
  Zap, 
  MessageSquare, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Calculator,
  BarChart3,
  Bot,
  Settings2,
  HelpCircle,
  Eye
} from "lucide-react";

export function FlowBuilder({ flows, onUpdateFlow, onOpenSimulator }) {
  const [activeFlow, setActiveFlow] = useState(flows[0] || null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!activeFlow) {
    return <div className="p-8 text-white">Memuat Flow Automation...</div>;
  }

  // Node Color and Icon helper
  const getNodeMeta = (type) => {
    switch (type) {
      case "trigger":
        return {
          color: "border-emerald-500 bg-emerald-950/40 text-emerald-400",
          badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
          icon: Zap,
          label: "TRIGGER (Pemicu)"
        };
      case "condition":
        return {
          color: "border-amber-500 bg-amber-950/40 text-amber-400",
          badge: "bg-amber-500/20 text-amber-400 border-amber-500/40",
          icon: GitFork,
          label: "ROUTER & AI INTENT"
        };
      case "action_catalog":
        return {
          color: "border-teal-500 bg-teal-950/40 text-teal-400",
          badge: "bg-teal-500/20 text-teal-400 border-teal-500/40",
          icon: Database,
          label: "PRICE LOOKUP ENGINE"
        };
      case "action_order":
        return {
          color: "border-blue-500 bg-blue-950/40 text-blue-400",
          badge: "bg-blue-500/20 text-blue-400 border-blue-500/40",
          icon: Calculator,
          label: "AUTO-ORDER ENGINE"
        };
      case "action_finance":
        return {
          color: "border-indigo-500 bg-indigo-950/40 text-indigo-400",
          badge: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40",
          icon: BarChart3,
          label: "FINANCIAL REPORTER"
        };
      case "action_reply":
        return {
          color: "border-purple-500 bg-purple-950/40 text-purple-400",
          badge: "bg-purple-500/20 text-purple-400 border-purple-500/40",
          icon: MessageSquare,
          label: "WHATSAPP DISPATCHER"
        };
      default:
        return {
          color: "border-slate-700 bg-slate-900 text-slate-300",
          badge: "bg-slate-800 text-slate-300",
          icon: Sparkles,
          label: "ACTION"
        };
    }
  };

  // Run Visual Flow Simulation animation
  const runSimulation = () => {
    setIsSimulating(true);
    setActiveStepIndex(0);

    const steps = [0, 1, 3, 5]; // Node indices for order taking path
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setActiveStepIndex(steps[currentStep]);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsSimulating(false);
          setActiveStepIndex(-1);
        }, 1200);
      }
    }, 1000);
  };

  const handleSaveFlow = async () => {
    await onUpdateFlow(activeFlow.id, activeFlow);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] overflow-hidden bg-[#070B13]">
      {/* Flow Builder Top Header */}
      <div className="h-16 bg-[#0F172A]/90 border-b border-slate-800 px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{activeFlow.name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{activeFlow.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isSimulating
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? "Menjalankan Simulasi..." : "Simulasi Flow (Visual Trace)"}</span>
          </button>

          <button
            onClick={handleSaveFlow}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saveSuccess ? "Tersimpan! ✨" : "Simpan Alur Otomasi"}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Visual Node Graph Canvas */}
        <div className="flex-1 flow-canvas-grid overflow-auto p-12 relative flex items-center justify-center min-w-[1200px]">
          {/* Nodes Container */}
          <div className="relative w-full max-w-5xl flex flex-wrap gap-8 items-center justify-between">
            {activeFlow.nodes.map((node, index) => {
              const meta = getNodeMeta(node.type);
              const Icon = meta.icon;
              const isCurrentSimulated = activeStepIndex === index;
              const isSelected = selectedNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`w-72 rounded-2xl border p-4 shadow-xl cursor-pointer transition-all duration-300 relative group select-none ${
                    meta.color
                  } ${
                    isSelected ? "ring-2 ring-white scale-105 shadow-2xl" : ""
                  } ${
                    isCurrentSimulated 
                      ? "ring-4 ring-emerald-400 shadow-2xl shadow-emerald-500/40 scale-110 bg-slate-900 z-20" 
                      : "hover:scale-[1.02] bg-slate-900/90"
                  }`}
                >
                  {/* Node Type Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${meta.badge}`}>
                      {meta.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">#{node.id}</span>
                  </div>

                  {/* Node Title & Icon */}
                  <div className="flex items-start gap-3 mt-1">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {node.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                        {node.description}
                      </p>
                    </div>
                  </div>

                  {/* Node Connector Ports (Left and Right handles) */}
                  <div className="w-3 h-3 rounded-full bg-slate-700 border-2 border-slate-900 absolute -left-1.5 top-1/2 -translate-y-1/2 group-hover:bg-emerald-400 transition-colors"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 absolute -right-1.5 top-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform"></div>

                  {/* Active Simulation Signal */}
                  {isCurrentSimulated && (
                    <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold flex items-center gap-1 shadow-lg animate-bounce">
                      <Zap className="w-3 h-3 fill-current" /> Aktif
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Floating Canvas Quick Tips */}
          <div className="absolute bottom-6 left-6 glass-panel px-4 py-3 rounded-xl border-slate-800 text-xs text-slate-400 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Klik pada salah satu node untuk melihat & menyesuaikan konfigurasi otomatisnya.</span>
          </div>
        </div>

        {/* Right Configuration Inspector Panel */}
        <div className="w-80 bg-[#0F172A] border-l border-slate-800 p-5 flex flex-col justify-between shrink-0 overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Inspektur Node</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">ID: {selectedNode.id}</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nama Node</label>
                <input
                  type="text"
                  value={selectedNode.title}
                  onChange={(e) => setSelectedNode({ ...selectedNode, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Deskripsi Logika</label>
                <textarea
                  rows={3}
                  value={selectedNode.description}
                  onChange={(e) => setSelectedNode({ ...selectedNode, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  ⚙️ Parameter Otomasi
                </span>
                <p className="text-xs text-slate-300">
                  Node ini terhubung langsung dengan engine NLP parser & live catalog database.
                </p>
                <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Tipe Modul:</span>
                    <span className="font-mono text-white">{selectedNode.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Eksekusi Async:</span>
                    <span className="font-mono text-emerald-400">Yes (Realtime)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <Settings2 className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-300">Pilih Node di Canvas</h4>
              <p className="text-[11px] text-slate-500">
                Klik node mana saja di canvas untuk memeriksa alur pemicu, AI router, dan pengaturan harga.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={onOpenSimulator}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span>Buka Chat Tester WA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
