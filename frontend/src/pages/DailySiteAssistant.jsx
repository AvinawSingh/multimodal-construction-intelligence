import React, { useState } from 'react';
import {
  ClipboardCheck,
  Users,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Wrench,
  Clock,
  HardHat
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

export const DailySiteAssistant = () => {
  const [formData, setFormData] = useState({
    planned_activity: 'RCC Column Reinforcement Tying & Shuttering',
    workforce_count: 14,
    site_condition: 'Normal Dry Ground',
    weather_context: 'Clear skies, expected high 31°C',
    notes: 'Tower crane operational; concrete mix design approved.'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.planned_activity.trim()) {
      setError('Please provide a planned construction activity.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        planned_activity: formData.planned_activity.trim(),
        workforce_count: parseInt(formData.workforce_count, 10) || 10,
        site_condition: formData.site_condition,
        weather_context: formData.weather_context || null,
        notes: formData.notes || null
      };

      const res = await api.generateDailySitePlan(payload);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to generate daily shift plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
          Daily Site Superintendent Assistant
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
          Shift task breakdown, crew labor staging, plant equipment allocation, and proactive safety mitigation.
        </p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      <div className="grid-2">
        {/* Form */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <ClipboardCheck size={18} color="#9333ea" />
                <span>Today's Shift Specifications</span>
              </h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Primary Planned Activity</label>
                <input
                  type="text"
                  name="planned_activity"
                  className="form-input"
                  placeholder="e.g. Ground slab concreting, 2nd floor masonry, plumbing rough-in..."
                  value={formData.planned_activity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid-2" style={{ gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Available Workforce Crew</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    name="workforce_count"
                    className="form-input"
                    value={formData.workforce_count}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Jobsite Terrain / Condition</label>
                  <select
                    name="site_condition"
                    className="form-select"
                    value={formData.site_condition}
                    onChange={handleChange}
                  >
                    <option value="Normal Dry Ground">Normal Dry Ground</option>
                    <option value="Muddy / Post-Rain Wet">Muddy / Post-Rain Wet</option>
                    <option value="Confined Trench / Pit">Confined Trench / Pit</option>
                    <option value="High Elevation (>15m)">High Elevation (&gt;15m)</option>
                    <option value="Active Interior Finish">Active Interior Finish</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Weather Context (Optional)</label>
                <input
                  type="text"
                  name="weather_context"
                  className="form-input"
                  placeholder="e.g. Sunny 30°C, high humidity, wind gusts..."
                  value={formData.weather_context}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Superintendent Notes & Constraints (Optional)</label>
                <textarea
                  name="notes"
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Client visit at 2 PM, RMC transit mixer scheduled at 10 AM..."
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '12px' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    <span>Synthesizing Daily Shift Plan...</span>
                  </>
                ) : (
                  <>
                    <ClipboardCheck size={16} />
                    <span>Generate Daily Shift Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div>
          {loading && (
            <div className="card">
              <LoadingSpinner label="Organizing task timeline, PPE safety checklist, equipment mobilization, and risk mitigations..." />
            </div>
          )}

          {!loading && !result && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px', color: '#64748b' }}>
              <ClipboardCheck size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
              <h4 style={{ fontWeight: 600, color: '#334155', fontSize: '1.02rem', marginBottom: '6px' }}>
                Awaiting Shift Parameters
              </h4>
              <p style={{ fontSize: '0.84rem', maxWidth: '360px', margin: '0 auto' }}>
                Enter today's planned activity and available workforce count to receive an optimized shift workflow.
              </p>
            </div>
          )}

          {!loading && result && (
            <div>
              {/* Timeline Tasks */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <h4 className="card-title" style={{ marginBottom: '12px' }}>
                  <Clock size={16} color="#9333ea" />
                  <span>Shift Task Schedule</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.daily_task_breakdown?.map((task, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.84rem', color: '#1e293b', background: '#fafbfc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                      <span style={{ background: '#f3e8ff', color: '#9333ea', fontWeight: 700, borderRadius: '4px', padding: '2px 6px', fontSize: '0.72rem' }}>
                        T{i + 1}
                      </span>
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Materials & Safety Checklist */}
              <div className="grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div className="card" style={{ marginBottom: 0 }}>
                  <h4 className="card-title" style={{ marginBottom: '10px' }}>
                    <Wrench size={16} color="#f97316" />
                    <span>Materials & Tools</span>
                  </h4>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.80rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.required_materials_and_equipment?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="card" style={{ marginBottom: 0 }}>
                  <h4 className="card-title" style={{ marginBottom: '10px' }}>
                    <HardHat size={16} color="#10b981" />
                    <span>Safety Checklist</span>
                  </h4>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.80rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.site_safety_checklist?.map((check, i) => (
                      <li key={i}>{check}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Risks & Mitigation */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <h4 className="card-title" style={{ marginBottom: '12px' }}>
                  <AlertTriangle size={16} color="#ef4444" />
                  <span>Identified Shift Risks & Mitigations</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {result.potential_risks_and_mitigation?.map((r, i) => (
                    <div key={i} style={{ border: '1px solid #fecaca', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#991b1b', marginBottom: '4px' }}>
                        Risk: {r.risk}
                      </div>
                      <div style={{ fontSize: '0.80rem', color: '#450a0a' }}>
                        <strong>Action:</strong> {r.mitigation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Productivity Tips */}
              <div className="card" style={{ marginBottom: '16px', background: '#f8fafc' }}>
                <h4 className="card-title" style={{ marginBottom: '10px' }}>
                  <Lightbulb size={16} color="#f59e0b" />
                  <span>Crew Productivity Recommendations</span>
                </h4>
                <ul style={{ paddingLeft: '18px', fontSize: '0.80rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {result.productivity_recommendations?.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailySiteAssistant;
