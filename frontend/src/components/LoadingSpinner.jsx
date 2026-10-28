import React from 'react';

export const LoadingSpinner = ({ label = 'Processing with AI engine...', orange = false }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '12px' }}>
      <div className={`spinner ${orange ? 'spinner-orange' : 'spinner-orange'}`} style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
      <p style={{ fontSize: '0.86rem', color: '#64748b', fontWeight: 500 }}>{label}</p>
    </div>
  );
};

export default LoadingSpinner;
