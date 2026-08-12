/// <reference types="vite/client" />
import { Agent, ChatItem, CallItem, Session, ChatMessage } from './types';

// Environment variables with fallback defaults
export const API_URL = import.meta.env.VITE_API_URL || 'https://api.omnichannel.wiazart.com';
export const WS_URL = import.meta.env.VITE_WS_URL || 'wss://omnichannel.wiazart.com/ws';

// Internal fallback mock state for when API is unreachable or during offline development
let cachedAgents: Agent[] = [
  {
    id: 'support-tier1',
    name: 'Tier 1 Support Bot',
    department: 'Support',
    status: 'online',
    version: 'v4.2',
    load: 78,
    activeSessions: 1842,
    resolutionRate: 96.5,
    icon: 'support_agent',
    tone: 'friendly',
    autoResolution: true,
    systemPrompt: `You are a helpful Tier 1 support agent for Omnichannel Wiazart.
Resolve simple user queries using the provided knowledge base.
Escalate complex billing or hardware faults to human operators.`,
    knowledgeBaseFiles: [
      { id: 'f1', name: 'support_faqs_2026.pdf', size: '2.4 MB', uploadedAt: 'Yesterday' },
      { id: 'f2', name: 'troubleshooting_guide.docx', size: '1.8 MB', uploadedAt: '3 days ago' }
    ]
  },
  {
    id: 'support-escalation',
    name: 'Technical Escalation Bot',
    department: 'Support',
    status: 'online',
    version: 'v2.1',
    load: 42,
    activeSessions: 230,
    resolutionRate: 92.0,
    icon: 'troubleshoot',
    tone: 'professional',
    autoResolution: false,
    systemPrompt: `Handle tier 2 complex technical infrastructure diagnostics and escalated ticket routing.`,
    knowledgeBaseFiles: [
      { id: 'f3', name: 'network_architecture_v2.pdf', size: '8.5 MB', uploadedAt: '1 week ago' }
    ]
  },
  {
    id: 'sales-copilot',
    name: 'Sales Co-Pilot AI',
    department: 'Sales',
    status: 'online',
    version: 'v3.5',
    load: 92,
    activeSessions: 1204,
    resolutionRate: 88.4,
    icon: 'shopping_cart',
    tone: 'friendly',
    autoResolution: true,
    systemPrompt: `Guiding enterprise buyers, evaluating customized AI pipeline packages, and scheduling product demos.`,
    knowledgeBaseFiles: [
      { id: 'f5', name: 'enterprise_pricing_sheet.pdf', size: '3.1 MB', uploadedAt: '1 month ago' }
    ]
  },
  {
    id: 'collections-bot',
    name: 'Collections & Billing Bot',
    department: 'Collections',
    status: 'degraded',
    version: 'v1.8',
    load: 15,
    activeSessions: 446,
    resolutionRate: 74.5,
    icon: 'account_balance_wallet',
    tone: 'direct',
    autoResolution: false,
    systemPrompt: `Politely remind enterprise customers of overdue balances and assist with payment link generation.`,
    knowledgeBaseFiles: [
      { id: 'f6', name: 'collections_sop.pdf', size: '1.0 MB', uploadedAt: '2 months ago' }
    ]
  }
];

let cachedChats: ChatItem[] = [
  {
    id: 'chat-1',
    clientName: 'Carlos Mendoza',
    phoneNumber: '+52 55 4123 9876',
    lastMessage: 'Hola, quisiera consultar el estado de mi pedido #WX-9021',
    department: 'Support',
    timestamp: '10:42 AM',
    unreadCount: 2,
    isAiManaged: true,
    messages: [
      { id: 'm1', sender: 'user', text: 'Hola, quisiera consultar el estado de mi pedido #WX-9021', timestamp: '10:40 AM', status: 'read' },
      { id: 'm2', sender: 'ai', text: '¡Hola Carlos! Con gusto reviso tu pedido #WX-9021. Se encuentra actualmente en tránsito hacia tu domicilio.', timestamp: '10:41 AM', status: 'read' },
      { id: 'm3', sender: 'user', text: '¿Tienen un horario estimado de entrega para hoy?', timestamp: '10:42 AM', status: 'delivered' }
    ]
  },
  {
    id: 'chat-2',
    clientName: 'Sofía Valenzuela',
    phoneNumber: '+1 (305) 882-1920',
    lastMessage: 'Necesito una cotización para plan Enterprise con 50 licencias.',
    department: 'Sales',
    timestamp: '10:15 AM',
    unreadCount: 0,
    isAiManaged: true,
    messages: [
      { id: 'm20', sender: 'user', text: 'Necesito una cotización para plan Enterprise con 50 licencias.', timestamp: '10:10 AM', status: 'read' },
      { id: 'm21', sender: 'ai', text: '¡Excelente Sofía! El plan Enterprise incluye soporte prioritario 24/7 y SLA del 99.9%. ¿Te gustaría agendar una demo técnica hoy a las 3 PM?', timestamp: '10:15 AM', status: 'read' }
    ]
  },
  {
    id: 'chat-3',
    clientName: 'Alejandro Morales',
    phoneNumber: '+52 81 9012 3456',
    lastMessage: 'Deseo realizar el pago de mi factura vencida de Julio.',
    department: 'Collections',
    timestamp: '09:50 AM',
    unreadCount: 1,
    isAiManaged: false,
    messages: [
      { id: 'm30', sender: 'user', text: 'Deseo realizar el pago de mi factura vencida de Julio.', timestamp: '09:48 AM', status: 'read' },
      { id: 'm31', sender: 'agent', text: 'Hola Alejandro, un operador humano te asistirá. Te compartimos la liga segura de pago.', timestamp: '09:50 AM', status: 'sent' }
    ]
  },
  {
    id: 'chat-4',
    clientName: 'Mariana Ríos',
    phoneNumber: '+34 612 345 678',
    lastMessage: '¿Cuál es el horario de atención telefónica?',
    department: 'General',
    timestamp: 'Ayer',
    unreadCount: 0,
    isAiManaged: true,
    messages: [
      { id: 'm40', sender: 'user', text: '¿Cuál es el horario de atención telefónica?', timestamp: 'Ayer', status: 'read' },
      { id: 'm41', sender: 'ai', text: 'Nuestro centro de atención está disponible de Lunes a Viernes de 8:00 AM a 8:00 PM (GMT-6).', timestamp: 'Ayer', status: 'read' }
    ]
  }
];

let cachedCalls: CallItem[] = [
  {
    id: 'call-101',
    callerNumber: '+52 55 9876 5432',
    callerName: 'Fernando Torres',
    status: 'en_vivo',
    assignedAgent: 'Voice AI Assistant v2',
    department: 'Support',
    durationSeconds: 142,
    startedAt: '10:39 AM',
    sentiment: 'neutral',
    transcript: [
      { id: 't1', speaker: 'ai', text: 'Gracias por comunicarse con Omnichannel Wiazart. Soy el asistente de voz IA. ¿En qué le puedo colaborar?', timestamp: '00:05' },
      { id: 't2', speaker: 'caller', text: 'Hola, se me cortó la señal de internet en la oficina central.', timestamp: '00:15' },
      { id: 't3', speaker: 'ai', text: 'Lamento el inconveniente Fernando. Estoy realizando una verificación de enlace en la zona central.', timestamp: '00:25' },
      { id: 't4', speaker: 'caller', text: 'Entendido, ¿cuánto tiempo tardará en reiniciarse el servicio?', timestamp: '01:10' },
      { id: 't5', speaker: 'ai', text: 'El diagnóstico detectó fluctuación en el nodo Alfa. Procediendo con la reconexión remota...', timestamp: '02:20' }
    ]
  },
  {
    id: 'call-102',
    callerNumber: '+1 (415) 555-0199',
    callerName: 'Jessica Miller',
    status: 'en_vivo',
    assignedAgent: 'Sales Co-Pilot AI',
    department: 'Sales',
    durationSeconds: 85,
    startedAt: '10:40 AM',
    sentiment: 'positive',
    transcript: [
      { id: 't10', speaker: 'ai', text: 'Welcome to Wiazart Sales Hotline. How can I tailor your AI suite today?', timestamp: '00:03' },
      { id: 't11', speaker: 'caller', text: 'Hi, I am interested in connecting our WhatsApp Business API directly to your AI Agents.', timestamp: '00:20' },
      { id: 't12', speaker: 'ai', text: 'Great! Our WhatsApp Integration supports real-time WebSocket webhooks and Meta Official API.', timestamp: '00:45' }
    ]
  },
  {
    id: 'call-103',
    callerNumber: '+52 81 1234 5678',
    callerName: 'Roberto Gómez',
    status: 'finalizada',
    assignedAgent: 'Collections & Billing Bot',
    department: 'Collections',
    durationSeconds: 310,
    startedAt: '09:30 AM',
    sentiment: 'positive',
    transcript: [
      { id: 't20', speaker: 'ai', text: 'Estimado Roberto, le saludamos de atención a clientes. ¿Pudo revisar el comprobante de pago?', timestamp: '00:05' },
      { id: 't21', speaker: 'caller', text: 'Sí, ya realicé la transferencia bancaria esta mañana.', timestamp: '01:12' },
      { id: 't22', speaker: 'ai', text: 'Confirmado. Su saldo ha sido actualizado con éxito. ¡Que tenga excelente día!', timestamp: '05:00' }
    ]
  }
];

// Helper for fetch with timeout and error fallback
async function fetchWithFallback<T>(endpoint: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return data as T;
    }
  } catch (error) {
    console.warn(`[API] Endpoint ${url} unreachable or error:`, error);
  }

  if (fallbackData !== undefined) {
    return fallbackData;
  }
  throw new Error(`Failed to fetch from ${url}`);
}

// REST Endpoints
export async function getAgents(): Promise<Agent[]> {
  return fetchWithFallback<Agent[]>('/api/agents', { method: 'GET' }, cachedAgents);
}

export async function updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
  const updatedAgent = await fetchWithFallback<Agent>(
    `/api/agents/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates)
    },
    {
      ...cachedAgents.find(a => a.id === id)!,
      ...updates
    }
  );

  // Update cached state
  cachedAgents = cachedAgents.map(a => a.id === id ? { ...a, ...updates } : a);
  return updatedAgent;
}

export async function getChats(): Promise<ChatItem[]> {
  return fetchWithFallback<ChatItem[]>('/api/chats', { method: 'GET' }, cachedChats);
}

export async function sendChatMessage(chatId: string, text: string, sender: 'user' | 'ai' | 'agent' = 'agent'): Promise<ChatMessage> {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    sender,
    text,
    timestamp: time,
    status: 'sent'
  };

  await fetchWithFallback<ChatMessage>(
    `/api/chats/${chatId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(newMsg)
    },
    newMsg
  );

  // Local sync
  cachedChats = cachedChats.map(chat => {
    if (chat.id === chatId) {
      return {
        ...chat,
        lastMessage: text,
        timestamp: time,
        messages: [...chat.messages, newMsg]
      };
    }
    return chat;
  });

  return newMsg;
}

export async function getCalls(): Promise<CallItem[]> {
  return fetchWithFallback<CallItem[]>('/api/calls', { method: 'GET' }, cachedCalls);
}

export async function syncData(): Promise<{ success: boolean; timestamp: string }> {
  const now = new Date().toISOString();
  return fetchWithFallback<{ success: boolean; timestamp: string }>(
    '/api/sync',
    { method: 'POST' },
    { success: true, timestamp: now }
  );
}

// WebSocket Connection Manager with auto-reconnect and fallback
export class RealtimeClient {
  private wsUrl: string;
  private socket: WebSocket | null = null;
  private listeners: Map<string, Array<(payload: any) => void>> = new Map();
  private isConnected = false;
  private reconnectInterval: any = null;

  constructor(url: string = WS_URL) {
    this.wsUrl = url;
  }

  public connect() {
    try {
      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        console.log('[WebSocket] Connected to', this.wsUrl);
        this.isConnected = true;
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
        this.emitLocal('connection_status', { connected: true });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type && this.listeners.has(data.type)) {
            this.listeners.get(data.type)?.forEach(cb => cb(data.payload));
          }
        } catch (e) {
          console.error('[WebSocket] Parsing message error:', e);
        }
      };

      this.socket.onerror = (err) => {
        console.warn('[WebSocket] Connection error:', err);
        this.isConnected = false;
        this.emitLocal('connection_status', { connected: false });
      };

      this.socket.onclose = () => {
        console.warn('[WebSocket] Closed.');
        this.isConnected = false;
        this.emitLocal('connection_status', { connected: false });
        this.scheduleReconnect();
      };
    } catch (e) {
      console.warn('[WebSocket] Connection failed:', e);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (!this.reconnectInterval) {
      this.reconnectInterval = setInterval(() => {
        if (!this.isConnected) {
          console.log('[WebSocket] Attempting reconnect...');
          this.connect();
        }
      }, 10000);
    }
  }

  public on(eventType: string, callback: (payload: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push(callback);
  }

  public off(eventType: string, callback: (payload: any) => void) {
    if (this.listeners.has(eventType)) {
      const list = this.listeners.get(eventType)!.filter(cb => cb !== callback);
      this.listeners.set(eventType, list);
    }
  }

  private emitLocal(eventType: string, payload: any) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType)?.forEach(cb => cb(payload));
    }
  }

  public send(type: string, payload: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('[WebSocket] Socket not connected. Message cached locally.');
    }
  }

  public close() {
    if (this.socket) {
      this.socket.close();
    }
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }
  }
}

export const realtimeClient = new RealtimeClient();

// --- DesignSoft Omnichannel Helper Services ---
export async function sendWhatsAppWebhook(phoneNumber: string, customerName: string, messageText: string) {
  try {
    const res = await fetch('/api/whatsapp/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, customerName, messageText })
    });
    return await res.json();
  } catch (e) {
    console.error('Failed to send WhatsApp Webhook:', e);
    return {
      status: 'simulated_fallback',
      phoneNumber,
      response: 'Respuesta generada en modo offline. DesignSoft POS Restaurantes incluye comandas táctiles e integración directa con Hacienda.'
    };
  }
}

export async function simulateVoipCall(callerNumber: string, callerName: string, initialQuery: string) {
  try {
    const res = await fetch('/api/calls/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callerNumber, callerName, initialQuery })
    });
    return await res.json();
  } catch (e) {
    console.error('Failed to simulate VoIP call:', e);
    return null;
  }
}

export async function generateCrmQuote(nombreCliente: string, telefonoWhatsApp: string, productoId: string, numUsuarios?: number) {
  try {
    const res = await fetch('/api/crm/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombreCliente, telefonoWhatsApp, productoId, numUsuarios })
    });
    return await res.json();
  } catch (e) {
    console.error('Failed to generate CRM quote:', e);
    return null;
  }
}
