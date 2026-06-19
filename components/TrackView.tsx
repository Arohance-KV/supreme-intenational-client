'use client';
import { useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface TrackViewProps {
  slug: string;
}

export default function TrackView({ slug }: TrackViewProps) {
  useEffect(() => {
    apiFetch(`/catalog/products/${slug}/view`, { method: 'POST' }).catch(() => {
      // best-effort; ignore errors
    });
  }, [slug]);

  return null;
}
