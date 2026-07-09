// ============================================================================
// 星骸旅者 · 入口
// 导出 createGame(parent) 工厂，供主框架（落地页）按需挂载到任意容器；
// 同时保留独立运行（apps/xing-hai-lv-zhe/index.html）时的自动挂载行为。
// ============================================================================
import { GameUI } from './ui/app.js';

export function createGame(parent) {
  const ui = new GameUI(parent);
  ui.mount();
  return ui;
}

// 独立运行时自动挂载到 #game-container（仅在元素存在时触发，
// 避免被主框架动态 import 时误启动游戏）。
if (typeof document !== 'undefined' && document.getElementById('game-container')) {
  const ui = createGame(document.getElementById('game-container'));
  if (typeof window !== 'undefined') window.__XHLZ = ui; // 暴露实例便于调试 / 冒烟测试
}
