import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { InventoryItem, AttributeKey } from '../../types';
import { useShopStore } from '../../stores/useShopStore';
import { useTaskStore } from '../../stores/useTaskStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { ATTRIBUTES, ATTRIBUTE_MAP } from '../../lib/constants';

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
  const [tab, setTab] = useState<'item_shop' | 'stored_reward'>(
    inventory.some((i) => i.item.category === 'stored_reward') ? 'stored_reward' : 'item_shop'
  );
  const useItem = useShopStore((s) => s.useItem);
  const rawBuffs = useShopStore((s) => s.activeBuffs ?? []);
  const now = new Date().toISOString();
  const activeBuffs = rawBuffs.filter((b) => b.expiresAt > now);

  // Special UI states
  const [attrSelectId, setAttrSelectId] = useState<string | null>(null);
  const [taskSelectId, setTaskSelectId] = useState<string | null>(null);
  const [fateResult, setFateResult] = useState<{ attr: string; emoji: string } | null>(null);

  const allTasks = useTaskStore((s) => s.tasks);
  const reactivatableTasks = allTasks.filter(
    (t) => (t.status === 'completed' || t.status === 'archived') && (t.rarity >= 3)
  );

  const filtered = inventory.filter((inv) => inv.item.category === tab);

  const handleUse = (inv: InventoryItem) => {
    const { effectType } = inv.item;

    if (effectType === 'attr_resonance') {
      setAttrSelectId(inv.id);
      return;
    }

    if (effectType === 'time_sand') {
      setTaskSelectId(inv.id);
      return;
    }

    if (effectType === 'fate_compass') {
      useItem(inv.id);
      // Show which attribute was randomly selected
      const buffs = useShopStore.getState().getActiveBuffs();
      const latest = buffs.filter((b) => b.effectType === 'fate_compass').pop();
      if (latest?.attributeKey) {
        const attr = ATTRIBUTE_MAP[latest.attributeKey];
        if (attr) {
          setFateResult({ attr: attr.name, emoji: attr.emoji });
          setTimeout(() => setFateResult(null), 3000);
        }
      }
      return;
    }

    if (effectType === 'rest_day') {
      useItem(inv.id);
      // Auto-complete all pending daily tasks with 50% exp
      const taskState = useTaskStore.getState();
      const playerStore = usePlayerStore.getState();
      const restMultiplier = inv.item.effectValue ?? 0.5;
      const dailyTasks = taskState.tasks.filter(
        (t) => t.cycle === 'daily' && t.status === 'pending'
      );
      const now = new Date().toISOString();
      for (const task of dailyTasks) {
        const exp = Math.round(task.baseExp * restMultiplier);
        const stardust = Math.round(task.baseStardust * restMultiplier);
        playerStore.addExp(exp, task.element);
        playerStore.addStardust(stardust);
      }
      useTaskStore.setState((s) => ({
        tasks: s.tasks.map((t) =>
          t.cycle === 'daily' && t.status === 'pending'
            ? { ...t, status: 'completed' as const, completedAt: now }
            : t
        ),
      }));
      return;
    }

    useItem(inv.id);
  };

  const handleAttrSelect = (attrKey: AttributeKey) => {
    if (!attrSelectId) return;
    useItem(attrSelectId, { attributeKey: attrKey });
    setAttrSelectId(null);
  };

  const handleTaskSelect = (taskId: string) => {
    if (!taskSelectId) return;
    useItem(taskSelectId, { taskId });
    // Reactivate the task
    useTaskStore.setState((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: 'pending' as const, completedAt: undefined }
          : t
      ),
    }));
    setTaskSelectId(null);
  };

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
          {/* Active Buffs Display */}
          {activeBuffs.length > 0 && (
            <div className="px-3 pt-3">
              <p className="text-[10px] text-white/30 mb-1.5">生效中</p>
              <div className="flex flex-wrap gap-1">
                {activeBuffs.map((buff) => {
                  const attr = buff.attributeKey ? ATTRIBUTE_MAP[buff.attributeKey] : null;
                  const label =
                    buff.effectType === 'exp_boost' ? `经验 x${buff.effectValue}` :
                    buff.effectType === 'stardust_boost' ? `星尘 x${buff.effectValue}` :
                    buff.effectType === 'attr_resonance' ? `${attr?.emoji ?? ''} ${attr?.name ?? ''} +${Math.round((buff.effectValue ?? 0.2) * 100)}%` :
                    buff.effectType === 'fate_compass' ? `${attr?.emoji ?? ''} ${attr?.name ?? ''} x${buff.effectValue}` :
                    buff.effectType;
                  return (
                    <span
                      key={buff.id}
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(100,181,246,0.15)', color: '#64B5F6', border: '1px solid rgba(100,181,246,0.2)' }}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

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
                {(() => { const count = inventory.filter(i => i.item.category === t).length; return count > 0 ? ` (${count})` : ''; })()}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {filtered.length === 0 && (
              <p className="text-xs text-white/30 text-center py-6">背包空空如也</p>
            )}
            {filtered.map((inv) => (
              <div key={inv.id} className="rounded-lg p-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {inv.item.iconUrl ? (
                        <img src={inv.item.iconUrl} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
                      ) : inv.item.emoji ? (
                        <span className="text-sm leading-none shrink-0">{inv.item.emoji}</span>
                      ) : null}
                      <span className="text-xs font-semibold text-white truncate">{inv.item.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: 'rgba(255,213,79,0.15)', color: '#FFD54F' }}>
                        x{inv.quantity}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 truncate mt-0.5">{inv.item.description}</p>
                  </div>
                  <button
                    onClick={() => handleUse(inv)}
                    className="ml-2 text-xs px-2 py-1 rounded-lg shrink-0"
                    style={{ background: 'rgba(100,181,246,0.2)', color: '#64B5F6', border: '1px solid rgba(100,181,246,0.3)' }}>
                    使用
                  </button>
                </div>

                {/* Attribute selector for 属性共鸣石 */}
                <AnimatePresence>
                  {attrSelectId === inv.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-[10px] text-white/40 mt-2 mb-1.5">选择要强化的属性：</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ATTRIBUTES.map((attr) => (
                          <button
                            key={attr.key}
                            onClick={() => handleAttrSelect(attr.key as AttributeKey)}
                            className="text-xs px-2 py-1 rounded-md border transition-all hover:scale-105"
                            style={{ borderColor: `${attr.color}40`, color: attr.color, background: `${attr.color}15` }}
                          >
                            {attr.emoji} {attr.name}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setAttrSelectId(null)}
                        className="text-[10px] text-white/30 mt-1.5 hover:text-white/50"
                      >
                        取消
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Task selector for 时光之沙 */}
                <AnimatePresence>
                  {taskSelectId === inv.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-[10px] text-white/40 mt-2 mb-1.5">选择要重新激活的任务：</p>
                      {reactivatableTasks.length === 0 ? (
                        <p className="text-[10px] text-white/20 italic">暂无可激活的任务</p>
                      ) : (
                        <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                          {reactivatableTasks.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => handleTaskSelect(t.id)}
                              className="text-left text-xs px-2 py-1.5 rounded-md transition-all hover:bg-white/5"
                              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                              <span className="text-white/70">{t.title}</span>
                              <span className="text-white/25 ml-2">{'★'.repeat(t.rarity)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => setTaskSelectId(null)}
                        className="text-[10px] text-white/30 mt-1.5 hover:text-white/50"
                      >
                        取消
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Fate compass result toast */}
          <AnimatePresence>
            {fateResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-xs text-center"
                style={{ background: 'rgba(206,147,216,0.2)', color: '#CE93D8', border: '1px solid rgba(206,147,216,0.3)' }}
              >
                命运指向了 {fateResult.emoji} {fateResult.attr}！
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};
