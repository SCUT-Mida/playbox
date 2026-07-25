import { defineConfig } from 'vite';

// `base: './'` 生成相对路径资源引用，便于部署到 GitHub Pages 子路径或任意静态目录。
// 本作纯原生 DOM 渲染、无框架、无 Canvas，构建产物极小。
export default defineConfig({
  base: './',
  server: { host: true, port: 5179 },
  build: { outDir: 'dist', sourcemap: false, target: 'es2018' },
});
