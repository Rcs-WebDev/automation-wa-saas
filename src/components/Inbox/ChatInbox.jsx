import React, { useState } from "react";
import { 
  MessageSquare, 
  Search, 
  Bot, 
  UserCheck, 
  Send, 
  CheckCheck, 
  Phone, 
  MoreVertical,
  Sparkles,
  ShoppingBag
} from "lucide-react";

export function ChatInbox({ chats, onSendMessage, settings }) {
  const [selectedChatPhone, setSelectedChatPhone] = useState(chats[0]?.phone || "");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const activeChat = chats.find(c => c.phone === selectedChatPhone) || chats[0];

  const filteredChats = chats.filter(c => 
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;
    
    await onSendMessage(activeChat.phone, activeChat.contactName, inputText);
    setInputText("");
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex overflow-hidden bg-[#090D16]">
      {/* Left Chat List Column */}
      <div className="w-80 border-r border-slate-800 bg-[#0F172A]/70 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" /> Percakapan WA
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {chats.length} Kontak
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kontak atau pesan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
          {filteredChats.map((chat) => {
            const isSelected = chat.phone === activeChat?.phone;
            return (
              <div
                key={chat.phone}
                onClick={() => setSelectedChatPhone(chat.phone)}
                className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                  isSelected ? "bg-slate-800/80 border-l-4 border-emerald-500" : "hover:bg-slate-800/40"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm shrink-0">
                  {chat.contactName.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white truncate">{chat.contactName}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">{chat.lastTime}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{chat.lastMessage}</p>
                  
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <Bot className="w-2.5 h-2.5" /> Bot Aktif
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Chat Conversation View */}
      {activeChat ? (
        <div className="flex-1 flex flex-col justify-between bg-[#0B1120]">
          {/* Top Bar of Active Chat */}
          <div className="h-16 px-6 border-b border-slate-800 bg-[#0F172A]/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-sm">
                {activeChat.contactName.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{activeChat.contactName}</h3>
                <span className="text-[11px] text-slate-400 font-mono">+{activeChat.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Bot className="w-3.5 h-3.5" />
                <span>AI Bot CS Menjawab Otomatis</span>
              </div>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {activeChat.messages.map((msg) => {
              const isCust = msg.sender === "customer";
              return (
                <div key={msg.id} className={`flex ${isCust ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-md rounded-2xl p-4 text-xs shadow-md whitespace-pre-line leading-relaxed ${
                      isCust
                        ? "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700"
                        : "bg-emerald-600 text-white rounded-tr-none"
                    }`}
                  >
                    {!isCust && (
                      <div className="text-[10px] font-bold text-emerald-200 mb-1 flex items-center gap-1">
                        <Bot className="w-3 h-3" /> Auto-Bot Response
                      </div>
                    )}
                    <div>{msg.text}</div>
                    <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isCust ? "text-slate-400" : "text-emerald-200"} font-mono`}>
                      <span>{msg.time}</span>
                      {!isCust && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CS Human Takeover Input Field */}
          <form onSubmit={handleSend} className="p-4 bg-[#0F172A] border-t border-slate-800 flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Balas pesan WhatsApp sebagai Customer Service..."
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md flex items-center gap-1.5 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Kirim</span>
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
          Pilih kontak untuk melihat percakapan
        </div>
      )}
    </div>
  );
}
