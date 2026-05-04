import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/openrouter': {
          target: 'https://openrouter.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/openrouter/, '/api/v1'),
          headers: env.OPENROUTER_API_KEY
            ? { Authorization: `Bearer ${env.OPENROUTER_API_KEY}` }
            : {},
        },
      },
    },
  }
})
