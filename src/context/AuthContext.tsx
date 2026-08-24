import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getUserProfile, upsertUserProfile } from '../lib/supabaseService';
import { getInitialSeedData, getBlankUserData } from '../utils/defaultData';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isCloudConnected: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  demoLogin: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (answers?: {
    income: number;
    expenses: number;
    invested: number;
    emergencyGoal: number;
  }) => Promise<void>;
  loadSeedProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'cfp_auth_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isCloudConnected = isSupabaseConfigured();

  // Initialize session and listen to Supabase Auth state
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        if (isSupabaseConfigured()) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error('[Supabase Auth] Session error:', sessionError);
          }

          if (session?.user) {
            const userId = session.user.id;
            const userEmail = session.user.email || '';
            const userMetaName = session.user.user_metadata?.name || session.user.user_metadata?.full_name;
            const fallbackName = userMetaName || userEmail.split('@')[0] || 'Usuário';

            // Fetch DB profile if exists
            const dbProfile = await getUserProfile(userId);

            const profile: UserProfile = {
              id: userId,
              name: dbProfile?.name || fallbackName,
              email: userEmail,
              emergencyGoal: dbProfile?.emergencyGoal || 40000,
              monthlyInvestmentGoalPercent: 20,
              budgetRule: dbProfile?.budgetRule || {
                necessitiesPercent: 50,
                leisurePercent: 30,
                investmentsPercent: 20,
              },
              hasCompletedOnboarding: true,
              createdAt: session.user.created_at || new Date().toISOString(),
            };

            if (mounted) {
              setUser(profile);
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
            }
          } else {
            // Check local cache if any
            const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
            if (savedSession && mounted) {
              setUser(JSON.parse(savedSession));
            } else if (mounted) {
              // Default to null user if not authenticated in Supabase
              setUser(null);
            }
          }
        } else {
          // Fallback if Supabase credentials are not filled yet
          const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
          if (savedSession && mounted) {
            setUser(JSON.parse(savedSession));
          } else if (mounted) {
            const blank = getBlankUserData('Jeferson Rocha', 'jefersonrocha998@gmail.com');
            setUser(blank.profile);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(blank.profile));
          }
        }
      } catch (err) {
        console.error('[Auth Init Error]:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initSession();

    // Subscribe to Supabase auth state change events
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          const userId = session.user.id;
          const userEmail = session.user.email || '';
          const userMetaName = session.user.user_metadata?.name || session.user.user_metadata?.full_name;
          const fallbackName = userMetaName || userEmail.split('@')[0] || 'Usuário';

          const dbProfile = await getUserProfile(userId);

          const profile: UserProfile = {
            id: userId,
            name: dbProfile?.name || fallbackName,
            email: userEmail,
            emergencyGoal: dbProfile?.emergencyGoal || 40000,
            monthlyInvestmentGoalPercent: 20,
            budgetRule: dbProfile?.budgetRule || {
              necessitiesPercent: 50,
              leisurePercent: 30,
              investmentsPercent: 20,
            },
            hasCompletedOnboarding: true,
            createdAt: session.user.created_at || new Date().toISOString(),
          };

          setUser(profile);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Supabase Login
  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const cleanEmail = email.toLowerCase().trim();

      if (isSupabaseConfigured()) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (authError) {
          console.error('[Supabase Auth Login Error]:', authError);
          // Friendly translated error message
          if (authError.message.includes('Invalid login credentials')) {
            setError('E-mail ou senha incorretos. Verifique suas credenciais.');
          } else if (authError.message.includes('Email not confirmed')) {
            setError('E-mail ainda não confirmado. Verifique sua caixa de entrada.');
          } else {
            setError(authError.message || 'Erro ao realizar login no Supabase.');
          }
          setIsLoading(false);
          return false;
        }

        if (data.user) {
          const dbProfile = await getUserProfile(data.user.id);
          const profile: UserProfile = {
            id: data.user.id,
            name: dbProfile?.name || data.user.user_metadata?.name || cleanEmail.split('@')[0],
            email: cleanEmail,
            emergencyGoal: dbProfile?.emergencyGoal || 40000,
            monthlyInvestmentGoalPercent: 20,
            budgetRule: dbProfile?.budgetRule || {
              necessitiesPercent: 50,
              leisurePercent: 30,
              investmentsPercent: 20,
            },
            hasCompletedOnboarding: true,
            createdAt: data.user.created_at || new Date().toISOString(),
          };

          setUser(profile);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
          setIsLoading(false);
          return true;
        }
      }

      // Fallback mode if Supabase env vars are not set
      const profile: UserProfile = {
        id: `user-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: cleanEmail === 'jefersonrocha998@gmail.com' ? 'Jeferson Rocha' : cleanEmail.split('@')[0],
        email: cleanEmail,
        emergencyGoal: 40000,
        monthlyInvestmentGoalPercent: 20,
        budgetRule: {
          necessitiesPercent: 50,
          leisurePercent: 30,
          investmentsPercent: 20,
        },
        hasCompletedOnboarding: true,
        createdAt: new Date().toISOString(),
      };
      setUser(profile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error(err);
      setError('Ocorreu um erro ao realizar o login. Tente novamente.');
      setIsLoading(false);
      return false;
    }
  };

  // Supabase Signup
  const signup = async (email: string, pass: string, name?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const cleanEmail = email.toLowerCase().trim();
      const cleanName = name?.trim() || cleanEmail.split('@')[0];

      if (isSupabaseConfigured()) {
        const { data, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: pass,
          options: {
            data: {
              name: cleanName,
            },
          },
        });

        if (authError) {
          console.error('[Supabase Auth Signup Error]:', authError);
          if (authError.message.includes('User already registered')) {
            setError('Este e-mail já está cadastrado. Tente fazer login.');
          } else if (authError.message.includes('Password should be at least')) {
            setError('A senha deve ter no mínimo 6 caracteres.');
          } else {
            setError(authError.message || 'Erro ao criar conta no Supabase.');
          }
          setIsLoading(false);
          return false;
        }

        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            name: cleanName,
            email: cleanEmail,
            emergencyGoal: 40000,
            monthlyInvestmentGoalPercent: 20,
            budgetRule: {
              necessitiesPercent: 50,
              leisurePercent: 30,
              investmentsPercent: 20,
            },
            hasCompletedOnboarding: true,
            createdAt: data.user.created_at || new Date().toISOString(),
          };

          await upsertUserProfile(profile);
          setUser(profile);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
          setIsLoading(false);
          return true;
        }
      }

      // Local fallback
      const profile: UserProfile = {
        id: `user-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: cleanName,
        email: cleanEmail,
        emergencyGoal: 40000,
        monthlyInvestmentGoalPercent: 20,
        budgetRule: {
          necessitiesPercent: 50,
          leisurePercent: 30,
          investmentsPercent: 20,
        },
        hasCompletedOnboarding: true,
        createdAt: new Date().toISOString(),
      };

      setUser(profile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      setIsLoading(false);
      return true;
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Erro ao criar conta.');
      setIsLoading(false);
      return false;
    }
  };

  // Supabase Password Reset
  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const cleanEmail = email.toLowerCase().trim();
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/`,
        });

        if (error) {
          return { success: false, message: error.message };
        }
      }

      return {
        success: true,
        message: `Enviamos as instruções de recuperação para ${cleanEmail}. Verifique sua caixa de entrada.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Erro ao solicitar redefinição de senha.',
      };
    }
  };

  // Supabase Logout
  const logout = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const demoLogin = () => {
    const seed = getInitialSeedData('Jeferson', 'JefersonRocha998@gmail.com');
    setUser(seed.profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(seed.profile));
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated: UserProfile = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured()) {
      await upsertUserProfile(updated);
    }
  };

  const completeOnboarding = async (answers?: {
    income: number;
    expenses: number;
    invested: number;
    emergencyGoal: number;
  }) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      hasCompletedOnboarding: true,
      emergencyGoal: answers?.emergencyGoal || user.emergencyGoal || 40000,
    };
    setUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured()) {
      await upsertUserProfile(updated);
    }
  };

  const loadSeedProfile = () => {
    const seed = getInitialSeedData('Jeferson', 'JefersonRocha998@gmail.com');
    setUser(seed.profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(seed.profile));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        isCloudConnected,
        login,
        signup,
        logout,
        demoLogin,
        resetPassword,
        updateProfile,
        completeOnboarding,
        loadSeedProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
