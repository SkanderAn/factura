'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { login as apiLogin, register as apiRegister, logout as apiLogout, isAuthenticated } from './api';
import type { RegisterData } from '@/types';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status on mount
    setIsLoggedIn(isAuthenticated());
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await apiLogin(email, password);
    setIsLoggedIn(true);
    router.push('/dashboard');
  };

  const register = async (data: RegisterData) => {
    await apiRegister(data);
    // Auto-login after registration
    await apiLogin(data.email, data.password);
    setIsLoggedIn(true);
    router.push('/dashboard');
  };

  const logout = () => {
    apiLogout();
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
