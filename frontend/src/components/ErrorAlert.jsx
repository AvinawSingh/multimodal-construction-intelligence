import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const ErrorAlert = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', padding: '2px' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
