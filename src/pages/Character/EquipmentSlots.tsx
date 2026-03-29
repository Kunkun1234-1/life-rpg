import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEquipmentStore } from '../../stores/useEquipmentStore';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import type { Equipment, EquipmentType, AttributeKey } from '../../types';

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

const ATTRIBUTE_OPTIONS: { key: AttributeKey; label: string }[] = [
  { key: 'body', label: '体魄' },
  { key: 'mind', label: '心智' },
  { key: 'craft', label: '技艺' },
  { key: 'social', label: '社交' },
  { key: 'spirit', label: '心灵' },
  { key: 'wealth', label: '财务' },
];

interface CreateEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, type: EquipmentType, attributeKey: AttributeKey) => void;
}

const CreateEquipmentModal: React.FC<CreateEquipmentModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<EquipmentType>('tool');
  const [attributeKey, setAttributeKey] = useState<AttributeKey>('body');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), type, attributeKey);
    setName('');
    setType('tool');
    setAttributeKey('body');
    onClose();
  };

  const selectStyle = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.85)',
    borderRadius: '8px',
    padding: '6px 10px',
    width: '100%',
    fontSize: '0.875rem',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新建装备">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs text-white/50">装备名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：番茄钟计时器"
            className="w-full px-3 py-2 rounded-lg text-sm text-white/90 placeholder-white/25 outline-none focus:ring-1 focus:ring-yellow-400/40"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
            autoFocus
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/50">类型</label>
          <select value={type} onChange={(e) => setType(e.target.value as EquipmentType)} style={selectStyle}>
            {(Object.keys(TYPE_LABELS) as EquipmentType[]).map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/50">绑定属性</label>
          <select value={attributeKey} onChange={(e) => setAttributeKey(e.target.value as AttributeKey)} style={selectStyle}>
            {ATTRIBUTE_OPTIONS.map((a) => (
              <option key={a.key} value={a.key}>{a.label}</option>
            ))}
          </select>
        </div>

        <div className="px-3 py-2 rounded-lg text-xs text-white/40" style={{ background: 'rgba(255,255,255,0.04)' }}>
          初始加成：<span className="text-yellow-300 font-bold">+3% 经验</span>（达到30天连续后升级至 +5%）
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>取消</Button>
          <Button variant="primary" size="sm" type="submit" disabled={!name.trim()}>创建并装备</Button>
        </div>
      </form>
    </Modal>
  );
};

interface EquipmentCardProps {
  equipment?: Equipment;
  index: number;
  onClickEmpty: () => void;
  onUnequip: (id: string) => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, index, onClickEmpty, onUnequip }) => {
  if (!equipment) {
    return (
      <motion.div
        className="rounded-lg border-2 border-dashed border-white/15 p-3 flex flex-col items-center justify-center gap-1 min-h-[80px] cursor-pointer hover:border-yellow-400/30 transition-colors"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
        onClick={onClickEmpty}
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
      <button
        onClick={() => onUnequip(equipment.id)}
        className="text-xs text-white/30 hover:text-red-400 transition-colors text-left mt-0.5"
      >
        卸下装备
      </button>
    </motion.div>
  );
};

const EquipmentSlots: React.FC = () => {
  const { equipment, maxSlots, createEquipment, equipItem, unequipItem } = useEquipmentStore();
  const [modalOpen, setModalOpen] = useState(false);

  const equippedItems = equipment.filter((e) => e.isEquipped);
  const slots: (Equipment | undefined)[] = [...equippedItems.slice(0, maxSlots)];
  while (slots.length < maxSlots) slots.push(undefined);

  const handleCreate = (name: string, type: EquipmentType, attributeKey: AttributeKey) => {
    const item = createEquipment({ name, type, attributeKey, bonusPct: 3 });
    equipItem(item.id);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">装备栏</h3>
      <div className="grid grid-cols-2 gap-2">
        {slots.map((item, i) => (
          <EquipmentCard
            key={item?.id ?? `empty-${i}`}
            equipment={item}
            index={i}
            onClickEmpty={() => setModalOpen(true)}
            onUnequip={unequipItem}
          />
        ))}
      </div>
      <CreateEquipmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default EquipmentSlots;
