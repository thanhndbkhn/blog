#!/usr/bin/env bash
# One-time setup: named Cloudflare Tunnel cho thanhgonzalo.dpdns.org
# Chạy: bash scripts/tunnel-domain-setup.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CF="${ROOT}/bin/cloudflared"
DOMAIN="thanhgonzalo.dpdns.org"
TUNNEL_NAME="blog-local"

if [[ ! -x "$CF" ]]; then
  echo "==> Tải cloudflared..."
  mkdir -p bin
  curl -L --output "$CF" https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
  chmod +x "$CF"
fi

echo "==> Bước 1: Đăng nhập Cloudflare (mở browser)"
echo "    Chọn domain: $DOMAIN → đợi trang báo success"
"$CF" tunnel login

if [[ ! -f "$HOME/.cloudflared/cert.pem" ]]; then
  echo ""
  echo "❌ Không thấy ~/.cloudflared/cert.pem"
  echo "   Login chưa xong — chạy lại: $CF tunnel login"
  echo "   Trong browser: bấm thanhgonzalo.dpdns.org, đợi 'Success'."
  exit 1
fi
echo "    ✓ cert.pem OK"
echo "==> Bước 2: Tạo tunnel '$TUNNEL_NAME'"
if "$CF" tunnel list 2>/dev/null | grep -q "$TUNNEL_NAME"; then
  echo "    Tunnel đã tồn tại, bỏ qua create."
else
  "$CF" tunnel create "$TUNNEL_NAME"
fi

TUNNEL_ID=$("$CF" tunnel list 2>/dev/null | awk -v n="$TUNNEL_NAME" '$2 == n { print $1; exit }')
if [[ -z "$TUNNEL_ID" ]]; then
  echo "❌ Không tìm thấy TUNNEL_ID. Chạy: $CF tunnel list"
  exit 1
fi

echo "    TUNNEL_ID: $TUNNEL_ID"

mkdir -p cloudflared
CRED_SRC="$HOME/.cloudflared/${TUNNEL_ID}.json"
CRED_DST="cloudflared/${TUNNEL_ID}.json"

if [[ -f "$CRED_SRC" ]]; then
  cp "$CRED_SRC" "$CRED_DST"
  chmod 644 "$CRED_DST"
  echo "    Đã copy credentials → $CRED_DST"
else
  echo "❌ Không thấy $CRED_SRC"
  exit 1
fi

cat > cloudflared/config.yml <<EOF
tunnel: ${TUNNEL_ID}
credentials-file: /etc/cloudflared/${TUNNEL_ID}.json
protocol: http2

ingress:
  - hostname: ${DOMAIN}
    service: http://127.0.0.1:8080
  - service: http_status:404
EOF

echo "    Đã tạo cloudflared/config.yml"

echo ""
echo "==> Bước 3: Trỏ DNS $DOMAIN → tunnel"
"$CF" tunnel route dns "$TUNNEL_NAME" "$DOMAIN"

echo ""
echo "✅ Setup xong!"
echo ""
echo "Chạy app (3 terminal):"
echo "  1. cd blog-be && docker compose up -d && npm run start:dev"
echo "  2. cd blog-fe && cp .env.tunnel.example .env.local && npm run dev"
echo "  3. cd blog-be && npm run docker:tunnel:domain"
echo ""
echo "Test: https://${DOMAIN}/en/about"
