import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAchievementStore } from '../../stores/useAchievementStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { ACHIEVEMENT_CATEGORIES } from '../../lib/constants';
import { GlassCard } from '../../components/ui/GlassCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import type { AchievementCategory } from '../../types';

const TIER_STYLES = {
  normal: { color: '#9E9E9E', label: '普通', bg: 'rgba(158,158,158,0.15)' },
  rare: { color: '#CE93D8', label: '稀有', bg: 'rgba(206,147,216,0.15)' },
  legendary: { color: '#FFD54F', label: '传说', bg: 'rgba(255,213,79,0.15)' },
};

const AchievementsPage: React.FC = () => {
  const achievements = useAchievementStore((s) => s.achievements);
  const achievementPoints = usePlayerStore((s) => s.achievementPoints);
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  const totalUnlocked = achievements.filter((a) => a.unlockedAt).length;
  const total = achievements.length;
  const overallProgress = total > 0 ? totalUnlocked / total : 0;

  const categoryAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter((a) => a.category === selectedCategory);

  const getCategoryCount = (cat: AchievementCategory) => {
    const list = achievements.filter((a) => a.category === cat);
    return { unlocked: list.filter((a) => a.unlockedAt).length, total: list.length };
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 100%)' }}
    >
      {/* Left Sidebar */}
      <div className="w-48 flex-shrink-0 p-4 flex flex-col gap-1">
        <h2
          className="text-lg font-bold text-white mb-3 px-2"
          style={{ fontFamily: 'Noto Serif SC, serif' }}
        >
          成就
        </h2>

        {/* All category button */}
        <button
          onClick={() => setSelectedCategory('all')}
          className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
          style={{
            background: selectedCategory === 'all'
              ? 'rgba(255,213,79,0.15)'
              : 'rgba(255,255,255,0.03)',
            border: selectedCategory === 'all'
              ? '1px solid rgba(255,213,79,0.4)'
              : '1px solid rgba(255,255,255,0.06)',
            color: selectedCategory === 'all' ? '#FFD54F' : 'rgba(255,255,255,0.6)',
          }}
        >
          <div className="flex items-center justify-between">
            <span>🏅 全部</span>
            <span className="text-xs opacity-70">{totalUnlocked}/{total}</span>
          </div>
        </button>

        {ACHIEVEMENT_CATEGORIES.map((cat) => {
          const { unlocked, total: catTotal } = getCategoryCount(cat.key);
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                background: isSelected
                  ? 'rgba(255,213,79,0.15)'
                  : 'rgba(255,255,255,0.03)',
                border: isSelected
                  ? '1px solid rgba(255,213,79,0.4)'
                  : '1px solid rgba(255,255,255,0.06)',
                color: isSelected ? '#FFD54F' : 'rgba(255,255,255,0.6)',
              }}
            >
              <div className="flex items-center justify-between">
                <span>{cat.icon} {cat.label}</span>
                <span className="text-xs opacity-70">{unlocked}/{catTotal}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'Noto Serif SC, serif' }}
            >
              {selectedCategory === 'all'
                ? '全部成就'
                : ACHIEVEMENT_CATEGORIES.find((c) => c.key === selectedCategory)?.label ?? '成就'}
            </h1>
            <div
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                background: 'rgba(206,147,216,0.15)',
                color: '#CE93D8',
                border: '1px solid rgba(206,147,216,0.3)',
              }}
            >
              🏅 {achievementPoints} 成就点
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-white/40">
              <span>总进度</span>
              <span>{totalUnlocked} / {total}</span>
            </div>
            <ProgressBar value={overallProgress} color="#FFD54F" />
          </div>
        </motion.div>

        {/* Achievement Grid - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categoryAchievements.map((a, i) => {
            const isUnlocked = !!a.unlockedAt;
            const isHidden = !isUnlocked && a.visibility === 'hidden';
            const tierStyle = TIER_STYLES[a.rewardTier] ?? TIER_STYLES.normal;
            const catInfo = ACHIEVEMENT_CATEGORIES.find((c) => c.key === a.category);

            if (isUnlocked) {
              // Unlocked card - gold border
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <GlassCard
                    className="p-4 h-full"
                    style={{ border: '1px solid rgba(255,213,79,0.3)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: 'rgba(255,213,79,0.15)' }}
                      >
                        {catInfo?.icon ?? '🏅'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-white">{a.name}</span>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{ background: tierStyle.bg, color: tierStyle.color }}
                          >
                            {tierStyle.label}
                          </span>
                        </div>
                        <p className="text-xs text-white/50">{a.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-white/25">
                            {new Date(a.unlockedAt!).toLocaleDateString('zh-CN')} 达成
                          </span>
                          <span className="text-xs" style={{ color: '#CE93D8' }}>
                            +{a.points}pt · +{a.stardustReward}✨
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            }

            if (isHidden) {
              // Hidden locked card
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div
                    className="rounded-xl p-4 h-full"
                    style={{
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      opacity: 0.4,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.04)' }}
                      >
                        🔒
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-white/30">???</span>
                        <p className="text-xs text-white/20 mt-0.5">???</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // Visible locked card
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div
                  className="rounded-xl p-4 h-full"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.05)', opacity: 0.5 }}
                    >
                      {catInfo?.icon ?? '🔒'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-white/40">{a.name}</span>
                        <span className="text-xs text-white/20">🔒</span>
                      </div>
                      <p className="text-xs text-white/25">{a.description}</p>
                      {a.maxProgress != null && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs text-white/25">
                            <span>进度</span>
                            <span>{a.progress ?? 0} / {a.maxProgress}</span>
                          </div>
                          <ProgressBar
                            value={a.maxProgress > 0 ? (a.progress ?? 0) / a.maxProgress : 0}
                            color="#64B5F6"
                          />
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-xs text-white/20">+{a.points}pt · +{a.stardustReward}✨</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {categoryAchievements.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl">🏅</span>
            <p className="text-white/30 text-sm mt-3">该分类暂无成就</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;
