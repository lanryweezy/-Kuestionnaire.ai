import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  signInWithGoogle: () => Promise<{ url?: string; error: AuthError | null }>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      return { url: data.url, error: null };
    } catch (error) {
      const authError = error as AuthError;
      set({ error: authError.message, isLoading: false });
      return { url: undefined, error: authError };
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  checkAuth: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      set({
        session,
        user: session?.user ?? null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

// Set up auth state change listener
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    const state = useAuthStore.getState();

    switch (event) {
      case 'SIGNED_IN':
        state.checkAuth();
        break;
      case 'SIGNED_OUT':
        useAuthStore.setState({ user: null, session: null, isLoading: false });
        break;
      case 'TOKEN_REFRESHED':
        useAuthStore.setState({ session, isLoading: false });
        break;
      case 'USER_UPDATED':
        state.checkAuth();
        break;
    }
  });
}
