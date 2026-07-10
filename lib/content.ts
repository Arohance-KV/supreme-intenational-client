// Public, website-facing content reads (client logos, case studies, blogs).
// Server-component fetch with ISR, mirroring lib/catalog.ts. Popups are fetched
// separately on the client (SitePopupHost) since they drive interactivity.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4010';

async function contentFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
  const json = await res.json();
  if (!res.ok || json.success === false) throw new Error(json.message ?? 'Content fetch failed');
  return json.data as T;
}

// Never let a missing/booting API blank the whole page — fall back to empty.
async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try { return await p; } catch { return fallback; }
}

export interface ClientLogo { _id: string; name: string; logoUrl: string; website: string; order: number; }
export interface CaseStudy { _id: string; title: string; industry: string; summary: string; coverImage: string; result: string; }
export interface Blog {
  _id: string; title: string; slug: string; excerpt: string; content: string;
  coverImage: string; tags: string[]; publishedAt: string | null; createdAt: string;
}
export interface BlogList { blogs: Blog[]; pagination: { total: number; page: number; limit: number; pages: number } }

export function getClientLogos(): Promise<ClientLogo[]> {
  return safe(contentFetch<ClientLogo[]>('/content/client-logos'), []);
}
export function getCaseStudies(): Promise<CaseStudy[]> {
  return safe(contentFetch<CaseStudy[]>('/content/case-studies'), []);
}
export function getBlogs(page = 1): Promise<BlogList> {
  return safe(contentFetch<BlogList>(`/blogs?page=${page}&limit=12`), { blogs: [], pagination: { total: 0, page: 1, limit: 12, pages: 0 } });
}
export function getBlogBySlug(slug: string): Promise<Blog | null> {
  return safe(contentFetch<Blog>(`/blogs/${slug}`), null);
}
