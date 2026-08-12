import React, { useState, useEffect } from 'react';
import { Language, Agent, KnowledgeFile } from '../types';
import { getTranslation } from '../translations';
import { getAgents, updateAgent } from '../api';
import { 
  FolderOpen, 
  Plus, 
  Bot, 
  Upload, 
  FileText, 
  X, 
  Save, 
  Check, 
  Database,
  ChevronDown,
  Headphones,
  Wrench,
  Receipt,
  RefreshCw,
  Activity,
  Cpu
} from 'lucide-react';

interface AgentsViewProps {
  language: Language;
  agents?: Agent[];
  onUpdateAgent?: (updatedAgent: Agent) => void;
  onAddAgent?: (newAgent: Agent) => void;
}

export const AgentsView: React.FC<AgentsViewProps> = ({
  language,
  agents: propAgents,
  onUpdateAgent: propOnUpdateAgent,
  onAddAgent: propOnAddAgent
}) => {
  const [agentsList, setAgentsList] = useState<Agent[]>(propAgents || []);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSavedToast, setIsSavedToast] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Support');
  const [status, setStatus] = useState<'online' | 'offline' | 'processing' | 'degraded'>('online');
  const [load, setLoad] = useState<number>(0);
  const [tone, setTone] = useState('friendly');
  const [autoResolution, setAutoResolution] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [files, setFiles] = useState<KnowledgeFile[]>([]);

  // Fetch agents from API
  useEffect(() => {
    fetchAgentsFromApi();
  }, []);

  const fetchAgentsFromApi = async () => {
    setIsLoading(true);
    try {
      const data = await getAgents();
      setAgentsList(data);
      if (data.length > 0 && !selectedAgentId) {
        populateForm(data[0]);
      }
    } catch (e) {
      console.error('Error fetching agents:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const populateForm = (agent: Agent) => {
    setSelectedAgentId(agent.id);
    setName(agent.name);
    setDepartment(agent.department || 'Support');
    setStatus(agent.status || 'online');
    setLoad(agent.load || 0);
    setTone(agent.tone || 'friendly');
    setAutoResolution(agent.autoResolution ?? true);
    setSystemPrompt(agent.systemPrompt || '');
    setFiles(agent.knowledgeBaseFiles || []);
  };

  const currentAgent = agentsList.find(a => a.id === selectedAgentId) || agentsList[0];

  const handleSelectAgent = (agent: Agent) => {
    populateForm(agent);
  };

  const handleSaveChanges = async () => {
    if (!selectedAgentId) return;

    const updates: Partial<Agent> = {
      name,
      department,
      status,
      load,
      tone,
      autoResolution,
      systemPrompt,
      knowledgeBaseFiles: files
    };

    try {
      const updated = await updateAgent(selectedAgentId, updates);
      setAgentsList(prev => prev.map(a => a.id === selectedAgentId ? { ...a, ...updated } : a));
      if (propOnUpdateAgent) {
        propOnUpdateAgent({ ...currentAgent, ...updated });
      }
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 2500);
    } catch (e) {
      console.error('Failed to update agent:', e);
    }
  };

  const handleDiscard = () => {
    if (currentAgent) {
      populateForm(currentAgent);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFilesArr: KnowledgeFile[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        newFilesArr.push({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadedAt: 'Just now'
        });
      }
      setFiles([...files, ...newFilesArr]);
    }
  };

  const handleLoadTemplate = () => {
    const templates = [
      `You are a helpful Tier 1 support agent for Omnichannel Wiazart.
Resolve customer issues, query order status, and escalate when needed.`,
      `You are a Sales Co-Pilot AI. Guide enterprise buyers, calculate plan volume pricing, and schedule live product demos.`,
      `You are a Collections Assistant AI. Conduct polite payment reminders, send payment links, and verify invoice balances.`
    ];
    setSystemPrompt(templates[Math.floor(Math.random() * templates.length)]);
  };

  const handleCreateNewAgent = () => {
    const newId = `agent-${Date.now()}`;
    const newAgentItem: Agent = {
      id: newId,
      name: `${selectedDept === 'All' ? 'Support' : selectedDept} AI Agent`,
      department: selectedDept === 'All' ? 'Support' : selectedDept,
      status: 'online',
      version: 'v1.0',
      load: 15,
      activeSessions: 0,
      resolutionRate: 95.0,
      icon: 'bot',
      tone: 'friendly',
      autoResolution: true,
      systemPrompt: `You are an automated omnichannel AI assistant. Assist clients efficiently.`,
      knowledgeBaseFiles: []
    };
    setAgentsList([...agentsList, newAgentItem]);
    if (propOnAddAgent) propOnAddAgent(newAgentItem);
    populateForm(newAgentItem);
  };

  const filteredAgents = agentsList.filter(a => selectedDept === 'All' || a.department === selectedDept);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {isSavedToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-500 animate-fadeIn">
          <Check className="w-5 h-5" />
          <span>{language === 'en' ? 'Agent updated on API successfully!' : '¡Agente actualizado en la API con éxito!'}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-2xl md:text-3xl text-slate-100 tracking-tight">
                {language === 'en' ? 'AI Agents Management' : 'Gestión de Agentes IA'}
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                {language === 'en' 
                  ? 'Real-time API sync for AI agent status, workload, and prompt policies.' 
                  : 'Sincronización en tiempo real con la API para estado, carga de trabajo y prompts.'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchAgentsFromApi}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{language === 'en' ? 'Refresh API Agents' : 'Recargar Agentes API'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Department Filter & Agents List */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Department Filter Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-indigo-400" />
              <span>{getTranslation(language, 'departments')}</span>
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {['All', 'Support', 'Sales', 'Collections'].map((dept) => {
                const isSelected = selectedDept === dept;
                const count = agentsList.filter(a => dept === 'All' || a.department === dept).length;
                return (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800 font-medium'
                    }`}
                  >
                    <span>{dept === 'All' ? (language === 'en' ? 'Todos' : 'Todos') : dept}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agents Cards List showing Name, Department, Status, Workload */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden min-h-[380px]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
              <h2 className="font-bold text-slate-100 text-sm">
                {language === 'en' ? 'Active API Agents' : 'Agentes en la API'} ({filteredAgents.length})
              </h2>
              <button
                onClick={handleCreateNewAgent}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                title="Create New Agent"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 flex flex-col gap-2.5 overflow-y-auto max-h-[500px]">
              {isLoading ? (
                <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                  <span>Loading agents from API...</span>
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 italic">
                  No agents found for this department.
                </div>
              ) : (
                filteredAgents.map((agent) => {
                  const isActive = currentAgent && currentAgent.id === agent.id;
                  const isOnline = agent.status === 'online';

                  return (
                    <div
                      key={agent.id}
                      onClick={() => handleSelectAgent(agent)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                        isActive
                          ? 'bg-slate-800 border-indigo-500/70 shadow-md'
                          : 'bg-slate-950/60 hover:bg-slate-800/50 border-slate-800/80'
                      }`}
                    >
                      {/* Name & Department */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isActive 
                              ? 'bg-indigo-600 text-white border-indigo-500' 
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            <Bot className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-100 leading-none mb-1">
                              {agent.name}
                            </h3>
                            <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-800/60 inline-block">
                              {agent.department}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge (Online / Offline) */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase flex items-center gap-1 border ${
                          isOnline
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                          <span>{isOnline ? 'Online' : 'Offline'}</span>
                        </span>
                      </div>

                      {/* Workload Progress Bar */}
                      <div className="mt-3 pt-2 border-t border-slate-800/60">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mb-1">
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3 text-indigo-400" />
                            <span>Carga de Trabajo:</span>
                          </span>
                          <span className="font-mono font-bold text-slate-200">{agent.load}%</span>
                        </div>

                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div
                            style={{ width: `${Math.min(100, Math.max(0, agent.load))}%` }}
                            className={`h-full transition-all duration-300 ${
                              agent.load > 85 
                                ? 'bg-rose-500' 
                                : agent.load > 60 
                                ? 'bg-amber-500' 
                                : 'bg-emerald-500'
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Agent Settings Editor */}
        {currentAgent ? (
          <div className="lg:col-span-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm h-full flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/60">
                <div>
                  <h2 className="font-bold text-lg text-slate-100 mb-0.5">
                    {language === 'en' ? 'Configuring Agent' : 'Configurando Agente'}: {name}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {currentAgent.id} | Dept: {department}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleDiscard}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-xs font-semibold cursor-pointer"
                  >
                    {getTranslation(language, 'discard')}
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{getTranslation(language, 'saveChanges')}</span>
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {/* Agent Properties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {getTranslation(language, 'agentName')}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Departamento
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none font-medium cursor-pointer"
                    >
                      <option value="Support">Support</option>
                      <option value="Sales">Sales</option>
                      <option value="Collections">Collections</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Estado (Online/Offline)
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none font-medium cursor-pointer"
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="processing">Processing</option>
                      <option value="degraded">Degraded</option>
                    </select>
                  </div>
                </div>

                {/* Workload Slider Control */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-slate-300 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      <span>Simular / Ajustar Carga de Trabajo</span>
                    </label>
                    <span className="font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                      {load}% Workload
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={load}
                    onChange={(e) => setLoad(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Knowledge Base Documents */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{getTranslation(language, 'knowledgeBaseUpload')}</span>
                  </label>

                  <label className="border-2 border-dashed border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center hover:border-indigo-500/50 hover:bg-slate-950 transition-all cursor-pointer block relative bg-slate-950/40">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.docx,.txt,.csv"
                    />
                    <Upload className="w-6 h-6 text-slate-500 mb-2" />
                    <p className="font-bold text-slate-200 text-xs mb-1">
                      {getTranslation(language, 'dragDropFiles')}
                    </p>
                    <p className="text-[11px] text-slate-500 mb-2">
                      {getTranslation(language, 'supportsFormat')}
                    </p>
                  </label>

                  <div className="space-y-1.5 pt-1">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2 text-slate-300 font-medium">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>{file.name}</span>
                          <span className="text-slate-500 text-[10px]">({file.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Prompt Instructions */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {getTranslation(language, 'problemSolvingPolicy')}
                    </label>
                    <button
                      type="button"
                      onClick={handleLoadTemplate}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs cursor-pointer"
                    >
                      {getTranslation(language, 'loadTemplate')}
                    </button>
                  </div>

                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    rows={6}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono text-xs focus:border-indigo-500 focus:outline-none leading-relaxed resize-y"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-sm">
            Select an agent from the list to edit properties.
          </div>
        )}
      </div>
    </div>
  );
};
