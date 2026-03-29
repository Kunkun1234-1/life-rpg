import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Equipment, AttributeKey } from '../types';
import { generateId } from '../lib/gameFormulas';

interface EquipmentStoreState {
  equipment: Equipment[];
  equippedItems: Equipment[];
  addEquipment: (item: Omit<Equipment, 'id' | 'userId' | 'createdAt'>) => void;
  equipItem: (id: string) => void;
  unequipItem: (id: string) => void;
  getEquippedForAttribute: (key: AttributeKey) => Equipment | undefined;
  getTotalBonus: (key: AttributeKey) => number;
}

const SAMPLE_EQUIPMENT: Equipment[] = [
  {
    id: generateId(),
    userId: 'local',
    name: '晨跑计划表',
    type: 'habit',
    attributeKey: 'body',
    bonusPct: 5,
    isEquipped: true,
    streakDays: 14,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    userId: 'local',
    name: '机械键盘',
    type: 'tool',
    attributeKey: 'craft',
    bonusPct: 3,
    isEquipped: true,
    streakDays: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    userId: 'local',
    name: '学习专用书桌',
    type: 'environment',
    attributeKey: 'mind',
    bonusPct: 3,
    isEquipped: false,
    streakDays: 7,
    createdAt: new Date().toISOString(),
  },
];

export const useEquipmentStore = create<EquipmentStoreState>()(
  persist(
    (set, get) => ({
      equipment: SAMPLE_EQUIPMENT,
      equippedItems: SAMPLE_EQUIPMENT.filter(e => e.isEquipped),

      addEquipment: (itemData) => {
        const item: Equipment = {
          ...itemData,
          id: generateId(),
          userId: 'local',
          createdAt: new Date().toISOString(),
        };
        set(state => ({ equipment: [...state.equipment, item] }));
      },

      equipItem: (id) => {
        set(state => {
          const updated = state.equipment.map(e =>
            e.id === id ? { ...e, isEquipped: true } : e
          );
          return { equipment: updated, equippedItems: updated.filter(e => e.isEquipped) };
        });
      },

      unequipItem: (id) => {
        set(state => {
          const updated = state.equipment.map(e =>
            e.id === id ? { ...e, isEquipped: false } : e
          );
          return { equipment: updated, equippedItems: updated.filter(e => e.isEquipped) };
        });
      },

      getEquippedForAttribute: (key) => {
        return get().equipment.find(e => e.attributeKey === key && e.isEquipped);
      },

      getTotalBonus: (key) => {
        return get().equipment
          .filter(e => e.attributeKey === key && e.isEquipped)
          .reduce((sum, e) => sum + e.bonusPct, 0);
      },
    }),
    { name: 'equipment-store' }
  )
);
