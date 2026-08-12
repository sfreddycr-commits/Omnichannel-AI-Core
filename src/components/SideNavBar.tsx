import React from 'react';
import { ViewMode, Language } from '../types';
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
  X
} from 'lucide-react';

interface SideNavBarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  currentView,
  onViewChange,
  language,
  onLanguageChange,
  isOpenMobile = false,
  onCloseMobile,
  onLogout
}) => {
  const navItems: { view: ViewMode; icon: React.ReactNode; labelKey: any }[] = [
    { view: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, labelKey: 'dashboard' },
    { view: 'chats', icon: <MessageSquare className="w-5 h-5" />, labelKey: 'chats' },
    { view: 'calls', icon: <PhoneCall className="w-5 h-5" />, labelKey: 'calls' },
    { view: 'agents', icon: <Bot className="w-5 h-5" />, labelKey: 'aiAgents' },
    { view: 'feed', icon: <Activity className="w-5 h-5" />, labelKey: 'liveFeed' },
    { view: 'settings', icon: <Settings className="w-5 h-5" />, labelKey: 'settings' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full py-5 px-4 bg-slate-950 border-r border-slate-800/80 shadow-2xl">
      {/* Brand Header */}
      <div className="px-2 pb-6 flex items-center justify-between border-b border-slate-800/60 mb-4">
        <div 
          onClick={() => onViewChange('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-slate-100 tracking-tight flex items-center gap-1">
              {getTranslation(language, 'brandName')}
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              {getTranslation(language, 'brandSub')}
            </p>
          </div>
        </div>
        {onCloseMobile && (
          <button 
            onClick={onCloseMobile} 
            className="md:hidden text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
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
                    ? 'text-white font-bold bg-indigo-600/20 border border-indigo-500/40 shadow-xs'
                    : 'text-slate-400 font-medium hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-indigo-400' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span>{getTranslation(language, item.labelKey)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Language Switcher Section */}
      <div className="px-2 py-3 border-t border-slate-800/80 my-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-1 font-mono">
          {language === 'en' ? 'Language / Idioma' : 'Idioma / Language'}
        </div>
        <LanguageToggle language={language} onLanguageChange={onLanguageChange} variant="pill" />
      </div>

      {/* Bottom Footer Section */}
      <div className="px-1 pt-3 border-t border-slate-800/80 space-y-1">
        <button
          onClick={() => {
            onViewChange('settings');
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-slate-400 font-medium hover:bg-slate-900 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span>{getTranslation(language, 'support')}</span>
        </button>

        <button
          onClick={() => {
            onViewChange('settings');
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-slate-400 font-medium hover:bg-slate-900 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Terminal className="w-4 h-4 text-slate-500" />
          <span>{getTranslation(language, 'logs')}</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-rose-400 font-medium hover:bg-rose-950/40 transition-colors mt-2 cursor-pointer border border-rose-900/30"
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
        <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-sm">
          <div className="w-[280px] h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
