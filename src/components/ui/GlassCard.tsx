import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, style }) => {
  return (
    <motion.div
      className={`rounded-xl ${className}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.08)',
        ...style,
      }}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.01 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};
