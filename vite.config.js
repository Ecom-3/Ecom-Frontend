
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createServiceProxy } from './src/config/serviceRoutes.js';

const BACKEND_URL = 'http://localhost:8082';

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,

    proxy: createServiceProxy(BACKEND_URL),
  },
});
