import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ShopItem, InventoryItem } from '../types';
import { PERMANENT_SHOP_ITEMS, ROTATING_SHOP_ITEMS } from '../lib/constants';
import { generateId } from '../lib/gameFormulas';

interface ShopStore {
  systemItems: ShopItem[];
  userItems: ShopItem[];
  inventory: InventoryItem[];
  purchaseCounts: Record<string, number>; // itemId -> count this month
  addUserItem: (item: Omit<ShopItem, 'id'>) => void;
  deleteUserItem: (id: string) => void;
  buyItem: (itemId: string, userId: string) => boolean; // returns true if purchased
  useInventoryItem: (inventoryId: string) => void;
  getPurchaseCount: (itemId: string) => number;
  getAllItems: () => ShopItem[];
}

function initSystemItems(): ShopItem[] {
  return [
    ...PERMANENT_SHOP_ITEMS.map((item) => ({ ...item, id: generateId() })),
    ...ROTATING_SHOP_ITEMS.map((item) => ({ ...item, id: generateId() })),
  ];
}

export const useShopStore = create<ShopStore>()(
  persist(
    (set, get) => ({
      systemItems: initSystemItems(),
      userItems: [],
      inventory: [],
      purchaseCounts: {},

      addUserItem: (item) =>
        set((state) => ({
          userItems: [...state.userItems, { ...item, id: generateId() }],
        })),

      deleteUserItem: (id) =>
        set((state) => ({
          userItems: state.userItems.filter((i) => i.id !== id),
        })),

      buyItem: (itemId, userId) => {
        const allItems = get().getAllItems();
        const item = allItems.find((i) => i.id === itemId);
        if (!item) return false;

        const count = get().getPurchaseCount(itemId);
        if (item.maxPerMonth != null && count >= item.maxPerMonth) return false;

        const existing = get().inventory.find(
          (inv) => inv.itemId === itemId && inv.userId === userId
        );

        set((state) => ({
          purchaseCounts: {
            ...state.purchaseCounts,
            [itemId]: (state.purchaseCounts[itemId] ?? 0) + 1,
          },
          inventory: existing
            ? state.inventory.map((inv) =>
                inv.itemId === itemId && inv.userId === userId
                  ? { ...inv, quantity: inv.quantity + 1 }
                  : inv
              )
            : [
                ...state.inventory,
                {
                  id: generateId(),
                  userId,
                  itemId,
                  item,
                  quantity: 1,
                  obtainedAt: new Date().toISOString(),
                },
              ],
        }));
        return true;
      },

      useInventoryItem: (inventoryId) =>
        set((state) => ({
          inventory: state.inventory
            .map((inv) =>
              inv.id === inventoryId ? { ...inv, quantity: inv.quantity - 1 } : inv
            )
            .filter((inv) => inv.quantity > 0),
        })),

      getPurchaseCount: (itemId) => get().purchaseCounts[itemId] ?? 0,

      getAllItems: () => [...get().systemItems, ...get().userItems],
    }),
    { name: 'life-rpg-shop' }
  )
);
