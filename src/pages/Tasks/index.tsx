import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '../../stores/useTaskStore';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import { Button } from '../../components/ui/Button';

type FilterTab = 'active' | 'epic_legend' | 'history';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'active', label: '进行中' },
  { key: 'epic_legend', label: '史诗传说' },
  { key: 'history', label: '历史记录' },
];

const TasksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const allTasks = useTaskStore(s => s.tasks);

  const tasks = activeTab === 'active'
    ? allTasks.filter(t => t.status === 'pending')
    : activeTab === 'epic_legend'
      ? allTasks.filter(t => t.rarity >= 4)
      : allTasks.filter(t => t.status === 'completed');

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
        {TABS.map(tab => (
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
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
          >
            + 创建任务
          </Button>
        </div>

        {/* Task list */}
        <div className="flex-1 p-6 overflow-y-auto">
          {tasks.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-5xl mb-4">📋</span>
              <p className="text-white/40 text-sm">
                {activeTab === 'active' && '暂无进行中的任务，点击「创建任务」开始冒险！'}
                {activeTab === 'epic_legend' && '暂无史诗或传说级任务'}
                {activeTab === 'history' && '暂无历史记录'}
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3 max-w-2xl">
                {tasks.map(task => (
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
