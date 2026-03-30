import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrincipleStore } from '../../stores/usePrincipleStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useTaskStore } from '../../stores/useTaskStore';
import { useAchievementStore } from '../../stores/useAchievementStore';
import { SYSTEM_PRINCIPLES, ATTRIBUTES } from '../../lib/constants';
import { getAttributeLevel } from '../../lib/gameFormulas';
import { GlassCard } from '../../components/ui/GlassCard';
import type { Principle, DecisionLog, Goal, GoalType, AttributeKey, FiveStepFlow } from '../../types';

type PrincipleTab = 'fivestep' | 'tree' | 'my' | 'logs' | 'goals' | 'review';

const TAB_LIST: { key: PrincipleTab; label: string; icon: string }[] = [
  { key: 'fivestep', label: '五步法', icon: '🔄' },
  { key: 'tree', label: '决策树', icon: '🌳' },
  { key: 'my', label: '我的原则', icon: '📜' },
  { key: 'logs', label: '决策日志', icon: '📝' },
  { key: 'goals', label: '目标设定', icon: '🎯' },
  { key: 'review', label: '回顾报告', icon: '📊' },
];

// ============================================================
// Shared UI helpers
// ============================================================
const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  colorScheme: 'dark',
};

const goldBtnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #FFD54F, #FFB300)',
  color: '#1a0a00',
};

const blueBtnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #64B5F6, #1976D2)',
  color: '#fff',
};

const cancelBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  color: 'rgba(255,255,255,0.5)',
};

const SOURCE_TYPES = ['直觉推导', '逻辑论证', '经验总结', '他人建议'];
const BASIS_TYPES: { value: string; label: string }[] = [
  { value: 'intuition', label: '直觉' },
  { value: 'principle', label: '某条原则' },
  { value: 'logic', label: '逻辑推导' },
  { value: 'experience', label: '经验' },
];

const ConfidenceStars: React.FC<{ value: number; onChange?: (v: number) => void; readonly?: boolean }> = ({ value, onChange, readonly }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(star => (
      <span
        key={star}
        className={`text-sm ${readonly ? '' : 'cursor-pointer'} transition-colors`}
        style={{ color: star <= value ? '#FFD54F' : 'rgba(255,255,255,0.15)' }}
        onClick={() => !readonly && onChange?.(star)}
      >
        ★
      </span>
    ))}
  </div>
);

const AttrToggleGroup: React.FC<{ selected: AttributeKey[]; onChange: (keys: AttributeKey[]) => void }> = ({ selected, onChange }) => (
  <div className="flex flex-wrap gap-1">
    {ATTRIBUTES.map(attr => (
      <button key={attr.key}
        onClick={() => onChange(
          selected.includes(attr.key)
            ? selected.filter(k => k !== attr.key)
            : [...selected, attr.key]
        )}
        className="text-xs px-2 py-1 rounded-full transition-all"
        style={{
          background: selected.includes(attr.key) ? `${attr.color}33` : 'rgba(255,255,255,0.06)',
          color: selected.includes(attr.key) ? attr.color : 'rgba(255,255,255,0.4)',
          border: selected.includes(attr.key) ? `1px solid ${attr.color}66` : '1px solid transparent',
        }}>
        {attr.emoji} {attr.name}
      </button>
    ))}
  </div>
);

const ModalOverlay: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ background: 'rgba(0,0,0,0.7)' }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    {children}
  </motion.div>
);

// ============================================================
// Tab 1: 五步法 (Five-Step Process)
// ============================================================
const STEP_CONFIG = [
  { num: 1, title: '设定目标', icon: '🎯', question: '你想要什么？', color: '#FFD54F' },
  { num: 2, title: '识别问题', icon: '⚠️', question: '什么阻碍了你？', color: '#FF6B6B' },
  { num: 3, title: '诊断根因', icon: '🔍', question: '为什么会有这个问题？', color: '#64B5F6' },
  { num: 4, title: '设计方案', icon: '💡', question: '你打算怎么解决？', color: '#81C784' },
  { num: 5, title: '执行到底', icon: '🚀', question: '坚持执行方案', color: '#CE93D8' },
];

const EMPTY_FLOW: Omit<FiveStepFlow, 'id' | 'createdAt' | 'updatedAt'> = {
  userId: 'local',
  title: '',
  goal: '',
  problems: [''],
  diagnosis: { intuition: '', logic: '', rootCause: '' },
  solutions: [{ description: '', chosen: false }],
  execution: { status: 'planning', notes: '' },
  attributeKeys: [],
};

const EXEC_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  planning: { label: '规划中', color: '#64B5F6' },
  executing: { label: '执行中', color: '#FFD54F' },
  reviewing: { label: '复盘中', color: '#CE93D8' },
  completed: { label: '已完成', color: '#81C784' },
};

const FiveStepTab: React.FC = () => {
  const { fiveStepFlows, addFiveStepFlow, updateFiveStepFlow, deleteFiveStepFlow, goals } = usePrincipleStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FiveStepFlow | null>(null);
  const [form, setForm] = useState<Omit<FiveStepFlow, 'id' | 'createdAt' | 'updatedAt'>>(EMPTY_FLOW);
  const [expandedStep, setExpandedStep] = useState<number>(1);
  const [viewFlow, setViewFlow] = useState<FiveStepFlow | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FLOW);
    setExpandedStep(1);
    setShowForm(true);
  };

  const openEdit = (flow: FiveStepFlow) => {
    setEditing(flow);
    setForm({
      userId: flow.userId,
      title: flow.title,
      goal: flow.goal,
      problems: flow.problems.length > 0 ? flow.problems : [''],
      diagnosis: { ...flow.diagnosis },
      solutions: flow.solutions.length > 0 ? flow.solutions.map(s => ({ ...s })) : [{ description: '', chosen: false }],
      execution: { ...flow.execution },
      extractedPrincipleId: flow.extractedPrincipleId,
      attributeKeys: [...flow.attributeKeys],
    });
    setExpandedStep(1);
    setShowForm(true);
  };

  const save = () => {
    if (!form.title.trim() || !form.goal.trim()) return;
    const cleaned = {
      ...form,
      problems: form.problems.filter(p => p.trim()),
      solutions: form.solutions.filter(s => s.description.trim()),
    };
    if (editing) updateFiveStepFlow(editing.id, cleaned);
    else addFiveStepFlow(cleaned);
    setShowForm(false);
  };

  const activeGoals = goals.filter(g => g.status === 'active');

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white/70">达利欧五步决策法</h2>
            <p className="text-xs text-white/30 mt-1">目标 → 问题 → 根因 → 方案 → 执行</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowSidebar(!showSidebar)}
              className="text-xs px-3 py-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {showSidebar ? '隐藏' : '系统'}原则
            </button>
            <button onClick={openAdd} className="text-sm px-4 py-2 rounded-lg font-semibold" style={goldBtnStyle}>
              + 新建流程
            </button>
          </div>
        </div>

        {/* Existing flows */}
        {fiveStepFlows.length === 0 && !showForm && (
          <GlassCard className="p-8 text-center">
            <p className="text-white/30 text-sm mb-3">暂无五步法流程记录</p>
            <p className="text-white/20 text-xs">点击「新建流程」开始你的第一次系统化决策</p>
          </GlassCard>
        )}

        <div className="flex flex-col gap-3">
          {fiveStepFlows.map(flow => {
            const statusInfo = EXEC_STATUS_LABELS[flow.execution.status] || EXEC_STATUS_LABELS.planning;
            return (
              <GlassCard key={flow.id} className="p-4 cursor-pointer" onClick={() => setViewFlow(flow)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-white truncate">{flow.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: `${statusInfo.color}22`, color: statusInfo.color }}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 mb-2">🎯 {flow.goal}</p>
                    <div className="flex gap-3 text-xs text-white/30">
                      <span>⚠️ {flow.problems.filter(p => p).length} 个问题</span>
                      <span>💡 {flow.solutions.filter(s => s.description).length} 个方案</span>
                      <span>{flow.createdAt.slice(0, 10)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(flow)} className="text-white/30 hover:text-white text-xs p-1">✏</button>
                    <button onClick={() => deleteFiveStepFlow(flow.id)} className="text-white/30 hover:text-red-400 text-xs p-1">✕</button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* View flow detail modal */}
        <AnimatePresence>
          {viewFlow && (
            <ModalOverlay onClose={() => setViewFlow(null)}>
              <motion.div
                className="rounded-xl p-6 w-[600px] max-h-[85vh] overflow-y-auto"
                style={{ background: '#1a1030', border: '1px solid rgba(255,255,255,0.1)' }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <h3 className="text-lg font-bold text-white mb-4">{viewFlow.title}</h3>
                <div className="flex flex-col gap-0">
                  {STEP_CONFIG.map((step, idx) => (
                    <div key={step.num} className="relative">
                      {idx < STEP_CONFIG.length - 1 && (
                        <div className="absolute left-4 top-10 w-0.5 h-full" style={{ background: `${step.color}33` }} />
                      )}
                      <div className="flex items-start gap-3 pb-4">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold z-10"
                          style={{ background: `${step.color}22`, color: step.color, border: `2px solid ${step.color}55` }}>
                          {step.num}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold mb-1" style={{ color: step.color }}>
                            {step.icon} {step.title}
                          </h4>
                          {step.num === 1 && <p className="text-xs text-white/70">{viewFlow.goal}</p>}
                          {step.num === 2 && viewFlow.problems.filter(p => p).map((p, i) => (
                            <p key={i} className="text-xs text-white/70">• {p}</p>
                          ))}
                          {step.num === 3 && (
                            <div className="flex flex-col gap-1">
                              {viewFlow.diagnosis.intuition && (
                                <p className="text-xs"><span className="text-white/40">直觉：</span><span className="text-white/70">{viewFlow.diagnosis.intuition}</span></p>
                              )}
                              {viewFlow.diagnosis.logic && (
                                <p className="text-xs"><span className="text-white/40">逻辑：</span><span className="text-white/70">{viewFlow.diagnosis.logic}</span></p>
                              )}
                              {viewFlow.diagnosis.rootCause && (
                                <p className="text-xs"><span className="text-white/40">根因：</span><span className="text-white/70">{viewFlow.diagnosis.rootCause}</span></p>
                              )}
                            </div>
                          )}
                          {step.num === 4 && viewFlow.solutions.filter(s => s.description).map((s, i) => (
                            <p key={i} className="text-xs text-white/70">
                              {s.chosen ? '✅' : '○'} {s.description}
                            </p>
                          ))}
                          {step.num === 5 && (
                            <div>
                              <span className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: `${(EXEC_STATUS_LABELS[viewFlow.execution.status] || EXEC_STATUS_LABELS.planning).color}22`, color: (EXEC_STATUS_LABELS[viewFlow.execution.status] || EXEC_STATUS_LABELS.planning).color }}>
                                {(EXEC_STATUS_LABELS[viewFlow.execution.status] || EXEC_STATUS_LABELS.planning).label}
                              </span>
                              {viewFlow.execution.notes && <p className="text-xs text-white/70 mt-1">{viewFlow.execution.notes}</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-2">
                  <button onClick={() => setViewFlow(null)} className="px-4 py-2 rounded-lg text-sm" style={cancelBtnStyle}>关闭</button>
                </div>
              </motion.div>
            </ModalOverlay>
          )}
        </AnimatePresence>

        {/* Create/Edit form modal */}
        <AnimatePresence>
          {showForm && (
            <ModalOverlay onClose={() => setShowForm(false)}>
              <motion.div
                className="rounded-xl p-5 w-[580px] max-h-[90vh] overflow-y-auto flex flex-col gap-4"
                style={{ background: '#1a1030', border: '1px solid rgba(255,255,255,0.1)' }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <h3 className="text-base font-bold text-white">{editing ? '编辑五步法流程' : '新建五步法流程'}</h3>

                {/* Title */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">流程标题</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="rounded-lg px-3 py-2 text-sm text-white outline-none" style={inputStyle}
                    placeholder="给这次决策流程起个名字" />
                </div>

                {/* Steps as vertical stepper */}
                {STEP_CONFIG.map((step, idx) => {
                  const isExpanded = expandedStep === step.num;
                  return (
                    <div key={step.num} className="relative">
                      {idx < STEP_CONFIG.length - 1 && (
                        <div className="absolute left-3.5 top-9 w-0.5" style={{ background: `${step.color}22`, height: isExpanded ? 'calc(100% - 20px)' : '20px' }} />
                      )}
                      <div
                        className="flex items-center gap-3 cursor-pointer mb-2"
                        onClick={() => setExpandedStep(isExpanded ? 0 : step.num)}
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold z-10"
                          style={{ background: `${step.color}22`, color: step.color, border: `2px solid ${step.color}55` }}>
                          {step.num}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: step.color }}>
                          {step.icon} {step.title}
                        </span>
                        <span className="text-xs text-white/30 ml-auto">{step.question}</span>
                        <span className="text-white/30 text-xs">{isExpanded ? '▼' : '▶'}</span>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            className="ml-10 flex flex-col gap-2"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {/* Step 1: Goal */}
                            {step.num === 1 && (
                              <>
                                <textarea value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
                                  className="rounded-lg px-3 py-2 text-sm text-white outline-none resize-none" style={inputStyle}
                                  placeholder="描述你的目标..." rows={2} />
                                {activeGoals.length > 0 && (
                                  <div className="flex flex-col gap-1">
                                    <span className="text-xs text-white/30">快速选择现有目标：</span>
                                    <div className="flex flex-wrap gap-1">
                                      {activeGoals.map(g => (
                                        <button key={g.id} onClick={() => setForm(f => ({ ...f, goal: g.title }))}
                                          className="text-xs px-2 py-1 rounded-lg"
                                          style={{ background: 'rgba(255,213,79,0.1)', color: '#FFD54F', border: '1px solid rgba(255,213,79,0.2)' }}>
                                          {g.title}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Step 2: Problems */}
                            {step.num === 2 && (
                              <>
                                {form.problems.map((problem, i) => (
                                  <div key={i} className="flex gap-2">
                                    <input value={problem}
                                      onChange={e => {
                                        const newProblems = [...form.problems];
                                        newProblems[i] = e.target.value;
                                        setForm(f => ({ ...f, problems: newProblems }));
                                      }}
                                      className="flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none" style={inputStyle}
                                      placeholder={`问题 ${i + 1}`} />
                                    {form.problems.length > 1 && (
                                      <button onClick={() => setForm(f => ({ ...f, problems: f.problems.filter((_, j) => j !== i) }))}
                                        className="text-white/30 hover:text-red-400 text-xs px-2">✕</button>
                                    )}
                                  </div>
                                ))}
                                <button onClick={() => setForm(f => ({ ...f, problems: [...f.problems, ''] }))}
                                  className="text-xs text-white/40 hover:text-white/60 self-start">+ 添加问题</button>
                              </>
                            )}

                            {/* Step 3: Diagnosis */}
                            {step.num === 3 && (
                              <>
                                <div className="flex flex-col gap-1">
                                  <label className="text-xs text-white/40">直觉判断 — 你的第一反应</label>
                                  <textarea value={form.diagnosis.intuition}
                                    onChange={e => setForm(f => ({ ...f, diagnosis: { ...f.diagnosis, intuition: e.target.value } }))}
                                    className="rounded-lg px-3 py-2 text-sm text-white outline-none resize-none" style={inputStyle}
                                    placeholder="直觉告诉你..." rows={2} />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-xs text-white/40">逻辑推导 — 理性分析</label>
                                  <textarea value={form.diagnosis.logic}
                                    onChange={e => setForm(f => ({ ...f, diagnosis: { ...f.diagnosis, logic: e.target.value } }))}
                                    className="rounded-lg px-3 py-2 text-sm text-white outline-none resize-none" style={inputStyle}
                                    placeholder="逻辑分析后..." rows={2} />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-xs text-white/40">根本原因</label>
                                  <textarea value={form.diagnosis.rootCause}
                                    onChange={e => setForm(f => ({ ...f, diagnosis: { ...f.diagnosis, rootCause: e.target.value } }))}
                                    className="rounded-lg px-3 py-2 text-sm text-white outline-none resize-none" style={inputStyle}
                                    placeholder="根本原因是..." rows={2} />
                                </div>
                              </>
                            )}

                            {/* Step 4: Solutions */}
                            {step.num === 4 && (
                              <>
                                {form.solutions.map((sol, i) => (
                                  <div key={i} className="flex gap-2 items-center">
                                    <button
                                      onClick={() => {
                                        const newSolutions = form.solutions.map((s, j) => ({ ...s, chosen: j === i }));
                                        setForm(f => ({ ...f, solutions: newSolutions }));
                                      }}
                                      className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center"
                                      style={{ borderColor: sol.chosen ? '#81C784' : 'rgba(255,255,255,0.2)' }}>
                                      {sol.chosen && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#81C784' }} />}
                                    </button>
                                    <input value={sol.description}
                                      onChange={e => {
                                        const newSolutions = [...form.solutions];
                                        newSolutions[i] = { ...newSolutions[i], description: e.target.value };
                                        setForm(f => ({ ...f, solutions: newSolutions }));
                                      }}
                                      className="flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none" style={inputStyle}
                                      placeholder={`方案 ${i + 1}`} />
                                    {form.solutions.length > 1 && (
                                      <button onClick={() => setForm(f => ({ ...f, solutions: f.solutions.filter((_, j) => j !== i) }))}
                                        className="text-white/30 hover:text-red-400 text-xs px-2">✕</button>
                                    )}
                                  </div>
                                ))}
                                <button onClick={() => setForm(f => ({ ...f, solutions: [...f.solutions, { description: '', chosen: false }] }))}
                                  className="text-xs text-white/40 hover:text-white/60 self-start">+ 添加方案</button>
                              </>
                            )}

                            {/* Step 5: Execution */}
                            {step.num === 5 && (
                              <>
                                <div className="flex flex-col gap-1">
                                  <label className="text-xs text-white/40">执行状态</label>
                                  <div className="flex gap-2">
                                    {Object.entries(EXEC_STATUS_LABELS).map(([key, info]) => (
                                      <button key={key}
                                        onClick={() => setForm(f => ({ ...f, execution: { ...f.execution, status: key as FiveStepFlow['execution']['status'] } }))}
                                        className="text-xs px-3 py-1.5 rounded-lg transition-all"
                                        style={{
                                          background: form.execution.status === key ? `${info.color}22` : 'rgba(255,255,255,0.04)',
                                          color: form.execution.status === key ? info.color : 'rgba(255,255,255,0.3)',
                                          border: `1px solid ${form.execution.status === key ? `${info.color}44` : 'rgba(255,255,255,0.06)'}`,
                                        }}>
                                        {info.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <textarea value={form.execution.notes}
                                  onChange={e => setForm(f => ({ ...f, execution: { ...f.execution, notes: e.target.value } }))}
                                  className="rounded-lg px-3 py-2 text-sm text-white outline-none resize-none" style={inputStyle}
                                  placeholder="执行笔记..." rows={2} />
                              </>
                            )}

                            <div className="pb-2" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {/* Attributes */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">相关属性</label>
                  <AttrToggleGroup selected={form.attributeKeys} onChange={keys => setForm(f => ({ ...f, attributeKeys: keys }))} />
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-1">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg text-sm" style={cancelBtnStyle}>取消</button>
                  <button onClick={save} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={goldBtnStyle}>保存</button>
                </div>
              </motion.div>
            </ModalOverlay>
          )}
        </AnimatePresence>
      </div>

      {/* System principles sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            className="w-64 shrink-0"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-4" style={{ border: '1px solid rgba(255,213,79,0.15)' }}>
              <h3 className="text-sm font-bold mb-3" style={{ color: '#FFD54F' }}>系统原则</h3>
              <div className="flex flex-col gap-3">
                {SYSTEM_PRINCIPLES.map((p, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold shrink-0" style={{ color: '#FFD54F' }}>{i + 1}</span>
                      <div>
                        <h4 className="text-xs font-bold text-white">{p.title}</h4>
                        <p className="text-xs text-white/40 mt-0.5">{p.summary}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// Tab 2: 决策树 (Decision Tree)
// ============================================================
const DecisionTreeTab: React.FC = () => {
  const { principles } = usePrincipleStore();
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);
  const [expandedPrinciple, setExpandedPrinciple] = useState<string | null>(null);

  // Group principles by attribute
  const grouped: Record<string, Principle[]> = {};
  const ungrouped: Principle[] = [];

  principles.forEach(p => {
    if (p.attributeKeys.length === 0) {
      ungrouped.push(p);
    } else {
      p.attributeKeys.forEach(key => {
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(p);
      });
    }
  });

  if (ungrouped.length > 0) {
    grouped['_general'] = ungrouped;
  }

  const attrBranches = Object.entries(grouped);

  if (principles.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-white/30 text-sm mb-2">暂无原则，决策树为空</p>
        <p className="text-white/20 text-xs">前往「我的原则」添加原则后，决策树会自动生成</p>
      </GlassCard>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-sm font-bold text-white/70">决策树可视化</h2>
        <p className="text-xs text-white/30 mt-1">基于你的原则自动生成，按属性分支展示</p>
      </div>

      {/* Root node */}
      <div className="flex items-center gap-2 mb-3 ml-2">
        <div className="w-3 h-3 rounded-full" style={{ background: '#FFD54F' }} />
        <span className="text-sm font-bold text-white">遇到决策时</span>
      </div>

      {/* Branches */}
      <div className="ml-4 flex flex-col gap-1">
        {attrBranches.map(([key, items]) => {
          const attr = key === '_general' ? null : ATTRIBUTES.find(a => a.key === key);
          const branchColor = attr ? attr.color : '#9E9E9E';
          const branchLabel = attr ? `${attr.emoji} ${attr.name}` : '通用原则';
          const isExpanded = expandedBranch === key;
          // Deduplicate principles within the branch
          const uniqueItems = items.filter((item, idx) => items.findIndex(i => i.id === item.id) === idx);

          return (
            <div key={key}>
              {/* Branch header */}
              <div
                className="flex items-center gap-2 py-1.5 px-3 rounded-lg cursor-pointer transition-all"
                style={{
                  background: isExpanded ? `${branchColor}11` : 'transparent',
                  borderLeft: `3px solid ${branchColor}`,
                }}
                onClick={() => setExpandedBranch(isExpanded ? null : key)}
              >
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{isExpanded ? '▼' : '▶'}</span>
                <span className="text-sm font-semibold" style={{ color: branchColor }}>{branchLabel}</span>
                <span className="text-xs text-white/30 ml-auto">{uniqueItems.length} 条原则</span>
              </div>

              {/* Leaves */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className="ml-6 flex flex-col gap-1 py-1"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {uniqueItems.map(p => {
                      const isPrincipleExpanded = expandedPrinciple === p.id;
                      return (
                        <div key={p.id}>
                          <div
                            className="flex items-start gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all hover:bg-white/[0.03]"
                            style={{ borderLeft: `2px solid ${branchColor}44` }}
                            onClick={() => setExpandedPrinciple(isPrincipleExpanded ? null : p.id)}
                          >
                            <span className="text-xs mt-0.5" style={{ color: branchColor }}>├</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-white/70">
                                当 <span className="text-white/90">{p.scenario}</span>
                              </p>
                              <p className="text-xs text-white/50 mt-0.5">
                                → <span style={{ color: branchColor }}>{p.action}</span>
                              </p>
                            </div>
                          </div>

                          <AnimatePresence>
                            {isPrincipleExpanded && (
                              <motion.div
                                className="ml-8 px-3 py-2 rounded-lg mb-1"
                                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${branchColor}22` }}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                              >
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/30">置信度:</span>
                                    <ConfidenceStars value={p.confidence ?? 3} readonly />
                                  </div>
                                  {p.sourceType && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-white/30">来源:</span>
                                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${branchColor}15`, color: branchColor }}>
                                        {p.sourceType}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/30">验证次数:</span>
                                    <span className="text-xs text-white/60">{p.verificationCount ?? 0} 次</span>
                                  </div>
                                  {p.notes && (
                                    <div>
                                      <span className="text-xs text-white/30">笔记:</span>
                                      <p className="text-xs text-white/50 mt-0.5">{p.notes}</p>
                                    </div>
                                  )}
                                  <div className="text-xs text-white/20 mt-1">创建于 {p.createdAt.slice(0, 10)}</div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// Tab 3: 我的原则 (Enhanced)
// ============================================================
const EMPTY_PRINCIPLE: Omit<Principle, 'id' | 'createdAt' | 'updatedAt'> = {
  userId: 'local',
  scenario: '',
  action: '',
  attributeKeys: [],
  confidence: 3,
  sourceType: '',
  verificationCount: 0,
  notes: '',
};

const MyPrinciplesTab: React.FC = () => {
  const { principles, addPrinciple, updatePrinciple, deletePrinciple } = usePrincipleStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Principle | null>(null);
  const [form, setForm] = useState<Omit<Principle, 'id' | 'createdAt' | 'updatedAt'>>(EMPTY_PRINCIPLE);

  const openAdd = () => { setEditing(null); setForm(EMPTY_PRINCIPLE); setShowForm(true); };
  const openEdit = (p: Principle) => {
    setEditing(p);
    setForm({
      userId: p.userId,
      scenario: p.scenario,
      action: p.action,
      attributeKeys: p.attributeKeys,
      sourceLogId: p.sourceLogId,
      confidence: p.confidence ?? 3,
      sourceType: p.sourceType ?? '',
      verificationCount: p.verificationCount ?? 0,
      notes: p.notes ?? '',
    });
    setShowForm(true);
  };
  const save = () => {
    if (!form.scenario.trim() || !form.action.trim()) return;
    if (editing) updatePrinciple(editing.id, form);
    else addPrinciple(form);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-white/70">我的原则库</h2>
          <p className="text-xs text-white/30 mt-1">共 {principles.length} 条原则</p>
        </div>
        <button onClick={openAdd} className="text-sm px-4 py-2 rounded-lg font-semibold" style={goldBtnStyle}>
          + 添加原则
        </button>
      </div>

      {principles.length === 0 && !showForm && (
        <GlassCard className="p-8 text-center">
          <p className="text-white/30 text-sm">暂无个人原则，点击添加</p>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {principles.map((p) => {
          const mainAttr = p.attributeKeys.length > 0 ? ATTRIBUTES.find(a => a.key === p.attributeKeys[0]) : null;
          const borderColor = mainAttr ? mainAttr.color : 'rgba(255,255,255,0.08)';
          return (
            <GlassCard key={p.id} className="p-4" style={{ borderLeft: `3px solid ${borderColor}` }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/50 mb-0.5">当 <span className="text-white/80">{p.scenario}</span></p>
                  <p className="text-xs text-white/50">则 <span className="text-white/90 font-semibold">{p.action}</span></p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => {
                    updatePrinciple(p.id, { verificationCount: (p.verificationCount ?? 0) + 1 });
                  }} className="text-white/30 hover:text-green-400 text-xs p-1" title="验证+1">✓</button>
                  <button onClick={() => openEdit(p)} className="text-white/30 hover:text-white text-xs p-1">✏</button>
                  <button onClick={() => deletePrinciple(p.id)} className="text-white/30 hover:text-red-400 text-xs p-1">✕</button>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <ConfidenceStars value={p.confidence ?? 3} readonly />
                {p.sourceType && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(100,181,246,0.12)', color: '#64B5F6' }}>
                    {p.sourceType}
                  </span>
                )}
                <span className="text-xs text-white/30">验证 {p.verificationCount ?? 0} 次</span>
              </div>

              {p.attributeKeys.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {p.attributeKeys.map(key => {
                    const attr = ATTRIBUTES.find(a => a.key === key);
                    return attr ? (
                      <span key={key} className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: `${attr.color}22`, color: attr.color }}>
                        {attr.emoji} {attr.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {p.notes && <p className="text-xs text-white/30 mt-2 italic">{p.notes}</p>}
            </GlassCard>
          );
        })}
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <ModalOverlay onClose={() => setShowForm(false)}>
            <motion.div
              className="rounded-xl p-5 w-[440px] flex flex-col gap-3 max-h-[90vh] overflow-y-auto"
              style={{ background: '#1a1030', border: '1px solid rgba(255,255,255,0.1)' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-base font-bold text-white">{editing ? '编辑原则' : '添加原则'}</h3>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">当... (场景)</label>
                <input value={form.scenario} onChange={e => setForm(f => ({ ...f, scenario: e.target.value }))}
                  className="rounded-lg px-3 py-2 text-sm text-white outline-none" style={inputStyle}
                  placeholder="描述触发场景" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">则... (行动)</label>
                <input value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
                  className="rounded-lg px-3 py-2 text-sm text-white outline-none" style={inputStyle}
                  placeholder="描述应对行动" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">置信度</label>
                <ConfidenceStars value={form.confidence ?? 3} onChange={v => setForm(f => ({ ...f, confidence: v }))} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">来源类型</label>
                <div className="flex flex-wrap gap-1">
                  {SOURCE_TYPES.map(st => (
                    <button key={st}
                      onClick={() => setForm(f => ({ ...f, sourceType: f.sourceType === st ? '' : st }))}
                      className="text-xs px-2 py-1 rounded-lg transition-all"
                      style={{
                        background: form.sourceType === st ? 'rgba(100,181,246,0.2)' : 'rgba(255,255,255,0.04)',
                        color: form.sourceType === st ? '#64B5F6' : 'rgba(255,255,255,0.4)',
                        border: `1px solid ${form.sourceType === st ? 'rgba(100,181,246,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                      {st}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">笔记</label>
                <textarea value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="rounded-lg px-3 py-2 text-sm text-white outline-none resize-none" style={inputStyle}
                  placeholder="（可选）关于这条原则的补充说明" rows={2} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">相关属性</label>
                <AttrToggleGroup selected={form.attributeKeys} onChange={keys => setForm(f => ({ ...f, attributeKeys: keys }))} />
              </div>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg text-sm" style={cancelBtnStyle}>取消</button>
                <button onClick={save} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={goldBtnStyle}>保存</button>
              </div>
            </motion.div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// Tab 4: 决策日志 (Enhanced)
// ============================================================
const EMPTY_LOG: Omit<DecisionLog, 'id' | 'createdAt'> = {
  userId: 'local',
  date: new Date().toISOString().slice(0, 10),
  scenario: '',
  intuition: '',
  logicAnalysis: '',
  decision: '',
  basis: '',
  basisType: '',
  result: '',
  reflection: '',
  extractedPrinciple: '',
};

const DecisionLogsTab: React.FC = () => {
  const { decisionLogs, addDecisionLog, updateDecisionLog, deleteDecisionLog, convertLogToPrinciple, addPrinciple } = usePrincipleStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DecisionLog | null>(null);
  const [form, setForm] = useState<Omit<DecisionLog, 'id' | 'createdAt'>>(EMPTY_LOG);

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY_LOG, date: new Date().toISOString().slice(0, 10) }); setShowForm(true); };
  const openEdit = (l: DecisionLog) => {
    setEditing(l);
    setForm({
      userId: l.userId,
      date: l.date,
      scenario: l.scenario,
      intuition: l.intuition ?? '',
      logicAnalysis: l.logicAnalysis ?? '',
      decision: l.decision,
      basis: l.basis,
      basisType: l.basisType ?? '',
      result: l.result,
      reflection: l.reflection,
      extractedPrinciple: l.extractedPrinciple ?? '',
      newPrincipleId: l.newPrincipleId,
    });
    setShowForm(true);
  };

  const save = () => {
    if (!form.scenario.trim()) return;
    if (editing) {
      updateDecisionLog(editing.id, form);
    } else {
      addDecisionLog(form);
    }
    // If there's an extracted principle and no linked principle yet, create one
    if (form.extractedPrinciple?.trim() && !form.newPrincipleId) {
      addPrinciple({
        userId: 'local',
        scenario: form.scenario,
        action: form.extractedPrinciple,
        attributeKeys: [],
        sourceType: '经验总结',
        confidence: 3,
        verificationCount: 0,
      });
    }
    setShowForm(false);
  };

  const FLOW_STEPS = [
    { key: 'scenario', label: '情境描述', sub: '发生了什么？', icon: '📍' },
    { key: 'intuition', label: '直觉判断', sub: '你的第一反应是什么？', icon: '💭' },
    { key: 'logicAnalysis', label: '逻辑分析', sub: '理性分析后呢？', icon: '🧠' },
    { key: 'decision', label: '最终决策', sub: '你做了什么？', icon: '⚡' },
    { key: 'result', label: '实际结果', sub: '发生了什么？', icon: '📊' },
    { key: 'reflection', label: '反思总结', sub: '学到了什么？', icon: '🔮' },
    { key: 'extractedPrinciple', label: '提炼原则', sub: '能总结出什么原则？', icon: '📜' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-white/70">决策日志</h2>
          <p className="text-xs text-white/30 mt-1">情境 → 直觉 → 逻辑 → 决策 → 结果 → 反思 → 原则</p>
        </div>
        <button onClick={openAdd} className="text-sm px-4 py-2 rounded-lg font-semibold" style={blueBtnStyle}>
          + 记录决策
        </button>
      </div>

      {decisionLogs.length === 0 && !showForm && (
        <GlassCard className="p-8 text-center">
          <p className="text-white/30 text-sm">暂无决策日志</p>
        </GlassCard>
      )}

      <div className="flex flex-col gap-3">
        {decisionLogs.map((log) => (
          <GlassCard key={log.id} className="p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">{log.date}</span>
                {log.basisType && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(100,181,246,0.12)', color: '#64B5F6' }}>
                    {BASIS_TYPES.find(b => b.value === log.basisType)?.label ?? log.basisType}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {!log.newPrincipleId && (
                  <button onClick={() => convertLogToPrinciple(log.id)}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ background: 'rgba(255,213,79,0.15)', color: '#FFD54F' }}>
                    转为原则
                  </button>
                )}
                {log.newPrincipleId && (
                  <span className="text-xs px-2 py-0.5 rounded"
                    style={{ background: 'rgba(129,199,132,0.15)', color: '#81C784' }}>已有原则</span>
                )}
                <button onClick={() => openEdit(log)} className="text-white/30 hover:text-white text-xs">✏</button>
                <button onClick={() => deleteDecisionLog(log.id)} className="text-white/30 hover:text-red-400 text-xs">✕</button>
              </div>
            </div>

            {/* Flow visualization */}
            <div className="flex flex-col gap-1.5">
              {[
                { label: '情境', value: log.scenario, color: '#9E9E9E' },
                ...(log.intuition ? [{ label: '直觉', value: log.intuition, color: '#CE93D8' }] : []),
                ...(log.logicAnalysis ? [{ label: '逻辑', value: log.logicAnalysis, color: '#64B5F6' }] : []),
                { label: '决策', value: log.decision, color: '#FFD54F' },
                { label: '依据', value: log.basis, color: '#FFB74D' },
                { label: '结果', value: log.result, color: '#81C784' },
                ...(log.reflection ? [{ label: '反思', value: log.reflection, color: '#FF6B6B' }] : []),
                ...(log.extractedPrinciple ? [{ label: '原则', value: log.extractedPrinciple, color: '#FFD54F' }] : []),
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-xs shrink-0 w-8 text-right" style={{ color: `${item.color}88` }}>{item.label}</span>
                  <span className="text-xs" style={{ color: `${item.color}22` }}>│</span>
                  <span className="text-xs text-white/70">{item.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <ModalOverlay onClose={() => setShowForm(false)}>
            <motion.div
              className="rounded-xl p-5 w-[520px] flex flex-col gap-3 max-h-[90vh] overflow-y-auto"
              style={{ background: '#1a1030', border: '1px solid rgba(255,255,255,0.1)' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-base font-bold text-white">{editing ? '编辑决策日志' : '记录决策'}</h3>

              {/* Date */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">日期</label>
                <input type="date" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="rounded-lg px-3 py-2 text-sm text-white outline-none" style={inputStyle} />
              </div>

              {/* Flow steps */}
              {FLOW_STEPS.map(({ key, label, sub, icon }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">{icon} {label} <span className="text-white/30">— {sub}</span></label>
                  <textarea
                    value={(form as Record<string, unknown>)[key] as string ?? ''}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="rounded-lg px-3 py-2 text-sm text-white outline-none resize-none" style={inputStyle}
                    placeholder={sub} rows={2} />
                </div>
              ))}

              {/* Basis type */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">决策依据类型</label>
                <div className="flex flex-wrap gap-1">
                  {BASIS_TYPES.map(bt => (
                    <button key={bt.value}
                      onClick={() => setForm(f => ({ ...f, basisType: f.basisType === bt.value ? '' : bt.value }))}
                      className="text-xs px-2 py-1 rounded-lg transition-all"
                      style={{
                        background: form.basisType === bt.value ? 'rgba(100,181,246,0.2)' : 'rgba(255,255,255,0.04)',
                        color: form.basisType === bt.value ? '#64B5F6' : 'rgba(255,255,255,0.4)',
                        border: `1px solid ${form.basisType === bt.value ? 'rgba(100,181,246,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                      {bt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basis text */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">决策依据详情</label>
                <input value={form.basis}
                  onChange={e => setForm(f => ({ ...f, basis: e.target.value }))}
                  className="rounded-lg px-3 py-2 text-sm text-white outline-none" style={inputStyle}
                  placeholder="为什么这样决定？" />
              </div>

              <div className="flex gap-2 mt-1">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg text-sm" style={cancelBtnStyle}>取消</button>
                <button onClick={save} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={blueBtnStyle}>保存</button>
              </div>
            </motion.div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// Tab 5: 目标设定 (Keep as-is)
// ============================================================
const EMPTY_GOAL: Omit<Goal, 'id' | 'createdAt'> = {
  userId: 'local',
  type: 'vision',
  title: '',
  description: '',
  attributeKeys: [],
  status: 'active',
};

const GoalsTab: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = usePrincipleStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [form, setForm] = useState<Omit<Goal, 'id' | 'createdAt'>>(EMPTY_GOAL);

  const openAdd = (type: GoalType) => { setEditing(null); setForm({ ...EMPTY_GOAL, type }); setShowForm(true); };
  const openEdit = (g: Goal) => { setEditing(g); setForm({ userId: g.userId, type: g.type, title: g.title, description: g.description, attributeKeys: g.attributeKeys, status: g.status, deadline: g.deadline }); setShowForm(true); };
  const save = () => {
    if (!form.title.trim()) return;
    if (editing) updateGoal(editing.id, form);
    else addGoal(form);
    setShowForm(false);
  };

  const visionGoals = goals.filter(g => g.type === 'vision');
  const phaseGoals = goals.filter(g => g.type === 'phase');

  const GoalSection = ({ title, items, type }: { title: string; items: Goal[]; type: GoalType }) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <button onClick={() => openAdd(type)} className="text-xs px-3 py-1 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
          + 添加
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-white/30 text-xs py-3">暂无{title}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(g => (
            <GlassCard key={g.id} className="p-3"
              style={{
                border: `1px solid ${g.status === 'completed' ? 'rgba(129,199,132,0.3)' : g.status === 'abandoned' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}`,
              }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: g.status === 'completed' ? '#81C784' : g.status === 'abandoned' ? '#f87171' : '#FFD54F' }} />
                    <span className="text-sm font-semibold text-white truncate">{g.title}</span>
                  </div>
                  {g.description && <p className="text-xs text-white/40 mb-1">{g.description}</p>}
                  {g.deadline && <p className="text-xs text-white/30">截止：{g.deadline}</p>}
                  {g.attributeKeys.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {g.attributeKeys.map(key => {
                        const attr = ATTRIBUTES.find(a => a.key === key);
                        return attr ? (
                          <span key={key} className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{ background: `${attr.color}22`, color: attr.color, fontSize: '10px' }}>
                            {attr.emoji} {attr.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  {g.status === 'active' && (
                    <button onClick={() => updateGoal(g.id, { status: 'completed' })}
                      className="text-xs text-white/30 hover:text-green-400">✓</button>
                  )}
                  <button onClick={() => openEdit(g)} className="text-white/30 hover:text-white text-xs">✏</button>
                  <button onClick={() => deleteGoal(g.id)} className="text-white/30 hover:text-red-400 text-xs">✕</button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <GoalSection title="愿景目标" items={visionGoals} type="vision" />
      <GoalSection title="阶段目标" items={phaseGoals} type="phase" />

      <AnimatePresence>
        {showForm && (
          <ModalOverlay onClose={() => setShowForm(false)}>
            <motion.div
              className="rounded-xl p-5 w-96 flex flex-col gap-3"
              style={{ background: '#1a1030', border: '1px solid rgba(255,255,255,0.1)' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-base font-bold text-white">{editing ? '编辑目标' : `添加${form.type === 'vision' ? '愿景' : '阶段'}目标`}</h3>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">目标标题</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="rounded-lg px-3 py-2 text-sm text-white outline-none" style={inputStyle}
                  placeholder="目标标题" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">详细描述</label>
                <input value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="rounded-lg px-3 py-2 text-sm text-white outline-none" style={inputStyle}
                  placeholder="（可选）" />
              </div>
              {form.type === 'phase' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">截止日期</label>
                  <input type="date" value={form.deadline ?? ''}
                    onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                    className="rounded-lg px-3 py-2 text-sm text-white outline-none" style={inputStyle} />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">相关属性</label>
                <AttrToggleGroup selected={form.attributeKeys} onChange={keys => setForm(f => ({ ...f, attributeKeys: keys }))} />
              </div>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg text-sm" style={cancelBtnStyle}>取消</button>
                <button onClick={save} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={goldBtnStyle}>保存</button>
              </div>
            </motion.div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// Tab 6: 回顾报告 (Keep as-is with real data)
// ============================================================
const ReviewReportTab: React.FC = () => {
  const tasks = useTaskStore((s) => s.tasks);
  const completions = useTaskStore((s) => s.completions);
  const streakDays = usePlayerStore((s) => s.streakDays);
  const stardust = usePlayerStore((s) => s.stardust);
  const attributeExp = usePlayerStore((s) => s.attributeExp);
  const achievements = useAchievementStore((s) => s.achievements);

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthlyStardust = completions
    .filter(c => c.completedAt >= monthStart)
    .reduce((sum, c) => sum + c.stardustEarned, 0);

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const maxAttrExp = Math.max(...Object.values(attributeExp), 1);

  return (
    <div className="flex flex-col gap-4">
      <GlassCard className="p-5">
        <h3 className="text-sm font-bold text-white mb-3">{now.getFullYear()}年第{weekNum}周 周报</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '任务完成率', value: `${completionRate}%`, color: '#81C784' },
            { label: '本月星尘', value: `${monthlyStardust.toLocaleString()} ✦`, color: '#FFD54F' },
            { label: '连续天数', value: `${streakDays} 天`, color: '#64B5F6' },
            { label: '已解锁成就', value: `${unlockedCount} 个`, color: '#CE93D8' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg p-3 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${stat.color}22` }}>
              <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-white/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="text-sm font-bold text-white mb-3">属性经验累积</h3>
        <div className="flex flex-col gap-2">
          {ATTRIBUTES.map(attr => {
            const exp = attributeExp[attr.key] ?? 0;
            const level = getAttributeLevel(exp);
            return (
              <div key={attr.key} className="flex items-center gap-3">
                <span className="text-sm w-20">{attr.emoji} {attr.name} Lv.{level}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.max((exp / maxAttrExp) * 100, 2)}%`, background: attr.color }} />
                </div>
                <span className="text-xs w-16 text-right" style={{ color: attr.color }}>{exp.toLocaleString()} EXP</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="text-sm font-bold text-white mb-3">反思引导</h3>
        <div className="flex flex-col gap-2 text-sm text-white/60">
          <p>- 哪些任务经常跳过？下周需要调整什么？</p>
          <p>- 阶段目标进展如何？哪个属性被忽略了？</p>
          <p>- 当前星尘余额: <span style={{ color: '#FFD54F' }}>{stardust.toLocaleString()} ✦</span></p>
        </div>
      </GlassCard>
    </div>
  );
};

// ============================================================
// Main Principles Page
// ============================================================
export const PrinciplesPage: React.FC = () => {
  const [tab, setTab] = useState<PrincipleTab>('fivestep');

  return (
    <div className="p-4" style={{ background: 'linear-gradient(135deg, #0a0a1a, #1a0a2e)', minHeight: '100vh' }}>
      <h1 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Noto Serif SC, serif' }}>
        达利欧决策系统
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TAB_LIST.map(({ key, label, icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: tab === key ? 'rgba(255,213,79,0.2)' : 'rgba(255,255,255,0.04)',
              color: tab === key ? '#FFD54F' : 'rgba(255,255,255,0.5)',
              border: tab === key ? '1px solid rgba(255,213,79,0.4)' : '1px solid rgba(255,255,255,0.06)',
            }}>
            {icon} {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'fivestep' && <FiveStepTab />}
          {tab === 'tree' && <DecisionTreeTab />}
          {tab === 'my' && <MyPrinciplesTab />}
          {tab === 'logs' && <DecisionLogsTab />}
          {tab === 'goals' && <GoalsTab />}
          {tab === 'review' && <ReviewReportTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PrinciplesPage;
