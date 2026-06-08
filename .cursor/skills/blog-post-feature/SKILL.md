---
name: blog-post-feature
description: >-
  Implement blog domain features: posts, drafts, categories, comments,
  bookmarks, editor, and publishing workflow. Use when working on blog content
  CRUD, TipTap editor, slug generation, or post publishing logic.
---

# Blog Post Feature

## Domain Entities

Reference schema: `blog-fe/database_schema/supabase_db_schema.sql`

| Entity | Key Fields | Notes |
|--------|-----------|-------|
| `posts` | title, slug, content, published, author_id, category_id | Published content |
| `drafts` | same as posts | Work-in-progress, author-scoped |
| `categories` | title, slug | Static config also in `config/main/main-category-config.ts` |
| `comments` | comment, user_id, post_id | Nested under post |
| `bookmarks` | user_id, post_id | User saves posts |
| `profiles` | username, full_name, avatar_url | Linked to auth user |

## Publishing Workflow

```
Draft (editor) → Save draft → Publish → Post (public)
```

1. Author creates/edits in `(protected)/editor/posts/[postId]`.
2. Draft saved via API (`PATCH /drafts/:id`).
3. Publish copies draft → post, sets `published: true`.
4. Public pages query only `published: true` posts.

## Slug Generation

Use `react-slugify` (already in project):

```typescript
import slugify from 'react-slugify';
const slug = slugify(title);
```

Ensure uniqueness on backend before save.

## Editor (TipTap)

Located in `components/protected/editor/`. Key files:

- `editor.tsx` — main editor wrapper
- `wysiwyg/wysiwyg-editor.tsx` — TipTap instance
- `wysiwyg/extensions/` — custom extensions

When modifying editor:
- Keep `"use client"` boundary at editor level only
- Content stored as HTML or JSON (match existing format in DB)
- Image upload goes through storage API (migrate from Supabase Storage to NestJS upload endpoint)

## API Endpoints to Implement

| Method | Path | Description |
|--------|------|-------------|
| GET | `/posts` | List published posts (paginated) |
| GET | `/posts/:slug` | Single post by slug |
| GET | `/drafts` | Author's drafts |
| POST | `/drafts` | Create draft |
| PATCH | `/drafts/:id` | Update draft |
| POST | `/drafts/:id/publish` | Publish draft |
| DELETE | `/drafts/:id` | Delete draft |
| GET | `/categories` | List categories |
| POST | `/posts/:id/comments` | Add comment |
| POST | `/posts/:id/bookmarks` | Toggle bookmark |

## Frontend Types

Extend types in `types/collection.ts`:

```typescript
export interface PostWithCategoryWithProfile extends Post {
  categories: Category;
  profiles: Profile;
}
```

## Pagination Pattern

Match existing pattern (limit 10):

```typescript
const limit = 10;
const page = parseInt(searchParams.page ?? '1', 10);
// API: GET /posts?page=1&limit=10
```

Use `SharedPagination` from `@/components/shared`.

## Reading Time

Use `reading-time` package (already used in `main-post-item.tsx`).
