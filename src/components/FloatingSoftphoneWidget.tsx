import React from 'react';
import { Headphones } from 'lucide-react';

interface FloatingSoftphoneWidgetProps {
  onClick: () => void;
  isOpen?: boolean;
  activeCallCount?: number;
}

export const FloatingSoftphoneWidget: React.FC<FloatingSoftphoneWidgetProps> = ({
  onClick,
  isOpen = false,
  activeCallCount = 0
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end group">
      {/* Tooltip badge */}
      <div className="mb-2 mr-1 px-3 py-1.5 rounded-xl bg-slate-900/95 text-slate-100 text-xs font-semibold shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-center space-x-2 opacity-95 group-hover:opacity-100 transition-all transform group-hover:-translate-y-0.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-medium text-[11px] tracking-tight text-white">Kira Live Voice</span>
        <span className="bg-sky-950 text-sky-400 border border-sky-800 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold">
          CallCenter
        </span>
      </div>

      {/* Main Floating Callcenter Trigger Button (Bottom-Right Circle) */}
      <button
        onClick={onClick}
        aria-label="Abrir Softphone de Voz Kira"
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-sky-600 via-indigo-600 to-indigo-700 hover:from-sky-500 hover:to-indigo-600 text-white shadow-2xl shadow-sky-500/50 border border-sky-300/40 flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
      >
        {/* Glow Ring Effect */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 opacity-40 blur group-hover:opacity-75 transition duration-300 animate-pulse"></span>

        {/* Call Center Headset Icon */}
        <div className="relative z-10 flex items-center justify-center">
          <Headphones className="w-7 h-7 text-white drop-shadow-md group-hover:rotate-12 transition-transform duration-300" />
        </div>

        {/* Online Status Indicator */}
        <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center z-20">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        </div>

        {/* Active Call Badge if any */}
        {activeCallCount > 0 && (
          <span className="absolute -top-1 -left-1 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-slate-900 z-20">
            {activeCallCount}
          </span>
        )}
      </button>
    </div>
  );
};
