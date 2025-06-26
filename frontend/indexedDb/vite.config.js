export default {
  root: '.',
  server: {
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
      },
      output: {
        entryFileNames: 'index.js',
        assetFileNames: (asset) => {
          if (asset.name.endsWith('.css')) {
            return 'index.css'
          }
          return asset.name
        }
      }
    }
  }
}