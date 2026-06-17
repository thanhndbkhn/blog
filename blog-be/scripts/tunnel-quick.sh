#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Blog tunnel (quick — không cần domain Cloudflare)"
echo ""
echo "Yêu cầu trước khi chạy (2 terminal khác):"
echo "  blog-be:  npm run start:dev   → :4000"
echo "  blog-fe:  cp .env.tunnel.example .env.local && npm run dev → :3000"
echo ""

if ! curl -sf --max-time 2 http://127.0.0.1:3000 >/dev/null 2>&1; then
  echo "⚠  FE chưa chạy tại http://127.0.0.1:3000 — start blog-fe trước."
fi

if ! curl -sf --max-time 2 http://127.0.0.1:4000/api/health >/dev/null 2>&1; then
  echo "⚠  BE chưa chạy tại http://127.0.0.1:4000 — start blog-be trước."
fi

echo "==> Khởi động gateway (:8080) + cloudflared quick tunnel (HTTP/2)..."
docker compose --profile tunnel-quick up -d --force-recreate gateway cloudflared-quick

echo ""
echo "Đợi vài giây rồi lấy URL public:"
echo "  docker logs -f blog-cloudflared-quick"
echo ""
echo "Tìm dòng: https://....trycloudflare.com"
echo "Gateway local: http://127.0.0.1:8080"
echo ""
echo "Nếu log báo chặn port 7844: đã dùng --protocol http2. Vẫn lỗi → mở outbound TCP 7844 trên router/firewall."
echo ""
echo "Dừng tunnel: docker compose --profile tunnel-quick stop cloudflared-quick gateway"
