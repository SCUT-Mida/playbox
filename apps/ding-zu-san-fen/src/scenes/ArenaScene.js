import Phaser from 'phaser';
import { COLORS } from '../config.js';
import {
  getActiveSlot, getMeta, addGold, unlockedGenerals, generalStar, starAtkMult, starHpMult,
} from '../data/meta.js';
import { drawChibi, optsForGeneral } from '../utils/Chibi.js';
import audio from '../audio/Audio.js';

// ArenaScene · 演武场：以麾下武将的"综合战力"挑战层层递进的假想敌，
// 每胜一轮获得金币；每日 3 次演练机会（按存档槽隔离），为阵容成长提供一条额外的金币来源。
// 战力 = Σ(攻×星级倍率) + Σ(血×0.1×星级倍率)，故多抽将、合并升星可推进更多轮、收益更高。
const DAILY_DRILLS = 3;
const ENEMY_BASE = 70;
const ENEMY_GROWTH = 1.32;

const ARENA_PREFIX = 'dzsf_arena_v2_slot_';

function dayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function arenaKey() { return `${ARENA_PREFIX}${getActiveSlot()}`; }
function loadArena() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(arenaKey());
      if (raw) {
        const p = JSON.parse(raw);
        if (p && p.date === dayKey()) return p;
      }
    }
  } catch { /* noop */ }
  return { date: dayKey(), drills: 0, bestRound: 0 };
}
function saveArena(a) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(arenaKey(), JSON.stringify(a));
  } catch { /* noop */ }
}

function rosterPower() {
  let sum = 0;
  for (const g of unlockedGenerals()) {
    const s = generalStar(g.id);
    sum += g.atk * starAtkMult(s) + g.hp * starHpMult(s) * 0.1;
  }
  return Math.round(sum);
}
function enemyPower(round) {
  return Math.round(ENEMY_BASE * Math.pow(ENEMY_GROWTH, round - 1));
}
function roundGold(round, power) {
  return Math.floor(15 + round * 12 + power * 0.02);
}

export default class ArenaScene extends Phaser.Scene {
  constructor() {
    super('ArenaScene');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this._bgTexture(width, height);
    this._buildHeader(width);
    this._state = 'ready';
    this._round = 0;
    this._gold = 0;
    this._renderReady();
  }

  _bgTexture(width, height) {
    const bg = this.add.graphics();
    bg.fillStyle(0x241f2e, 1);
    bg.fillRect(0, 0, width, height);
    for (let y = 0; y < height; y += 26) {
      bg.lineStyle(1, 0x312a40, 0.5);
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

    this.add.text(width / 2, 50, '演 武 场', {
      fontFamily: 'serif', fontSize: '42px', color: '#ead9b6', stroke: '#1a1410', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(6);
    this._goldText = this.add.text(width / 2, 96, `金 ${getMeta().gold}`, {
      fontFamily: 'serif', fontSize: '18px', color: '#ffe08a', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6);

    this._mkButton(96, 60, 140, 56, '◀ 返回', 0x6b5a40, () => {
      audio.play('click');
      this.scene.start('MenuScene');
    });
  }

  _clearBody() {
    if (this._body) { this._body.destroy(true); this._body = null; }
    if (this._actionZones) { this._actionZones.forEach((z) => z.destroy()); this._actionZones = null; }
  }

  _newBody() {
    this._clearBody();
    this._body = this.add.container(0, 0).setDepth(4);
    return this._body;
  }

  // 动作按钮：绝对坐标命中区（深度 6，与其它场景一致的稳健写法）
  _action(cx, cy, w, h, label, color, onClick) {
    const cont = this.add.container(cx, cy).setDepth(6);
    this._body.add(cont);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 3, w, h, 12);
    g.fillStyle(color, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    g.lineStyle(2, COLORS.ink, 0.7);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    cont.add(g);
    const txt = this.add.text(0, 0, label, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '22px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);
    cont.add(txt);
    const zone = this.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true }).setDepth(7);
    zone.on('pointerover', () => cont.setScale(1.04));
    zone.on('pointerout', () => cont.setScale(1));
    zone.on('pointerdown', () => {
      this.tweens.add({ targets: cont, scale: 0.95, duration: 70, yoyo: true });
      this.time.delayedCall(80, onClick);
    });
    this._actionZones = this._actionZones || [];
    this._actionZones.push(zone);
    cont._txt = txt;
    return cont;
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

  // —— 待机态 ——
  _renderReady() {
    const { width } = this.scale;
    const body = this._newBody();
    const power = rosterPower();
    const arena = loadArena();
    const left = Math.max(0, DAILY_DRILLS - arena.drills);

    body.add(this.add.text(width / 2, 200, '以战养战', {
      fontFamily: 'serif', fontSize: '34px', color: '#e6d4ac',
    }).setOrigin(0.5));
    body.add(this.add.text(width / 2, 244, '麾下武将综合战力越高，可击退的回合越多、金币越丰', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '15px', color: '#cbb888',
    }).setOrigin(0.5));

    // 战力 + 剩余次数面板
    const pw = 560; const ph = 200; const py = 460;
    const pg = this.add.graphics();
    pg.fillStyle(0x000000, 0.3);
    pg.fillRoundedRect(width / 2 - pw / 2 + 3, py - ph / 2 + 4, pw, ph, 14);
    pg.fillStyle(0x4a3c2a, 1);
    pg.fillRoundedRect(width / 2 - pw / 2, py - ph / 2, pw, ph, 14);
    pg.lineStyle(3, COLORS.gold, 0.8);
    pg.strokeRoundedRect(width / 2 - pw / 2, py - ph / 2, pw, ph, 14);
    body.add(pg);
    body.add(this.add.text(width / 2, py - 60, '综合战力', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '17px', color: '#cdb888',
    }).setOrigin(0.5));
    body.add(this.add.text(width / 2, py - 18, String(power), {
      fontFamily: 'serif', fontSize: '54px', color: '#ffe08a', fontStyle: 'bold',
    }).setOrigin(0.5));
    body.add(this.add.text(width / 2, py + 30, `今日剩余演练 ${left}/${DAILY_DRILLS}　·　历史最佳第 ${arena.bestRound} 轮`, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '15px', color: '#e6d4ac',
    }).setOrigin(0.5));
    body.add(this.add.text(width / 2, py + 62, `收录武将 ${unlockedGenerals().length} 位`, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#9a8a5a',
    }).setOrigin(0.5));

    // 武将预览（前几位 Q版小人）
    const ids = unlockedGenerals().slice(0, 6);
    ids.forEach((def, i) => {
      const x = width / 2 - (ids.length - 1) * 44 + i * 88;
      const cg = this.add.graphics();
      drawChibi(cg, { ...optsForGeneral(def), size: 56 });
      cg.setPosition(x, 640);
      body.add(cg);
    });

    // 开始演练
    this._action(width / 2, 760, 320, 78, left > 0 ? '⚔ 开始演练' : '今日演练已用尽', left > 0 ? 0x2f7d4a : 0x4a3f30, () => {
      if (left <= 0) { audio.play('error'); return; }
      this._startDrill();
    });

    body.add(this.add.text(width / 2, 840, '每轮敌军战力递增；战力高于敌军即胜并获得金币，直至落败。', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#9a8a5a',
    }).setOrigin(0.5));
  }

  // —— 演练流程 ——
  _startDrill() {
    this._round = 0;
    this._gold = 0;
    this._power = rosterPower();
    audio.play('wave');
    this._nextRound();
  }

  _nextRound() {
    this._round += 1;
    this._state = 'fighting';
    const { width } = this.scale;
    const body = this._newBody();
    const ep = enemyPower(this._round);
    const win = this._power >= ep;

    body.add(this.add.text(width / 2, 210, `第 ${this._round} 回合`, {
      fontFamily: 'serif', fontSize: '40px', color: '#ffe9b8', stroke: '#2c2418', strokeThickness: 6,
    }).setOrigin(0.5));

    // 我方 vs 敌方
    this._sideCard(body, width / 2 - 170, 440, '我方战力', this._power, 0x2f5d3a, true);
    body.add(this.add.text(width / 2, 440, 'VS', {
      fontFamily: 'serif', fontSize: '44px', color: COLORS.gold, fontStyle: 'bold',
    }).setOrigin(0.5));
    this._sideCard(body, width / 2 + 170, 440, '敌军战力', ep, 0x5d2f2f, false);

    body.add(this.add.text(width / 2, 620, `本轮累计 🪙 ${this._gold}`, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '18px', color: '#ffe08a', fontStyle: 'bold',
    }).setOrigin(0.5));

    // 冲撞动画后揭晓
    const clash = this.add.text(width / 2, 520, '⚔', {
      fontSize: '60px',
    }).setOrigin(0.5).setAlpha(0);
    body.add(clash);
    this.tweens.add({ targets: clash, alpha: 1, scale: { from: 0.4, to: 1.2 }, duration: 180, yoyo: true, hold: 120 });

    this.time.delayedCall(560, () => {
      audio.play(win ? 'kill' : 'hurt');
      this._resolveRound(win, ep);
    });
  }

  _sideCard(body, cx, cy, label, value, color, friendly) {
    const w = 220; const h = 150;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(cx - w / 2 + 2, cy - h / 2 + 3, w, h, 12);
    g.fillStyle(color, 1);
    g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 12);
    g.lineStyle(2.5, COLORS.gold, 0.7);
    g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 12);
    body.add(g);
    body.add(this.add.text(cx, cy - 36, label, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '15px', color: '#e6d4ac',
    }).setOrigin(0.5));
    body.add(this.add.text(cx, cy + 4, String(Math.round(value)), {
      fontFamily: 'serif', fontSize: '40px', color: friendly ? '#9affb8' : '#ffb0a0', fontStyle: 'bold',
    }).setOrigin(0.5));
    // Q版小人点缀
    const cg = this.add.graphics();
    if (friendly) {
      const list = unlockedGenerals();
      const def = list[(this._round - 1) % Math.max(1, list.length)] || list[0];
      if (def) drawChibi(cg, { ...optsForGeneral(def), size: 44 });
    } else {
      // 敌方：简笔头盔小人
      cg.fillStyle(0xeab69a, 1); cg.fillCircle(0, -8, 9);
      cg.fillStyle(0x8a3a2a, 1); cg.fillRect(-9, -2, 18, 12);
    }
    cg.setPosition(cx, cy + 50);
    body.add(cg);
  }

  _resolveRound(win, ep) {
    const { width } = this.scale;
    if (win) {
      const gain = roundGold(this._round, this._power);
      this._gold += gain;
      this._state = 'roundWin';
      const body = this._newBody();
      body.add(this.add.text(width / 2, 360, `第 ${this._round} 回合 · 胜！`, {
        fontFamily: 'serif', fontSize: '46px', color: '#9affb8', stroke: '#1a2c14', strokeThickness: 6,
      }).setOrigin(0.5));
      body.add(this.add.text(width / 2, 430, `击退敌军（战力 ${ep}），获得 🪙 ${gain}`, {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '20px', color: '#ffe08a',
      }).setOrigin(0.5));
      body.add(this.add.text(width / 2, 480, `本轮累计 🪙 ${this._gold}`, {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '18px', color: '#e6d4ac',
      }).setOrigin(0.5));
      // 继续挑战下一回合（敌军更强）
      this._action(width / 2, 640, 320, 72, '⚔ 继续挑战（更强）', 0x2f7d4a, () => this._nextRound());
      this._action(width / 2, 730, 320, 60, '见好就收 · 结算', 0x6b5a40, () => this._endDrill(false));
    } else {
      // 落败：演练结束
      this._endDrill(true);
    }
  }

  _endDrill(defeated) {
    const { width } = this.scale;
    this._state = 'ended';
    // 发放金币 + 记录每日次数 / 最佳轮次
    if (this._gold > 0) addGold(this._gold);
    const arena = loadArena();
    arena.drills += 1;
    const reached = defeated ? this._round - 1 : this._round; // 落败时本轮不计为通过
    const passed = Math.max(0, reached);
    if (passed > arena.bestRound) arena.bestRound = passed;
    saveArena(arena);

    const body = this._newBody();
    body.add(this.add.text(width / 2, 340, '演 练 结 算', {
      fontFamily: 'serif', fontSize: '44px', color: '#ffe9b8', stroke: '#2c2418', strokeThickness: 6,
    }).setOrigin(0.5));
    body.add(this.add.text(width / 2, 410, defeated ? `第 ${this._round} 回合力竭落败` : '主动收兵，凯旋而归', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '19px', color: '#e6d4ac',
    }).setOrigin(0.5));
    body.add(this.add.text(width / 2, 470, `共通过 ${Math.max(0, defeated ? this._round - 1 : this._round)} 回合`, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '17px', color: '#cdb888',
    }).setOrigin(0.5));
    body.add(this.add.text(width / 2, 540, `🪙 +${this._gold}`, {
      fontFamily: 'serif', fontSize: '50px', color: '#ffe08a', fontStyle: 'bold',
    }).setOrigin(0.5));
    if (this._gold > 0) {
      this.time.delayedCall(200, () => audio.play('coin'));
      const pop = this.add.text(width / 2, 540, `+${this._gold}`, {
        fontFamily: 'serif', fontSize: '40px', color: '#fff',
      }).setOrigin(0.5);
      body.add(pop);
      this.tweens.add({ targets: pop, y: 480, alpha: 0, duration: 700 });
    }
    this._goldText.setText(`金 ${getMeta().gold}`);
    const left = Math.max(0, DAILY_DRILLS - arena.drills);
    this._action(width / 2, 700, 320, 72, left > 0 ? '⚔ 再演练一次' : '今日演练已用尽', left > 0 ? 0x2f7d4a : 0x4a3f30, () => {
      if (left <= 0) { audio.play('error'); return; }
      this._startDrill();
    });
    this._action(width / 2, 790, 320, 60, '返回演武场', 0x6b5a40, () => this._renderReady());
  }
}
