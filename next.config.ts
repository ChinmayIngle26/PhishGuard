
import type {NextConfig} from 'next';
import { initializeFirebaseAdmin } from './src/lib/firebase-admin';

require('dotenv').config({ path: './.env' });
initializeFirebaseAdmin();

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
    ],
  },
};

export default nextConfig;
