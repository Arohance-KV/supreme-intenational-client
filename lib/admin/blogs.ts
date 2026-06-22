'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────
// Derived from server/src/models/blog.model.ts (IBlog + timestamps)

export interface AdminBlog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  createdBy: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null; // ISO string after JSON serialisation
  createdAt: string;
  updatedAt: string;
}

export interface AdminBlogsResponse {
  blogs: AdminBlog[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

// Create — matches createBlogValidator + controller (slug auto-generated server-side)
export interface CreateBlogBody {
  title: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  tags?: string[];
  isPublished?: boolean;
}

// Update — matches updateBlogValidator + controller
export type UpdateBlogBody = Partial<Omit<CreateBlogBody, 'title'>> & { title?: string };

// ── Query key helpers ─────────────────────────────────────────────────────────

const BLOGS_LIST_KEY = (page: number) => ['admin', 'blogs', 'list', page] as const;
const BLOG_DETAIL_KEY = (id: string) => ['admin', 'blogs', 'detail', id] as const;

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useBlogs(page = 1) {
  return useQuery<AdminBlogsResponse>({
    queryKey: BLOGS_LIST_KEY(page),
    queryFn: () =>
      adminFetch<AdminBlogsResponse>(`/admin/blogs?page=${page}&limit=20`),
  });
}

export function useBlog(id: string) {
  return useQuery<AdminBlog>({
    queryKey: BLOG_DETAIL_KEY(id),
    queryFn: () => adminFetch<AdminBlog>(`/admin/blogs/${id}`),
    enabled: !!id,
  });
}

export function useCreateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBlogBody) =>
      adminFetch<AdminBlog>('/admin/blogs', { method: 'POST', body }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['admin', 'blogs', 'list'] }),
  });
}

export function useUpdateBlog(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateBlogBody) =>
      adminFetch<AdminBlog>(`/admin/blogs/${id}`, { method: 'PATCH', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'blogs', 'list'] });
      qc.invalidateQueries({ queryKey: BLOG_DETAIL_KEY(id) });
    },
  });
}

export function useDeleteBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch<unknown>(`/admin/blogs/${id}`, { method: 'DELETE' }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['admin', 'blogs', 'list'] }),
  });
}
