import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { KIRA_TOOL_DECLARATIONS, ToolRegistry } from "./ToolRegistry";

export interface KiraAgentProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  systemPrompt: string;
  temperature?: number;
}

export const KIRA_DEFAULT_PROFILES: Record<string, KiraAgentProfile> = {
  'kira-ventas': {
    id: 'kira-ventas',
    name: 'Kira Ventas & Asesoría Comercial',
    role: 'Especialista Comercial de DesignSoft Costa Rica',
    department: 'POS Restaurantes & ERP',
    systemPrompt: `Eres "Kira", la especialista virtual de ventas y consultoría comercial de DesignSoft Costa Rica (15 años de trayectoria). 
Trato sumamente cortés, ejecutivo y profesional usando el trato formal de "usted".
Manejas precios en Colones costarricenses (₡) y Dólares ($ USD). 
Utiliza prioritariamente la herramienta 'consultar_novedades_y_catalogo' cuando el cliente pregunte "¿Qué hay de nuevo?", pida el catálogo, consulte precios de POS Restaurantes, Facturación Electrónica Pyme o Sistema Médico, o solicite las últimas actualizaciones de software.`,
    temperature: 0.3
  },
  'kira-soporte': {
    id: 'kira-soporte',
    name: 'Kira Soporte Técnico & Hacienda',
    role: 'Ingeniera de Soporte y Facturación ATV',
    department: 'Soporte Técnico Nivel 2',
    systemPrompt: `Eres "Kira Soporte", la ingeniera virtual especializada en resolución de incidencias técnicas, llaves criptográficas y validación ATV de Hacienda Costa Rica v4.3.
Trato formal, eficiente y directo. Usa 'consultar_novedades_y_catalogo' para consultar versiones y características de productos, 'consultar_ticket_soporte' para ver el estado de tickets y 'transferir_a_humano' si el problema requiere un técnico presencial o Nivel 3.`,
    temperature: 0.2
  }
};

export interface KiraChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface KiraProcessResult {
  agentName: string;
  replyText: string;
  toolCallsExecuted: Array<{ name: string; args: any; result: any }>;
  isTransferred: boolean;
  transferDetails?: any;
}

export class KiraEngine {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }

  public async processMessage(
    userMessage: string,
    history: KiraChatMessage[] = [],
    profileId: string = 'kira-ventas'
  ): Promise<KiraProcessResult> {
    const profile = KIRA_DEFAULT_PROFILES[profileId] || KIRA_DEFAULT_PROFILES['kira-ventas'];

    const contents: any[] = history.map(h => ({
      role: h.role === 'system' ? 'user' : h.role,
      parts: [{ text: h.content }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    try {
      // 1. First Turn to Gemini model with tool declarations
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: contents,
        config: {
          systemInstruction: profile.systemPrompt,
          temperature: profile.temperature ?? 0.3,
          tools: [{
            functionDeclarations: KIRA_TOOL_DECLARATIONS
          }]
        }
      });

      const toolCallsExecuted: Array<{ name: string; args: any; result: any }> = [];
      let isTransferred = false;
      let transferDetails: any = null;

      const functionCalls = response.functionCalls;

      // 2. Execute Tool Calls via ToolRegistry if requested
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          const result = await ToolRegistry.executeTool(call.name, call.args);
          
          if (call.name === 'transferir_a_humano') {
            isTransferred = true;
            transferDetails = result;
          }

          toolCallsExecuted.push({
            name: call.name,
            args: call.args,
            result: result
          });
        }

        // 3. Second Turn to synthesize final user response
        const modelTurnContent = response.candidates?.[0]?.content;
        const secondTurnContents = [
          ...contents,
          modelTurnContent,
          {
            role: 'user',
            parts: toolCallsExecuted.map(tc => ({
              functionResponse: {
                name: tc.name,
                response: { result: tc.result }
              }
            }))
          }
        ];

        const secondResponse: GenerateContentResponse = await this.ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: secondTurnContents,
          config: {
            systemInstruction: profile.systemPrompt
          }
        });

        return {
          agentName: profile.name,
          replyText: secondResponse.text || "Consulta procesada correctamente con los servicios de DesignSoft.",
          toolCallsExecuted,
          isTransferred,
          transferDetails
        };
      }

      return {
        agentName: profile.name,
        replyText: response.text || "Hola, soy Kira de DesignSoft Costa Rica. ¿En qué le puedo asistir el día de hoy?",
        toolCallsExecuted: [],
        isTransferred: false
      };

    } catch (error) {
      console.error("KiraEngine Processing Error:", error);
      return {
        agentName: profile.name,
        replyText: "En este momento estoy sincronizando con la base de datos de DesignSoft. Por favor reintente en unos segundos.",
        toolCallsExecuted: [],
        isTransferred: false
      };
    }
  }
}

export const kiraEngineInstance = new KiraEngine();
