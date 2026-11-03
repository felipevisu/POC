import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// same-origin /api -> BFF, so the session cookie goes along and no CORS is needed
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        // the proxy holds headers until the first body chunk; flush them so the zip download starts instantly
        configure: (proxy) => proxy.on('proxyRes', (_proxyRes, _req, res) =>
          setImmediate(() => { if (!res.headersSent) res.flushHeaders(); })),
      },
    },
  },
});
