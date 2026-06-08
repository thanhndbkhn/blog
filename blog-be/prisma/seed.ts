import { Locale, PrismaClient, PostStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const REDIS_POST_BODY = `# Redis là gì? Dùng ở đâu trong backend?

**Redis** (Remote Dictionary Server) là kho lưu trữ **key–value trong RAM**, rất nhanh. Dữ liệu có thể **mất khi restart** (tuỳ cấu hình persistence), nên Redis thường dùng cho thứ *tạm thời* hoặc *đọc nhiều*, không thay thế hoàn toàn Postgres.

## Tại sao dev backend hay gặp Redis?

| Use case | Ý tưởng |
|----------|---------|
| **Cache** | Lưu kết quả query/API (TTL 30s–5 phút), giảm tải DB. |
| **Session** | Lưu session login thay vì cookie lớn hoặc DB mỗi request. |
| **Rate limit** | Đếm số request theo IP/user (sliding window). |
| **Queue / job** | Bull/BullMQ dùng Redis làm hàng đợi (gửi mail, xử lý ảnh). |
| **Pub/Sub** | Realtime thông báo giữa nhiều instance API. |
| **Leaderboard** | Sorted set — điểm số, ranking. |

## Vài lệnh cho người mới

\`\`\`bash
# Docker một dòng
docker run -d -p 6379:6379 redis:7-alpine

# Vào CLI
redis-cli

SET blog:views:123 1 EX 300    # key, value, hết hạn 300 giây
GET blog:views:123
INCR blog:views:123
\`\`\`

## Cache trong blog (ví dụ)

- **Key:** \`posts:list:published\` → JSON danh sách bài (TTL 60s).
- Khi admin **publish / sửa / xóa** bài → **XÓA key** đó (invalidate). Lần đọc sau miss cache → query DB lại → set lại Redis.

Như vậy độc giả đọc list bài **không đập Postgres mỗi request**, mà vẫn **không sợ data cũ** nếu bạn xóa cache đúng lúc.

## Redis vs Postgres (nhớ nhanh)

- **Postgres:** bền, quan hệ, transaction — **nguồn sự thật**.
- **Redis:** nhanh, đơn giản — **tăng tốc / tạm / realtime**.

## Kết

Redis không bắt buộc cho MVP blog, nhưng là bước **hợp lý** khi traffic tăng hoặc bạn muốn **session / rate limit / queue** gọn. Stack kiểu **Nest + Postgres + Redis** rất phổ biến.

---

*Bài mẫu seed — bạn có thể sửa hoặc mở rộng trên Admin.*
`;

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@local.dev';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash: hash },
    create: {
      email,
      passwordHash: hash,
      role: 'ADMIN',
    },
  });

  const tagNest = await prisma.tag.upsert({
    where: { slug: 'nestjs' },
    update: {},
    create: { name: 'NestJS', slug: 'nestjs' },
  });
  const tagPrisma = await prisma.tag.upsert({
    where: { slug: 'prisma' },
    update: {},
    create: { name: 'Prisma', slug: 'prisma' },
  });
  const tagTs = await prisma.tag.upsert({
    where: { slug: 'typescript' },
    update: {},
    create: { name: 'TypeScript', slug: 'typescript' },
  });
  const tagRedis = await prisma.tag.upsert({
    where: { slug: 'redis' },
    update: {},
    create: { name: 'Redis', slug: 'redis' },
  });
  const tagBackend = await prisma.tag.upsert({
    where: { slug: 'backend' },
    update: {},
    create: { name: 'Backend', slug: 'backend' },
  });

  const now = new Date();

  const p1 = await prisma.post.upsert({
    where: { slug: 'chao-mung-blog' },
    update: {},
    create: {
      title: 'Chào mừng đến blog dev',
      slug: 'chao-mung-blog',
      body: `# Xin chào

Đây là bài **mẫu** sau khi chạy \`prisma db seed\`.

- Postgres + Prisma
- NestJS + JWT

\`\`\`ts
const ok = true;
\`\`\`
`,
      status: PostStatus.PUBLISHED,
      publishedAt: now,
      authorId: user.id,
    },
  });

  const p2 = await prisma.post.upsert({
    where: { slug: 'prisma-postgres-nhanh' },
    update: {},
    create: {
      title: 'Prisma + Postgres — workflow nhanh',
      slug: 'prisma-postgres-nhanh',
      body: `## Migration

1. Sửa \`schema.prisma\`
2. \`npx prisma migrate dev\`
3. \`npx prisma generate\`

Schema type-safe, ít SQL tay hơn.`,
      status: PostStatus.PUBLISHED,
      publishedAt: now,
      authorId: user.id,
    },
  });

  const pRedis = await prisma.post.upsert({
    where: { slug: 'redis-la-gi-backend-cache' },
    update: {
      title: 'Redis là gì? Cache & use case cho backend',
      body: REDIS_POST_BODY,
      status: PostStatus.PUBLISHED,
      publishedAt: now,
    },
    create: {
      title: 'Redis là gì? Cache & use case cho backend',
      slug: 'redis-la-gi-backend-cache',
      body: REDIS_POST_BODY,
      status: PostStatus.PUBLISHED,
      publishedAt: now,
      authorId: user.id,
    },
  });

  await prisma.post.upsert({
    where: { slug: 'bai-nhap-draft' },
    update: {},
    create: {
      title: 'Bài nháp (chưa publish)',
      slug: 'bai-nhap-draft',
      body: 'Nội dung đang viết dở…',
      status: PostStatus.DRAFT,
      publishedAt: null,
      authorId: user.id,
    },
  });

  await prisma.postTag.deleteMany({
    where: { postId: { in: [p1.id, p2.id, pRedis.id] } },
  });
  await prisma.postTag.createMany({
    data: [
      { postId: p1.id, tagId: tagNest.id },
      { postId: p1.id, tagId: tagTs.id },
      { postId: p2.id, tagId: tagPrisma.id },
      { postId: p2.id, tagId: tagTs.id },
      { postId: pRedis.id, tagId: tagRedis.id },
      { postId: pRedis.id, tagId: tagBackend.id },
    ],
    skipDuplicates: true,
  });

  const i18nRows: { key: string; locale: Locale; value: string }[] = [
    {
      key: 'site.name',
      locale: Locale.vn,
      value: 'Gonzalo',
    },
    {
      key: 'site.name',
      locale: Locale.en,
      value: 'Gonzalo',
    },
    {
      key: 'site.hero.eyebrow',
      locale: Locale.vn,
      value: 'Ghi chép & chia sẻ',
    },
    {
      key: 'site.hero.eyebrow',
      locale: Locale.en,
      value: 'Notes & sharing',
    },
    {
      key: 'site.hero.tagline',
      locale: Locale.vn,
      value:
        'Gonzalo — 10 năm kinh nghiệm FE & BE. Ghi chép về hệ thống, backend và craft code.',
    },
    {
      key: 'site.hero.tagline',
      locale: Locale.en,
      value:
        'Gonzalo — 10 years across FE & BE. Writing about systems, backend, and the craft of building software.',
    },
    {
      key: 'author.name',
      locale: Locale.vn,
      value: 'Gonzalo',
    },
    {
      key: 'author.name',
      locale: Locale.en,
      value: 'Gonzalo',
    },
    {
      key: 'author.role',
      locale: Locale.vn,
      value: 'Kỹ sư Full-stack · 10 năm kinh nghiệm',
    },
    {
      key: 'author.role',
      locale: Locale.en,
      value: 'Full-stack Engineer · 10 years experience',
    },
    {
      key: 'author.bio',
      locale: Locale.vn,
      value:
        'Tôi là Gonzalo, làm việc với frontend và backend hơn 10 năm — từ UI, API, database đến triển khai production. Blog này là nơi tôi ghi lại những gì học được trên đường đi.',
    },
    {
      key: 'author.bio',
      locale: Locale.en,
      value:
        "I'm Gonzalo, working across frontend and backend for over 10 years — from UI and APIs to databases and production deployments. This blog is where I share what I've learned along the way.",
    },
    {
      key: 'nav.home',
      locale: Locale.vn,
      value: 'Trang chủ',
    },
    {
      key: 'nav.home',
      locale: Locale.en,
      value: 'Home',
    },
    {
      key: 'nav.about',
      locale: Locale.vn,
      value: 'Về tôi',
    },
    {
      key: 'nav.about',
      locale: Locale.en,
      value: 'About',
    },
    {
      key: 'nav.blogs',
      locale: Locale.vn,
      value: 'Blogs',
    },
    {
      key: 'nav.blogs',
      locale: Locale.en,
      value: 'Blogs',
    },
    {
      key: 'nav.til',
      locale: Locale.vn,
      value: 'TIL',
    },
    {
      key: 'nav.til',
      locale: Locale.en,
      value: 'TIL',
    },
    {
      key: 'nav.notes',
      locale: Locale.vn,
      value: 'Notes',
    },
    {
      key: 'nav.notes',
      locale: Locale.en,
      value: 'Notes',
    },
    {
      key: 'page.about.eyebrow',
      locale: Locale.vn,
      value: 'Giới thiệu',
    },
    {
      key: 'page.about.eyebrow',
      locale: Locale.en,
      value: 'About',
    },
    {
      key: 'page.about.body',
      locale: Locale.vn,
      value:
        'Tôi viết về những gì đang làm và đang học — từ React, NestJS, database đến vận hành hệ thống. Blog là nơi tổng hợp bài dài; TIL là mẩu học được trong ngày; Notes là ghi chú nhanh chưa thành bài.',
    },
    {
      key: 'page.about.body',
      locale: Locale.en,
      value:
        'I write about what I build and learn — from React and NestJS to databases and running systems in production. Blogs are long-form posts; TIL is what I picked up today; Notes are quick drafts not yet polished.',
    },
    {
      key: 'page.blogs.title',
      locale: Locale.vn,
      value: 'Bài viết',
    },
    {
      key: 'page.blogs.title',
      locale: Locale.en,
      value: 'Blog posts',
    },
    {
      key: 'page.blogs.subtitle',
      locale: Locale.vn,
      value: 'Bài dài về backend, frontend và kinh nghiệm thực tế.',
    },
    {
      key: 'page.blogs.subtitle',
      locale: Locale.en,
      value: 'Long-form writing on backend, frontend, and real-world experience.',
    },
    {
      key: 'page.til.title',
      locale: Locale.vn,
      value: 'Today I Learned',
    },
    {
      key: 'page.til.title',
      locale: Locale.en,
      value: 'Today I Learned',
    },
    {
      key: 'page.til.empty',
      locale: Locale.vn,
      value: 'Chưa có mục TIL. Sắp có — những điều nhỏ học được mỗi ngày.',
    },
    {
      key: 'page.til.empty',
      locale: Locale.en,
      value: 'No TIL entries yet. Coming soon — small things learned each day.',
    },
    {
      key: 'page.notes.title',
      locale: Locale.vn,
      value: 'Notes',
    },
    {
      key: 'page.notes.title',
      locale: Locale.en,
      value: 'Notes',
    },
    {
      key: 'page.notes.empty',
      locale: Locale.vn,
      value: 'Chưa có ghi chú. Đây sẽ là nơi draft và ý tưởng chưa publish.',
    },
    {
      key: 'page.notes.empty',
      locale: Locale.en,
      value: 'No notes yet. This will hold drafts and ideas not ready to publish.',
    },
    {
      key: 'section.recent',
      locale: Locale.vn,
      value: 'Bài gần đây',
    },
    {
      key: 'section.recent',
      locale: Locale.en,
      value: 'Recent posts',
    },
    {
      key: 'section.about',
      locale: Locale.vn,
      value: 'Về tác giả',
    },
    {
      key: 'section.about',
      locale: Locale.en,
      value: 'About the author',
    },
    {
      key: 'meta.reading_time',
      locale: Locale.vn,
      value: 'phút đọc',
    },
    {
      key: 'meta.reading_time',
      locale: Locale.en,
      value: 'min read',
    },
    {
      key: 'empty.posts',
      locale: Locale.vn,
      value: 'Chưa có bài viết nào. Hãy publish bài đầu tiên từ Admin.',
    },
    {
      key: 'empty.posts',
      locale: Locale.en,
      value: 'No posts yet. Publish your first article from Admin.',
    },
  ];

  for (const row of i18nRows) {
    await prisma.i18nEntry.upsert({
      where: { key_locale: { key: row.key, locale: row.locale } },
      update: { value: row.value },
      create: row,
    });
  }

  const enTranslations: {
    postId: string;
    title: string;
    body: string;
  }[] = [
    {
      postId: p1.id,
      title: 'Welcome to the dev blog',
      body: `# Hello

This is a **sample** post after running \`prisma db seed\`.

- Postgres + Prisma
- NestJS + JWT

\`\`\`ts
const ok = true;
\`\`\`
`,
    },
    {
      postId: p2.id,
      title: 'Prisma + Postgres — a fast workflow',
      body: `## Migrations

1. Edit \`schema.prisma\`
2. \`npx prisma migrate dev\`
3. \`npx prisma generate\`

Type-safe schema, less hand-written SQL.`,
    },
    {
      postId: pRedis.id,
      title: 'What is Redis? Cache & backend use cases',
      body: `# What is Redis? Where does it fit in the backend?

**Redis** is an in-memory **key–value store** that's extremely fast. Data may be **lost on restart** (depending on persistence settings), so Redis is usually for *temporary* or *read-heavy* workloads — not a full Postgres replacement.

## Why backend devs reach for Redis

| Use case | Idea |
|----------|------|
| **Cache** | Store query/API results (TTL 30s–5m), reduce DB load. |
| **Session** | Store login sessions instead of large cookies or DB hits every request. |
| **Rate limit** | Count requests per IP/user (sliding window). |
| **Queue / jobs** | Bull/BullMQ uses Redis as a job queue (email, image processing). |
| **Pub/Sub** | Realtime notifications across API instances. |
| **Leaderboard** | Sorted sets for scores and rankings. |

## Quick commands for beginners

\`\`\`bash
docker run -d -p 6379:6379 redis:7-alpine
redis-cli
SET blog:views:123 1 EX 300
GET blog:views:123
INCR blog:views:123
\`\`\`

## Cache in a blog (example)

- **Key:** \`posts:list:published\` → JSON list (TTL 60s).
- On **publish / update / delete** → **DELETE** that key. Next read misses cache → DB query → set again.

Readers get fast list endpoints without hammering Postgres, while you avoid stale data if you invalidate correctly.

## Redis vs Postgres (quick take)

- **Postgres:** durable, relational, transactions — **source of truth**.
- **Redis:** fast, simple — **speed / ephemeral / realtime**.

## Wrap-up

Redis isn't required for an MVP blog, but it's a **natural next step** when traffic grows or you need **sessions / rate limits / queues**. **Nest + Postgres + Redis** is a very common stack.

---

*Sample seed post — edit or extend from Admin.*
`,
    },
  ];

  for (const tr of enTranslations) {
    await prisma.postTranslation.upsert({
      where: {
        postId_locale: { postId: tr.postId, locale: Locale.en },
      },
      update: { title: tr.title, body: tr.body },
      create: {
        postId: tr.postId,
        locale: Locale.en,
        title: tr.title,
        body: tr.body,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed OK. Admin:', email, '| password:', password);
  // eslint-disable-next-line no-console
  console.log('Bài Redis (public): /p/redis-la-gi-backend-cache');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
