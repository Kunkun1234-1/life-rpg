import React from 'react';
import type { ShopItem } from '../../types';

interface ShopItemCardProps {
  item: ShopItem;
  purchaseCount: number;
  canAfford: boolean;
  onBuy: () => void;
}

export const ShopItemCard: React.FC<ShopItemCardProps> = ({
  item,
  purchaseCount,
  canAfford,
  onBuy,
}) => {
  const limitReached = item.maxPerMonth != null && purchaseCount >= item.maxPerMonth;
  const disabled = !canAfford || limitReached;

  return (
    <div className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold text-white">{item.name}</h3>
        {item.maxPerMonth != null && (
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: limitReached ? 'rgba(239,68,68,0.2)' : 'rgba(255,213,79,0.15)', color: limitReached ? '#f87171' : '#FFD54F' }}>
            {purchaseCount}/{item.maxPerMonth} 月
          </span>
        )}
      </div>
      <p className="text-xs text-white/50 flex-1">{item.description}</p>
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1">
          <span style={{ color: '#FFD54F' }}>✦</span>
          <span className="text-sm font-bold" style={{ color: '#FFD54F' }}>{item.price}</span>
        </div>
        <button
          onClick={onBuy}
          disabled={disabled}
          className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
          style={{
            background: disabled ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #FFD54F, #FFB300)',
            color: disabled ? 'rgba(255,255,255,0.3)' : '#1a0a00',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}>
          {limitReached ? '已达上限' : !canAfford ? '星尘不足' : '购买'}
        </button>
      </div>
    </div>
  );
};
