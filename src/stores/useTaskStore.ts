import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskCompletion, AttributeKey } from '../types';
import { calculateTaskReward, calculateSubtaskReward, calculateStaminaCost } from '../lib/gameFormulas';
import { usePlayerStore } from './usePlayerStore';

interface CreateTaskData {
  title: string;
  description?: string;
  element: AttributeKey;
  rarity: Task['rarity'];
  cycle: Task['cycle'];
  baseExp: number;
  baseStardust: number;
  staminaCost: number;
  deadline?: string;
  subtasks?: Omit<Task, 'id' | 'createdAt' | 'isFirstCompletion' | 'status' | 'userId'>[];
}

interface TaskStore {
  tasks: Task[];
  completions: TaskCompletion[];

  createTask: (data: CreateTaskData) => void;
  completeTask: (taskId: string, isOverachieve: boolean) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  resetDailyTasks: () => void;
  resetWeeklyTasks: () => void;
  addSubtask: (parentId: string, subtask: Omit<Task, 'id' | 'createdAt' | 'isFirstCompletion' | 'status' | 'userId'>) => void;
  completeSubtask: (parentId: string, subtaskId: string) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      completions: [],

      createTask: (data) => {
        const now = new Date().toISOString();
        const newTask: Task = {
          id: crypto.randomUUID(),
          userId: 'local',
          title: data.title,
          description: data.description,
          element: data.element,
          rarity: data.rarity,
          cycle: data.cycle,
          baseExp: data.baseExp,
          baseStardust: data.baseStardust,
          staminaCost: data.staminaCost,
          status: 'pending',
          isFirstCompletion: true,
          deadline: data.deadline,
          createdAt: now,
          subtasks: data.subtasks?.map((st) => ({
            ...st,
            id: crypto.randomUUID(),
            userId: 'local',
            isFirstCompletion: true,
            status: 'pending' as const,
            createdAt: now,
          })),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      completeTask: (taskId, isOverachieve) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;

        const playerStore = usePlayerStore.getState();
        const { isOverdraft, rewardMultiplier: _ } = calculateStaminaCost(
          task.staminaCost,
          playerStore.stamina
        );

        const { exp, stardust } = calculateTaskReward(
          task.baseExp,
          task.baseStardust,
          {
            isFirstCompletion: task.isFirstCompletion,
            isOverachieve,
            isOverdraft,
            equipmentBonus: 0,
            expBoostActive: false,
            stardustBoostActive: false,
          }
        );

        const now = new Date().toISOString();
        const completion: TaskCompletion = {
          id: crypto.randomUUID(),
          taskId,
          userId: 'local',
          completedAt: now,
          isOverachieve,
          isFirstTime: task.isFirstCompletion,
          expEarned: exp,
          stardustEarned: stardust,
          staminaSpent: task.staminaCost,
        };

        playerStore.addExp(exp, task.element);
        playerStore.addStardust(stardust);
        playerStore.spendStamina(task.staminaCost);

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: 'completed' as const, isFirstCompletion: false, completedAt: now }
              : t
          ),
          completions: [...state.completions, completion],
        }));
      },

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      resetDailyTasks: () =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.cycle === 'daily' ? { ...t, status: 'pending' as const } : t
          ),
        })),

      resetWeeklyTasks: () =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.cycle === 'weekly' ? { ...t, status: 'pending' as const } : t
          ),
        })),

      addSubtask: (parentId, subtask) => {
        const now = new Date().toISOString();
        const newSubtask: Task = {
          ...subtask,
          id: crypto.randomUUID(),
          userId: 'local',
          isFirstCompletion: true,
          status: 'pending',
          createdAt: now,
          parentTaskId: parentId,
        };
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === parentId
              ? { ...t, subtasks: [...(t.subtasks ?? []), newSubtask] }
              : t
          ),
        }));
      },

      completeSubtask: (parentId, subtaskId) => {
        const parent = get().tasks.find((t) => t.id === parentId);
        if (!parent || !parent.subtasks) return;

        const subtask = parent.subtasks.find((s) => s.id === subtaskId);
        if (!subtask || subtask.status === 'completed') return;

        const subtaskCount = parent.subtasks.length;
        const rewards = calculateSubtaskReward(
          parent.baseExp,
          parent.baseStardust,
          parent.staminaCost,
          subtaskCount
        );

        const now = new Date().toISOString();
        const updatedSubtasks = parent.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, status: 'completed' as const, completedAt: now } : s
        );

        const allDone = updatedSubtasks.every((s) => s.status === 'completed');

        const playerStore = usePlayerStore.getState();
        playerStore.addExp(rewards.expPerSubtask, subtask.element);
        playerStore.addStardust(rewards.stardustPerSubtask);
        playerStore.spendStamina(rewards.staminaPerSubtask);

        if (allDone) {
          playerStore.addExp(rewards.completionBonus.exp, parent.element);
          playerStore.addStardust(rewards.completionBonus.stardust);
        }

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === parentId
              ? {
                  ...t,
                  subtasks: updatedSubtasks,
                  status: allDone ? ('completed' as const) : t.status,
                  completedAt: allDone ? now : t.completedAt,
                }
              : t
          ),
        }));
      },
    }),
    { name: 'life-rpg-tasks' }
  )
);
