export type ViewMode = 'login' | 'dashboard' | 'agents' | 'feed' | 'settings';
export type Language = 'en' | 'es';

export interface Agent {
  id: string;
  name: string;
  department: string;
  status: 'online' | 'offline' | 'processing' | 'degraded';
  version: string;
  load: number; // 0-100%
  activeSessions: number;
  resolutionRate: number; // e.g. 96.5%
  icon: string;
  tone: string;
  autoResolution: boolean;
  systemPrompt: string;
  knowledgeBaseFiles: KnowledgeFile[];
}

export interface KnowledgeFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
}

export interface Session {
  id: string;
  clientName: string;
  channel: 'WhatsApp' | 'Voice' | 'Softphone';
  clientId: string;
  status: 'processing' | 'active' | 'escalated';
  lastMessage: string;
  unreadCount?: number;
  messages: Message[];
  aiReasoning: {
    currentIntent: string;
    confidence: number;
    historicalIssue: string;
    frustrationLevel: number; // 0-100
    nextActions: string[];
  };
}

export interface Message {
  id: string;
  sender: 'user' | 'ai' | 'system' | 'agent';
  text: string;
  timestamp: string;
  systemLog?: string;
}

export interface SystemAlert {
  id: string;
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  timeAgo: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'OK' | 'WARN' | 'ERR';
  message: string;
}
