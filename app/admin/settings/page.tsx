'use client';

import { useState } from 'react';
import { ApiError } from '@/lib/api';
import { useAdminProfile, useAdminChangePassword } from '@/lib/admin/userAuth';
import { useAdminAuth } from '@/lib/admin/auth';
import { useRouter } from 'next/navigation';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

// ── Profile section ───────────────────────────────────────────────────────────

function ProfileSection() {
  const { data: profile, isLoading, isError, error } = useAdminProfile();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] p-6 animate-pulse space-y-3">
        <div className="h-4 w-32 rounded bg-black/5" />
        <div className="h-4 w-48 rounded bg-black/5" />
        <div className="h-4 w-40 rounded bg-black/5" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error instanceof ApiError ? error.message : 'Failed to load profile.'}
      </div>
    );
  }

  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || '—';

  return (
    <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] p-6">
      <h2 className="mb-4 text-base font-semibold text-ink">Profile</h2>
      <dl className="space-y-3">
        <div className="grid grid-cols-[140px_1fr] gap-2">
          <dt className="text-sm font-medium text-slate">Name</dt>
          <dd className="text-sm text-ink">{fullName}</dd>
        </div>
        <div className="grid grid-cols-[140px_1fr] gap-2">
          <dt className="text-sm font-medium text-slate">Email</dt>
          <dd className="text-sm text-ink">{profile?.email ?? '—'}</dd>
        </div>
        <div className="grid grid-cols-[140px_1fr] gap-2">
          <dt className="text-sm font-medium text-slate">Account status</dt>
          <dd className="text-sm">
            {profile?.isActive !== undefined ? (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  profile.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {profile.isActive ? 'Active' : 'Inactive'}
              </span>
            ) : (
              '—'
            )}
          </dd>
        </div>
        <div className="grid grid-cols-[140px_1fr] gap-2">
          <dt className="text-sm font-medium text-slate">Last login</dt>
          <dd className="text-sm text-ink">{fmtDate(profile?.lastLoginAt)}</dd>
        </div>
        <div className="grid grid-cols-[140px_1fr] gap-2">
          <dt className="text-sm font-medium text-slate">Account created</dt>
          <dd className="text-sm text-ink">{fmtDate(profile?.createdAt)}</dd>
        </div>
      </dl>
    </div>
  );
}

// ── Change password section ───────────────────────────────────────────────────

function ChangePasswordSection() {
  const { logout } = useAdminAuth();
  const router = useRouter();
  const changePassword = useAdminChangePassword();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [clientError, setClientError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
    setClientError(null);
    setSuccessMsg(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setClientError(null);
    setSuccessMsg(null);

    if (form.newPassword !== form.confirmPassword) {
      setClientError('New passwords do not match.');
      return;
    }
    if (form.newPassword.length < 8) {
      setClientError('New password must be at least 8 characters.');
      return;
    }
    if (form.currentPassword === form.newPassword) {
      setClientError('New password must differ from current password.');
      return;
    }

    changePassword.mutate(
      { currentPassword: form.currentPassword, newPassword: form.newPassword },
      {
        onSuccess: () => {
          // Token is invalidated server-side on password change — log out and redirect
          logout();
          router.replace('/admin/login');
        },
      },
    );
  }

  const inputCls =
    'w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent';
  const labelCls = 'mb-1 block text-sm font-medium text-slate';

  const serverErr = changePassword.error;

  return (
    <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] p-6">
      <h2 className="mb-4 text-base font-semibold text-ink">Change password</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className={labelCls}>
            Current password <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(e) => set('currentPassword', e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>
            New password <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(e) => set('newPassword', e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>
            Confirm new password <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => set('confirmPassword', e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Client-side validation error */}
        {clientError && (
          <p className="text-sm text-red-600">{clientError}</p>
        )}

        {/* Server error */}
        {serverErr && (
          <p className="text-sm text-red-600">
            {serverErr instanceof ApiError ? serverErr.message : 'Failed to change password.'}
          </p>
        )}

        {/* Success */}
        {successMsg && (
          <p className="text-sm text-green-600">{successMsg}</p>
        )}

        <div className="pt-1">
          <button
            type="submit"
            disabled={changePassword.isPending}
            className="rounded bg-gradient-to-br from-indigo to-indigo2 px-5 py-2 text-sm font-medium text-white disabled:opacity-60 hover:opacity-95 transition-colors"
          >
            {changePassword.isPending ? 'Updating…' : 'Update password'}
          </button>
        </div>

        <p className="text-xs text-muted">
          After a successful password change, you will be logged out and redirected to the login page.
        </p>
      </form>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-slate">
          Manage your admin profile and account security
        </p>
      </div>

      <ProfileSection />
      <ChangePasswordSection />
    </div>
  );
}
