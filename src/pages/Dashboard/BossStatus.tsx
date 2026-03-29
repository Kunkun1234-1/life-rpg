import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBossStore } from '../../stores/useBossStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { BossDefeatAnimation } from '../../components/animations/BossDefeatAnimation';
import type { Boss } from '../../types';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
}

function ProgressBar({ value, max, color = '#FFD54F' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
}

interface BossCardProps {
  boss: Boss;
  weeklyTotal?: number;
  weeklyCompleted?: number;
  onDefeat: (boss: Boss) => void;
}

function BossCard({ boss, weeklyTotal = 0, weeklyCompleted = 0, onDefeat }: BossCardProps) {
  const isReady = boss.type === 'weekly'
    ? weeklyTotal > 0 && weeklyCompleted >= weeklyTotal
    : true; // monthly/quarterly use text condition

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-white/40 mb-0.5">
            {boss.type === 'weekly' ? '周常首领' : boss.type === 'monthly' ? '月度首领' : '季度首领'}
            <span className="ml-2 text-white/25">{boss.period}</span>
          </div>
          <div
            className="text-white font-semibold text-sm"
            style={{ fontFamily: 'Noto Serif SC, serif' }}
          >
            {boss.name}
          </div>
        </div>
        <div className="text-red-400 text-xl">👹</div>
      </div>

      {/* Progress for weekly */}
      {boss.type === 'weekly' && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-white/50">
            <span>周常任务进度</span>
            <span>
              {weeklyCompleted}/{weeklyTotal} 周常任务
            </span>
          </div>
          <ProgressBar value={weeklyCompleted} max={weeklyTotal} />
        </div>
      )}

      {/* Condition text for monthly/quarterly */}
      {boss.type !== 'weekly' && (
        <p className="text-xs text-white/50 leading-relaxed">{boss.condition}</p>
      )}

      {/* Rewards */}
      <div className="flex gap-3 text-xs text-white/40">
        <span className="text-yellow-400">+{boss.rewardExp} EXP</span>
        <span className="text-blue-300">+{boss.rewardStardust} ✦</span>
      </div>

      {/* Defeat button */}
      {isReady && (
        <motion.button
          className="w-full py-2 rounded-lg text-sm font-bold text-black"
          style={{ background: 'linear-gradient(90deg,#FFD54F,#FF7043)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onDefeat(boss)}
        >
          ⚔️ 击败首领，领取奖励
        </motion.button>
      )}
    </div>
  );
}

interface BossStatusProps {
  weeklyTasksTotal?: number;
  weeklyTasksCompleted?: number;
}

export function BossStatus({
  weeklyTasksTotal = 0,
  weeklyTasksCompleted = 0,
}: BossStatusProps) {
  const { getActiveBosses, defeatBoss } = useBossStore();
  const addExp = (usePlayerStore as any)((s: any) => s.addExp);
  const addStardust = (usePlayerStore as any)((s: any) => s.addStardust);

  const [defeatAnim, setDefeatAnim] = useState<{
    show: boolean;
    bossName: string;
    rewards: { label: string; value: number }[];
  }>({ show: false, bossName: '', rewards: [] });

  const activeBosses = getActiveBosses();

  const handleDefeat = (boss: Boss) => {
    const result = defeatBoss(boss.id);
    if (!result) return;
    addExp?.(result.exp);
    addStardust?.(result.stardust);
    setDefeatAnim({
      show: true,
      bossName: boss.name,
      rewards: [
        { label: 'EXP', value: result.exp },
        { label: '星尘', value: result.stardust },
      ],
    });
  };

  if (activeBosses.length === 0) return null;

  return (
    <>
      <div
        className="rounded-2xl p-4 flex flex-col gap-3"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-red-400 text-lg">⚔️</span>
          <h3
            className="text-white/90 font-semibold"
            style={{ fontFamily: 'Noto Serif SC, serif' }}
          >
            活跃首领
          </h3>
          <span className="ml-auto text-xs text-white/30">{activeBosses.length} 个</span>
        </div>

        {activeBosses.map((boss) => (
          <BossCard
            key={boss.id}
            boss={boss}
            weeklyTotal={weeklyTasksTotal}
            weeklyCompleted={weeklyTasksCompleted}
            onDefeat={handleDefeat}
          />
        ))}
      </div>

      <BossDefeatAnimation
        show={defeatAnim.show}
        bossName={defeatAnim.bossName}
        rewards={defeatAnim.rewards}
        onDismiss={() => setDefeatAnim((s) => ({ ...s, show: false }))}
      />
    </>
  );
}
