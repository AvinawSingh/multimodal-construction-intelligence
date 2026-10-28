import React from 'react';
import { Menu, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

export const Header = ({ title, aiConfigured, onToggleMobile }) => {
  return (
    <header className="top-header">
      <div className="header-left">
        <button
          className="mobile-menu-toggle"
          onClick={onToggleMobile}
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="header-right">
        {aiConfigured ? (
          <span className="header-badge ai" title="Meta LLaMA Multimodal API is Active">
            <Sparkles size={14} />
            <span>LLaMA Vision Active</span>
          </span>
        ) : (
          <span className="header-badge demo" title="Running in Demonstration Mode. Add LLAMA_API_KEY in backend/.env to activate live Meta LLaMA API.">
            <AlertTriangle size={14} />
            <span>Demo Heuristics Mode</span>
          </span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', color: '#64748b', marginLeft: '8px' }}>
          <ShieldCheck size={16} color="#10b981" />
          <span style={{ fontWeight: 500 }}>Enterprise Ready</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
