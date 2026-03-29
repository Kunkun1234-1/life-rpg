import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = '#FFD54F',
  height = 6,
  className = '',
  showLabel = false,
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full ${className}`}>
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, background: 'rgba(255,255,255,0.1)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
      {showLabel && (
        <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {clamped.toFixed(0)}%
        </div>
      )}
    </div>
  );
};
