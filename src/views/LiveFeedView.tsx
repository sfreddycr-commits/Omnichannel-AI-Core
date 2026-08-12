import React, { useState } from 'react';
import { Language, Session, Message } from '../types';
import { getTranslation } from '../translations';
import { 
  MessageSquare, 
  Phone, 
  AlertTriangle, 
  User, 
  Hand, 
  Lock, 
  Send, 
  Brain, 
  History, 
  Gauge, 
  ChevronRight,
  Sparkles,
  Bot
} from 'lucide-react';

interface LiveFeedViewProps {
  language: Language;
  sessions: Session[];
  onSendMessage: (sessionId: string, text: string) => void;
}

export const LiveFeedView: React.FC<LiveFeedViewProps> = ({
  language,
  sessions,
  onSendMessage
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || 'session-1');
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');

  const currentSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(currentSession.id, inputText);
    setInputText('');
  };

  return (
    <div className="h-[calc(100vh-100px)] flex rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs animate-fadeIn">
      {/* Left Column: Active Sessions List */}
      <aside className="w-[300px] h-full border-r border-slate-200 bg-slate-50/80 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-100/60">
          <h2 className="font-bold text-base text-slate-900">
            {getTranslation(language, 'activeSessionsTitle')}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>{getTranslation(language, 'live')}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sessions.map((session) => {
            const isSelected = session.id === selectedSessionId;
            return (
              <div
                key={session.id}
                onClick={() => setSelectedSessionId(session.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-white border-indigo-200 shadow-2xs'
                    : 'bg-transparent hover:bg-slate-200/50 border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    {session.channel === 'WhatsApp' && <MessageSquare className="w-4 h-4 text-emerald-600" />}
                    {session.channel === 'Voice' && <Phone className="w-4 h-4 text-indigo-600" />}
                    {session.channel === 'Softphone' && <MessageSquare className="w-4 h-4 text-purple-600" />}
                    <span className="font-bold text-sm text-slate-900">{session.clientName}</span>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                    session.status === 'processing'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : session.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {session.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 truncate font-medium">
                  {session.lastMessage}
                </p>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Column: Active Conversation Chat View */}
      <section className="flex-1 flex flex-col h-full bg-white relative">
        {/* Top Chat Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">{currentSession.clientName}</h3>
              <p className="text-xs text-slate-500 font-medium">
                {currentSession.channel} • ID: {currentSession.clientId}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsManualMode(!isManualMode)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
              isManualMode
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            <Hand className="w-4 h-4" />
            <span>{isManualMode ? getTranslation(language, 'resumeAI') : getTranslation(language, 'manuallyIntervene')}</span>
          </button>
        </div>

        {/* Chat Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10">
          {currentSession.messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[72%] p-4 rounded-2xl shadow-2xs relative ${
                    isUser
                      ? 'bg-slate-100 text-slate-900 rounded-tr-xs border border-slate-200'
                      : 'bg-indigo-50/70 text-slate-900 rounded-tl-xs border border-indigo-100'
                  }`}
                >
                  {!isUser && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-l-2xl"></div>
                  )}

                  <p className="text-sm leading-relaxed font-medium">{msg.text}</p>

                  {/* System Log Code Block */}
                  {msg.systemLog && (
                    <div className="mt-2.5 p-2.5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 leading-relaxed shadow-inner">
                      {msg.systemLog}
                    </div>
                  )}

                  <span className={`text-[10px] text-slate-400 font-medium mt-2 block ${isUser ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* AI Typing Indicator */}
          {!isManualMode && (
            <div className="flex justify-start">
              <div className="bg-indigo-50/70 p-3 rounded-2xl rounded-tl-xs border border-indigo-100 shadow-2xs">
                <div className="flex items-center gap-1.5 h-4 px-1">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full stream-dot-1"></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full stream-dot-2"></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full stream-dot-3"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 z-10">
          {!isManualMode ? (
            <div className="bg-slate-100 rounded-xl border border-slate-200 p-3 flex items-center cursor-not-allowed">
              <Lock className="w-4 h-4 text-slate-400 mr-2.5" />
              <input
                type="text"
                disabled
                placeholder={getTranslation(language, 'aiManagingNotice')}
                className="bg-transparent text-xs text-slate-400 w-full font-medium cursor-not-allowed focus:outline-none"
              />
            </div>
          ) : (
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={getTranslation(language, 'typeMessagePlaceholder')}
                className="flex-1 bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
              <button
                type="submit"
                className="px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Right Column: AI Reasoning Sidebar */}
      <aside className="w-[300px] h-full border-l border-slate-200 bg-slate-50/80 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-slate-100/60">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            <span>{getTranslation(language, 'aiReasoning')}</span>
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Current Intent Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                {getTranslation(language, 'currentIntent')}
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                {currentSession.aiReasoning.confidence}% {getTranslation(language, 'confidence')}
              </span>
            </div>
            <p className="font-bold text-sm text-slate-900">
              {currentSession.aiReasoning.currentIntent}
            </p>
          </div>

          {/* Context Factors */}
          <div className="space-y-2">
            <h4 className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {getTranslation(language, 'contextFactors')}
            </h4>

            {/* Historical Issue */}
            <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <History className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-900">{getTranslation(language, 'historicalIssue')}</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-medium">
                  {currentSession.aiReasoning.historicalIssue}
                </p>
              </div>
            </div>

            {/* Sentiment Analysis Bar */}
            <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <Gauge className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="w-full">
                <p className="text-xs font-semibold text-slate-900">{getTranslation(language, 'sentimentAnalysis')}</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    style={{ width: `${currentSession.aiReasoning.frustrationLevel}%` }}
                    className="bg-amber-500 h-full"
                  ></div>
                </div>
                <p className="text-[10px] text-amber-700 font-semibold mt-1">
                  {getTranslation(language, 'highFrustrationDetected')}
                </p>
              </div>
            </div>
          </div>

          {/* Next Action Prediction */}
          <div className="bg-indigo-50/60 rounded-xl border border-indigo-100 p-3.5 relative overflow-hidden">
            <h4 className="text-[10px] text-indigo-900 uppercase tracking-wider mb-2 font-bold">
              {getTranslation(language, 'nextActionPrediction')}
            </h4>
            <ul className="space-y-1.5 font-mono text-xs text-indigo-950">
              {currentSession.aiReasoning.nextActions.map((action, idx) => (
                <li key={idx} className={`flex items-center gap-1.5 ${idx === 0 ? 'text-indigo-700 font-bold' : 'opacity-70'}`}>
                  <span>&gt;</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
};
