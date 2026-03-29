import React from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useTaskStore } from '../../stores/useTaskStore';
import { usePrincipleStore } from '../../stores/usePrincipleStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { TodayTasks } from './TodayTasks';
import { AttributeRadar } from './AttributeRadar';
import { QuickActions } from './QuickActions';
import { BossStatus } from './BossStatus';
import { getAdventureLevelProgress } from '../../lib/gameFormulas';
import { ATTRIBUTES } from '../../lib/constants';

const PlayerHeader: React.FC = () => {
  const playerName = usePlayerStore((s) => s.playerName);
  const totalExp = usePlayerStore((s) => s.totalExp);
  const stardust = usePlayerStore((s) => s.stardust);
  const stamina = usePlayerStore((s) => s.stamina);
  const maxStamina = usePlayerStore((s) => s.maxStamina);
  const getCurrentTitle = usePlayerStore((s) => s.getCurrentTitle);

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
              {getCurrentTitle()}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>冒险等级 Lv.{level}</span>
            <span className="text-xs ml-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {currentLevelExp}/{nextLevelExp} EXP
            </span>
          </div>
          <div className="mt-1.5">
            <ProgressBar value={progress} color="#FFD54F"  />
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
  const allGoals = usePrincipleStore((s) => s.goals);
  const phaseGoals = allGoals.filter((g) => g.type === 'phase' && g.status === 'active');

  const getGoalColor = (attributeKeys: string[]): string => {
    if (attributeKeys.length === 0) return '#FFD54F';
    const attr = ATTRIBUTES.find((a) => a.key === attributeKeys[0]);
    return attr ? attr.color : '#FFD54F';
  };

  return (
    <GlassCard className="p-4 mt-4">
      <h3 className="text-sm font-medium mb-3" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
        阶段目标
      </h3>
      {phaseGoals.length === 0 ? (
        <p className="text-xs text-center py-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
          暂未设定阶段目标
        </p>
      ) : (
        <div className="space-y-3">
          {phaseGoals.map((goal) => {
            const color = getGoalColor(goal.attributeKeys);
            return (
              <div key={goal.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>{goal.title}</span>
                </div>
                <ProgressBar value={0} color={color} />
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
};

const Dashboard: React.FC = () => {
  const tasks = useTaskStore((s) => s.tasks);
  const weeklyTasks = tasks.filter((t) => t.cycle === 'weekly');
  const weeklyCompleted = weeklyTasks.filter((t) => t.status === 'completed').length;

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
          <BossStatus weeklyTasksTotal={weeklyTasks.length} weeklyTasksCompleted={weeklyCompleted} />
          <QuickActions />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
