import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { LEVELS, LEVEL_LIST } from '../data/levels.js';
import { GENERAL_BY_ID } from '../data/generals.js';
import { getMeta, isMuted, setMuted, LEVEL_REWARD } from '../data/meta.js';
import { loadBattle } from '../data/save.js';
import { drawChibi, optsForGeneral } from '../utils/Chibi.js';
import audio from '../audio/Audio.js';

// MenuScene: 标题、金币 / 静音、武将图鉴 / 点将台入口、关卡选择、玩法说明
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;
    const cam = this.cameras.main;
    cam.setBackgroundColor(COLORS.bg);

    // 同步音效静音状态
    audio.setMuted(isMuted());

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

    // 顶部：金币 + 静音
    this._buildStatusBar(width);

    // 标题
    this.add.text(width / 2, 130, '鼎足三分', {
      fontFamily: 'serif',
      fontSize: '76px',
      color: '#ead9b6',
      stroke: '#1a1410',
      strokeThickness: 10,
    }).setOrigin(0.5).setAlpha(0.96);

    this.add.text(width / 2, 192, '三 国 · 战 略 塔 防', {
      fontFamily: '"PingFang SC",sans-serif',
      fontSize: '22px',
      color: '#c9a35a',
    }).setOrigin(0.5);

    // Q版武将预览（开罗风格小人）
    this._chibiPreview(width / 2, 280);

    // 武将图鉴 / 点将台入口
    this._navRow(width, 388);

    // 存档续战：若有未结束的战斗存档，在最上方提供"继续上次出征"入口
    const snap = loadBattle();
    let startY = 484;
    if (snap) {
      const lv = LEVELS[snap.levelKey];
      if (lv) {
        this._continueCard(width / 2, 470, lv, snap);
        startY = 560;
      }
    }

    // 关卡按钮：两列网格排布（8 关紧凑铺满，告别冗长列表）
    const colL = width / 2 - 138;
    const colR = width / 2 + 138;
    LEVEL_LIST.forEach((key, i) => {
      const lv = LEVELS[key];
      const cx = i % 2 === 0 ? colL : colR;
      const y = startY + Math.floor(i / 2) * 108;
      this._levelCard(cx, y, lv);
    });

    // 玩法说明
    const tipY = height - 168;
    const tips = [
      '🪙 拖拽底部武将卡部署：近战放路面、远程/策士放高地',
      '⚔️ 相邻武将触发【羁绊阵法】；击杀积累气势，释放【火烧连营】大招',
      '🏆 开局金币可十连抽将；抽到重复卡合并升星，战力永久成长',
    ];
    tips.forEach((t, i) => {
      this.add.text(width / 2, tipY + i * 28, t, {
        fontFamily: '"PingFang SC",sans-serif',
        fontSize: '15px',
        color: '#b9a47e',
      }).setOrigin(0.5);
    });

    // 浏览器策略：首次点击解锁 AudioContext
    this.input.once('pointerdown', () => audio.unlock());
  }

  _buildStatusBar(width) {
    // 金币丸
    this._goldCont = this.add.container(width - 150, 48).setDepth(6);
    const gg = this.add.graphics();
    gg.fillStyle(0x000000, 0.3);
    gg.fillRoundedRect(-72, -20, 144, 40, 20);
    gg.fillStyle(0x3a2e20, 0.96);
    gg.fillRoundedRect(-74, -22, 144, 40, 20);
    gg.lineStyle(2, COLORS.gold, 0.7);
    gg.strokeRoundedRect(-74, -22, 144, 40, 20);
    this._goldCont.add(gg);
    const coin = this.add.graphics();
    coin.fillStyle(COLORS.gold, 1);
    coin.fillCircle(-50, 0, 12);
    coin.lineStyle(2, COLORS.ink, 0.8);
    coin.strokeCircle(-50, 0, 12);
    this._goldCont.add(coin);
    this._goldCont.add(this.add.text(-50, 0, '金', {
      fontFamily: 'serif', fontSize: '13px', color: '#2c2418', fontStyle: 'bold',
    }).setOrigin(0.5));
    this._goldText = this.add.text(8, 0, '0', {
      fontFamily: 'serif', fontSize: '22px', color: '#ffe08a', fontStyle: 'bold',
    }).setOrigin(0.5);
    this._goldCont.add(this._goldText);

    // 静音按钮（置于左上角：右上角被落地页的"关闭✕"悬浮按钮占用，
    // 若放右上角会被其遮挡而无法点击）
    this._muteCont = this.add.container(44, 48).setDepth(6);
    this._muteBg = this.add.graphics();
    this._muteBg.fillStyle(0x3a2e20, 0.96);
    this._muteBg.fillRoundedRect(-20, -20, 40, 40, 10);
    this._muteBg.lineStyle(2, COLORS.gold, 0.6);
    this._muteBg.strokeRoundedRect(-20, -20, 40, 40, 10);
    this._muteCont.add(this._muteBg);
    this._muteIcon = this.add.text(0, 0, isMuted() ? '🔇' : '🔊', {
      fontSize: '22px',
    }).setOrigin(0.5);
    this._muteCont.add(this._muteIcon);
    const muteZone = this.add.zone(44, 48, 48, 48).setInteractive({ useHandCursor: true });
    muteZone.on('pointerover', () => this._muteCont.setScale(1.06));
    muteZone.on('pointerout', () => this._muteCont.setScale(1));
    muteZone.on('pointerdown', () => {
      audio.unlock();
      const m = setMuted(!isMuted());
      audio.setMuted(m);
      audio.play('click');
      this._muteIcon.setText(m ? '🔇' : '🔊');
      this.tweens.add({ targets: this._muteCont, scale: 0.9, duration: 70, yoyo: true });
    });

    this._refreshGold();
  }

  _refreshGold() {
    if (this._goldText) this._goldText.setText(String(getMeta().gold));
  }

  // 一排 Q版武将小人预览
  _chibiPreview(cx, cy) {
    const ids = ['guanyu', 'lvbu', 'zhuge', 'zhouyu', 'caocao'];
    const n = ids.length;
    const gap = 96;
    const startX = cx - ((n - 1) * gap) / 2;
    const ground = this.add.graphics();
    ground.lineStyle(2, COLORS.gold, 0.22);
    ground.lineBetween(cx - (n * gap) / 2, cy + 28, cx + (n * gap) / 2, cy + 28);
    ids.forEach((id, i) => {
      const def = GENERAL_BY_ID[id];
      if (!def) return;
      const x = startX + i * gap;
      const g = this.add.graphics();
      drawChibi(g, { ...optsForGeneral(def), size: 52 });
      g.setPosition(x, cy);
      this.add.text(x, cy + 48, def.name, {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#cdb888',
      }).setOrigin(0.5);
    });
  }

  _navRow(width, cy) {
    this._navButton(width / 2 - 140, cy, 260, 84, '武 将 图 鉴', '查看属性 · 羁绊搭档', 0x4a3a8a, () => {
      audio.play('click');
      this.scene.start('RosterScene');
    });
    this._navButton(width / 2 + 140, cy, 260, 84, '点 将 台', '金币抽将 · 扩充阵容', 0x8a4a3a, () => {
      audio.play('click');
      this.scene.start('GachaScene');
    });
  }

  _navButton(cx, cy, w, h, title, sub, color, onClick) {
    const cont = this.add.container(cx, cy);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 3, w, h, 14);
    g.fillStyle(color, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    g.lineStyle(3, COLORS.gold, 0.8);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    cont.add(g);
    cont.add(this.add.text(0, -12, title, {
      fontFamily: 'serif', fontSize: '26px', color: '#ffe9b8', fontStyle: 'bold',
    }).setOrigin(0.5));
    cont.add(this.add.text(0, 22, sub, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#e6d4ac',
    }).setOrigin(0.5));
    const zone = this.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => cont.setAlpha(0.92));
    zone.on('pointerout', () => cont.setAlpha(1));
    zone.on('pointerdown', () => {
      this.tweens.add({ targets: cont, scale: 0.96, duration: 80, yoyo: true });
      this.time.delayedCall(90, onClick);
    });
  }

  // 存档续战入口：醒目的绿色卡片，点击以 resume:true 进入对应关卡恢复存档
  _continueCard(cx, cy, lv, snap) {
    const w = 520;
    const h = 64;
    const cont = this.add.container(cx, cy);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 4, w, h, 14);
    g.fillStyle(0x2f5d3a, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    g.lineStyle(3, 0x6fd08a, 0.9);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    cont.add(g);
    cont.add(this.add.text(-w / 2 + 28, -8, '↻ 继续上次出征', {
      fontFamily: 'serif', fontSize: '26px', color: '#eafff0',
    }).setOrigin(0, 0.5));
    const waveNum = Math.max(1, (snap.waveIndex | 0) + 1);
    cont.add(this.add.text(-w / 2 + 30, 16,
      `${lv.name} · 已推进至第 ${waveNum} / ${lv.waves.length} 波`, {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '14px', color: '#bfe6c8',
      }).setOrigin(0, 0.5));
    cont.add(this.add.text(w / 2 - 24, 0, '▶ 续战', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '20px', color: '#9affb8',
    }).setOrigin(1, 0.5));
    const zone = this.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => cont.setAlpha(0.92));
    zone.on('pointerout', () => cont.setAlpha(1));
    zone.on('pointerdown', () => {
      audio.unlock();
      audio.play('click');
      this.tweens.add({ targets: cont, scale: 0.96, duration: 80, yoyo: true });
      this.time.delayedCall(90, () => {
        this.registry.set('levelKey', lv.key);
        this.scene.start('GameScene', { levelKey: lv.key, resume: true });
      });
    });
  }

  _levelCard(cx, cy, lv) {
    const w = 252;
    const h = 92;
    const cont = this.add.container(cx, cy);

    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 4, w, h, 14);
    g.fillStyle(0x4a3c2a, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    g.lineStyle(3, COLORS.gold, 0.8);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    cont.add(g);

    cont.add(this.add.text(-w / 2 + 18, -h / 2 + 26, lv.name, {
      fontFamily: 'serif',
      fontSize: '28px',
      color: '#f0d9a8',
    }).setOrigin(0, 0.5));

    // 难度星级（右上角）
    const diff = Math.max(1, Math.min(5, lv.difficulty || 1));
    cont.add(this.add.text(w / 2 - 16, -h / 2 + 22, '★'.repeat(diff), {
      fontFamily: 'serif',
      fontSize: '15px',
      color: '#ffce5a',
    }).setOrigin(1, 0.5));

    cont.add(this.add.text(-w / 2 + 18, 2, lv.subtitle, {
      fontFamily: '"PingFang SC",sans-serif',
      fontSize: '13px',
      color: '#cdb888',
    }).setOrigin(0, 0.5).setWordWrapWidth(w - 36));

    // 波数 + 通关奖励
    const reward = LEVEL_REWARD[lv.key] || 0;
    cont.add(this.add.text(-w / 2 + 18, h / 2 - 16, `共 ${lv.waves.length} 波 · 通关 +${reward} 金`, {
      fontFamily: '"PingFang SC",sans-serif',
      fontSize: '12px',
      color: '#b9a47e',
    }).setOrigin(0, 0.5));

    // 通关标记
    const cleared = getMeta().cleared.includes(lv.key);
    cont.add(this.add.text(w / 2 - 16, h / 2 - 18, cleared ? '✓ 已通关' : '▶ 出征', {
      fontFamily: '"PingFang SC",sans-serif',
      fontSize: '15px',
      color: cleared ? '#8fd06a' : '#ffe08a',
    }).setOrigin(1, 0.5));

    const zone = this.add.zone(cx, cy, w, h);
    zone.setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => cont.setAlpha(0.92));
    zone.on('pointerout', () => cont.setAlpha(1));
    zone.on('pointerdown', () => {
      audio.unlock();
      audio.play('click');
      this.tweens.add({ targets: cont, scale: 0.96, duration: 80, yoyo: true });
      this.time.delayedCall(90, () => {
        this.registry.set('levelKey', lv.key);
        this.scene.start('GameScene', { levelKey: lv.key });
      });
    });
  }
}
