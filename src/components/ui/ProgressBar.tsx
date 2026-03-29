import React from 'react';

interface ProgressBarProps {
  value: number; // 0-1
  color?: string;
  className?: string;
  height?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, color = '#FFD54F', className = '', height = 'h-2' }) => {
  const pct = Math.min(1, Math.max(0, value)) * 100;
  return (
    <div className={`w-full bg-white/10 rounded-full overflow-hidden ${height} ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
};

export default ProgressBar;
