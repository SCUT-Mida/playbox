import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './config.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import GameOverScene from './scenes/GameOverScene.js';

// 全局配置：移动端优先，Scale.FIT 自适应缩放并居中
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-container',
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

// 暴露实例便于调试 / 自动化冒烟测试
if (typeof window !== 'undefined') {
  window.__GAME = game;
}
