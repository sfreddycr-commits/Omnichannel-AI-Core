import React, { useState, useEffect } from 'react';
import { Language, CallItem } from '../types';
import { getCalls, realtimeClient } from '../api';
import { 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  Bot, 
  User, 
  Search, 
  RefreshCw, 
  Clock, 
  Activity, 
  Volume2, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';

interface CallsViewProps {
  language: Language;
}

export const CallsView: React.FC<CallsViewProps> = ({ language }) => {
  const [calls, setCalls] = useState<CallItem[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'en_vivo' | 'finalizada'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    loadCalls();

    realtimeClient.connect();

    // Listen to real-time call events
    const handleCallTranscript = (payload: { callId: string; segment: any }) => {
      setCalls(prev => prev.map(c => {
        if (c.id === payload.callId) {
          return {
            ...c,
            transcript: [...c.transcript, payload.segment]
          };
        }
        return c;
      }));
    };

    const handleCallStatus = (payload: { callId: string; status: 'en_vivo' | 'finalizada' }) => {
      setCalls(prev => prev.map(c => c.id === payload.callId ? { ...c, status: payload.status } : c));
    };

    realtimeClient.on('call_transcript', handleCallTranscript);
    realtimeClient.on('call_status', handleCallStatus);

    return () => {
      realtimeClient.off('call_transcript', handleCallTranscript);
      realtimeClient.off('call_status', handleCallStatus);
    };
  }, []);

  const loadCalls = async () => {
    setIsLoading(true);
    try {
      const data = await getCalls();
      setCalls(data);
      if (data.length > 0 && !selectedCallId) {
        setSelectedCallId(data[0].id);
      }
    } catch (e) {
      console.error('Failed to load calls:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsSyncing(true);
    await loadCalls();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const selectedCall = calls.find(c => c.id === selectedCallId) || calls[0];

  const filteredCalls = calls.filter(call => {
    const matchesSearch = call.callerNumber.includes(searchQuery) ||
                          (call.callerName && call.callerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          call.assignedAgent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-2xl md:text-3xl text-slate-100 tracking-tight">
                {language === 'en' ? 'Voice Calls Monitor' : 'Llamadas de Voz en Vivo'}
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                {language === 'en' 
                  ? 'Real-time call status, live AI agent assignment, and speech transcription.' 
                  : 'Monitoreo de llamadas activas, agente IA asignado y transcripción en tiempo real.'}
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
            <span>{language === 'en' ? 'Sync Calls' : 'Sincronizar Llamadas'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="h-[calc(100vh-210px)] min-h-[580px] flex flex-col md:flex-row rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        {/* Left Sidebar: Call Directory */}
        <aside className="w-full md:w-[340px] border-r border-slate-800 bg-slate-950 flex flex-col shrink-0">
          <div className="p-3.5 border-b border-slate-800 space-y-3 bg-slate-900/60">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search number or agent...' : 'Buscar número o agente...'}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: language === 'en' ? 'All' : 'Todas' },
                { id: 'en_vivo', label: language === 'en' ? 'Live' : 'En Vivo' },
                { id: 'finalizada', label: language === 'en' ? 'Ended' : 'Finalizadas' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all text-center cursor-pointer ${
                    statusFilter === f.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calls List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                <span>{language === 'en' ? 'Fetching live telemetry...' : 'Cargando telemetría...'}</span>
              </div>
            ) : filteredCalls.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 italic">
                {language === 'en' ? 'No calls recorded.' : 'No se encontraron llamadas.'}
              </div>
            ) : (
              filteredCalls.map((call) => {
                const isSelected = selectedCall && selectedCall.id === call.id;
                const isLive = call.status === 'en_vivo';

                return (
                  <div
                    key={call.id}
                    onClick={() => setSelectedCallId(call.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500/50 shadow-md'
                        : 'bg-slate-900/50 hover:bg-slate-800/40 border-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${
                          isLive 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}>
                          <PhoneCall className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-100 font-mono">
                            {call.callerNumber}
                          </h4>
                          {call.callerName && (
                            <span className="text-[10px] text-slate-400 font-medium block">
                              {call.callerName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase flex items-center gap-1 border ${
                        isLive 
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' 
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {isLive && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}
                        <span>{isLive ? 'En Vivo' : 'Finalizada'}</span>
                      </span>
                    </div>

                    {/* Agent & Duration */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-300">
                        <Bot className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{call.assignedAgent}</span>
                      </span>

                      <span className="font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formatDuration(call.durationSeconds)}</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Detail Window: Live Speech Transcription */}
        {selectedCall ? (
          <section className="flex-1 flex flex-col h-full bg-slate-900 relative">
            {/* Header Toolbar */}
            <div className="p-4 border-b border-slate-800 flex flex-wrap justify-between items-center bg-slate-950/80 backdrop-blur-md gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${
                  selectedCall.status === 'en_vivo'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-100 font-mono">
                      {selectedCall.callerNumber}
                    </h3>
                    {selectedCall.callerName && (
                      <span className="text-xs text-slate-400 font-medium">({selectedCall.callerName})</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span>{language === 'en' ? 'Started at' : 'Iniciada a las'}: {selectedCall.startedAt}</span>
                    <span>•</span>
                    <span className="font-mono">{formatDuration(selectedCall.durationSeconds)}</span>
                  </p>
                </div>
              </div>

              {/* Status & Agent Info */}
              <div className="flex items-center gap-3">
                <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Agente Asignado</span>
                    <span className="font-semibold text-slate-200">{selectedCall.assignedAgent}</span>
                  </div>
                </div>

                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 border ${
                  selectedCall.status === 'en_vivo'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800/80 shadow-xs'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {selectedCall.status === 'en_vivo' && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  )}
                  <span>{selectedCall.status === 'en_vivo' ? 'Llamada en Vivo' : 'Finalizada'}</span>
                </span>
              </div>
            </div>

            {/* Audio Wave Visualizer Header when Live */}
            {selectedCall.status === 'en_vivo' && (
              <div className="bg-indigo-950/40 border-b border-indigo-900/40 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                  <Volume2 className="w-4 h-4 text-indigo-400 animate-bounce" />
                  <span>{language === 'en' ? 'Live Audio Stream active' : 'Transmisión de audio en tiempo real activa'}</span>
                </div>

                {/* Animated Waveform Bars */}
                <div className="flex items-center gap-1 h-4">
                  <div className="w-1 bg-indigo-400 h-2 animate-pulse"></div>
                  <div className="w-1 bg-indigo-400 h-4 animate-pulse delay-75"></div>
                  <div className="w-1 bg-indigo-400 h-3 animate-pulse delay-150"></div>
                  <div className="w-1 bg-indigo-400 h-1 animate-pulse delay-100"></div>
                  <div className="w-1 bg-indigo-400 h-3 animate-pulse delay-200"></div>
                </div>
              </div>
            )}

            {/* Real-time Transcription Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                <span>{language === 'en' ? 'Real-Time Transcription Stream' : 'Transcripción de la Llamada'}</span>
                <span className="text-indigo-400 font-mono text-[10px]">STT Engine: Whisper / Deepgram</span>
              </div>

              {selectedCall.transcript.length === 0 ? (
                <div className="text-center p-8 text-slate-500 text-xs italic">
                  {language === 'en' ? 'Awaiting audio transcript...' : 'Esperando fragmentos de audio...'}
                </div>
              ) : (
                selectedCall.transcript.map((seg) => {
                  const isCaller = seg.speaker === 'caller';
                  return (
                    <div
                      key={seg.id}
                      className={`flex ${isCaller ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[80%] p-3.5 rounded-2xl border ${
                        isCaller
                          ? 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-xs'
                          : 'bg-indigo-950/80 border-indigo-800/60 text-indigo-100 rounded-tr-xs'
                      }`}>
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                            isCaller ? 'text-slate-400' : 'text-indigo-300'
                          }`}>
                            {isCaller ? (
                              <>
                                <Mic className="w-3 h-3 text-slate-400" />
                                <span>{selectedCall.callerName || 'Caller'} ({selectedCall.callerNumber})</span>
                              </>
                            ) : (
                              <>
                                <Bot className="w-3 h-3 text-indigo-400" />
                                <span>{selectedCall.assignedAgent}</span>
                              </>
                            )}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">{seg.timestamp}</span>
                        </div>

                        <p className="text-xs leading-relaxed font-normal">{seg.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Status Bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'en' ? 'Latency: 120ms • Speech Accuracy: 98.2%' : 'Latencia: 120ms • Precisión Voz: 98.2%'}</span>
              </span>

              <span className="text-[10px] font-mono text-slate-500">
                Call ID: {selectedCall.id}
              </span>
            </div>
          </section>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-slate-500 text-sm">
            {language === 'en' ? 'Select a call to view live transcript' : 'Selecciona una llamada para ver la transcripción'}
          </div>
        )}
      </div>
    </div>
  );
};
