import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexthus.app',
  appName: 'YaLlego',
  webDir: 'out',
  server: {
    url: 'http://192.168.26.6:3000',
    cleartext: true,
  },
};

export default config;
