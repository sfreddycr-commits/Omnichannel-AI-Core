export type ViewMode = 'login' | 'dashboard' | 'agents' | 'feed' | 'chats' | 'calls' | 'channels' | 'settings';
export type Language = 'en' | 'es';
export type ThemeMode = 'light' | 'dark';

export interface KnowledgeFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
}

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
  knowledgeBaseFiles?: KnowledgeFile[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'agent' | 'system';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface ChatItem {
  id: string;
  clientName: string;
  phoneNumber: string;
  lastMessage: string;
  department: 'Support' | 'Sales' | 'Collections' | 'General';
  timestamp: string;
  unreadCount: number;
  avatar?: string;
  isAiManaged: boolean;
  messages: ChatMessage[];
}

export interface CallTranscriptSegment {
  id: string;
  speaker: 'caller' | 'ai' | 'agent';
  text: string;
  timestamp: string;
}

export interface CallItem {
  id: string;
  callerNumber: string;
  callerName?: string;
  status: 'en_vivo' | 'finalizada'; // 'en vivo' or 'finalizada'
  assignedAgent: string;
  department: string;
  durationSeconds: number;
  startedAt: string;
  transcript: CallTranscriptSegment[];
  sentiment?: 'positive' | 'neutral' | 'frustrated';
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
