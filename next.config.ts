import type { NextConfig } from 'next';

const isCapacitorExport = process.env.CAPACITOR_EXPORT === '1';

const nextConfig: NextConfig = {
  ...(isCapacitorExport ? { output: 'export' as const } : {}),
  allowedDevOrigins: ['192.168.26.6'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
