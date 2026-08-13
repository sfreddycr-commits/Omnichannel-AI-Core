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
  Sparkles, 
  Clock, 
  User, 
  Activity,
  Send,
  AlertCircle
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
  onClose,
  language = 'es'
}) => {
  const [callStatus, setCallStatus] = useState<CallStatus>('disconnected');
  const [channelId, setChannelId] = useState<string | null>(null);
  const [callerNumber, setCallerNumber] = useState<string>('+506 8888-9999');
  const [callerName, setCallerName] = useState<string>('Operador de Pruebas WebRTC');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [callDurationSeconds, setCallDurationSeconds] = useState<number>(0);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [textInputMsg, setTextInputMsg] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('Listo para iniciar llamada de prueba');
  const [isAudioConnected, setIsAudioConnected] = useState<boolean>(false);

  // Audio & WebSocket refs
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

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

  // Start Call Handler
  const handleStartCall = async () => {
    setCallStatus('calling');
    setStatusMessage('Iniciando canal ARI y conectando con Gemini Live API...');
    setCallDurationSeconds(0);
    setTranscripts([]);

    try {
      // 1. Call backend to simulate ARI channel / init Gemini Live session
      const resp = await fetch('/api/voice-bridge/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerNumber,
          callerName
        })
      });

      if (!resp.ok) {
        throw new Error(`Error HTTP ${resp.status}`);
      }

      const data = await resp.json();
      const activeChannelId = data.session?.channelId || data.call?.id || `call-sim-${Date.now()}`;
      setChannelId(activeChannelId);

      if (data.session?.transcript) {
        setTranscripts(data.session.transcript);
      } else {
        setTranscripts([
          {
            speaker: 'Kira Voice',
            text: '¡Hola! Bienvenido a Wiazart by designsoftcr.com. ¿En qué le puedo colaborar hoy?',
            timestamp: new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' })
          }
        ]);
      }

      setStatusMessage('Enlazando stream de audio WebSockets PCM 16kHz...');

      // 2. Connect WebSocket to backend for audio bridge
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsAudioConnected(true);
        ws.send(JSON.stringify({
          type: 'ATTACH_AUDIO_BRIDGE',
          channelId: activeChannelId
        }));
        setCallStatus('active');
        setStatusMessage('Llamada en línea • Transmitiendo voz con Gemini Live API');

        // Start Microphone Capture
        startMicrophoneCapture(activeChannelId, ws);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'OUTBOUND_PCM_AUDIO' && msg.audioPcm24k) {
            playRawPcm24kAudio(msg.audioPcm24k);
          } else if (msg.type === 'VOIP_TRANSCRIPTION_CHUNK' && msg.text) {
            const timeStr = new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' });
            setTranscripts(prev => [
              ...prev,
              { speaker: 'Kira Voice', text: msg.text, timestamp: timeStr }
            ]);
          }
        } catch (e) {
          console.error('Error handling WebSocket message:', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket AudioBridge error:', err);
        setStatusMessage('Modo simulado activo (sin audio en vivo)');
      };

      ws.onclose = () => {
        setIsAudioConnected(false);
      };

    } catch (err: any) {
      console.error('Error starting WebRTC Softphone call:', err);
      setStatusMessage('Iniciando en modo simulado por entorno de navegador');
      setCallStatus('active');
      setTranscripts([
        {
          speaker: 'Kira Voice',
          text: '¡Hola! Soy Kira Voice de Wiazart. Estoy lista para atenderle.',
          timestamp: new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' })
        }
      ]);
    }
  };

  // Start microphone capture and stream PCM to WebSocket
  const startMicrophoneCapture = async (activeChannelId: string, ws: WebSocket) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(2048, 1, 1);

      processor.onaudioprocess = (e) => {
        if (isMuted || ws.readyState !== WebSocket.OPEN) return;
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
        const base64Audio = btoa(binary);

        ws.send(JSON.stringify({
          type: 'VOIP_AUDIO_STREAM',
          channelId: activeChannelId,
          pcmBase64: base64Audio
        }));
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
    } catch (err) {
      console.warn('Microphone permission denied or not available:', err);
      setStatusMessage('Micrófono desactivado. Utilice el teclado de voz para chatear.');
    }
  };

  // Play incoming PCM 24kHz Base64 Audio Chunk
  const playRawPcm24kAudio = (base64Audio: string) => {
    if (!isSpeakerOn) return;
    try {
      const binaryStr = atob(base64Audio);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx({ sampleRate: 24000 });
      const buffer = ctx.createBuffer(1, int16.length, 24000);
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < int16.length; i++) {
        channel[i] = int16[i] / 32768.0;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch (err) {
      console.error('Error playing raw PCM audio chunk:', err);
    }
  };

  // Hangup Call Handler
  const handleHangup = () => {
    setCallStatus('ended');
    setStatusMessage('Llamada finalizada cleanly.');

    if (wsRef.current) {
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

    setTimeout(() => {
      setCallStatus('disconnected');
      setStatusMessage('Listo para iniciar llamada de prueba');
    }, 2500);
  };

  // Send Manual Text Input
  const handleSendTextPrompt = () => {
    if (!textInputMsg.trim()) return;

    const timeStr = new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' });
    const userMessage = textInputMsg;
    setTextInputMsg('');

    setTranscripts(prev => [
      ...prev,
      { speaker: 'Cliente', text: userMessage, timestamp: timeStr }
    ]);

    // Send audio stream simulation or trigger response
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && channelId) {
      wsRef.current.send(JSON.stringify({
        type: 'VOIP_AUDIO_STREAM',
        channelId,
        textInput: userMessage
      }));
    }

    // Simulate Kira response if ws is in demo mode
    setTimeout(() => {
      let kiraReply = 'Entendido. Le puedo brindar cotización o verificar su ticket de CRM en tiempo real.';
      if (userMessage.toLowerCase().includes('precio') || userMessage.toLowerCase().includes('cotiz')) {
        kiraReply = 'Con gusto. El sistema Wiazart CallCenter tiene un costo base de $250 USD mensuales o ₡135,000 colones. ¿Desea que genéremos la propuesta?';
      } else if (userMessage.toLowerCase().includes('ticket') || userMessage.toLowerCase().includes('soporte')) {
        kiraReply = 'He consultado el CRM de Designsoft. Su ticket #DS-8921 está en estado ACTIVO y asignado al equipo técnico.';
      }

      setTranscripts(prev => [
        ...prev,
        { speaker: 'Kira Voice', text: kiraReply, timestamp: new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' }) }
      ]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-slate-100">Softphone WebRTC - Kira Live</h3>
                <span className="bg-sky-950 text-sky-400 border border-sky-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  PCM 16kHz
                </span>
              </div>
              <p className="text-xs text-slate-400">Prueba de voz bidireccional ARI & Gemini Live API</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Call Info & Status Banner */}
        <div className="bg-slate-950/40 p-4 border-b border-slate-800/60 flex flex-col items-center justify-center space-y-2">
          {/* Avatar & Visualizer */}
          <div className="relative my-2">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-xl font-extrabold text-white transition-all shadow-xl ${
              callStatus === 'active' 
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 ring-4 ring-emerald-500/30 animate-pulse' 
                : callStatus === 'calling'
                ? 'bg-gradient-to-tr from-amber-500 to-orange-600 ring-4 ring-amber-500/30 animate-bounce'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              KIRA
            </div>

            {callStatus === 'active' && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
            )}
          </div>

          {/* Caller Title */}
          <div className="text-center">
            <div className="text-sm font-bold text-slate-200">{callerName}</div>
            <div className="text-xs font-mono text-slate-400">{callerNumber}</div>
          </div>

          {/* Timer & Status Badge */}
          <div className="flex items-center space-x-3 mt-1">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5 border ${
              callStatus === 'active'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                : callStatus === 'calling'
                ? 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                : callStatus === 'ended'
                ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/80'
            }`}>
              <Radio className={`w-3.5 h-3.5 ${callStatus === 'active' ? 'animate-pulse text-emerald-400' : ''}`} />
              <span className="capitalize">
                {callStatus === 'active' ? 'En línea (Gemini Live)' : callStatus === 'calling' ? 'Llamando...' : callStatus === 'ended' ? 'Finalizada' : 'Desconectado'}
              </span>
            </div>

            {callStatus === 'active' && (
              <div className="bg-slate-800 text-slate-200 border border-slate-700 text-xs px-3 py-1 rounded-full font-mono font-medium flex items-center space-x-1">
                <Clock className="w-3 h-3 text-sky-400" />
                <span>{formatTimer(callDurationSeconds)}</span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-mono text-center px-4 py-1 bg-slate-900/60 rounded-lg border border-slate-800 max-w-md truncate">
            {statusMessage}
          </div>
        </div>

        {/* Live Conversation Transcript Window */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/30 min-h-[200px] max-h-[300px]">
          {transcripts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs space-y-2 py-8">
              <Activity className="w-8 h-8 text-slate-600 animate-pulse" />
              <p>Presione "Iniciar llamada" para conectarse por voz con Kira.</p>
            </div>
          ) : (
            transcripts.map((t, index) => (
              <div
                key={index}
                className={`flex flex-col ${t.speaker === 'Cliente' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-slate-400 font-medium">
                  <span>{t.speaker}</span>
                  <span>•</span>
                  <span>{t.timestamp}</span>
                </div>
                <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-sm ${
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

        {/* Text Voice Prompt Fallback (when active) */}
        {callStatus === 'active' && (
          <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={textInputMsg}
              onChange={(e) => setTextInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendTextPrompt()}
              placeholder="Hablar o escribir mensaje de voz a Kira..."
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={handleSendTextPrompt}
              className="p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition-colors"
              title="Enviar mensaje de voz"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Controls Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {/* Mute & Speaker Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              disabled={callStatus !== 'active'}
              className={`p-3 rounded-xl border transition-all ${
                isMuted
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={isMuted ? 'Desmutear micrófono' : 'Mutear micrófono'}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-3 rounded-xl border transition-all ${
                !isSpeakerOn
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title={isSpeakerOn ? 'Silenciar altavoz' : 'Activar altavoz'}
            >
              {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Primary Action Button (Call or Hangup) */}
          {callStatus === 'disconnected' || callStatus === 'ended' ? (
            <button
              onClick={handleStartCall}
              className="flex-1 ml-4 py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Iniciar llamada de prueba con Kira</span>
            </button>
          ) : (
            <button
              onClick={handleHangup}
              className="flex-1 ml-4 py-3 px-6 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-95"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Colgar Llamada</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
