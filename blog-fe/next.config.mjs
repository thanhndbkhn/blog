/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev: có thể proxy /api-be → blog-be để tránh CORS (tuỳ chọn)
  async rewrites() {
    return [
      {
        source: '/api-be/:path*',
        destination: `${process.env.BLOG_BE_ORIGIN ?? 'http://localhost:4000'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
