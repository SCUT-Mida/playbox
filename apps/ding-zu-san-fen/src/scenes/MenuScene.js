import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { LEVELS, LEVEL_LIST } from '../data/levels.js';
import { GENERALS } from '../data/generals.js';

// MenuScene: 标题、关卡选择、玩法说明
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;
    const cam = this.cameras.main;
    cam.setBackgroundColor(COLORS.bg);

    // 背景竹简纹理
    const bg = this.add.graphics();
    bg.fillStyle(0x2a2018, 1);
    bg.fillRect(0, 0, width, height);
    for (let y = 0; y < height; y += 26) {
      bg.lineStyle(1, 0x3a2e22, 0.5);
      bg.lineBetween(0, y, width, y);
    }
    bg.fillStyle(COLORS.parchment, 0.06);
    bg.fillRect(0, 0, width, height);

    // 标题
    this.add.text(width / 2, 110, '鼎足三分', {
      fontFamily: 'serif',
      fontSize: '86px',
      color: '#ead9b6',
      stroke: '#1a1410',
      strokeThickness: 10,
    }).setOrigin(0.5).setAlpha(0.96);

    this.add.text(width / 2, 178, '三 国 · 战 略 塔 防', {
      fontFamily: '"PingFang SC",sans-serif',
      fontSize: '24px',
      color: '#c9a35a',
    }).setOrigin(0.5);

    // 关卡按钮
    const startY = 280;
    LEVEL_LIST.forEach((key, i) => {
      const lv = LEVELS[key];
      const y = startY + i * 120;
      this._levelCard(width / 2, y, lv);
    });

    // 玩法说明
    const tipY = height - 132;
    const tips = [
      '🪙 拖拽底部武将卡部署：近战放路面、远程/策士放高地',
      '⚔️ 相邻武将触发【羁绊阵法】；击杀积累气势，释放【火烧连营】大招',
      '🛡️ 重甲惧法、魔抗惧物 —— 合理搭配职业与羁绊方能鼎足三分',
    ];
    tips.forEach((t, i) => {
      this.add.text(width / 2, tipY + i * 26, t, {
        fontFamily: '"PingFang SC",sans-serif',
        fontSize: '16px',
        color: '#b9a47e',
      }).setOrigin(0.5);
    });
  }

  _levelCard(cx, cy, lv) {
    const w = 520;
    const h = 96;
    const cont = this.add.container(cx, cy);

    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 4, w, h, 14);
    g.fillStyle(0x4a3c2a, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    g.lineStyle(3, COLORS.gold, 0.8);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    cont.add(g);

    cont.add(this.add.text(-w / 2 + 28, -18, lv.name, {
      fontFamily: 'serif',
      fontSize: '34px',
      color: '#f0d9a8',
    }).setOrigin(0, 0.5));

    cont.add(this.add.text(-w / 2 + 30, 20, `${lv.subtitle} · 共 ${lv.waves.length} 波`, {
      fontFamily: '"PingFang SC",sans-serif',
      fontSize: '16px',
      color: '#cdb888',
    }).setOrigin(0, 0.5));

    cont.add(this.add.text(w / 2 - 30, 0, '▶ 出征', {
      fontFamily: '"PingFang SC",sans-serif',
      fontSize: '22px',
      color: '#ffe08a',
    }).setOrigin(1, 0.5));

    const zone = this.add.zone(cx, cy, w, h);
    zone.setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => cont.setAlpha(0.92));
    zone.on('pointerout', () => cont.setAlpha(1));
    zone.on('pointerdown', () => {
      this.tweens.add({ targets: cont, scale: 0.96, duration: 80, yoyo: true });
      this.time.delayedCall(90, () => {
        this.registry.set('levelKey', lv.key);
        this.scene.start('GameScene', { levelKey: lv.key });
      });
    });
  }
}
