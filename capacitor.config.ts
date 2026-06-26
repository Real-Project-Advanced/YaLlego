import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexthus.app',
  appName: 'YaLlego',
  webDir: 'out',
  server: {
    url: 'http://10.0.80.6:3000',
    cleartext: true,
  },
};

export default config;
