import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  CheckCheck, 
  Bot, 
  Sparkles, 
  User, 
  Store,
  Paperclip,
  Smile,
  Mic
} from "lucide-react";

export function LiveWhatsAppSimulator({ isOpen, onClose, onSendMessage, chats, settings }) {
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Active chat phone (default to Budi or the most recent)
  const activeChat = chats[0] || {
    contactName: "Budi Santoso",
    phone: "081298765432",
    messages: []
  };

  const quickPrompts = [
    { label: "📋 Tanya Menu & Harga", text: "Halo kak, minta info daftar menu dan harga ya!" },
    { label: "🛒 Pesan 2 Kopi & 1 Roti", text: "Saya mau pesan 2 Kopi Gula Aren dan 1 Roti Bakar Coklat Keju kak." },
    { label: "🥐 Cek Harga Croissant", text: "Harga Croissant Butter berapa kak?" },
    { label: "📊 Laporan Omset (Owner)", text: "Laporan hari ini" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat.messages, isTyping]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setInputText("");
    setIsTyping(true);

    // Send customer message to backend
    await onSendMessage(activeChat.phone, activeChat.contactName, text);

    setTimeout(() => {
      setIsTyping(false);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[620px] rounded-3xl shadow-2xl border-4 border-slate-700/80 bg-[#0B141A] flex flex-col overflow-hidden animate-fadeIn select-none ring-1 ring-emerald-500/30">
      {/* Smartphone Notch & Speaker bar */}
      <div className="bg-[#1F2C34] pt-2 pb-1 px-6 flex justify-between items-center text-[10px] text-slate-400 font-mono">
        <span>09:41</span>
        <div className="w-16 h-3.5 bg-slate-900 rounded-full mx-auto"></div>
        <div className="flex items-center gap-1">
          <span>5G</span>
          <span>100%</span>
        </div>
      </div>

      {/* WhatsApp Chat Top Header */}
      <div className="bg-[#1F2C34] px-4 py-3 flex items-center justify-between border-b border-[#2A3942] text-white shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold leading-tight truncate max-w-[160px]">
              {settings.storeName || "Kopi & Roti Nusantara"}
            </h4>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{isTyping ? "sedang mengetik..." : "online (Official CS Bot)"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="bg-[#111B21] px-3 py-2 flex items-center gap-1.5 overflow-x-auto border-b border-[#222E35] shrink-0">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.text)}
            className="px-2.5 py-1 rounded-full bg-[#1F2C34] hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-300 text-[10px] font-medium whitespace-nowrap border border-[#2A3942] transition-colors shrink-0"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Body (WhatsApp Wallpaper feel) */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0B141A]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "16px 16px"
        }}
      >
        {/* Encryption notice */}
        <div className="bg-[#182229] rounded-lg p-2 text-center text-[10px] text-amber-300/80 mx-2 shadow-sm border border-[#222E35]">
          🔒 Pesan terenkripsi secara end-to-end. Terhubung ke FlowWA Automation Engine.
        </div>

        {activeChat.messages.map((msg) => {
          const isMe = msg.sender === "customer";
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fadeIn`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-xs shadow-md whitespace-pre-line leading-relaxed ${
                  isMe
                    ? "bg-[#005C4B] text-slate-100 rounded-tr-none"
                    : "bg-[#202C33] text-slate-200 rounded-tl-none border border-[#2A3942]"
                }`}
              >
                {!isMe && (
                  <div className="text-[10px] font-bold text-emerald-400 mb-0.5 flex items-center gap-1">
                    <Bot className="w-3 h-3" /> Auto-Bot CS
                  </div>
                )}
                <div>{msg.text}</div>
                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400 font-mono">
                  <span>{msg.time}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#202C33] text-slate-300 rounded-2xl rounded-tl-none px-3.5 py-2 text-xs flex items-center gap-1.5 border border-[#2A3942]">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field Bar */}
      <div className="bg-[#202C33] p-2.5 flex items-center gap-2 border-t border-[#2A3942] shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ketik pesan WhatsApp..."
          className="flex-1 bg-[#2A3942] text-xs text-white placeholder-slate-400 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />

        <button
          onClick={() => handleSend()}
          className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition-transform active:scale-90 shrink-0 shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
