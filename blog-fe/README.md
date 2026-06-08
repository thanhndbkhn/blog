# blog-fe (Next.js 14 + TypeScript)

## Lỗi `Cannot find module './682.js'` (chunk hỏng)

Build cache `.next` lệch sau khi sửa nhiều file / HMR. **Sửa:**

```bash
npm run clean
npm run dev
```

(Hoặc tay: `rm -rf .next` rồi `npm run dev`.)

## Chạy local

```bash
cp .env.local.example .env.local
npm run dev
```

**Cần blog-be** (port 4000). Đăng nhập: http://localhost:3000/admin  

API user hiện tại: `GET /api/auth/me` (Bearer) — hiển thị ở khối **Tài khoản** sau khi login.

## Markdown (trang bài `/p/[slug]`)

- **react-markdown** + **remark-gfm** (bảng, gạch ngang, checklist…)
- **rehype-highlight** + theme `github-dark` (block code có màu)

Viết bài trong Admin như Markdown thường; khi publish sẽ render đúng heading, list, ` ```ts `, v.v.

## Env

| Biến | Mô tả |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api` |
| `NEXT_PUBLIC_APP_NAME` | Tên app |
