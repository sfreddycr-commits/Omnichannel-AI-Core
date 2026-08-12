import React, { useState } from 'react';
import { Language, Agent, KnowledgeFile } from '../types';
import { getTranslation } from '../translations';
import { 
  FolderOpen, 
  Plus, 
  Bot, 
  Upload, 
  FileText, 
  X, 
  Save, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Database,
  ChevronDown,
  Headphones,
  Wrench,
  Receipt
} from 'lucide-react';

interface AgentsViewProps {
  language: Language;
  agents: Agent[];
  onUpdateAgent: (updatedAgent: Agent) => void;
  onAddAgent: (newAgent: Agent) => void;
}

export const AgentsView: React.FC<AgentsViewProps> = ({
  language,
  agents,
  onUpdateAgent,
  onAddAgent
}) => {
  const [selectedDept, setSelectedDept] = useState<'Support' | 'Sales' | 'Collections'>('Support');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('support-tier1');
  const [isSavedToast, setIsSavedToast] = useState(false);

  // Find currently selected agent or default to first
  const currentAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  // Editable Form State
  const [name, setName] = useState(currentAgent.name);
  const [tone, setTone] = useState(currentAgent.tone);
  const [autoResolution, setAutoResolution] = useState(currentAgent.autoResolution);
  const [systemPrompt, setSystemPrompt] = useState(currentAgent.systemPrompt);
  const [files, setFiles] = useState<KnowledgeFile[]>(currentAgent.knowledgeBaseFiles);

  // Update form fields when selected agent changes
  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgentId(agent.id);
    setName(agent.name);
    setTone(agent.tone);
    setAutoResolution(agent.autoResolution);
    setSystemPrompt(agent.systemPrompt);
    setFiles(agent.knowledgeBaseFiles);
  };

  const handleSaveChanges = () => {
    const updated: Agent = {
      ...currentAgent,
      name,
      tone,
      autoResolution,
      systemPrompt,
      knowledgeBaseFiles: files
    };
    onUpdateAgent(updated);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  const handleDiscard = () => {
    setName(currentAgent.name);
    setTone(currentAgent.tone);
    setAutoResolution(currentAgent.autoResolution);
    setSystemPrompt(currentAgent.systemPrompt);
    setFiles(currentAgent.knowledgeBaseFiles);
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
      `You are a helpful Tier 1 support agent. 
Your primary goal is to resolve simple user queries using the provided knowledge base.
If a query involves billing disputes over $50, or technical issues requiring backend access, immediately escalate to a human agent.
Always maintain a friendly tone.`,
      `You are a Sales Co-Pilot AI. Your goal is to guide potential enterprise leads, recommend tailored subscription tiers, and answer feature integration questions concisely.`,
      `You are a Collections Assistant AI. Conduct polite, empathetic payment reminder outreach, verify past due balances, and offer standardized installment plan templates.`
    ];
    setSystemPrompt(templates[Math.floor(Math.random() * templates.length)]);
  };

  const handleCreateNewAgent = () => {
    const newId = `agent-${Date.now()}`;
    const newAgentItem: Agent = {
      id: newId,
      name: `${selectedDept} Bot #${agents.length + 1}`,
      department: selectedDept,
      status: 'online',
      version: 'v1.0',
      load: 10,
      activeSessions: 0,
      resolutionRate: 98.0,
      icon: 'bot',
      tone: 'friendly',
      autoResolution: true,
      systemPrompt: `You are an automated ${selectedDept} AI assistant. Assist customers courteously based on uploaded documents.`,
      knowledgeBaseFiles: []
    };
    onAddAgent(newAgentItem);
    handleSelectAgent(newAgentItem);
  };

  const filteredAgents = agents.filter(a => a.department === selectedDept);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Banner */}
      {isSavedToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-emerald-500 animate-fadeIn">
          <Check className="w-5 h-5" />
          <span>{language === 'en' ? 'Agent configuration saved successfully!' : '¡Configuración del agente guardada con éxito!'}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Departments & Support Agents */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Departments Widget */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h2 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-600" />
              <span>{getTranslation(language, 'departments')}</span>
            </h2>
            <div className="flex flex-col gap-2">
              {[
                { name: 'Support', count: '12 Agents' },
                { name: 'Sales', count: '5 Agents' },
                { name: 'Collections', count: '3 Agents' }
              ].map((dept) => {
                const isSelected = selectedDept === dept.name;
                return (
                  <button
                    key={dept.name}
                    onClick={() => setSelectedDept(dept.name as any)}
                    className={`flex items-center justify-between p-3 rounded-xl text-sm transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-transparent font-medium'
                    }`}
                  >
                    <span>{dept.name}</span>
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-600 shadow-2xs">
                      {dept.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agents List Widget */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs flex-1 flex flex-col overflow-hidden min-h-[360px]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-900 text-base">
                {selectedDept} {getTranslation(language, 'agents')}
              </h2>
              <button
                onClick={handleCreateNewAgent}
                className="bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer shadow-2xs"
                title="Add Agent"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 flex flex-col gap-2 overflow-y-auto max-h-[460px]">
              {filteredAgents.map((agent) => {
                const isActive = agent.id === selectedAgentId;
                return (
                  <div
                    key={agent.id}
                    onClick={() => handleSelectAgent(agent)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? 'bg-indigo-50/80 border border-indigo-200 shadow-2xs'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {agent.id.includes('support') ? <Headphones className="w-5 h-5" /> : agent.id.includes('sales') ? <Wrench className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 truncate">{agent.name}</h3>
                      <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${
                          agent.status === 'online' ? 'bg-emerald-500' : agent.status === 'processing' ? 'bg-indigo-600' : 'bg-slate-400'
                        }`}></span>
                        <span className="capitalize">{agent.status}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Agent Configuration Editor */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs h-full flex flex-col overflow-hidden">
            {/* Header Toolbar */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
              <div>
                <h2 className="font-bold text-xl text-slate-900 mb-0.5">
                  {getTranslation(language, 'configuration')}: {name}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  ID: {currentAgent.id.toUpperCase()} | Dept: {currentAgent.department}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDiscard}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-xs font-semibold cursor-pointer"
                >
                  {getTranslation(language, 'discard')}
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-semibold transition-colors text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{getTranslation(language, 'saveChanges')}</span>
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Identity Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                    {getTranslation(language, 'agentName')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                    {getTranslation(language, 'agentIcon')}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Bot className="w-5 h-5" />
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(language === 'en' ? 'Icon selector active!' : '¡Selector de iconos activo!')}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-xs font-semibold cursor-pointer shadow-2xs"
                    >
                      {getTranslation(language, 'changeIcon')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Knowledge Base Upload */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{getTranslation(language, 'knowledgeBaseUpload')}</span>
                </label>

                {/* Drag and Drop Zone */}
                <label className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer block relative bg-slate-50/50">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.docx,.txt,.csv"
                  />
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="font-bold text-slate-800 text-sm mb-1">
                      {getTranslation(language, 'dragDropFiles')}
                    </p>
                    <p className="text-xs text-slate-500 mb-3">
                      {getTranslation(language, 'supportsFormat')}
                    </p>
                    <span className="px-4 py-2 rounded-xl border border-slate-200 text-indigo-600 hover:bg-white transition-colors text-xs font-semibold bg-white shadow-2xs">
                      {getTranslation(language, 'browseFiles')}
                    </span>
                  </div>
                </label>

                {/* Uploaded Files List */}
                <div className="mt-3 space-y-1.5">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2.5 text-slate-800 font-medium">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span>{file.name}</span>
                        <span className="text-slate-400 text-[11px]">({file.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.id)}
                        className="text-rose-500 hover:text-rose-700 p-1 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personality & Policy Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                    {getTranslation(language, 'toneOfVoice')}
                  </label>
                  <div className="relative">
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium text-sm appearance-none focus:bg-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                    >
                      <option value="professional">{getTranslation(language, 'professionalObjective')}</option>
                      <option value="friendly">{getTranslation(language, 'friendlyEmpathetic')}</option>
                      <option value="direct">{getTranslation(language, 'directConcise')}</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                    {getTranslation(language, 'resolutionPolicy')}
                  </label>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <p className="font-bold text-xs text-slate-900">{getTranslation(language, 'autoResolution')}</p>
                      <p className="text-[11px] text-slate-500">{getTranslation(language, 'vsEscalateToHuman')}</p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoResolution}
                        onChange={(e) => setAutoResolution(e.target.checked)}
                        className="sr-only mech-switch-input"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full border border-slate-300 mech-switch-track transition-colors relative">
                        <div className="mech-switch-thumb absolute top-[2px] left-[2px] w-5 h-5 bg-white shadow-xs rounded-full transition-transform"></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Problem Solving Policy (System Prompt) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                    {getTranslation(language, 'problemSolvingPolicy')}
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleLoadTemplate}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs cursor-pointer"
                    >
                      {getTranslation(language, 'loadTemplate')}
                    </button>
                  </div>
                </div>

                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={6}
                  placeholder="Define the agent's core instructions..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-mono text-xs focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 leading-relaxed resize-y"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
