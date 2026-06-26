import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    // 展品（如《鼎足三分》）按需懒加载 Phaser 引擎，该 chunk 约 1.5MB 属正常体积
    chunkSizeWarningLimit: 1600,
  },
})
