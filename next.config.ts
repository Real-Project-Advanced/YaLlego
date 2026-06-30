import type { NextConfig } from 'next';

const isCapacitorExport = process.env.CAPACITOR_EXPORT === '1';

const nextConfig: NextConfig = {
  ...(isCapacitorExport ? { output: 'export' as const } : {}),
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['192.168.26.8'],
};

export default nextConfig;
