import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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
  const [user, setUser] = useState<Profile | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Inicializar: escuchar cambios de auth
  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id).then((profile) => {
          setUser(profile);
          setIsLoading(false);
        });
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await loadProfile(session.user.id);
          setUser(profile);
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const profile = await loadProfile(session.user.id);
          setUser(profile);
        } else if (event === 'USER_UPDATED' && session?.user) {
          const profile = await loadProfile(session.user.id);
          setUser(profile);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { error };
      }

      return { error: null };
    } catch (err) {
      setIsLoading(false);
      return { error: err as Error };
    }
  };

  // Sign up
  const signUp = async (email: string, password: string, nombre: string) => {
    try {
      setIsLoading(true);
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
        setIsLoading(false);
        return { error };
      }

      return { error: null };
    } catch (err) {
      setIsLoading(false);
      return { error: err as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAuthUser(null);
    } catch (err) {
      console.error('Error cerrando sesión:', err);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/nueva-contrasena`,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Update password
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
    authUser,
    isLoading,
    isAuthenticated: !!user,
    role: user?.role ?? null,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
  };
}
