import React, { useState, useEffect } from 'react';
import Sidebar, { NAV_ITEMS } from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import SafetyMonitor from './pages/SafetyMonitor';
import CrackDetection from './pages/CrackDetection';
import RealEstateValuation from './pages/RealEstateValuation';
import ProjectPlanner from './pages/ProjectPlanner';
import KnowledgeAssistant from './pages/KnowledgeAssistant';
import ConstructionChatbot from './pages/ConstructionChatbot';
import DailySiteAssistant from './pages/DailySiteAssistant';
import WeatherAdvisor from './pages/WeatherAdvisor';
import api from './services/api';

export const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  const [healthData, setHealthData] = useState(null);

  // Check backend health
  useEffect(() => {
    let isMounted = true;

    const checkServer = async () => {
      try {
        const data = await api.getHealth();
        if (isMounted) {
          setServerOnline(true);
          setHealthData(data);
        }
      } catch (err) {
        if (isMounted) {
          setServerOnline(false);
        }
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 15000); // Poll health every 15s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const activeItem = NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0];

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} healthData={healthData} />;
      case 'safety':
        return <SafetyMonitor />;
      case 'crack':
        return <CrackDetection />;
      case 'valuation':
        return <RealEstateValuation />;
      case 'planner':
        return <ProjectPlanner />;
      case 'knowledge':
        return <KnowledgeAssistant />;
      case 'chat':
        return <ConstructionChatbot />;
      case 'daily-site':
        return <DailySiteAssistant />;
      case 'weather':
        return <WeatherAdvisor />;
      default:
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} healthData={healthData} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        serverOnline={serverOnline}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          title={activeItem.label}
          aiConfigured={Boolean(healthData?.ai_configured)}
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
        />

        {renderActivePage()}
      </div>
    </div>
  );
};

export default App;
