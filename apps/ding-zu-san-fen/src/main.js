import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import GameOverScene from './scenes/GameOverScene.js';

// 全局配置：移动端优先，Scale.FIT 自适应缩放并居中
// 导出为工厂函数，便于主框架（落地页）按需挂载到任意容器，
// 同时保留独立运行（apps/ding-zu-san-fen/index.html）时的自动挂载行为。
export function createGame(parent) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#1f1812',
    antialias: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    render: {
      pixelArt: false,
    },
    scene: [BootScene, PreloadScene, MenuScene, GameScene, UIScene, GameOverScene],
  });
}

// 独立运行时自动挂载到 #game-container（仅在元素存在时触发，
// 避免被主框架动态 import 时误启动游戏）。
if (document.getElementById('game-container')) {
  const game = createGame('game-container');
  // 暴露实例便于调试 / 自动化冒烟测试
  window.__GAME = game;
}
