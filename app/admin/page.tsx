// app/admin/page.tsx - Admin Panel for Lead Management
// Uses unified auth - redirects to /login if not authenticated
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Globe,
  Users,
  Mail,
  Building2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  Filter,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { getAuthToken } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Lead {
  id: number;
  company: string;
  email: string;
  website: string | null;
  industry: string | null;
  service: string;
  contact_name: string | null;
  status: string;
  email_sent: number;
  email_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

interface LeadStats {
  total: number;
  by_status: Record<string, number>;
  by_service: Record<string, number>;
  recent_7_days: number;
  emails_sent: number;
  email_success_rate: number;
}

interface AdminUser {
  username: string;
  role: string;
  permissions: {
    can_view_leads: boolean;
    can_view_emails: boolean;
    can_update_leads: boolean;
    can_delete_leads: boolean;
    can_view_stats: boolean;
    can_manage_users: boolean;
  };
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  qualified: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  converted: 'bg-green-500/20 text-green-400 border-green-500/30',
  lost: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Leads data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  // Selected lead for update
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Check unified auth - redirect to /login if not authenticated or no admin access
  useEffect(() => {
    if (authLoading) return;

    // Not logged in at all - redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // Logged in but doesn't have admin access - redirect to dashboard
    if (!user.permissions?.can_access_admin && user.role !== 'admin' && user.role !== 'demo') {
      router.push('/dashboard');
      return;
    }

    // User has admin access - set up admin user state
    const authToken = getAuthToken();
    if (authToken) {
      setToken(authToken);
      setAdminUser({
        username: user.email,
        role: user.role || 'user',
        permissions: {
          can_view_leads: user.permissions?.can_view_leads || false,
          can_view_emails: user.permissions?.can_view_emails || false,
          can_update_leads: user.permissions?.can_update_leads || false,
          can_delete_leads: user.permissions?.can_delete_leads || false,
          can_view_stats: user.permissions?.can_view_stats || false,
          can_manage_users: user.permissions?.can_manage_users || false,
        },
      });
    }
  }, [authLoading, user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const fetchLeads = useCallback(async () => {
    if (!token) return;

    setIsLoadingLeads(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`${API_BASE_URL}/api/admin/leads?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setIsLoadingLeads(false);
    }
  }, [token, statusFilter]);

  const fetchStats = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/leads/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [token]);

  // Fetch data when token is available
  useEffect(() => {
    if (token) {
      fetchLeads();
      fetchStats();
    }
  }, [token, fetchLeads, fetchStats]);

  const handleUpdateLead = async () => {
    if (!selectedLead || !newStatus || !token) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, notes: notes || null }),
      });

      if (response.ok) {
        setSelectedLead(null);
        setNewStatus('');
        setNotes('');
        fetchLeads();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to update lead:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Loading state - show while checking auth
  if (authLoading || !adminUser) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-dark-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="border-b border-dark-700 bg-dark-800/50 backdrop-blur-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                <Globe className="w-8 h-8 text-primary-500" />
                <div>
                  <h1 className="text-xl font-bold">Admin Panel</h1>
                  <p className="text-xs text-dark-400">Lead Management</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-sm bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
              <div className="text-right">
                <p className="text-sm font-medium">{adminUser?.username}</p>
                <p className={cn(
                  'text-xs px-2 py-0.5 rounded-full inline-block',
                  adminUser?.role === 'admin' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                )}>
                  {adminUser?.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-dark-400 hover:text-white transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Demo user notice */}
        {adminUser?.role === 'demo' && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-medium">Demo Mode</p>
              <p className="text-yellow-400/80 text-sm">
                You are viewing as a demo user. Email addresses are masked and you cannot update lead statuses.
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-dark-400">Total Leads</p>
                </div>
              </div>
            </div>
            <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.recent_7_days}</p>
                  <p className="text-xs text-dark-400">Last 7 Days</p>
                </div>
              </div>
            </div>
            <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.emails_sent}</p>
                  <p className="text-xs text-dark-400">Emails Sent</p>
                </div>
              </div>
            </div>
            <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.email_success_rate}%</p>
                  <p className="text-xs text-dark-400">Email Rate</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status breakdown */}
        {stats && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <h3 className="text-lg font-semibold mb-4">By Status</h3>
              <div className="space-y-3">
                {Object.entries(stats.by_status).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className={cn('px-2 py-1 rounded text-xs border', STATUS_COLORS[status] || 'bg-dark-700 text-dark-300')}>
                      {status}
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <h3 className="text-lg font-semibold mb-4">By Service</h3>
              <div className="space-y-3">
                {Object.entries(stats.by_service).slice(0, 5).map(([service, count]) => (
                  <div key={service} className="flex items-center justify-between">
                    <span className="text-sm text-dark-300 truncate max-w-[200px]">{service}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Leads Table */}
        <div className="bg-dark-800 rounded-xl border border-dark-700">
          <div className="p-4 border-b border-dark-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Leads</h2>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
              <button
                onClick={() => { fetchLeads(); fetchStats(); }}
                disabled={isLoadingLeads}
                className="p-2 text-dark-400 hover:text-white transition-colors"
              >
                <RefreshCw className={cn('w-5 h-5', isLoadingLeads && 'animate-spin')} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-dark-400">Company</th>
                  <th className="px-4 py-3 text-xs font-medium text-dark-400">Email</th>
                  <th className="px-4 py-3 text-xs font-medium text-dark-400">Service</th>
                  <th className="px-4 py-3 text-xs font-medium text-dark-400">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-dark-400">Email Sent</th>
                  <th className="px-4 py-3 text-xs font-medium text-dark-400">Date</th>
                  {adminUser?.permissions.can_update_leads && (
                    <th className="px-4 py-3 text-xs font-medium text-dark-400">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-dark-700/50 hover:bg-dark-700/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{lead.company}</p>
                        {lead.industry && (
                          <p className="text-xs text-dark-400">{lead.industry}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {adminUser?.permissions.can_view_emails ? (
                          <Eye className="w-3 h-3 text-green-500" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-yellow-500" />
                        )}
                        <span className="text-sm">{lead.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-dark-300 max-w-[150px] truncate block">
                        {lead.service}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-1 rounded text-xs border', STATUS_COLORS[lead.status] || 'bg-dark-700')}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {lead.email_sent ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-dark-500" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-400">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    {adminUser?.permissions.can_update_leads && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setNewStatus(lead.status);
                            setNotes(lead.notes || '');
                          }}
                          className="text-primary-400 hover:text-primary-300 text-sm"
                        >
                          Update
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-dark-400">
                      No leads found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Update Lead Modal */}
      {selectedLead && adminUser?.permissions.can_update_leads && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Update Lead</h3>
            <p className="text-dark-400 mb-4">{selectedLead.company}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add notes..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedLead(null)}
                className="flex-1 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLead}
                disabled={isUpdating}
                className="flex-1 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 rounded-lg transition-colors"
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
