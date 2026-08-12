import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Language } from '../types';
import { useWhatsApp } from '../hooks/useWhatsApp';

interface ChannelsViewProps {
  language: Language;
}

export const ChannelsView: React.FC<ChannelsViewProps> = ({ language }) => {
  const t = language === 'es';
  const {
    connected,
    qrAvailable,
    qrData,
    loading,
    error,
    loggedOut,
    getQR,
  } = useWhatsApp();

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);

  // Generar URL del QR si hay data
  useEffect(() => {
    if (qrData) {
      setQrToken(qrData);
    }
  }, [qrData]);

  const handleVincular = () => {
    setShowQRModal(true);
    getQR();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">
          {t ? 'Canales de Atención' : 'Attention Channels'}
        </h2>
        <p className="mt-1 text-sm opacity-60">
          {t
            ? 'Conecta los canales por donde tus clientes te contactan.'
            : 'Connect the channels where your customers reach you.'}
        </p>
      </header>

      {/* WhatsApp Channel Card */}
      <div className={`rounded-2xl p-6 border shadow-sm transition-colors ${
        connected
          ? 'border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800'
          : 'border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800'
      }`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* WhatsApp icon */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              connected ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
            }`}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                WhatsApp
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  connected
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {connected ? (t ? '🟢 Conectado' : '🟢 Connected') : (t ? '🔴 Desconectado' : '🔴 Disconnected')}
                </span>
              </h3>
              <p className="text-sm opacity-60 mt-0.5">
                {connected
                  ? t ? 'Recibiendo y respondiendo mensajes automáticamente.' : 'Receiving and replying to messages automatically.'
                  : t ? 'Escanea el QR para vincular tu cuenta de WhatsApp.' : 'Scan the QR to link your WhatsApp account.'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {!connected && (
              <button
                onClick={handleVincular}
                disabled={loading}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                  connected
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {loading ? (t ? 'Conectando...' : 'Connecting...') : (t ? '🔗 Vincular WhatsApp' : '🔗 Link WhatsApp')}
              </button>
            )}
            {connected && (
              <button
                onClick={() => setShowQRModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                {t ? 'Estado OK' : 'Status OK'}
              </button>
            )}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Logged out notice */}
        {loggedOut && !connected && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300">
            {t
              ? 'La sesión fue cerrada. Escanea el QR nuevamente para reconectar.'
              : 'Session closed. Scan the QR again to reconnect.'}
          </div>
        )}
      </div>

      {/* Additional channels placeholder */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl p-5 border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <h4 className="font-semibold flex items-center gap-2">
            ☎️ {t ? 'Llamadas (CallMyWay)' : 'Calls (CallMyWay)'}
          </h4>
          <p className="text-sm opacity-60 mt-1">
            {t ? 'Pendiente de configuración.' : 'Pending configuration.'}
          </p>
          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {t ? 'Próximamente' : 'Coming soon'}
          </span>
        </div>

        <div className="rounded-2xl p-5 border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <h4 className="font-semibold flex items-center gap-2">
            💻 {t ? 'Softphone Web' : 'Web Softphone'}
          </h4>
          <p className="text-sm opacity-60 mt-1">
            {t ? 'Pruebas de audio desde el navegador.' : 'Audio tests from the browser.'}
          </p>
          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {t ? 'Próximamente' : 'Coming soon'}
          </span>
        </div>
      </div>

      {/* QR Modal */}
      {showQRModal && !connected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowQRModal(false)}>
          <div
            className={`rounded-2xl p-6 w-full max-w-sm shadow-2xl ${'bg-white dark:bg-slate-900'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-center mb-1">
              {t ? 'Vincular WhatsApp' : 'Link WhatsApp'}
            </h3>
            <p className="text-center text-sm opacity-60 mb-4">
              {t
                ? 'Abre WhatsApp en tu celular → Ajustes → Dispositivos vinculados → Vincular un dispositivo → Escanea el QR.'
                : 'Open WhatsApp on your phone → Settings → Linked devices → Link a device → Scan the QR.'}
            </p>

            {qrToken ? (
              <div className="flex justify-center">
                <QRCodeSVG
                  value={qrToken}
                  size={256}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
            ) : loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="text-center py-8 text-sm opacity-60">
                {t ? 'Esperando QR...' : 'Waiting for QR...'}
              </div>
            )}

            <p className="text-center text-xs opacity-50 mt-3">
              {t ? 'El QR se actualiza automáticamente.' : 'QR auto-refreshes.'}
            </p>

            <button
              onClick={() => setShowQRModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              {t ? 'Cerrar' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
