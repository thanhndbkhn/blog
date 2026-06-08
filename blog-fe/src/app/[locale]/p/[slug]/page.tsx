import Link from "next/link";
import { MarkdownBody } from "@/components/MarkdownBody";
import { GlassCard } from "@/components/ui/GlassCard";
import { fetchI18n, t } from "@/lib/api/i18n";
import { getPublicApiUrl } from "@/lib/env";
import { localePath, parseLocale } from "@/lib/locale";
import {
  formatPostDate,
  getReadingTimeMinutes,
} from "@/lib/post-utils";

type Post = {
  title: string;
  slug: string;
  body: string;
  publishedAt: string | null;
  tags: { slug: string; name: string }[];
};

async function getPost(slug: string, locale: string): Promise<Post | null> {
  const base = getPublicApiUrl();
  const r = await fetch(`${base}/posts/by-slug/${slug}?ln=${locale}`, {
    next: { revalidate: 60 },
  });
  if (!r.ok) return null;
  return r.json() as Promise<Post>;
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function PostPage({ params }: Props) {
  const { locale: localeParam, slug } = await params;
  const locale = parseLocale(localeParam);
  const { strings } = await fetchI18n(locale);
  const post = await getPost(slug, locale);
  const blogsHref = localePath("/blogs", locale);

  if (!post) {
    return (
      <main className="page-container page-container--wide">
        <GlassCard>
          <p>{locale === "en" ? "Post not found." : "Không tìm thấy bài."}</p>
          <Link href={blogsHref} className="link-accent mt-4 inline-block">
            ← {t(strings, "nav.blogs", "Blogs")}
          </Link>
        </GlassCard>
      </main>
    );
  }

  const readingTime = getReadingTimeMinutes(post.body);
  const readingLabel = t(strings, "meta.reading_time", "phút đọc");
  const date = formatPostDate(post.publishedAt, locale);

  return (
    <main className="page-container page-container--wide">
      <div className="stagger-in space-y-6">
        <Link href={blogsHref} className="link-back">
          ← {t(strings, "nav.blogs", "Blogs")}
        </Link>

        <header>
          <div className="post-article-meta">
            {date && <time dateTime={post.publishedAt ?? undefined}>{date}</time>}
            {date && <span>·</span>}
            <span>
              {readingTime} {readingLabel}
            </span>
          </div>
          <h1 className="page-hero-title">{post.title}</h1>
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <span key={tag.slug} className="tag-pill">
                {tag.name}
              </span>
            ))}
          </div>
        </header>

        <GlassCard>
          <article className="pb-4">
            <MarkdownBody content={post.body} />
          </article>
        </GlassCard>
      </div>
    </main>
  );
}
