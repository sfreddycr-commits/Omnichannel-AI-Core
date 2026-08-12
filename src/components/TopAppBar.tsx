import React, { useState } from 'react';
import { ViewMode, Language, ThemeMode, SystemAlert } from '../types';
import { getTranslation } from '../translations';
import { LanguageToggle } from './LanguageToggle';
import { NotificationModal } from './NotificationModal';
import { 
  Menu, 
  Search, 
  Bell, 
  Server, 
  User, 
  Wifi,
  Sun,
  Moon
} from 'lucide-react';

interface TopAppBarProps {
  currentView: ViewMode;
  language: Language;
  theme: ThemeMode;
  onLanguageChange: (lang: Language) => void;
  onToggleTheme: () => void;
  onToggleMobileMenu: () => void;
  alerts: SystemAlert[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentView,
  language,
  theme,
  onLanguageChange,
  onToggleTheme,
  onToggleMobileMenu,
  alerts,
  searchQuery,
  onSearchChange
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const isLight = theme === 'light';

  return (
    <>
      <header className={`fixed top-0 right-0 w-full md:w-[calc(100%-280px)] h-16 backdrop-blur-md border-b flex justify-between items-center px-4 md:px-8 z-30 transition-colors duration-200 ${
        isLight
          ? 'bg-white/90 border-slate-200 text-slate-800 shadow-xs'
          : 'bg-slate-950/90 border-slate-800/80 text-slate-100 shadow-xl'
      }`}>
        {/* Left Side: Mobile Menu Button & Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className={`md:hidden p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
            }`}
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className={`font-extrabold text-base hidden sm:block tracking-tight font-mono ${
            isLight ? 'text-slate-900' : 'text-slate-100'
          }`}>
            {getTranslation(language, 'terminalTitle')}
          </div>

          {/* Search Bar */}
          <div className="relative flex items-center ml-2">
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={getTranslation(language, 'searchPlaceholder')}
              className={`rounded-full py-1.5 pl-9 pr-4 text-xs font-medium border w-36 sm:w-56 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500'
                  : 'bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500 focus:bg-slate-950 focus:border-indigo-500'
              }`}
            />
          </div>
        </div>

        {/* Right Side: Status Metrics, Notifications, Theme Toggle & Language */}
        <div className="flex items-center gap-3 md:gap-5 text-xs">
          {/* Status Indicators */}
          <div className="hidden lg:flex items-center gap-4">
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border font-semibold text-[11px] ${
              isLight 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{getTranslation(language, 'status')}</span>
            </div>
            <span className={`font-mono text-[11px] flex items-center gap-1 ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <Wifi className="w-3.5 h-3.5 text-blue-600" />
              <span>API Live</span>
            </span>
            <span className="text-blue-600 font-semibold font-mono text-[11px]">
              {getTranslation(language, 'users15k')}
            </span>
          </div>

          {/* Action Icons */}
          <div className={`flex items-center gap-2 border-l pl-3 ${
            isLight ? 'border-slate-200' : 'border-slate-800/80'
          }`}>
            {/* Theme Toggle Switch */}
            <button
              onClick={onToggleTheme}
              className={`px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 shadow-2xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
              title={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
              {isLight ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="hidden sm:inline text-[11px]">Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-400 fill-blue-400" />
                  <span className="hidden sm:inline text-[11px]">Oscuro</span>
                </>
              )}
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setShowNotifications(true)}
              className={`p-2 rounded-full transition-colors relative cursor-pointer ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              }`}
              title="Alertas del Sistema"
            >
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {/* Server Status Icon */}
            <button
              className={`p-2 rounded-full transition-colors hidden sm:block cursor-pointer ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              }`}
              title="Nodos API"
            >
              <Server className="w-4 h-4" />
            </button>

            {/* Profile Avatar Icon */}
            <button
              className={`p-2 rounded-full border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:text-slate-100 hover:bg-slate-800'
              }`}
              title="Perfil de Usuario"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Compact Language Toggle for TopBar */}
            <div className="ml-1">
              <LanguageToggle
                language={language}
                onLanguageChange={onLanguageChange}
                variant="compact"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        language={language}
        alerts={alerts}
      />
    </>
  );
};
