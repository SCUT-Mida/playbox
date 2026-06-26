import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

// BootScene: 初始化全局设置，随后进入预加载
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);
    // 让文本在缩放下更清晰
    if (this.add.text) {
      const probe = this.add.text(0, 0, '', { fontSize: '12px' });
      probe.destroy();
    }
    this.scene.start('PreloadScene');
  }
}
