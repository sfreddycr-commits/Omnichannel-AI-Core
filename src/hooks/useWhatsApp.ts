import { useState, useEffect, useCallback, useRef } from 'react';

export interface WhatsAppState {
  connected: boolean;
  qrAvailable: boolean;
  qrData: string | null;
  loading: boolean;
  error: string | null;
  loggedOut: boolean;
}

const WS_URL = import.meta.env.VITE_WHATSAPP_WS_URL || 'wss://ws.qr.wiazart.com/?token=dsai-qr-secret-2026';

/**
 * Hook que mantiene una conexión WebSocket con el WhatsApp Worker
 * para obtener el QR y el estado de la sesión en tiempo real.
 */
export function useWhatsApp() {
  const [state, setState] = useState<WhatsAppState>({
    connected: false,
    qrAvailable: false,
    qrData: null,
    loading: false,
    error: null,
    loggedOut: false,
  });

  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('[whatsapp] WebSocket connected');
        // Pedir estado y QR al conectarse
        ws.send(JSON.stringify({ type: 'get_status' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[whatsapp] WS message:', data.type);

          switch (data.type) {
            case 'status':
              setState({
                connected: data.connected,
                qrAvailable: data.qr_available,
                qrData: data.qr_available ? state.qrData : null,
                loading: false,
                error: null,
                loggedOut: data.logged_out ?? false,
              });
              break;

            case 'qr':
              setState(prev => ({
                ...prev,
                qrAvailable: true,
                qrData: data.data,
                loading: false,
                error: null,
                connected: false,
              }));
              break;

            case 'error':
              setState(prev => ({ ...prev, loading: false, error: data.error }));
              break;

            default:
              break;
          }
        } catch (err) {
          console.error('[whatsapp] Failed to parse WS message', err);
        }
      };

      ws.onclose = () => {
        console.log('[whatsapp] WebSocket closed');
        wsRef.current = null;
        setState(prev => ({
          ...prev,
          loading: false,
          // Mantener estado, reintentar conexión en 5s
        }));
        // Reintentar conexión
        setTimeout(connect, 5000);
      };

      ws.onerror = (err) => {
        console.error('[whatsapp] WebSocket error', err);
        setState(prev => ({ ...prev, error: 'No se pudo conectar al servicio de WhatsApp' }));
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[whatsapp] Connection error', err);
      setState(prev => ({ ...prev, loading: false, error: 'No se pudo conectar al servicio de WhatsApp' }));
    }
  }, [state.qrData]);

  // Conectar al montar
  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  // Pedir QR explícitamente
  const getQR = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'get_qr' }));
    } else {
      // Reintentar conexión
      connect();
      setTimeout(() => wsRef.current?.send(JSON.stringify({ type: 'get_qr' })), 1000);
    }
  }, [connect]);

  // Reiniciar sesión
  const restart = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'restart' }));
    }
  }, []);

  // Cerrar sesión
  const logout = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'logout' }));
    }
  }, []);

  return { ...state, getQR, restart, logout, reconnect: connect };
}
