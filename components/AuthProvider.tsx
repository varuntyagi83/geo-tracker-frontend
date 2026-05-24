// components/AuthProvider.tsx
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { AuthContext, User, setStoredUser, UserPermissions } from '@/lib/auth';
import {
  loginUser,
  signupUser,
  getCurrentUser,
  logoutUser as apiLogout,
} from '@/lib/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount via httpOnly cookie
    const initAuth = async () => {
      try {
        const response = await getCurrentUser();
        if (response.success && response.user) {
          const userData: User = {
            email: response.user.email,
            name: response.user.name,
            company: response.user.company,
            role: response.user.role,
            permissions: response.permissions as UserPermissions,
          };
          setUser(userData);
          setStoredUser(userData);
        } else {
          setStoredUser(null);
          setUser(null);
        }
      } catch {
        // 401 or network error means not logged in
        setStoredUser(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await loginUser(email, password);

      if (response.success && response.user) {
        const user: User = {
          email: response.user.email,
          name: response.user.name,
          company: response.user.company,
          role: response.user.role,
          permissions: response.permissions as UserPermissions,
        };
        setUser(user);
        setStoredUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    company?: string
  ): Promise<boolean> => {
    try {
      const response = await signupUser(email, password, name, company);

      if (response.success && response.user) {
        const user: User = {
          email: response.user.email,
          name: response.user.name,
          company: response.user.company,
          role: response.user.role || 'user',
          permissions: response.permissions as UserPermissions,
        };
        setUser(user);
        setStoredUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup failed:', error);
      // Check if it's a duplicate email error
      if (error instanceof Error && error.message.includes('already registered')) {
        throw new Error('This email is already registered. Please log in instead.');
      }
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setStoredUser(null);
    apiLogout(); // Clear token
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
