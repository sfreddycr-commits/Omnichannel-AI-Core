import React, { useState } from 'react';
import { Language } from '../types';
import { getTranslation } from '../translations';
import { LanguageToggle } from '../components/LanguageToggle';
import { 
  Share2, 
  BadgeCheck, 
  Key, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Lock,
  Cpu,
  Sparkles
} from 'lucide-react';

interface LoginViewProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  language,
  onLanguageChange,
  onLoginSuccess
}) => {
  const [operatorId, setOperatorId] = useState('OP-88291');
  const [accessKey, setAccessKey] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [maintainSession, setMaintainSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] text-slate-900 flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Language Switcher Top Corner */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggle language={language} onLanguageChange={onLanguageChange} variant="pill" />
      </div>

      <main className="w-full h-full max-w-[1280px] min-h-[640px] flex flex-col md:flex-row bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl relative z-10">
        {/* Left Side: Visual / Brand Area */}
        <section className="hidden md:flex flex-col w-1/2 relative p-10 lg:p-14 overflow-hidden border-r border-slate-200 justify-between bg-slate-50/70">
          <div className="relative z-10 flex flex-col h-full justify-between">
            {/* Logo Area */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-xl text-slate-900 tracking-tight">
                {getTranslation(language, 'designSoft')}
              </h1>
            </div>

            {/* Hero Content */}
            <div className="space-y-6 my-auto">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">
                  {getTranslation(language, 'aiInfrastructureOnline')}
                </span>
              </div>

              <h2 className="font-extrabold text-4xl lg:text-5xl text-slate-900 leading-tight tracking-tight max-w-md">
                {getTranslation(language, 'neuralCoreTitle')}
              </h2>

              <p className="text-base text-slate-600 max-w-md leading-relaxed">
                {getTranslation(language, 'neuralCoreDesc')}
              </p>
            </div>

            {/* Bottom Footer Accent */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Brain Terminal v2.4 • Enterprise System</span>
            </div>
          </div>
        </section>

        {/* Right Side: Login Form */}
        <section className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative bg-white">
          <div className="w-full max-w-[400px] p-2 relative z-10">
            {/* Mobile Logo */}
            <div className="flex items-center gap-2 mb-8 md:hidden justify-center">
              <Share2 className="w-7 h-7 text-indigo-600" />
              <h1 className="font-bold text-2xl text-slate-900">
                {getTranslation(language, 'designSoft')}
              </h1>
            </div>

            <div className="mb-8 text-center md:text-left">
              <h3 className="font-bold text-2xl text-slate-900 mb-1.5 tracking-tight">
                {getTranslation(language, 'sysAuth')}
              </h3>
              <p className="text-sm text-slate-500">
                {getTranslation(language, 'sysAuthSub')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Operator ID Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block" htmlFor="agent_id">
                  {getTranslation(language, 'operatorId')}
                </label>
                <div className="relative flex items-center">
                  <BadgeCheck className="w-5 h-5 absolute left-3.5 text-slate-400" />
                  <input
                    id="agent_id"
                    type="text"
                    value={operatorId}
                    onChange={(e) => setOperatorId(e.target.value)}
                    placeholder="OP-XXXXX"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block" htmlFor="password">
                    {getTranslation(language, 'accessKey')}
                  </label>
                  <a href="#" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                    {getTranslation(language, 'forgotKey')}
                  </a>
                </div>
                <div className="relative flex items-center">
                  <Key className="w-5 h-5 absolute left-3.5 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-11 text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Checkbox Options */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={maintainSession}
                    onChange={(e) => setMaintainSession(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors font-medium">
                    {getTranslation(language, 'maintainSession')}
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 group shadow-sm mt-6 cursor-pointer"
              >
                <span>{isLoading ? 'Connecting...' : getTranslation(language, 'initializeLink')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Security Notice */}
              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <div className="inline-flex items-center gap-1.5 text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{getTranslation(language, 'encryptedNotice')}</span>
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};
