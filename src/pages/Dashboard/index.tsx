import React from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { TodayTasks } from './TodayTasks';
import { AttributeRadar } from './AttributeRadar';
import { QuickActions } from './QuickActions';
import { getAdventureLevelProgress } from '../../lib/gameFormulas';

const BossStatusPlaceholder: React.FC = () => {
  return (
    <GlassCard className="p-4" style={{ border: '1px solid rgba(255,107,107,0.2)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">👾</span>
        <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
          本周Boss
        </h3>
      </div>
      <div className="text-center py-4">
        <motion.div
          className="text-5xl mb-2"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        >
          🐉
        </motion.div>
        <p className="text-sm font-bold" style={{ color: '#FF6B6B' }}>拖延之龙</p>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>完成本周任务击败Boss</p>
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span>Boss血量</span>
            <span>3/5 周常任务</span>
          </div>
          <ProgressBar value={60} color="#FF6B6B" height={8} />
        </div>
      </div>
    </GlassCard>
  );
};

const PlayerHeader: React.FC = () => {
  const playerName = usePlayerStore((s) => s.playerName);
  const totalExp = usePlayerStore((s) => s.totalExp);
  const stardust = usePlayerStore((s) => s.stardust);
  const stamina = usePlayerStore((s) => s.stamina);
  const maxStamina = usePlayerStore((s) => s.maxStamina);
  const currentTitle = usePlayerStore((s) => s.currentTitle);

  const { level, currentLevelExp, nextLevelExp, progress } = getAdventureLevelProgress(totalExp);

  return (
    <GlassCard className="p-4 mb-4" style={{ border: '1px solid rgba(255,213,79,0.15)' }}>
      <div className="flex items-center gap-4 flex-wrap">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: 'rgba(255,213,79,0.15)', border: '2px solid rgba(255,213,79,0.4)' }}
        >
          🧙
        </div>

        {/* Player info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-base" style={{ color: '#FFD54F' }}>{playerName}</h2>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,213,79,0.1)', color: 'rgba(255,213,79,0.8)', border: '1px solid rgba(255,213,79,0.2)' }}
            >
              {currentTitle}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>冒险等级 Lv.{level}</span>
            <span className="text-xs ml-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {currentLevelExp}/{nextLevelExp} EXP
            </span>
          </div>
          <div className="mt-1.5">
            <ProgressBar value={progress * 100} color="#FFD54F" height={4} />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 flex-shrink-0">
          <div className="text-center">
            <div className="text-sm font-bold" style={{ color: '#64B5F6' }}>
              {stardust.toLocaleString()}
            </div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>✦ 星尘</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold" style={{ color: '#81C784' }}>
              {stamina}/{maxStamina}
            </div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>⚡ 体力</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

const GoalProgress: React.FC = () => {
  const goals = [
    { title: '坚持每日锻炼', progress: 75, color: '#FF6B6B' },
    { title: '本月读书目标', progress: 40, color: '#64B5F6' },
    { title: '项目开发进度', progress: 60, color: '#FFD54F' },
  ];

  return (
    <GlassCard className="p-4 mt-4">
      <h3 className="text-sm font-medium mb-3" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
        阶段目标
      </h3>
      <div className="space-y-3">
        {goals.map((goal, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>{goal.title}</span>
              <span style={{ color: goal.color }}>{goal.progress}%</span>
            </div>
            <ProgressBar value={goal.progress} color={goal.color} height={5} />
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

const Dashboard: React.FC = () => {
  return (
    <div
      className="min-h-screen p-4"
      style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)' }}
    >
      {/* Player Header - full width */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <PlayerHeader />
      </motion.div>

      {/* Three-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT: Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <TodayTasks />
        </motion.div>

        {/* CENTER: Attribute Radar + Goal Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          <AttributeRadar />
          <GoalProgress />
        </motion.div>

        {/* RIGHT: Boss Status + Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-4"
        >
          <BossStatusPlaceholder />
          <QuickActions />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
