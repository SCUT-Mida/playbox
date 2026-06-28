import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { LEVELS, LEVEL_LIST } from '../data/levels.js';
import { getMeta, getActiveSlot, isMuted, setMuted, LEVEL_REWARD, NUM_SLOTS } from '../data/meta.js';
import { loadBattle } from '../data/save.js';
import audio from '../audio/Audio.js';

// MenuScene: 标题、金币 / 静音、功能入口（图鉴/点将/演武/存档）、关卡选择（可滚动）、玩法说明
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;
    const cam = this.cameras.main;
    cam.setBackgroundColor(COLORS.bg);

    // 同步音效静音状态（按当前活跃存档）
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

    // 顶部：金币 + 当前槽 + 静音
    this._buildStatusBar(width);

    // 标题
    this.add.text(width / 2, 120, '鼎足三分', {
      fontFamily: 'serif',
      fontSize: '64px',
      color: '#ead9b6',
      stroke: '#1a1410',
      strokeThickness: 10,
    }).setOrigin(0.5).setAlpha(0.96);

    this.add.text(width / 2, 176, '三 国 · 战 略 塔 防', {
      fontFamily: '"PingFang SC",sans-serif',
      fontSize: '20px',
      color: '#c9a35a',
    }).setOrigin(0.5);

    // 功能入口（图鉴 / 点将台 / 演武场 / 切换存档）
    this._navRow(width, 232);

    // 存档续战：若有未结束的战斗存档，提供"继续上次出征"入口
    const snap = loadBattle();
    let listTop = 372;
    if (snap) {
      const lv = LEVELS[snap.levelKey];
      if (lv) {
        this._continueCard(width / 2, 312, lv, snap);
      }
    }

    // 关卡列表（可滚动，承载 20 关）
    this._buildLevelList(width, height, listTop);

    // 浏览器策略：首次点击解锁 AudioContext
    this.input.once('pointerdown', () => audio.unlock());
    // 滚轮滚动关卡列表（桌面）
    this.input.on('wheel', (pointer, go, dx, dy) => {
      if (!this._levels) return;
      this._levels.scrollY = this._clamp(this._levels.scrollY + dy, 0, this._levels.maxScroll);
      this._levels.cont.y = -this._levels.scrollY;
    });
  }

  _clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

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

    // 当前存档槽丸（点击切换存档）
    this._slotCont = this.add.container(width - 270, 48).setDepth(6);
    const sg = this.add.graphics();
    sg.fillStyle(0x3a2e20, 0.96);
    sg.fillRoundedRect(-44, -20, 88, 40, 20);
    sg.lineStyle(2, COLORS.gold, 0.5);
    sg.strokeRoundedRect(-44, -20, 88, 40, 20);
    this._slotCont.add(sg);
    this._slotText = this.add.text(0, 0, `档 ${getActiveSlot()}`, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '16px', color: '#ffe08a', fontStyle: 'bold',
    }).setOrigin(0.5);
    this._slotCont.add(this._slotText);
    const slotZone = this.add.zone(width - 270, 48, 92, 44).setInteractive({ useHandCursor: true });
    slotZone.on('pointerdown', () => {
      audio.play('click');
      this.tweens.add({ targets: this._slotCont, scale: 0.94, duration: 70, yoyo: true });
      this.time.delayedCall(80, () => this.scene.start('SlotScene'));
    });

    // 静音按钮（左上角）
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
    if (this._slotText) this._slotText.setText(`档 ${getActiveSlot()}`);
  }

  _navRow(width, cy) {
    const xs = [width / 2 - 234, width / 2 - 78, width / 2 + 78, width / 2 + 234];
    const defs = [
      { title: '武将图鉴', sub: '属性·羁绊', color: 0x4a3a8a, onClick: () => { audio.play('click'); this.scene.start('RosterScene'); } },
      { title: '点将台', sub: '抽将扩阵', color: 0x8a4a3a, onClick: () => { audio.play('click'); this.scene.start('GachaScene'); } },
      { title: '演武场', sub: '演练得金', color: 0x2f6a4a, onClick: () => { audio.play('click'); this.scene.start('ArenaScene'); } },
      { title: '切换存档', sub: `档 ${getActiveSlot()} / ${NUM_SLOTS}`, color: 0x6b5a40, onClick: () => { audio.play('click'); this.scene.start('SlotScene'); } },
    ];
    defs.forEach((d, i) => this._navButton(xs[i], cy, 148, 78, d.title, d.sub, d.color, d.onClick));
  }

  _navButton(cx, cy, w, h, title, sub, color, onClick) {
    const cont = this.add.container(cx, cy).setDepth(6);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 3, w, h, 14);
    g.fillStyle(color, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    g.lineStyle(3, COLORS.gold, 0.8);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    cont.add(g);
    cont.add(this.add.text(0, -12, title, {
      fontFamily: 'serif', fontSize: '22px', color: '#ffe9b8', fontStyle: 'bold',
    }).setOrigin(0.5));
    cont.add(this.add.text(0, 16, sub, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '12px', color: '#e6d4ac',
    }).setOrigin(0.5));
    const zone = this.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => cont.setAlpha(0.92));
    zone.on('pointerout', () => cont.setAlpha(1));
    zone.on('pointerdown', () => {
      this.tweens.add({ targets: cont, scale: 0.95, duration: 80, yoyo: true });
      this.time.delayedCall(90, onClick);
    });
  }

  // 存档续战入口：醒目的绿色卡片，点击以 resume:true 进入对应关卡恢复存档
  _continueCard(cx, cy, lv, snap) {
    const w = 600;
    const h = 56;
    const cont = this.add.container(cx, cy).setDepth(6);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 4, w, h, 14);
    g.fillStyle(0x2f5d3a, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    g.lineStyle(3, 0x6fd08a, 0.9);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    cont.add(g);
    cont.add(this.add.text(-w / 2 + 24, -8, '↻ 继续上次出征', {
      fontFamily: 'serif', fontSize: '24px', color: '#eafff0',
    }).setOrigin(0, 0.5));
    const waveNum = Math.max(1, (snap.waveIndex | 0) + 1);
    cont.add(this.add.text(-w / 2 + 26, 14,
      `${lv.name} · 第 ${waveNum} / ${lv.waves.length} 波`, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#bfe6c8',
    }).setOrigin(0, 0.5));
    cont.add(this.add.text(w / 2 - 22, 0, '▶ 续战', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '18px', color: '#9affb8',
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

  // —— 可滚动关卡列表（承载 20 关）——
  _buildLevelList(width, height, listTop) {
    const listBottom = height - 116;
    const listH = listBottom - listTop;
    const cardW = 244;
    const cardH = 84;
    const gapY = 10;
    const colL = width / 2 - 130;
    const colR = width / 2 + 130;
    const rows = Math.ceil(LEVEL_LIST.length / 2);
    const contentH = rows * cardH + (rows - 1) * gapY;
    const maxScroll = Math.max(0, contentH - listH);

    // 几何遮罩：仅显示列表可视区
    const maskGfx = this.add.graphics();
    maskGfx.fillStyle(0xffffff, 1);
    maskGfx.fillRect(0, listTop, width, listH);
    maskGfx.setVisible(false);
    const mask = maskGfx.createGeometryMask();

    const cont = this.add.container(0, 0).setDepth(5);
    cont.setMask(mask);
    this._levels = { cont, listTop, listBottom, listH, maxScroll, scrollY: 0 };

    LEVEL_LIST.forEach((key, i) => {
      const lv = LEVELS[key];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = col === 0 ? colL : colR;
      const cy = listTop + cardH / 2 + row * (cardH + gapY);
      this._levelCard(cont, cx, cy, cardW, cardH, lv);
    });

    // 溢出提示
    if (maxScroll > 0) {
      this.add.text(width / 2, listBottom + 6, '上下滑动 / 滚轮 查看全部 20 关', {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#9a8a5a',
      }).setOrigin(0.5).setDepth(6);
    }

    // 拖拽滚动（仅当按下始于列表区）；卡片在"未拖动"时才激活，避免误触
    this._dragged = false;
    this._lastDragY = null;
    this._scrollArmed = false;
    this.input.on('pointerdown', (p) => {
      this._dragged = false;
      this._lastDragY = null;
      this._downY = p.y;
      this._scrollArmed = (p.y >= listTop && p.y <= listBottom);
    });
    this.input.on('pointermove', (p) => {
      if (!p.isDown || !this._scrollArmed) return;
      if (this._lastDragY != null) {
        const dy = p.y - this._lastDragY;
        if (Math.abs(p.y - this._downY) > 8 || this._dragged) {
          this._dragged = true;
          this._levels.scrollY = this._clamp(this._levels.scrollY - dy, 0, this._levels.maxScroll);
          this._levels.cont.y = -this._levels.scrollY;
        }
      }
      this._lastDragY = p.y;
    });
    this.input.on('pointerup', () => {
      this._scrollArmed = false;
      this._lastDragY = null;
      // 重置 _dragged 交给下一次 pointerdown；卡片在 pointerup 时自行读取判断
    });
  }

  _levelCard(parent, cx, cy, w, h, lv) {
    const cont = this.add.container(cx, cy);
    parent.add(cont);

    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 4, w, h, 12);
    g.fillStyle(0x4a3c2a, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    g.lineStyle(2.5, COLORS.gold, 0.75);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    cont.add(g);

    cont.add(this.add.text(-w / 2 + 16, -h / 2 + 24, lv.name, {
      fontFamily: 'serif',
      fontSize: '24px',
      color: '#f0d9a8',
    }).setOrigin(0, 0.5));

    const diff = Math.max(1, Math.min(5, lv.difficulty || 1));
    cont.add(this.add.text(w / 2 - 14, -h / 2 + 20, '★'.repeat(diff), {
      fontFamily: 'serif',
      fontSize: '14px',
      color: '#ffce5a',
    }).setOrigin(1, 0.5));

    cont.add(this.add.text(-w / 2 + 16, 2, lv.subtitle, {
      fontFamily: '"PingFang SC",sans-serif',
      fontSize: '12px',
      color: '#cdb888',
    }).setOrigin(0, 0.5).setWordWrapWidth(w - 34));

    const reward = LEVEL_REWARD[lv.key] || 0;
    cont.add(this.add.text(-w / 2 + 16, h / 2 - 14, `${lv.waves.length} 波 · +${reward}金`, {
      fontFamily: '"PingFang SC",sans-serif',
      fontSize: '11px',
      color: '#b9a47e',
    }).setOrigin(0, 0.5));

    const cleared = getMeta().cleared.includes(lv.key);
    cont.add(this.add.text(w / 2 - 14, h / 2 - 14, cleared ? '✓ 已通关' : '▶ 出征', {
      fontFamily: '"PingFang SC",sans-serif',
      fontSize: '14px',
      color: cleared ? '#8fd06a' : '#ffe08a',
    }).setOrigin(1, 0.5));

    const zone = this.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true });
    parent.add(zone);
    zone.on('pointerover', () => cont.setAlpha(0.92));
    zone.on('pointerout', () => cont.setAlpha(1));
    zone.on('pointerdown', () => {
      this.tweens.add({ targets: cont, scale: 0.96, duration: 70, yoyo: true });
    });
    // 在 pointerup 时激活，且仅当本次未发生拖动（避免滑动列表时误入关卡）
    zone.on('pointerup', () => {
      if (this._dragged) return;
      audio.unlock();
      audio.play('click');
      this.time.delayedCall(60, () => {
        this.registry.set('levelKey', lv.key);
        this.scene.start('GameScene', { levelKey: lv.key });
      });
    });
  }
}
