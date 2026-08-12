import React from 'react';
import { ViewMode, Language, ThemeMode } from '../types';
import { getTranslation } from '../translations';
import { LanguageToggle } from './LanguageToggle';
import { 
  Cpu, 
  LayoutDashboard, 
  Bot, 
  MessageSquare, 
  PhoneCall,
  Activity, 
  Settings, 
  HelpCircle, 
  Terminal,
  LogOut,
  X,
  Sun,
  Moon
} from 'lucide-react';

interface SideNavBarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  currentView,
  onViewChange,
  language,
  onLanguageChange,
  theme = 'light',
  onToggleTheme,
  isOpenMobile = false,
  onCloseMobile,
  onLogout
}) => {
  const isLight = theme === 'light';

  const navItems: { view: ViewMode; icon: React.ReactNode; labelKey: any }[] = [
    { view: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, labelKey: 'dashboard' },
    { view: 'chats', icon: <MessageSquare className="w-5 h-5" />, labelKey: 'chats' },
    { view: 'calls', icon: <PhoneCall className="w-5 h-5" />, labelKey: 'calls' },
    { view: 'agents', icon: <Bot className="w-5 h-5" />, labelKey: 'aiAgents' },
    { view: 'feed', icon: <Activity className="w-5 h-5" />, labelKey: 'liveFeed' },
    { view: 'settings', icon: <Settings className="w-5 h-5" />, labelKey: 'settings' },
  ];

  const sidebarContent = (
    <div className={`flex flex-col h-full py-5 px-4 border-r transition-colors duration-200 ${
      isLight
        ? 'bg-white border-slate-200 shadow-md text-slate-800'
        : 'bg-slate-950 border-slate-800/80 shadow-2xl text-slate-100'
    }`}>
      {/* Brand Header */}
      <div className={`px-2 pb-6 flex items-center justify-between border-b mb-4 ${
        isLight ? 'border-slate-200' : 'border-slate-800/60'
      }`}>
        <div 
          onClick={() => onViewChange('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border group-hover:scale-105 transition-transform ${
            isLight
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
          }`}>
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className={`font-extrabold text-base tracking-tight flex items-center gap-1 ${
              isLight ? 'text-slate-900' : 'text-slate-100'
            }`}>
              {getTranslation(language, 'brandName')}
            </h1>
            <p className={`text-[11px] font-mono ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {getTranslation(language, 'brandSub')}
            </p>
          </div>
        </div>
        {onCloseMobile && (
          <button 
            onClick={onCloseMobile} 
            className={`md:hidden p-1 rounded-lg ${
              isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <ul className="flex-1 space-y-1.5 px-1">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <li key={item.view}>
              <button
                onClick={() => {
                  onViewChange(item.view);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 cursor-pointer ${
                  isActive
                    ? isLight
                      ? 'text-blue-700 font-bold bg-blue-50 border border-blue-200 shadow-2xs'
                      : 'text-white font-bold bg-indigo-600/20 border border-indigo-500/40 shadow-xs'
                    : isLight
                      ? 'text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                      : 'text-slate-400 font-medium hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <span className={isActive ? (isLight ? 'text-blue-600' : 'text-indigo-400') : (isLight ? 'text-slate-400' : 'text-slate-500')}>
                  {item.icon}
                </span>
                <span>{getTranslation(language, item.labelKey)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Theme Switcher in Sidebar (if provided) */}
      {onToggleTheme && (
        <div className={`px-2 py-3 border-t my-2 ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 px-1 font-mono ${
            isLight ? 'text-slate-500' : 'text-slate-500'
          }`}>
            {language === 'en' ? 'Theme / Tema' : 'Tema / Theme'}
          </div>
          <button
            onClick={onToggleTheme}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              {isLight ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-400 fill-blue-400" />
                  <span>Modo Oscuro</span>
                </>
              )}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {isLight ? 'Light' : 'Dark'}
            </span>
          </button>
        </div>
      )}

      {/* Language Switcher Section */}
      <div className={`px-2 py-3 border-t my-2 ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
        <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 px-1 font-mono ${
          isLight ? 'text-slate-500' : 'text-slate-500'
        }`}>
          {language === 'en' ? 'Language / Idioma' : 'Idioma / Language'}
        </div>
        <LanguageToggle language={language} onLanguageChange={onLanguageChange} variant="pill" />
      </div>

      {/* Bottom Footer Section */}
      <div className={`px-1 pt-3 border-t space-y-1 ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
        <button
          onClick={() => {
            onViewChange('settings');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            isLight
              ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>{getTranslation(language, 'support')}</span>
        </button>

        <button
          onClick={() => {
            onViewChange('settings');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            isLight
              ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4 text-slate-400" />
          <span>{getTranslation(language, 'logs')}</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-rose-500 font-medium transition-colors mt-2 cursor-pointer border ${
              isLight
                ? 'bg-rose-50 hover:bg-rose-100 border-rose-200'
                : 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-900/30'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>{language === 'en' ? 'Log Out' : 'Cerrar Sesión'}</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="w-[280px] h-screen fixed left-0 top-0 z-40 hidden md:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-xs">
          <div className="w-[280px] h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
