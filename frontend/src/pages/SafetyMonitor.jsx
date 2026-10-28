import React, { useState } from 'react';
import {
  Upload,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  FileText,
  RefreshCw,
  Eye,
  Info,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

export const SafetyMonitor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [observation, setObservation] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Selected image exceeds the 10 MB limit.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please upload a construction site photo before running the audit.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (observation.trim()) {
        formData.append('observation', observation.trim());
      }
      if (docFile) {
        formData.append('document', docFile);
      }

      const res = await api.analyzeSafety(formData);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to analyze safety image.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setObservation('');
    setDocFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
          Computer Vision Safety Monitor
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
          Real-time visual audit for PPE compliance, scaffolding integrity, fall protection, and housekeeping risks.
        </p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {/* Main Grid */}
      <div className="grid-2">
        {/* Upload & Form Column */}
        <div>
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <ShieldAlert size={18} color="#f97316" />
                  <span>Site Photo Submission</span>
                </h3>
                <div className="card-subtitle">Upload high-resolution jobsite photo</div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Dropzone */}
              <div className="form-group">
                <label className="form-label">Site Photo (Max 10 MB)</label>
                {!previewUrl ? (
                  <label className="dropzone" style={{ display: 'block' }}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <Upload size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.90rem' }}>
                      Click to upload or drag and drop photo
                    </p>
                    <p style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>
                      Supports PNG, JPG, or WebP
                    </p>
                  </label>
                ) : (
                  <div className="dropzone-preview-container">
                    <img src={previewUrl} alt="Site Preview" className="dropzone-preview" />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      style={{ marginTop: '10px', width: '100%' }}
                    >
                      Choose Different Photo
                    </button>
                  </div>
                )}
              </div>

              {/* Observation Field */}
              <div className="form-group">
                <label className="form-label">Site Observation or Area Notes (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. 4th floor staging area during steel tying, windy morning..."
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                />
              </div>

              {/* Supporting Document */}
              <div className="form-group">
                <label className="form-label">Supporting Document or Daily Checklist (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                    className="form-input"
                    style={{ fontSize: '0.82rem' }}
                  />
                  {docFile && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setDocFile(null)}
                      style={{ padding: '8px 12px', fontSize: '0.78rem' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !selectedFile}
                  style={{ flex: 1 }}
                >
                  {loading ? (
                    <>
                      <div className="spinner" />
                      <span>Auditing Site Photo...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={16} />
                      <span>Execute Safety Audit</span>
                    </>
                  )}
                </button>

                {(selectedFile || result) && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    <RefreshCw size={16} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Results Column */}
        <div>
          {loading && (
            <div className="card">
              <LoadingSpinner label="AI Vision Engine is scanning for PPE compliance, fall protection, and site hazards..." />
            </div>
          )}

          {!loading && !result && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px', color: '#64748b' }}>
              <ShieldCheck size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
              <h4 style={{ fontWeight: 600, color: '#334155', fontSize: '1.02rem', marginBottom: '6px' }}>
                Awaiting Safety Image
              </h4>
              <p style={{ fontSize: '0.84rem', maxWidth: '360px', margin: '0 auto' }}>
                Upload a site photo on the left to extract automatic hazard classifications, PPE metrics, and corrective actions.
              </p>
            </div>
          )}

          {!loading && result && (
            <div>
              {result.is_demo_mode && (
                <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Demonstration Mode:</strong> No live Meta LLaMA API key configured. 
                    Displaying realistic baseline safety audit heuristics. To activate live vision AI, add <code>LLAMA_API_KEY</code> in <code>backend/.env</code>.
                  </div>
                </div>
              )}

              {/* Overview Score Card */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      Overall Site Risk Level
                    </span>
                    <div style={{ marginTop: '4px' }}>
                      <StatusBadge status={result.overall_risk_level} size="lg" />
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      Safety Score
                    </span>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: result.safety_score >= 80 ? '#10b981' : result.safety_score >= 60 ? '#f59e0b' : '#ef4444' }}>
                      {result.safety_score} / 100
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong>PPE Compliance:</strong> {result.ppe_compliance_rate}</span>
                  <span><strong>Confidence:</strong> {(result.confidence_score * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Detected Hazards */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <div className="card-header">
                  <h4 className="card-title">
                    <AlertTriangle size={16} color="#ef4444" />
                    <span>Identified Hazards ({result.detected_hazards?.length || 0})</span>
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {result.detected_hazards?.map((h, idx) => (
                    <div key={idx} style={{ border: '1px solid #f1f5f9', background: '#fafbfc', borderRadius: '8px', padding: '12px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                          {h.hazard}
                        </span>
                        <StatusBadge status={h.severity} />
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '6px' }}>
                        <strong>Observation:</strong> {h.observation}
                      </p>
                      <p style={{ fontSize: '0.80rem', color: '#c2410c', background: '#fff7ed', padding: '6px 10px', borderRadius: '6px' }}>
                        <strong>Action:</strong> {h.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Immediate Corrective Actions */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <h4 className="card-title" style={{ marginBottom: '12px' }}>
                  <CheckCircle size={16} color="#10b981" />
                  <span>Immediate Corrective Actions</span>
                </h4>
                <ul style={{ paddingLeft: '18px', fontSize: '0.84rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.immediate_corrective_actions?.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              {/* Disclaimer */}
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', padding: '8px', lineHeight: 1.5 }}>
                {result.disclaimer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafetyMonitor;
