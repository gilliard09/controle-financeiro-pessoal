import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { getBlankUserData, getInitialSeedData } from '../utils/defaultData';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string, name?: string) => Promise<boolean>;
  logout: () => void;
  demoLogin: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeOnboarding: (answers?: {
    income: number;
    expenses: number;
    invested: number;
    emergencyGoal: number;
  }) => void;
  loadSeedProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'cfp_auth_user_session';
const USERS_REGISTRY_KEY = 'cfp_registered_users';
const CREDENTIALS_KEY = 'cfp_auth_credentials';

// Pre-registered system accounts
const DEFAULT_SYSTEM_CREDENTIALS: Record<string, string> = {
  'jefersonrocha998@gmail.com': 'Jef190997',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    try {
      // Ensure default credentials registry exists
      const savedCreds = localStorage.getItem(CREDENTIALS_KEY);
      if (!savedCreds) {
        localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(DEFAULT_SYSTEM_CREDENTIALS));
      } else {
        const parsed = JSON.parse(savedCreds);
        const merged = { ...DEFAULT_SYSTEM_CREDENTIALS, ...parsed };
        localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(merged));
      }

      const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        setUser(parsed);
      } else {
        // Start directly with Jeferson Rocha blank profile ready for manual input
        const blankUser = getBlankUserData('Jeferson Rocha', 'jefersonrocha998@gmail.com');
        setUser(blankUser.profile);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(blankUser.profile));
      }
    } catch (e) {
      console.error('Error loading session:', e);
      const blankUser = getBlankUserData('Jeferson Rocha', 'jefersonrocha998@gmail.com');
      setUser(blankUser.profile);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 400)); // smooth micro-delay

    try {
      const cleanEmail = email.toLowerCase().trim();
      const savedCreds = localStorage.getItem(CREDENTIALS_KEY);
      const creds: Record<string, string> = savedCreds ? JSON.parse(savedCreds) : DEFAULT_SYSTEM_CREDENTIALS;

      // If registered with password, check match
      if (creds[cleanEmail] && creds[cleanEmail] !== pass) {
        setError('Senha incorreta para este e-mail. Verifique os dados informados.');
        setIsLoading(false);
        return false;
      }

      // If not yet saved in credentials, register pass
      if (!creds[cleanEmail]) {
        creds[cleanEmail] = pass;
        localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
      }

      const usersRaw = localStorage.getItem(USERS_REGISTRY_KEY);
      const users: UserProfile[] = usersRaw ? JSON.parse(usersRaw) : [];
      const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

      if (found) {
        setUser(found);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(found));
        setIsLoading(false);
        return true;
      }

      // If user profile not in registry, create blank clean profile
      const name = cleanEmail === 'jefersonrocha998@gmail.com' ? 'Jeferson Rocha' : cleanEmail.split('@')[0];
      const cleanName = name.charAt(0).toUpperCase() + name.slice(1);
      const newUser: UserProfile = {
        id: `user-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: cleanName,
        email: cleanEmail,
        emergencyGoal: 30000,
        monthlyInvestmentGoalPercent: 20,
        budgetRule: {
          necessitiesPercent: 50,
          leisurePercent: 30,
          investmentsPercent: 20,
        },
        hasCompletedOnboarding: true,
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(updatedUsers));
      setUser(newUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao realizar o login. Tente novamente.');
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (email: string, pass: string, name?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 400));

    try {
      const cleanEmail = email.toLowerCase().trim();
      const cleanName = name?.trim() || (cleanEmail === 'jefersonrocha998@gmail.com' ? 'Jeferson Rocha' : cleanEmail.split('@')[0]);

      // Save credentials
      const savedCreds = localStorage.getItem(CREDENTIALS_KEY);
      const creds: Record<string, string> = savedCreds ? JSON.parse(savedCreds) : DEFAULT_SYSTEM_CREDENTIALS;
      creds[cleanEmail] = pass;
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));

      const usersRaw = localStorage.getItem(USERS_REGISTRY_KEY);
      const users: UserProfile[] = usersRaw ? JSON.parse(usersRaw) : [];

      const newUser: UserProfile = {
        id: `user-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: cleanName,
        email: cleanEmail,
        emergencyGoal: 30000,
        monthlyInvestmentGoalPercent: 20,
        budgetRule: {
          necessitiesPercent: 50,
          leisurePercent: 30,
          investmentsPercent: 20,
        },
        hasCompletedOnboarding: true,
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...users.filter((u) => u.email !== newUser.email), newUser];
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(updatedUsers));
      setUser(newUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    } catch (e) {
      console.error(e);
      setError('Erro ao criar conta.');
      setIsLoading(false);
      return false;
    }
  };

  const demoLogin = () => {
    const seed = getInitialSeedData('Jeferson', 'JefersonRocha998@gmail.com');
    setUser(seed.profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(seed.profile));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    await new Promise((r) => setTimeout(r, 600));
    return {
      success: true,
      message: `Enviamos as instruções de recuperação para ${email}. Verifique sua caixa de entrada.`,
    };
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));

    // Also update users registry
    try {
      const usersRaw = localStorage.getItem(USERS_REGISTRY_KEY);
      if (usersRaw) {
        const users: UserProfile[] = JSON.parse(usersRaw);
        const nextUsers = users.map((u) => (u.id === user.id ? updated : u));
        localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(nextUsers));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const completeOnboarding = (answers?: {
    income: number;
    expenses: number;
    invested: number;
    emergencyGoal: number;
  }) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      hasCompletedOnboarding: true,
      emergencyGoal: answers?.emergencyGoal || user.emergencyGoal || 30000,
    };
    setUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
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
