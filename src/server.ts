import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { GoogleGenAI } from "@google/genai";

const PORT = Number(process.env.PORT ?? 3000);
const NODE_ENV = process.env.NODE_ENV ?? "development";
const APP_URL = process.env.APP_URL ?? "https://omnichannel.wiazart.com";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
const KIRA_VERSION = "1.0.0";

const startedAt = new Date();

const app = express();
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(NODE_ENV === "production" ? "tiny" : "dev"));

let genai: GoogleGenAI | null = null;
let genaiStatus: "ready" | "missing-key" | "error" = "missing-key";
let genaiLastError: string | null = null;
if (GEMINI_API_KEY && GEMINI_API_KEY !== "PLACEHOLDER_REEMPLAZAR_CON_TU_API_KEY") {
  try {
    genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    genaiStatus = "ready";
  } catch (err) {
    genaiStatus = "error";
    genaiLastError = err instanceof Error ? err.message : String(err);
  }
}

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "kira-core",
    version: KIRA_VERSION,
    uptimeSeconds: Math.floor((Date.now() - startedAt.getTime()) / 1000),
    nodeEnv: NODE_ENV,
    gemini: { status: genaiStatus, model: GEMINI_MODEL, lastError: genaiLastError },
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/info", (_req: Request, res: Response) => {
  res.status(200).json({
    name: "Kira Core",
    version: KIRA_VERSION,
    description: "Cerebro IA de DesignSoft Omnichannel AI",
    appUrl: APP_URL,
    endpoints: [
      { method: "GET", path: "/api/health", purpose: "Liveness + readiness probe" },
      { method: "GET", path: "/api/info", purpose: "Service metadata" },
      { method: "POST", path: "/api/chat", purpose: "Conversational endpoint (Gemini)" },
      { method: "GET", path: "/api/tools", purpose: "List registered Kira tools" },
    ],
    timestamp: new Date().toISOString(),
  });
});

type ChatMessage = { role: "user" | "model" | "system"; content: string };

const TOOL_REGISTRY: Record<string, { description: string; parameters: Record<string, string> }> = {
  crm_get_customer: {
    description: "Lookup a CRM customer by phone or customer_id.",
    parameters: { phone: "string E.164", customer_id: "string uuid" },
  },
  crm_update_profile: {
    description: "Update mutable fields on a CRM customer profile.",
    parameters: { customer_id: "string uuid", fields: "object" },
  },
  send_message: {
    description: "Send an outbound WhatsApp or SMS message to a customer.",
    parameters: { channel: "whatsapp|sms", to: "string E.164", body: "string" },
  },
  calendar_check: {
    description: "Check availability for reservations or appointments.",
    parameters: { date: "string ISO-8601", party_size: "integer" },
  },
};

app.get("/api/tools", (_req: Request, res: Response) => {
  res.status(200).json({ tools: TOOL_REGISTRY, count: Object.keys(TOOL_REGISTRY).length });
});

app.post("/api/chat", async (req: Request, res: Response) => {
  const body = (req.body ?? {}) as { messages?: ChatMessage[]; system?: string };
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return res.status(400).json({ error: "messages[] is required and must be non-empty" });
  }
  if (!genai || genaiStatus !== "ready") {
    return res.status(503).json({
      error: "gemini_unavailable",
      detail: genaiStatus === "missing-key"
        ? "GEMINI_API_KEY is not set. Set it in the Dokploy environment for this app."
        : genaiLastError ?? "Gemini client failed to initialize.",
    });
  }
  try {
    const system = body.system ?? "Eres Kira, el asistente IA omnicanal de DesignSoft. Responde en español, breve y amable.";
    const contents = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));
    const result = await genai.models.generateContent({
      model: GEMINI_MODEL,
      config: { systemInstruction: system },
      contents,
    });
    const text = result.text ?? "";
    return res.status(200).json({
      model: GEMINI_MODEL,
      reply: text,
      tokens: result.usageMetadata?.totalTokenCount ?? null,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return res.status(502).json({ error: "gemini_call_failed", detail });
  }
});

app.get("/", (_req: Request, res: Response) => {
  res.status(200).type("text/plain").send(
    [
      `Kira Core v${KIRA_VERSION}`,
      `Mode: ${NODE_ENV}`,
      `App URL: ${APP_URL}`,
      `Gemini: ${genaiStatus} (model: ${GEMINI_MODEL})`,
      "",
      "Endpoints:",
      "  GET  /api/health   - liveness probe",
      "  GET  /api/info     - service metadata",
      "  GET  /api/tools    - tool registry",
      "  POST /api/chat     - { messages: [...], system?: string }",
    ].join("\n")
  );
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "not_found", path: _req.path });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[kira-core] unhandled error:", err);
  res.status(500).json({ error: "internal_error", message: err.message });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[kira-core] v${KIRA_VERSION} listening on 0.0.0.0:${PORT} (env=${NODE_ENV})`);
  console.log(`[kira-core] gemini=${genaiStatus} model=${GEMINI_MODEL}`);
  if (genaiStatus === "missing-key") {
    console.warn("[kira-core] GEMINI_API_KEY is empty or placeholder; /api/chat will return 503 until configured.");
  }
});
