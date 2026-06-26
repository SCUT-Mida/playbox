import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { GENERALS, GENERAL_BY_ID } from '../data/generals.js';
import {
  getMeta, DRAW_COST, DRAW_COST_TEN, performDraw, performDrawTen, unlockedGenerals,
} from '../data/meta.js';
import { drawChibi, optsForGeneral } from '../utils/Chibi.js';
import audio from '../audio/Audio.js';

const CLS_LABEL = { MELEE: '近战', RANGE: '远程', MAGE: '策士' };

// 点将台：消耗金币抽取（解锁）武将
export default class GachaScene extends Phaser.Scene {
  constructor() {
    super('GachaScene');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this._reveal = null;
    this._bgTexture(width, height);

    this._buildHeader(width);
    this._buildCenter(width, height);
    this._buildButtons(width, height);
    this._refresh();
  }

  _bgTexture(width, height) {
    const bg = this.add.graphics();
    bg.fillStyle(0x241b2e, 1);
    bg.fillRect(0, 0, width, height);
    for (let y = 0; y < height; y += 26) {
      bg.lineStyle(1, 0x33283f, 0.5);
      bg.lineBetween(0, y, width, y);
    }
    bg.fillStyle(COLORS.parchment, 0.04);
    bg.fillRect(0, 0, width, height);
  }

  _buildHeader(width) {
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(0x3a2e20, 0.96);
    g.fillRect(0, 0, width, 120);
    g.lineStyle(2, COLORS.gold, 0.5);
    g.lineBetween(0, 120, width, 120);

    this.add.text(width / 2, 52, '点 将 台', {
      fontFamily: 'serif', fontSize: '42px', color: '#ead9b6', stroke: '#1a1410', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(6);

    this._goldText = this.add.text(width / 2, 96, '金 0', {
      fontFamily: 'serif', fontSize: '18px', color: '#ffe08a', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6);

    this._mkButton(96, 60, 140, 56, '◀ 返回', 0x6b5a40, () => {
      audio.play('click');
      this.scene.start('MenuScene');
    });
  }

  _buildCenter(width, height) {
    const cy = height / 2 - 60;
    // 召唤阵：金色光环
    const ring = this.add.graphics().setDepth(3);
    ring.lineStyle(3, COLORS.gold, 0.5);
    ring.strokeCircle(width / 2, cy, 130);
    ring.lineStyle(2, 0xb08bd6, 0.4);
    ring.strokeCircle(width / 2, cy, 96);
    this.tweens.add({ targets: ring, angle: 360, duration: 12000, repeat: -1 });

    this.add.text(width / 2, cy - 200, '广 纳 贤 才', {
      fontFamily: 'serif', fontSize: '30px', color: '#e6d4ac',
    }).setOrigin(0.5).setDepth(4);
    this.add.text(width / 2, cy - 164, '招募天下名将，扩充麾下阵容', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '16px', color: '#cbb888',
    }).setOrigin(0.5).setDepth(4);

    // 中央"？"牌（未揭晓时的占位）
    const card = this.add.container(width / 2, cy).setDepth(4);
    const cg = this.add.graphics();
    cg.fillStyle(0x000000, 0.3);
    cg.fillRoundedRect(-58, -78, 116, 156, 12);
    cg.fillStyle(0x4a3a28, 1);
    cg.fillRoundedRect(-54, -74, 108, 148, 12);
    cg.lineStyle(3, COLORS.gold, 0.8);
    cg.strokeRoundedRect(-54, -74, 108, 148, 12);
    card.add(cg);
    card.add(this.add.text(0, 0, '将', {
      fontFamily: 'serif', fontSize: '64px', color: '#c9a35a',
    }).setOrigin(0.5));
    this._placeholder = card;

    this._countText = this.add.text(width / 2, cy + 150, '', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '16px', color: '#c9a35a',
    }).setOrigin(0.5).setDepth(4);
  }

  _buildButtons(width, height) {
    const by = height - 150;
    this._draw1Btn = this._mkButton(width / 2 - 170, by, 280, 84, '单  抽', 0x2f7d4a, () => this._doSingle());
    this._draw10Btn = this._mkButton(width / 2 + 170, by, 280, 84, '十  连', 0xb23a1e, () => this._doTen());
  }

  _mkButton(cx, cy, w, h, label, color, onClick) {
    const cont = this.add.container(cx, cy).setDepth(6);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 3, w, h, 14);
    g.fillStyle(color, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    g.lineStyle(2, COLORS.ink, 0.7);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    cont.add(g);
    cont.add(this.add.text(0, -12, label, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '26px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5));
    const costTxt = this.add.text(0, 22, '', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '15px', color: '#ffe9c8',
    }).setOrigin(0.5);
    cont.add(costTxt);
    const zone = this.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => { if (cont._enabled) cont.setScale(1.04); });
    zone.on('pointerout', () => cont.setScale(1));
    zone.on('pointerdown', () => {
      if (!cont._enabled) { audio.play('error'); return; }
      this.tweens.add({ targets: cont, scale: 0.95, duration: 70, yoyo: true });
      this.time.delayedCall(80, onClick);
    });
    cont._costTxt = costTxt;
    cont._enabled = true;
    cont._zone = zone;
    return cont;
  }

  // 刷新金币/收集数/按钮可用性
  _refresh() {
    const m = getMeta();
    this._goldText.setText(`金 ${m.gold}`);
    const unlocked = unlockedGenerals().length;
    this._countText.setText(`已收录 ${unlocked} / ${GENERALS.length}`);
    const collected = unlocked >= GENERALS.length;

    const can1 = !collected && m.gold >= DRAW_COST;
    const can10 = !collected && m.gold >= DRAW_COST_TEN;
    this._setBtn(this._draw1Btn, can1, collected ? '已集齐' : `${DRAW_COST} 金`, collected);
    this._setBtn(this._draw10Btn, can10, collected ? '已集齐' : `${DRAW_COST_TEN} 金`, collected);
  }

  _setBtn(btn, enabled, costLabel, collected) {
    btn._enabled = enabled;
    btn.setAlpha(enabled ? 1 : 0.45);
    btn._costTxt.setText(costLabel);
    btn._costTxt.setColor(collected ? '#ff8a78' : '#ffe9c8');
  }

  // ---------------- 抽卡 ----------------
  _doSingle() {
    const before = getMeta().unlocked.length;
    const res = performDraw();
    if (!res) { audio.play('error'); return; } // 金币不足
    if (res.allCollected) { audio.play('error'); this._refresh(); return; }
    audio.play('gacha');
    this._revealSingle(res.id);
    this._refresh();
  }

  _doTen() {
    const res = performDrawTen();
    if (!res) { audio.play('error'); return; }
    audio.play('gacha');
    this._revealTen(res.got);
    this._refresh();
  }

  // 单抽揭晓：卡牌翻转动画
  _revealSingle(id) {
    const { width, height } = this.scale;
    const def = GENERAL_BY_ID[id];
    const cx = width / 2;
    const cy = height / 2 - 60;
    if (this._placeholder) this._placeholder.setVisible(false);

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5).setDepth(90);
    overlay.setInteractive();

    // 卡牌容器（含背面）
    const card = this.add.container(cx, cy).setDepth(91);
    const drawBack = (c) => {
      c.removeAll(true);
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.3);
      g.fillRoundedRect(-72, -96, 144, 192, 14);
      g.fillStyle(0x4a3a28, 1);
      g.fillRoundedRect(-68, -92, 136, 184, 14);
      g.lineStyle(4, COLORS.gold, 0.9);
      g.strokeRoundedRect(-68, -92, 136, 184, 14);
      c.add(g);
      c.add(this.add.text(0, 0, '将', {
        fontFamily: 'serif', fontSize: '80px', color: '#c9a35a',
      }).setOrigin(0.5));
    };
    const drawFront = (c) => {
      c.removeAll(true);
      const fac = COLORS.faction[def.faction] || COLORS.ink;
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.3);
      g.fillRoundedRect(-72, -96, 144, 192, 14);
      g.fillStyle(0x5a4632, 1);
      g.fillRoundedRect(-68, -92, 136, 184, 14);
      g.fillStyle(fac, 1);
      g.fillRoundedRect(-68, -92, 136, 36, 14);
      g.fillRect(-68, -70, 136, 16);
      g.lineStyle(4, COLORS.gold, 1);
      g.strokeRoundedRect(-68, -92, 136, 184, 14);
      c.add(g);
      const portrait = this.add.graphics();
      drawChibi(portrait, { ...optsForGeneral(def), size: 80 });
      portrait.setPosition(0, -6);
      c.add(portrait);
      c.add(this.add.text(0, 64, def.name, {
        fontFamily: 'serif', fontSize: '26px', color: '#ffe9b8', fontStyle: 'bold',
      }).setOrigin(0.5));
      c.add(this.add.text(0, 88, `${def.faction} · ${CLS_LABEL[def.cls]}`, {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#cdb888',
      }).setOrigin(0.5));
    };

    drawBack(card);
    card.setScale(0.2);
    this.tweens.add({
      targets: card, scale: 1, duration: 240, ease: 'Back.Out',
      onComplete: () => {
        // 翻牌：横向挤压 → 换正面 → 展开
        this.tweens.add({
          targets: card, scaleX: 0, duration: 160, ease: 'Quad.In',
          onComplete: () => {
            drawFront(card);
            audio.play('reveal');
            this.tweens.add({
              targets: card, scaleX: 1, duration: 160, ease: 'Quad.Out',
            });
          },
        });
      },
    });

    // "新收录" 横幅
    this.time.delayedCall(560, () => {
      audio.play('unlock');
      const banner = this.add.text(cx, cy - 130, '✦ 新收录 ✦', {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '22px', color: '#ffe08a',
        stroke: '#2c2418', strokeThickness: 4, fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(92).setAlpha(0);
      this.tweens.add({ targets: banner, alpha: 1, y: cy - 124, duration: 200 });
    });

    this._revealActionBtns(cx, height, () => {
      // 再抽一次
      this._closeReveal();
      this._doSingle();
    }, () => this._closeReveal());

    this._reveal = { overlay, card };
  }

  // 十连揭晓：2×5 网格
  _revealTen(ids) {
    const { width, height } = this.scale;
    if (this._placeholder) this._placeholder.setVisible(false);

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55).setDepth(90);
    overlay.setInteractive();

    const panel = this.add.container(width / 2, height / 2 - 40).setDepth(91);
    const g = this.add.graphics();
    g.fillStyle(0x3a2e20, 0.98);
    g.fillRoundedRect(-300, -260, 600, 460, 16);
    g.lineStyle(3, COLORS.gold, 0.9);
    g.strokeRoundedRect(-300, -260, 600, 460, 16);
    panel.add(g);
    panel.add(this.add.text(0, -228, '十 连 揭 晓', {
      fontFamily: 'serif', fontSize: '28px', color: '#ffe9b8', fontStyle: 'bold',
    }).setOrigin(0.5));

    // 2 行 × 5 列
    const cellW = 108;
    const gap = 8;
    const totalW = 5 * cellW + 4 * gap;
    ids.forEach((id, i) => {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const x = -totalW / 2 + cellW / 2 + col * (cellW + gap);
      const y = -120 + row * (cellW + 40);
      const def = GENERAL_BY_ID[id];
      const cell = this.add.container(x, y);
      const fac = COLORS.faction[def.faction] || COLORS.ink;
      const cg = this.add.graphics();
      cg.fillStyle(0x000000, 0.3);
      cg.fillRoundedRect(-cellW / 2 + 2, -cellW / 2 + 2, cellW, cellW, 10);
      cg.fillStyle(0x5a4632, 1);
      cg.fillRoundedRect(-cellW / 2, -cellW / 2, cellW, cellW, 10);
      cg.fillStyle(fac, 1);
      cg.fillRoundedRect(-cellW / 2, -cellW / 2, cellW, 18, 10);
      cg.fillRect(-cellW / 2, -cellW / 2 + 10, cellW, 10);
      cg.lineStyle(2, COLORS.gold, 0.8);
      cg.strokeRoundedRect(-cellW / 2, -cellW / 2, cellW, cellW, 10);
      cell.add(cg);
      const portrait = this.add.graphics();
      drawChibi(portrait, { ...optsForGeneral(def), size: 60 });
      portrait.setPosition(0, -2);
      cell.add(portrait);
      cell.add(this.add.text(0, cellW / 2 - 14, def.name, {
        fontFamily: 'serif', fontSize: '15px', color: '#ffe9b8', fontStyle: 'bold',
      }).setOrigin(0.5));
      cell.setScale(0);
      panel.add(cell);
      this.tweens.add({
        targets: cell, scale: 1, duration: 220, ease: 'Back.Out', delay: i * 80,
        onStart: () => { if (i === 0) audio.play('reveal'); },
      });
    });

    this.time.delayedCall(ids.length * 80 + 200, () => audio.play('unlock'));

    this._revealActionBtns(width / 2, height, null, () => this._closeReveal());
    this._reveal = { overlay, panel };
  }

  // 揭晓后的操作按钮（继续 / 再抽）
  _revealActionBtns(cx, height, onAgain, onClose) {
    const by = height - 90;
    if (onAgain) {
      this._mkOverlayBtn(cx - 130, by, 220, 64, '再 抽 一 次', 0x2f7d4a, onAgain);
    }
    this._mkOverlayBtn(onAgain ? cx + 130 : cx, by, 220, 64, '继 续', 0x6b5a40, onClose);
  }

  _mkOverlayBtn(cx, cy, w, h, label, color, onClick) {
    const cont = this.add.container(cx, cy).setDepth(92);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 3, w, h, 12);
    g.fillStyle(color, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    g.lineStyle(2, COLORS.ink, 0.7);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    cont.add(g);
    cont.add(this.add.text(0, 0, label, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '22px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5));
    const zone = this.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true }).setDepth(93);
    zone.on('pointerover', () => cont.setScale(1.04));
    zone.on('pointerout', () => cont.setScale(1));
    zone.on('pointerdown', () => {
      this.tweens.add({ targets: cont, scale: 0.94, duration: 70, yoyo: true });
      this.time.delayedCall(80, onClick);
    });
    this._overlayBtns = this._overlayBtns || [];
    this._overlayBtns.push({ cont, zone });
  }

  _closeReveal() {
    if (!this._reveal) return;
    if (this._overlayBtns) {
      this._overlayBtns.forEach((b) => { b.cont.destroy(); b.zone.destroy(); });
      this._overlayBtns = [];
    }
    this._reveal.overlay.destroy();
    if (this._reveal.card) this._reveal.card.destroy(true);
    if (this._reveal.panel) this._reveal.panel.destroy(true);
    this._reveal = null;
    if (this._placeholder) this._placeholder.setVisible(true);
    this._refresh();
  }
}
