import { createContext, useContext, useEffect, useState, ReactNode, createElement } from 'react';
import { api } from '@/services/apiClient';
import type { UserSummary } from '@/types';

interface AuthContextValue {
  currentUser: UserSummary | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
    displayName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ user: UserSummary }>('/api/auth/me')
      .then(({ user }) => {
        setCurrentUser(user);
      })
      .catch(() => {
        setCurrentUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const { user } = await api.post<{ user: UserSummary }>('/api/auth/login', { email, password });
    setCurrentUser(user);
  }

  async function register(
    email: string,
    password: string,
    username: string,
    displayName: string,
  ): Promise<void> {
    const { user } = await api.post<{ user: UserSummary }>('/api/auth/register', {
      email,
      password,
      username,
      displayName,
    });
    setCurrentUser(user);
  }

  async function logout(): Promise<void> {
    await api.post('/api/auth/logout');
    setCurrentUser(null);
  }

  const value: AuthContextValue = {
    currentUser,
    isLoading,
    login,
    register,
    logout,
  };

  return createElement(AuthContext.Provider, { value }, children);
}

function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export { useAuth, AuthProvider };
export type { AuthContextValue };
