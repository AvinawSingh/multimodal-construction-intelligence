import React, { useState } from 'react';
import {
  Search,
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  RefreshCw,
  HardHat,
  ShieldAlert
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

export const CrackDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image (JPG, PNG, WebP).');
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
      setError('Please select a crack photograph before running analysis.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      const res = await api.analyzeCrack(formData);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to analyze crack image.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDescription('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
          Structural Crack Forensics & Classification
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
          Vision-assisted screening for masonry, beam, and slab fractures to evaluate pattern, severity, and root causes.
        </p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {/* Grid */}
      <div className="grid-2">
        {/* Upload Column */}
        <div>
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Search size={18} color="#3b82f6" />
                  <span>Crack Image Input</span>
                </h3>
                <div className="card-subtitle">Close-up photograph with clear surface view</div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Crack Photograph (Max 10 MB)</label>
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
                      Click to upload crack photograph
                    </p>
                    <p style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>
                      Include a coin or pen for scale reference if possible
                    </p>
                  </label>
                ) : (
                  <div className="dropzone-preview-container">
                    <img src={previewUrl} alt="Crack Preview" className="dropzone-preview" />
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

              <div className="form-group">
                <label className="form-label">Location / Structural Context (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. 1st floor load-bearing wall near beam junction, noticed 2 weeks after monsoon..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

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
                      <span>Diagnosing Crack Pattern...</span>
                    </>
                  ) : (
                    <>
                      <FileSearch size={16} />
                      <span>Analyze Crack Forensics</span>
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

        {/* Diagnostic Results Column */}
        <div>
          {loading && (
            <div className="card">
              <LoadingSpinner label="Evaluating fissure geometry, crack width, structural boundary stress, and potential risks..." />
            </div>
          )}

          {!loading && !result && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px', color: '#64748b' }}>
              <FileSearch size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
              <h4 style={{ fontWeight: 600, color: '#334155', fontSize: '1.02rem', marginBottom: '6px' }}>
                No Fracture Selected
              </h4>
              <p style={{ fontSize: '0.84rem', maxWidth: '360px', margin: '0 auto' }}>
                Upload a crack photograph to generate automated morphology categorization, cause identification, and remediation protocol.
              </p>
            </div>
          )}

          {!loading && result && (
            <div>
              {result.is_demo_mode && (
                <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Demonstration Mode:</strong> No Meta LLaMA API key configured. 
                    Displaying benchmark structural forensics analysis. To activate live vision AI, add <code>LLAMA_API_KEY</code> in <code>backend/.env</code>.
                  </div>
                </div>
              )}

              {/* Classification Card */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      Identified Fracture Classification
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {result.crack_classification}
                    </h3>
                  </div>
                  <StatusBadge status={result.apparent_severity} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Estimated Width:</span>{' '}
                    <strong>{result.estimated_width_mm}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Inspection Required:</span>{' '}
                    <strong style={{ color: result.professional_inspection_required ? '#ef4444' : '#10b981' }}>
                      {result.professional_inspection_required ? 'Yes (Mandatory)' : 'Optional'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Visible Characteristics & Possible Causes */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <h4 className="card-title" style={{ marginBottom: '10px' }}>
                  <span>Visible Characteristics & Likely Causes</span>
                </h4>

                <div style={{ marginBottom: '14px' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#475569' }}>Morphological Features:</strong>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: '#334155', marginTop: '4px' }}>
                    {result.visible_characteristics?.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#475569' }}>Underlying Structural Causes:</strong>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: '#334155', marginTop: '4px' }}>
                    {result.possible_causes?.map((cause, i) => (
                      <li key={i}>{cause}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Next Steps */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <h4 className="card-title" style={{ marginBottom: '10px' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Recommended Action Plan</span>
                </h4>
                <ol style={{ paddingLeft: '18px', fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {result.recommended_next_steps?.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Legal / Engineering Disclaimer */}
              <div className="alert alert-error" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                <HardHat size={20} style={{ flexShrink: 0 }} />
                <div>{result.disclaimer}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrackDetection;
