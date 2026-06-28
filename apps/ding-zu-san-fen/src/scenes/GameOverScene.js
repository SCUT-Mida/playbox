import Phaser from 'phaser';
import { COLORS } from '../config.js';
import { LEVELS, LEVEL_LIST } from '../data/levels.js';
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

    // 半透明遮罩（拦截下层点击）
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);
    overlay.setDepth(90);
    overlay.setInteractive();

    const win = result === 'win';
    const cx = width / 2;
    const cy = height / 2;
    const pw = 560;
    const ph = 470;

    // —— 结算面板（纯视觉，仅做入场动画；交互按钮独立置于其上）——
    const panel = this.add.container(cx, cy);
    panel.setDepth(91);
    this._panel = panel;

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

    panel.setScale(0.8);
    panel.setAlpha(0);
    this.tweens.add({
      targets: panel,
      scale: 1,
      alpha: 1,
      duration: 280,
      ease: 'Back.Out',
    });

    // —— 操作按钮（场景级独立交互区，绝对坐标 + 深度高于遮罩）——
    // 历史教训：把命中区作为面板(container)子节点、再对面板做 scale 入场补间时，
    // 缩放期间命中区与可见按钮会错位，导致「点不到」。这里改用与 RosterScene /
    // GachaScene 一致的可控写法：命中区是场景级独立对象、不随面板缩放，任意时刻点击都能命中。
    this._btnZones = [];

    if (win) {
      // 是否存在下一关
      const idx = LEVEL_LIST.indexOf(levelKey);
      const hasNext = idx >= 0 && idx < LEVEL_LIST.length - 1;
      if (hasNext) {
        const nextLv = LEVELS[LEVEL_LIST[idx + 1]];
        // 下一关名提示（面板局部坐标：位于奖励框与主按钮之间）
        panel.add(this.add.text(0, 44, `下一战：${nextLv.name}`, {
          fontFamily: '"PingFang SC",sans-serif', fontSize: '14px', color: '#cdb888',
        }).setOrigin(0.5));
        // 主按钮：进入下一关
        this._mkButton(cx, cy + 92, 360, 64, '进 入 下 一 关', COLORS.gold, () => {
          audio.play('click');
          this._gotoLevel(LEVEL_LIST[idx + 1]);
        });
        // 次按钮：再战 / 返回
        this._mkButton(cx - 120, cy + 172, 224, 58, '再 战 一 局', 0x6b5a40, () => {
          audio.play('click');
          this._gotoLevel(levelKey);
        });
        this._mkButton(cx + 120, cy + 172, 224, 58, '返回主菜单', 0x6b5a40, () => {
          audio.play('click');
          this._gotoMenu();
        });
      } else {
        // 已是最后一关：再战 + 返回
        this._mkButton(cx - 130, cy + 150, 220, 64, '再 战 一 局', COLORS.gold, () => {
          audio.play('click');
          this._gotoLevel(levelKey);
        });
        this._mkButton(cx + 130, cy + 150, 220, 64, '返回主菜单', 0x6b5a40, () => {
          audio.play('click');
          this._gotoMenu();
        });
      }
    } else {
      // 失败：再战 + 返回
      this._mkButton(cx - 130, cy + 150, 220, 64, '再 战 一 局', COLORS.gold, () => {
        audio.play('click');
        this._gotoLevel(levelKey);
      });
      this._mkButton(cx + 130, cy + 150, 220, 64, '返回主菜单', 0x6b5a40, () => {
        audio.play('click');
        this._gotoMenu();
      });
    }
  }

  // 切换到指定关卡（全新对局）：彻底关闭三层场景后以 start 重建 GameScene
  _gotoLevel(key) {
    this.registry.set('levelKey', key);
    this._teardown();
    this.scene.start('GameScene', { levelKey: key });
  }

  _gotoMenu() {
    this._teardown();
    this.scene.start('MenuScene');
  }

  _teardown() {
    if (this._btnZones) {
      this._btnZones.forEach((z) => z.destroy());
      this._btnZones = [];
    }
    this.scene.stop('GameOverScene');
    this.scene.stop('UIScene');
    this.scene.stop('GameScene');
  }

  // 绝对坐标按钮：视觉容器（无交互）+ 场景级命中区（深度 92，高于遮罩 90）
  _mkButton(absX, absY, w, h, label, color, onClick) {
    const cont = this.add.container(absX, absY).setDepth(92);
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
    cont.setAlpha(0);
    this.tweens.add({ targets: cont, alpha: 1, duration: 200, delay: 160 });

    const zone = this.add.zone(absX, absY, w, h)
      .setInteractive({ useHandCursor: true })
      .setDepth(93);
    zone.on('pointerover', () => cont.setScale(1.04));
    zone.on('pointerout', () => cont.setScale(1));
    zone.on('pointerdown', (p) => {
      p.event.stopPropagation();
      this.tweens.add({ targets: cont, scale: 0.94, duration: 70, yoyo: true });
      this.time.delayedCall(80, onClick);
    });
    this._btnZones.push(zone);
    return cont;
  }
}
