import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalendarEvent, SemesterConfig } from '../types';
import { generateId } from '../lib/gameFormulas';

interface CalendarStore {
  events: CalendarEvent[];
  semesterConfig: SemesterConfig | null;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  setSemesterConfig: (config: SemesterConfig) => void;
  getEventsForDate: (date: string) => CalendarEvent[];
}

// Returns 0-6 day of week for a date string (0=Sunday)
function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr).getDay();
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set, get) => ({
      events: [],
      semesterConfig: null,

      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, { ...event, id: generateId() }],
        })),

      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),

      deleteEvent: (id) =>
        set((state) => ({ events: state.events.filter((e) => e.id !== id) })),

      setSemesterConfig: (config) => set({ semesterConfig: config }),

      getEventsForDate: (date) => {
        const dayOfWeek = getDayOfWeek(date);
        return get().events.filter((e) => {
          if (e.isRecurring) return e.dayOfWeek === dayOfWeek;
          return e.date === date;
        });
      },
    }),
    { name: 'life-rpg-calendar' }
  )
);
