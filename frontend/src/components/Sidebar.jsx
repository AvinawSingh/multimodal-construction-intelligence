import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Search,
  IndianRupee,
  Building2,
  BookOpen,
  MessageSquare,
  ClipboardCheck,
  CloudSun,
  HardHat,
  Server
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard / Overview', icon: LayoutDashboard },
  { id: 'safety', label: 'Safety Monitor', icon: ShieldAlert },
  { id: 'crack', label: 'Crack Detection', icon: Search },
  { id: 'valuation', label: 'Real Estate Valuation', icon: IndianRupee },
  { id: 'planner', label: 'Project Planner', icon: Building2 },
  { id: 'knowledge', label: 'Knowledge Assistant', icon: BookOpen },
  { id: 'chat', label: 'Construction Chatbot', icon: MessageSquare },
  { id: 'daily-site', label: 'Daily Site Assistant', icon: ClipboardCheck },
  { id: 'weather', label: 'Weather Advisor', icon: CloudSun },
];

export const Sidebar = ({ activeTab, onSelectTab, serverOnline, isMobileOpen, onCloseMobile }) => {
  return (
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-icon">
          <HardHat size={20} />
        </div>
        <div>
          <div className="brand-title">SkillWallet</div>
          <div className="brand-subtitle">Construction Intelligence</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Core Modules</div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
            >
              <Icon size={18} className="nav-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="server-status-pill">
          <div className={`status-dot ${serverOnline ? 'online' : 'offline'}`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.74rem' }}>
              {serverOnline ? 'Backend Connected' : 'Connecting to Server...'}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.68rem' }}>
              Port 8000 (FastAPI)
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
