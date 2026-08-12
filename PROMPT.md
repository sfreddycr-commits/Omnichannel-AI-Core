# GOOGLE STUDIO AI — PROMPT PARA EL PRÓXIMO COMMIT

## REGLAS OBLIGATORIAS

1. **NO BORRES el archivo `Dockerfile`** que ya existe en la raíz del proyecto.
   Es un Dockerfile multi-stage que construye la app React con Vite y la sirve con Nginx.
   Si necesitas modificar algo del build (ej: agregar dependencias), edítalo, pero NUNCA lo elimines.

2. **NO BORRES `.env.example`**. Contiene las variables de entorno necesarias:
   - GEMINI_API_KEY
   - APP_URL

3. **El comando de build es `npm run build`**, la salida va a la carpeta `dist/`.
   Si agregas nuevas dependencias, asegúrate de que estén en `package.json`.

4. **El proyecto se despliega en Dokploy** en el dominio `designsoft.wiazart.com`.
   Cualquier cambio en rutas o assets debe funcionar con el Dockerfile existente.

## LO QUE TIENE EL PROYECTO AHORA

- Dashboard React + Vite + TypeScript + Tailwind CSS
- Vistas: Dashboard, Agents, LiveFeed, Settings, Login
- Componentes: SideNavBar, TopAppBar, LanguageToggle, NotificationModal
- Usa @google/genai para llamadas a Gemini
- La UI es un panel de monitoreo de agentes IA

## LO QUE NECESITA EL PROYECTO (próximos pasos)

1. **Conexión real con backend**: Actualmente usa datos mock. Necesita conectarse
   a una API real (WebSocket para tiempo real, REST para operaciones CRUD).

2. **Panel de WhatsApp**: Vista para ver conversaciones de WhatsApp en tiempo real,
   responder mensajes, ver historial por cliente.

3. **Panel de llamadas**: Vista para ver llamadas activas (voz), transcripciones
   en vivo, estado del agente IA en la llamada.

4. **Gestión de agentes IA**: Poder crear, editar, activar/desactivar agentes por
   departamento (Soporte, Ventas, Cobros). Cada uno con su prompt del sistema.

5. **Métricas y analytics**: Dashboard con gráficos de llamadas atendidas,
   chats resueltos, tiempo promedio de respuesta, satisfacción del cliente.

## ARQUITECTURA COMPLETA (para que entiendas el contexto)

```
         WhatsApp (Meta API / Baileys) ──┐
         Llamadas (CallMyWay + Asterisk) ──┼──→ CORE BRAIN (orquestador)
         Softphone WebRTC ────────────────┘         │
                                                    ├──→ Agentes IA (por depto)
                                                    ├──→ CRM (SQLite)
                                                    └──→ Dashboard (este proyecto)
```

Este dashboard es la cara visible. Los otros componentes (core, whatsapp, voice,
agents, crm) son servicios backend separados que se construyen aparte.
