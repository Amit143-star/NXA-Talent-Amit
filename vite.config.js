import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import os from 'os';

const networkInterfaces = os.networkInterfaces();
let localIp = '127.0.0.1';
for (const interfaceName in networkInterfaces) {
  for (const iface of networkInterfaces[interfaceName]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      localIp = iface.address;
      break;
    }
  }
}

export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    __BACKEND_IP__: JSON.stringify(localIp)
  },
  build: {
    outDir: 'www',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    host: true,
  },
});
