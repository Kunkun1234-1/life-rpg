import { useEffect, useState, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { LevelUpAnimation } from '../animations/LevelUpAnimation';
import { AchievementUnlockAnimation } from '../animations/AchievementUnlockAnimation';
import { MainlineCompleteAnimation } from '../animations/MainlineCompleteAnimation';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useAchievementStore } from '../../stores/useAchievementStore';
import { useTaskStore } from '../../stores/useTaskStore';
import { useBossStore } from '../../stores/useBossStore';
import { useMainlineStore } from '../../stores/useMainlineStore';
import { useShopStore } from '../../stores/useShopStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { loadUserData, subscribeSyncAll } from '../../lib/syncEngine';

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const totalExp = usePlayerStore((s) => s.totalExp);
  const getAdventureLevel = usePlayerStore((s) => s.getAdventureLevel);
  const getCurrentTitle = usePlayerStore((s) => s.getCurrentTitle);
  const resetDailyStamina = usePlayerStore((s) => s.resetDailyStamina);
  const checkAndUnlock = useAchievementStore((s) => s.checkAndUnlock);
  const achievements = useAchievementStore((s) => s.achievements);
  const resetDailyTasks = useTaskStore((s) => s.resetDailyTasks);
  const checkWeeklyBoss = useBossStore((s) => s.checkWeeklyBoss);

  // Data loading state
  const [dataLoaded, setDataLoaded] = useState(false);
  const syncUnsubRef = useRef<(() => void) | null>(null);

  // Load data from Supabase on mount, then subscribe to sync
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function init() {
      await loadUserData(user!.id);
      if (cancelled) return;
      setDataLoaded(true);
      // Subscribe to store changes for sync
      syncUnsubRef.current = subscribeSyncAll(user!.id);
    }

    init();

    return () => {
      cancelled = true;
      if (syncUnsubRef.current) {
        syncUnsubRef.current();
        syncUnsubRef.current = null;
      }
    };
  }, [user]);

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

  // Track mainline completions
  const mainlineQuests = useMainlineStore((s) => s.mainlineQuests);
  const prevMainlineCompletedRef = useRef(mainlineQuests.filter(q => q.status === 'completed').length);
  const [mainlineAnim, setMainlineAnim] = useState<{
    show: boolean; title: string;
  }>({ show: false, title: '' });

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

  // Detect newly completed mainline quests
  useEffect(() => {
    const currentCompleted = mainlineQuests.filter(q => q.status === 'completed').length;
    if (currentCompleted > prevMainlineCompletedRef.current) {
      const newest = mainlineQuests
        .filter(q => q.status === 'completed' && q.completedAt)
        .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))[0];
      if (newest) {
        setMainlineAnim({ show: true, title: newest.title });
      }
    }
    prevMainlineCompletedRef.current = currentCompleted;
  }, [mainlineQuests]);

  // Daily reset check on mount
  useEffect(() => {
    if (!dataLoaded) return;
    const lastResetKey = 'life-rpg-last-daily-reset';
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem(lastResetKey);
    if (lastReset !== today) {
      resetDailyStamina();
      resetDailyTasks();
      useShopStore.getState().clearExpiredBuffs();
      // Check weekly boss with current weekly task counts
      const tasks = useTaskStore.getState().tasks;
      const weeklyTasks = tasks.filter(t => t.cycle === 'weekly');
      const weeklyCompleted = weeklyTasks.filter(t => t.status === 'completed').length;
      checkWeeklyBoss(weeklyTasks.length, weeklyCompleted);
      localStorage.setItem(lastResetKey, today);
    }
  }, [dataLoaded, resetDailyStamina, resetDailyTasks, checkWeeklyBoss]);

  // Show loading while data is being fetched
  if (!dataLoaded) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)',
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
            style={{
              borderTopColor: '#FFD54F',
              borderRightColor: '#FFD54F',
            }}
          />
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
            正在同步数据...
          </p>
        </div>
      </div>
    );
  }

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
      <MainlineCompleteAnimation
        show={mainlineAnim.show}
        mainlineTitle={mainlineAnim.title}
        onDismiss={() => setMainlineAnim(s => ({ ...s, show: false }))}
      />
    </div>
  );
}
