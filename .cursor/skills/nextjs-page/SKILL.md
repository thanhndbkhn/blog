---
name: nextjs-page
description: >-
  Create Next.js App Router pages and components with TanStack Query following
  blog-fe conventions. Use when adding pages, layouts, query hooks, or UI
  components in blog-fe/.
---

# Next.js Page & Component

## Workflow

1. Determine route group: `(main)`, `(detail)`, `(protected)`, or `api/`.
2. Add query function in `lib/api/<feature>.ts` + keys in `lib/api/query-keys.ts`.
3. Add hook in `hooks/use-<feature>.ts`.
4. Create page with SSR prefetch where SEO/performance matters.
5. Extract UI into `components/<area>/`.

## File Structure for New Feature

```
lib/api/posts.ts          # query functions
lib/api/query-keys.ts     # add postKeys
hooks/use-posts.ts        # useQuery / useMutation
components/main/post/post-list.tsx   # 'use client' consumer
app/(main)/page.tsx       # Server Component with prefetch
```

## Page with SSR Prefetch (Preferred for Public Pages)

```typescript
// app/(main)/page.tsx — Server Component
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/get-query-client';
import { prefetchPosts } from '@/lib/api/posts';
import { PostList } from '@/components/main/post/post-list';

interface HomePageProps {
  searchParams: { page?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
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

## Client List Component

```typescript
// components/main/post/post-list.tsx
'use client';
import { usePosts } from '@/hooks/use-posts';
import { MainPostItem } from './main-post-item';
import { SharedPagination } from '@/components/shared';

export function PostList({ page }: { page: number }) {
  const { data, isLoading, isError } = usePosts({ page });

  if (isLoading) return <MainPostItemLoading />;
  if (isError || !data?.data.length) return <SharedEmpty />;

  return (
    <>
      <div className="space-y-6">
        {data.data.map((post) => <MainPostItem key={post.id} post={post} />)}
      </div>
      {data.meta.totalPages > 1 && (
        <SharedPagination page={page} totalPages={data.meta.totalPages} baseUrl="/" pageUrl="?page=" />
      )}
    </>
  );
}
```

## Protected Page (Client-Fetched)

Dashboard pages can fetch client-side (auth required):

```typescript
'use client';
import { useDrafts } from '@/hooks/use-drafts';

export default function DraftsPage() {
  const { data, isLoading } = useDrafts();
  // ...
}
```

## Component Checklist

- [ ] Query logic in `lib/api/` + `hooks/`, not in component
- [ ] Server Component for page shell + prefetch
- [ ] `"use client"` only on interactive/query consumer components
- [ ] Loading/error/empty states handled
- [ ] Props typed with interface
- [ ] Uses `@/components/ui/*` for primitives
- [ ] Zod validation for forms; submit via `useMutation`

## Route Groups

| Group | Auth | Data pattern |
|-------|------|-------------|
| `(main)` | Public | SSR prefetch + hydration |
| `(detail)` | Public | SSR prefetch for SEO metadata |
| `(protected)` | JWT required | Client `useQuery` with token |

## Metadata (Server Component)

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug); // direct apiClient OK here
  return { title: post.title, description: post.description };
}
```

## Do Not

- Call `fetch()` directly in components — use query functions
- Add `"use client"` to page.tsx unless entire page is client-only
- Create new UI primitives when Shadcn component exists
- Hardcode API URLs — use `NEXT_PUBLIC_API_URL` via `apiClient`
