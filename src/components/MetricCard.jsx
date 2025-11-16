import React from 'react';

const MetricCard = ({ title, value, unit, color, icon, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const bgColor = isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.6)';
  const borderColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)';
  const textSecondary = isLight ? '#64748b' : '#999999';
  const shadow = isLight 
    ? '0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)' 
    : '0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.1)';
  const hoverShadow = isLight
    ? '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)'
    : '0 12px 40px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.3)';

  return (
    <div 
      style={{
        background: bgColor,
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: shadow,
        border: `1px solid ${borderColor}`,
        transition: 'all 0.3s ease',
        borderTop: `3px solid ${color || (isLight ? '#1a202c' : '#ffffff')}`,
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = hoverShadow;
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.borderTopWidth = '4px';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = shadow;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = borderColor;
        e.currentTarget.style.borderTopWidth = '3px';
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ 
          color: textSecondary, 
          fontSize: '13px', 
          fontWeight: '500', 
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {title}
        </h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span 
          style={{ 
            fontSize: '36px', 
            fontWeight: '600', 
            color: color || (isLight ? '#1a202c' : '#ffffff'),
            letterSpacing: '-0.02em',
          }}
        >
          {value !== null && value !== undefined ? value.toFixed(1) : '--'}
        </span>
        {unit && (
          <span style={{ 
            color: textSecondary, 
            fontSize: '16px',
            fontWeight: '400',
          }}>{unit}</span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;

