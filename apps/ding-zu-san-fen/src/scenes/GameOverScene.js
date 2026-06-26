import Phaser from 'phaser';
import { COLORS } from '../config.js';
import { LEVELS } from '../data/levels.js';
import { grantLevelClear } from '../data/meta.js';
import audio from '../audio/Audio.js';

// GameOverScene: 胜负结算覆盖层（GameScene 与 UIScene 已暂停）
// 胜利时结算并发放通关金币奖励（基础奖励 + 首通奖励）
export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    const { width, height } = this.scale;
    const result = this.registry.get('result') || 'win';
    const levelKey = this.registry.get('levelKey');
    const lv = LEVELS[levelKey];

    // 胜利结算：发放金币（本场景每次胜利仅创建一次，故发放一次）
    let reward = null;
    if (result === 'win' && levelKey) {
      reward = grantLevelClear(levelKey);
      // 结算金币音效（紧随 GameScene 的胜利旋律之后）
      this.time.delayedCall(520, () => audio.play('coin'));
    }

    // 半透明遮罩
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);
    overlay.setDepth(90);

    const win = result === 'win';
    const panel = this.add.container(width / 2, height / 2);
    panel.setDepth(91);

    const pw = 560;
    const ph = 420;
    const g = this.add.graphics();
    g.fillStyle(0x4a3c2a, 1);
    g.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 18);
    g.lineStyle(4, win ? COLORS.gold : COLORS.base, 1);
    g.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 18);
    panel.add(g);

    panel.add(this.add.text(0, -ph / 2 + 60, win ? '荡平天下' : '兵败城破', {
      fontFamily: 'serif',
      fontSize: '60px',
      color: win ? '#ffe08a' : '#f08a78',
      stroke: '#1a1410',
      strokeThickness: 8,
    }).setOrigin(0.5));

    panel.add(this.add.text(0, -ph / 2 + 116, win
      ? `「${lv ? lv.name : ''}」之战，大获全胜！`
      : `「${lv ? lv.name : ''}」失守，卷土重来吧。`, {
      fontFamily: '"PingFang SC",sans-serif',
      fontSize: '21px',
      color: '#e8d9b5',
    }).setOrigin(0.5));

    // 奖励明细（仅胜利）
    if (reward) {
      const ry = -ph / 2 + 178;
      const rewardBg = this.add.graphics();
      rewardBg.fillStyle(0x2a2018, 0.7);
      rewardBg.fillRoundedRect(-pw / 2 + 40, ry - 26, pw - 80, 84, 10);
      rewardBg.lineStyle(2, COLORS.gold, 0.5);
      rewardBg.strokeRoundedRect(-pw / 2 + 40, ry - 26, pw - 80, 84, 10);
      panel.add(rewardBg);

      panel.add(this.add.text(0, ry - 6, `🪙 +${reward.total} 金`, {
        fontFamily: 'serif', fontSize: '30px', color: '#ffe08a', fontStyle: 'bold',
      }).setOrigin(0.5));

      const detail = reward.first
        ? `含首通奖励 +${reward.bonus}（基础 ${reward.base}）`
        : `基础奖励 ${reward.base}`;
      panel.add(this.add.text(0, ry + 24, detail + '　·　前往点将台招募良将', {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '14px', color: '#cdb888',
      }).setOrigin(0.5));
    }

    this._button(panel, -130, 90, 220, 64, '再 战 一 局', COLORS.gold, () => {
      audio.play('click');
      this.scene.stop('GameOverScene');
      this.scene.stop('UIScene');
      this.scene.restart('GameScene');
    });

    this._button(panel, 130, 90, 220, 64, '返回主菜单', 0x6b5a40, () => {
      audio.play('click');
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
