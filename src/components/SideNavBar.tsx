import React from 'react';
import { ViewMode, Language } from '../types';
import { getTranslation } from '../translations';
import { LanguageToggle } from './LanguageToggle';
import { 
  Cpu, 
  LayoutDashboard, 
  Bot, 
  MessageSquare, 
  Share2, 
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
    { view: 'agents', icon: <Bot className="w-5 h-5" />, labelKey: 'aiAgents' },
    { view: 'feed', icon: <MessageSquare className="w-5 h-5" />, labelKey: 'liveFeed' },
    { view: 'settings', icon: <Settings className="w-5 h-5" />, labelKey: 'settings' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full py-5 px-4 bg-white border-r border-slate-200 shadow-xs">
      {/* Brand Header */}
      <div className="px-2 pb-6 flex items-center justify-between">
        <div 
          onClick={() => onViewChange('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1">
              {getTranslation(language, 'brandName')}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {getTranslation(language, 'brandSub')}
            </p>
          </div>
        </div>
        {onCloseMobile && (
          <button 
            onClick={onCloseMobile} 
            className="md:hidden text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <ul className="flex-1 space-y-1 px-1">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <li key={item.view}>
              <button
                onClick={() => {
                  onViewChange(item.view);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'text-indigo-600 font-semibold bg-indigo-50/80 border border-indigo-100'
                    : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{getTranslation(language, item.labelKey)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Language Switcher Section */}
      <div className="px-2 py-3 border-t border-slate-100 my-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
          {language === 'en' ? 'Language / Idioma' : 'Idioma / Language'}
        </div>
        <LanguageToggle language={language} onLanguageChange={onLanguageChange} variant="pill" />
      </div>

      {/* Bottom Footer Section */}
      <div className="px-1 pt-3 border-t border-slate-100 space-y-1">
        <button
          onClick={() => {
            onViewChange('settings');
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>{getTranslation(language, 'support')}</span>
        </button>

        <button
          onClick={() => {
            onViewChange('settings');
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Terminal className="w-4 h-4 text-slate-400" />
          <span>{getTranslation(language, 'logs')}</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-rose-600 font-medium hover:bg-rose-50 transition-colors mt-2 cursor-pointer"
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
        <div className="fixed inset-0 z-50 md:hidden bg-black/70 backdrop-blur-sm">
          <div className="w-[280px] h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
