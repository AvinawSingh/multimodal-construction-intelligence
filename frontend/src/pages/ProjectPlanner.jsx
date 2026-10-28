import React, { useState } from 'react';
import {
  Building2,
  Calculator,
  Calendar,
  Layers,
  IndianRupee,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  ImageIcon
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

export const ProjectPlanner = () => {
  const [formData, setFormData] = useState({
    plot_length_ft: 40,
    plot_width_ft: 60,
    built_up_area_sqft: '',
    location: 'Bengaluru, Urban',
    construction_type: 'Residential',
    number_of_floors: 2,
    quality_grade: 'Standard',
    generate_render: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        plot_length_ft: parseFloat(formData.plot_length_ft) || 40,
        plot_width_ft: parseFloat(formData.plot_width_ft) || 60,
        built_up_area_sqft: formData.built_up_area_sqft ? parseFloat(formData.built_up_area_sqft) : null,
        location: formData.location || 'Urban Standard',
        construction_type: formData.construction_type,
        number_of_floors: parseInt(formData.number_of_floors, 10) || 2,
        quality_grade: formData.quality_grade,
        generate_render: Boolean(formData.generate_render)
      };

      const res = await api.calculateProjectPlan(payload);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to compute project plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
          Project Planning, BOQ & Cost Estimation Engine
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
          Generate structural concrete volumes, material takeoff quantities, phased Gantt schedules, and conceptual 3D renders.
        </p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      <div className="grid-2">
        {/* Form Inputs */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Calculator size={18} color="#f97316" />
                <span>Project Parameters</span>
              </h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid-2" style={{ gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Plot Length (feet)</label>
                  <input
                    type="number"
                    min="10"
                    step="0.5"
                    name="plot_length_ft"
                    className="form-input"
                    value={formData.plot_length_ft}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Plot Width (feet)</label>
                  <input
                    type="number"
                    min="10"
                    step="0.5"
                    name="plot_width_ft"
                    className="form-input"
                    value={formData.plot_width_ft}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Number of Floors</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    name="number_of_floors"
                    className="form-input"
                    value={formData.number_of_floors}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Built-up Area (Sq.Ft - Optional)</label>
                  <input
                    type="number"
                    min="100"
                    placeholder="Leave blank for auto-calc"
                    name="built_up_area_sqft"
                    className="form-input"
                    value={formData.built_up_area_sqft}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Typology</label>
                  <select
                    name="construction_type"
                    className="form-select"
                    value={formData.construction_type}
                    onChange={handleChange}
                  >
                    <option value="Residential">Residential</option>
                    <option value="Villa">Villa / Bungalow</option>
                    <option value="Commercial">Commercial Office</option>
                    <option value="Industrial">Industrial Warehouse</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Finishing Grade</label>
                  <select
                    name="quality_grade"
                    className="form-select"
                    value={formData.quality_grade}
                    onChange={handleChange}
                  >
                    <option value="Standard">Standard (₹1,850/sq.ft base)</option>
                    <option value="Premium">Premium (₹2,450/sq.ft base)</option>
                    <option value="Luxury">Luxury (₹3,350/sq.ft base)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Project Location (City / Region)</label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="e.g. Bengaluru, Mumbai, Delhi NCR, Pune..."
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 600, color: '#0f172a' }}>
                  <input
                    type="checkbox"
                    name="generate_render"
                    checked={formData.generate_render}
                    onChange={handleChange}
                    style={{ width: '16px', height: '16px', accentColor: '#f97316' }}
                  />
                  <span>Generate Conceptual 3D Architectural Visualization Render</span>
                </label>
                <span className="form-help">Powered by Flux AI generative rendering pipeline</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '16px' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    <span>Calculating Quantities & Schedule...</span>
                  </>
                ) : (
                  <>
                    <Calculator size={16} />
                    <span>Generate Project Estimate</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Output Column */}
        <div>
          {loading && (
            <div className="card">
              <LoadingSpinner label="Computing concrete volume, structural steel weights, cost breakdown, and generating 3D render..." />
            </div>
          )}

          {!loading && !result && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px', color: '#64748b' }}>
              <Building2 size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
              <h4 style={{ fontWeight: 600, color: '#334155', fontSize: '1.02rem', marginBottom: '6px' }}>
                Awaiting Project Parameters
              </h4>
              <p style={{ fontSize: '0.84rem', maxWidth: '360px', margin: '0 auto' }}>
                Configure plot dimensions and building specifications on the left to review automated material bills and Gantt milestones.
              </p>
            </div>
          )}

          {!loading && result && (
            <div>
              {/* Summary KPIs */}
              <div className="grid-3" style={{ marginBottom: '16px', gap: '12px' }}>
                <div className="stat-card" style={{ padding: '14px' }}>
                  <div>
                    <div className="stat-label">Built-up Area</div>
                    <div className="stat-val" style={{ fontSize: '1.25rem' }}>
                      {result.total_built_up_area_sqft.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>sq.ft</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card" style={{ padding: '14px' }}>
                  <div>
                    <div className="stat-label">Total Cost</div>
                    <div className="stat-val" style={{ fontSize: '1.25rem', color: '#f97316' }}>
                      ₹{(result.cost_breakdown.total_estimated_cost_inr / 100000).toFixed(2)} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Lakh</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card" style={{ padding: '14px' }}>
                  <div>
                    <div className="stat-label">Duration</div>
                    <div className="stat-val" style={{ fontSize: '1.25rem' }}>
                      {result.estimated_duration_months} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>months</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Material Takeoff Quantities */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <h4 className="card-title" style={{ marginBottom: '14px' }}>
                  <Layers size={16} color="#f97316" />
                  <span>Estimated Material Takeoff</span>
                </h4>
                <div className="grid-3" style={{ gap: '12px' }}>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Cement</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                      {result.materials.cement_bags.toLocaleString()} bags
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>TMT Steel</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                      {result.materials.steel_tons} tons
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Concrete Volume</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                      {result.materials.concrete_volume_m3} m³
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>River / M-Sand</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                      {result.materials.sand_tons} tons
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Coarse Aggregate</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                      {result.materials.aggregate_tons} tons
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Bricks / AAC Blocks</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                      {result.materials.bricks_or_blocks_count.toLocaleString()} nos
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown Table */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <h4 className="card-title" style={{ marginBottom: '14px' }}>
                  <IndianRupee size={16} color="#10b981" />
                  <span>Cost Allocation Breakdown (₹{result.cost_breakdown.cost_per_sqft_inr.toLocaleString()}/sq.ft)</span>
                </h4>
                <table className="custom-table">
                  <tbody>
                    <tr>
                      <td>Civil Materials (Cement, Steel, Aggregates)</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{result.cost_breakdown.civil_materials_inr.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: '#64748b' }}>48%</td>
                    </tr>
                    <tr>
                      <td>Labour & Contractor Charges</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{result.cost_breakdown.labour_charges_inr.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: '#64748b' }}>24%</td>
                    </tr>
                    <tr>
                      <td>Finishing, Tiles & Paint</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{result.cost_breakdown.finishing_flooring_inr.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: '#64748b' }}>14%</td>
                    </tr>
                    <tr>
                      <td>MEP (Electrical & Plumbing)</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{result.cost_breakdown.mep_electrical_plumbing_inr.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: '#64748b' }}>8%</td>
                    </tr>
                    <tr>
                      <td>Permits, Architecture & Supervision</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{result.cost_breakdown.permits_supervision_inr.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: '#64748b' }}>3%</td>
                    </tr>
                    <tr>
                      <td>Contingency Buffer (Escalation)</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{result.cost_breakdown.contingency_buffer_inr.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: '#64748b' }}>3%</td>
                    </tr>
                    <tr style={{ background: '#fafafa', fontWeight: 700 }}>
                      <td>Total Estimated Project Outlay</td>
                      <td style={{ textAlign: 'right', color: '#f97316' }}>₹{result.cost_breakdown.total_estimated_cost_inr.toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }}>100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3D Conceptual Visualization Render */}
              {result.visualization_url && (
                <div className="card" style={{ marginBottom: '16px' }}>
                  <div className="card-header">
                    <h4 className="card-title">
                      <Sparkles size={16} color="#9333ea" />
                      <span>Conceptual 3D Exterior Visualization</span>
                    </h4>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Flux AI Generated Render</span>
                  </div>
                  <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#0f172a' }}>
                    <img
                      src={result.visualization_url}
                      alt="Conceptual 3D Exterior Rendering"
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              {/* Construction Schedule Phases */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <h4 className="card-title" style={{ marginBottom: '14px' }}>
                  <Calendar size={16} color="#3b82f6" />
                  <span>Execution Schedule Phases</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {result.schedule_phases?.map((p) => (
                    <div key={p.phase_number} style={{ border: '1px solid #f1f5f9', background: '#fafbfc', borderRadius: '8px', padding: '12px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                          Phase {p.phase_number}: {p.name}
                        </span>
                        <span className="badge badge-info">{p.duration_weeks} Weeks</span>
                      </div>
                      <div style={{ fontSize: '0.80rem', color: '#475569', marginBottom: '6px' }}>
                        <strong>Milestone:</strong> {p.critical_milestone}
                      </div>
                      <ul style={{ paddingLeft: '18px', fontSize: '0.78rem', color: '#64748b' }}>
                        {p.key_tasks.map((task, i) => (
                          <li key={i}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assumptions & Disclaimer */}
              <div style={{ fontSize: '0.76rem', color: '#64748b', padding: '4px', lineHeight: 1.5 }}>
                <p style={{ marginBottom: '6px' }}><strong>Methodology:</strong> {result.methodology}</p>
                <p style={{ color: '#94a3b8' }}>{result.disclaimer}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectPlanner;
