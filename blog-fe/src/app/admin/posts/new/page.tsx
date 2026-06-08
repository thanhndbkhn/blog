"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ImageUpload";
import { GlassCard } from "@/components/ui/GlassCard";
import { getPublicApiUrl } from "@/lib/env";

const TOKEN_KEY = "blog_admin_token";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [tagSlugs, setTagSlugs] = useState("redis, backend");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function slugify(s: string) {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.push("/admin");
      return;
    }
    setMsg("");
    setLoading(true);
    const base = getPublicApiUrl();
    const slugs = tagSlugs
      .split(",")
      .map((s) => s.trim().toLowerCase().replace(/\s+/g, "-"))
      .filter(Boolean);
    const r = await fetch(`${base}/admin/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        slug: slug || slugify(title),
        body,
        status,
        tagSlugs: slugs.length ? slugs : undefined,
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

  return (
    <main className="page-container page-container--wide">
      <div className="stagger-in space-y-6">
        <Link href="/admin" className="link-back">
          ← Admin
        </Link>
        <h1 className="page-hero-title text-2xl sm:text-3xl">Viết bài mới</h1>

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
              <label className="input-label">Slug (chữ thường, số, -)</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Để trống → tự sinh từ tiêu đề"
                className="input-field text-mono text-sm"
              />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="input-label mb-0">Nội dung (Markdown)</label>
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
              <label className="input-label">Tag (slug, cách nhau dấu phẩy)</label>
              <input
                value={tagSlugs}
                onChange={(e) => setTagSlugs(e.target.value)}
                className="input-field text-sm"
                placeholder="redis, nestjs"
              />
              <p className="text-xs text-muted mt-1">
                Tag phải đã tồn tại trong DB (seed: nestjs, prisma, typescript,
                redis, backend).
              </p>
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
              {loading ? "Đang lưu…" : "Lưu bài"}
            </button>
          </form>
        </GlassCard>
      </div>
    </main>
  );
}
