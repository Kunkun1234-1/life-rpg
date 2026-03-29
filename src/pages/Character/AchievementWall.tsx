import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAchievementStore } from '../../stores/useAchievementStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { ACHIEVEMENT_UNLOCKS, ACHIEVEMENT_CATEGORIES } from '../../lib/constants';
import { GlassCard } from '../../components/ui/GlassCard';

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = Object.fromEntries(
  ACHIEVEMENT_CATEGORIES.map((c) => [c.key, { label: c.label, icon: c.icon }])
);

export default function AchievementWall() {
  const navigate = useNavigate();
  const achievements = useAchievementStore((s) => s.achievements);
  const achievementPoints = usePlayerStore((s) => s.achievementPoints);

  const unlocked = achievements
    .filter((a) => a.unlockedAt)
    .sort((a, b) => (b.unlockedAt ?? '').localeCompare(a.unlockedAt ?? ''))
    .slice(0, 6);
  const totalUnlocked = achievements.filter((a) => a.unlockedAt).length;

  // Next unlock threshold
  const nextUnlock = ACHIEVEMENT_UNLOCKS.find((u) => achievementPoints < u.points);

  return (
    <div className="space-y-4">
      {/* Header: points + unlock progress */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">
          成就徽章墙
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(206,147,216,0.15)', color: '#CE93D8', border: '1px solid rgba(206,147,216,0.3)' }}>
            🏅 {achievementPoints} 成就点
          </span>
        </div>
      </div>

      {/* Unlock progress bar */}
      {nextUnlock && (
        <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-white/50">下一解锁: {nextUnlock.feature}</span>
            <span style={{ color: '#CE93D8' }}>{achievementPoints}/{nextUnlock.points}</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #CE93D8, #FFD54F)' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((achievementPoints / nextUnlock.points) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Already unlocked features */}
      {ACHIEVEMENT_UNLOCKS.filter((u) => achievementPoints >= u.points).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {ACHIEVEMENT_UNLOCKS.filter((u) => achievementPoints >= u.points).map((u) => (
            <span
              key={u.points}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,213,79,0.1)', color: '#FFD54F', border: '1px solid rgba(255,213,79,0.2)' }}
            >
              ✓ {u.feature}
            </span>
          ))}
        </div>
      )}

      {/* 6 most recently unlocked achievements */}
      {unlocked.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/40">最近达成 ({totalUnlocked})</p>
            {totalUnlocked > 6 && (
              <button
                onClick={() => navigate('/achievements')}
                className="text-xs transition-colors"
                style={{ color: '#FFD54F', opacity: 0.7 }}
              >
                更多...
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {unlocked.map((a, i) => {
              const cat = CATEGORY_LABELS[a.category] ?? { label: '特殊', icon: '✨' };
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard
                    className="p-3"
                    style={{ border: '1px solid rgba(255,213,79,0.2)' } as React.CSSProperties}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: 'rgba(255,213,79,0.15)' }}
                      >
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{a.name}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(206,147,216,0.15)', color: '#CE93D8' }}>
                            +{a.points}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 mt-0.5">{a.description}</p>
                        {a.unlockedAt && (
                          <p className="text-xs text-white/25 mt-1">
                            {new Date(a.unlockedAt).toLocaleDateString('zh-CN')} 达成
                          </p>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {achievements.length === 0 && (
        <div className="text-center py-8">
          <span className="text-3xl">🏅</span>
          <p className="text-sm text-white/30 mt-2">完成任务以解锁成就</p>
        </div>
      )}
    </div>
  );
}
