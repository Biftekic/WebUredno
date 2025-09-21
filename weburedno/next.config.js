/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
    formats: ['image/webp'],
  },
  i18n: {
    locales: ['hr'],
    defaultLocale: 'hr',
  },
};

module.exports = nextConfig;