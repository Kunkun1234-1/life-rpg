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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const completeTask = useTaskStore(s => s.completeTask);
  const completeSubtask = useTaskStore(s => s.completeSubtask);
  const updateTask = useTaskStore(s => s.updateTask);
  const deleteTask = useTaskStore(s => s.deleteTask);
  const addSubtask = useTaskStore(s => s.addSubtask);
  const removeSubtask = useTaskStore(s => s.removeSubtask);
  const updateSubtask = useTaskStore(s => s.updateSubtask);

  const attrInfo = ATTRIBUTE_MAP[task.element];
  const rarityConfig = RARITY_MAP[task.rarity];
  const statusInfo = STATUS_LABELS[task.status] ?? STATUS_LABELS.pending;
  const isActive = task.status === 'pending';

  const subtasks = task.subtasks ?? [];
  const completedSubtasks = subtasks.filter(s => s.status === 'completed').length;
  const hasSubtasks = (task.rarity === 4 || task.rarity === 5) && subtasks.length > 0;
  const canEditSubtasks = isActive && (task.rarity === 4 || task.rarity === 5);

  const handleCompleteSubtask = (subtaskId: string) => {
    completeSubtask(task.id, subtaskId);
  };

  const handleConfirmEditSubtask = (subtaskId: string) => {
    if (editingSubtaskTitle.trim()) {
      updateSubtask(task.id, subtaskId, editingSubtaskTitle.trim());
    }
    setEditingSubtaskId(null);
  };

  const handleConfirmAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      addSubtask(task.id, {
        title: newSubtaskTitle.trim(),
        element: task.element,
        rarity: 1,
        cycle: task.cycle,
        baseExp: Math.round(task.baseExp / 4),
        baseStardust: Math.round(task.baseStardust / 4),
        staminaCost: 0,
        parentTaskId: task.id,
      });
    }
    setNewSubtaskTitle('');
    setAddingSubtask(false);
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
                {(hasSubtasks || canEditSubtasks) && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest">子任务</h4>
                    {subtasks.map(subtask => (
                      <div
                        key={subtask.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5"
                        onClick={(e) => e.stopPropagation()}
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
                        {isActive && subtask.status !== 'completed' && editingSubtaskId === subtask.id ? (
                          <input
                            autoFocus
                            className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-0.5 text-sm text-white outline-none focus:border-white/40"
                            value={editingSubtaskTitle}
                            onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleConfirmEditSubtask(subtask.id);
                              else if (e.key === 'Escape') setEditingSubtaskId(null);
                            }}
                            onBlur={() => handleConfirmEditSubtask(subtask.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span
                            className={`text-sm flex-1 ${subtask.status === 'completed' ? 'line-through text-white/30' : isActive ? 'text-white/80 cursor-text' : 'text-white/80'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isActive && subtask.status !== 'completed') {
                                setEditingSubtaskId(subtask.id);
                                setEditingSubtaskTitle(subtask.title);
                              }
                            }}
                          >
                            {subtask.title}
                          </span>
                        )}
                        <span className="text-xs text-white/30 shrink-0">+{subtask.baseExp} EXP</span>
                        {isActive && subtask.status !== 'completed' && (
                          <button
                            className="text-white/30 hover:text-red-400 transition-colors text-sm w-4 h-4 flex items-center justify-center shrink-0 leading-none"
                            title="删除子任务"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSubtask(task.id, subtask.id);
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {/* Add subtask row */}
                    {canEditSubtasks && (
                      addingSubtask ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            autoFocus
                            className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white outline-none focus:border-white/40"
                            placeholder="输入子任务名称，回车确认..."
                            value={newSubtaskTitle}
                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleConfirmAddSubtask();
                              else if (e.key === 'Escape') {
                                setNewSubtaskTitle('');
                                setAddingSubtask(false);
                              }
                            }}
                            onBlur={handleConfirmAddSubtask}
                          />
                        </div>
                      ) : (
                        <button
                          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors py-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddingSubtask(true);
                          }}
                        >
                          <span className="text-base leading-none">+</span>
                          <span>添加子任务</span>
                        </button>
                      )
                    )}
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
                {task.status === 'completed' && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTask(task.id, { status: 'archived' });
                      }}
                    >
                      归档
                    </Button>
                  </div>
                )}

                {/* Delete button for daily/weekly recurring tasks */}
                {(task.cycle === 'daily' || task.cycle === 'weekly') && (
                  <div className="pt-1">
                    {!showDeleteConfirm ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <span className="text-red-400">删除任务</span>
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400">确认删除？此操作不可撤销</span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(task.id);
                          }}
                        >
                          <span className="text-red-400">确认</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(false);
                          }}
                        >
                          取消
                        </Button>
                      </div>
                    )}
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
