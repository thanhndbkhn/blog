import type { CSSProperties } from "react";
import Link from "next/link";
import {
  formatPostDate,
  getExcerpt,
  getReadingTimeMinutes,
} from "@/lib/post-utils";
import type { Locale } from "@/lib/locale";
import { localePath } from "@/lib/locale";

export type PostCardData = {
  id: string;
  title: string;
  slug: string;
  body: string;
  publishedAt: string | null;
  tags: { slug: string; name: string }[];
};

type Props = {
  post: PostCardData;
  featured?: boolean;
  locale?: Locale;
  readingLabel?: string;
};

export function PostCard({
  post,
  featured = false,
  locale = "en",
  readingLabel = "phút đọc",
}: Props) {
  const excerpt = getExcerpt(post.body, featured ? 200 : 140);
  const readingTime = getReadingTimeMinutes(post.body);
  const date = formatPostDate(post.publishedAt, locale);

  return (
    <article
      className={`post-card${featured ? " post-card--featured" : ""}`}
    >
      <Link
        href={localePath(`/p/${post.slug}`, locale)}
        className="post-card-link"
      >
        <div
          className="post-card-cover"
          style={
            { "--cover-hue": hashHue(post.slug) } as CSSProperties
          }
          aria-hidden
        />
        <div className="post-card-body">
          <div className="post-card-meta">
            {date && <time dateTime={post.publishedAt ?? undefined}>{date}</time>}
            {date && <span className="post-card-meta-sep">·</span>}
            <span>
              {readingTime} {readingLabel}
            </span>
          </div>
          <h2 className="post-card-title">{post.title}</h2>
          <p className="post-card-excerpt">{excerpt}</p>
          {post.tags.length > 0 && (
            <div className="post-card-tags">
              {post.tags.map((t) => (
                <span key={t.slug} className="tag-pill">
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}

function hashHue(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i) * 17) % 360;
  return h;
}
