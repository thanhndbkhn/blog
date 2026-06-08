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
