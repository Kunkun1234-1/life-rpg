import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ShopItem, InventoryItem } from '../types';
import { usePlayerStore } from './usePlayerStore';

interface ShopStore {
  customRewards: ShopItem[];
  inventory: InventoryItem[];
  monthlyPurchases: Record<string, number>;

  buyItem: (shopItem: ShopItem) => boolean;
  useItem: (inventoryItemId: string) => void;
  addToInventory: (item: ShopItem) => void;
  addCustomReward: (reward: Omit<ShopItem, 'id'>) => void;
  removeCustomReward: (id: string) => void;
}

function getCurrentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const useShopStore = create<ShopStore>()(
  persist(
    (set, get) => ({
      customRewards: [],
      inventory: [],
      monthlyPurchases: {},

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

      useItem: (inventoryItemId) => {
        const inventoryItem = get().inventory.find((i) => i.id === inventoryItemId);
        if (!inventoryItem || inventoryItem.quantity <= 0) return;

        const player = usePlayerStore.getState();
        const { effectType, effectValue } = inventoryItem.item;

        switch (effectType) {
          case 'stamina_boost':
            player.addStardust(0); // no-op placeholder; stamina boost applied elsewhere
            set((state) => ({
              inventory: state.inventory.map((i) =>
                i.id === inventoryItemId
                  ? { ...i, quantity: i.quantity - 1 }
                  : i
              ).filter((i) => i.quantity > 0),
            }));
            // Apply stamina boost: increase max stamina temporarily (handled by consumer)
            usePlayerStore.setState((s) => ({
              stamina: Math.min(s.stamina + (effectValue ?? 30), s.overflowStamina),
            }));
            break;

          case 'exp_boost':
          case 'stardust_boost':
          case 'rest_day':
          case 'attr_resonance':
          case 'fate_compass':
          case 'time_sand':
          case 'custom':
            // These effects are handled by the consumer reading active items;
            // just remove from inventory on use.
            set((state) => ({
              inventory: state.inventory.map((i) =>
                i.id === inventoryItemId
                  ? { ...i, quantity: i.quantity - 1 }
                  : i
              ).filter((i) => i.quantity > 0),
            }));
            break;
        }
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
    { name: 'life-rpg-shop' }
  )
);
