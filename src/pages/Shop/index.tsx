import React, { useState } from 'react';
import { ShopItemCard } from './ShopItemCard';
import { InventoryPanel } from './InventoryPanel';
import { useShopStore } from '../../stores/useShopStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { PERMANENT_SHOP_ITEMS, ROTATING_SHOP_ITEMS } from '../../lib/constants';
import type { ShopCategory, ShopItem } from '../../types';
import GachaPanel from './GachaPanel';

const TAB_LABELS: { key: ShopCategory; label: string }[] = [
  { key: 'instant_reward', label: '即时奖励' },
  { key: 'item_shop', label: '道具商店' },
  { key: 'stored_reward', label: '存储奖励' },
  { key: 'gacha', label: '祈愿' },
];

export const ShopPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ShopCategory>('instant_reward');
  const [inventoryCollapsed, setInventoryCollapsed] = useState(false);

  const { customRewards, inventory, buyItem, monthlyPurchases } = useShopStore();
  const stardust = usePlayerStore((s) => s.stardust);

  const systemItems: ShopItem[] = [...PERMANENT_SHOP_ITEMS, ...ROTATING_SHOP_ITEMS].map((item, i) => ({
    ...item,
    id: `system-${i}`,
  }));

  const getTabItems = (): ShopItem[] => {
    if (activeTab === 'item_shop') {
      return systemItems.filter(item => item.category === 'item_shop');
    }
    return customRewards.filter(item => item.category === activeTab);
  };

  const tabItems = getTabItems();

  const handleBuy = (item: ShopItem) => {
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
        {activeTab === 'gacha' ? (
          <GachaPanel />
        ) : tabItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <p className="text-white/30 text-sm">
              {activeTab === 'instant_reward' || activeTab === 'stored_reward'
                ? '此分类暂无自定义奖励'
                : '暂无商品'}
            </p>
            {(activeTab === 'instant_reward' || activeTab === 'stored_reward') && (
              <button
                onClick={() => {/* TODO: open add reward modal */}}
                className="mt-2 px-4 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(255,213,79,0.15)', color: '#FFD54F', border: '1px solid rgba(255,213,79,0.3)' }}
              >
                + 添加自定义奖励
              </button>
            )}
          </div>
        ) : activeTab === 'item_shop' ? (
          <div className="space-y-4">
            {/* Permanent items section */}
            {tabItems.filter(item => !item.isRotating).length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,213,79,0.6)' }}>常驻道具</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {tabItems.filter(item => !item.isRotating).map((item) => (
                    <ShopItemCard
                      key={item.id}
                      item={item}
                      purchaseCount={getPurchaseCount(item.id)}
                      canAfford={stardust >= item.price}
                      onBuy={() => handleBuy(item)}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Rotating items section */}
            {tabItems.filter(item => item.isRotating).length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(206,147,216,0.7)' }}>轮换道具</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {tabItems.filter(item => item.isRotating).map((item) => (
                    <ShopItemCard
                      key={item.id}
                      item={item}
                      purchaseCount={getPurchaseCount(item.id)}
                      canAfford={stardust >= item.price}
                      onBuy={() => handleBuy(item)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
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
            <button
              onClick={() => {/* TODO: open add reward modal */}}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(255,213,79,0.15)', color: '#FFD54F', border: '1px solid rgba(255,213,79,0.3)' }}
            >
              + 添加自定义奖励
            </button>
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
