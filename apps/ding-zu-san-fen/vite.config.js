import { defineConfig } from 'vite';

// `base: './'` 生成相对路径资源引用，便于部署到 GitHub Pages 子路径或任意静态目录。
export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2018',
    // Phaser 引擎本身约 1.5MB，属正常体积
    chunkSizeWarningLimit: 1600,
  },
});
