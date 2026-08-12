import { CallItem, ChatItem } from '../types';

/**
 * Utility to safely escape CSV cell content.
 */
function escapeCSVCell(cell: string | number | boolean | null | undefined): string {
  if (cell === null || cell === undefined) return '""';
  const stringValue = String(cell);
  // Double up any quotes and wrap in quotes
  return `"${stringValue.replace(/"/g, '""')}"`;
}

/**
 * Triggers a browser download of a CSV file with UTF-8 BOM for proper Excel encoding.
 */
export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports Call logs telemetry data to CSV.
 */
export function exportCallsToCSV(calls: CallItem[], filename = 'designsoft_calls_report.csv') {
  const headers = [
    'ID',
    'Número Telefónico',
    'Nombre del Cliente',
    'Estado',
    'Agente Asignado',
    'Departamento',
    'Duración (seg)',
    'Fecha de Inicio',
    'Sentimiento',
    'Total Interacciones',
    'Transcripción Resumida'
  ];

  const rows = calls.map(call => {
    const transcriptText = (call.transcript || [])
      .map(t => `[${t.timestamp}] ${t.speaker.toUpperCase()}: ${t.text}`)
      .join(' | ');

    return [
      escapeCSVCell(call.id),
      escapeCSVCell(call.callerNumber),
      escapeCSVCell(call.callerName || 'N/A'),
      escapeCSVCell(call.status === 'en_vivo' ? 'En Vivo' : 'Finalizada'),
      escapeCSVCell(call.assignedAgent),
      escapeCSVCell(call.department),
      escapeCSVCell(call.durationSeconds),
      escapeCSVCell(call.startedAt),
      escapeCSVCell(call.sentiment || 'neutral'),
      escapeCSVCell(call.transcript ? call.transcript.length : 0),
      escapeCSVCell(transcriptText)
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadCSV(filename, csvContent);
}

/**
 * Exports WhatsApp Chat logs data to CSV.
 */
export function exportChatsToCSV(chats: ChatItem[], filename = 'designsoft_chats_report.csv') {
  const headers = [
    'ID Chat',
    'Nombre del Cliente',
    'Teléfono',
    'Departamento',
    'Gestionado por IA',
    'Última Actividad',
    'Mensajes No Leídos',
    'Total Mensajes',
    'Último Mensaje',
    'Historial de Conversación'
  ];

  const rows = chats.map(chat => {
    const historyText = (chat.messages || [])
      .map(m => `[${m.timestamp}] ${m.sender.toUpperCase()}: ${m.text}`)
      .join(' | ');

    return [
      escapeCSVCell(chat.id),
      escapeCSVCell(chat.clientName),
      escapeCSVCell(chat.phoneNumber),
      escapeCSVCell(chat.department),
      escapeCSVCell(chat.isAiManaged ? 'Sí (IA Kira/Marlo)' : 'No (Agente Humano)'),
      escapeCSVCell(chat.timestamp),
      escapeCSVCell(chat.unreadCount),
      escapeCSVCell(chat.messages ? chat.messages.length : 0),
      escapeCSVCell(chat.lastMessage),
      escapeCSVCell(historyText)
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadCSV(filename, csvContent);
}
