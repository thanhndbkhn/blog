/** @type {import('next').NextConfig} */
const beOrigin = process.env.BLOG_BE_ORIGIN ?? 'http://localhost:4000';

const nextConfig = {
  async rewrites() {
    return [
      // /api → blog-be khi NEXT_PUBLIC_API_URL=/api (dev localhost:3000)
      {
        source: '/api/:path*',
        destination: `${beOrigin}/api/:path*`,
      },
      {
        source: '/api-be/:path*',
        destination: `${beOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
