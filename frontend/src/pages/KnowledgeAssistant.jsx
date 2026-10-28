import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  Wrench,
  BookMarked
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const SAMPLE_QUESTIONS = [
  { cat: 'Technique', q: 'What is the required wet curing period for OPC vs PPC concrete?' },
  { cat: 'Safety', q: 'What are the mandatory OSHA guardrail requirements for scaffolding platforms?' },
  { cat: 'Technique', q: 'How is the water-cement ratio controlled to prevent shrinkage cracks?' },
  { cat: 'Documentation', q: 'What test records and approvals are required before pouring an RCC roof slab?' },
  { cat: 'Safety', q: 'What safety precautions must be followed during deep trench excavation?' }
];

export const KnowledgeAssistant = () => {
  const [category, setCategory] = useState('Safety');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleAsk = async (queryText = question, cat = category) => {
    if (!queryText.trim()) {
      setError('Please enter a construction query.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.askKnowledge({
        category: cat,
        question: queryText.trim()
      });
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to retrieve knowledge advisory.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
          Construction Knowledge & Standards Assistant
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
          Authoritative technical specifications, OSHA / IS building code standards, and execution precautions.
        </p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {/* Category Pills & Input */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[
            { id: 'Safety', label: 'Safety Protocols', icon: ShieldAlert },
            { id: 'Technique', label: 'Engineering Technique', icon: Wrench },
            { id: 'Documentation', label: 'Documentation & QC', icon: FileCheck },
            { id: 'All', label: 'All Standards', icon: BookMarked }
          ].map((c) => {
            const Icon = c.icon;
            const isSelected = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className="btn"
                style={{
                  background: isSelected ? 'var(--color-primary)' : '#f8fafc',
                  color: isSelected ? '#ffffff' : '#475569',
                  borderColor: isSelected ? 'var(--color-primary)' : '#e2e8f0',
                  fontSize: '0.84rem',
                  padding: '8px 14px'
                }}
              >
                <Icon size={16} />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          style={{ display: 'flex', gap: '10px' }}
        >
          <input
            type="text"
            className="form-input"
            placeholder={`Ask a question on ${category.toLowerCase()} guidelines, testing, or building codes...`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !question.trim()}
            style={{ whiteSpace: 'nowrap' }}
          >
            <Search size={16} />
            <span>Search Codes</span>
          </button>
        </form>

        {/* Quick Sample Questions */}
        <div style={{ marginTop: '16px' }}>
          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Suggested Queries:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            {SAMPLE_QUESTIONS.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setCategory(s.cat);
                  setQuestion(s.q);
                  handleAsk(s.q, s.cat);
                }}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  color: '#334155',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {s.q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Answer Area */}
      {loading && (
        <div className="card">
          <LoadingSpinner label="Consulting civil engineering standards and OSHA / IS building guidelines..." />
        </div>
      )}

      {!loading && result && (
        <div>
          {result.is_demo_mode && (
            <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Demonstration Mode:</strong> Displaying verified civil engineering standard guidance. 
                Set <code>LLAMA_API_KEY</code> in <code>backend/.env</code> for open-domain Meta LLaMA synthesis.
              </div>
            </div>
          )}

          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="card-header">
              <div>
                <span className="badge badge-info" style={{ marginBottom: '4px' }}>
                  {result.category}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                  {result.question}
                </h3>
              </div>
            </div>

            <p style={{ fontSize: '0.94rem', color: '#1e293b', lineHeight: 1.7, marginBottom: '20px' }}>
              {result.answer}
            </p>

            <div className="grid-2" style={{ gap: '20px' }}>
              {/* Key Technical Points */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} color="#10b981" />
                  <span>Technical Takeaways</span>
                </h4>
                <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.key_points?.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>

              {/* Critical Precautions */}
              <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#92400e', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={16} color="#d97706" />
                  <span>Mandatory Precautions</span>
                </h4>
                <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: '#78350f', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.precautions?.map((pc, i) => (
                    <li key={i}>{pc}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Applicable Standards & Limitations */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Referenced Codes:
                </span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  {result.applicable_standards?.map((std, i) => (
                    <span key={i} style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '0.76rem', color: '#475569', fontWeight: 500 }}>
                      {std}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic', maxWidth: '380px', textAlign: 'right' }}>
                {result.limitations}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeAssistant;
