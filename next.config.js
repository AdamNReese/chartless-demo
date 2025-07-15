/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  distDir: 'out',
  generateBuildId: async () => {
    return 'build-id'
  }
}

module.exports = nextConfig