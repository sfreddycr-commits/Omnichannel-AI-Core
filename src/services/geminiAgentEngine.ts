import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { 
  ALL_DESIGNSOFT_TOOLS, 
  executeConsultarCatalogo, 
  executeCrearCotizacion, 
  executeConsultarTicket, 
  executeEscalarAHumano 
} from "./designsoftCrmService";

// Helper to instantiate Gemini GoogleGenAI client with required user agent header
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is not defined. Using default environment key if injected.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

const DESIGNSOFT_SYSTEM_PROMPT = `
# SYSTEM INSTRUCTIONS: "MARLO / KIRA" — AGENTE OMNICANAL DE WIAZART BY DESIGNSOFTCR.COM

## ROL E IDENTIDAD
Eres "Marlo / Kira", especialista virtual de ventas, soporte técnico y consultoría comercial de Wiazart by designsoftcr.com, una solución costarricense líder con 15 años de trayectoria en desarrollo de software empresarial.
Tu trato es sumamente educado, profesional, ejecutivo y adaptado al mercado costarricense (usas el trato formal de "usted", comprendes el contexto local y manejas precios en Colones costarricenses ₡ y Dólares $).
Presentación oficial: "¡Hola! Soy Kira/Marlo, la especialista virtual de Wiazart by designsoftcr.com..."

## BASE DE CONOCIMIENTO: POS RESTAURANTES DESIGNSOFT
Posees dominio técnico completo del sistema POS para Restaurantes, Bares y Cafeterías de Wiazart by designsoftcr.com:
1. Módulos Claves:
   - Control de mesas y comandas digitales para cocina/barra.
   - Gestión de inventarios de insumos, recetas y mermas.
   - Facturación Electrónica integrada con la plataforma ATV de Hacienda Costa Rica (v4.3).
   - Reportes de ventas, arqueos y cierre de caja (Cierre Z).
2. Compatibilidad de Hardware:
   - Funciona en miniprinters térmicas, comanderas móviles, pantallas táctiles, tabletas para meseros y computadoras Windows.

## HERRAMIENTAS (FUNCTION CALLING)
- 'consultarCatalogoPOS': Utilízala para consultar precios y detalles de módulos del catálogo.
- 'crearCotizacionCRM': Utilízala para registrar cotizaciones para clientes en el CRM.
- 'consultarTicketSoporte': Utilízala para consultar el estado de tickets de soporte.
- 'escalarAHumano': Utilízala si la consulta requiere atención personalizada o el cliente pide hablar con un ejecutivo.

## DIRECTRICES DE RESPUESTA
- Canales: Atiendes consultas tanto de texto (WhatsApp) como de voz telefónica. Sé claro, dinámico y conciso (<3 oraciones por intervención en llamadas de voz para mantener fluidez conversacional).
- Formato de precios: Indica los montos claramente especificando la moneda (ejemplo: ₡25,000 IVI o $50 USD).
- Llamada a la acción: Al finalizar la consulta, ofrece agendar una demostración en vivo del POS Restaurantes o conectar con un asesor humano.
`;

export interface AgentChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface ProcessAgentResponse {
  replyText: string;
  toolCallsExecuted?: Array<{ name: string; args: any; result: any }>;
  isEscalated?: boolean;
  escalationDetails?: any;
}

export async function processAgentMessage(
  userMessage: string,
  history: AgentChatMessage[] = []
): Promise<ProcessAgentResponse> {
  const ai = getGeminiClient();

  // Convert conversation history into contents array for Gemini
  const contents: any[] = history.map(h => ({
    role: h.role === 'system' ? 'user' : h.role,
    parts: [{ text: h.content }]
  }));

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  try {
    // 1. Initial Call with Function Declarations
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contents,
      config: {
        systemInstruction: DESIGNSOFT_SYSTEM_PROMPT,
        temperature: 0.3,
        tools: [{
          functionDeclarations: ALL_DESIGNSOFT_TOOLS
        }]
      }
    });

    const toolCallsExecuted: Array<{ name: string; args: any; result: any }> = [];
    let isEscalated = false;
    let escalationDetails: any = null;

    // 2. Check for Function Calling execution
    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      for (const call of functionCalls) {
        let executionResult: any = null;

        if (call.name === "consultarCatalogoPOS") {
          executionResult = executeConsultarCatalogo(call.args as any);
        } else if (call.name === "crearCotizacionCRM") {
          executionResult = executeCrearCotizacion(call.args as any);
        } else if (call.name === "consultarTicketSoporte") {
          executionResult = executeConsultarTicket(call.args as any);
        } else if (call.name === "escalarAHumano") {
          executionResult = executeEscalarAHumano(call.args as any);
          isEscalated = true;
          escalationDetails = executionResult;
        }

        toolCallsExecuted.push({
          name: call.name,
          args: call.args,
          result: executionResult
        });
      }

      // 3. Perform second call with function execution results to get final user-friendly response
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

      const secondResponse: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: secondTurnContents,
        config: {
          systemInstruction: DESIGNSOFT_SYSTEM_PROMPT
        }
      });

      return {
        replyText: secondResponse.text || "Operación procesada correctamente con los sistemas de DesignSoft.",
        toolCallsExecuted,
        isEscalated,
        escalationDetails
      };
    }

    return {
      replyText: response.text || "Hola, en DesignSoft estamos para servirle. ¿En qué módulo le podemos colaborar hoy?",
      toolCallsExecuted,
      isEscalated: false
    };

  } catch (error) {
    console.error("Error in Gemini Agent Engine:", error);
    return {
      replyText: "Disculpe, en este momento estoy sincronizando los datos con el servidor de DesignSoft. Por favor reintente en unos segundos.",
      toolCallsExecuted: []
    };
  }
}
