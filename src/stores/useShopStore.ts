import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ShopItem, InventoryItem, ActiveBuff, AttributeKey } from '../types';
import { usePlayerStore } from './usePlayerStore';
import { ATTRIBUTES } from '../lib/constants';

interface UseItemOptions {
  attributeKey?: AttributeKey;
  taskId?: string;
}

interface ShopStore {
  customRewards: ShopItem[];
  inventory: InventoryItem[];
  monthlyPurchases: Record<string, number>;
  activeBuffs: ActiveBuff[];

  buyItem: (shopItem: ShopItem) => boolean;
  useItem: (inventoryItemId: string, options?: UseItemOptions) => void;
  addToInventory: (item: ShopItem) => void;
  addCustomReward: (reward: Omit<ShopItem, 'id'>) => void;
  removeCustomReward: (id: string) => void;
  getActiveBuffs: () => ActiveBuff[];
  clearExpiredBuffs: () => void;
}

function getCurrentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function endOfToday(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function endOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + daysUntilSunday);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function consumeItem(
  inventory: InventoryItem[],
  inventoryItemId: string
): InventoryItem[] {
  return inventory
    .map((i) =>
      i.id === inventoryItemId ? { ...i, quantity: i.quantity - 1 } : i
    )
    .filter((i) => i.quantity > 0);
}

export const useShopStore = create<ShopStore>()(
  persist(
    (set, get) => ({
      customRewards: [],
      inventory: [],
      monthlyPurchases: {},
      activeBuffs: [],

      buyItem: (shopItem) => {
        const player = usePlayerStore.getState();
        if (player.stardust < shopItem.price) return false;

        const monthKey = getCurrentMonthKey();
        const purchaseKey = `${monthKey}:${shopItem.id}`;
        const { monthlyPurchases } = get();
        const purchasedThisMonth = monthlyPurchases[purchaseKey] ?? 0;

        if (shopItem.maxPerMonth != null && purchasedThisMonth >= shopItem.maxPerMonth) {
          return false;
        }

        player.spendStardust(shopItem.price);

        const now = new Date().toISOString();
        const existingInventoryItem = get().inventory.find(
          (i) => i.itemId === shopItem.id
        );

        set((state) => ({
          monthlyPurchases: {
            ...state.monthlyPurchases,
            [purchaseKey]: purchasedThisMonth + 1,
          },
          inventory: existingInventoryItem
            ? state.inventory.map((i) =>
                i.itemId === shopItem.id ? { ...i, quantity: i.quantity + 1 } : i
              )
            : [
                ...state.inventory,
                {
                  id: crypto.randomUUID(),
                  userId: 'local',
                  itemId: shopItem.id,
                  item: shopItem,
                  quantity: 1,
                  obtainedAt: now,
                },
              ],
        }));

        return true;
      },

      useItem: (inventoryItemId, options) => {
        const inventoryItem = get().inventory.find((i) => i.id === inventoryItemId);
        if (!inventoryItem || inventoryItem.quantity <= 0) return;

        const { effectType, effectValue } = inventoryItem.item;
        const now = new Date().toISOString();

        switch (effectType) {
          case 'stamina_boost': {
            set((state) => ({
              inventory: consumeItem(state.inventory, inventoryItemId),
            }));
            usePlayerStore.setState((s) => ({
              stamina: Math.min(s.stamina + (effectValue ?? 30), s.overflowStamina),
            }));
            break;
          }

          case 'exp_boost': {
            const buff: ActiveBuff = {
              id: crypto.randomUUID(),
              effectType: 'exp_boost',
              effectValue: effectValue ?? 1.3,
              activatedAt: now,
              expiresAt: endOfToday(),
            };
            set((state) => ({
              inventory: consumeItem(state.inventory, inventoryItemId),
              activeBuffs: [...state.activeBuffs, buff],
            }));
            break;
          }

          case 'stardust_boost': {
            const buff: ActiveBuff = {
              id: crypto.randomUUID(),
              effectType: 'stardust_boost',
              effectValue: effectValue ?? 1.3,
              activatedAt: now,
              expiresAt: endOfToday(),
            };
            set((state) => ({
              inventory: consumeItem(state.inventory, inventoryItemId),
              activeBuffs: [...state.activeBuffs, buff],
            }));
            break;
          }

          case 'rest_day': {
            // Just consume the item; actual task completion is handled by applyRestDay()
            set((state) => ({
              inventory: consumeItem(state.inventory, inventoryItemId),
              activeBuffs: [...state.activeBuffs, {
                id: crypto.randomUUID(),
                effectType: 'rest_day' as const,
                effectValue: effectValue ?? 0.5,
                activatedAt: now,
                expiresAt: endOfToday(),
              }],
            }));
            break;
          }

          case 'attr_resonance': {
            const attrKey = options?.attributeKey;
            if (!attrKey) return; // must provide attribute
            const buff: ActiveBuff = {
              id: crypto.randomUUID(),
              effectType: 'attr_resonance',
              effectValue: effectValue ?? 0.2,
              attributeKey: attrKey,
              activatedAt: now,
              expiresAt: endOfWeek(),
            };
            set((state) => ({
              inventory: consumeItem(state.inventory, inventoryItemId),
              activeBuffs: [...state.activeBuffs, buff],
            }));
            break;
          }

          case 'fate_compass': {
            // Random attribute
            const keys = ATTRIBUTES.map((a) => a.key);
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            const buff: ActiveBuff = {
              id: crypto.randomUUID(),
              effectType: 'fate_compass',
              effectValue: effectValue ?? 1.5,
              attributeKey: randomKey as AttributeKey,
              activatedAt: now,
              expiresAt: endOfToday(),
            };
            set((state) => ({
              inventory: consumeItem(state.inventory, inventoryItemId),
              activeBuffs: [...state.activeBuffs, buff],
            }));
            break;
          }

          case 'time_sand': {
            const taskId = options?.taskId;
            if (!taskId) return; // must provide task
            // Just consume the item; actual task reactivation handled by caller
            set((state) => ({
              inventory: consumeItem(state.inventory, inventoryItemId),
            }));
            break;
          }

          case 'custom': {
            set((state) => ({
              inventory: consumeItem(state.inventory, inventoryItemId),
            }));
            break;
          }
        }
      },

      getActiveBuffs: () => {
        const now = new Date().toISOString();
        return (get().activeBuffs ?? []).filter((b) => b.expiresAt > now);
      },

      clearExpiredBuffs: () => {
        const now = new Date().toISOString();
        set((state) => ({
          activeBuffs: (state.activeBuffs ?? []).filter((b) => b.expiresAt > now),
        }));
      },

      addToInventory: (item) => {
        const now = new Date().toISOString();
        const existing = get().inventory.find((i) => i.item.name === item.name);
        set((state) => ({
          inventory: existing
            ? state.inventory.map((i) =>
                i.item.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
              )
            : [
                ...state.inventory,
                {
                  id: crypto.randomUUID(),
                  userId: 'local',
                  itemId: item.id,
                  item,
                  quantity: 1,
                  obtainedAt: now,
                },
              ],
        }));
      },

      addCustomReward: (reward) => {
        const newItem: ShopItem = {
          ...reward,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          customRewards: [...state.customRewards, newItem],
        }));
      },

      removeCustomReward: (id) =>
        set((state) => ({
          customRewards: state.customRewards.filter((r) => r.id !== id),
        })),
    }),
    {
      name: 'life-rpg-shop',
      merge: (persisted, current) => {
        const p = persisted as Partial<ShopStore> | null;
        return {
          ...current,
          ...p,
          activeBuffs: Array.isArray(p?.activeBuffs) ? p.activeBuffs : [],
        };
      },
    }
  )
);
