import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

// PreloadScene: 当前全部素材由 Graphics 程序化绘制，无外部资源加载
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.bg);

    const title = this.add.text(width / 2, height / 2 - 24, '鼎足三分', {
      fontFamily: '"PingFang SC","Microsoft YaHei",serif',
      fontSize: '52px',
      color: '#ead9b6',
      stroke: '#2c2418',
      strokeThickness: 6,
    }).setOrigin(0.5);

    const sub = this.add.text(width / 2, height / 2 + 28, 'Three Kingdoms · Tactical Defense', {
      fontFamily: 'serif',
      fontSize: '20px',
      color: '#c9b78f',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: [title, sub],
      alpha: { from: 0, to: 1 },
      duration: 200,
      ease: 'Quad.Out',
    });

    // 无外部资源需加载（全部 Graphics 程序化绘制），仅留极短标题展示即进入存档选择，
    // 不再人为堆叠 500ms 延迟拖慢"进入游戏"的首屏响应。
    this.time.delayedCall(150, () => this.scene.start('SlotScene'));
  }
}
