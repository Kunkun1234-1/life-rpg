import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Principle, DecisionLog, Goal, FiveStepFlow } from '../types';
import { generateId } from '../lib/gameFormulas';

interface PrincipleStore {
  principles: Principle[];
  decisionLogs: DecisionLog[];
  goals: Goal[];
  fiveStepFlows: FiveStepFlow[];
  // Principle CRUD
  addPrinciple: (p: Omit<Principle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePrinciple: (id: string, updates: Partial<Principle>) => void;
  deletePrinciple: (id: string) => void;
  // DecisionLog CRUD
  addDecisionLog: (log: Omit<DecisionLog, 'id' | 'createdAt'>) => void;
  updateDecisionLog: (id: string, updates: Partial<DecisionLog>) => void;
  deleteDecisionLog: (id: string) => void;
  // Goal CRUD
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  // FiveStepFlow CRUD
  addFiveStepFlow: (flow: Omit<FiveStepFlow, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFiveStepFlow: (id: string, updates: Partial<FiveStepFlow>) => void;
  deleteFiveStepFlow: (id: string) => void;
  // Convert log to principle
  convertLogToPrinciple: (logId: string) => void;
}

export const usePrincipleStore = create<PrincipleStore>()(
  persist(
    (set, get) => ({
      principles: [],
      decisionLogs: [],
      goals: [],
      fiveStepFlows: [],

      addPrinciple: (p) =>
        set((state) => ({
          principles: [
            ...state.principles,
            {
              ...p,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updatePrinciple: (id, updates) =>
        set((state) => ({
          principles: state.principles.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        })),

      deletePrinciple: (id) =>
        set((state) => ({ principles: state.principles.filter((p) => p.id !== id) })),

      addDecisionLog: (log) =>
        set((state) => ({
          decisionLogs: [
            ...state.decisionLogs,
            { ...log, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateDecisionLog: (id, updates) =>
        set((state) => ({
          decisionLogs: state.decisionLogs.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        })),

      deleteDecisionLog: (id) =>
        set((state) => ({
          decisionLogs: state.decisionLogs.filter((l) => l.id !== id),
        })),

      addGoal: (goal) =>
        set((state) => ({
          goals: [
            ...state.goals,
            { ...goal, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),

      deleteGoal: (id) =>
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),

      addFiveStepFlow: (flow) =>
        set((state) => ({
          fiveStepFlows: [
            ...state.fiveStepFlows,
            {
              ...flow,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateFiveStepFlow: (id, updates) =>
        set((state) => ({
          fiveStepFlows: state.fiveStepFlows.map((f) =>
            f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
          ),
        })),

      deleteFiveStepFlow: (id) =>
        set((state) => ({
          fiveStepFlows: state.fiveStepFlows.filter((f) => f.id !== id),
        })),

      convertLogToPrinciple: (logId) => {
        const log = get().decisionLogs.find((l) => l.id === logId);
        if (!log) return;
        const now = new Date().toISOString();
        const newPrinciple: Principle = {
          id: generateId(),
          userId: log.userId,
          scenario: log.scenario,
          action: log.decision,
          attributeKeys: [],
          sourceLogId: log.id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          principles: [...state.principles, newPrinciple],
          decisionLogs: state.decisionLogs.map((l) =>
            l.id === logId ? { ...l, newPrincipleId: newPrinciple.id } : l
          ),
        }));
      },
    }),
    { name: 'life-rpg-principles' }
  )
);
