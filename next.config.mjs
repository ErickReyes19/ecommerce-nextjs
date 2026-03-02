import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';


/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
      domains: ['res.cloudinary.com'],
      remotePatterns: [
        {
          protocol: "https",
          hostname: "d3dr34vkycigpz.cloudfront.net",
        },
        {
          protocol: "https",
          hostname: "es.pandora.net",
        },
        {
          protocol: "https",
          hostname: "cdn.shopify.com",
        },
        {
          protocol: "https",
          hostname: "singularu.com",
        },
        {
          protocol: "https",
          hostname: "fakestoreapi.com",
        },
        {
          protocol: "https",
          hostname: "dn.dummyjson.com",
        },
        {
          protocol: "https",
          hostname: "cdn.dummyjson.com",
        },
        {
          protocol: "https",
          hostname: "i.imgur.com",
        },
      ],
  },
  webpack: (config, { isServer }) => {
      if (isServer) {
          config.plugins.push(new PrismaPlugin());
      }
      return config;
  },
  typescript: {
      ignoreBuildErrors: true,
  },
  eslint: {
      ignoreDuringBuilds: true,
  },
  experimental: {
      preloadEntriesOnStart: false,
  },
  webpack: (
      config,
      {  dev  }
  ) => {
      if (config.cache && !dev) {
          config.cache = Object.freeze({
              type: 'memory',
          })
      }
      // Important: return the modified config
      return config
  },
};

export default nextConfig;
