/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    return {
      // afterFiles: checked after Next.js route handlers — ensures app/api/analyze/stream/route.ts
      // is served by Next.js itself and not proxied to the FastAPI backend.
      afterFiles: [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
      ],
    }
  },
};

module.exports = nextConfig;
