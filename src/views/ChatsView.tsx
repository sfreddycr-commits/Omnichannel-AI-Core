import React, { useState, useEffect } from 'react';
import { Language, ChatItem, ChatMessage } from '../types';
import { getTranslation } from '../translations';
import { getChats, sendChatMessage, realtimeClient } from '../api';
import { 
  MessageSquare, 
  Search, 
  Send, 
  User, 
  Bot, 
  Clock, 
  Phone, 
  CheckCheck, 
  Hand, 
  RefreshCw,
  Sparkles,
  Wifi,
  ShieldAlert
} from 'lucide-react';

interface ChatsViewProps {
  language: Language;
}

export const ChatsView: React.FC<ChatsViewProps> = ({ language }) => {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Load chats from API on mount and setup WS
  useEffect(() => {
    loadChats();

    // Connect WebSocket
    realtimeClient.connect();

    const handleNewMessage = (payload: { chatId: string; message: ChatMessage }) => {
      setChats(prev => prev.map(chat => {
        if (chat.id === payload.chatId) {
          return {
            ...chat,
            lastMessage: payload.message.text,
            timestamp: payload.message.timestamp,
            messages: [...chat.messages, payload.message]
          };
        }
        return chat;
      }));
    };

    realtimeClient.on('chat_message', handleNewMessage);

    return () => {
      realtimeClient.off('chat_message', handleNewMessage);
    };
  }, []);

  const loadChats = async () => {
    setIsLoading(true);
    try {
      const data = await getChats();
      setChats(data);
      if (data.length > 0 && !selectedChatId) {
        setSelectedChatId(data[0].id);
      }
    } catch (e) {
      console.error('Error fetching chats:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsSyncing(true);
    await loadChats();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChatId) return;

    const currentText = inputText;
    setInputText('');

    try {
      await sendChatMessage(selectedChatId, currentText, 'agent');
      // Re-fetch or locally update chat state
      const updatedChats = await getChats();
      setChats(updatedChats);
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  };

  const handleToggleAiMode = (chatId: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, isAiManaged: !c.isAiManaged } : c));
  };

  const selectedChat = chats.find(c => c.id === selectedChatId) || chats[0];

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          chat.phoneNumber.includes(searchQuery) ||
                          chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'All' || chat.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const getDepartmentBadge = (dept: string) => {
    switch (dept) {
      case 'Support':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Sales':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Collections':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-2xl md:text-3xl text-slate-100 tracking-tight">
                {language === 'en' ? 'WhatsApp Live Chats' : 'Chats de WhatsApp en Vivo'}
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                {language === 'en' 
                  ? 'Real-time multi-agent conversation feed synced with API & WebSockets.' 
                  : 'Feed de conversaciones multagente en tiempo real sincronizado con API y WebSockets.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{language === 'en' ? 'Sync Conversations' : 'Sincronizar Chats'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="h-[calc(100vh-210px)] min-h-[580px] flex flex-col md:flex-row rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        {/* Left Column: Chat List */}
        <aside className="w-full md:w-[340px] border-r border-slate-800 bg-slate-950 flex flex-col shrink-0">
          {/* Search & Dept Filters */}
          <div className="p-3.5 border-b border-slate-800 space-y-3 bg-slate-900/60">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search by client or phone...' : 'Buscar cliente o teléfono...'}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            {/* Department Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {['All', 'Support', 'Sales', 'Collections'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                    selectedDepartment === dept
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {dept === 'All' ? (language === 'en' ? 'Todos' : 'Todos') : dept}
                </button>
              ))}
            </div>
          </div>

          {/* Chat List Items */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                <span>{language === 'en' ? 'Loading conversations...' : 'Cargando conversaciones...'}</span>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 italic">
                {language === 'en' ? 'No WhatsApp chats found.' : 'No se encontraron chats de WhatsApp.'}
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected = selectedChat && selectedChat.id === chat.id;
                return (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500/50 shadow-md'
                        : 'bg-slate-900/50 hover:bg-slate-800/40 border-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-100 leading-none">
                            {chat.clientName}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {chat.phoneNumber}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 font-medium">
                        {chat.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-1 font-normal mb-2">
                      {chat.lastMessage}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getDepartmentBadge(chat.department)}`}>
                        {chat.department}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {chat.isAiManaged ? (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span>IA Auto</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded-md">
                            <User className="w-3 h-3 text-amber-400" />
                            <span>Humano</span>
                          </span>
                        )}

                        {chat.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Column: Chat Window */}
        {selectedChat ? (
          <section className="flex-1 flex flex-col h-full bg-slate-900 relative">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-100">{selectedChat.clientName}</h3>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${getDepartmentBadge(selectedChat.department)}`}>
                      {selectedChat.department}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    WhatsApp • {selectedChat.phoneNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleAiMode(selectedChat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    selectedChat.isAiManaged
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
                  }`}
                >
                  {selectedChat.isAiManaged ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>{language === 'en' ? 'AI Auto-Pilot Active' : 'Piloto IA Activo'}</span>
                    </>
                  ) : (
                    <>
                      <Hand className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'en' ? 'Human Takeover' : 'Intervención Humana'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/30">
              {selectedChat.messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[75%] p-3.5 rounded-2xl shadow-sm relative ${
                        isUser
                          ? 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700/60'
                          : msg.sender === 'ai'
                          ? 'bg-indigo-950/80 text-indigo-100 rounded-tr-xs border border-indigo-700/60'
                          : 'bg-emerald-950/80 text-emerald-100 rounded-tr-xs border border-emerald-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          {isUser ? (
                            <User className="w-3 h-3 text-slate-400" />
                          ) : msg.sender === 'ai' ? (
                            <Bot className="w-3 h-3 text-indigo-400" />
                          ) : (
                            <Hand className="w-3 h-3 text-emerald-400" />
                          )}
                          <span>
                            {isUser 
                              ? selectedChat.clientName 
                              : msg.sender === 'ai' 
                              ? 'IA Wiazart' 
                              : 'Agente Humano'}
                          </span>
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
                      </div>

                      <p className="text-sm leading-relaxed font-normal">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Input */}
            <div className="p-4 border-t border-slate-800 bg-slate-950">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    selectedChat.isAiManaged
                      ? (language === 'en' ? 'Type to send message as agent...' : 'Escribe un mensaje como agente...')
                      : (language === 'en' ? 'Type human reply via WhatsApp API...' : 'Escribe respuesta humana por WhatsApp API...')
                  }
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all font-medium placeholder-slate-500"
                />
                <button
                  type="submit"
                  className="px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </section>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-slate-500 text-sm">
            {language === 'en' ? 'Select a conversation to start chatting' : 'Selecciona una conversación para chatear'}
          </div>
        )}
      </div>
    </div>
  );
};
