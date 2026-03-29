import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task } from '../types';
import { generateId } from '../lib/gameFormulas';

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status' | 'isFirstCompletion'>) => void;
  completeTask: (taskId: string, isOverachieve?: boolean) => { exp: number; stardust: number } | null;
  getTodayTasks: () => Task[];
}

const DEMO_TASKS: Task[] = [
  {
    id: '1',
    userId: 'demo',
    title: '完成每日锻炼30分钟',
    element: 'body',
    rarity: 1,
    cycle: 'daily',
    baseExp: 25,
    baseStardust: 8,
    staminaCost: 12,
    status: 'pending',
    isFirstCompletion: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'demo',
    title: '阅读技术书籍一章',
    element: 'mind',
    rarity: 2,
    cycle: 'weekly',
    baseExp: 65,
    baseStardust: 25,
    staminaCost: 28,
    status: 'pending',
    isFirstCompletion: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: 'demo',
    title: '完成项目核心功能开发',
    element: 'craft',
    rarity: 4,
    cycle: 'onetime',
    baseExp: 300,
    baseStardust: 120,
    staminaCost: 65,
    status: 'pending',
    isFirstCompletion: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    userId: 'demo',
    title: '和朋友聚餐',
    element: 'social',
    rarity: 1,
    cycle: 'daily',
    baseExp: 20,
    baseStardust: 6,
    staminaCost: 10,
    status: 'completed',
    isFirstCompletion: false,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    userId: 'demo',
    title: '冥想练习',
    element: 'spirit',
    rarity: 1,
    cycle: 'daily',
    baseExp: 20,
    baseStardust: 7,
    staminaCost: 10,
    status: 'pending',
    isFirstCompletion: true,
    createdAt: new Date().toISOString(),
  },
];

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: DEMO_TASKS,
      addTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: generateId(),
          status: 'pending',
          isFirstCompletion: true,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ tasks: [...s.tasks, task] }));
      },
      completeTask: (taskId, isOverachieve = false) => {
        const tasks = get().tasks;
        const task = tasks.find((t) => t.id === taskId);
        if (!task || task.status === 'completed') return null;

        let expMultiplier = 1.0;
        let stardustMultiplier = 1.0;
        if (task.isFirstCompletion) { expMultiplier *= 2.0; stardustMultiplier *= 2.0; }
        if (isOverachieve) { expMultiplier *= 1.5; stardustMultiplier *= 1.5; }

        const reward = {
          exp: Math.round(task.baseExp * expMultiplier),
          stardust: Math.round(task.baseStardust * stardustMultiplier),
        };

        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: 'completed', isFirstCompletion: false, completedAt: new Date().toISOString() }
              : t
          ),
        }));
        return reward;
      },
      getTodayTasks: () => {
        const tasks = get().tasks;
        const today = new Date().toDateString();
        return tasks.filter((t) => {
          if (t.cycle === 'daily') return true;
          if (t.cycle === 'weekly') return true;
          if (t.status === 'pending') return true;
          if (t.completedAt) {
            return new Date(t.completedAt).toDateString() === today;
          }
          return false;
        });
      },
    }),
    { name: 'task-store' }
  )
);
