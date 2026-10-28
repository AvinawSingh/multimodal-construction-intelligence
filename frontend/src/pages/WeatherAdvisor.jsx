import React, { useState } from 'react';
import {
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Activity,
  MapPin
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const COMMON_ACTIVITIES = [
  'Concreting / Slab Pouring',
  'Scaffolding & Working at Height (>10m)',
  'Crane Lifting & Rigging Operations',
  'Excavation & Trench Shoring',
  'Exterior Painting & Plastering',
  'Roof Truss & Sheet Installation',
  'Basement Waterproofing Membrane'
];

export const WeatherAdvisor = () => {
  const [formData, setFormData] = useState({
    location: 'Mumbai, Maharashtra',
    planned_activity: 'Concreting / Slab Pouring'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location.trim()) {
      setError('Please provide a jobsite city or region.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.getWeatherAdvisory({
        location: formData.location.trim(),
        planned_activity: formData.planned_activity
      });
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather forecast.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
          Meteorological Risk & Safety Advisor
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
          Real-time global weather integration with activity-specific GO / CAUTION / NO-GO safety thresholds.
        </p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      <div className="grid-2">
        {/* Form Column */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <CloudSun size={18} color="#d97706" />
                <span>Site Meteorological Input</span>
              </h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Jobsite City / Location</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mumbai, Bengaluru, New York, London, Delhi, Dubai..."
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <span className="form-help">Resolves precise coordinates via live Open-Meteo Geocoding</span>
              </div>

              <div className="form-group">
                <label className="form-label">Planned Construction Operation</label>
                <select
                  className="form-select"
                  value={formData.planned_activity}
                  onChange={(e) => setFormData({ ...formData, planned_activity: e.target.value })}
                >
                  {COMMON_ACTIVITIES.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '16px' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Quick City Benchmarks:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {['Mumbai', 'Bengaluru', 'Delhi', 'Dubai', 'London', 'Singapore'].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setFormData({ ...formData, location: city })}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        color: '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '24px' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    <span>Fetching Live Meteorological Stream...</span>
                  </>
                ) : (
                  <>
                    <CloudSun size={16} />
                    <span>Check Activity Weather Safety</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Advisory Output */}
        <div>
          {loading && (
            <div className="card">
              <LoadingSpinner label="Contacting global meteorological stations, analyzing wind shear, and evaluating precipitation limits..." />
            </div>
          )}

          {!loading && !result && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px', color: '#64748b' }}>
              <CloudSun size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
              <h4 style={{ fontWeight: 600, color: '#334155', fontSize: '1.02rem', marginBottom: '6px' }}>
                Awaiting Weather Coordinates
              </h4>
              <p style={{ fontSize: '0.84rem', maxWidth: '360px', margin: '0 auto' }}>
                Select a jobsite location and active task to query real meteorological stations for a certified GO / CAUTION / NO-GO status.
              </p>
            </div>
          )}

          {!loading && result && (
            <div>
              {/* Main Decision Banner */}
              <div
                className="card"
                style={{
                  marginBottom: '16px',
                  borderLeft: `6px solid ${
                    result.advisory_status === 'GO' ? '#10b981' : result.advisory_status === 'CAUTION' ? '#f59e0b' : '#ef4444'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', color: '#64748b' }}>
                      <MapPin size={14} />
                      <span>{result.location}</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      Advisory: {result.advisory_status}
                    </div>
                  </div>
                  <StatusBadge status={result.advisory_status} size="lg" />
                </div>

                <p style={{ fontSize: '0.88rem', color: '#1e293b', fontWeight: 500, lineHeight: 1.5, marginBottom: '8px' }}>
                  {result.decision_summary}
                </p>

                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {result.hourly_trend_notes}
                </div>
              </div>

              {/* Weather Stats Grid */}
              <div className="grid-3" style={{ gap: '12px', marginBottom: '16px' }}>
                <div className="stat-card" style={{ padding: '12px 14px' }}>
                  <div>
                    <div className="stat-label">Temperature</div>
                    <div className="stat-val" style={{ fontSize: '1.3rem' }}>
                      {result.weather.temperature_c}°C
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                      Feels {result.weather.apparent_temp_c}°C
                    </div>
                  </div>
                  <Thermometer size={20} color="#ea580c" />
                </div>

                <div className="stat-card" style={{ padding: '12px 14px' }}>
                  <div>
                    <div className="stat-label">Wind Gusts</div>
                    <div className="stat-val" style={{ fontSize: '1.3rem', color: result.weather.wind_gusts_kmh > 35 ? '#ef4444' : '#0f172a' }}>
                      {result.weather.wind_gusts_kmh} <span style={{ fontSize: '0.70rem' }}>km/h</span>
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                      Avg: {result.weather.wind_speed_kmh} km/h
                    </div>
                  </div>
                  <Wind size={20} color="#3b82f6" />
                </div>

                <div className="stat-card" style={{ padding: '12px 14px' }}>
                  <div>
                    <div className="stat-label">Rain Probability</div>
                    <div className="stat-val" style={{ fontSize: '1.3rem', color: result.weather.precipitation_prob_percent > 40 ? '#ef4444' : '#0f172a' }}>
                      {result.weather.precipitation_prob_percent}%
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                      Precip: {result.weather.precipitation_mm} mm
                    </div>
                  </div>
                  <Droplets size={20} color="#06b6d4" />
                </div>
              </div>

              {/* Activity-Specific Risks & Precautions */}
              <div className="grid-2" style={{ gap: '14px', marginBottom: '16px' }}>
                <div className="card" style={{ marginBottom: 0 }}>
                  <h4 className="card-title" style={{ marginBottom: '10px' }}>
                    <AlertTriangle size={16} color="#ef4444" />
                    <span>Activity Risks ({result.planned_activity})</span>
                  </h4>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.80rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.activity_specific_risks?.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="card" style={{ marginBottom: 0 }}>
                  <h4 className="card-title" style={{ marginBottom: '10px' }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>Safety Protocols</span>
                  </h4>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.80rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.recommended_precautions?.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Data Verification Footer */}
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.74rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><strong>Data Source:</strong> {result.data_source}</span>
                <span><strong>Coordinates:</strong> {result.latitude}, {result.longitude}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherAdvisor;
