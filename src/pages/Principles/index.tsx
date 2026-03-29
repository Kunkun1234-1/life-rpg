import React, { useState } from 'react';
import { usePrincipleStore } from '../../stores/usePrincipleStore';
import { SYSTEM_PRINCIPLES, ATTRIBUTES } from '../../lib/constants';
import type { Principle, DecisionLog, Goal, GoalType, AttributeKey } from '../../types';

type PrincipleTab = 'system' | 'my' | 'logs' | 'goals' | 'review';

const TAB_LIST: { key: PrincipleTab; label: string }[] = [
  { key: 'system', label: '系统原则' },
  { key: 'my', label: '我的原则' },
  { key: 'logs', label: '决策日志' },
  { key: 'goals', label: '目标设定' },
  { key: 'review', label: '回顾报告' },
];

// --- System Principles Tab ---
const SystemPrinciplesTab: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {SYSTEM_PRINCIPLES.map((p, i) => (
      <div key={i} className="rounded-xl p-4"
        style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,213,79,0.15)' }}>
        <div className="flex items-start gap-3">
          <span className="text-lg font-bold shrink-0" style={{ color: '#FFD54F' }}>{i + 1}</span>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">{p.title}</h3>
            <p className="text-xs text-white/50">{p.summary}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// --- My Principles Tab ---
const EMPTY_PRINCIPLE: Omit<Principle, 'id' | 'createdAt' | 'updatedAt'> = {
  userId: 'local',
  scenario: '',
  action: '',
  attributeKeys: [],
};

const MyPrinciplesTab: React.FC = () => {
  const { principles, addPrinciple, updatePrinciple, deletePrinciple } = usePrincipleStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Principle | null>(null);
  const [form, setForm] = useState<Omit<Principle, 'id' | 'createdAt' | 'updatedAt'>>(EMPTY_PRINCIPLE);

  const openAdd = () => { setEditing(null); setForm(EMPTY_PRINCIPLE); setShowForm(true); };
  const openEdit = (p: Principle) => { setEditing(p); setForm({ userId: p.userId, scenario: p.scenario, action: p.action, attributeKeys: p.attributeKeys }); setShowForm(true); };
  const save = () => {
    if (!form.scenario.trim() || !form.action.trim()) return;
    if (editing) updatePrinciple(editing.id, form);
    else addPrinciple(form);
    setShowForm(false);
  };

  const toggleAttr = (key: AttributeKey) => {
    setForm(f => ({
      ...f,
      attributeKeys: f.attributeKeys.includes(key)
        ? f.attributeKeys.filter(k => k !== key)
        : [...f.attributeKeys, key],
    }));
  };

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={openAdd} className="text-sm px-4 py-2 rounded-lg font-semibold"
          style={{ background: 'linear-gradient(135deg, #FFD54F, #FFB300)', color: '#1a0a00' }}>
          + 添加原则
        </button>
      </div>
      {principles.length === 0 && !showForm && (
        <p className="text-white/30 text-sm text-center py-8">暂无个人原则，点击添加</p>
      )}
      <div className="flex flex-col gap-2">
        {principles.map((p) => (
          <div key={p.id} className="rounded-xl p-4 flex items-start justify-between gap-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/50 mb-1">当 <span className="text-white/80">{p.scenario}</span></p>
              <p className="text-xs text-white/50">则 <span className="text-white/80">{p.action}</span></p>
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
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => openEdit(p)} className="text-white/30 hover:text-white text-xs">✏</button>
              <button onClick={() => deletePrinciple(p.id)} className="text-white/30 hover:text-red-400 text-xs">✕</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-xl p-5 w-96 flex flex-col gap-3"
            style={{ background: '#1a1030', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-base font-bold text-white">{editing ? '编辑原则' : '添加原则'}</h3>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50">当... (场景)</label>
              <input value={form.scenario} onChange={e => setForm(f => ({ ...f, scenario: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                placeholder="描述触发场景" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50">则... (行动)</label>
              <input value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                placeholder="描述应对行动" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50">相关属性</label>
              <div className="flex flex-wrap gap-1">
                {ATTRIBUTES.map(attr => (
                  <button key={attr.key} onClick={() => toggleAttr(attr.key)}
                    className="text-xs px-2 py-1 rounded-full transition-all"
                    style={{
                      background: form.attributeKeys.includes(attr.key) ? `${attr.color}33` : 'rgba(255,255,255,0.06)',
                      color: form.attributeKeys.includes(attr.key) ? attr.color : 'rgba(255,255,255,0.4)',
                      border: form.attributeKeys.includes(attr.key) ? `1px solid ${attr.color}66` : '1px solid transparent',
                    }}>
                    {attr.emoji} {attr.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>取消</button>
              <button onClick={save} className="flex-1 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #FFD54F, #FFB300)', color: '#1a0a00' }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Decision Logs Tab ---
const EMPTY_LOG: Omit<DecisionLog, 'id' | 'createdAt'> = {
  userId: 'local',
  date: new Date().toISOString().slice(0, 10),
  scenario: '',
  decision: '',
  basis: '',
  result: '',
  reflection: '',
};

const DecisionLogsTab: React.FC = () => {
  const { decisionLogs, addDecisionLog, updateDecisionLog, deleteDecisionLog, convertLogToPrinciple } = usePrincipleStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DecisionLog | null>(null);
  const [form, setForm] = useState<Omit<DecisionLog, 'id' | 'createdAt'>>(EMPTY_LOG);

  const openAdd = () => { setEditing(null); setForm(EMPTY_LOG); setShowForm(true); };
  const openEdit = (l: DecisionLog) => { setEditing(l); setForm({ userId: l.userId, date: l.date, scenario: l.scenario, decision: l.decision, basis: l.basis, result: l.result, reflection: l.reflection }); setShowForm(true); };
  const save = () => {
    if (!form.scenario.trim()) return;
    if (editing) updateDecisionLog(editing.id, form);
    else addDecisionLog(form);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={openAdd} className="text-sm px-4 py-2 rounded-lg font-semibold"
          style={{ background: 'linear-gradient(135deg, #64B5F6, #1976D2)', color: '#fff' }}>
          + 记录决策
        </button>
      </div>
      {decisionLogs.length === 0 && !showForm && (
        <p className="text-white/30 text-sm text-center py-8">暂无决策日志</p>
      )}
      <div className="flex flex-col gap-3">
        {decisionLogs.map((log) => (
          <div key={log.id} className="rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs text-white/40">{log.date}</span>
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
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-white/40">场景：</span><span className="text-white/80">{log.scenario}</span></div>
              <div><span className="text-white/40">决策：</span><span className="text-white/80">{log.decision}</span></div>
              <div><span className="text-white/40">依据：</span><span className="text-white/80">{log.basis}</span></div>
              <div><span className="text-white/40">结果：</span><span className="text-white/80">{log.result}</span></div>
              {log.reflection && <div className="col-span-2"><span className="text-white/40">反思：</span><span className="text-white/80">{log.reflection}</span></div>}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-xl p-5 w-[480px] flex flex-col gap-3 max-h-[90vh] overflow-y-auto"
            style={{ background: '#1a1030', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-base font-bold text-white">{editing ? '编辑决策日志' : '记录决策'}</h3>
            {[
              { key: 'date', label: '日期', type: 'date' },
              { key: 'scenario', label: '场景（发生了什么？）', type: 'text' },
              { key: 'decision', label: '决策（我做了什么？）', type: 'text' },
              { key: 'basis', label: '依据（为什么这样决定？）', type: 'text' },
              { key: 'result', label: '结果（实际发生了什么？）', type: 'text' },
              { key: 'reflection', label: '反思（我学到了什么？）', type: 'text' },
            ].map(({ key, label, type }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs text-white/50">{label}</label>
                <input type={type} value={(form as Record<string, string>)[key] ?? ''}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
              </div>
            ))}
            <div className="flex gap-2 mt-1">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>取消</button>
              <button onClick={save} className="flex-1 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #64B5F6, #1976D2)', color: '#fff' }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Goals Tab ---
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

  const toggleAttr = (key: AttributeKey) => {
    setForm(f => ({
      ...f,
      attributeKeys: f.attributeKeys.includes(key)
        ? f.attributeKeys.filter(k => k !== key)
        : [...f.attributeKeys, key],
    }));
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
            <div key={g.id} className="rounded-xl p-3 flex items-start justify-between gap-2"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${g.status === 'completed' ? 'rgba(129,199,132,0.3)' : g.status === 'abandoned' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}`,
              }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full shrink-0`}
                    style={{ background: g.status === 'completed' ? '#81C784' : g.status === 'abandoned' ? '#f87171' : '#FFD54F' }} />
                  <span className="text-sm font-semibold text-white truncate">{g.title}</span>
                </div>
                {g.description && <p className="text-xs text-white/40 mb-1">{g.description}</p>}
                {g.deadline && <p className="text-xs text-white/30">截止：{g.deadline}</p>}
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
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <GoalSection title="愿景目标" items={visionGoals} type="vision" />
      <GoalSection title="阶段目标" items={phaseGoals} type="phase" />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-xl p-5 w-96 flex flex-col gap-3"
            style={{ background: '#1a1030', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-base font-bold text-white">{editing ? '编辑目标' : `添加${form.type === 'vision' ? '愿景' : '阶段'}目标`}</h3>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50">目标标题</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                placeholder="目标标题" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50">详细描述</label>
              <input value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                placeholder="（可选）" />
            </div>
            {form.type === 'phase' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">截止日期</label>
                <input type="date" value={form.deadline ?? ''}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50">相关属性</label>
              <div className="flex flex-wrap gap-1">
                {ATTRIBUTES.map(attr => (
                  <button key={attr.key} onClick={() => toggleAttr(attr.key)}
                    className="text-xs px-2 py-1 rounded-full transition-all"
                    style={{
                      background: form.attributeKeys.includes(attr.key) ? `${attr.color}33` : 'rgba(255,255,255,0.06)',
                      color: form.attributeKeys.includes(attr.key) ? attr.color : 'rgba(255,255,255,0.4)',
                      border: form.attributeKeys.includes(attr.key) ? `1px solid ${attr.color}66` : '1px solid transparent',
                    }}>
                    {attr.emoji} {attr.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>取消</button>
              <button onClick={save} className="flex-1 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #FFD54F, #FFB300)', color: '#1a0a00' }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Review Report Tab (placeholder) ---
const ReviewReportTab: React.FC = () => (
  <div className="flex flex-col gap-4">
    <div className="rounded-xl p-5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h3 className="text-sm font-bold text-white mb-3">2026年第12周 周报</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '任务完成率', value: '78%', color: '#81C784' },
          { label: '获得星尘', value: '1,240 ✦', color: '#FFD54F' },
          { label: '连续天数', value: '5 天', color: '#64B5F6' },
          { label: '解锁成就', value: '2 个', color: '#CE93D8' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg p-3 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${stat.color}22` }}>
            <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs text-white/50 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
    <div className="rounded-xl p-5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h3 className="text-sm font-bold text-white mb-3">属性经验增长</h3>
      <div className="flex flex-col gap-2">
        {[
          { key: 'body', label: '体魄', emoji: '🔥', color: '#FF6B6B', gain: 240 },
          { key: 'mind', label: '心智', emoji: '❄️', color: '#64B5F6', gain: 380 },
          { key: 'craft', label: '技艺', emoji: '⚡', color: '#FFD54F', gain: 560 },
          { key: 'social', label: '社交', emoji: '🌿', color: '#81C784', gain: 120 },
          { key: 'spirit', label: '心灵', emoji: '💫', color: '#CE93D8', gain: 180 },
          { key: 'wealth', label: '财务', emoji: '🔶', color: '#FFB74D', gain: 80 },
        ].map(attr => (
          <div key={attr.key} className="flex items-center gap-3">
            <span className="text-sm w-16">{attr.emoji} {attr.label}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full" style={{ width: `${(attr.gain / 600) * 100}%`, background: attr.color }} />
            </div>
            <span className="text-xs w-12 text-right" style={{ color: attr.color }}>+{attr.gain}</span>
          </div>
        ))}
      </div>
    </div>
    <p className="text-xs text-white/20 text-center">完整报告功能将在连接数据后自动生成</p>
  </div>
);

// --- Main Principles Page ---
export const PrinciplesPage: React.FC = () => {
  const [tab, setTab] = useState<PrincipleTab>('system');

  return (
    <div className="p-4" style={{ background: 'linear-gradient(135deg, #0a0a1a, #1a0a2e)', minHeight: '100vh' }}>
      <h1 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Noto Serif SC, serif' }}>原则与目标</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TAB_LIST.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: tab === key ? 'rgba(255,213,79,0.2)' : 'rgba(255,255,255,0.04)',
              color: tab === key ? '#FFD54F' : 'rgba(255,255,255,0.5)',
              border: tab === key ? '1px solid rgba(255,213,79,0.4)' : '1px solid rgba(255,255,255,0.06)',
            }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'system' && <SystemPrinciplesTab />}
      {tab === 'my' && <MyPrinciplesTab />}
      {tab === 'logs' && <DecisionLogsTab />}
      {tab === 'goals' && <GoalsTab />}
      {tab === 'review' && <ReviewReportTab />}
    </div>
  );
};

export default PrinciplesPage;
