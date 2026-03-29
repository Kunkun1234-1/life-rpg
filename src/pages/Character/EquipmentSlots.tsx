import React from 'react';
import { motion } from 'framer-motion';
import { useEquipmentStore } from '../../stores/useEquipmentStore';
import type { Equipment, EquipmentType } from '../../types';

const TYPE_LABELS: Record<EquipmentType, string> = {
  tool: '工具',
  habit: '习惯',
  environment: '环境',
};

const TYPE_COLORS: Record<EquipmentType, string> = {
  tool: 'text-blue-300 bg-blue-500/20 border-blue-400/30',
  habit: 'text-green-300 bg-green-500/20 border-green-400/30',
  environment: 'text-purple-300 bg-purple-500/20 border-purple-400/30',
};

interface EquipmentCardProps {
  equipment?: Equipment;
  index: number;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, index }) => {
  if (!equipment) {
    return (
      <motion.div
        className="rounded-lg border-2 border-dashed border-white/15 p-3 flex flex-col items-center justify-center gap-1 min-h-[80px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
      >
        <span className="text-white/20 text-xl">+</span>
        <span className="text-white/25 text-xs">空槽位</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="rounded-lg border border-white/10 p-3 flex flex-col gap-2"
      style={{ background: 'rgba(255,255,255,0.04)' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-white/90 leading-snug">{equipment.name}</span>
        <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded border ${TYPE_COLORS[equipment.type]}`}>
          {TYPE_LABELS[equipment.type]}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-yellow-300">+{equipment.bonusPct}% 经验</span>
        <span className="text-xs text-white/40">连续 {equipment.streakDays} 天</span>
      </div>
    </motion.div>
  );
};

const EquipmentSlots: React.FC = () => {
  const equipment = useEquipmentStore(s => s.equipment);
  const slots = 6;
  const items: (Equipment | undefined)[] = [...equipment.slice(0, slots)];
  while (items.length < slots) items.push(undefined);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">装备栏</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, i) => (
          <EquipmentCard key={item?.id ?? `empty-${i}`} equipment={item} index={i} />
        ))}
      </div>
    </div>
  );
};

export default EquipmentSlots;
