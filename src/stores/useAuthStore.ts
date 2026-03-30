import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({
        session,
        user: session?.user ?? null,
        loading: false,
      });

      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
          loading: false,
        });
      });
    } catch {
      set({ loading: false });
    }
  },

  signUp: async (email, password) => {
    set({ error: null, loading: true });
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ error: error.message, loading: false });
      return false;
    }
    set({ loading: false });
    return true;
  },

  signIn: async (email, password) => {
    set({ error: null, loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message, loading: false });
      return false;
    }
    set({ loading: false });
    return true;
  },

  signInWithGithub: async () => {
    set({ error: null });
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'github' });
    if (error) {
      set({ error: error.message });
    }
  },

  signOut: async () => {
    set({ error: null });
    await supabase.auth.signOut();
    // Clear all life-rpg localStorage keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('life-rpg-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    set({ user: null, session: null });
    // Reload to reset all Zustand stores
    window.location.href = '/';
  },

  clearError: () => set({ error: null }),
}));
