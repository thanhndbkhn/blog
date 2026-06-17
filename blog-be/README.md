# blog-be (NestJS + Prisma + Postgres + JWT)

## Chạy nhanh

```bash
docker compose up -d
# Đợi vài giây — container minio-setup tạo bucket blog-uploads + CORS
# MinIO Console: http://localhost:9001 (minioadmin / minioadmin)
npm run prisma:migrate    # lần đầu
npm run seed
npm run start:dev
```

### MinIO + upload ảnh

| URL | Mô tả |
|-----|--------|
| http://localhost:9000 | API S3 |
| http://localhost:9001 | Console web |

`.env`: `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_PUBLIC_BASE` (vd `http://localhost:9000/blog-uploads`).

Admin FE: **Ảnh (MinIO)** → presign `POST /api/admin/upload/presign` → PUT file → chèn `![](publicUrl)` vào Markdown.

## Seed (admin)

| Mặc định | Giá trị |
|----------|---------|
| Email | `admin@local.dev` |
| Password | `admin123` |

Đổi qua env khi seed: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`.

## API (prefix `/api`)

### Auth

`POST /api/auth/login`  
Body JSON: `{ "email": "admin@local.dev", "password": "admin123" }`  
→ `{ "access_token": "...", "user": { "id", "email", "role" } }`

### Public — chỉ bài **PUBLISHED**

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/api/posts` | Danh sách đã publish |
| GET | `/api/posts/by-slug/:slug` | Chi tiết theo slug |

### Admin — header `Authorization: Bearer <token>`

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/api/admin/posts` | Tất cả bài của bạn (draft + published) |
| GET | `/api/admin/posts/:id` | Một bài |
| POST | `/api/admin/posts` | Tạo bài |
| PATCH | `/api/admin/posts/:id` | Sửa |
| DELETE | `/api/admin/posts/:id` | Xóa |

**POST/PATCH body (JSON):**

```json
{
  "title": "Tiêu đề",
  "slug": "only-lowercase-and-digits",
  "body": "Markdown...",
  "status": "PUBLISHED",
  "tagSlugs": ["nestjs", "prisma"]
}
```

`status`: `DRAFT` | `PUBLISHED` (mặc định tạo = DRAFT).

### Health

`GET /api/health` — `db: true` nếu Postgres OK.

## Env

| Biến | Mô tả |
|------|--------|
| `DATABASE_URL` | Postgres |
| `JWT_SECRET` | ≥16 ký tự |
| `JWT_EXPIRES` | Mặc định `7d` |
| `CORS_ORIGINS` | FE origins, cách nhau dấu phẩy |

## Prisma

`npm run prisma:studio` — GUI DB.

## Cloudflare Tunnel (local → internet)

### Chưa có domain — Quick tunnel (miễn phí, URL tạm)

Gộp FE + API qua gateway nginx `:8080`, rồi public bằng `trycloudflare.com`.

**Terminal 1 — infra:**

```bash
docker compose up -d
npm run start:dev          # BE :4000
```

**Terminal 2 — FE (env tunnel):**

```bash
cd ../blog-fe
cp .env.tunnel.example .env.local   # NEXT_PUBLIC_API_URL=/api
npm run dev                         # :3000
```

**Terminal 3 — tunnel:**

```bash
npm run docker:tunnel
docker logs -f blog-cloudflared-quick   # copy URL https://....trycloudflare.com
```

Test: mở URL public → intro video → trang blog. API: `https://....trycloudflare.com/api/health`

Gateway local (không qua Cloudflare): http://127.0.0.1:8080

Dừng tunnel: `docker compose --profile tunnel-quick stop cloudflared-quick gateway`

> URL `trycloudflare.com` **đổi mỗi lần** restart cloudflared — chỉ để demo/dev.

**Lỗi pre-check port 7844 (QUIC blocked):** docker-compose đã dùng `--protocol http2`. Restart tunnel:
`docker compose --profile tunnel-quick up -d --force-recreate cloudflared-quick`

### Đã có domain trên Cloudflare

1. Tạo tài khoản Cloudflare (free) → add domain → trỏ nameserver.
2. Trên máy host:
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create blog-local
   cp cloudflared/config.yml.example cloudflared/config.yml
   # Sửa TUNNEL_ID + credentials-file; thay yourdomain.com
   cloudflared tunnel route dns blog-local yourdomain.com
   cloudflared tunnel route dns blog-local www.yourdomain.com
   ```
3. FE: `cp .env.tunnel.example .env.local` (hoặc `NEXT_PUBLIC_API_URL=/api`).
4. Chạy FE + BE như trên, rồi:
   ```bash
   npm run docker:tunnel:domain
   ```

Không expose Postgres / Redis / MinIO console ra tunnel. Upload ảnh qua internet cần thêm hostname `files.` (xem comment trong `cloudflared/config.yml.example`).
