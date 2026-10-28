import React from 'react';

export const StatusBadge = ({ status, text, size = 'md' }) => {
  const norm = (status || '').toLowerCase();
  let badgeClass = 'badge-info';

  if (norm.includes('go') && !norm.includes('no-go')) {
    badgeClass = 'badge-go';
  } else if (norm.includes('no-go') || norm.includes('high') || norm.includes('critical') || norm.includes('severe')) {
    badgeClass = 'badge-nogo';
  } else if (norm.includes('caution') || norm.includes('medium') || norm.includes('moderate')) {
    badgeClass = 'badge-caution';
  } else if (norm.includes('low') || norm.includes('minor') || norm.includes('safe')) {
    badgeClass = 'badge-low';
  }

  const displayText = text || status;

  return (
    <span className={`badge ${badgeClass}`}>
      {displayText}
    </span>
  );
};

export default StatusBadge;
