"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { getPublicApiUrl } from "@/lib/env";

const TOKEN_KEY = "blog_admin_token";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

type MeUser = { id: string; email: string; role: string };

export default function AdminPage() {
  const [email, setEmail] = useState("admin@local.dev");
  const [password, setPassword] = useState("admin123");
  const [token, setToken] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [me, setMe] = useState<MeUser | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setToken(
      typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
    );
  }, []);

  useEffect(() => {
    if (!token) {
      setPosts(null);
      setMe(null);
      return;
    }
    const base = getPublicApiUrl();
    fetch(`${base}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { user?: MeUser } | null) => {
        if (j?.user) setMe(j.user);
      })
      .catch(() => setMe(null));

    fetch(`${base}/admin/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          throw new Error("Hết hạn — đăng nhập lại");
        }
        if (!r.ok) throw new Error(r.statusText);
        return r.json() as Promise<Post[]>;
      })
      .then(setPosts)
      .catch((e: Error) => setMsg(e.message));
  }, [token]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const base = getPublicApiUrl();
    const r = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const errMsg = Array.isArray(j.message)
        ? j.message.join(", ")
        : (j.message ?? "Đăng nhập thất bại");
      setMsg(errMsg);
      return;
    }
    localStorage.setItem(TOKEN_KEY, j.access_token);
    setToken(j.access_token);
    if (j.user) setMe(j.user as MeUser);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setPosts(null);
    setMe(null);
  }

  return (
    <main className="page-container">
      <div className="stagger-in space-y-6">
        <Link href="/" className="link-back">
          ← Trang chủ
        </Link>

        <header>
          <h1 className="page-hero-title text-2xl sm:text-3xl">Admin</h1>
          <p className="page-hero-subtitle text-sm">
            Seed: admin@local.dev / admin123
          </p>
        </header>

        {!token ? (
          <GlassCard title="Đăng nhập">
            <form onSubmit={login} className="space-y-4 max-w-sm">
              <div>
                <label className="input-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="input-label">Mật khẩu</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  required
                  minLength={1}
                />
              </div>
              <button type="submit" className="btn-primary">
                Đăng nhập
              </button>
            </form>
          </GlassCard>
        ) : (
          <>
            <GlassCard title="Tài khoản">
              {me ? (
                <dl className="grid gap-3 text-sm">
                  <div>
                    <dt className="text-muted text-xs">Email</dt>
                    <dd className="text-mono text-success">{me.email}</dd>
                  </div>
                  <div>
                    <dt className="text-muted text-xs">User ID</dt>
                    <dd className="text-mono text-xs break-all text-muted">
                      {me.id}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted text-xs">Role</dt>
                    <dd>{me.role}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-muted text-sm">Đang tải thông tin user…</p>
              )}
            </GlassCard>

            <div className="flex flex-wrap gap-3 items-center">
              <button type="button" onClick={logout} className="btn-ghost">
                Đăng xuất
              </button>
              <Link href="/admin/posts/new" className="btn-primary">
                + Viết bài mới
              </Link>
            </div>

            <GlassCard title="Bài của bạn" subtitle="Draft + published">
              {!posts ? (
                <p className="text-muted">Đang tải…</p>
              ) : (
                <ul className="space-y-2">
                  {posts.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-wrap justify-between items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--accent-soft)]/20 px-4 py-3 transition-colors hover:border-[var(--accent)]/25"
                    >
                      <span className="font-medium">{p.title}</span>
                      <div className="flex items-center gap-3">
                        <span className="tag-pill">{p.status}</span>
                        <Link
                          href={`/en/p/${p.slug}`}
                          className="text-xs text-muted hover:text-accent"
                        >
                          Xem
                        </Link>
                        <Link
                          href={`/admin/edit-post/${p.id}`}
                          className="link-accent text-xs"
                        >
                          Sửa
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>
          </>
        )}

        {msg && <p className="text-danger text-sm">{msg}</p>}
      </div>
    </main>
  );
}
