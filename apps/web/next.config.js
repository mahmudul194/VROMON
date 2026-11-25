/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@vromon/shared'],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

module.exports = nextConfig;
