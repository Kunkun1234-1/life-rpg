import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0 to 1
  color?: string;
  label?: string;
  showText?: boolean;
}

export function ProgressBar({ value, color = '#FFD54F', label, showText = false }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value));

  return (
    <div className="w-full">
      {(label || showText) && (
        <div className="flex justify-between items-center mb-1 text-xs text-gray-400">
          {label && <span>{label}</span>}
          {showText && <span>{Math.round(clamped * 100)}%</span>}
        </div>
      )}
      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
