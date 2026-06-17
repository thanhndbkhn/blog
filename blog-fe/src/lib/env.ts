/**
 * Biến NEXT_PUBLIC_* — đổi .env.local cần restart dev server.
 *
 * Local thường: NEXT_PUBLIC_API_URL=http://localhost:4000/api
 * Tunnel/gateway: NEXT_PUBLIC_API_URL=/api (+ BLOG_BE_ORIGIN cho SSR)
 */
export function getPublicApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_API_URL in .env.local');
  }
  const normalized = url.replace(/\/$/, '');

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }

  const path = normalized.startsWith('/') ? normalized : `/${normalized}`;

  // Browser: path tương đối (cùng origin qua gateway hoặc Next rewrite)
  if (typeof window !== 'undefined') {
    return path;
  }

  // SSR: fetch() cần URL tuyệt đối
  const origin = (process.env.BLOG_BE_ORIGIN ?? 'http://localhost:4000').replace(
    /\/$/,
    '',
  );
  return `${origin}${path}`;
}

export function getAppName(): string {
  return process.env.NEXT_PUBLIC_APP_NAME ?? 'Blog';
}
