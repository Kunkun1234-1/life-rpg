import React, { useState, useRef } from 'react';
import { ShopItemCard } from './ShopItemCard';
import { InventoryPanel } from './InventoryPanel';
import { useShopStore } from '../../stores/useShopStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { PERMANENT_SHOP_ITEMS, ROTATING_SHOP_ITEMS } from '../../lib/constants';
import type { ShopCategory, ShopItem } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import GachaPanel from './GachaPanel';

const EMOJI_PRESETS = [
  '🎁', '🎮', '🍽️', '🎬', '☕', '🍰', '🧋', '🍿', '🍦', '📖',
  '🎵', '🏖️', '✈️', '🛍️', '💪', '🎨', '📸', '🌳', '🧘', '🎧',
  '🍜', '🥡', '📺', '😴', '🍎', '🤝', '🏃', '🔥', '💎', '⭐',
];

const TAB_LABELS: { key: ShopCategory; label: string }[] = [
  { key: 'instant_reward', label: '即时奖励' },
  { key: 'item_shop', label: '道具商店' },
  { key: 'stored_reward', label: '存储奖励' },
  { key: 'gacha', label: '祈愿' },
];

const PRICE_PRESETS = [
  { label: '小奖励', range: '50-100', examples: '一杯奶茶、一份零食' },
  { label: '中奖励', range: '200-500', examples: '一顿好吃的、一个小物件' },
  { label: '大奖励', range: '1000+', examples: '大餐、购买想要的东西' },
];

export const ShopPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ShopCategory>('instant_reward');
  const [inventoryCollapsed, setInventoryCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [rewardName, setRewardName] = useState('');
  const [rewardDesc, setRewardDesc] = useState('');
  const [rewardPrice, setRewardPrice] = useState(50);
  const [rewardEmoji, setRewardEmoji] = useState('🎁');
  const [rewardIconUrl, setRewardIconUrl] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const { customRewards, inventory, buyItem, addCustomReward, removeCustomReward, monthlyPurchases } = useShopStore();
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

  const handleAddReward = () => {
    if (!rewardName.trim()) return;
    addCustomReward({
      name: rewardName.trim(),
      description: rewardDesc.trim() || rewardName.trim(),
      category: activeTab === 'stored_reward' ? 'stored_reward' : 'instant_reward',
      price: rewardPrice,
      isSystem: false,
      effectType: 'custom',
      emoji: rewardIconUrl ? undefined : rewardEmoji,
      iconUrl: rewardIconUrl ?? undefined,
    });
    setRewardName('');
    setRewardDesc('');
    setRewardPrice(50);
    setRewardEmoji('🎁');
    setRewardIconUrl(null);
    setShowAddModal(false);
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, 64, 64);
        setRewardIconUrl(canvas.toDataURL('image/png', 0.9));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  function getPurchaseCount(itemId: string): number {
    const d = new Date();
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const purchaseKey = `${monthKey}:${itemId}`;
    return monthlyPurchases[purchaseKey] ?? 0;
  }

  const openAddModal = () => {
    setRewardName('');
    setRewardDesc('');
    setRewardPrice(50);
    setRewardEmoji('🎁');
    setRewardIconUrl(null);
    setShowEmojiPicker(false);
    setShowAddModal(true);
  };

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
                onClick={openAddModal}
                className="mt-2 px-4 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(255,213,79,0.15)', color: '#FFD54F', border: '1px solid rgba(255,213,79,0.3)' }}
              >
                + 添加自定义奖励
              </button>
            )}
          </div>
        ) : activeTab === 'item_shop' ? (
          <div className="space-y-4">
            {tabItems.filter(item => !item.isRotating).length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,213,79,0.6)' }}>常驻道具</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {tabItems.filter(item => !item.isRotating).map((item) => (
                    <ShopItemCard key={item.id} item={item} purchaseCount={getPurchaseCount(item.id)} canAfford={stardust >= item.price} onBuy={() => handleBuy(item)} />
                  ))}
                </div>
              </div>
            )}
            {tabItems.filter(item => item.isRotating).length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(206,147,216,0.7)' }}>轮换道具</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {tabItems.filter(item => item.isRotating).map((item) => (
                    <ShopItemCard key={item.id} item={item} purchaseCount={getPurchaseCount(item.id)} canAfford={stardust >= item.price} onBuy={() => handleBuy(item)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {tabItems.map((item) => (
                <div key={item.id} className="relative group">
                  <ShopItemCard item={item} purchaseCount={getPurchaseCount(item.id)} canAfford={stardust >= item.price} onBuy={() => handleBuy(item)} />
                  {!item.isSystem && (
                    <button
                      onClick={() => removeCustomReward(item.id)}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(255,100,100,0.3)', color: '#ff6b6b' }}
                      title="删除奖励"
                    >✕</button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(255,213,79,0.15)', color: '#FFD54F', border: '1px solid rgba(255,213,79,0.3)' }}
            >
              + 添加自定义奖励
            </button>
          </div>
        )}
      </div>

      {/* Inventory sidebar */}
      <div className="shrink-0 transition-all" style={{ width: inventoryCollapsed ? '48px' : '240px' }}>
        <InventoryPanel inventory={inventory} collapsed={inventoryCollapsed} onToggle={() => setInventoryCollapsed((v) => !v)} />
      </div>

      {/* Add Custom Reward Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={activeTab === 'stored_reward' ? '添加存储奖励' : '添加即时奖励'}>
        <div className="space-y-4">
          {/* Icon selector */}
          <div>
            <label className="text-xs text-white/50 block mb-1">图标</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowEmojiPicker((v) => !v); setRewardIconUrl(null); }}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                title="选择 Emoji"
              >
                {rewardIconUrl ? (
                  <img src={rewardIconUrl} alt="" className="w-8 h-8 rounded object-cover" />
                ) : (
                  rewardEmoji
                )}
              </button>
              <button
                onClick={() => iconInputRef.current?.click()}
                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                上传图片
              </button>
              {rewardIconUrl && (
                <button
                  onClick={() => setRewardIconUrl(null)}
                  className="text-xs text-white/30 hover:text-white/50"
                >
                  清除图片
                </button>
              )}
              <input ref={iconInputRef} type="file" accept="image/*" className="hidden" onChange={handleIconUpload} />
            </div>
            {showEmojiPicker && !rewardIconUrl && (
              <div className="mt-2 p-2 rounded-lg grid grid-cols-10 gap-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {EMOJI_PRESETS.map((e) => (
                  <button
                    key={e}
                    onClick={() => { setRewardEmoji(e); setShowEmojiPicker(false); }}
                    className="w-8 h-8 rounded flex items-center justify-center text-lg hover:bg-white/10 transition-colors"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-white/50 block mb-1">奖励名称 *</label>
            <input
              value={rewardName}
              onChange={(e) => setRewardName(e.target.value)}
              placeholder="如：一杯奶茶、看一部电影"
              className="w-full px-3 py-2 rounded-lg text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs text-white/50 block mb-1">描述</label>
            <input
              value={rewardDesc}
              onChange={(e) => setRewardDesc(e.target.value)}
              placeholder="奖励的详细描述..."
              className="w-full px-3 py-2 rounded-lg text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs text-white/50 block mb-1">星尘价格</label>
            <input
              type="number"
              value={rewardPrice}
              onChange={(e) => setRewardPrice(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              className="w-full px-3 py-2 rounded-lg text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <div className="flex gap-2 mt-2">
              {PRICE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setRewardPrice(parseInt(p.range))}
                  className="px-2 py-1 rounded text-xs transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {p.label} ({p.range})
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs text-white/30">
              {activeTab === 'stored_reward'
                ? '💡 存储奖励：兑换后存入背包，择日使用。适合"攒够了但现在不方便享受"的奖励。'
                : '💡 即时奖励：兑换后立即消费，不进背包。适合当场就能享受的小奖励。'}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="primary" onClick={handleAddReward} disabled={!rewardName.trim()}>
              添加奖励
            </Button>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              取消
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ShopPage;
