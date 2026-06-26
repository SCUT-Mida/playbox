import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { GENERALS, GENERAL_BY_ID } from '../data/generals.js';
import { bondsForGeneral, bondPartners } from '../data/bonds.js';
import { isUnlocked, unlockedGenerals, generalStar, starAtkMult, starHpMult, MAX_STAR } from '../data/meta.js';
import { drawChibi, optsForGeneral, shade } from '../utils/Chibi.js';
import audio from '../audio/Audio.js';

// 武将图鉴：浏览全部武将的属性 / 技能 / 羁绊搭档，未解锁武将灰显可预览
const CARD_W = 330;
const CARD_H = 116;
const CARD_GAP_X = 14;
const CARD_GAP_Y = 10;
const GRID_TOP = 150;
const CLS_LABEL = { MELEE: '近战', RANGE: '远程', MAGE: '策士' };
const DMG_LABEL = { PHYSICAL: '物理', MAGIC: '法术' };

export default class RosterScene extends Phaser.Scene {
  constructor() {
    super('RosterScene');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this._bgTexture(width, height);
    this._detail = null;
    this._mode = 'all'; // 'all' 图鉴全部 | 'owned' 武将栏（已收录）
    this._cards = [];
    this._tabEls = [];

    // 顶部栏
    this._buildHeader(width);
    this._buildTabs(width);
    this._buildHint(width);
    this._buildGrid();
  }

  _buildTabs(width) {
    // 切换"图鉴(全部) / 武将栏(已收录)"：武将栏只展示已抽到的武将，强化"收集→合并"体感
    if (this._tabEls.length) {
      this._tabEls.forEach((e) => { e.cont.destroy(); e.zone.destroy(); });
      this._tabEls = [];
    }
    const unlocked = unlockedGenerals().length;
    const tabs = [
      { mode: 'all', label: `图 鉴 · 全部 ${GENERALS.length}`, cx: width / 2 - 150 },
      { mode: 'owned', label: `武 将 栏 · 已收录 ${unlocked}`, cx: width / 2 + 150 },
    ];
    tabs.forEach((t) => {
      const active = this._mode === t.mode;
      this._tabEls.push(this._mkTab(t.cx, 98, t.label, () => this._setMode(t.mode), active));
    });
  }

  _mkTab(cx, cy, label, onClick, active) {
    const w = 252;
    const h = 38;
    const cont = this.add.container(cx, cy).setDepth(6);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 2, w, h, 10);
    g.fillStyle(active ? 0x6a4f8a : 0x36301f, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    g.lineStyle(2, active ? COLORS.gold : COLORS.ink, active ? 0.95 : 0.5);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    cont.add(g);
    cont.add(this.add.text(0, 0, label, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '17px',
      color: active ? '#ffe9b8' : '#b9a47e', fontStyle: 'bold',
    }).setOrigin(0.5));
    const zone = this.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => cont.setScale(1.04));
    zone.on('pointerout', () => cont.setScale(1));
    zone.on('pointerdown', () => {
      audio.play('click');
      this.tweens.add({ targets: cont, scale: 0.96, duration: 60, yoyo: true });
      this.time.delayedCall(70, onClick);
    });
    return { cont, zone };
  }

  _buildHint(width) {
    this.add.text(width / 2, 132, '💡 同名武将自动合并：2 张 → ★+1；满星后再抽则溢出返还金币', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#b9a47e',
    }).setOrigin(0.5).setDepth(6);
  }

  _buildGrid() {
    const { width } = this.scale;
    // 武将栏按星级倒序，把练度最高的武将顶到最前
    const list = this._mode === 'owned'
      ? unlockedGenerals().sort((a, b) => generalStar(b.id) - generalStar(a.id))
      : GENERALS;
    const startX = (width - (2 * CARD_W + CARD_GAP_X)) / 2 + CARD_W / 2;
    list.forEach((def, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = startX + col * (CARD_W + CARD_GAP_X);
      const cy = GRID_TOP + CARD_H / 2 + row * (CARD_H + CARD_GAP_Y);
      this._cards.push(this._buildCard(cx, cy, def));
    });
  }

  _clearGrid() {
    for (const c of this._cards) c.container.destroy(true);
    this._cards = [];
  }

  _setMode(m) {
    if (this._mode === m) return;
    if (this._detail) this._closeDetail();
    this._mode = m;
    this._clearGrid();
    this._buildGrid();
    this._buildTabs(this.scale.width);
  }

  _bgTexture(width, height) {
    const bg = this.add.graphics();
    bg.fillStyle(0x2a2018, 1);
    bg.fillRect(0, 0, width, height);
    for (let y = 0; y < height; y += 26) {
      bg.lineStyle(1, 0x3a2e22, 0.5);
      bg.lineBetween(0, y, width, y);
    }
    bg.fillStyle(COLORS.parchment, 0.05);
    bg.fillRect(0, 0, width, height);
  }

  _buildHeader(width) {
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(0x3a2e20, 0.96);
    g.fillRect(0, 0, width, 120);
    g.lineStyle(2, COLORS.gold, 0.5);
    g.lineBetween(0, 120, width, 120);

    this.add.text(width / 2, 50, '武 将 图 鉴', {
      fontFamily: 'serif', fontSize: '42px', color: '#ead9b6', stroke: '#1a1410', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(6);

    this._mkButton(96, 50, 140, 56, '◀ 返回', 0x6b5a40, () => {
      audio.play('click');
      this.scene.start('MenuScene');
    });
  }

  _mkButton(cx, cy, w, h, label, color, onClick) {
    const cont = this.add.container(cx, cy).setDepth(6);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 3, w, h, 12);
    g.fillStyle(color, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    g.lineStyle(2, COLORS.ink, 0.7);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    cont.add(g);
    cont.add(this.add.text(0, 0, label, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '20px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5));
    const zone = this.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => cont.setScale(1.04));
    zone.on('pointerout', () => cont.setScale(1));
    zone.on('pointerdown', () => {
      this.tweens.add({ targets: cont, scale: 0.94, duration: 70, yoyo: true });
      this.time.delayedCall(80, onClick);
    });
    return cont;
  }

  _buildCard(cx, cy, def) {
    const cont = this.add.container(cx, cy).setDepth(4);
    const fac = COLORS.faction[def.faction] || COLORS.ink;
    const unlocked = isUnlocked(def.id);
    const star = unlocked ? generalStar(def.id) : 0;

    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-CARD_W / 2 + 2, -CARD_H / 2 + 3, CARD_W, CARD_H, 10);
    g.fillStyle(unlocked ? 0x4a3a28 : 0x36301f, 1);
    g.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 10);
    // 阵营色条
    g.fillStyle(fac, 1);
    g.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, 8, CARD_H, 4);
    g.lineStyle(2, 0x1a1410, 0.6);
    g.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 10);
    cont.add(g);

    // Q版头像
    const portrait = this.add.graphics();
    drawChibi(portrait, { ...optsForGeneral(def), size: 64 });
    portrait.setPosition(-CARD_W / 2 + 56, 6);
    if (!unlocked) portrait.setAlpha(0.35);
    cont.add(portrait);

    // 名字 + 阵营 + 职业
    cont.add(this.add.text(-CARD_W / 2 + 100, -CARD_H / 2 + 16, def.name, {
      fontFamily: 'serif', fontSize: '24px', color: unlocked ? '#ffe9b8' : '#9a8a6a', fontStyle: 'bold',
    }).setOrigin(0, 0.5));
    cont.add(this.add.text(-CARD_W / 2 + 100, -CARD_H / 2 + 42,
      `${def.faction} · ${CLS_LABEL[def.cls]}${unlocked ? '' : ' · 未解锁'}`, {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: unlocked ? '#cdb888' : '#8a7a5a',
      }).setOrigin(0, 0.5));

    // 关键属性预览（已解锁时显示星级加成后的数值）
    const atkShow = unlocked ? Math.round(def.atk * starAtkMult(star)) : def.atk;
    const hpShow = unlocked ? Math.round(def.hp * starHpMult(star)) : def.hp;
    const statTxt = def.cls === 'MELEE'
      ? `攻 ${atkShow}   血 ${hpShow}   挡 ${def.block}`
      : `攻 ${atkShow}   血 ${hpShow}   程 ${def.range.toFixed(1)}`;
    cont.add(this.add.text(-CARD_W / 2 + 100, -CARD_H / 2 + 70, statTxt, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '14px', color: unlocked ? '#e6d4ac' : '#7a6a4a',
    }).setOrigin(0, 0.5));

    // 星级（合并升级）标识
    if (unlocked && star > 0) {
      cont.add(this.add.text(CARD_W / 2 - 16, -CARD_H / 2 + 18, '★'.repeat(star), {
        fontFamily: 'serif', fontSize: '12px', color: star >= MAX_STAR ? '#ffd27a' : '#ffe08a',
      }).setOrigin(1, 0.5));
    }

    // 锁标
    if (!unlocked) {
      const lock = this.add.text(CARD_W / 2 - 30, 0, '🔒', { fontSize: '26px' }).setOrigin(0.5);
      cont.add(lock);
    }

    const zone = this.add.zone(cx, cy, CARD_W, CARD_H).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => cont.setScale(1.03));
    zone.on('pointerout', () => cont.setScale(1));
    zone.on('pointerdown', () => {
      audio.play('tab');
      this.tweens.add({ targets: cont, scale: 0.97, duration: 70, yoyo: true });
      this.time.delayedCall(80, () => this._openDetail(def));
    });

    return { def, container: cont };
  }

  // ---------------- 详情面板 ----------------
  _openDetail(def) {
    if (this._detail) this._closeDetail();
    const { width, height } = this.scale;
    const unlocked = isUnlocked(def.id);
    const star = unlocked ? generalStar(def.id) : 0;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55).setDepth(90);
    overlay.setInteractive(); // 拦截下层点击，点击空白处关闭

    const pw = 560;
    const ph = 720;
    // 面板尺寸的透明吸收层：点击面板内部不触发关闭（仅面板外才关闭）
    const absorber = this.add.zone(width / 2, height / 2, pw, ph).setInteractive().setDepth(90);

    const panel = this.add.container(width / 2, height / 2).setDepth(91);

    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(-pw / 2 + 3, -ph / 2 + 4, pw, ph, 16);
    g.fillStyle(0x4a3a28, 0.99);
    g.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 16);
    g.lineStyle(3, COLORS.gold, 0.9);
    g.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 16);
    panel.add(g);

    const fac = COLORS.faction[def.faction] || COLORS.ink;
    // 头像 + 标题
    const portrait = this.add.graphics();
    drawChibi(portrait, { ...optsForGeneral(def), size: 86 });
    portrait.setPosition(-pw / 2 + 76, -ph / 2 + 76);
    if (!unlocked) portrait.setAlpha(0.4);
    panel.add(portrait);

    panel.add(this.add.text(-pw / 2 + 130, -ph / 2 + 44, def.name, {
      fontFamily: 'serif', fontSize: '40px', color: unlocked ? '#ffe9b8' : '#b0a070', fontStyle: 'bold',
    }).setOrigin(0, 0.5));
    panel.add(this.add.text(-pw / 2 + 132, -ph / 2 + 84,
      `${def.faction} · ${CLS_LABEL[def.cls]} · 费 ${def.cost}${unlocked ? '' : '（未解锁）'}`, {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '16px', color: '#cdb888',
      }).setOrigin(0, 0.5));
    // 星级（合并升级）—— 未解锁不显示
    if (unlocked) {
      panel.add(this.add.text(pw / 2 - 40, -ph / 2 + 50,
        `${'★'.repeat(star)}${'☆'.repeat(Math.max(0, MAX_STAR - star))}`, {
          fontFamily: 'serif', fontSize: '20px', color: star >= MAX_STAR ? '#ffd27a' : '#ffe08a',
        }).setOrigin(1, 0.5));
      panel.add(this.add.text(pw / 2 - 40, -ph / 2 + 78, `星级 ${star}/${MAX_STAR}`, {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#cdb888',
      }).setOrigin(1, 0.5));
    }

    // 描述
    panel.add(this.add.text(0, -ph / 2 + 120, def.desc, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '15px', color: '#cbb888',
    }).setOrigin(0.5, 0));

    // 属性表（已解锁时显示星级加成后的攻击/血量）
    const atkShow = unlocked ? Math.round(def.atk * starAtkMult(star)) : def.atk;
    const hpShow = unlocked ? Math.round(def.hp * starHpMult(star)) : def.hp;
    const statsY = -ph / 2 + 156;
    const stats = [
      ['攻击', String(atkShow)],
      ['血量', String(hpShow)],
      ['射程', def.range.toFixed(1)],
      ['阻挡', def.cls === 'MELEE' ? String(def.block) : '—'],
      ['攻速', `${def.atkCD.toFixed(2)}s`],
      ['伤害', DMG_LABEL[def.dmgType] || def.dmgType],
    ];
    stats.forEach((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const sx = -pw / 2 + 40 + col * 250;
      const sy = statsY + row * 40;
      panel.add(this.add.text(sx, sy, s[0], {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '15px', color: '#9a8a5a',
      }).setOrigin(0, 0.5));
      panel.add(this.add.text(sx + 64, sy, s[1], {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '18px', color: '#ffe9a8', fontStyle: 'bold',
      }).setOrigin(0, 0.5));
    });

    // 技能
    const skillY = statsY + 3 * 40 + 8;
    panel.add(this.add.text(0, skillY, '— 战 法 —', {
      fontFamily: 'serif', fontSize: '18px', color: '#f0c040',
    }).setOrigin(0.5, 0));
    panel.add(this.add.text(0, skillY + 28, `${def.skill.name}（冷却 ${def.skill.cd}s）`, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '17px', color: '#ffe9b8', fontStyle: 'bold',
    }).setOrigin(0.5, 0));
    panel.add(this.add.text(0, skillY + 56, this._skillDesc(def), {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '14px', color: '#e6d4ac', align: 'center',
    }).setOrigin(0.5, 0).setWordWrapWidth(pw - 60));

    // 羁绊
    const bonds = bondsForGeneral(def);
    const bondY = skillY + 100;
    panel.add(this.add.text(0, bondY, '— 羁 搭 档 —', {
      fontFamily: 'serif', fontSize: '18px', color: '#f0c040',
    }).setOrigin(0.5, 0));

    const bondCont = this.add.container(0, bondY + 30);
    panel.add(bondCont);
    if (bonds.length === 0) {
      bondCont.add(this.add.text(0, 0, '暂无专属羁绊', {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '14px', color: '#9a8a6a',
      }).setOrigin(0.5));
    } else {
      const lineH = 56;
      bonds.forEach((b, i) => {
        const ly = i * lineH;
        const partners = bondPartners(b, def);
        const partnerTxt = partners.length ? `搭档：${partners.join('、')}` : '需同名/同阵营武将';
        const bgg = this.add.graphics();
        bgg.fillStyle(0x2a3a2e, 0.7);
        bgg.fillRoundedRect(-pw / 2 + 30, ly - 6, pw - 60, lineH - 8, 8);
        bgg.lineStyle(1.5, shade(COLORS.gold, 0.8), 0.5);
        bgg.strokeRoundedRect(-pw / 2 + 30, ly - 6, pw - 60, lineH - 8, 8);
        bondCont.add(bgg);
        bondCont.add(this.add.text(-pw / 2 + 46, ly + 6, b.name, {
          fontFamily: '"PingFang SC",sans-serif', fontSize: '16px', color: '#ffe9a8', fontStyle: 'bold',
        }).setOrigin(0, 0.5));
        bondCont.add(this.add.text(-pw / 2 + 46, ly + 28, `${b.desc}`, {
          fontFamily: '"PingFang SC",sans-serif', fontSize: '12px', color: '#cdb888',
        }).setOrigin(0, 0.5));
        bondCont.add(this.add.text(pw / 2 - 46, ly + 6, partnerTxt, {
          fontFamily: '"PingFang SC",sans-serif', fontSize: '12px', color: '#9ad0a6', align: 'right',
        }).setOrigin(1, 0.5).setWordWrapWidth(150));
      });
    }

    // 关闭按钮
    this._mkPanelBtn(panel, 0, ph / 2 - 44, 180, 50, '关 闭', 0x6b5a40, () => this._closeDetail());

    panel.setScale(0.85);
    panel.setAlpha(0);
    this.tweens.add({
      targets: panel, scale: 1, alpha: 1, duration: 220, ease: 'Back.Out',
    });

    this._detail = { overlay, absorber, panel };
    // 点击遮罩空白处关闭（面板内被 absorber 吸收，不会触发）
    overlay.on('pointerdown', () => this._closeDetail());
  }

  _mkPanelBtn(panel, lx, ly, w, h, label, color, onClick) {
    const cont = this.add.container(lx, ly);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 2, w, h, 10);
    g.fillStyle(color, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    g.lineStyle(2, COLORS.ink, 0.7);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    cont.add(g);
    cont.add(this.add.text(0, 0, label, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '20px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5));
    // 区域置于遮罩(depth 90)之上，确保点击不被遮罩拦截
    const zone = this.add.zone(this.scale.width / 2 + lx, this.scale.height / 2 + ly, w, h)
      .setInteractive({ useHandCursor: true }).setDepth(92);
    zone.on('pointerover', () => cont.setScale(1.04));
    zone.on('pointerout', () => cont.setScale(1));
    zone.on('pointerdown', (p) => {
      p.event.stopPropagation();
      this.tweens.add({ targets: cont, scale: 0.94, duration: 70, yoyo: true });
      this.time.delayedCall(80, onClick);
    });
    panel.add(cont);
    this._panelZones = this._panelZones || [];
    this._panelZones.push(zone);
  }

  _closeDetail() {
    if (!this._detail) return;
    if (this._panelZones) {
      this._panelZones.forEach((z) => z.destroy());
      this._panelZones = [];
    }
    this._detail.overlay.destroy();
    this._detail.absorber.destroy();
    this._detail.panel.destroy(true);
    this._detail = null;
  }

  _skillDesc(def) {
    const s = def.skill;
    if (s.type === 'AOE') return `范围斩击：半径 ${s.radius} 格内造成攻击×${s.mult} 伤害`;
    if (s.type === 'SNIPE') return `单体爆发：对最远目标造成攻击×${s.mult} 伤害`;
    // SPELL
    let txt = `法术轰击：目标半径 ${s.radius} 格内造成攻击×${s.mult} 法术伤害`;
    if (s.slow) txt += `；减速 ${(Math.round((1 - s.slow.factor) * 100))}% 持续 ${s.slow.dur}s`;
    if (s.burn) txt += `；灼烧 ${s.burn.dps}/s 持续 ${s.burn.dur}s`;
    return txt;
  }
}
