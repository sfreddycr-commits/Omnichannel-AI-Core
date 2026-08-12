import React, { useState } from 'react';
import { ViewMode, Language, SystemAlert } from '../types';
import { getTranslation } from '../translations';
import { LanguageToggle } from './LanguageToggle';
import { NotificationModal } from './NotificationModal';
import { 
  Menu, 
  Search, 
  Bell, 
  Server, 
  User, 
  Activity,
  Globe
} from 'lucide-react';

interface TopAppBarProps {
  currentView: ViewMode;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onToggleMobileMenu: () => void;
  alerts: SystemAlert[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentView,
  language,
  onLanguageChange,
  onToggleMobileMenu,
  alerts,
  searchQuery,
  onSearchChange
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <header className="fixed top-0 right-0 w-full md:w-[calc(100%-280px)] h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex justify-between items-center px-4 md:px-8 z-30 shadow-2xs">
        {/* Left Side: Mobile Menu Button & Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="font-bold text-base text-slate-900 hidden sm:block tracking-tight">
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
              className="bg-slate-100 border border-slate-200 rounded-full py-1.5 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 w-36 sm:w-56 transition-all"
            />
          </div>
        </div>

        {/* Right Side: Status Metrics, Notifications, Profile & Language */}
        <div className="flex items-center gap-3 md:gap-6 text-xs">
          {/* Status Indicators */}
          <div className="hidden lg:flex items-center gap-4 text-slate-600">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{getTranslation(language, 'status')}</span>
            </div>
            <span className="hover:text-slate-900 cursor-pointer transition-colors font-medium">
              {getTranslation(language, 'capacity')}
            </span>
            <span className="text-indigo-600 font-semibold">
              {getTranslation(language, 'users15k')}
            </span>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            {/* Notifications Button */}
            <button
              onClick={() => setShowNotifications(true)}
              className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
              title="System Alerts"
            >
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {/* Server / Cluster Status Icon */}
            <button
              className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors hidden sm:block cursor-pointer"
              title="Cluster Nodes"
            >
              <Server className="w-4 h-4" />
            </button>

            {/* Profile Avatar Icon */}
            <button
              className="p-2 rounded-full text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title="User Profile"
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
