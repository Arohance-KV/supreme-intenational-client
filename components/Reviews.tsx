'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Review {
  _id: string;
  rating: number;
  title: string;
  body?: string;
  images?: string[];
  reviewerName?: string;
  userId?: { firstName?: string; lastName?: string; email?: string } | string;
  createdAt: string;
  isAdminCreated?: boolean;
}

interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface ReviewsProps {
  slug: string;
}

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={onChange ? 'button' : undefined}
          onClick={() => onChange?.(star)}
          className={`h-6 w-6 ${onChange ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
            star <= rating ? 'text-[#e0a33b]' : 'text-line'
          }`}
        >
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ slug, onSuccess }: { slug: string; onSuccess: () => void }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [formError, setFormError] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch(`/catalog/products/${slug}/reviews`, {
        method: 'POST',
        body: { rating, title, body: body || undefined },
      }),
    onSuccess: () => {
      setTitle('');
      setBody('');
      setRating(5);
      setFormError('');
      onSuccess();
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : 'Failed to submit review.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }
    setFormError('');
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="font-display flex flex-col gap-4 rounded-[18px] border border-white/80 bg-white/55 p-5 backdrop-blur-[14px]">
      <h3 className="font-bold text-ink">Write a Review</h3>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate">Rating</label>
        <StarRating rating={rating} onChange={setRating} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate">
          Title <span className="text-[#e0524d]">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Summary of your experience"
          className="w-full rounded-xl border border-line bg-white/80 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent focus:bg-white"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate">Comment (optional)</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Share your experience in detail..."
          className="w-full resize-none rounded-xl border border-line bg-white/80 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent focus:bg-white"
        />
        <p className="mt-1 text-xs text-muted">{body.length}/2000</p>
      </div>

      {(formError || mutation.isError) && (
        <p className="text-sm text-[#e0524d]">{formError}</p>
      )}

      {mutation.isSuccess && (
        <p className="text-sm font-semibold text-[#1a8f5a]">Review submitted successfully!</p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-fit rounded-xl bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(42,43,106,.3)] transition-colors hover:brightness-110 disabled:opacity-50"
      >
        {mutation.isPending ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

export default function Reviews({ slug }: ReviewsProps) {
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<ReviewsResponse>({
    queryKey: ['reviews', slug],
    queryFn: () => apiFetch<ReviewsResponse>(`/catalog/products/${slug}/reviews`),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['reviews', slug] });
  };

  return (
    <div className="font-display flex flex-col gap-6">
      <h2 className="text-xl font-extrabold tracking-[-.02em] text-ink">
        Reviews
        {data?.pagination.total ? ` (${data.pagination.total})` : ''}
      </h2>

      {/* Create review form — only for logged-in users */}
      {isLoggedIn && <ReviewForm slug={slug} onSuccess={invalidate} />}
      {!isLoggedIn && (
        <p className="text-sm text-slate">
          <a href="/login" className="font-semibold text-accent hover:underline">Sign in</a> to leave a review.
        </p>
      )}

      {/* Review List */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-[18px] bg-white/55" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-[#e0524d]">
          {error instanceof ApiError ? error.message : 'Failed to load reviews.'}
        </p>
      )}

      {data && data.reviews.length === 0 && (
        <p className="text-sm text-slate">No reviews yet. Be the first!</p>
      )}

      {data && data.reviews.length > 0 && (
        <div className="flex flex-col gap-4">
          {data.reviews.map((review) => {
            const authorName =
              review.reviewerName ??
              (typeof review.userId === 'object' && review.userId
                ? `${review.userId.firstName ?? ''} ${review.userId.lastName ?? ''}`.trim() ||
                  review.userId.email
                : 'Anonymous');

            return (
              <div
                key={review._id}
                className="flex flex-col gap-2 rounded-[18px] border border-white/80 bg-white/55 p-4 backdrop-blur-[14px]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} />
                    <span className="text-sm font-semibold text-ink">{review.title}</span>
                  </div>
                  <span className="text-xs text-muted">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.body && (
                  <p className="text-sm leading-relaxed text-slate">{review.body}</p>
                )}
                <p className="text-xs text-muted">— {authorName}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
