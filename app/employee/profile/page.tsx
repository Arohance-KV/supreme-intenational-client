'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useEmployeeProfile } from '@/lib/employee/profile';
import { useEmployeeAuth } from '@/lib/employee/auth';
import { useWallet } from '@/lib/employee/wallet';
import { useForgotPassword } from '@/lib/employee/userAuth';
import { useConfirm } from '@/components/ConfirmDialog';
import { glass, eyebrow, pageWrap, secondaryBtn } from '@/components/employee/ui';

function initials(first?: string, last?: string) {
  return `${(first?.[0] ?? '').toUpperCase()}${(last?.[0] ?? '').toUpperCase()}` || '?';
}

function memberSince(s: string | null) {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

const STATUS_CHIP: Record<string, string> = {
  active: 'bg-[rgba(31,170,107,.16)] text-[#1a8f5a]',
  invited: 'bg-[rgba(224,163,59,.16)] text-[#b5801e]',
  deactivated: 'bg-[rgba(224,82,77,.14)] text-[#e0524d]',
};

// One labelled read-only field.
function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="font-jbmono text-[10px] uppercase tracking-[.1em] text-muted">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-ink">{value?.trim() ? value : '—'}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useEmployeeProfile();
  const { data: wallet } = useWallet();
  const { logout } = useEmployeeAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const forgot = useForgotPassword();
  const { confirm, alert } = useConfirm();

  function handleLogout() {
    logout();
    queryClient.invalidateQueries({ queryKey: ['employee'] });
    router.push('/employee/login');
  }

  async function handleReset() {
    if (!profile?.email) return;
    const ok = await confirm({
      title: 'Reset password',
      message: `Send a password reset link to ${profile.email}?`,
      confirmLabel: 'Send link',
    });
    if (!ok) return;
    forgot.mutate(
      { email: profile.email },
      { onSuccess: () => alert({ title: 'Check your inbox', message: `We’ve sent a reset link to ${profile.email}.` }) },
    );
  }

  return (
    <div className="min-h-screen bg-[#eef0f8]">
      <div className={`${pageWrap} max-w-3xl`}>
        <div className="mb-6">
          <p className={`${eyebrow} mb-1.5`}>Your account</p>
          <h1 className="text-2xl font-extrabold tracking-[-.02em] text-ink sm:text-[32px]">My profile</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className={`h-40 animate-pulse rounded-[28px] ${glass}`} />
            <div className={`h-44 animate-pulse rounded-[24px] ${glass}`} />
          </div>
        ) : isError || !profile ? (
          <div className={`rounded-[20px] p-6 text-center text-sm text-[#e0524d] ${glass}`}>
            Could not load your profile. Please try again.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Identity hero */}
            <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(125deg,#16173a_0%,#2a2b6a_55%,#149b8e_130%)] p-6 shadow-[0_24px_64px_rgba(22,23,58,.26)] sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
                {profile.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.img} alt="" className="h-20 w-20 flex-none rounded-full border-2 border-white/30 object-cover" />
                ) : (
                  <span className="grid h-20 w-20 flex-none place-items-center rounded-full border-2 border-white/25 bg-white/15 text-2xl font-extrabold text-white backdrop-blur-sm">
                    {initials(profile.firstName, profile.lastName)}
                  </span>
                )}
                <div className="min-w-0">
                  <h2 className="text-2xl font-extrabold tracking-[-.01em] text-white">
                    {`${profile.firstName} ${profile.lastName}`.trim() || 'Employee'}
                  </h2>
                  <p className="mt-0.5 truncate text-sm text-white/75">{profile.email}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    {profile.employeeStatus && (
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${STATUS_CHIP[profile.employeeStatus] ?? 'bg-white/15 text-white'}`}>
                        {profile.employeeStatus}
                      </span>
                    )}
                    {memberSince(profile.memberSince) && (
                      <span className="rounded-full bg-white/12 px-3 py-1 text-[11px] font-medium text-white/80">
                        Member since {memberSince(profile.memberSince)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <section className={`rounded-[22px] p-5 sm:p-6 ${glass}`}>
                <h3 className="mb-4 text-sm font-semibold text-ink">Contact details</h3>
                <div className="space-y-4">
                  <Field label="Email" value={profile.email} />
                  <Field label="Phone" value={[profile.isdCode, profile.phoneNumber].filter(Boolean).join(' ')} />
                </div>
              </section>

              <section className={`rounded-[22px] p-5 sm:p-6 ${glass}`}>
                <h3 className="mb-4 text-sm font-semibold text-ink">Company</h3>
                <div className="flex items-center gap-3">
                  {profile.company?.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.company.logo} alt="" className="h-11 w-11 flex-none rounded-[12px] border border-line object-contain bg-white" />
                  ) : (
                    <span className="grid h-11 w-11 flex-none place-items-center rounded-[12px] bg-[rgba(42,43,106,.08)] text-sm font-bold text-indigo">
                      {(profile.company?.name?.[0] ?? '?').toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{profile.company?.name ?? '—'}</p>
                    <p className="mt-0.5 text-xs capitalize text-muted">{profile.company?.walletMode ?? 'points'} wallet</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Wallet snapshot */}
            <Link
              href="/employee/wallet"
              className={`group flex items-center justify-between gap-4 rounded-[22px] p-5 no-underline transition-shadow duration-200 hover:shadow-[0_18px_48px_rgba(22,23,58,.14)] sm:p-6 ${glass}`}
            >
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 flex-none place-items-center rounded-[14px] bg-[rgba(20,155,142,.12)] text-accent">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 10a2 2 0 012-2h14a2 2 0 012 2M3 10v6a2 2 0 002 2h14a2 2 0 002-2v-6M16 14h2" />
                  </svg>
                </span>
                <div>
                  <p className="font-jbmono text-[10px] uppercase tracking-[.1em] text-muted">
                    {profile.company?.walletMode === 'coupon' ? 'Active coupon' : 'Wallet balance'}
                  </p>
                  <p className="mt-0.5 text-xl font-extrabold tracking-[-.02em] text-ink">
                    {wallet ? `₹${wallet.balance.toLocaleString('en-IN')}` : '—'}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-accent transition-colors group-hover:text-indigo">View →</span>
            </Link>

            {/* Actions */}
            <section className={`rounded-[22px] p-5 sm:p-6 ${glass}`}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/employee/orders" className={`${secondaryBtn} flex items-center justify-center gap-2 px-4 py-2.5 text-sm no-underline`}>
                  My orders
                </Link>
                <button onClick={handleReset} disabled={forgot.isPending} className={`${secondaryBtn} px-4 py-2.5 text-sm`}>
                  {forgot.isPending ? 'Sending…' : 'Reset password'}
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="mt-3 w-full rounded-[13px] border border-[rgba(224,82,77,.3)] bg-[rgba(224,82,77,.06)] px-4 py-2.5 text-sm font-semibold text-[#e0524d] transition-colors hover:bg-[rgba(224,82,77,.12)]"
              >
                Log out
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
