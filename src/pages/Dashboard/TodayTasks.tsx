import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '../../stores/useTaskStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { StarRating } from '../../components/ui/StarRating';
import { ATTRIBUTE_MAP, RARITY_MAP } from '../../lib/constants';
import type { Task } from '../../types';

interface FloatingReward {
  id: number;
  exp: number;
  stardust: number;
  taskId: string;
}

export const TodayTasks: React.FC = () => {
  const allTasks = useTaskStore((s) => s.tasks);
  const completeTask = useTaskStore((s) => s.completeTask);
  const [floatingRewards, setFloatingRewards] = useState<FloatingReward[]>([]);
  const [rewardCounter, setRewardCounter] = useState(0);

  // Filter today's tasks: daily tasks + pending onetime tasks
  const tasks = allTasks.filter(
    (t) => t.cycle === 'daily' || (t.cycle === 'onetime' && t.status === 'pending')
  );
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const total = tasks.length;

  // Sort by rarity descending (5-star first)
  const sorted = [...tasks].sort((a, b) => b.rarity - a.rarity);

  const handleComplete = (task: Task) => {
    if (task.status === 'completed') return;
    // completeTask handles exp/stardust/stamina internally
    completeTask(task.id, false);

    const id = rewardCounter;
    setRewardCounter((c) => c + 1);
    setFloatingRewards((prev) => [...prev, { id, exp: task.baseExp, stardust: task.baseStardust, taskId: task.id }]);
    setTimeout(() => {
      setFloatingRewards((prev) => prev.filter((r) => r.id !== id));
    }, 1500);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
          今日任务
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,213,79,0.15)', color: '#FFD54F' }}>
          {completed}/{total} 已完成
        </span>
      </div>

      {/* Task list */}
      <div className="space-y-2 relative">
        <AnimatePresence>
          {sorted.map((task) => {
            const attr = ATTRIBUTE_MAP[task.element];
            const rarityConfig = RARITY_MAP[task.rarity];
            const isDone = task.status === 'completed';
            const pendingReward = floatingRewards.find((r) => r.taskId === task.id);

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
                className="relative"
              >
                <GlassCard
                  className="p-3"
                  style={{
                    borderLeft: `3px solid ${attr.color}`,
                    opacity: isDone ? 0.5 : 1,
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Element emoji */}
                    <span className="text-xl flex-shrink-0">{attr.emoji}</span>

                    {/* Task info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <StarRating rarity={task.rarity} />
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ background: `${rarityConfig.color}22`, color: rarityConfig.color, fontSize: '10px' }}
                        >
                          {rarityConfig.label}
                        </span>
                      </div>
                      <p
                        className="text-sm font-medium mt-0.5 truncate"
                        style={{
                          color: isDone ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.9)',
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        <span style={{ color: '#FFD54F' }}>+{task.baseExp} EXP</span>
                        <span style={{ color: '#64B5F6' }}>+{task.baseStardust} ✦</span>
                        <span>⚡{task.staminaCost}</span>
                      </div>
                    </div>

                    {/* Complete button */}
                    {!isDone && (
                      <motion.button
                        className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{
                          background: `${attr.color}22`,
                          border: `1px solid ${attr.color}44`,
                          color: attr.color,
                          cursor: 'pointer',
                        }}
                        whileHover={{ scale: 1.05, background: `${attr.color}33` }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleComplete(task)}
                      >
                        完成
                      </motion.button>
                    )}
                    {isDone && (
                      <span className="text-lg">✓</span>
                    )}
                  </div>
                </GlassCard>

                {/* Floating reward animation */}
                <AnimatePresence>
                  {pendingReward && (
                    <motion.div
                      key={pendingReward.id}
                      className="absolute right-4 top-0 pointer-events-none z-10 text-sm font-bold"
                      initial={{ opacity: 1, y: 0 }}
                      animate={{ opacity: 0, y: -50 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      style={{ color: '#FFD54F' }}
                    >
                      +{pendingReward.exp} EXP
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="py-8 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-sm">今天暂无任务</p>
            <p className="text-xs mt-1">前往任务中心创建新任务</p>
          </div>
        )}
      </div>
    </div>
  );
};
