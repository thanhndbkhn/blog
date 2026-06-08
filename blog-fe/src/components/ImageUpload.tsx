"use client";

import { useState } from "react";
import { getPublicApiUrl } from "@/lib/env";

const TOKEN_KEY = "blog_admin_token";

type Props = {
  onInserted: (markdownLine: string) => void;
};

export function ImageUpload({ onInserted }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setErr("Cần đăng nhập Admin.");
      return;
    }
    setErr("");
    setBusy(true);
    const base = getPublicApiUrl();
    const presign = await fetch(`${base}/admin/upload/presign`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentType: file.type,
        filename: file.name,
      }),
    });
    const j = await presign.json().catch(() => ({}));
    if (!presign.ok) {
      setBusy(false);
      setErr(j.message ?? "Presign thất bại — bật MinIO + S3_* trong .env");
      return;
    }
    const put = await fetch(j.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    setBusy(false);
    if (!put.ok) {
      setErr("Upload lên MinIO thất bại");
      return;
    }
    const alt = file.name.replace(/\.[^.]+$/, "") || "ảnh";
    onInserted(`\n\n![${alt}](${j.publicUrl})\n\n`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="btn-ghost cursor-pointer text-xs py-1.5 px-3">
        {busy ? "Đang upload…" : "📎 Ảnh (MinIO)"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={busy}
          onChange={onFile}
        />
      </label>
      {err && <span className="text-danger text-xs">{err}</span>}
    </div>
  );
}
