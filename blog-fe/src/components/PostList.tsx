"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublicApiUrl } from "@/lib/env";

type Post = {
  id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
  tags: { slug: string; name: string }[];
};

export function PostList() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const base = getPublicApiUrl();
    fetch(`${base}/posts`)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json() as Promise<Post[]>;
      })
      .then(setPosts)
      .catch((e: Error) => setErr(e.message));
  }, []);

  if (err) {
    return <p className="text-danger text-sm">{err}</p>;
  }
  if (!posts) {
    return <p className="text-muted animate-pulse">Đang tải bài…</p>;
  }
  if (posts.length === 0) {
    return (
      <p className="text-muted text-sm">
        Chưa có bài publish. Chạy seed ở blog-be.
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {posts.map((p) => (
        <li
          key={p.id}
          className="group rounded-xl border border-[var(--card-border)] bg-[var(--accent-soft)]/30 px-4 py-3 transition-all duration-300 hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--accent-glow)]"
        >
          <Link href={`/p/${p.slug}`} className="link-accent text-base">
            {p.title}
          </Link>
          <div className="flex gap-2 mt-2 flex-wrap">
            {p.tags.map((t) => (
              <span key={t.slug} className="tag-pill">
                {t.name}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
