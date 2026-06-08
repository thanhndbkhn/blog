"use client";

import { useEffect, useState } from "react";
import { PostCard, type PostCardData } from "@/components/PostCard";
import { t } from "@/lib/api/i18n";
import { getPublicApiUrl } from "@/lib/env";
import type { Locale } from "@/lib/locale";

type Props = {
  locale: Locale;
  strings: Record<string, string>;
};

export function HomeFeed({ locale, strings }: Props) {
  const [posts, setPosts] = useState<PostCardData[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const base = getPublicApiUrl();
    fetch(`${base}/posts?ln=${locale}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json() as Promise<PostCardData[]>;
      })
      .then(setPosts)
      .catch((e: Error) => setErr(e.message));
  }, [locale]);

  const readingLabel = t(strings, "meta.reading_time", "phút đọc");

  if (err) {
    return <p className="text-danger text-sm">{err}</p>;
  }
  if (!posts) {
    return (
      <div className="post-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="post-card post-card--skeleton" aria-hidden />
        ))}
      </div>
    );
  }
  if (posts.length === 0) {
    return (
      <p className="text-muted text-sm">{t(strings, "empty.posts")}</p>
    );
  }

  const [featured, ...rest] = posts;

  return (
    <div className="space-y-10">
      <PostCard
        post={featured}
        featured
        locale={locale}
        readingLabel={readingLabel}
      />

      {rest.length > 0 && (
        <section>
          <h2 className="section-title">{t(strings, "section.recent")}</h2>
          <div className="post-grid">
            {rest.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                locale={locale}
                readingLabel={readingLabel}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
