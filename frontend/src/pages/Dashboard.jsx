import React from 'react';
import {
  ShieldAlert,
  Search,
  Building2,
  CloudSun,
  IndianRupee,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

export const Dashboard = ({ onNavigate, healthData }) => {
  return (
    <div className="page-container">
      {/* Top Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
          color: '#ffffff',
          borderColor: '#374151',
          marginBottom: '24px',
          padding: '28px 32px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px' }}>
              <Cpu size={14} />
              <span>SKILLWALLET AI ENGINE 2.0</span>
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Multimodal Construction Intelligence Platform
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Enterprise visual safety audits, structural crack forensics, automated BOQ material estimation, 
              defensible real estate valuations, and real-time meteorological site advisories.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => onNavigate('safety')}
              style={{ fontSize: '0.88rem' }}
            >
              <ShieldAlert size={16} />
              <span>Audit Site Safety</span>
            </button>
            <button
              className="btn"
              onClick={() => onNavigate('planner')}
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.15)' }}
            >
              <Building2 size={16} />
              <span>Launch Planner</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Safety Compliance</div>
            <div className="stat-val" style={{ color: '#10b981' }}>94.2%</div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
              ↑ 3.8% vs last week audits
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Structural Scans</div>
            <div className="stat-val">128</div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
              Forensic image assessments
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <Search size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Planner Estimates</div>
            <div className="stat-val">₹42.8 Cr</div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
              Material & BOQ volume
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#fff7ed', color: '#f97316' }}>
            <IndianRupee size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Site Weather Status</div>
            <div className="stat-val" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              GO
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
              Live forecast monitored
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <CloudSun size={22} />
          </div>
        </div>
      </div>

      {/* Modules Quick Access Grid */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', color: '#0f172a' }}>
        SkillWallet Operational Suites
      </h3>

      <div className="grid-3" style={{ marginBottom: '28px' }}>
        {/* Safety Monitor */}
        <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => onNavigate('safety')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700 }}>Safety Monitor</h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Computer Vision Audit</span>
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
            Upload site photographs to detect missing PPE, hazardous scaffolding, unshielded edges, and housekeeping risks.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f97316', fontWeight: 600, fontSize: '0.82rem' }}>
            <span>Run Safety Screening</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Crack Detection */}
        <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => onNavigate('crack')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700 }}>Crack Detection</h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Structural Forensics</span>
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
            Analyze wall and beam crack patterns, distinguish hairline drying shrinkage from shear fissures, and review remedial steps.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f97316', fontWeight: 600, fontSize: '0.82rem' }}>
            <span>Analyze Crack Image</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Project Planner */}
        <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => onNavigate('planner')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700 }}>Project Planner</h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>BOQ & Costing Engine</span>
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
            Input plot dimensions and floor plans to calculate concrete volume, cement, steel, Gantt schedules, and 3D conceptual renders.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f97316', fontWeight: 600, fontSize: '0.82rem' }}>
            <span>Calculate BOQ & Schedule</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Real Estate Valuation */}
        <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => onNavigate('valuation')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700 }}>Real Estate Valuation</h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Benchmark & ROI Model</span>
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
            Estimate property market value range, monthly rental yields, and 5-year capital appreciation based on micro-market parameters.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f97316', fontWeight: 600, fontSize: '0.82rem' }}>
            <span>Estimate Property Value</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Weather Advisor */}
        <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => onNavigate('weather')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CloudSun size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700 }}>Weather Advisor</h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Live Site Risk Forecast</span>
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
            Evaluate wind speeds, precipitation probability, and ambient heat to generate GO / CAUTION / NO-GO construction advisories.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f97316', fontWeight: 600, fontSize: '0.82rem' }}>
            <span>Check Weather Advisory</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Daily Site Assistant */}
        <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => onNavigate('daily-site')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700 }}>Daily Site Assistant</h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Shift Superintendent</span>
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
            Generate structured shift task assignments, safety check checklists, and equipment allocations tailored to crew size.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f97316', fontWeight: 600, fontSize: '0.82rem' }}>
            <span>Plan Today's Shift</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
