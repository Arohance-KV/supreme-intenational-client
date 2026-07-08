'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCreateSubmission, type SubmissionInput } from '@/lib/seller/submissions';
import { SubmissionForm } from '@/components/seller/SubmissionForm';

export default function NewSubmissionPage() {
  const router = useRouter();
  const create = useCreateSubmission();

  const handleSubmit = (input: SubmissionInput) => {
    create.mutate(input, { onSuccess: (s) => router.push('/seller/submissions/' + s._id) });
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-6 sm:px-8 sm:py-7">
      <div className="mb-6">
        <Link
          href="/seller/products"
          className="mb-2 inline-block text-[13px] font-medium text-slate no-underline hover:text-ink"
        >
          ← My Products
        </Link>
        <h1 className="mb-0.5 text-[26px] font-extrabold tracking-[-.02em] text-ink">New product submission</h1>
        <div className="text-[13px] text-slate">
          Save a draft, then submit it for admin review before it goes live.
        </div>
      </div>

      {create.isError && (
        <div className="mb-4 rounded-[14px] border border-[rgba(216,82,77,.25)] bg-[rgba(216,82,77,.08)] px-4 py-3 text-sm text-[#d8524d]">
          {create.error instanceof Error ? create.error.message : 'Could not create submission'}
        </div>
      )}

      <SubmissionForm
        submitLabel="Save draft"
        submitting={create.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
