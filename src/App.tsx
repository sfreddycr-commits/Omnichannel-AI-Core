import React, { useState } from 'react';
import { ViewMode, Language, Agent, Session, SystemAlert } from './types';
import { SideNavBar } from './components/SideNavBar';
import { TopAppBar } from './components/TopAppBar';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { AgentsView } from './views/AgentsView';
import { LiveFeedView } from './views/LiveFeedView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Initial Mock Agents Data
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'support-tier1',
      name: 'Tier 1 Support Bot',
      department: 'Support',
      status: 'online',
      version: 'v4.2',
      load: 78,
      activeSessions: 1842,
      resolutionRate: 96.5,
      icon: 'support_agent',
      tone: 'friendly',
      autoResolution: true,
      systemPrompt: `You are a helpful Tier 1 support agent. 
Your primary goal is to resolve simple user queries using the provided knowledge base.
If a query involves billing disputes over $50, or technical issues requiring backend access, immediately escalate to a human agent.
Always maintain a friendly tone.`,
      knowledgeBaseFiles: [
        { id: 'f1', name: 'support_faqs_2024.pdf', size: '2.4 MB', uploadedAt: 'Yesterday' },
        { id: 'f2', name: 'troubleshooting_guide.docx', size: '1.8 MB', uploadedAt: '3 days ago' }
      ]
    },
    {
      id: 'support-escalation',
      name: 'Technical Escalation',
      department: 'Support',
      status: 'offline',
      version: 'v2.1',
      load: 0,
      activeSessions: 0,
      resolutionRate: 92.0,
      icon: 'troubleshoot',
      tone: 'professional',
      autoResolution: false,
      systemPrompt: `Handle tier 2 complex technical infrastructure diagnostics and escalated ticket routing.`,
      knowledgeBaseFiles: [
        { id: 'f3', name: 'network_architecture_v2.pdf', size: '8.5 MB', uploadedAt: '1 week ago' }
      ]
    },
    {
      id: 'support-billing',
      name: 'Billing Inquiries',
      department: 'Support',
      status: 'processing',
      version: 'v3.0',
      load: 45,
      activeSessions: 312,
      resolutionRate: 91.2,
      icon: 'receipt_long',
      tone: 'professional',
      autoResolution: true,
      systemPrompt: `Assist customers with subscription upgrades, refund guidelines, and invoice verification.`,
      knowledgeBaseFiles: [
        { id: 'f4', name: 'billing_policy_2026.pdf', size: '1.2 MB', uploadedAt: '2 weeks ago' }
      ]
    },
    {
      id: 'sales',
      name: 'Sales Co-Pilot',
      department: 'Sales',
      status: 'processing',
      version: 'v3.5',
      load: 92,
      activeSessions: 1204,
      resolutionRate: 88.4,
      icon: 'shopping_cart',
      tone: 'friendly',
      autoResolution: true,
      systemPrompt: `Guiding enterprise buyers, evaluating customized AI pipeline packages, and scheduling product demos.`,
      knowledgeBaseFiles: [
        { id: 'f5', name: 'enterprise_pricing_sheet.pdf', size: '3.1 MB', uploadedAt: '1 month ago' }
      ]
    },
    {
      id: 'collections',
      name: 'Collections',
      department: 'Collections',
      status: 'degraded',
      version: 'v1.8',
      load: 12,
      activeSessions: 446,
      resolutionRate: 74.5,
      icon: 'account_balance_wallet',
      tone: 'direct',
      autoResolution: false,
      systemPrompt: `Politely remind enterprise customers of overdue balances and assist with payment link generation.`,
      knowledgeBaseFiles: [
        { id: 'f6', name: 'collections_sop.pdf', size: '1.0 MB', uploadedAt: '2 months ago' }
      ]
    }
  ]);

  // Initial Mock Sessions Data
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 'session-1',
      clientName: 'Elena R.',
      channel: 'WhatsApp',
      clientId: 'WX-8921-A',
      status: 'processing',
      lastMessage: 'I need help resetting my router.',
      messages: [
        {
          id: 'm1',
          sender: 'user',
          text: 'Hi, my internet went down again. This is the third time this week.',
          timestamp: '10:42 AM'
        },
        {
          id: 'm2',
          sender: 'ai',
          text: "I apologize for the connectivity issues, Elena. I'm running a diagnostic on your router (MAC: AB-CD-EF-12-34-56) right now.",
          timestamp: '10:42 AM',
          systemLog: '> SYSTEM: Diagnostics initiated.\n> STATUS: Checking node connection...'
        },
        {
          id: 'm3',
          sender: 'user',
          text: 'Okay, please fix it quickly. I am working from home.',
          timestamp: '10:43 AM'
        }
      ],
      aiReasoning: {
        currentIntent: 'Technical Support - Outage',
        confidence: 98,
        historicalIssue: 'User has reported similar issues 3 times in the last 7 days.',
        frustrationLevel: 80,
        nextActions: [
          'Execute Line Reset (API)',
          'Offer bill credit if unresolved',
          'Escalate to Tier 2 Human'
        ]
      }
    },
    {
      id: 'session-2',
      clientName: 'Marcus T.',
      channel: 'Voice',
      clientId: 'VC-4402-B',
      status: 'active',
      lastMessage: 'Billing inquiry regarding last invoice.',
      messages: [
        {
          id: 'm21',
          sender: 'user',
          text: 'Could you clarify the extra $25 line item on my July statement?',
          timestamp: '10:35 AM'
        },
        {
          id: 'm22',
          sender: 'ai',
          text: 'Certainly Marcus. That charge corresponds to the additional API bandwidth overflow on July 18th.',
          timestamp: '10:36 AM'
        }
      ],
      aiReasoning: {
        currentIntent: 'Billing Inquiry - Invoice Breakdown',
        confidence: 94,
        historicalIssue: 'Monthly bandwidth quota exceeded on 2 prior billing cycles.',
        frustrationLevel: 30,
        nextActions: [
          'Send itemized PDF receipt',
          'Recommend Pro Plan upgrade'
        ]
      }
    },
    {
      id: 'session-3',
      clientName: 'Sarah J.',
      channel: 'WhatsApp',
      clientId: 'WX-1198-C',
      status: 'escalated',
      lastMessage: 'Complex refund request.',
      messages: [
        {
          id: 'm31',
          sender: 'user',
          text: 'I was charged twice for my enterprise renewal and need an immediate refund of $1,200.',
          timestamp: '10:20 AM'
        },
        {
          id: 'm32',
          sender: 'ai',
          text: 'I recognize the urgency, Sarah. Because this transaction exceeds $50, I am escalating this ticket directly to a human financial operator.',
          timestamp: '10:21 AM'
        }
      ],
      aiReasoning: {
        currentIntent: 'High Value Refund Request',
        confidence: 99,
        historicalIssue: 'Duplicate charge flag detected in payment gateway webhook.',
        frustrationLevel: 95,
        nextActions: [
          'Escalate to Human Supervisor',
          'Lock disputed charge'
        ]
      }
    }
  ]);

  // System Alerts Data
  const alerts: SystemAlert[] = [
    {
      id: 'a1',
      type: 'warning',
      title: language === 'en' ? 'High Latency Detected' : 'Alta Latencia Detectada',
      description: language === 'en' ? 'Node cluster alpha-7 experiencing >200ms ping during routing.' : 'El clúster alfa-7 experimenta un ping superior a 200 ms.',
      timeAgo: '12 mins ago'
    },
    {
      id: 'a2',
      type: 'success',
      title: language === 'en' ? 'Model Retraining Complete' : 'Reentrenamiento de Modelo Completo',
      description: language === 'en' ? 'Support Agent NLP model v4.2 deployed successfully to edge servers.' : 'Modelo NLP v4.2 desplegado con éxito en servidores de borde.',
      timeAgo: '45 mins ago'
    },
    {
      id: 'a3',
      type: 'info',
      title: language === 'en' ? 'Traffic Spike Forecast' : 'Pronóstico de Pico de Tráfico',
      description: language === 'en' ? 'Anticipating 30% volume increase in WhatsApp channel at 18:00 UTC.' : 'Se anticipa un aumento del 30% en el canal de WhatsApp a las 18:00 UTC.',
      timeAgo: '55 mins ago'
    }
  ];

  // Handlers
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
    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] font-sans relative antialiased">
      {/* Side Navigation Bar */}
      <SideNavBar
        currentView={currentView}
        onViewChange={setCurrentView}
        language={language}
        onLanguageChange={setLanguage}
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
        onLanguageChange={setLanguage}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        alerts={alerts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="pt-20 pb-12 px-4 sm:px-6 md:pl-[300px] md:pr-10 min-h-screen">
        {currentView === 'dashboard' && (
          <DashboardView
            language={language}
            agents={agents}
            onToggleAgent={handleToggleAgent}
            onNavigateToAgents={() => setCurrentView('agents')}
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
