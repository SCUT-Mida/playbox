import { defineConfig } from 'vite';

// `base: './'` 生成相对路径资源引用，便于部署到 GitHub Pages 子路径或任意静态目录。
// 本作纯原生 DOM 渲染（角色形象来自共享库 _lib/kairo.js 程序化像素绘制），零运行时依赖。
export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 5177,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2018',
  },
});
