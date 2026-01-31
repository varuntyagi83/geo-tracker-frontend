// components/AuthProvider.tsx
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { AuthContext, User, getStoredUser, setStoredUser } from '@/lib/auth';
import {
  loginUser,
  signupUser,
  verifyAuthToken,
  logoutUser as apiLogout,
  getAuthToken,
  setAuthToken,
  type AuthUser,
} from '@/lib/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      const token = getAuthToken();

      if (token) {
        try {
          // Verify token with backend
          const response = await verifyAuthToken();
          if (response.valid && response.user) {
            const user: User = {
              email: response.user.email,
              name: response.user.name,
              company: response.user.company,
            };
            setUser(user);
            setStoredUser(user);
          } else {
            // Token invalid, clear it
            setAuthToken(null);
            setStoredUser(null);
          }
        } catch (error) {
          // Token verification failed, try localStorage fallback
          console.warn('Token verification failed, checking localStorage');
          const storedUser = getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            // Clear invalid token
            setAuthToken(null);
          }
        }
      } else {
        // No token, check localStorage (for backward compatibility)
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      }

      setIsLoading(false);
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
