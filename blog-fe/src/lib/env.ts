/**
 * Biến NEXT_PUBLIC_* chỉ đọc được ở client sau khi build — đổi .env.local cần restart dev server.
 */
export function getPublicApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_API_URL in .env.local');
  }
  return url.replace(/\/$/, '');
}

export function getAppName(): string {
  return process.env.NEXT_PUBLIC_APP_NAME ?? 'Blog';
}
