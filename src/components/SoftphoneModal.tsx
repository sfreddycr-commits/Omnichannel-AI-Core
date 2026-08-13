import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  PhoneCall, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Radio, 
  Clock, 
  Activity,
  Delete,
  Grid,
  MessageSquare,
  Volume1
} from 'lucide-react';
import { Language } from '../types';

interface SoftphoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
}

type CallStatus = 'disconnected' | 'calling' | 'active' | 'ended';

interface TranscriptItem {
  speaker: 'Cliente' | 'Kira Voice';
  text: string;
  timestamp: string;
}

export const SoftphoneModal: React.FC<SoftphoneModalProps> = ({
  isOpen,
  onClose
}) => {
  const [extensionNumber, setExtensionNumber] = useState<string>('2000');
  const [callerName] = useState<string>('Operador WebRTC Wiazart');
  const [callStatus, setCallStatus] = useState<CallStatus>('disconnected');
  const [channelId, setChannelId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [callDurationSeconds, setCallDurationSeconds] = useState<number>(0);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('Extensión 2000 lista (Kira Live Voice)');
  const [activeTab, setActiveTab] = useState<'dialer' | 'transcript'>('dialer');
  const [isReceivingAudio, setIsReceivingAudio] = useState<boolean>(false);

  // Audio & WebSocket refs
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const isMutedRef = useRef<boolean>(false);
  const isSpeakerOnRef = useRef<boolean>(true);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isSpeakerOnRef.current = isSpeakerOn;
  }, [isSpeakerOn]);

  // Auto-scroll transcript window
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcripts]);

  // Timer ticker
  useEffect(() => {
    if (callStatus === 'active') {
      timerIntervalRef.current = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [callStatus]);

  if (!isOpen) return null;

  // Format MM:SS
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Keypad button press handler
  const handleKeypadPress = (digit: string) => {
    if (callStatus === 'active') {
      // Send DTMF tone to active call over WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && channelId) {
        wsRef.current.send(JSON.stringify({
          type: 'DTMF_DIGIT',
          channelId,
          digit
        }));
      }
    } else {
      // Append digit to extension field
      setExtensionNumber(prev => prev.length < 6 ? prev + digit : prev);
    }
  };

  const handleBackspace = () => {
    setExtensionNumber(prev => prev.slice(0, -1));
  };

  // Start WebRTC / WebSocket Call Handler
  const handleStartCall = async () => {
    setCallStatus('calling');
    setStatusMessage(`Marcando extensión ${extensionNumber || '2000'}...`);
    setCallDurationSeconds(0);
    setTranscripts([]);
    nextStartTimeRef.current = 0;

    try {
      // Connect to WebSocket Audio Stream Bridge on Express server
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/api/voice-bridge/stream`;
      
      console.log(`[Softphone WebRTC] Connecting to WS: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[Softphone WebRTC] WebSocket connected. Sending START_SOFTPHONE_CALL');
        ws.send(JSON.stringify({
          type: 'START_SOFTPHONE_CALL',
          extension: extensionNumber || '2000',
          callerName
        }));
        setStatusMessage('Enlazando con Gemini Live API...');

        // Start client heartbeat interval every 15s to keep TCP connection alive
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'PING',
              timestamp: new Date().toISOString()
            }));
          }
        }, 15000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'PING') {
            // Respond automatically with PONG to server ping
            ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
            return;
          } else if (msg.type === 'PONG') {
            return;
          } else if (msg.type === 'CALL_STARTED' || msg.type === 'AUDIO_BRIDGE_ATTACHED') {
            const activeChan = msg.channelId;
            setChannelId(activeChan);
            setCallStatus('active');
            setStatusMessage(`Llamada en línea • Extensión ${extensionNumber || '2000'} (Gemini Live API)`);

            if (msg.initialTranscript) {
              setTranscripts(msg.initialTranscript);
            } else {
              setTranscripts([
                {
                  speaker: 'Kira Voice',
                  text: '¡Gracias por comunicarse a Wiazart by designsoftcr.com! Mi nombre es Kira. ¿En qué le puedo colaborar hoy?',
                  timestamp: new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' })
                }
              ]);
            }

            // Start microphone capture immediately
            startMicrophoneCapture(activeChan, ws);

          } else if (msg.type === 'OUTBOUND_PCM_AUDIO' || msg.type === 'VOIP_AUDIO_OUTBOUND') {
            const rawPcm = msg.audioPcm24k || msg.audioPcm16k || msg.pcmBase64 || msg.audio;
            const rate = msg.audioPcm16k ? 16000 : 24000;
            if (rawPcm) {
              setIsReceivingAudio(true);
              playRawPcmAudio(rawPcm, rate);
              setTimeout(() => setIsReceivingAudio(false), 800);
            }

          } else if (msg.type === 'VOIP_DEPARTMENT_SWITCHED' && msg.departmentName) {
            setStatusMessage(`Opción ${msg.digit} • ${msg.departmentName}`);
          } else if (msg.type === 'VOIP_TRANSCRIPTION_CHUNK' && msg.text) {
            const timeStr = msg.timestamp || new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' });
            setTranscripts(prev => [
              ...prev,
              { speaker: 'Kira Voice', text: msg.text, timestamp: timeStr }
            ]);
          } else if (msg.type === 'CALL_ENDED') {
            handleHangup();
          }
        } catch (e) {
          console.error('[Softphone] Error parsing WS message:', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('[Softphone] WS Connection Error:', err);
        setStatusMessage('Iniciando llamada en modo simulado local...');
        setCallStatus('active');
        setTranscripts([
          {
            speaker: 'Kira Voice',
            text: '¡Hola! Bienvenido a Wiazart by designsoftcr.com. ¿En qué le puedo ayudar hoy?',
            timestamp: new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' })
          }
        ]);
      };

      ws.onclose = (event) => {
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        console.log(`[Softphone] WS closed. WasClean: ${event.wasClean}, Code: ${event.code}, Reason: '${event.reason || 'Sin razón dada'}'`);
      };

    } catch (err: any) {
      console.error('[Softphone] Error starting call:', err);
      setCallStatus('active');
      setStatusMessage('Modo simulado activo');
    }
  };

  // Start microphone capture using Web Audio API and stream PCM 16kHz Base64
  const startMicrophoneCapture = async (activeChanId: string, ws: WebSocket) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true } 
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(2048, 1, 1);

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current || ws.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);

        // Convert Float32Array to PCM Int16
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Convert Int16Array buffer to Base64
        let binary = '';
        const bytes = new Uint8Array(pcm16.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Pcm = btoa(binary);

        ws.send(JSON.stringify({
          type: 'VOIP_AUDIO_STREAM',
          channelId: activeChanId,
          audioPcm16k: base64Pcm,
          pcmBase64: base64Pcm
        }));
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
    } catch (err) {
      console.warn('[Softphone] Microphone access unavailable or declined:', err);
      setStatusMessage('Micrófono inactivo. Permita el permiso de micrófono en su navegador.');
    }
  };

  // Play incoming Base64 PCM audio (24kHz / 16kHz) from Gemini Live API
  const playRawPcmAudio = (base64Audio: string, sampleRate: number = 24000) => {
    if (!isSpeakerOnRef.current) return;
    try {
      const binaryStr = atob(base64Audio);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      if (int16.length === 0) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!playbackContextRef.current) {
        playbackContextRef.current = new AudioCtx({ sampleRate });
      }
      const ctx = playbackContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const buffer = ctx.createBuffer(1, int16.length, sampleRate);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < int16.length; i++) {
        channelData[i] = int16[i] / 32768.0;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;
    } catch (err) {
      console.error('[Softphone] Audio playback error:', err);
    }
  };

  // Hangup Call Handler
  const handleHangup = () => {
    setCallStatus('ended');
    setStatusMessage('Llamada finalizada');

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && channelId) {
      try {
        wsRef.current.send(JSON.stringify({
          type: 'HANGUP_CALL',
          channelId
        }));
      } catch {}
      wsRef.current.close();
      wsRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (playbackContextRef.current) {
      playbackContextRef.current.close();
      playbackContextRef.current = null;
    }

    setTimeout(() => {
      setCallStatus('disconnected');
      setStatusMessage(`Extensión ${extensionNumber || '2000'} lista (Kira Live Voice)`);
    }, 2000);
  };

  const keypadDigits = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-slate-100">Softphone WebRTC Wiazart</h3>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  Ext {extensionNumber || '2000'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Audio Stream Bidireccional PCM • Gemini Live</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Dialer vs Live Transcript) */}
        <div className="flex border-b border-slate-800 bg-slate-950/60">
          <button
            onClick={() => setActiveTab('dialer')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition-colors ${
              activeTab === 'dialer'
                ? 'border-sky-500 text-sky-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Teclado Marcador</span>
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition-colors ${
              activeTab === 'transcript'
                ? 'border-sky-500 text-sky-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Transcripción ({transcripts.length})</span>
          </button>
        </div>

        {/* Status Call Display Box */}
        <div className="bg-slate-950/40 px-4 py-3 border-b border-slate-800/60 flex flex-col items-center justify-center space-y-1.5">
          <div className="flex items-center space-x-2">
            <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center space-x-1.5 border ${
              callStatus === 'active'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                : callStatus === 'calling'
                ? 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                : callStatus === 'ended'
                ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/80'
            }`}>
              <Radio className={`w-3 h-3 ${callStatus === 'active' ? 'animate-pulse text-emerald-400' : ''}`} />
              <span className="capitalize">
                {callStatus === 'active' ? 'En línea (Gemini Live)' : callStatus === 'calling' ? 'Marcando Extensión...' : callStatus === 'ended' ? 'Finalizada' : 'Desconectado'}
              </span>
            </div>

            {callStatus === 'active' && (
              <div className="bg-slate-800 text-slate-200 border border-slate-700 text-[11px] px-2.5 py-0.5 rounded-full font-mono font-medium flex items-center space-x-1">
                <Clock className="w-3 h-3 text-sky-400" />
                <span>{formatTimer(callDurationSeconds)}</span>
              </div>
            )}
          </div>

          {/* Live Audio Visualizer Indicator */}
          {callStatus === 'active' && (
            <div className="flex items-center space-x-2 pt-1 text-[11px]">
              <Volume1 className={`w-4 h-4 ${isReceivingAudio ? 'text-emerald-400 animate-bounce' : 'text-slate-500'}`} />
              <span className="text-slate-300 font-mono text-[10px]">
                {isReceivingAudio ? '🔊 Reproduciendo Voz (Kira PCM 24kHz)...' : '🎙️ Micrófono Abierto (PCM 16kHz)'}
              </span>
            </div>
          )}

          <div className="text-[11px] text-slate-400 font-mono text-center truncate max-w-full px-2">
            {statusMessage}
          </div>
        </div>

        {/* MAIN BODY: TAB 1 DIALER KEYPAD */}
        {activeTab === 'dialer' && (
          <div className="p-4 flex-1 flex flex-col justify-between space-y-4 overflow-y-auto">
            {/* Extension Number Display */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-inner">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Extensión a Marcar</span>
                <input
                  type="text"
                  value={extensionNumber}
                  onChange={(e) => setExtensionNumber(e.target.value)}
                  disabled={callStatus === 'active'}
                  placeholder="2000"
                  className="bg-transparent font-mono text-2xl font-bold text-sky-400 focus:outline-none w-36"
                />
              </div>
              {callStatus !== 'active' && (
                <button
                  onClick={handleBackspace}
                  className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/60"
                  title="Borrar dígito"
                >
                  <Delete className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* IVR Department Quick Buttons (DTMF 1, 2, 3) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 text-center">
                Menú IVR por Tonos DTMF
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleKeypadPress('1')}
                  className="py-1.5 px-2 bg-slate-800 hover:bg-sky-900/60 text-sky-300 rounded-lg text-[11px] font-medium border border-slate-700/60 transition-colors flex items-center justify-center space-x-1"
                  title="DTMF 1: Ventas y Cotizaciones"
                >
                  <span className="font-bold font-mono">1</span>
                  <span className="truncate">Ventas</span>
                </button>
                <button
                  onClick={() => handleKeypadPress('2')}
                  className="py-1.5 px-2 bg-slate-800 hover:bg-emerald-900/60 text-emerald-300 rounded-lg text-[11px] font-medium border border-slate-700/60 transition-colors flex items-center justify-center space-x-1"
                  title="DTMF 2: Soporte Técnico Nivel 2"
                >
                  <span className="font-bold font-mono">2</span>
                  <span className="truncate">Soporte</span>
                </button>
                <button
                  onClick={() => handleKeypadPress('3')}
                  className="py-1.5 px-2 bg-slate-800 hover:bg-amber-900/60 text-amber-300 rounded-lg text-[11px] font-medium border border-slate-700/60 transition-colors flex items-center justify-center space-x-1"
                  title="DTMF 3: Facturación ATV v4.3"
                >
                  <span className="font-bold font-mono">3</span>
                  <span className="truncate">Facturación</span>
                </button>
              </div>
            </div>

            {/* Tactile Keypad 4x3 Grid */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto w-full">
              {keypadDigits.map((row, rIdx) => (
                <React.Fragment key={rIdx}>
                  {row.map((digit) => (
                    <button
                      key={digit}
                      onClick={() => handleKeypadPress(digit)}
                      className="py-3 bg-slate-800/90 hover:bg-slate-700/90 active:bg-sky-600 active:text-white text-slate-200 font-mono text-lg font-bold rounded-xl border border-slate-700/60 shadow-sm transition-all cursor-pointer flex flex-col items-center justify-center"
                    >
                      <span>{digit}</span>
                    </button>
                  ))}
                </React.Fragment>
              ))}
            </div>

            {/* Dial / Hangup Action Bar */}
            <div className="pt-2">
              {callStatus === 'disconnected' || callStatus === 'ended' ? (
                <button
                  onClick={handleStartCall}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-95"
                >
                  <PhoneCall className="w-5 h-5" />
                  <span>Marcar Extensión {extensionNumber || '2000'}</span>
                </button>
              ) : (
                <button
                  onClick={handleHangup}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-95"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span>Colgar Llamada</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* MAIN BODY: TAB 2 LIVE TRANSCRIPT */}
        {activeTab === 'transcript' && (
          <div className="p-3 flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-950/30 rounded-xl border border-slate-800 min-h-[220px] max-h-[300px]">
              {transcripts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs space-y-2 py-10">
                  <Activity className="w-7 h-7 text-slate-600 animate-pulse" />
                  <p>Interacción exclusivamente auditiva por voz en tiempo real.</p>
                </div>
              ) : (
                transcripts.map((t, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${t.speaker === 'Cliente' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center space-x-1.5 mb-0.5 text-[10px] text-slate-400 font-medium">
                      <span>{t.speaker}</span>
                      <span>•</span>
                      <span>{t.timestamp}</span>
                    </div>
                    <div className={`p-2.5 rounded-2xl max-w-[88%] text-xs leading-relaxed shadow-sm ${
                      t.speaker === 'Cliente'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                    }`}>
                      {t.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        )}

        {/* Controls Footer (Mute Mic & Speaker) */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 w-full justify-around">
            <button
              onClick={() => setIsMuted(!isMuted)}
              disabled={callStatus !== 'active'}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                isMuted
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isMuted ? 'Mic Mute' : 'Mic Activo'}</span>
            </button>

            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                !isSpeakerOn
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{isSpeakerOn ? 'Altavoz ON' : 'Altavoz Mute'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
