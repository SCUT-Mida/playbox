// ============================================================================
// 大富翁 · 环游之城 · 入口
// 导出 createGame(parent) 工厂，供主框架（落地页）按需挂载到任意容器；
// 同时保留独立运行（apps/da-fu-weng/index.html）时的自动挂载行为。
// ============================================================================
import { GameUI } from './ui/app.js';
import { MAPS } from './config.js';
import { newGame } from './core/game.js';
import { makeSeed } from './core/rng.js';

export function createGame(parent) {
  const ui = new GameUI(parent);
  ui.mount();
  return ui;
}

// 独立运行时自动挂载到 #game-container（仅在元素存在时触发，
// 避免被主框架动态 import 时误启动游戏）。
if (typeof document !== 'undefined' && document.getElementById('game-container')) {
  const ui = createGame(document.getElementById('game-container'));
  if (typeof window !== 'undefined') window.__DFW = ui; // 暴露实例便于调试 / 冒烟测试
  // 调试直达（视觉检查 / 截图用）：?view=setup 直达选人页，?view=game[&map=xx] 直接开局。
  try {
    const view = new URLSearchParams(location.search).get('view');
    if (view === 'setup') ui.showSetup();
    else if (view === 'game') {
      const map = new URLSearchParams(location.search).get('map');
      ui.startGame(newGame({ heroKey: 'sword', aiCount: 3, mapKey: map || MAPS[0].key, seed: 20260818 }));
    }
  } catch (_) { /* 无 location 环境忽略 */ }
}
