import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasRole: (role: Role) => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      hasRole: (role) => {
        const { user } = get();
        return user?.role === role || user?.role === 'admin';
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },
    }),
    {
      name: 'segurhogar-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
