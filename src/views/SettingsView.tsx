import React, { useState, useEffect } from 'react';
import { Language, LogEntry } from '../types';
import { getTranslation } from '../translations';
import { 
  MessageSquare, 
  Mic, 
  Globe, 
  Terminal, 
  Eye, 
  EyeOff, 
  Cloud, 
  Check, 
  ChevronDown,
  Trash2,
  Save
} from 'lucide-react';

interface SettingsViewProps {
  language: Language;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ language }) => {
  const [waEngine, setWaEngine] = useState<'meta' | 'baileys'>('meta');
  const [geminiModel, setGeminiModel] = useState('gemini-3.1-flash-live-preview');
  const [geminiVoice, setGeminiVoice] = useState('Kore');
  const [temperature, setTemperature] = useState(0.6);
  const [authToken, setAuthToken] = useState('AIzaSy_GEMINI_LIVE_API_KEY_ACTIVE');
  const [showToken, setShowToken] = useState(false);
  const [region, setRegion] = useState('United States (us-east-1)');
  const [isSavedToast, setIsSavedToast] = useState(false);

  // Live Terminal Logs State
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '10:42:01', level: 'INFO', message: 'System initializing...' },
    { id: '2', timestamp: '10:42:02', level: 'INFO', message: 'Connecting to Meta Graph API...' },
    { id: '3', timestamp: '10:42:02', level: 'OK', message: 'Connection established (45ms ping)' },
    { id: '4', timestamp: '10:42:05', level: 'INFO', message: 'Authenticating GCP TTS service...' },
    { id: '5', timestamp: '10:42:06', level: 'OK', message: 'GCP Auth token verified.' },
    { id: '6', timestamp: '10:42:15', level: 'WARN', message: 'High latency detected on route ap-southeast-1' },
    { id: '7', timestamp: '10:42:18', level: 'INFO', message: 'Re-routing to eu-central-1 fallback...' },
    { id: '8', timestamp: '10:42:19', level: 'OK', message: 'Routing stable. Load balanced.' },
  ]);

  // Append simulated terminal logs periodically
  useEffect(() => {
    const randomMessages = [
      'Syncing telemetry data with main cluster...',
      'Heartbeat sent to edge worker node.',
      'Flushing queue buffer (0 pending).',
      'Checking SSL certificate validity (>90d remaining).',
      'Optimizing memory allocation for LLM inference.'
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        const randomMsg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        const newEntry: LogEntry = {
          id: `log-${Date.now()}`,
          timestamp: time,
          level: 'INFO',
          message: randomMsg
        };
        setLogs(prev => [...prev.slice(-25), newEntry]);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSaveConfig = () => {
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);

    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}`,
        timestamp: time,
        level: 'OK',
        message: 'Infrastructure configuration updated & saved successfully.'
      }
    ]);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {isSavedToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-emerald-500 animate-fadeIn">
          <Check className="w-5 h-5" />
          <span>{language === 'en' ? 'Infrastructure settings saved successfully!' : '¡Configuración de infraestructura guardada con éxito!'}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-extrabold text-2xl md:text-3xl text-slate-900 tracking-tight mb-1">
            {getTranslation(language, 'infraSettings')}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {getTranslation(language, 'infraSettingsSub')}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => alert(language === 'en' ? 'Settings discarded' : 'Configuración descartada')}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            {getTranslation(language, 'discard')}
          </button>
          <button
            onClick={handleSaveConfig}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{getTranslation(language, 'saveConfiguration')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Main Settings) */}
        <div className="lg:col-span-8 space-y-6">
          {/* WhatsApp Provider Widget */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-4">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-lg text-slate-900">
                {getTranslation(language, 'whatsAppEngine')}
              </h3>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1">
                <h4 className="font-bold text-base text-slate-900 mb-1">
                  {getTranslation(language, 'activeRoutingMechanism')}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {getTranslation(language, 'activeRoutingSub')}
                </p>
              </div>

              {/* Toggle Mechanism Slider */}
              <div className="relative w-64 h-11 bg-slate-200/80 rounded-xl p-1 border border-slate-300 flex items-center shrink-0">
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-xs transition-transform duration-300 ease-in-out ${
                    waEngine === 'meta' ? 'left-1' : 'left-1 translate-x-full'
                  }`}
                ></div>
                <button
                  type="button"
                  onClick={() => setWaEngine('meta')}
                  className={`flex-1 relative z-10 text-center text-xs uppercase tracking-wider font-extrabold transition-colors cursor-pointer ${
                    waEngine === 'meta' ? 'text-indigo-600' : 'text-slate-500'
                  }`}
                >
                  Meta API
                </button>
                <button
                  type="button"
                  onClick={() => setWaEngine('baileys')}
                  className={`flex-1 relative z-10 text-center text-xs uppercase tracking-wider font-extrabold transition-colors cursor-pointer ${
                    waEngine === 'baileys' ? 'text-indigo-600' : 'text-slate-500'
                  }`}
                >
                  Baileys
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-medium mb-1">{getTranslation(language, 'throughputLimit')}</div>
                <div className="text-sm font-extrabold text-emerald-600">250 msgs/sec</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-medium mb-1">{getTranslation(language, 'encryption')}</div>
                <div className="text-sm font-extrabold text-indigo-600">End-to-End E2EE</div>
              </div>
            </div>
          </div>

          {/* Gemini Live Voice Engine (Native GenAI) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Mic className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-lg text-slate-900">
                  {getTranslation(language, 'voiceSynthesizer')} (Gemini Live API)
                </h3>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-300 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Nativo Google GenAI</span>
              </span>
            </div>

            <div className="space-y-4">
              {/* Model & Prebuilt Voice Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Modelo de Voz Multimodal
                  </label>
                  <select
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 text-xs font-medium focus:bg-white focus:border-indigo-500 focus:outline-none cursor-pointer font-mono"
                  >
                    <option value="gemini-3.1-flash-live-preview">gemini-3.1-flash-live-preview (Oficial)</option>
                    <option value="gemini-flash-latest">gemini-flash-latest (Producción)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Voz Sintetizada Predeterminada
                  </label>
                  <select
                    value={geminiVoice}
                    onChange={(e) => setGeminiVoice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 text-xs font-medium focus:bg-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Kore">Kore (Ejecutiva Femenina - Costa Rica)</option>
                    <option value="Puck">Puck (Juvenil Dinámico)</option>
                    <option value="Charon">Charon (Grave Profesional)</option>
                    <option value="Aoede">Aoede (Cálida / Atención Cliente)</option>
                    <option value="Fenrir">Fenrir (Corporativo / Asesor)</option>
                  </select>
                </div>
              </div>

              {/* Temperature Slider & Audio Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Temperatura de Inferencia
                    </label>
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {temperature}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Formato de Audio Bidireccional
                  </label>
                  <input
                    type="text"
                    disabled
                    value="PCM 16kHz / 16-bit Mono (RTP Asterisk ARI)"
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 text-slate-600 text-xs font-mono font-medium"
                  />
                </div>
              </div>

              {/* Gemini API Key Token */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Gemini API Secret Key (Server-Side)
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-11 text-slate-900 font-mono text-xs focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Las llamadas de voz se procesan 100% servidor a servidor con la API @google/genai.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Region & Live System Output Terminal) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Data Residency Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-3">
              <Globe className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">
                {getTranslation(language, 'dataResidency')}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-3 font-medium">
              {getTranslation(language, 'selectPrimaryRegion')}
            </p>
            <div className="relative">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 text-xs font-medium appearance-none focus:bg-white focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option>United States (us-east-1)</option>
                <option>Germany (eu-central-1)</option>
                <option>Singapore (ap-southeast-1)</option>
                <option>Brazil (sa-east-1)</option>
                <option>Japan (ap-northeast-1)</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Live System Output Terminal */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[380px] overflow-hidden shadow-sm">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <h3 className="font-mono text-xs text-slate-200 font-bold">
                  {getTranslation(language, 'systemOutput')}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <button
                  onClick={handleClearLogs}
                  className="text-slate-400 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                  title={getTranslation(language, 'clearLogs')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-slate-950 font-mono text-[11px] space-y-2 leading-relaxed">
              {logs.length === 0 ? (
                <div className="text-slate-500 italic py-4 text-center">No terminal output.</div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`${
                      log.level === 'OK'
                        ? 'text-emerald-400'
                        : log.level === 'WARN'
                        ? 'text-amber-400'
                        : log.level === 'ERR'
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    [{log.timestamp}] {log.level.padEnd(4)} {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
