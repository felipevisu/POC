import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  // React Compiler auto-memoizes components/hooks: no manual memo/useCallback needed.
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  server: { proxy: { '/api': 'http://localhost:3001' } },
})
