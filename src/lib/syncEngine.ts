import { supabase } from './supabase';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useTaskStore } from '../stores/useTaskStore';
import { useAchievementStore } from '../stores/useAchievementStore';
import { useShopStore } from '../stores/useShopStore';
import { useEquipmentStore } from '../stores/useEquipmentStore';
import { useBossStore } from '../stores/useBossStore';
import { useCalendarStore } from '../stores/useCalendarStore';
import { usePrincipleStore } from '../stores/usePrincipleStore';
import { useMainlineStore } from '../stores/useMainlineStore';
import { useGachaStore } from '../stores/useGachaStore';

// Debounce map to avoid rapid writes
const saveTimers: Record<string, ReturnType<typeof setTimeout>> = {};

export function saveToSupabase(
  table: string,
  userId: string,
  data: Record<string, unknown>
): void {
  if (saveTimers[table]) clearTimeout(saveTimers[table]);
  saveTimers[table] = setTimeout(async () => {
    try {
      await supabase
        .from(table)
        .upsert({ user_id: userId, ...data, updated_at: new Date().toISOString() });
    } catch (e) {
      console.error(`[syncEngine] Failed to save to ${table}:`, e);
    }
  }, 1000);
}

/**
 * Load all user data from Supabase into Zustand stores.
 * If no data exists in Supabase (new user), localStorage defaults are kept.
 */
export async function loadUserData(userId: string): Promise<void> {
  try {
    const [
      { data: profile },
      { data: taskRows },
      { data: completionRows },
      { data: achievementRows },
      { data: equipmentRows },
      { data: shopData },
      { data: bossRows },
      { data: calendarData },
      { data: principlesData },
      { data: mainlineRows },
      { data: gachaData },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase.from('tasks').select('*').eq('user_id', userId),
      supabase.from('task_completions').select('*').eq('user_id', userId),
      supabase.from('achievements').select('*').eq('user_id', userId),
      supabase.from('equipment').select('*').eq('user_id', userId),
      supabase.from('shop_data').select('*').eq('user_id', userId).single(),
      supabase.from('bosses').select('*').eq('user_id', userId),
      supabase.from('calendar_data').select('*').eq('user_id', userId).single(),
      supabase.from('principles_data').select('*').eq('user_id', userId).single(),
      supabase.from('mainline_quests').select('*').eq('user_id', userId),
      supabase.from('gacha_data').select('*').eq('user_id', userId).single(),
    ]);

    // Profile -> PlayerStore
    if (profile) {
      usePlayerStore.setState({
        playerName: profile.player_name,
        totalExp: profile.total_exp,
        stardust: profile.stardust,
        stamina: profile.stamina,
        maxStamina: profile.max_stamina,
        overflowStamina: profile.overflow_stamina,
        streakDays: profile.streak_days,
        achievementPoints: profile.achievement_points,
        attributeExp: profile.attribute_exp,
      });
    }

    // Tasks -> TaskStore (stored as individual rows with jsonb data)
    if (taskRows && taskRows.length > 0) {
      useTaskStore.setState({
        tasks: taskRows.map((r) => r.data),
      });
    }

    // Task Completions
    if (completionRows && completionRows.length > 0) {
      useTaskStore.setState({
        completions: completionRows.map((r) => r.data),
      });
    }

    // Achievements
    if (achievementRows && achievementRows.length > 0) {
      const achievementData = achievementRows.map((r) => r.data);
      // Merge with existing defaults: keep default structure, overlay saved state
      const currentAchievements = useAchievementStore.getState().achievements;
      const savedMap = new Map(achievementData.map((a: { id: string }) => [a.id, a]));
      const merged = currentAchievements.map((a) => {
        const saved = savedMap.get(a.id);
        return saved ? { ...a, ...saved } : a;
      });
      // Add any custom achievements not in defaults
      const defaultIds = new Set(currentAchievements.map((a) => a.id));
      const customAchievements = achievementData.filter(
        (a: { id: string }) => !defaultIds.has(a.id)
      );
      useAchievementStore.setState({
        achievements: [...merged, ...customAchievements],
      });
    }

    // Equipment
    if (equipmentRows && equipmentRows.length > 0) {
      useEquipmentStore.setState({
        equipment: equipmentRows.map((r) => r.data),
      });
    }

    // Shop
    if (shopData) {
      useShopStore.setState({
        customRewards: shopData.custom_rewards ?? [],
        inventory: shopData.inventory ?? [],
        monthlyPurchases: shopData.monthly_purchases ?? {},
      });
    }

    // Bosses
    if (bossRows && bossRows.length > 0) {
      useBossStore.setState({
        bosses: bossRows.map((r) => r.data),
      });
    }

    // Calendar
    if (calendarData) {
      useCalendarStore.setState({
        events: calendarData.events ?? [],
        semesterConfig: calendarData.semester_config ?? null,
      });
    }

    // Principles
    if (principlesData) {
      usePrincipleStore.setState({
        principles: principlesData.principles ?? [],
        decisionLogs: principlesData.decision_logs ?? [],
        goals: principlesData.goals ?? [],
        fiveStepFlows: principlesData.five_step_flows ?? [],
      });
    }

    // Mainline Quests
    if (mainlineRows && mainlineRows.length > 0) {
      useMainlineStore.setState({
        mainlineQuests: mainlineRows.map((r) => r.data),
      });
    }

    // Gacha
    if (gachaData) {
      useGachaStore.setState({
        pools: gachaData.pools ?? [],
        history: gachaData.history ?? [],
        pity: gachaData.pity ?? {},
      });
    }
  } catch (e) {
    console.error('[syncEngine] Failed to load user data:', e);
  }
}

/**
 * Subscribe to all store changes and sync to Supabase.
 * Returns an unsubscribe function that cleans up all subscriptions.
 */
export function subscribeSyncAll(userId: string): () => void {
  const unsubscribers: (() => void)[] = [];

  // Profile sync
  unsubscribers.push(
    usePlayerStore.subscribe((state) => {
      saveToSupabase('profiles', userId, {
        player_name: state.playerName,
        total_exp: state.totalExp,
        stardust: state.stardust,
        stamina: state.stamina,
        max_stamina: state.maxStamina,
        overflow_stamina: state.overflowStamina,
        streak_days: state.streakDays,
        achievement_points: state.achievementPoints,
        attribute_exp: state.attributeExp,
      });
    })
  );

  // Tasks sync: save all tasks as individual rows
  unsubscribers.push(
    useTaskStore.subscribe((state) => {
      if (saveTimers['tasks']) clearTimeout(saveTimers['tasks']);
      saveTimers['tasks'] = setTimeout(async () => {
        try {
          // Delete existing and re-insert all (simplest approach)
          await supabase.from('tasks').delete().eq('user_id', userId);
          if (state.tasks.length > 0) {
            await supabase.from('tasks').insert(
              state.tasks.map((t) => ({ user_id: userId, id: t.id, data: t }))
            );
          }
          // Sync completions similarly
          await supabase.from('task_completions').delete().eq('user_id', userId);
          if (state.completions.length > 0) {
            await supabase.from('task_completions').insert(
              state.completions.map((c) => ({ user_id: userId, id: c.id, data: c }))
            );
          }
        } catch (e) {
          console.error('[syncEngine] Failed to sync tasks:', e);
        }
      }, 1500);
    })
  );

  // Achievements sync
  unsubscribers.push(
    useAchievementStore.subscribe((state) => {
      if (saveTimers['achievements']) clearTimeout(saveTimers['achievements']);
      saveTimers['achievements'] = setTimeout(async () => {
        try {
          await supabase.from('achievements').delete().eq('user_id', userId);
          if (state.achievements.length > 0) {
            await supabase.from('achievements').insert(
              state.achievements.map((a) => ({ id: a.id, user_id: userId, data: a }))
            );
          }
        } catch (e) {
          console.error('[syncEngine] Failed to sync achievements:', e);
        }
      }, 1500);
    })
  );

  // Equipment sync
  unsubscribers.push(
    useEquipmentStore.subscribe((state) => {
      if (saveTimers['equipment']) clearTimeout(saveTimers['equipment']);
      saveTimers['equipment'] = setTimeout(async () => {
        try {
          await supabase.from('equipment').delete().eq('user_id', userId);
          if (state.equipment.length > 0) {
            await supabase.from('equipment').insert(
              state.equipment.map((e) => ({
                user_id: userId,
                id: e.id,
                data: e,
              }))
            );
          }
        } catch (e) {
          console.error('[syncEngine] Failed to sync equipment:', e);
        }
      }, 1500);
    })
  );

  // Shop sync
  unsubscribers.push(
    useShopStore.subscribe((state) => {
      saveToSupabase('shop_data', userId, {
        custom_rewards: state.customRewards,
        inventory: state.inventory,
        monthly_purchases: state.monthlyPurchases,
      });
    })
  );

  // Bosses sync
  unsubscribers.push(
    useBossStore.subscribe((state) => {
      if (saveTimers['bosses']) clearTimeout(saveTimers['bosses']);
      saveTimers['bosses'] = setTimeout(async () => {
        try {
          await supabase.from('bosses').delete().eq('user_id', userId);
          if (state.bosses.length > 0) {
            await supabase.from('bosses').insert(
              state.bosses.map((b) => ({ user_id: userId, id: b.id, data: b }))
            );
          }
        } catch (e) {
          console.error('[syncEngine] Failed to sync bosses:', e);
        }
      }, 1500);
    })
  );

  // Calendar sync
  unsubscribers.push(
    useCalendarStore.subscribe((state) => {
      saveToSupabase('calendar_data', userId, {
        events: state.events,
        semester_config: state.semesterConfig,
      });
    })
  );

  // Principles sync
  unsubscribers.push(
    usePrincipleStore.subscribe((state) => {
      saveToSupabase('principles_data', userId, {
        principles: state.principles,
        decision_logs: state.decisionLogs,
        goals: state.goals,
        five_step_flows: state.fiveStepFlows,
      });
    })
  );

  // Mainline quests sync
  unsubscribers.push(
    useMainlineStore.subscribe((state) => {
      if (saveTimers['mainline_quests']) clearTimeout(saveTimers['mainline_quests']);
      saveTimers['mainline_quests'] = setTimeout(async () => {
        try {
          await supabase.from('mainline_quests').delete().eq('user_id', userId);
          if (state.mainlineQuests.length > 0) {
            await supabase.from('mainline_quests').insert(
              state.mainlineQuests.map((q) => ({
                user_id: userId,
                id: q.id,
                data: q,
              }))
            );
          }
        } catch (e) {
          console.error('[syncEngine] Failed to sync mainline quests:', e);
        }
      }, 1500);
    })
  );

  // Gacha sync
  unsubscribers.push(
    useGachaStore.subscribe((state) => {
      saveToSupabase('gacha_data', userId, {
        pools: state.pools,
        history: state.history,
        pity: state.pity,
      });
    })
  );

  return () => {
    unsubscribers.forEach((unsub) => unsub());
    // Clear all pending timers
    Object.values(saveTimers).forEach((timer) => clearTimeout(timer));
  };
}
