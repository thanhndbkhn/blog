---
name: api-integration
description: >-
  Integrate blog-fe with blog-be NestJS REST API using TanStack Query. Use when
  connecting frontend to backend, creating query hooks, handling JWT auth, CORS,
  or migrating from Supabase to NestJS endpoints.
---

# API Integration (FE ↔ BE)

## Stack

| Layer | Choice |
|-------|--------|
| API | NestJS REST (`blog-be/`) |
| ORM | TypeORM + PostgreSQL |
| Auth | JWT + Passport |
| FE fetching | TanStack Query v5 |
| Deploy | Vercel (FE) + Railway (BE + DB) |

## Architecture

```
blog-fe (Next.js + TanStack Query)  ──▶  blog-be (NestJS + JWT)  ──▶  PostgreSQL (Railway)
```

## Environment Variables

**blog-fe/.env:**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**blog-be/.env:**
```
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

## Setup TanStack Query

Install: `npm install @tanstack/react-query`

**`lib/query/provider.tsx`:**
```typescript
'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from './get-query-client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

Wrap in `app/layout.tsx` inside body.

**`lib/query/get-query-client.ts`:**
```typescript
import { QueryClient } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000, retry: 1 },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
```

## Base API Client

**`lib/api/client.ts`:**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function apiClient<T>(
  path: string,
  options?: RequestInit & { token?: string },
): Promise<T> {
  const { token, ...fetchOptions } = options ?? {};
  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? res.statusText);
  }

  return res.json();
}
```

## Query Functions + Keys

**`lib/api/query-keys.ts`:**
```typescript
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: { page: number }) => [...postKeys.lists(), filters] as const,
  detail: (slug: string) => [...postKeys.all, 'detail', slug] as const,
};
```

**`lib/api/posts.ts`:**
```typescript
import { QueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { postKeys } from './query-keys';

export async function getPosts(page = 1) {
  return apiClient<{ data: Post[]; meta: PaginationMeta }>(`/posts?page=${page}`);
}

export function prefetchPosts(qc: QueryClient, filters: { page: number }) {
  return qc.prefetchQuery({
    queryKey: postKeys.list(filters),
    queryFn: () => getPosts(filters.page),
  });
}
```

## Hooks

**`hooks/use-posts.ts`:**
```typescript
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPosts } from '@/lib/api/posts';
import { postKeys } from '@/lib/api/query-keys';

export function usePosts(filters: { page: number }) {
  return useQuery({
    queryKey: postKeys.list(filters),
    queryFn: () => getPosts(filters.page),
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePostDto) =>
      apiClient('/posts', { method: 'POST', body: JSON.stringify(dto) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: postKeys.lists() }),
  });
}
```

## SSR Prefetch Pattern

```typescript
// app/(main)/page.tsx — Server Component
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/get-query-client';
import { prefetchPosts } from '@/lib/api/posts';
import { PostList } from '@/components/main/post/post-list';

export default async function HomePage({ searchParams }) {
  const page = Number(searchParams.page ?? 1);
  const queryClient = getQueryClient();
  await prefetchPosts(queryClient, { page });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostList page={page} />
    </HydrationBoundary>
  );
}
```

## JWT Auth on FE

- Store JWT in `httpOnly` cookie (set by NestJS login endpoint) or `localStorage` (less secure).
- Pass token to `apiClient` via `token` option.
- Create `useAuth` hook; on 401 from any query, redirect to `/login`.
- Protected queries: `enabled: !!token`.

## Backend CORS

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

## Migration from Supabase

1. Implement NestJS endpoint → test Swagger.
2. Add query function + keys in `lib/api/`.
3. Add hook in `hooks/`.
4. Replace Supabase call in component with hook.
5. Remove Supabase import when feature fully migrated.

## Response Contract

```json
{ "data": {}, "message": "optional" }
{ "data": [], "meta": { "page": 1, "totalPages": 5, "total": 50 } }
```

## Error Handling

| Status | TanStack Query behavior |
|--------|------------------------|
| 401 | Redirect `/login`, clear token |
| 404 | `notFound()` in SSR; show empty state in client |
| 422 | Surface `error.message` in form |
| 500 | Toast + `isError` fallback UI |
