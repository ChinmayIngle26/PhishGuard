
import type {NextConfig} from 'next';

// IMPORTANT: This file is the entry point for the Next.js server.
// We load environment variables and initialize server-side services here
// to ensure they are available to all server-side code.
require('dotenv').config({ path: './.env' });
import { initializeFirebaseAdmin } from './src/lib/firebase-admin';
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
