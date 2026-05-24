// components/admin/AdminUsersManager.tsx
// Users management table for the admin console.
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  APIError,
  type ManagedUser,
  type AdminUserRole,
  type CreateUserInput,
} from '@/lib/api';

const ALL_ROLES: AdminUserRole[] = ['user', 'demo', 'admin', 'super_admin'];
const BASE_ROLES: AdminUserRole[] = ['user', 'demo'];

const ROLE_BADGE: Record<AdminUserRole, string> = {
  super_admin: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
  admin: 'bg-green-500/20 text-green-400 border-green-500/30',
  demo: 'bg-gold-500/20 text-gold-400 border-gold-500/30',
  user: 'bg-lilac-500/20 text-lilac-300 border-lilac-500/30',
};

const ROLE_LABEL: Record<AdminUserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  demo: 'Demo',
  user: 'User',
};

interface AdminUsersManagerProps {
  // Whether the current user may assign admin / super_admin roles.
  canManageAdmins: boolean;
}

export default function AdminUsersManager({ canManageAdmins }: AdminUsersManagerProps) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add-user modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<CreateUserInput>({
    email: '',
    password: '',
    name: '',
    company: '',
    role: 'user',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Per-row pending state (id of the user being mutated)
  const [pendingId, setPendingId] = useState<number | null>(null);

  // Roles selectable in dropdowns, gated by privilege.
  const roleOptions = canManageAdmins ? ALL_ROLES : BASE_ROLES;

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listAdminUsers();
      setUsers(data);
    } catch (e) {
      setError(e instanceof APIError ? e.message : 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async () => {
    setFormError(null);
    if (!form.email || !form.password || !form.name) {
      setFormError('Email, password, and name are required.');
      return;
    }
    setIsSaving(true);
    try {
      await createAdminUser({
        ...form,
        company: form.company?.trim() ? form.company.trim() : undefined,
      });
      setShowAddModal(false);
      setForm({ email: '', password: '', name: '', company: '', role: 'user' });
      await fetchUsers();
    } catch (e) {
      setFormError(e instanceof APIError ? e.message : 'Failed to create user.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = async (u: ManagedUser, role: AdminUserRole) => {
    if (role === u.role) return;
    setPendingId(u.id);
    setError(null);
    try {
      const updated = await updateAdminUser(u.id, { role });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    } catch (e) {
      setError(e instanceof APIError ? e.message : 'Failed to update role.');
    } finally {
      setPendingId(null);
    }
  };

  const handleToggleActive = async (u: ManagedUser) => {
    setPendingId(u.id);
    setError(null);
    try {
      const updated = await updateAdminUser(u.id, { is_active: !u.is_active });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    } catch (e) {
      setError(e instanceof APIError ? e.message : 'Failed to update status.');
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteAdminUser(deleteTarget.id);
      setUsers((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      // Surface backend errors such as "cannot delete your own account".
      setError(e instanceof APIError ? e.message : 'Failed to delete user.');
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error banner */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-destructive font-medium">Action failed</p>
            <p className="text-destructive/80 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-destructive/70 hover:text-destructive">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-dark-800 rounded-xl border border-dark-700">
        <div className="p-4 border-b border-dark-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold font-heading">Users</h2>
            <p className="text-xs text-dark-400">{users.length} total</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFormError(null);
                setForm({ email: '', password: '', name: '', company: '', role: 'user' });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-medium transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
            <button
              onClick={fetchUsers}
              disabled={isLoading}
              className="p-2 text-dark-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700 text-left">
                <th className="px-4 py-3 text-xs font-medium text-dark-400">Email</th>
                <th className="px-4 py-3 text-xs font-medium text-dark-400">Name</th>
                <th className="px-4 py-3 text-xs font-medium text-dark-400">Company</th>
                <th className="px-4 py-3 text-xs font-medium text-dark-400">Role</th>
                <th className="px-4 py-3 text-xs font-medium text-dark-400">Active</th>
                <th className="px-4 py-3 text-xs font-medium text-dark-400">Created</th>
                <th className="px-4 py-3 text-xs font-medium text-dark-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const busy = pendingId === u.id;
                // If the user already has an elevated role we can't otherwise
                // assign, keep it visible in the dropdown so we don't silently
                // drop it.
                const opts = roleOptions.includes(u.role)
                  ? roleOptions
                  : [...roleOptions, u.role];
                return (
                  <tr key={u.id} className="border-b border-dark-700/50 hover:bg-dark-700/30">
                    <td className="px-4 py-3 text-sm">{u.email}</td>
                    <td className="px-4 py-3 text-sm">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-dark-300">{u.company || '—'}</td>
                    <td className="px-4 py-3">
                      {canManageAdmins ? (
                        <select
                          value={u.role}
                          disabled={busy}
                          onChange={(e) => handleRoleChange(u, e.target.value as AdminUserRole)}
                          className="px-2 py-1 bg-dark-700 border border-dark-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                          {opts.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABEL[r]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={cn(
                            'px-2 py-1 rounded text-xs border',
                            ROLE_BADGE[u.role] || 'bg-dark-700 text-dark-300'
                          )}
                        >
                          {ROLE_LABEL[u.role] || u.role}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={busy}
                        className="flex items-center gap-1.5 disabled:opacity-50"
                        title={u.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {u.is_active ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-green-400">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-dark-500" />
                            <span className="text-xs text-dark-400">Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-400">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteTarget(u)}
                        disabled={busy}
                        className="text-destructive hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-dark-400">
                    No users found
                  </td>
                </tr>
              )}
              {isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-dark-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold font-heading">Add User</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-dark-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company (optional)</label>
                <input
                  type="text"
                  value={form.company || ''}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as AdminUserRole })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
                {!canManageAdmins && (
                  <p className="mt-1 text-xs text-dark-400">
                    Admin roles can only be assigned by a super admin.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isSaving}
                className="flex-1 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 rounded-lg transition-colors"
              >
                {isSaving ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 w-full max-w-sm">
            <h3 className="text-lg font-semibold font-heading mb-2">Delete user?</h3>
            <p className="text-dark-400 text-sm mb-6">
              This will permanently delete{' '}
              <span className="text-white font-medium">{deleteTarget.email}</span>. This cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2 bg-destructive hover:bg-red-600 disabled:opacity-50 rounded-lg transition-colors text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
