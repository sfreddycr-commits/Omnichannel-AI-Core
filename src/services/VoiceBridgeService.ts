import { WebSocket } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';

export interface ActiveVoiceSession {
  channelId: string;
  callerNumber: string;
  callerName: string;
  startTime: Date;
  status: 'connecting' | 'answered' | 'active' | 'ended';
  geminiSession?: any;
  audioBridgeWs?: WebSocket;
  transcript: Array<{ speaker: 'Cliente' | 'Kira Voice'; text: string; timestamp: string }>;
}

export interface VoiceBridgeStatus {
  ariConnected: boolean;
  ariUrl: string;
  stasisApp: string;
  activeCallsCount: number;
  totalCallsHandled: number;
  activeSessions: Array<{
    channelId: string;
    callerNumber: string;
    callerName: string;
    durationSeconds: number;
    status: string;
  }>;
}

export class VoiceBridgeService {
  private ariWs: WebSocket | null = null;
  private ai: GoogleGenAI;
  private ariUrl: string;
  private ariHttpBase: string;
  private stasisApp: string;
  private apiKeyParam: string;
  private activeSessions: Map<string, ActiveVoiceSession> = new Map();
  private totalCallsHandled: number = 0;
  private isAriConnected: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor() {
    const geminiKey = process.env.GEMINI_API_KEY || '';
    this.ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const rawAriWsUrl = process.env.ARI_WS_URL || 'ws://localhost:8088/ari/events?app=wiazart-voice-bridge&api_key=admin:adminpass';
    this.ariUrl = rawAriWsUrl;
    this.stasisApp = process.env.ARI_APP || 'wiazart-voice-bridge';

    // Extract HTTP base & credentials from WS URL or env
    try {
      const urlObj = new URL(rawAriWsUrl);
      const httpProtocol = urlObj.protocol === 'wss:' ? 'https:' : 'http:';
      this.ariHttpBase = `${httpProtocol}//${urlObj.host}/ari`;
      this.apiKeyParam = urlObj.searchParams.get('api_key') || 'admin:adminpass';
    } catch {
      this.ariHttpBase = 'http://localhost:8088/ari';
      this.apiKeyParam = 'admin:adminpass';
    }
  }

  private consecutiveFailures: number = 0;

  /**
   * Initializes the Asterisk REST Interface (ARI) WebSocket connection.
   */
  public start(): void {
    const ariEnabled = process.env.ARI_ENABLED !== 'false';
    if (!ariEnabled) {
      console.log('[VoiceBridge] ARI Connector disabled via ARI_ENABLED=false.');
      return;
    }

    console.log(`[VoiceBridge] Starting ARI Connector to ${this.ariUrl}...`);
    this.connectAriWebSocket();
  }

  /**
   * Connects or reconnects to Asterisk ARI WebSocket events.
   */
  private connectAriWebSocket(): void {
    if (this.ariWs) {
      try { 
        this.ariWs.removeAllListeners();
        this.ariWs.close(); 
      } catch {}
    }

    // Refresh URL configuration from environment if changed at runtime
    const rawAriWsUrl = process.env.ARI_WS_URL || this.ariUrl;
    this.ariUrl = rawAriWsUrl;
    try {
      const urlObj = new URL(rawAriWsUrl);
      const httpProtocol = urlObj.protocol === 'wss:' ? 'https:' : 'http:';
      this.ariHttpBase = `${httpProtocol}//${urlObj.host}/ari`;
      this.apiKeyParam = urlObj.searchParams.get('api_key') || 'admin:adminpass';
    } catch {}

    try {
      this.ariWs = new WebSocket(this.ariUrl);

      this.ariWs.on('open', () => {
        this.isAriConnected = true;
        this.consecutiveFailures = 0;
        console.log(`[VoiceBridge] ✅ Successfully connected to Asterisk ARI Stasis App: '${this.stasisApp}'`);
      });

      this.ariWs.on('message', async (data: Buffer | string) => {
        try {
          const event = JSON.parse(data.toString());
          await this.handleAriEvent(event);
        } catch (err) {
          console.error('[VoiceBridge] Error parsing ARI event message:', err);
        }
      });

      this.ariWs.on('error', (err: any) => {
        this.isAriConnected = false;
        this.consecutiveFailures++;
        if (this.consecutiveFailures <= 1) {
          console.log(`[VoiceBridge] Asterisk PBX is offline or standalone (${err.message}). Voice Bridge active in simulated/REST mode.`);
        }
      });

      this.ariWs.on('close', () => {
        this.isAriConnected = false;
        this.scheduleReconnect();
      });
    } catch (err: any) {
      this.isAriConnected = false;
      this.consecutiveFailures++;
      if (this.consecutiveFailures <= 1) {
        console.log(`[VoiceBridge] Could not initiate ARI WebSocket (${err.message}). Voice Bridge active in simulated/REST mode.`);
      }
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    // Back off reconnect timer from 30s up to 2 minutes when offline to avoid noise
    const backoffMs = Math.min(30000 * Math.pow(1.5, Math.min(this.consecutiveFailures, 4)), 120000);
    this.reconnectTimer = setTimeout(() => {
      this.connectAriWebSocket();
    }, backoffMs);
  }

  /**
   * Handles inbound events from Asterisk ARI (StasisStart, StasisEnd, ChannelHangupRequest).
   */
  private async handleAriEvent(event: any): Promise<void> {
    const eventType = event.type;
    const channel = event.channel;

    if (!channel || !channel.id) return;
    const channelId = channel.id;

    switch (eventType) {
      case 'StasisStart': {
        const callerNumber = channel.caller?.number || '+506 CallMyWay';
        const callerName = channel.caller?.name || 'Cliente VoIP CallMyWay';
        console.log(`[VoiceBridge] 📞 Inbound call received on Stasis app '${this.stasisApp}' | Channel: ${channelId} | From: ${callerNumber}`);

        // 1. Send Answer command to Asterisk via ARI REST API
        await this.answerAriChannel(channelId);

        // 2. Initialize Voice Session with Gemini Live API
        await this.initVoiceSession(channelId, callerNumber, callerName);
        break;
      }

      case 'ChannelHangupRequest':
      case 'StasisEnd': {
        console.log(`[VoiceBridge] 📴 Call hangup detected for channel ${channelId}`);
        await this.closeVoiceSession(channelId);
        break;
      }

      default:
        // Ignore unhandled Stasis/Channel events
        break;
    }
  }

  /**
   * Sends an HTTP POST request to Asterisk ARI REST API to answer an inbound channel.
   */
  private async answerAriChannel(channelId: string): Promise<boolean> {
    try {
      const url = `${this.ariHttpBase}/channels/${channelId}/answer?api_key=${this.apiKeyParam}`;
      const response = await fetch(url, { method: 'POST' });
      if (response.ok) {
        console.log(`[VoiceBridge] ✅ Successfully answered channel ${channelId}`);
        return true;
      } else {
        console.warn(`[VoiceBridge] Answer channel ${channelId} returned HTTP ${response.status}`);
        return false;
      }
    } catch (err: any) {
      console.warn(`[VoiceBridge] Could not send answer HTTP request for channel ${channelId}:`, err.message);
      return false;
    }
  }

  /**
   * Establishes a bidirectional voice streaming session with Gemini Live API for an active call.
   */
  public async initVoiceSession(channelId: string, callerNumber: string, callerName: string): Promise<ActiveVoiceSession> {
    const timeStr = new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' });
    
    const sessionRecord: ActiveVoiceSession = {
      channelId,
      callerNumber,
      callerName,
      startTime: new Date(),
      status: 'answered',
      transcript: [
        {
          speaker: 'Kira Voice',
          text: '¡Hola! Bienvenido a Wiazart by designsoftcr.com. ¿En qué le puedo colaborar con nuestros sistemas hoy?',
          timestamp: timeStr
        }
      ]
    };

    this.activeSessions.set(channelId, sessionRecord);
    this.totalCallsHandled++;

    try {
      // Connect to Gemini Live API using @google/genai
      const geminiLiveSession = await this.ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' } // Professional female voice
            }
          },
          systemInstruction: `Eres "Kira Voice", la ingeniera y asesora comercial hablada de Wiazart by designsoftcr.com (15 años en Costa Rica).
Hablas de forma fluida, sumamente educada y profesional en español costarricense usando el trato de "usted".
Manejas precios en Colones (₡) y Dólares ($). Respondes de forma directa, concisa y adecuada para llamadas de voz telefónicas.`
        },
        callbacks: {
          onmessage: (message: any) => {
            this.handleGeminiLiveMessage(channelId, message);
          },
          onerror: (err: any) => {
            console.error(`[VoiceBridge] Gemini Live API error on channel ${channelId}:`, err);
          },
          onclose: () => {
            console.log(`[VoiceBridge] Gemini Live session closed for channel ${channelId}`);
          }
        }
      });

      sessionRecord.geminiSession = geminiLiveSession;
      sessionRecord.status = 'active';
      console.log(`[VoiceBridge] ⚡ Gemini Live API session connected for Call Channel ${channelId}`);

    } catch (err: any) {
      console.warn(`[VoiceBridge] Gemini Live API connection fallback for channel ${channelId}:`, err.message);
      sessionRecord.status = 'active';
    }

    return sessionRecord;
  }

  /**
   * Processes incoming audio data from Asterisk RTP / AudioServer and forwards to Gemini Live API.
   */
  public processInboundAudio(channelId: string, pcmBufferBase64: string): void {
    const session = this.activeSessions.get(channelId);
    if (!session || !session.geminiSession) return;

    try {
      session.geminiSession.sendRealtimeInput({
        audio: {
          data: pcmBufferBase64,
          mimeType: 'audio/pcm;rate=16000'
        }
      });
    } catch (err: any) {
      console.error(`[VoiceBridge] Error sending realtime audio to Gemini on channel ${channelId}:`, err.message);
    }
  }

  /**
   * Handles incoming model responses and transcriptions from Gemini Live API.
   */
  private handleGeminiLiveMessage(channelId: string, message: any): void {
    const session = this.activeSessions.get(channelId);
    if (!session) return;

    // Check for audio output chunk
    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData) {
      // Stream audio chunk back to Asterisk via AudioBridge WebSocket / RTP
      if (session.audioBridgeWs && session.audioBridgeWs.readyState === WebSocket.OPEN) {
        session.audioBridgeWs.send(JSON.stringify({
          type: 'OUTBOUND_PCM_AUDIO',
          channelId,
          audioPcm24k: audioData
        }));
      }
    }

    // Capture text transcriptions if outputAudioTranscription is enabled
    const outputText = message.serverContent?.modelTurn?.parts?.[0]?.text;
    if (outputText) {
      const timeStr = new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' });
      session.transcript.push({
        speaker: 'Kira Voice',
        text: outputText,
        timestamp: timeStr
      });
    }
  }

  /**
   * Closes an active call session and cleans up resources.
   */
  public async closeVoiceSession(channelId: string): Promise<void> {
    const session = this.activeSessions.get(channelId);
    if (!session) return;

    session.status = 'ended';

    if (session.geminiSession) {
      try {
        if (typeof session.geminiSession.close === 'function') {
          await session.geminiSession.close();
        }
      } catch (err) {
        console.error(`[VoiceBridge] Error closing Gemini session for ${channelId}:`, err);
      }
    }

    if (session.audioBridgeWs) {
      try { session.audioBridgeWs.close(); } catch {}
    }

    this.activeSessions.delete(channelId);
    console.log(`[VoiceBridge] 🏁 Voice session ${channelId} closed cleanly.`);
  }

  /**
   * Attach client WebSocket for audio stream bridging (AudioServer / WebRTC / WebPhone).
   */
  public attachAudioBridgeWs(channelId: string, ws: WebSocket): void {
    const session = this.activeSessions.get(channelId);
    if (session) {
      session.audioBridgeWs = ws;
      console.log(`[VoiceBridge] AudioBridge WebSocket attached to channel ${channelId}`);
    }
  }

  /**
   * Returns current status and telemetry of the Voice Bridge service.
   */
  public getStatus(): VoiceBridgeStatus {
    const activeList = Array.from(this.activeSessions.values()).map(s => ({
      channelId: s.channelId,
      callerNumber: s.callerNumber,
      callerName: s.callerName,
      durationSeconds: Math.floor((Date.now() - s.startTime.getTime()) / 1000),
      status: s.status
    }));

    return {
      ariConnected: this.isAriConnected,
      ariUrl: this.ariUrl,
      stasisApp: this.stasisApp,
      activeCallsCount: this.activeSessions.size,
      totalCallsHandled: this.totalCallsHandled,
      activeSessions: activeList
    };
  }

  /**
   * Public helper to simulate an incoming ARI call (for testing without Asterisk hardware).
   */
  public async simulateAriCall(callerNumber = '+506 8765-4321', callerName = 'Soda El Buen Gusto'): Promise<ActiveVoiceSession> {
    const simChannelId = `call-ari-${Date.now()}`;
    return await this.initVoiceSession(simChannelId, callerNumber, callerName);
  }
}

export const voiceBridgeService = new VoiceBridgeService();
