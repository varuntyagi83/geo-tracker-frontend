// components/AuthProvider.tsx
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { AuthContext, User, getStoredUser, setStoredUser } from '@/lib/auth';

// Demo users for testing (in production, use a real auth backend)
const DEMO_USERS: Record<string, { password: string; name: string; company?: string }> = {
  'demo@geotracker.io': { password: 'demo123', name: 'Demo User', company: 'Demo Company' },
  'admin@geotracker.io': { password: 'admin123', name: 'Admin User', company: 'GEO Tracker' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = getStoredUser();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check demo users or allow any email with password "demo123" for testing
    const demoUser = DEMO_USERS[email.toLowerCase()];
    if (demoUser && demoUser.password === password) {
      const user: User = { email, name: demoUser.name, company: demoUser.company };
      setUser(user);
      setStoredUser(user);
      return true;
    }

    // For demo purposes, allow signup with any email and password length >= 6
    if (password.length >= 6) {
      const user: User = { email, name: email.split('@')[0] };
      setUser(user);
      setStoredUser(user);
      return true;
    }

    return false;
  };

  const signup = async (email: string, password: string, name: string, company?: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password.length < 6) {
      return false;
    }

    const user: User = { email, name, company };
    setUser(user);
    setStoredUser(user);
    return true;
  };

  const logout = () => {
    setUser(null);
    setStoredUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
