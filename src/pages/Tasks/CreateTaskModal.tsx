import React, { useState } from 'react';
import type { TaskRarity, AttributeKey, TaskCycle } from '../../types';
import { ATTRIBUTES, RARITY_CONFIGS, RARITY_MAP } from '../../lib/constants';
import { useTaskStore } from '../../stores/useTaskStore';
import { useMainlineStore } from '../../stores/useMainlineStore';
import { generateId } from '../../lib/gameFormulas';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubtaskDraft {
  id: string;
  title: string;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const createTask = useTaskStore(s => s.createTask);
  const activeMainlines = useMainlineStore(s => s.getActiveMainlines)();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [element, setElement] = useState<AttributeKey>('body');
  const [rarity, setRarity] = useState<TaskRarity>(1);
  const [baseExp, setBaseExp] = useState(25);
  const [baseStardust, setBaseStardust] = useState(8);
  const [staminaCost, setStaminaCost] = useState(12);
  const [deadline, setDeadline] = useState('');
  const [mainlineId, setMainlineId] = useState('');
  const [subtasks, setSubtasks] = useState<SubtaskDraft[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  const rarityConfig = RARITY_MAP[rarity];
  const needsSubtasks = rarity === 4 || rarity === 5;

  const handleRarityChange = (r: TaskRarity) => {
    setRarity(r);
    const cfg = RARITY_MAP[r];
    const [minExp, maxExp] = cfg.expRange;
    const [minSd, maxSd] = cfg.stardustRange;
    const [minSt, maxSt] = cfg.staminaRange;
    setBaseExp(Math.round((minExp + maxExp) / 2));
    setBaseStardust(Math.round((minSd + maxSd) / 2));
    setStaminaCost(Math.round((minSt + maxSt) / 2));
    if (r < 4) setSubtasks([]);
  };

  const addSubtask = () => {
    const t = newSubtask.trim();
    if (!t || subtasks.length >= 8) return;
    setSubtasks(prev => [...prev, { id: generateId(), title: t }]);
    setNewSubtask('');
  };

  const removeSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const cycle: TaskCycle = rarityConfig.cycle;

    const subtaskTasks = needsSubtasks && subtasks.length > 0
      ? subtasks.map(s => ({
          id: generateId(),
          userId: 'local',
          title: s.title,
          element,
          rarity,
          cycle,
          baseExp: Math.round(baseExp / subtasks.length),
          baseStardust: Math.round(baseStardust / subtasks.length),
          staminaCost: Math.round(staminaCost / subtasks.length),
          status: 'pending' as const,
          isFirstCompletion: true,
          parentTaskId: '',
          createdAt: new Date().toISOString(),
        }))
      : undefined;

    createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      element,
      rarity,
      cycle,
      baseExp,
      baseStardust,
      staminaCost,
      deadline: deadline || undefined,
      mainlineId: mainlineId || undefined,
      subtasks: subtaskTasks,
    });

    // Reset
    setTitle('');
    setDescription('');
    setElement('body');
    setRarity(1);
    setBaseExp(25);
    setBaseStardust(8);
    setStaminaCost(12);
    setDeadline('');
    setMainlineId('');
    setSubtasks([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="创建新任务">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Title */}
        <div>
          <label className="block text-xs text-white/50 mb-1.5">任务名称 *</label>
          <input
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-yellow-400/50 transition-colors"
            placeholder="输入任务名称..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs text-white/50 mb-1.5">描述（可选）</label>
          <textarea
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-yellow-400/50 transition-colors resize-none"
            placeholder="描述任务内容..."
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Element Select */}
        <div>
          <label className="block text-xs text-white/50 mb-1.5">属性元素</label>
          <div className="grid grid-cols-3 gap-2">
            {ATTRIBUTES.map(attr => (
              <button
                key={attr.key}
                type="button"
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  element === attr.key
                    ? 'border-opacity-80'
                    : 'border-white/10 text-white/50 hover:border-white/25'
                }`}
                style={element === attr.key ? {
                  borderColor: attr.color,
                  color: attr.color,
                  background: `${attr.color}15`,
                } : {}}
                onClick={() => setElement(attr.key)}
              >
                {attr.emoji} {attr.name}
              </button>
            ))}
          </div>
        </div>

        {/* Rarity Selector */}
        <div>
          <label className="block text-xs text-white/50 mb-1.5">任务稀有度</label>
          <div className="grid grid-cols-5 gap-1.5">
            {RARITY_CONFIGS.map(cfg => (
              <button
                key={cfg.rarity}
                type="button"
                className={`flex flex-col items-center py-2 px-1 rounded-lg border text-xs transition-all ${
                  rarity === cfg.rarity ? 'border-opacity-80' : 'border-white/10 text-white/40 hover:border-white/25'
                }`}
                style={rarity === cfg.rarity ? {
                  borderColor: cfg.color,
                  background: `${cfg.color}15`,
                } : {}}
                onClick={() => handleRarityChange(cfg.rarity as TaskRarity)}
              >
                <span style={{ color: cfg.color, fontSize: '10px' }}>{cfg.stars}</span>
                <span className="mt-0.5" style={rarity === cfg.rarity ? { color: cfg.color } : {}}>{cfg.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-white/30 mt-1.5">{rarityConfig.description}</p>
        </div>

        {/* Value inputs */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-white/50 mb-1.5">
              经验值 <span className="text-white/25">({rarityConfig.expRange[0]}-{rarityConfig.expRange[1]})</span>
            </label>
            <input
              type="number"
              min={rarityConfig.expRange[0]}
              max={rarityConfig.expRange[1]}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition-colors"
              value={baseExp}
              onChange={e => setBaseExp(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5">
              星尘 <span className="text-white/25">({rarityConfig.stardustRange[0]}-{rarityConfig.stardustRange[1]})</span>
            </label>
            <input
              type="number"
              min={rarityConfig.stardustRange[0]}
              max={rarityConfig.stardustRange[1]}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition-colors"
              value={baseStardust}
              onChange={e => setBaseStardust(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5">
              体力 <span className="text-white/25">({rarityConfig.staminaRange[0]}-{rarityConfig.staminaRange[1]})</span>
            </label>
            <input
              type="number"
              min={rarityConfig.staminaRange[0]}
              max={rarityConfig.staminaRange[1]}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition-colors"
              value={staminaCost}
              onChange={e => setStaminaCost(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Deadline (for onetime tasks) */}
        {rarityConfig.cycle === 'onetime' && (
          <div>
            <label className="block text-xs text-white/50 mb-1.5">截止日期（可选）</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition-colors"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              style={{ colorScheme: 'dark' }}
            />
          </div>
        )}

        {/* Mainline Association */}
        {activeMainlines.length > 0 && (
          <div>
            <label className="block text-xs text-white/50 mb-1.5">关联主线（可选）</label>
            <select
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition-colors"
              value={mainlineId}
              onChange={e => setMainlineId(e.target.value)}
              style={{ colorScheme: 'dark' }}
            >
              <option value="">不关联主线</option>
              {activeMainlines.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Subtask builder (for rarity 4-5) */}
        {needsSubtasks && (
          <div>
            <label className="block text-xs text-white/50 mb-1.5">
              子任务 <span className="text-white/25">({subtasks.length}/8)</span>
            </label>
            <div className="space-y-2 mb-2">
              {subtasks.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-xs text-white/30 w-4">{i + 1}.</span>
                  <span className="flex-1 text-sm text-white/80">{s.title}</span>
                  <button
                    type="button"
                    className="text-white/30 hover:text-red-400 transition-colors text-sm"
                    onClick={() => removeSubtask(s.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {subtasks.length < 8 && (
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-yellow-400/50 transition-colors"
                  placeholder="添加子任务..."
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                />
                <Button type="button" size="sm" variant="secondary" onClick={addSubtask}>添加</Button>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>取消</Button>
          <Button type="submit" variant="primary" disabled={!title.trim()}>创建任务</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
