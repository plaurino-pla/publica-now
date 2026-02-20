/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    serverActions: {
      bodySizeLimit: '150mb',
    },
  },
  api: {
    bodyParser: {
      sizeLimit: '150mb',
    },
    responseLimit: '150mb',
  },
  serverRuntimeConfig: {
    maxBodySize: '150mb',
  },
  images: {
    domains: ['localhost', 'publica.la', 'images.unsplash.com', 'd3qlnv4h16ekex.cloudfront.net'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd3qlnv4h16ekex.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: '*.publica.la',
      },
    ],
  },

}

module.exports = nextConfig
