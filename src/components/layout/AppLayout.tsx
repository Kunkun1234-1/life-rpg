import { useEffect, useState, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { LevelUpAnimation } from '../animations/LevelUpAnimation';
import { AchievementUnlockAnimation } from '../animations/AchievementUnlockAnimation';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useAchievementStore } from '../../stores/useAchievementStore';
import { useTaskStore } from '../../stores/useTaskStore';
import { useBossStore } from '../../stores/useBossStore';

export function AppLayout() {
  const totalExp = usePlayerStore((s) => s.totalExp);
  const getAdventureLevel = usePlayerStore((s) => s.getAdventureLevel);
  const getCurrentTitle = usePlayerStore((s) => s.getCurrentTitle);
  const resetDailyStamina = usePlayerStore((s) => s.resetDailyStamina);
  const checkAndUnlock = useAchievementStore((s) => s.checkAndUnlock);
  const achievements = useAchievementStore((s) => s.achievements);
  const resetDailyTasks = useTaskStore((s) => s.resetDailyTasks);
  const checkWeeklyBoss = useBossStore((s) => s.checkWeeklyBoss);

  // Track level for level-up detection
  const prevLevelRef = useRef(getAdventureLevel());
  const [levelUpAnim, setLevelUpAnim] = useState<{ show: boolean; level: number; title: string }>({
    show: false, level: 0, title: '',
  });

  // Track achievements for unlock detection
  const prevUnlockedRef = useRef(achievements.filter(a => a.unlockedAt).length);
  const [achievementAnim, setAchievementAnim] = useState<{
    show: boolean; achievement: { name: string; description: string; points: number } | null;
  }>({ show: false, achievement: null });

  // Check for level-up after exp changes
  useEffect(() => {
    const currentLevel = getAdventureLevel();
    if (currentLevel > prevLevelRef.current) {
      setLevelUpAnim({ show: true, level: currentLevel, title: getCurrentTitle() });
    }
    prevLevelRef.current = currentLevel;
  }, [totalExp, getAdventureLevel, getCurrentTitle]);

  // Check achievements after any state change
  useEffect(() => {
    checkAndUnlock();
  }, [totalExp, checkAndUnlock]);

  // Detect newly unlocked achievements
  useEffect(() => {
    const currentUnlocked = achievements.filter(a => a.unlockedAt).length;
    if (currentUnlocked > prevUnlockedRef.current) {
      const newest = achievements
        .filter(a => a.unlockedAt)
        .sort((a, b) => (b.unlockedAt ?? '').localeCompare(a.unlockedAt ?? ''))[0];
      if (newest) {
        setAchievementAnim({
          show: true,
          achievement: { name: newest.name, description: newest.description, points: newest.points },
        });
      }
    }
    prevUnlockedRef.current = currentUnlocked;
  }, [achievements]);

  // Daily reset check on mount
  useEffect(() => {
    const lastResetKey = 'life-rpg-last-daily-reset';
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem(lastResetKey);
    if (lastReset !== today) {
      resetDailyStamina();
      resetDailyTasks();
      // Check weekly boss with current weekly task counts
      const tasks = useTaskStore.getState().tasks;
      const weeklyTasks = tasks.filter(t => t.cycle === 'weekly');
      const weeklyCompleted = weeklyTasks.filter(t => t.status === 'completed').length;
      checkWeeklyBoss(weeklyTasks.length, weeklyCompleted);
      localStorage.setItem(lastResetKey, today);
    }
  }, [resetDailyStamina, resetDailyTasks, checkWeeklyBoss]);

  return (
    <div className="min-h-screen">
      <Sidebar />
      <TopBar />
      <main
        style={{ marginLeft: '64px', paddingTop: '52px', minHeight: '100vh' }}
        className="p-6"
      >
        <Outlet />
      </main>

      {/* Global animations */}
      <LevelUpAnimation
        show={levelUpAnim.show}
        level={levelUpAnim.level}
        title={levelUpAnim.title}
        onDismiss={() => setLevelUpAnim(s => ({ ...s, show: false }))}
      />
      <AchievementUnlockAnimation
        show={achievementAnim.show}
        achievement={achievementAnim.achievement}
        onDismiss={() => setAchievementAnim(s => ({ ...s, show: false }))}
      />
    </div>
  );
}
