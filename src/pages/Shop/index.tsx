import React, { useState } from 'react';
import { ShopItemCard } from './ShopItemCard';
import { InventoryPanel } from './InventoryPanel';
import { useShopStore } from '../../stores/useShopStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import type { ShopCategory } from '../../types';

const TAB_LABELS: { key: ShopCategory; label: string }[] = [
  { key: 'instant_reward', label: '即时奖励' },
  { key: 'item_shop', label: '道具商店' },
  { key: 'stored_reward', label: '存储奖励' },
];

export const ShopPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ShopCategory>('instant_reward');
  const [inventoryCollapsed, setInventoryCollapsed] = useState(false);

  const { customRewards, inventory, buyItem, monthlyPurchases } = useShopStore();
  const stardust = usePlayerStore((s) => s.stardust);

  const tabItems = customRewards.filter((item) => item.category === activeTab);

  const handleBuy = (item: typeof customRewards[number]) => {
    buyItem(item);
  };

  function getPurchaseCount(itemId: string): number {
    const d = new Date();
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const purchaseKey = `${monthKey}:${itemId}`;
    return monthlyPurchases[purchaseKey] ?? 0;
  }

  return (
    <div className="flex h-full gap-4 p-4" style={{ background: 'linear-gradient(135deg, #0a0a1a, #1a0a2e)', minHeight: '100vh' }}>
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Noto Serif SC, serif' }}>奖励商店</h1>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,213,79,0.1)', border: '1px solid rgba(255,213,79,0.3)' }}>
            <span style={{ color: '#FFD54F' }}>✦</span>
            <span className="text-sm font-bold" style={{ color: '#FFD54F' }}>{stardust}</span>
            <span className="text-xs text-white/50">星尘</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {TAB_LABELS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: activeTab === key ? 'rgba(255,213,79,0.2)' : 'rgba(255,255,255,0.04)',
                color: activeTab === key ? '#FFD54F' : 'rgba(255,255,255,0.5)',
                border: activeTab === key ? '1px solid rgba(255,213,79,0.4)' : '1px solid rgba(255,255,255,0.06)',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        {tabItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/30 text-sm">
              {activeTab === 'instant_reward' || activeTab === 'stored_reward'
                ? '此分类暂无商品，可在道具商店购买后存储'
                : '暂无商品'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {tabItems.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                purchaseCount={getPurchaseCount(item.id)}
                canAfford={stardust >= item.price}
                onBuy={() => handleBuy(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Inventory sidebar */}
      <div
        className="shrink-0 transition-all"
        style={{ width: inventoryCollapsed ? '48px' : '240px' }}>
        <InventoryPanel
          inventory={inventory}
          collapsed={inventoryCollapsed}
          onToggle={() => setInventoryCollapsed((v) => !v)}
        />
      </div>
    </div>
  );
};

export default ShopPage;
