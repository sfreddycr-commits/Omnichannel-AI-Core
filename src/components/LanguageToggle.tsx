import React from 'react';
import { Language } from '../types';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  variant?: 'pill' | 'button' | 'compact';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  language,
  onLanguageChange,
  variant = 'pill'
}) => {
  const toggleLanguage = () => {
    onLanguageChange(language === 'en' ? 'es' : 'en');
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-indigo-600 hover:bg-slate-200 transition-all cursor-pointer shadow-xs"
        title="Toggle Language / Cambiar Idioma"
      >
        <Globe className="w-3.5 h-3.5 text-indigo-600" />
        <span className="font-bold uppercase">{language}</span>
      </button>
    );
  }

  return (
    <div className="flex bg-slate-100 rounded-full p-1 border border-slate-200 shadow-xs">
      <button
        onClick={() => onLanguageChange('en')}
        className={`px-3 py-1 text-xs uppercase transition-all duration-200 rounded-full cursor-pointer font-bold ${
          language === 'en'
            ? 'bg-white shadow-xs text-indigo-600'
            : 'text-slate-400 hover:text-slate-600 font-medium'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onLanguageChange('es')}
        className={`px-3 py-1 text-xs uppercase transition-all duration-200 rounded-full cursor-pointer font-bold ${
          language === 'es'
            ? 'bg-white shadow-xs text-indigo-600'
            : 'text-slate-400 hover:text-slate-600 font-medium'
        }`}
      >
        ES
      </button>
    </div>
  );
};
