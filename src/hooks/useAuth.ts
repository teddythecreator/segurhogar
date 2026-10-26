import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { Profile, UserRole } from '@/types/database';
import type { User } from '@supabase/supabase-js';

interface UseAuthReturn {
  user: Profile | null;
  authUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, nombre: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { user, setUser, isAuthenticated, logout } = useAuthStore();

  // Cargar el profile desde Supabase
  const loadProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error cargando profile:', error);
        return null;
      }

      return data as Profile;
    } catch (err) {
      console.error('Error cargando profile:', err);
      return null;
    }
  };

  // Refrescar el profile
  const refreshProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const profile = await loadProfile(user.id);
      setUser(profile);
    }
  };

  // Inicializar: escuchar cambios de auth de Supabase
  useEffect(() => {
    // Verificar si hay usuario en el store (modo demo)
    if (user) {
      return;
    }

    // Obtener sesión actual de Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id).then((profile) => {
          if (profile) {
            setUser(profile);
          }
        });
      }
    });

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await loadProfile(session.user.id);
          if (profile) {
            setUser(profile);
          }
        } else if (event === 'SIGNED_OUT') {
          logout();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sign in (Supabase)
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Sign up (Supabase)
  const signUp = async (email: string, password: string, nombre: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
          },
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Intentar cerrar sesión en Supabase (puede fallar si no hay sesión)
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error cerrando sesión en Supabase:', err);
    } finally {
      // Siempre limpiar el store
      logout();
    }
  };

  // Reset password (Supabase)
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/recuperar-contrasena`,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Update password (Supabase)
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return {
    user,
    authUser: null, // No usamos authUser en modo demo
    isLoading: false, // En modo demo no hay loading
    isAuthenticated,
    role: user?.role ?? null,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
  };
}
