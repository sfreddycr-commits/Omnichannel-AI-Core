import express from 'express';
import path from 'path';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { processAgentMessage } from './src/services/geminiAgentEngine';
import { kiraEngineInstance } from './src/services/kira/KiraEngine';
import { DESIGNSOFT_CATALOG, executeCrearCotizacion, executeConsultarTicket } from './src/services/designsoftCrmService';
import { voiceBridgeService } from './src/services/VoiceBridgeService';

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json());

// In-memory data stores for WhatsApp Chats and VoIP Calls
let mockChats = [
  {
    id: 'chat-wa-101',
    customerName: 'Restaurante El Marisco CR',
    phoneNumber: '+506 8899-4412',
    lastMessage: 'Hola, ocupo cotización del POS para 3 meseros con comandas táctiles.',
    timestamp: '10:45 AM',
    department: 'POS Restaurantes',
    unreadCount: 1,
    aiManaged: true,
    history: [
      { sender: 'user', text: 'Hola, ocupo cotización del POS para 3 meseros con comandas táctiles.', timestamp: '10:45 AM' }
    ]
  },
  {
    id: 'chat-wa-102',
    customerName: 'Dra. María Fernández',
    phoneNumber: '+506 7011-2233',
    lastMessage: '¿El sistema médico incluye firma digital para recetas médicas?',
    timestamp: '09:30 AM',
    department: 'Salud & Clinicas',
    unreadCount: 0,
    aiManaged: true,
    history: [
      { sender: 'user', text: '¿El sistema médico incluye firma digital para recetas médicas?', timestamp: '09:30 AM' },
      { sender: 'ai', text: '¡Hola Dra. Fernández! Sí, DesignSoft Médica incluye módulo de firma digital certificado para recetas y expedientes conforme a la normativa del Colegio de Médicos de Costa Rica.', timestamp: '09:31 AM' }
    ]
  },
  {
    id: 'chat-wa-103',
    customerName: 'Distribuidora San José S.A.',
    phoneNumber: '+506 2222-8000',
    lastMessage: 'Ticket DS-8041: ¿Ya está lista la conexión con ATV Hacienda?',
    timestamp: 'Ayer',
    department: 'Facturación & ERP',
    unreadCount: 0,
    aiManaged: false,
    history: [
      { sender: 'user', text: 'Ticket DS-8041: ¿Ya está lista la conexión con ATV Hacienda?', timestamp: 'Ayer' }
    ]
  }
];

let mockCalls = [
  {
    id: 'call-sip-901',
    callerNumber: '+506 8345-6789',
    callerName: 'Marisquería Soda Tica',
    status: 'live',
    assignedAgent: 'Marlo (Empleado Digital IA)',
    durationSeconds: 124,
    startTime: '10:42 AM',
    transcript: [
      { speaker: 'Cliente', text: 'Buenos días, llamo para consultar si el sistema de restaurantes permite ver el inventario por gramos.' },
      { speaker: 'IA (Marlo)', text: '¡Excelente día! Sí, correcto. DesignSoft POS Restaurantes permite desglosar recetas por gramaje, litros o unidades exactas y descuenta el inventario con cada comanda enviada a cocina.' },
      { speaker: 'Cliente', text: 'Perfecto, ¿cuánto cuesta la licencia mensual?' }
    ]
  },
  {
    id: 'call-sip-902',
    callerNumber: '+506 2551-9900',
    callerName: 'Clínica Dental Escalante',
    status: 'ended',
    assignedAgent: 'Marlo (Empleado Digital IA)',
    durationSeconds: 215,
    startTime: '09:15 AM',
    transcript: [
      { speaker: 'Cliente', text: 'Necesito solicitar soporte técnico para el envío de tiquetes tributarios.' },
      { speaker: 'IA (Marlo)', text: 'He consultado su expediente. Su sistema está activo y sincronizado. Procedo a verificar los comprobantes pendientes en la plataforma de Hacienda.' }
    ]
  }
];

let mockAgents = [
  {
    id: 'agent-marlo-1',
    name: 'Marlo - Empleado Digital Omnicanal',
    department: 'POS & CRM Comercial',
    status: 'online',
    workloadPercentage: 68,
    activeChannels: ['VoIP / SIP (Asterisk)', 'WhatsApp Business Webhook'],
    systemPrompt: 'Agente experto comercial en POS Restaurantes y Facturación Electrónica Hacienda Costa Rica.'
  },
  {
    id: 'agent-soporte-2',
    name: 'Soporte Nivel 2 - Facturación',
    department: 'Facturación & ERP',
    status: 'online',
    workloadPercentage: 42,
    activeChannels: ['WhatsApp Tickets'],
    systemPrompt: 'Agente especializado en errores ATV Hacienda v4.3 y llaves criptográficas.'
  }
];

// --- REST API ENDPOINTS ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Wiazart by designsoftcr.com',
    version: '2.5.0',
    geminiKeyStatus: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
    timestamp: new Date().toISOString()
  });
});

// App Info
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Wiazart',
    signature: 'by designsoftcr.com',
    service: 'Wiazart by designsoftcr.com',
    title: 'Wiazart by designsoftcr.com — Omnichannel AI Core',
    version: '2.5.0'
  });
});

// Get AI Agents
app.get('/api/agents', (req, res) => {
  res.json(mockAgents);
});

// Get Catalog
app.get('/api/crm/catalog', (req, res) => {
  res.json(DESIGNSOFT_CATALOG);
});

// Get Chats
app.get('/api/chats', (req, res) => {
  res.json(mockChats);
});

// Send Message in Chat (WhatsApp Interaction via Gemini Agent)
app.post('/api/chats/:chatId/messages', async (req, res) => {
  const { chatId } = req.params;
  const { text, sender } = req.body;

  const chat = mockChats.find(c => c.id === chatId);
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }

  const timeStr = new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' });

  // Add user message to history
  chat.history.push({
    sender: sender || 'user',
    text: text,
    timestamp: timeStr
  });
  chat.lastMessage = text;
  chat.timestamp = timeStr;

  // Process through Gemini Agent if AI managed
  if (chat.aiManaged) {
    const formattedHistory = chat.history.map(h => ({
      role: h.sender === 'user' ? 'user' as const : 'model' as const,
      content: h.text
    }));

    const agentResult = await processAgentMessage(text, formattedHistory);

    const aiTimeStr = new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' });
    chat.history.push({
      sender: 'ai',
      text: agentResult.replyText,
      timestamp: aiTimeStr
    });
    chat.lastMessage = agentResult.replyText;
    chat.timestamp = aiTimeStr;

    return res.json({
      chat,
      replyText: agentResult.replyText,
      toolCalls: agentResult.toolCallsExecuted,
      isEscalated: agentResult.isEscalated
    });
  }

  res.json({ chat });
});

// WhatsApp Webhook Simulator
app.post('/api/whatsapp/webhook', async (req, res) => {
  const { phoneNumber, customerName, messageText } = req.body;

  if (!phoneNumber || !messageText) {
    return res.status(400).json({ error: 'Missing phoneNumber or messageText' });
  }

  let chat = mockChats.find(c => c.phoneNumber === phoneNumber);
  const timeStr = new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' });

  if (!chat) {
    chat = {
      id: `chat-wa-${Date.now()}`,
      customerName: customerName || 'Cliente WhatsApp CR',
      phoneNumber: phoneNumber,
      lastMessage: messageText,
      timestamp: timeStr,
      department: 'Atención General',
      unreadCount: 1,
      aiManaged: true,
      history: [{ sender: 'user', text: messageText, timestamp: timeStr }]
    };
    mockChats.unshift(chat);
  } else {
    chat.history.push({ sender: 'user', text: messageText, timestamp: timeStr });
  }

  // Generate response using Gemini Engine
  const formattedHistory = chat.history.map(h => ({
    role: h.sender === 'user' ? 'user' as const : 'model' as const,
    content: h.text
  }));

  const agentResult = await processAgentMessage(messageText, formattedHistory);

  const aiTimeStr = new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' });
  chat.history.push({ sender: 'ai', text: agentResult.replyText, timestamp: aiTimeStr });
  chat.lastMessage = agentResult.replyText;

  res.json({
    status: 'delivered',
    phoneNumber,
    response: agentResult.replyText,
    toolsExecuted: agentResult.toolCallsExecuted
  });
});

// Get Active Calls
app.get('/api/calls', (req, res) => {
  res.json(mockCalls);
});

// Simulate New VoIP / SIP Call
app.post('/api/calls/simulate', async (req, res) => {
  const { callerNumber, callerName, initialQuery } = req.body;
  const timeStr = new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' });

  const query = initialQuery || "Hola, requiero información sobre el POS Restaurantes de DesignSoft.";

  const agentResult = await processAgentMessage(query, []);

  const newCall = {
    id: `call-sip-${Date.now()}`,
    callerNumber: callerNumber || '+506 8888-9999',
    callerName: callerName || 'Cliente Telefónico CR',
    status: 'live',
    assignedAgent: 'Marlo (Empleado Digital IA)',
    durationSeconds: 15,
    startTime: timeStr,
    transcript: [
      { speaker: 'Cliente', text: query },
      { speaker: 'IA (Marlo)', text: agentResult.replyText }
    ]
  };

  mockCalls.unshift(newCall);
  res.json(newCall);
});

// CRM Quote Generation
app.post('/api/crm/quote', (req, res) => {
  const { nombreCliente, telefonoWhatsApp, productoId, numUsuarios } = req.body;
  const quote = executeCrearCotizacion({
    nombreCliente,
    telefonoWhatsApp,
    productoId,
    numUsuarios: Number(numUsuarios) || 1
  });
  res.json(quote);
});

// Kira Core Engine Endpoint
app.post('/api/kira/process', async (req, res) => {
  const { message, history, profileId } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'message parameter is required' });
  }

  const result = await kiraEngineInstance.processMessage(
    message,
    history || [],
    profileId || 'kira-ventas'
  );

  res.json(result);
});

// Asterisk ARI Voice Bridge Endpoints
app.get('/api/voice-bridge/status', (req, res) => {
  res.json(voiceBridgeService.getStatus());
});

app.post('/api/voice-bridge/simulate', async (req, res) => {
  const { callerNumber, callerName } = req.body;
  const timeStr = new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' });

  const session = await voiceBridgeService.simulateAriCall(
    callerNumber || '+506 8765-4321',
    callerName || 'Soda El Buen Gusto (CallMyWay)'
  );

  const newCall = {
    id: session.channelId,
    callerNumber: session.callerNumber,
    callerName: session.callerName,
    status: 'live',
    assignedAgent: 'Kira Voice (ARI Stasis Bridge)',
    durationSeconds: 1,
    startTime: timeStr,
    transcript: session.transcript
  };

  mockCalls.unshift(newCall);
  res.json({
    message: 'Llamada ARI simulada iniciada exitosamente con Gemini Live API',
    session,
    call: newCall
  });
});

// --- WEBSOCKET SERVER FOR REALTIME AUDIO / FEED ---
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const reqUrl = req.url || '';
  console.log(`[WebSocket] Client connected on endpoint: ${reqUrl}`);

  let activeChannelIdForConnection: string | null = null;

  ws.send(JSON.stringify({
    type: 'CONNECTION_ESTABLISHED',
    endpoint: reqUrl,
    message: 'Conectado al servidor de tiempo real Wiazart by designsoftcr.com',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', async (data) => {
    try {
      const parsed = JSON.parse(data.toString());

      if (parsed.type === 'START_SOFTPHONE_CALL') {
        const ext = parsed.extension || '2000';
        const callerName = parsed.callerName || `Extensión Softphone ${ext}`;

        const session = await voiceBridgeService.simulateAriCall(
          `Ext ${ext}`,
          callerName
        );

        activeChannelIdForConnection = session.channelId;
        voiceBridgeService.attachAudioBridgeWs(session.channelId, ws);

        const newCall = {
          id: session.channelId,
          callerNumber: session.callerNumber,
          callerName: session.callerName,
          status: 'live',
          assignedAgent: 'Kira Voice (Softphone WebRTC Bridge)',
          durationSeconds: 1,
          startTime: new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' }),
          transcript: session.transcript
        };

        mockCalls.unshift(newCall);

        ws.send(JSON.stringify({
          type: 'CALL_STARTED',
          channelId: session.channelId,
          extension: ext,
          status: 'active',
          initialTranscript: session.transcript
        }));

      } else if (parsed.type === 'ATTACH_AUDIO_BRIDGE') {
        const chanId = parsed.channelId || activeChannelIdForConnection;
        if (chanId) {
          activeChannelIdForConnection = chanId;
          voiceBridgeService.attachAudioBridgeWs(chanId, ws);
          ws.send(JSON.stringify({
            type: 'AUDIO_BRIDGE_ATTACHED',
            channelId: chanId,
            status: 'connected'
          }));
        }

      } else if (parsed.type === 'VOIP_AUDIO_STREAM' || parsed.type === 'INBOUND_PCM_AUDIO') {
        const chanId = parsed.channelId || activeChannelIdForConnection;
        const pcmData = parsed.pcmBase64 || parsed.pcmData || parsed.audio;

        if (chanId && pcmData) {
          voiceBridgeService.processInboundAudio(chanId, pcmData);
        } else if (parsed.textInput && chanId) {
          // If text input sent via softphone audio stream channel
          voiceBridgeService.processInboundAudio(chanId, '');
        }

      } else if (parsed.type === 'DTMF_DIGIT') {
        const chanId = parsed.channelId || activeChannelIdForConnection;
        console.log(`[Softphone WS] DTMF Digit '${parsed.digit}' received for channel ${chanId}`);
        ws.send(JSON.stringify({
          type: 'DTMF_ACK',
          digit: parsed.digit,
          channelId: chanId
        }));

      } else if (parsed.type === 'HANGUP_CALL') {
        const chanId = parsed.channelId || activeChannelIdForConnection;
        if (chanId) {
          await voiceBridgeService.closeVoiceSession(chanId);
          ws.send(JSON.stringify({
            type: 'CALL_ENDED',
            channelId: chanId
          }));
        }
      }
    } catch (e) {
      console.error('[Softphone WS] Error processing message:', e);
    }
  });

  ws.on('close', () => {
    if (activeChannelIdForConnection) {
      voiceBridgeService.closeVoiceSession(activeChannelIdForConnection);
    }
  });
});

// --- VITE MIDDLEWARE & SERVER START ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Wiazart by designsoftcr.com Server running on http://localhost:${PORT}`);
    voiceBridgeService.start();
  });
}

startServer();
