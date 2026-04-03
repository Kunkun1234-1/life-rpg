import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '../../stores/useTaskStore';
import { useMainlineStore } from '../../stores/useMainlineStore';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import { Button } from '../../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';
import type { AttributeKey } from '../../types';
import { ATTRIBUTES } from '../../lib/constants';

type FilterTab = 'active' | 'daily_weekly' | 'epic_legend' | 'mainline' | 'history';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'active', label: '进行中' },
  { key: 'daily_weekly', label: '周常日常' },
  { key: 'epic_legend', label: '史诗传说' },
  { key: 'mainline', label: '主线任务' },
  { key: 'history', label: '历史记录' },
];

const EMPTY_MESSAGES: Record<FilterTab, string> = {
  active: '暂无进行中的任务，点击「创建任务」开始冒险！',
  daily_weekly: '暂无日常或周常任务',
  epic_legend: '暂无史诗或传说级任务',
  mainline: '暂无主线任务，最多同时进行 3 条主线',
  history: '暂无历史记录',
};

interface CreateMainlineFormState {
  title: string;
  description: string;
  attributeKeys: AttributeKey[];
  completionCondition: string;
}

const defaultForm = (): CreateMainlineFormState => ({
  title: '',
  description: '',
  attributeKeys: [],
  completionCondition: '',
});

const TasksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMainlineForm, setShowMainlineForm] = useState(false);
  const [mainlineForm, setMainlineForm] = useState<CreateMainlineFormState>(defaultForm());
  const [expandedMainlines, setExpandedMainlines] = useState<Set<string>>(new Set());
  const [showFinished, setShowFinished] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedMainlines((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allTasks = useTaskStore((s) => s.tasks);
  const { mainlineQuests, createMainline, completeMainline, abandonMainline, getActiveMainlines } =
    useMainlineStore();

  const activeMainlines = getActiveMainlines();

  const filteredTasks =
    activeTab === 'active'
      ? [...allTasks.filter((t) => t.status === 'pending')].sort((a, b) => b.rarity - a.rarity)
      : activeTab === 'daily_weekly'
      ? allTasks.filter((t) => (t.cycle === 'daily' || t.cycle === 'weekly') && t.status !== 'archived')
      : activeTab === 'epic_legend'
      ? allTasks.filter((t) => t.rarity >= 4 && t.status !== 'archived')
      : activeTab === 'history'
      ? allTasks.filter((t) => t.status === 'completed' || t.status === 'archived')
      : [];

  const handleMainlineFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainlineForm.title.trim()) return;
    createMainline({
      title: mainlineForm.title.trim(),
      description: mainlineForm.description.trim(),
      attributeKeys: mainlineForm.attributeKeys,
      completionCondition: mainlineForm.completionCondition.trim() || undefined,
    });
    setMainlineForm(defaultForm());
    setShowMainlineForm(false);
  };

  const toggleAttrKey = (key: AttributeKey) => {
    setMainlineForm((prev) => ({
      ...prev,
      attributeKeys: prev.attributeKeys.includes(key)
        ? prev.attributeKeys.filter((k) => k !== key)
        : [...prev.attributeKeys, key],
    }));
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 100%)' }}
    >
      {/* Left Sidebar - Filter Tabs */}
      <div className="w-48 shrink-0 border-r border-white/5 p-4 space-y-1">
        <h2
          className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 mt-2 px-2"
          style={{ fontFamily: 'Noto Sans SC, sans-serif' }}
        >
          筛选
        </h2>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'text-yellow-300 bg-yellow-400/10 border border-yellow-400/20'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <motion.h1
            className="text-xl font-bold text-white"
            style={{ fontFamily: 'Noto Serif SC, serif' }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            任务中心
          </motion.h1>
          {activeTab === 'mainline' ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowMainlineForm(true)}
              disabled={activeMainlines.length >= 3}
            >
              + 创建主线
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
              + 创建任务
            </Button>
          )}
        </div>

        {/* Task list / Mainline list */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'mainline' ? (
            <div className="space-y-4 max-w-2xl">
              {/* Create Mainline Form */}
              <AnimatePresence>
                {showMainlineForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <GlassCard className="p-4">
                      <h3
                        className="text-sm font-bold text-white/80 mb-3"
                        style={{ fontFamily: 'Noto Serif SC, serif' }}
                      >
                        创建主线任务
                      </h3>
                      <form onSubmit={handleMainlineFormSubmit} className="space-y-3">
                        <input
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-yellow-400/50 transition-colors"
                          placeholder="主线名称 *"
                          value={mainlineForm.title}
                          onChange={(e) =>
                            setMainlineForm((prev) => ({ ...prev, title: e.target.value }))
                          }
                          required
                        />
                        <textarea
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-yellow-400/50 transition-colors resize-none"
                          placeholder="描述主线目标..."
                          rows={2}
                          value={mainlineForm.description}
                          onChange={(e) =>
                            setMainlineForm((prev) => ({ ...prev, description: e.target.value }))
                          }
                        />
                        <input
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-yellow-400/50 transition-colors"
                          placeholder="完成条件（可选）"
                          value={mainlineForm.completionCondition}
                          onChange={(e) =>
                            setMainlineForm((prev) => ({
                              ...prev,
                              completionCondition: e.target.value,
                            }))
                          }
                        />
                        {/* Attribute Keys */}
                        <div>
                          <p className="text-xs text-white/40 mb-2">关联属性（可多选）</p>
                          <div className="flex flex-wrap gap-2">
                            {ATTRIBUTES.map((attr) => (
                              <button
                                key={attr.key}
                                type="button"
                                className="px-2.5 py-1 rounded-md border text-xs font-medium transition-all"
                                style={
                                  mainlineForm.attributeKeys.includes(attr.key)
                                    ? {
                                        borderColor: attr.color,
                                        color: attr.color,
                                        background: `${attr.color}20`,
                                      }
                                    : { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }
                                }
                                onClick={() => toggleAttrKey(attr.key)}
                              >
                                {attr.emoji} {attr.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setShowMainlineForm(false);
                              setMainlineForm(defaultForm());
                            }}
                          >
                            取消
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            disabled={!mainlineForm.title.trim()}
                          >
                            创建
                          </Button>
                        </div>
                      </form>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Mainlines */}
              {activeMainlines.length === 0 && !showMainlineForm ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-20 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="text-5xl mb-4">🗺️</span>
                  <p className="text-white/40 text-sm">{EMPTY_MESSAGES.mainline}</p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {activeMainlines.map((mainline) => {
                    const linkedTasks = allTasks.filter((t) => t.mainlineId === mainline.id);
                    const completedCount = linkedTasks.filter(
                      (t) => t.status === 'completed'
                    ).length;
                    const isExpanded = expandedMainlines.has(mainline.id);

                    return (
                      <motion.div
                        key={mainline.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        layout
                      >
                        {/* Tree root node */}
                        <div className="relative pl-6">
                          {/* Vertical tree line */}
                          {isExpanded && linkedTasks.length > 0 && (
                            <div
                              className="absolute left-[11px] top-[40px] bottom-0 w-px bg-yellow-400/20"
                            />
                          )}

                          {/* Root node header */}
                          <div
                            className="relative flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all hover:bg-white/[0.04]"
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}
                            onClick={() => toggleExpand(mainline.id)}
                          >
                            {/* Expand arrow */}
                            <motion.span
                              className="text-yellow-400/60 text-xs mt-1 shrink-0 select-none"
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.15 }}
                              style={{ position: 'absolute', left: '-18px', top: '14px' }}
                            >
                              ▶
                            </motion.span>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h3
                                  className="text-base font-bold text-yellow-300 truncate"
                                  style={{ fontFamily: 'Noto Serif SC, serif' }}
                                >
                                  {mainline.title}
                                </h3>
                                <span className="text-xs text-white/25 shrink-0">
                                  ({completedCount}/{linkedTasks.length})
                                </span>
                              </div>
                              {mainline.description && (
                                <p className="text-xs text-white/50 line-clamp-1">
                                  {mainline.description}
                                </p>
                              )}
                              {mainline.completionCondition && (
                                <p className="text-xs text-blue-300/60 mt-0.5">
                                  完成条件：{mainline.completionCondition}
                                </p>
                              )}
                              {/* Attribute tags inline */}
                              {mainline.attributeKeys.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {mainline.attributeKeys.map((key) => {
                                    const attr = ATTRIBUTES.find((a) => a.key === key);
                                    return attr ? (
                                      <span
                                        key={key}
                                        className="text-[10px] px-1.5 py-0.5 rounded-full border"
                                        style={{
                                          borderColor: `${attr.color}30`,
                                          color: attr.color,
                                          background: `${attr.color}10`,
                                        }}
                                      >
                                        {attr.emoji} {attr.name}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                className="text-xs px-2 py-1 rounded-md bg-green-400/10 text-green-400 border border-green-400/20 hover:bg-green-400/20 transition-colors"
                                onClick={() => completeMainline(mainline.id)}
                              >
                                完成
                              </button>
                              <button
                                className="text-xs px-2 py-1 rounded-md bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 transition-colors"
                                onClick={() => abandonMainline(mainline.id)}
                              >
                                放弃
                              </button>
                            </div>
                          </div>

                          {/* Tree children — linked tasks */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-1 space-y-0">
                                  {linkedTasks.length === 0 ? (
                                    <div className="relative pl-6 py-2">
                                      <span
                                        className="absolute left-0 top-1/2 -translate-y-1/2 text-white/10 text-xs select-none"
                                        style={{ fontFamily: 'monospace' }}
                                      >
                                        └──
                                      </span>
                                      <span className="text-xs text-white/20 italic">
                                        暂无关联任务，创建任务时可关联此主线
                                      </span>
                                    </div>
                                  ) : (
                                    linkedTasks.map((t, idx) => {
                                      const isLast = idx === linkedTasks.length - 1;
                                      return (
                                        <div key={t.id} className="relative pl-6 py-1.5">
                                          <span
                                            className="absolute left-0 top-1/2 -translate-y-1/2 text-yellow-400/20 text-xs select-none"
                                            style={{ fontFamily: 'monospace' }}
                                          >
                                            {isLast ? '└──' : '├──'}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span
                                              className={`w-2 h-2 rounded-full shrink-0 ${
                                                t.status === 'completed'
                                                  ? 'bg-green-400'
                                                  : 'bg-white/20 ring-1 ring-white/10'
                                              }`}
                                            />
                                            <span
                                              className={`text-xs ${
                                                t.status === 'completed'
                                                  ? 'text-white/30 line-through'
                                                  : 'text-white/70'
                                              }`}
                                            >
                                              {t.title}
                                            </span>
                                            {t.rarity >= 4 && (
                                              <span className="text-[10px] text-yellow-400/50">
                                                {'★'.repeat(t.rarity)}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Completed/Abandoned mainlines — collapsible */}
              {mainlineQuests.filter((q) => q.status !== 'active').length > 0 && (
                <div className="mt-4">
                  <button
                    className="flex items-center gap-2 text-xs text-white/30 hover:text-white/50 transition-colors py-2"
                    onClick={() => setShowFinished((v) => !v)}
                  >
                    <motion.span
                      animate={{ rotate: showFinished ? 90 : 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-[10px]"
                    >
                      ▶
                    </motion.span>
                    已结束的主线（{mainlineQuests.filter((q) => q.status !== 'active').length}）
                  </button>
                  <AnimatePresence>
                    {showFinished && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1.5 pl-4 border-l border-white/5">
                          {mainlineQuests
                            .filter((q) => q.status !== 'active')
                            .map((q) => (
                              <div
                                key={q.id}
                                className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5"
                              >
                                <span className="text-sm text-white/40">{q.title}</span>
                                <span
                                  className={`text-xs ${
                                    q.status === 'completed' ? 'text-green-400/60' : 'text-white/25'
                                  }`}
                                >
                                  {q.status === 'completed' ? '已完成' : '已放弃'}
                                </span>
                              </div>
                            ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ) : filteredTasks.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-5xl mb-4">📋</span>
              <p className="text-white/40 text-sm">{EMPTY_MESSAGES[activeTab]}</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <CreateTaskModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
};

export default TasksPage;
