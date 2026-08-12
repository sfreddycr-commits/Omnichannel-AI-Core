import React from 'react';
import { Language, SystemAlert } from '../types';
import { getTranslation } from '../translations';
import { Bell, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  alerts: SystemAlert[];
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  language,
  alerts
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-slate-200 relative overflow-hidden">
        {/* Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Bell className="w-5 h-5" />
            <h3 className="font-bold text-lg text-slate-900">
              {getTranslation(language, 'systemAlerts')}
            </h3>
            <span className="bg-slate-100 px-2 py-0.5 rounded-full text-xs font-semibold text-slate-600">
              {alerts.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {alerts.map((alert) => (
            <div 
              key={alert.id}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 items-start hover:border-slate-300 transition-all"
            >
              <div className="p-1.5 rounded-full mt-0.5 shrink-0" style={{
                backgroundColor: alert.type === 'warning' ? '#fef3c7' : alert.type === 'success' ? '#d1fae5' : '#e0e7ff',
                color: alert.type === 'warning' ? '#b45309' : alert.type === 'success' ? '#047857' : '#4338ca'
              }}>
                {alert.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                {alert.type === 'success' && <CheckCircle className="w-4 h-4" />}
                {alert.type === 'info' && <Info className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-900">{alert.title}</div>
                <div className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.description}</div>
                <div className="text-[11px] text-slate-400 mt-2 font-medium">{alert.timeAgo}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
