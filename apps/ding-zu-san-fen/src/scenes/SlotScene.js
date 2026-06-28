import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import {
  NUM_SLOTS, getActiveSlot, listMetaSlots, selectSlot, deleteSlot, getMeta,
} from '../data/meta.js';
import { LEVEL_LIST } from '../data/levels.js';
import { GENERALS } from '../data/generals.js';
import audio from '../audio/Audio.js';

// SlotScene: 多存档选择（5 槽，每槽一份独立的金币/武将/通关进度）。
// 作为进入游戏后的首屏；选择或新建槽位后进入主菜单。
export default class SlotScene extends Phaser.Scene {
  constructor() {
    super('SlotScene');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.bg);

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

    this.add.text(width / 2, 96, '选择存档', {
      fontFamily: 'serif', fontSize: '52px', color: '#ead9b6',
      stroke: '#1a1410', strokeThickness: 8,
    }).setOrigin(0.5).setAlpha(0.96);
    this.add.text(width / 2, 146, '每份存档独立保留金币、武将与通关进度', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '17px', color: '#c9a35a',
    }).setOrigin(0.5);

    this._renderSlots();
  }

  _renderSlots() {
    if (this._slotNodes) this._slotNodes.forEach((n) => {
      n.cont.destroy(true);
      n.zone.destroy();
      if (n.del) n.del.destroy();
      if (n.delBtn) n.delBtn.destroy();
    });
    this._slotNodes = [];
    const { width } = this.scale;
    const slots = listMetaSlots();
    const active = getActiveSlot();
    const cardW = 600;
    const cardH = 120;
    const gap = 14;
    const startY = 200;
    slots.forEach((s, i) => {
      const cy = startY + cardH / 2 + i * (cardH + gap);
      this._slotNodes.push(this._buildCard(width / 2, cy, cardW, cardH, s, active));
    });
  }

  _buildCard(cx, cy, w, h, s, active) {
    const cont = this.add.container(cx, cy).setDepth(4);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 4, w, h, 14);
    g.fillStyle(s.empty ? 0x36301f : (s.slot === active ? 0x3a4a2e : 0x4a3c2a), 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    g.lineStyle(3, s.slot === active ? 0x6fd08a : COLORS.gold, s.slot === active ? 0.95 : 0.7);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    cont.add(g);

    // 槽位序号徽章
    const badge = this.add.graphics();
    badge.fillStyle(s.empty ? 0x4a3f30 : COLORS.gold, 1);
    badge.fillCircle(-w / 2 + 48, 0, 26);
    cont.add(badge);
    cont.add(this.add.text(-w / 2 + 48, 0, String(s.slot), {
      fontFamily: 'serif', fontSize: '30px', color: '#2c2418', fontStyle: 'bold',
    }).setOrigin(0.5));

    if (s.empty) {
      cont.add(this.add.text(-w / 2 + 96, -22, '空档位', {
        fontFamily: 'serif', fontSize: '30px', color: '#cdb888',
      }).setOrigin(0, 0.5));
      cont.add(this.add.text(-w / 2 + 96, 18, '开辟一段新的争霸历程', {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '15px', color: '#9a8a6a',
      }).setOrigin(0, 0.5));
      cont.add(this.add.text(w / 2 - 28, 0, '▶ 新建', {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '20px', color: '#ffe08a',
      }).setOrigin(1, 0.5));
    } else if (s.corrupt) {
      cont.add(this.add.text(-w / 2 + 96, -10, `存档 ${s.slot} · 损坏`, {
        fontFamily: 'serif', fontSize: '26px', color: '#f08a78',
      }).setOrigin(0, 0.5));
    } else {
      cont.add(this.add.text(-w / 2 + 96, -26, `第 ${s.slot} 槽 · 主公府`, {
        fontFamily: 'serif', fontSize: '24px', color: '#ffe9b8', fontStyle: 'bold',
      }).setOrigin(0, 0.5));
      cont.add(this.add.text(-w / 2 + 96, 6,
        `🪙 ${s.gold} 金　·　通关 ${s.clearedCount}/${LEVEL_LIST.length}　·　收录 ${s.unlockedCount}/${GENERALS.length} 将`, {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '15px', color: '#cdb888',
      }).setOrigin(0, 0.5));
      cont.add(this.add.text(-w / 2 + 96, 30, `总星数 ★ ${s.totalStars}${s.slot === active ? '　·　当前' : ''}`, {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '14px', color: '#b9a47e',
      }).setOrigin(0, 0.5));
      cont.add(this.add.text(w / 2 - 28, 0, s.slot === active ? '▶ 继续' : '▶ 进入', {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '20px', color: '#ffe08a',
      }).setOrigin(1, 0.5));
    }

    const zone = this.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => cont.setScale(1.02));
    zone.on('pointerout', () => cont.setScale(1));
    zone.on('pointerdown', () => {
      audio.unlock();
      audio.play('click');
      this.tweens.add({ targets: cont, scale: 0.98, duration: 70, yoyo: true });
      this.time.delayedCall(80, () => this._enter(s.slot));
    });

    // 删除按钮（仅非空档）：场景级独立对象，不随卡片 hover 缩放，避免坐标错位
    let delZone = null;
    let delBtn = null;
    if (!s.empty) {
      const dx = cx + w / 2 - 96;
      const dy = cy - h / 2 + 28;
      delBtn = this.add.text(dx, dy, '🗑', { fontSize: '24px' }).setOrigin(0.5).setDepth(7);
      delZone = this.add.zone(dx, dy, 44, 44).setInteractive({ useHandCursor: true }).setDepth(8);
      delZone.on('pointerover', () => delBtn.setScale(1.15));
      delZone.on('pointerout', () => delBtn.setScale(1));
      delZone.on('pointerdown', (p) => {
        p.event.stopPropagation();
        audio.play('click');
        this._confirmDelete(s.slot);
      });
    }

    return { cont, zone, del: delZone, delBtn };
  }

  _enter(slot) {
    selectSlot(slot);
    // 进入菜单前同步音效静音状态
    const m = getMeta().muted;
    audio.setMuted(m);
    this.scene.start('MenuScene');
  }

  _confirmDelete(slot) {
    const { width, height } = this.scale;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6).setDepth(90);
    overlay.setInteractive();
    const panel = this.add.container(width / 2, height / 2).setDepth(91);
    const pw = 480; const ph = 240;
    const g = this.add.graphics();
    g.fillStyle(0x4a3c2a, 1);
    g.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 16);
    g.lineStyle(3, COLORS.base, 1);
    g.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 16);
    panel.add(g);
    panel.add(this.add.text(0, -ph / 2 + 50, `删除存档 ${slot}？`, {
      fontFamily: 'serif', fontSize: '32px', color: '#f0d9a8',
    }).setOrigin(0.5));
    panel.add(this.add.text(0, -10, '该存档的金币、武将与通关记录将被永久抹去。', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '15px', color: '#cdb888', align: 'center',
    }).setOrigin(0.5).setWordWrapWidth(pw - 60));

    // mkBtn 返回 { cont, zone }：视觉容器 cont 与命中区 zone 一并交由 _closeConfirm 回收，
    // 否则只销毁 zone 会让 cont（底色 + 文字）作为孤儿残留在屏幕中央、深度 92，
    // 随每次开关确认框不断堆积（参照 _buildCard 已有的 { cont, zone, del, delBtn } 回收范式）。
    const mkBtn = (lx, ly, w2, label, color, onClick) => {
      const cont = this.add.container(width / 2 + lx, height / 2 + ly).setDepth(92);
      const bgg = this.add.graphics();
      bgg.fillStyle(color, 1);
      bgg.fillRoundedRect(-w2 / 2, -22, w2, 50, 10);
      cont.add(bgg);
      cont.add(this.add.text(0, 0, label, {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '20px', color: '#fff', fontStyle: 'bold',
      }).setOrigin(0.5));
      const z = this.add.zone(width / 2 + lx, height / 2 + ly, w2, 50).setInteractive({ useHandCursor: true }).setDepth(93);
      z.on('pointerdown', (p) => { p.event.stopPropagation(); this.tweens.add({ targets: cont, scale: 0.95, duration: 60, yoyo: true }); this.time.delayedCall(70, onClick); });
      return { cont, zone: z };
    };
    const cancel = mkBtn(-90, 60, 160, '取消', 0x6b5a40, () => this._closeConfirm(overlay, panel, [cancel, ok]));
    const ok = mkBtn(90, 60, 160, '确认删除', COLORS.base, () => {
      deleteSlot(slot);
      this._closeConfirm(overlay, panel, [cancel, ok]);
      this._renderSlots();
    });
  }

  _closeConfirm(overlay, panel, btns) {
    overlay.destroy();
    panel.destroy(true);
    btns.forEach((b) => {
      if (b.cont) b.cont.destroy(true);
      if (b.zone) b.zone.destroy();
    });
  }
}
