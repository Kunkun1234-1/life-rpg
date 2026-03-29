import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task } from '../types';
import { generateId } from '../lib/gameFormulas';

interface TaskStoreState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'isFirstCompletion' | 'status'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string, isOverachieve?: boolean) => void;
  getActiveTasks: () => Task[];
  getHistoryTasks: () => Task[];
  getEpicLegendTasks: () => Task[];
}

const SAMPLE_TASKS: Task[] = [
  {
    id: generateId(),
    userId: 'local',
    title: '晨间跑步 5km',
    description: '每天早晨完成5公里跑步训练',
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
    id: generateId(),
    userId: 'local',
    title: '阅读技术书籍',
    description: '每周阅读至少一章技术书籍并做笔记',
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
    id: generateId(),
    userId: 'local',
    title: '完成副业项目MVP',
    description: '完成副业项目的最小可行版本并上线',
    element: 'craft',
    rarity: 4,
    cycle: 'onetime',
    baseExp: 300,
    baseStardust: 120,
    staminaCost: 65,
    status: 'pending',
    isFirstCompletion: true,
    subtasks: [
      {
        id: generateId(),
        userId: 'local',
        title: '完成核心功能开发',
        element: 'craft',
        rarity: 4,
        cycle: 'onetime',
        baseExp: 75,
        baseStardust: 30,
        staminaCost: 16,
        status: 'pending',
        isFirstCompletion: true,
        parentTaskId: '',
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        userId: 'local',
        title: 'UI设计和完善',
        element: 'craft',
        rarity: 4,
        cycle: 'onetime',
        baseExp: 75,
        baseStardust: 30,
        staminaCost: 16,
        status: 'pending',
        isFirstCompletion: true,
        parentTaskId: '',
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        userId: 'local',
        title: '部署上线',
        element: 'craft',
        rarity: 4,
        cycle: 'onetime',
        baseExp: 75,
        baseStardust: 30,
        staminaCost: 16,
        status: 'pending',
        isFirstCompletion: true,
        parentTaskId: '',
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

export const useTaskStore = create<TaskStoreState>()(
  persist(
    (set, get) => ({
      tasks: SAMPLE_TASKS,

      addTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: generateId(),
          userId: 'local',
          status: 'pending',
          isFirstCompletion: true,
          createdAt: new Date().toISOString(),
        };
        set(state => ({ tasks: [...state.tasks, task] }));
      },

      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
        }));
      },

      deleteTask: (id) => {
        set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
      },

      completeTask: (id, _isOverachieve = false) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id === id) {
              return {
                ...t,
                status: 'completed' as const,
                completedAt: new Date().toISOString(),
                isFirstCompletion: false,
              };
            }
            return t;
          }),
        }));
      },

      getActiveTasks: () => {
        return get().tasks.filter(t => t.status === 'pending' && !t.parentTaskId);
      },

      getHistoryTasks: () => {
        return get().tasks.filter(t => t.status === 'completed' || t.status === 'archived');
      },

      getEpicLegendTasks: () => {
        return get().tasks.filter(t => (t.rarity === 4 || t.rarity === 5) && !t.parentTaskId);
      },
    }),
    { name: 'task-store' }
  )
);
