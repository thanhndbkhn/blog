"use client";

import { useEffect, useState } from "react";
import { getPublicApiUrl } from "@/lib/env";

type Health = { ok: boolean; service: string; db?: boolean; ts: string };

export function HealthCheck() {
  const [data, setData] = useState<Health | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const base = getPublicApiUrl();
    fetch(`${base}/health`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json() as Promise<Health>;
      })
      .then((j) => {
        if (!cancelled) {
          setData(j);
          setErr(null);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setErr(e.message);
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-muted animate-pulse">Đang gọi API…</p>;
  }
  if (err) {
    return (
      <div className="space-y-2">
        <p className="text-danger text-mono text-sm">Lỗi: {err}</p>
        <p className="text-muted text-xs">
          Bật blog-be:{" "}
          <code className="rounded px-1.5 py-0.5 bg-[var(--code-bg)] text-mono">
            npm run start:dev
          </code>{" "}
          trong{" "}
          <code className="rounded px-1.5 py-0.5 bg-[var(--code-bg)] text-mono">
            blog-be
          </code>
        </p>
      </div>
    );
  }
  return (
    <pre className="text-success text-mono text-sm overflow-x-auto rounded-lg bg-[var(--code-bg)] p-3 border border-[var(--card-border)]">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
