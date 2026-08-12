# Kira Core v1.0

Backend principal (cerebro IA) de **DesignSoft Omnichannel AI**.

- Stack: Node.js 20 + TypeScript + Express + `@google/genai`
- Endpoints: `/api/health`, `/api/info`, `/api/tools`, `/api/chat`
- Despliegue: Dokploy (rama `kira-core` del repo `sfreddycr-commits/Omnichannel-AI-Core`)
- Dominio: <https://omnichannel.wiazart.com>

## Variables de entorno

| Nombre | Requerido | Default | Descripción |
|---|---|---|---|
| `PORT` | no | `3000` | Puerto HTTP interno |
| `NODE_ENV` | no | `production` | Modo de runtime |
| `APP_URL` | no | `https://omnichannel.wiazart.com` | URL pública del servicio |
| `GEMINI_API_KEY` | sí* | `""` | API key de Google Gemini. *Sin ella, `/api/chat` devuelve 503; el resto funciona. |
| `GEMINI_MODEL` | no | `gemini-2.0-flash` | Modelo de Gemini a invocar |

## Build local

```bash
npm install
npm run build
PORT=3000 GEMINI_API_KEY=tu_key npm start
```

## Health

```bash
curl https://omnichannel.wiazart.com/api/health
# {"status":"ok","service":"kira-core","version":"1.0.0",...}
```

## Tool Registry (Kira v1.0)

| Tool | Descripción |
|---|---|
| `crm_get_customer` | Lookup de cliente por phone o customer_id |
| `crm_update_profile` | Update mutable fields en perfil CRM |
| `send_message` | Outbound WhatsApp / SMS |
| `calendar_check` | Disponibilidad para reservas |
