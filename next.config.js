/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/hospital-charting-demo' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/hospital-charting-demo' : '',
}

module.exports = nextConfig