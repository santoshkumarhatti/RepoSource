import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.videolan.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'repository-images.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'penpot.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'n8n.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.metabase.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
