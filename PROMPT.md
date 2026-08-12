# Omnichannel AI Core - Dashboard Platform

## Overview
Omnichannel AI Core is a real-time multi-agent management dashboard designed for AI agents, WhatsApp live chats, and voice call telemetry.

## Key Features
- **WhatsApp Live Chats**: Real-time multi-agent conversation feed synced with REST API & WebSockets (`https://api.omnichannel.wiazart.com` and `wss://omnichannel.wiazart.com/ws`).
- **Voice Calls Monitor**: Live call status tracking, AI agent assignment, and speech-to-text transcriptions.
- **AI Agents Management**: Live API sync for agent status, workload management, system prompt editing, and knowledge base document uploads.
- **Real-Time Feed**: Live session monitoring with intent detection, confidence scoring, and escalation policies.
- **Multilingual Support**: English & Spanish UI toggles across all views.

## Deployment & Docker Instructions
1. **Dockerfile**: Uses a multi-stage Docker build (`node:20-alpine` -> `nginx:alpine`) listening on ports 3000 and 80 with SPA history fallback.
2. **Environment Variables**:
   - `VITE_API_URL`: REST API base URL (default: `https://api.omnichannel.wiazart.com`)
   - `VITE_WS_URL`: WebSocket endpoint (default: `wss://omnichannel.wiazart.com/ws`)
