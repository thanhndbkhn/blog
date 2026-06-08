"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ImageUpload";
import { GlassCard } from "@/components/ui/GlassCard";
import { getPublicApiUrl } from "@/lib/env";

const TOKEN_KEY = "blog_admin_token";

type Post = {
  id: string;
  title: string;
  slug: string;
  body: string;
  status: string;
  tags: { slug: string; name: string }[];
};

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.postId as string;
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [tagSlugs, setTagSlugs] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.push("/admin");
      return;
    }
    const base = getPublicApiUrl();
    fetch(`${base}/admin/posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin");
          throw new Error("401");
        }
        if (!r.ok) throw new Error("Không tải được bài");
        return r.json() as Promise<Post>;
      })
      .then((p) => {
        setPost(p);
        setTitle(p.title);
        setSlug(p.slug);
        setBody(p.body);
        setStatus(p.status as "DRAFT" | "PUBLISHED");
        setTagSlugs(p.tags.map((t) => t.slug).join(", "));
      })
      .catch(() => setMsg("Không tải được bài hoặc hết phiên."));
  }, [id, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    setMsg("");
    setLoading(true);
    const base = getPublicApiUrl();
    const slugs = tagSlugs
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const r = await fetch(`${base}/admin/posts/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        slug,
        body,
        status,
        tagSlugs: slugs,
      }),
    });
    const j = await r.json().catch(() => ({}));
    setLoading(false);
    if (!r.ok) {
      setMsg(
        Array.isArray(j.message) ? j.message.join(", ") : (j.message ?? r.statusText),
      );
      return;
    }
    router.push("/admin");
  }

  if (!post && !msg) {
    return (
      <main className="page-container">
        <p className="text-muted animate-pulse">Đang tải…</p>
      </main>
    );
  }

  return (
    <main className="page-container page-container--wide">
      <div className="stagger-in space-y-6">
        <Link href="/admin" className="link-back">
          ← Admin
        </Link>
        <h1 className="page-hero-title text-2xl sm:text-3xl">Sửa bài</h1>

        {msg && !post ? (
          <GlassCard>
            <p className="text-danger">{msg}</p>
          </GlassCard>
        ) : (
          <GlassCard>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="input-label">Tiêu đề</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="input-label">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="input-field text-mono text-sm"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="input-label mb-0">Nội dung</label>
                  <ImageUpload onInserted={(line) => setBody((b) => b + line)} />
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={18}
                  className="input-field text-mono text-sm resize-y min-h-[12rem]"
                  required
                />
              </div>
              <div>
                <label className="input-label">Tag slugs</label>
                <input
                  value={tagSlugs}
                  onChange={(e) => setTagSlugs(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="input-label">Trạng thái</label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "DRAFT" | "PUBLISHED")
                  }
                  className="input-field w-auto"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Publish</option>
                </select>
              </div>
              {msg && <p className="text-danger text-sm">{msg}</p>}
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Đang lưu…" : "Cập nhật"}
              </button>
            </form>
          </GlassCard>
        )}
      </div>
    </main>
  );
}
