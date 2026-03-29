import React, { useState } from 'react';
import type { InventoryItem } from '../../types';
import { useShopStore } from '../../stores/useShopStore';

interface InventoryPanelProps {
  inventory: InventoryItem[];
  collapsed: boolean;
  onToggle: () => void;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({
  inventory,
  collapsed,
  onToggle,
}) => {
  const [tab, setTab] = useState<'item_shop' | 'stored_reward'>('item_shop');
  const useInventoryItem = useShopStore((s) => s.useInventoryItem);

  const filtered = inventory.filter((inv) => inv.item.category === tab);

  return (
    <div className="rounded-xl flex flex-col h-full"
      style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <h2 className="text-sm font-bold text-white">背包</h2>
        <button onClick={onToggle} className="text-white/40 hover:text-white text-xs px-2 py-1 rounded">
          {collapsed ? '展开' : '收起'}
        </button>
      </div>
      {!collapsed && (
        <>
          <div className="flex gap-1 p-3">
            {(['item_shop', 'stored_reward'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 text-xs py-1.5 rounded-lg transition-all"
                style={{
                  background: tab === t ? 'rgba(255,213,79,0.2)' : 'rgba(255,255,255,0.04)',
                  color: tab === t ? '#FFD54F' : 'rgba(255,255,255,0.5)',
                  border: tab === t ? '1px solid rgba(255,213,79,0.3)' : '1px solid transparent',
                }}>
                {t === 'item_shop' ? '功能道具' : '存储奖励'}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {filtered.length === 0 && (
              <p className="text-xs text-white/30 text-center py-6">背包空空如也</p>
            )}
            {filtered.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg p-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white truncate">{inv.item.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: 'rgba(255,213,79,0.15)', color: '#FFD54F' }}>
                      ×{inv.quantity}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 truncate mt-0.5">{inv.item.description}</p>
                </div>
                <button
                  onClick={() => useInventoryItem(inv.id)}
                  className="ml-2 text-xs px-2 py-1 rounded-lg shrink-0"
                  style={{ background: 'rgba(100,181,246,0.2)', color: '#64B5F6', border: '1px solid rgba(100,181,246,0.3)' }}>
                  使用
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
