import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Equipment, EquipmentType, AttributeKey } from '../types';
import { generateId } from '../lib/gameFormulas';

interface EquipmentCreateData {
  name: string;
  type: EquipmentType;
  attributeKey: AttributeKey;
  bonusPct?: number; // defaults to 3
}

interface EquipmentStore {
  equipment: Equipment[];
  maxSlots: number;
  createEquipment: (data: EquipmentCreateData) => Equipment;
  equipItem: (id: string) => void;
  unequipItem: (id: string) => void;
  getEquippedBonus: (attrKey: AttributeKey) => number;
  incrementStreak: (id: string) => void;
  upgradeEquipment: (id: string) => void;
}

export const useEquipmentStore = create<EquipmentStore>()(
  persist(
    (set, get) => ({
      equipment: [],
      maxSlots: 3,

      createEquipment: (data) => {
        const item: Equipment = {
          id: generateId(),
          userId: 'local',
          name: data.name,
          type: data.type,
          attributeKey: data.attributeKey,
          bonusPct: data.bonusPct ?? 3,
          isEquipped: false,
          streakDays: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ equipment: [...state.equipment, item] }));
        return item;
      },

      equipItem: (id) => {
        const { equipment, maxSlots } = get();
        const equippedCount = equipment.filter((e) => e.isEquipped).length;
        const target = equipment.find((e) => e.id === id);
        if (!target || target.isEquipped) return;
        if (equippedCount >= maxSlots) return; // no free slots
        set((state) => ({
          equipment: state.equipment.map((e) =>
            e.id === id ? { ...e, isEquipped: true } : e
          ),
        }));
      },

      unequipItem: (id) => {
        set((state) => ({
          equipment: state.equipment.map((e) =>
            e.id === id ? { ...e, isEquipped: false } : e
          ),
        }));
      },

      // Returns fraction (e.g. 0.05 for 5%) to add as equipment bonus
      getEquippedBonus: (attrKey) => {
        const equipped = get().equipment.filter(
          (e) => e.isEquipped && e.attributeKey === attrKey
        );
        const totalPct = equipped.reduce((sum, e) => sum + e.bonusPct, 0);
        return totalPct / 100;
      },

      incrementStreak: (id) => {
        set((state) => ({
          equipment: state.equipment.map((e) =>
            e.id === id ? { ...e, streakDays: e.streakDays + 1 } : e
          ),
        }));
      },

      // Upgrade from 3% to 5% after 30-day streak
      upgradeEquipment: (id) => {
        set((state) => ({
          equipment: state.equipment.map((e) => {
            if (e.id !== id) return e;
            if (e.streakDays >= 30 && e.bonusPct === 3) {
              return { ...e, bonusPct: 5 };
            }
            return e;
          }),
        }));
      },
    }),
    { name: 'life-rpg-equipment' }
  )
);
