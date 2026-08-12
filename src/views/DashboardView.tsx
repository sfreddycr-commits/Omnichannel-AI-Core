import React, { useState } from 'react';
import { Language, Agent } from '../types';
import { getTranslation } from '../translations';
import { 
  RefreshCw, 
  Users, 
  MessageSquare, 
  BrainCircuit, 
  Timer, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  ShoppingCart,
  Headphones,
  Wallet,
  Settings2
} from 'lucide-react';

interface DashboardViewProps {
  language: Language;
  agents: Agent[];
  onToggleAgent: (agentId: string) => void;
  onNavigateToAgents: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  language,
  agents,
  onToggleAgent,
  onNavigateToAgents
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncedToast, setSyncedToast] = useState(false);

  const handleSyncData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setSyncedToast(true);
      setTimeout(() => setSyncedToast(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {syncedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-emerald-500 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{language === 'en' ? 'Data synced with AI Brain cluster successfully!' : '¡Datos sincronizados con el clúster de Inteligencia Artificial!'}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-extrabold text-2xl md:text-3xl text-slate-900 tracking-tight mb-1">
            {getTranslation(language, 'globalOperations')}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {getTranslation(language, 'systemOptimal')}
          </p>
        </div>

        <button
          onClick={handleSyncData}
          disabled={isRefreshing}
          className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{getTranslation(language, 'syncData')}</span>
        </button>
      </div>

      {/* Top Row: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Clients */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              {getTranslation(language, 'totalClients')}
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-extrabold text-3xl text-slate-900 tracking-tight">15,024</div>
          <div className="mt-2 flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
            <TrendingUp className="w-4 h-4" />
            <span className="font-semibold">+2.4%</span>
            <span className="text-slate-400 text-xs ml-1">{getTranslation(language, 'vsLastWeek')}</span>
          </div>
        </div>

        {/* Card 2: Active Convos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              {getTranslation(language, 'activeConvos')}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="font-extrabold text-3xl text-slate-900 tracking-tight">3,492</div>
          <div className="mt-2 flex items-center gap-1.5 text-emerald-700 font-medium text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{getTranslation(language, 'liveProcessing')}</span>
          </div>
        </div>

        {/* Card 3: AI Resolution Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              {getTranslation(language, 'aiResolutionRate')}
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="font-extrabold text-3xl text-slate-900 tracking-tight">94.2%</div>
          <div className="mt-2 flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
            <CheckCircle className="w-4 h-4" />
            <span>{getTranslation(language, 'target')}: 90.0%</span>
          </div>
        </div>

        {/* Card 4: Avg Response Time */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              {getTranslation(language, 'avgResponseTime')}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div className="font-extrabold text-3xl text-slate-900 tracking-tight">1.2s</div>
          <div className="mt-2 flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
            <TrendingDown className="w-4 h-4" />
            <span className="font-semibold">-0.3s</span>
            <span className="text-slate-400 text-xs ml-1">{getTranslation(language, 'optimised')}</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Channel Traffic Chart & System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel Traffic Volume Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:col-span-2 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
            <h2 className="font-bold text-lg text-slate-900">
              {getTranslation(language, 'channelTrafficVolume')}
            </h2>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                <span className="text-slate-600">{getTranslation(language, 'whatsApp')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-indigo-600"></span>
                <span className="text-slate-600">{getTranslation(language, 'voice')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-purple-500"></span>
                <span className="text-slate-600">{getTranslation(language, 'softphone')}</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="flex-1 min-h-[220px] flex items-end justify-between gap-2 px-4 pb-6 relative mt-2">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between z-0 pointer-events-none pb-6">
              <div className="w-full border-b border-slate-100"></div>
              <div className="w-full border-b border-slate-100"></div>
              <div className="w-full border-b border-slate-100"></div>
              <div className="w-full border-b border-slate-100"></div>
              <div className="w-full border-b border-slate-200"></div>
            </div>

            {/* Y Axis Labels */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-400 font-mono -ml-4 z-10">
              <span>4k</span><span>3k</span><span>2k</span><span>1k</span><span>0</span>
            </div>

            {/* Time Columns */}
            {[
              { time: '08:00', h1: '40%', h2: '20%', h3: '10%' },
              { time: '10:00', h1: '60%', h2: '30%', h3: '15%' },
              { time: '12:00', h1: '90%', h2: '70%', h3: '40%' },
              { time: '14:00', h1: '75%', h2: '50%', h3: '25%' },
              { time: '16:00', h1: '85%', h2: '60%', h3: '30%' },
              { time: 'NOW', h1: '52%', h2: '46%', h3: '22%', isNow: true }
            ].map((col, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 z-10 group relative">
                {col.isNow && (
                  <div className="absolute -top-7 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs z-20">
                    Live
                  </div>
                )}
                <div className="w-full max-w-[36px] flex items-end gap-[2px] h-[170px] mb-2 relative">
                  {col.isNow && (
                    <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-emerald-400/50 border-r border-dashed border-emerald-500 -z-10"></div>
                  )}
                  <div 
                    style={{ height: col.h1 }} 
                    className="bg-emerald-500 w-1/3 rounded-t-xs chart-bar opacity-90 group-hover:opacity-100 transition-opacity"
                  ></div>
                  <div 
                    style={{ height: col.h2 }} 
                    className="bg-indigo-600 w-1/3 rounded-t-xs chart-bar opacity-90 group-hover:opacity-100 transition-opacity"
                  ></div>
                  <div 
                    style={{ height: col.h3 }} 
                    className="bg-purple-500 w-1/3 rounded-t-xs chart-bar opacity-90 group-hover:opacity-100 transition-opacity"
                  ></div>
                </div>
                <span className={`text-[10px] font-mono ${col.isNow ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  {col.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts Container */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
            <h2 className="font-bold text-lg text-slate-900">
              {getTranslation(language, 'systemAlerts')}
            </h2>
            <span className="bg-slate-100 px-2 py-0.5 rounded-full text-xs font-medium text-slate-500 border border-slate-200">
              {getTranslation(language, 'last1h')}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 items-start hover:bg-slate-100/80 transition-colors cursor-pointer">
              <div className="p-1.5 rounded-full bg-amber-100 text-amber-700 mt-0.5 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {language === 'en' ? 'High Latency Detected' : 'Alta Latencia Detectada'}
                </div>
                <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {language === 'en' ? 'Node cluster alpha-7 experiencing >200ms ping during routing.' : 'El clúster alfa-7 experimenta un ping superior a 200 ms.'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1.5 font-medium">12 mins ago</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 items-start hover:bg-slate-100/80 transition-colors cursor-pointer">
              <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-700 mt-0.5 shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {language === 'en' ? 'Model Retraining Complete' : 'Reentrenamiento de Modelo Completo'}
                </div>
                <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {language === 'en' ? 'Support Agent NLP model v4.2 deployed successfully to edge servers.' : 'Modelo NLP v4.2 desplegado con éxito en servidores de borde.'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1.5 font-medium">45 mins ago</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 items-start hover:bg-slate-100/80 transition-colors cursor-pointer">
              <div className="p-1.5 rounded-full bg-indigo-100 text-indigo-700 mt-0.5 shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {language === 'en' ? 'Traffic Spike Forecast' : 'Pronóstico de Pico de Tráfico'}
                </div>
                <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {language === 'en' ? 'Anticipating 30% volume increase in WhatsApp channel.' : 'Se anticipa un aumento del 30% en el canal de WhatsApp.'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1.5 font-medium">55 mins ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: AI Agent Status Cards */}
      <div>
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
          <h2 className="font-bold text-xl text-slate-900">
            {getTranslation(language, 'aiAgentStatus')}
          </h2>
          <button 
            onClick={onNavigateToAgents}
            className="px-3.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            {getTranslation(language, 'manageNodes')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const isOnline = agent.status === 'online' || agent.status === 'processing';
            const isDegraded = agent.status === 'degraded';

            return (
              <div 
                key={agent.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative overflow-hidden transition-all hover:border-slate-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                      {agent.id === 'support' && <Headphones className="w-5 h-5 text-emerald-600" />}
                      {agent.id === 'sales' && <ShoppingCart className="w-5 h-5 text-indigo-600" />}
                      {agent.id === 'collections' && <Wallet className="w-5 h-5 text-amber-600" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{agent.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : isDegraded ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                        <span>{agent.status === 'online' ? `${getTranslation(language, 'online')} (${agent.version})` : agent.status === 'processing' ? getTranslation(language, 'processing') : getTranslation(language, 'humanFallback')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isOnline} 
                      onChange={() => onToggleAgent(agent.id)}
                      className="sr-only mech-switch-input" 
                    />
                    <div className="w-11 h-6 bg-slate-200 rounded-full border border-slate-300 mech-switch-track transition-colors relative">
                      <div className="mech-switch-thumb absolute top-[2px] left-[2px] w-5 h-5 bg-white shadow-xs rounded-full transition-transform"></div>
                    </div>
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1 font-medium">
                      <span>{getTranslation(language, 'currentLoad')}</span>
                      <span className="font-semibold">{agent.load}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${agent.load}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          agent.id === 'support' ? 'bg-emerald-500' : agent.id === 'sales' ? 'bg-indigo-600' : 'bg-amber-500'
                        }`}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm pt-4 border-t border-slate-100">
                    <div>
                      <div className="text-slate-400 text-xs font-medium">{getTranslation(language, 'activeSessions')}</div>
                      <div className="font-bold text-slate-900 mt-0.5">{agent.activeSessions.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs font-medium">
                        {agent.id === 'sales' ? getTranslation(language, 'conversionBoost') : getTranslation(language, 'resolutionRate')}
                      </div>
                      <div className={`font-bold mt-0.5 ${agent.id === 'sales' ? 'text-indigo-600' : agent.id === 'support' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {agent.id === 'sales' ? '+14.2%' : `${agent.resolutionRate}%`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
