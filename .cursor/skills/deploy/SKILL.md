---
name: deploy
description: >-
  Deploy blog-fe to Vercel and blog-be + PostgreSQL to Railway. Use when setting
  up deployment, environment variables, Railway services, or production config.
---

# Deploy (Vercel + Railway)

## Stack

| Service | Platform |
|---------|----------|
| `blog-fe` | **Vercel** |
| `blog-be` | **Railway** (Node.js service) |
| PostgreSQL | **Railway** (PostgreSQL addon) |

## Local Development

```bash
# Terminal 1 — Backend
cd blog-be && PORT=3001 npm run start:dev

# Terminal 2 — Frontend
cd blog-fe && npm run dev
```

---

## Railway Setup (Backend + Database)

### 1. Create Project

1. [railway.app](https://railway.app) → New Project.
2. Add **PostgreSQL** service → copy `DATABASE_URL` from Variables tab.
3. Add **Empty Service** → connect GitHub repo, set root directory to `blog-be`.

### 2. Railway Service Config

| Setting | Value |
|---------|-------|
| Root directory | `blog-be` |
| Build command | `npm run build` |
| Start command | `npm run start:prod` |
| Health check | `GET /health` |

### 3. Railway Environment Variables

```
PORT=3001
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app.vercel.app
```

### 4. TypeORM Migrations on Railway

Add to `package.json`:
```json
"migration:run": "typeorm migration:run -d dist/data-source.js"
```

Run once after deploy via Railway CLI or one-off command:
```bash
railway run npm run migration:run
```

### 5. Generate Public URL

Railway → Settings → Networking → Generate Domain.
Use this as `NEXT_PUBLIC_API_URL` on Vercel (e.g. `https://blog-be-production.up.railway.app`).

---

## Vercel Setup (Frontend)

### 1. Import Project

1. [vercel.com](https://vercel.com) → Import Git repo.
2. Set **Root Directory** to `blog-fe`.
3. Framework: Next.js (auto-detected).

### 2. Vercel Environment Variables

```
NEXT_PUBLIC_API_URL=https://blog-be-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

Set for: Production, Preview, Development.

### 3. Build Settings

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Output | `.next` (default) |
| Node version | 20.x |

---

## CORS (Required)

In `blog-be/src/main.ts`, set `FRONTEND_URL` to your Vercel domain:

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

Update when adding preview domains or custom domain.

---

## Health Check Endpoint

```typescript
@Get('health')
health() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

Railway uses this to verify service is running.

---

## Pre-Deploy Checklist

- [ ] `npm run build` passes in `blog-fe/` and `blog-be/`
- [ ] `npm run lint` passes
- [ ] TypeORM migrations applied on Railway DB
- [ ] `JWT_SECRET` is strong and unique (not dev value)
- [ ] `FRONTEND_URL` on Railway matches Vercel production URL
- [ ] `NEXT_PUBLIC_API_URL` on Vercel points to Railway domain
- [ ] CORS allows Vercel domain
- [ ] `.env.example` updated in both apps
- [ ] No secrets committed to git

---

## Custom Domain (Optional)

| App | DNS |
|-----|-----|
| FE | `blog.yourdomain.com` → Vercel |
| BE | `api.yourdomain.com` → Railway |

Update `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` accordingly.

---

## CI (Optional)

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  be:
    runs-on: ubuntu-latest
    defaults:
      run: { working-directory: blog-be }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build && npm run lint
  fe:
    runs-on: ubuntu-latest
    defaults:
      run: { working-directory: blog-fe }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build && npm run lint
```
