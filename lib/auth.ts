// lib/auth.ts
// Simple authentication context and utilities

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserPermissions {
  can_view_leads: boolean;
  can_view_emails: boolean;
  can_update_leads: boolean;
  can_delete_leads: boolean;
  can_view_stats: boolean;
  can_manage_users: boolean;
  can_access_dashboard: boolean;
  can_access_admin: boolean;
}

export interface User {
  email: string;
  name?: string;
  company?: string;
  role?: string;  // 'admin', 'user', or 'demo'
  permissions?: UserPermissions;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, company?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple local storage based auth for demo purposes
// In production, replace with Supabase Auth or similar
const AUTH_STORAGE_KEY = 'geo_tracker_auth';

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function setStoredUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
