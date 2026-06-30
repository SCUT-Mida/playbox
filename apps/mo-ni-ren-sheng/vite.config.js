import { defineConfig } from 'vite';

// `base: './'` 生成相对路径资源引用，便于部署到 GitHub Pages 子路径或任意静态目录。
// 本作刻意不依赖任何框架，纯原生 DOM 渲染，构建产物极小。
export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 5175,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2018',
  },
});
