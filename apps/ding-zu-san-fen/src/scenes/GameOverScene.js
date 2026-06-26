import Phaser from 'phaser';
import { COLORS } from '../config.js';
import { LEVELS } from '../data/levels.js';

// GameOverScene: 胜负结算覆盖层（GameScene 与 UIScene 已暂停）
export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    const { width, height } = this.scale;
    const result = this.registry.get('result') || 'win';
    const levelKey = this.registry.get('levelKey');
    const lv = LEVELS[levelKey];

    // 半透明遮罩
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);
    overlay.setDepth(90);

    const win = result === 'win';
    const panel = this.add.container(width / 2, height / 2);
    panel.setDepth(91);

    const pw = 560;
    const ph = 360;
    const g = this.add.graphics();
    g.fillStyle(0x4a3c2a, 1);
    g.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 18);
    g.lineStyle(4, win ? COLORS.gold : COLORS.base, 1);
    g.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 18);
    panel.add(g);

    panel.add(this.add.text(0, -120, win ? '荡平天下' : '兵败城破', {
      fontFamily: 'serif',
      fontSize: '64px',
      color: win ? '#ffe08a' : '#f08a78',
      stroke: '#1a1410',
      strokeThickness: 8,
    }).setOrigin(0.5));

    panel.add(this.add.text(0, -52, win
      ? `「${lv ? lv.name : ''}」之战，大获全胜！`
      : `「${lv ? lv.name : ''}」失守，卷土重来吧。`, {
      fontFamily: '"PingFang SC",sans-serif',
      fontSize: '22px',
      color: '#e8d9b5',
    }).setOrigin(0.5));

    this._button(panel, -130, 60, 220, 64, '再 战 一 局', COLORS.gold, () => {
      this.scene.stop('GameOverScene');
      this.scene.stop('UIScene');
      this.scene.restart('GameScene');
    });

    this._button(panel, 130, 60, 220, 64, '返回主菜单', 0x6b5a40, () => {
      this.scene.stop('GameOverScene');
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
    });

    panel.setScale(0.8);
    panel.setAlpha(0);
    this.tweens.add({
      targets: panel,
      scale: 1,
      alpha: 1,
      duration: 280,
      ease: 'Back.Out',
    });
  }

  _button(parent, x, y, w, h, label, color, onClick) {
    const cont = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 3, w, h, 12);
    g.fillStyle(color, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    g.lineStyle(2, 0x2c2418, 0.8);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    cont.add(g);
    cont.add(this.add.text(0, 0, label, {
      fontFamily: '"PingFang SC",sans-serif',
      fontSize: '24px',
      color: '#2c2418',
      fontStyle: 'bold',
    }).setOrigin(0.5));
    const zone = this.add.zone(x, y, w, h);
    zone.setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => cont.setScale(1.04));
    zone.on('pointerout', () => cont.setScale(1));
    zone.on('pointerdown', () => {
      this.tweens.add({ targets: cont, scale: 0.94, duration: 70, yoyo: true });
      this.time.delayedCall(80, onClick);
    });
    parent.add(cont);
    // zone 不加入容器（独立定位），保持可交互
  }
}
