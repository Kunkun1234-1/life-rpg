import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '../../components/ui/GlassCard';

interface ActionItem {
  icon: string;
  label: string;
  to?: string;
  onClick?: () => void;
  color: string;
}

const ACTIONS: ActionItem[] = [
  { icon: '✦', label: '创建任务', to: '/tasks', color: '#FFD54F' },
  { icon: '🛒', label: '商城', to: '/shop', color: '#64B5F6' },
  { icon: '🎒', label: '使用道具', to: '/shop', color: '#CE93D8' },
  { icon: '📅', label: '日历', to: '/calendar', color: '#81C784' },
];

export const QuickActions: React.FC = () => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
        快速操作
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action, i) => {
          const inner = (
            <GlassCard
              key={i}
              className="p-4 flex flex-col items-center gap-2 cursor-pointer"
              style={{ border: `1px solid ${action.color}22` }}
              onClick={action.onClick}
            >
              <motion.span
                className="text-2xl"
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{ color: action.color }}
              >
                {action.icon}
              </motion.span>
              <span className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {action.label}
              </span>
            </GlassCard>
          );
          if (action.to) {
            return (
              <Link key={i} to={action.to} className="no-underline">
                {inner}
              </Link>
            );
          }
          return inner;
        })}
      </div>
    </div>
  );
};
