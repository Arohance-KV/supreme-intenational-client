'use client';
import { useRouter } from 'next/navigation';
import { useCreateSubmission, type SubmissionInput } from '@/lib/seller/submissions';
import { SubmissionForm } from '@/components/seller/SubmissionForm';

export default function NewSubmissionPage() {
  const router = useRouter();
  const create = useCreateSubmission();

  const handleSubmit = (input: SubmissionInput) => {
    create.mutateAsync(input).then((s) => router.push('/seller/submissions/' + s._id));
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-zinc-900 mb-6">New product submission</h1>
      {create.isError && (
        <p className="mb-4 text-sm text-red-600">
          {create.error instanceof Error ? create.error.message : 'Could not create submission'}
        </p>
      )}
      <SubmissionForm
        submitLabel="Save draft"
        submitting={create.isPending}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
