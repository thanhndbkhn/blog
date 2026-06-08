---
name: code-review
description: >-
  Review code changes for BlogProject following NestJS and Next.js conventions.
  Use when reviewing pull requests, examining diffs, or when the user asks for
  a code review.
---

# Code Review

## Process

1. Identify which app changed: `blog-fe/`, `blog-be/`, or both.
2. Read relevant rules in `.cursor/rules/`.
3. Check diff for scope — flag unrelated changes.
4. Provide structured feedback.

## Review Checklist

### General
- [ ] Smallest correct diff — no drive-by refactors
- [ ] No secrets or `.env` values committed
- [ ] Conventional commit message if committing
- [ ] Tests only if user requested

### Backend (`blog-be/`)
- [ ] DTO validation with class-validator
- [ ] Swagger docs on new endpoints
- [ ] Proper HTTP status codes and NestJS exceptions
- [ ] Auth guard on protected routes
- [ ] No business logic in controllers
- [ ] Entity column names match DB schema (snake_case)

### Frontend (`blog-fe/`)
- [ ] TanStack Query for data fetching (not raw fetch in components)
- [ ] Query functions in `lib/api/`, hooks in `hooks/`
- [ ] Query keys use factory pattern in `lib/api/query-keys.ts`
- [ ] SSR pages use prefetch + `HydrationBoundary`
- [ ] Mutations invalidate related query keys
- [ ] `"use client"` only where necessary
- [ ] No new Supabase calls
- [ ] Types defined, no `any`
- [ ] Zod validation on forms; submit via `useMutation`
- [ ] Loading/error/empty states for queries

### API Integration
- [ ] Response shape matches `{ data, message }` contract
- [ ] JWT sent via `Authorization: Bearer` header
- [ ] 401 triggers redirect to `/login`
- [ ] CORS `FRONTEND_URL` matches Vercel domain

## Feedback Format

```
🔴 Critical — must fix before merge
🟡 Suggestion — consider improving
🟢 Nice to have — optional enhancement
```

## Example Review

```
🔴 Critical: POST /posts missing JwtAuthGuard — anyone can create posts

🟡 Suggestion: Move fetch logic to lib/api/posts.ts and expose via usePosts hook

🟢 Nice to have: Add @ApiProperty examples to CreatePostDto for better Swagger docs
```

## Red Flags

- Direct Supabase calls in new FE code (migration in progress)
- Hardcoded `localhost` URLs
- Raw `fetch()` in components instead of TanStack Query
- Missing `invalidateQueries` after mutations
- `console.log` left in production code
- Large components (>200 lines) without extraction
- Breaking changes to API response shape without FE update
