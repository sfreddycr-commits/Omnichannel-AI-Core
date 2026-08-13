import React, { useState, useEffect } from 'react';
import { ViewMode, Language, ThemeMode, Agent, Session, SystemAlert } from './types';
import { getAgents } from './api';
import { SideNavBar } from './components/SideNavBar';
import { TopAppBar } from './components/TopAppBar';
import { SoftphoneModal } from './components/SoftphoneModal';
import { FloatingSoftphoneWidget } from './components/FloatingSoftphoneWidget';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { AgentsView } from './views/AgentsView';
import { ChatsView } from './views/ChatsView';
import { CallsView } from './views/CallsView';
import { LiveFeedView } from './views/LiveFeedView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [language, setLanguage] = useState<Language>('es'); // Default Spanish
  const [theme, setTheme] = useState<ThemeMode>('light'); // Default LIGHT theme per user request
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSoftphoneOpen, setIsSoftphoneOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Agents state fetched from API
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    getAgents().then(data => {
      setAgents(data);
    }).catch(err => console.error('Failed to fetch initial agents:', err));
  }, []);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Initial Sessions Data for LiveFeed
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 'session-1',
      clientName: 'Elena R.',
      channel: 'WhatsApp',
      clientId: 'WX-8921-A',
      status: 'processing',
      lastMessage: 'Necesito ayuda para reiniciar mi router.',
      messages: [
        {
          id: 'm1',
          sender: 'user',
          text: 'Hola, mi internet volvió a caerse. Es la tercera vez esta semana.',
          timestamp: '10:42 AM'
        },
        {
          id: 'm2',
          sender: 'ai',
          text: 'Disculpas por las molestias, Elena. Estoy ejecutando un diagnóstico en tu línea ahora mismo.',
          timestamp: '10:42 AM',
          systemLog: '> SYSTEM: Diagnostics initiated.\n> STATUS: Checking node connection...'
        }
      ],
      aiReasoning: {
        currentIntent: 'Soporte Técnico - Caída de Servicio',
        confidence: 98,
        historicalIssue: 'Cliente reportó fallas similares 3 veces en 7 días.',
        frustrationLevel: 80,
        nextActions: [
          'Ejecutar reinicio remoto de línea (API)',
          'Ofrecer crédito en factura si no se resuelve',
          'Escalar a Soporte Nivel 2'
        ]
      }
    }
  ]);

  // System Alerts Data
  const alerts: SystemAlert[] = [
    {
      id: 'a1',
      type: 'warning',
      title: language === 'en' ? 'API Endpoint Active' : 'API REST & WebSocket Activo',
      description: language === 'en' ? 'Connected to omnichannel.wiazart.com live services.' : 'Conectado exitosamente a los servicios en vivo de omnichannel.wiazart.com.',
      timeAgo: 'Just now'
    }
  ];

  const handleToggleAgent = (agentId: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        const nextStatus = a.status === 'online' || a.status === 'processing' ? 'offline' : 'online';
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  const handleUpdateAgent = (updatedAgent: Agent) => {
    setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
  };

  const handleAddAgent = (newAgent: Agent) => {
    setAgents(prev => [...prev, newAgent]);
  };

  const handleSendMessage = (sessionId: string, text: string) => {
    const time = new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit' });
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          lastMessage: text,
          messages: [
            ...s.messages,
            {
              id: `msg-${Date.now()}`,
              sender: 'agent',
              text: text,
              timestamp: time
            }
          ]
        };
      }
      return s;
    }));
  };

  // Render Login View if not authenticated or if user clicked login view
  if (!isAuthenticated || currentView === 'login') {
    return (
      <LoginView
        language={language}
        onLanguageChange={setLanguage}
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          setCurrentView('dashboard');
        }}
      />
    );
  }

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen font-sans relative antialiased transition-colors duration-200 selection:bg-blue-500 selection:text-white ${
      isLight 
        ? 'bg-[#F8FAFC] text-[#1E293B]' 
        : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Side Navigation Bar */}
      <SideNavBar
        currentView={currentView}
        onViewChange={setCurrentView}
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onLogout={() => {
          setIsAuthenticated(false);
          setCurrentView('login');
        }}
      />

      {/* Top Application Bar */}
      <TopAppBar
        currentView={currentView}
        language={language}
        theme={theme}
        onLanguageChange={setLanguage}
        onToggleTheme={handleToggleTheme}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        alerts={alerts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Floating Call Center WebRTC Softphone Button (Bottom Right) */}
      <FloatingSoftphoneWidget
        onClick={() => setIsSoftphoneOpen(true)}
        isOpen={isSoftphoneOpen}
        activeCallCount={0}
      />

      {/* WebRTC Softphone Testing Modal */}
      <SoftphoneModal
        isOpen={isSoftphoneOpen}
        onClose={() => setIsSoftphoneOpen(false)}
        language={language}
      />

      {/* Main Content Area */}
      <main className="pt-20 pb-12 px-4 sm:px-6 md:pl-[300px] md:pr-8 min-h-screen">
        {currentView === 'dashboard' && (
          <DashboardView
            language={language}
            agents={agents}
            onToggleAgent={handleToggleAgent}
            onNavigateToAgents={() => setCurrentView('agents')}
          />
        )}

        {currentView === 'chats' && (
          <ChatsView
            language={language}
          />
        )}

        {currentView === 'calls' && (
          <CallsView
            language={language}
          />
        )}

        {currentView === 'agents' && (
          <AgentsView
            language={language}
            agents={agents}
            onUpdateAgent={handleUpdateAgent}
            onAddAgent={handleAddAgent}
          />
        )}

        {currentView === 'feed' && (
          <LiveFeedView
            language={language}
            sessions={sessions}
            onSendMessage={handleSendMessage}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            language={language}
          />
        )}
      </main>
    </div>
  );
}
