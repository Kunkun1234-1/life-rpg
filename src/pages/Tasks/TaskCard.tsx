import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task } from '../../types';
import { ATTRIBUTE_MAP, RARITY_MAP } from '../../lib/constants';
import { useTaskStore } from '../../stores/useTaskStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';

interface TaskCardProps {
  task: Task;
}

const RARITY_GLOW: Record<number, string> = {
  1: 'shadow-none',
  2: 'shadow-[0_0_12px_rgba(100,181,246,0.25)]',
  3: 'shadow-[0_0_16px_rgba(206,147,216,0.3)]',
  4: 'shadow-[0_0_20px_rgba(255,213,79,0.35)]',
  5: 'shadow-[0_0_24px_rgba(255,112,67,0.4)]',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: '进行中', color: 'text-blue-300 bg-blue-500/20' },
  completed: { label: '已完成', color: 'text-green-300 bg-green-500/20' },
  archived: { label: '已归档', color: 'text-white/40 bg-white/10' },
  failed: { label: '已失败', color: 'text-red-300 bg-red-500/20' },
};

const StarRating: React.FC<{ rarity: number }> = ({ rarity }) => {
  const config = RARITY_MAP[rarity];
  return (
    <span className="text-xs" style={{ color: config.color }}>
      {config.stars}
    </span>
  );
};

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [expanded, setExpanded] = useState(false);
  const completeTask = useTaskStore(s => s.completeTask);
  const completeSubtask = useTaskStore(s => s.completeSubtask);

  const attrInfo = ATTRIBUTE_MAP[task.element];
  const rarityConfig = RARITY_MAP[task.rarity];
  const statusInfo = STATUS_LABELS[task.status] ?? STATUS_LABELS.pending;
  const isActive = task.status === 'pending';

  const subtasks = task.subtasks ?? [];
  const completedSubtasks = subtasks.filter(s => s.status === 'completed').length;
  const hasSubtasks = (task.rarity === 4 || task.rarity === 5) && subtasks.length > 0;

  const handleCompleteSubtask = (subtaskId: string) => {
    completeSubtask(task.id, subtaskId);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <GlassCard
        className={`overflow-hidden cursor-pointer transition-all duration-200 hover:border-white/20 ${RARITY_GLOW[task.rarity]}`}
        style={{ borderColor: `${rarityConfig.color}30` } as React.CSSProperties}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Top accent bar */}
        <div className="h-0.5 w-full" style={{ background: rarityConfig.color }} />

        <div className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg shrink-0">{attrInfo.emoji}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <StarRating rarity={task.rarity} />
                  <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ color: rarityConfig.color, background: `${rarityConfig.color}20` }}>
                    {rarityConfig.label}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mt-1 leading-snug">{task.title}</h3>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <span className="text-white/30 text-xs">{expanded ? '▲' : '▼'}</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-3 text-xs text-white/50">
            <span>EXP <span className="text-yellow-300 font-medium">{task.baseExp}</span></span>
            <span>·</span>
            <span>星尘 <span className="text-blue-300 font-medium">{task.baseStardust}</span></span>
            <span>·</span>
            <span>体力 <span className="text-green-300 font-medium">{task.staminaCost}</span></span>
            {task.isFirstCompletion && (
              <>
                <span>·</span>
                <span className="text-yellow-300 font-bold">首次×2</span>
              </>
            )}
          </div>

          {/* Subtask progress bar (for rarity 4-5) */}
          {hasSubtasks && (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs text-white/40">
                <span>子任务进度</span>
                <span>{completedSubtasks}/{subtasks.length}</span>
              </div>
              <ProgressBar
                value={subtasks.length > 0 ? completedSubtasks / subtasks.length : 0}
                color={rarityConfig.color}
              />
            </div>
          )}
        </div>

        {/* Expandable section */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-white/5 p-4 space-y-4">
                {/* Description */}
                {task.description && (
                  <p className="text-sm text-white/60 leading-relaxed">{task.description}</p>
                )}

                {/* Deadline */}
                {task.deadline && (
                  <p className="text-xs text-white/40">截止日期: {task.deadline}</p>
                )}

                {/* Subtask list */}
                {hasSubtasks && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest">子任务</h4>
                    {subtasks.map(subtask => (
                      <div
                        key={subtask.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5"
                      >
                        <button
                          className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                            subtask.status === 'completed'
                              ? 'bg-green-500 border-green-500'
                              : 'border-white/30 hover:border-white/60'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (subtask.status !== 'completed') handleCompleteSubtask(subtask.id);
                          }}
                        >
                          {subtask.status === 'completed' && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </button>
                        <span className={`text-sm flex-1 ${subtask.status === 'completed' ? 'line-through text-white/30' : 'text-white/80'}`}>
                          {subtask.title}
                        </span>
                        <span className="text-xs text-white/30">+{subtask.baseExp} EXP</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                {isActive && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        completeTask(task.id, false);
                      }}
                    >
                      完成任务
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        completeTask(task.id, true);
                      }}
                    >
                      超额完成 ×1.5
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
};

export default TaskCard;
