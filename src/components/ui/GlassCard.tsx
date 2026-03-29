import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', style, onClick }) => {
  return (
    <div
      className={`rounded-xl border border-white/10 ${className}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GlassCard;
