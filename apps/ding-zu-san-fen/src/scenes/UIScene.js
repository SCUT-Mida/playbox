import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, TILE, slotTypeForClass, COLORS,
} from '../config.js';
import { GENERALS } from '../data/generals.js';
import { upgradeCost, retreatRefund, MAX_LEVEL } from '../data/generals.js';

// 布局常量
const HUD_TOP = 8;
const HUD_H = 96; // 8 .. 104
const CARD_BAR_TOP = 656;
const CARD_BAR_H = 92; // 656 .. 748
const CARD_W = 82;
const CARD_GAP = 6;
const CARD_CY = CARD_BAR_TOP + CARD_BAR_H / 2;

const MORALE_BAR_X = 300;
const MORALE_BAR_W = 240;

// UIScene: 顶部 HUD + 底部武将卡（拖拽部署）+ 武将操作菜单 + 大招/波次控制
export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    this.gameScene = this.scene.get('GameScene');
    this.drag = null;
    this.cards = []; // { def, container, dim, rect:{x,y,w,h} }
    this._topButtons = [];
    this._menuButtons = [];
    this._menu = null;
    this._selected = null;
    this._lastBondIds = null;
    // 菜单就地刷新相关：仅在选中变化/等级变化/金币跨过升级阈值时重建，否则就地 setText
    this._menuGen = null; // 当前菜单绑定的武将实例
    this._menuSig = ''; // 触发重建的签名：selection|level|upMax|affordable
    this._menuStat = null; // 就地更新的数值文本引用

    this._buildTopHud();
    this._buildCardBar();

    this.input.on('pointerdown', (p) => this._onDown(p));
    this.input.on('pointermove', (p) => this._onMove(p));
    this.input.on('pointerup', (p) => this._onUp(p));

    this.gameScene.events.on('state', (s) => this._onState(s));
    // 初次拉取一次状态
    this._onState(this._collectState());
  }

  _collectState() {
    const g = this.gameScene;
    return {
      gold: Math.floor(g.gold),
      lives: g.lives,
      maxLives: g.maxLives,
      morale: Math.floor(g.morale),
      ultCost: g.ULT_COST,
      ultReady: g.morale >= g.ULT_COST,
      wave: g.waveManager.currentWaveNumber,
      totalWaves: g.waveManager.totalWaves,
      waveState: g.waveManager.state,
      betweenRemaining: g.waveManager.betweenRemaining,
      enemiesAlive: g.enemies.reduce((n, e) => n + (e.alive ? 1 : 0), 0),
      bonds: g.bondManager.active.map((b) => ({ id: b.id, name: b.name, desc: b.desc })),
      deployedCount: g.generals.size,
    };
  }

  // ---------------- 顶部 HUD ----------------
  _buildTopHud() {
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(0x000000, 0.28);
    g.fillRoundedRect(6, HUD_TOP + 3, GAME_WIDTH - 12, HUD_H, 14);
    g.fillStyle(0x3a2e20, 0.96);
    g.fillRoundedRect(6, HUD_TOP, GAME_WIDTH - 12, HUD_H, 14);
    g.lineStyle(2, COLORS.gold, 0.5);
    g.strokeRoundedRect(6, HUD_TOP, GAME_WIDTH - 12, HUD_H, 14);

    const cy = HUD_TOP + 30;

    // 生命（桃）
    this._pill(60, cy, 0xf08a78, '桃', '#3a1410');
    this.livesText = this.add.text(96, cy, '12', {
      fontFamily: 'serif', fontSize: '26px', color: '#ffd9cf', fontStyle: 'bold',
    }).setOrigin(0, 0.5).setDepth(6);

    // 金币（金）
    this._pill(168, cy, COLORS.gold, '金', '#2c2418');
    this.goldText = this.add.text(204, cy, '0', {
      fontFamily: 'serif', fontSize: '26px', color: '#ffe9a8', fontStyle: 'bold',
    }).setOrigin(0, 0.5).setDepth(6);

    // 气势条
    const bx = MORALE_BAR_X;
    const by = cy;
    this.add.text(bx, by - 16, '气势', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '14px', color: '#bcd6e6',
    }).setOrigin(0, 1).setDepth(6);
    const barBg = this.add.graphics().setDepth(6);
    barBg.fillStyle(0x10100c, 0.8);
    barBg.fillRoundedRect(bx, by - 8, MORALE_BAR_W, 16, 8);
    this.moraleBarBg = barBg;
    this.moraleFill = this.add.graphics().setDepth(6);
    this.moraleText = this.add.text(bx + MORALE_BAR_W - 4, by, '0/100', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#dff3ff',
    }).setOrigin(1, 0.5).setDepth(7);

    // 火烧连营 大招按钮
    this.ultContainer = this.add.container(620, cy).setDepth(6);
    this._buildButton(this.ultContainer, 150, 40, '火烧连营', 0xb23a1e, '#ffe6d8');
    this.ultContainer.add(this.add.text(0, 0, '', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '11px', color: '#ffd9c8',
    }).setOrigin(0.5).setName('cost'));
    // 调整文字位置：主标题上、cost 下
    this.ultContainer.getByName('cost') && this.ultContainer.getByName('cost').setPosition(0, 13);

    // 波次信息
    this.waveText = this.add.text(740, cy - 10, '准备出征', {
      fontFamily: '"PingFang SC",serif', fontSize: '22px', color: '#ffe9b8', fontStyle: 'bold',
    }).setOrigin(0, 0.5).setDepth(6);
    this.waveSubText = this.add.text(740, cy + 14, '', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '14px', color: '#cbb888',
    }).setOrigin(0, 0.5).setDepth(6);

    // 召唤下一波按钮
    this.ctaContainer = this.add.container(1200, cy).setDepth(6);
    this._buildButton(this.ctaContainer, 180, 44, '开始第一波', 0x2f7d4a, '#eafff0');

    // 羁绊行
    this.bondsContainer = this.add.container(GAME_WIDTH / 2, HUD_TOP + 80).setDepth(6);
  }

  _pill(cx, cy, color, label, textColor) {
    const c = this.add.container(cx, cy).setDepth(6);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(2, 3, 17);
    g.fillStyle(color, 1);
    g.fillCircle(0, 0, 17);
    g.lineStyle(2, COLORS.ink, 0.8);
    g.strokeCircle(0, 0, 17);
    c.add(g);
    c.add(this.add.text(0, 0, label, {
      fontFamily: 'serif', fontSize: '18px', color: textColor, fontStyle: 'bold',
    }).setOrigin(0.5));
  }

  _buildButton(parent, w, h, label, color, textColor) {
    // 在容器内绘制按钮背景与文字（文字名为 'label'）
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 3, w, h, 10);
    g.fillStyle(color, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    g.lineStyle(2, COLORS.ink, 0.7);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    parent.add(g);
    const t = this.add.text(0, 0, label, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '18px', color: textColor, fontStyle: 'bold',
    }).setOrigin(0.5).setName('label');
    parent.add(t);
    parent._bw = w;
    parent._bh = h;
  }

  _setBtnLabel(parent, label) {
    const t = parent.getByName('label');
    if (t) t.setText(label);
  }

  // ---------------- 武将卡栏 ----------------
  _buildCardBar() {
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(6, CARD_BAR_TOP + 3, GAME_WIDTH - 12, CARD_BAR_H, 14);
    g.fillStyle(0x2c2218, 0.97);
    g.fillRoundedRect(6, CARD_BAR_TOP, GAME_WIDTH - 12, CARD_BAR_H, 14);
    g.lineStyle(2, COLORS.gold, 0.4);
    g.strokeRoundedRect(6, CARD_BAR_TOP, GAME_WIDTH - 12, CARD_BAR_H, 14);

    this.add.text(20, CARD_BAR_TOP + CARD_BAR_H / 2, '将', {
      fontFamily: 'serif', fontSize: '20px', color: '#c9a35a',
    }).setOrigin(0, 0.5).setDepth(6).setAlpha(0.7);

    const count = GENERALS.length;
    const totalW = count * CARD_W + (count - 1) * CARD_GAP;
    const startX = (GAME_WIDTH - totalW) / 2 + CARD_W / 2;
    GENERALS.forEach((def, i) => {
      const cx = startX + i * (CARD_W + CARD_GAP);
      this.cards.push(this._buildCard(cx, CARD_CY, def));
    });
  }

  _buildCard(cx, cy, def) {
    const cont = this.add.container(cx, cy).setDepth(6);
    const fac = COLORS.faction[def.faction] || COLORS.ink;
    const w = CARD_W;
    const h = 80;

    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 3, w, h, 8);
    g.fillStyle(0x4a3a28, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    g.fillStyle(fac, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, 26, 8);
    g.fillRect(-w / 2, -h / 2 + 16, w, 12);
    g.lineStyle(2, 0x1a1410, 0.6);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    cont.add(g);

    cont.add(this.add.text(0, -h / 2 + 13, def.char, {
      fontFamily: 'serif', fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5));

    cont.add(this.add.text(0, 6, def.name, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '15px', color: '#f0dcae',
    }).setOrigin(0.5));

    const clsLabel = def.cls === 'MELEE' ? '近战' : def.cls === 'RANGE' ? '远程' : '策士';
    cont.add(this.add.text(0, 22, clsLabel, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '10px', color: '#cdb888',
    }).setOrigin(0.5));

    // 费用角标
    const costBg = this.add.graphics();
    costBg.fillStyle(0x1a1410, 0.85);
    costBg.fillCircle(w / 2 - 8, -h / 2 + 8, 11);
    costBg.lineStyle(1.5, COLORS.gold, 1);
    costBg.strokeCircle(w / 2 - 8, -h / 2 + 8, 11);
    cont.add(costBg);
    cont.add(this.add.text(w / 2 - 8, -h / 2 + 8, String(def.cost), {
      fontFamily: 'serif', fontSize: '12px', color: '#ffe08a', fontStyle: 'bold',
    }).setOrigin(0.5).setName('cost'));

    // 不可负担时的遮罩
    const dim = this.add.graphics();
    dim.fillStyle(0x10100c, 0.55);
    dim.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    dim.setVisible(false);
    cont.add(dim);

    return { def, container: cont, dim, rect: { x: cx - w / 2, y: cy - h / 2, w, h } };
  }

  // ---------------- 输入 ----------------
  _onDown(p) {
    const px = p.x;
    const py = p.y;
    const gs = this.gameScene;

    // 1) 菜单按钮
    if (this._menu && this._menu.visible) {
      const btn = this._hitRects(this._menuButtons, px, py);
      if (btn) {
        btn.action();
        this._refreshMenu();
        return;
      }
    }

    // 2) 顶部按钮（大招 / 召唤波次）
    const tb = this._hitTopButtons(px, py);
    if (tb) {
      tb.action();
      return;
    }

    // 3) 选中已有武将
    const gen = gs.getGeneralAt(px, py);
    if (gen) {
      this._openMenu(gen);
      return;
    }

    // 4) 拖拽武将卡
    const card = this._hitRects(this.cards.map((c) => ({ rect: c.rect, ref: c })), px, py);
    if (card && card.ref) {
      this._closeMenu();
      this._startDrag(card.ref.def, px, py);
      return;
    }

    // 5) 空白处 → 取消选中
    this._closeMenu();
  }

  _onMove(p) {
    if (!this.drag) return;
    const px = p.x;
    const py = p.y;
    this.drag.ghost.setPosition(px, py);
    const slot = this.gameScene.getSlotInfoAt(px, py);
    if (slot) {
      const valid = this._placementValid(this.drag.def, slot);
      this.gameScene.setHover(slot.col, slot.row, valid);
      this.drag.valid = valid;
      this.drag.col = slot.col;
      this.drag.row = slot.row;
    } else {
      this.gameScene.clearHover();
      this.drag.valid = false;
      this.drag.col = null;
    }
  }

  _onUp(p) {
    if (!this.drag) return;
    const d = this.drag;
    if (d.valid && d.col != null) {
      this.gameScene.tryPlace(d.def.id, d.col, d.row);
    }
    this.gameScene.clearHover();
    if (d.ghost) d.ghost.destroy();
    this.drag = null;
  }

  _placementValid(def, slot) {
    if (!slot) return false;
    // 统一复用 GameScene.canPlace，保持悬停判定与实际部署一致（含同名唯一性）
    return this.gameScene.canPlace(def.id, slot.col, slot.row);
  }

  _startDrag(def, px, py) {
    const ghost = this.add.container(px, py).setDepth(80);
    const fac = COLORS.faction[def.faction] || COLORS.ink;
    const r = TILE * 0.34;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(2, 4, r + 3);
    g.fillStyle(fac, 0.92);
    g.fillCircle(0, 0, r + 3);
    g.lineStyle(2.5, COLORS.ink, 1);
    g.strokeCircle(0, 0, r + 3);
    g.fillStyle(0xf5ecd6, 0.95);
    g.fillCircle(0, 0, r - 1);
    ghost.add(g);
    ghost.add(this.add.text(0, -1, def.char, {
      fontFamily: 'serif', fontSize: '22px', color: '#2c2418', fontStyle: 'bold',
    }).setOrigin(0.5));
    ghost.setAlpha(0.85);
    ghost.setScale(1.05);
    this.drag = { def, ghost, valid: false, col: null, row: null };
  }

  _hitRects(list, px, py) {
    for (const item of list) {
      const r = item.rect;
      if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return item;
    }
    return null;
  }

  _hitTopButtons(px, py) {
    for (const b of this._topButtons) {
      if (!b.enabled || !b.visible) continue;
      const r = b.rect;
      if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return b;
    }
    return null;
  }

  // ---------------- 武将操作菜单 ----------------
  _openMenu(general) {
    this._selected = general;
    this.gameScene.selectGeneral(general);
    this._buildMenu();
    this._menuGen = general;
    this._menuSig = this._menuSignature();
  }

  // 触发菜单重建的签名：选中实例 + 等级 + 是否满级 + 当前金币能否负担升级费
  // 金币仅在跨过升级阈值时才会改变 affordable，故签名不会随金币连续变化而抖动
  _menuSignature() {
    const g = this._selected;
    if (!g) return '';
    const upCost = upgradeCost(g.def, g.level);
    const upMax = g.level >= MAX_LEVEL;
    const affordable = this.gameScene.gold >= upCost ? 1 : 0;
    return `${g.def.id}|${g.level}|${upMax ? 1 : 0}|${affordable}`;
  }

  _refreshMenu() {
    if (!this._selected || !this._selected.alive || !this._selected.container.active) {
      this._closeMenu();
      return;
    }
    // 仅在选中变化/等级变化/金币跨过升级阈值时重建菜单；其余就地刷新数值文本
    const sig = this._menuSignature();
    if (this._menuGen !== this._selected || sig !== this._menuSig) {
      this._menuGen = this._selected;
      this._menuSig = sig;
      this._buildMenu();
    } else {
      this._updateMenuLive();
    }
  }

  // 就地刷新会随战斗连续变化的数值（血量/攻击），避免 destroy+重建整个容器
  _updateMenuLive() {
    if (!this._selected || !this._menuStat) return;
    const g = this._selected;
    const atk = Math.round(g.atk);
    const statTxt = g.def.cls === 'MELEE'
      ? `攻 ${atk}  血 ${Math.round(g.hp)}/${g.maxHp}\n挡 ${g.def.block}  程 ${g.def.range.toFixed(1)}`
      : `攻 ${atk}  程 ${g.def.range.toFixed(1)}\n${g.def.cls === 'MAGE' ? '法术伤害' : '物理伤害'} · ${g.def.atkCD.toFixed(2)}s`;
    this._menuStat.setText(statTxt);
  }

  _buildMenu() {
    if (this._menu) this._menu.destroy(true);
    this._menuButtons = [];
    this._menuStat = null;
    const gs = this.gameScene;
    const g = this._selected;
    if (!g || !g.alive) {
      this._menu = null;
      return;
    }

    // 面板位置（贴在武将上方，超界则下移/夹紧）
    const w = 196;
    const h = 168;
    let cx = g.x;
    let cy = g.y - h / 2 - TILE * 0.6;
    cx = Phaser.Math.Clamp(cx, w / 2 + 12, GAME_WIDTH - w / 2 - 12);
    cy = Phaser.Math.Clamp(cy, h / 2 + 12, GAME_HEIGHT - CARD_BAR_TOP - h / 2 - 6);

    const cont = this.add.container(cx, cy).setDepth(85);
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.35);
    bg.fillRoundedRect(-w / 2 + 3, -h / 2 + 4, w, h, 12);
    bg.fillStyle(0x4a3a28, 0.98);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    bg.lineStyle(3, COLORS.gold, 0.9);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    cont.add(bg);

    const fac = COLORS.faction[g.def.faction] || COLORS.ink;
    cont.add(this.add.text(0, -h / 2 + 22, `${g.def.name} · Lv.${g.level}`, {
      fontFamily: 'serif', fontSize: '20px', color: '#ffe9b8', fontStyle: 'bold',
    }).setOrigin(0.5));

    const atk = Math.round(g.atk);
    const statTxt = g.def.cls === 'MELEE'
      ? `攻 ${atk}  血 ${Math.round(g.hp)}/${g.maxHp}\n挡 ${g.def.block}  程 ${g.def.range.toFixed(1)}`
      : `攻 ${atk}  程 ${g.def.range.toFixed(1)}\n${g.def.cls === 'MAGE' ? '法术伤害' : '物理伤害'} · ${g.def.atkCD.toFixed(2)}s`;
    // 保留引用以便就地 setText 刷新血量，无需重建容器
    this._menuStat = this.add.text(0, -h / 2 + 58, statTxt, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#e6d4ac', align: 'center',
    }).setOrigin(0.5).setLineSpacing(3);
    cont.add(this._menuStat);

    // 按钮区
    const by = h / 2 - 24;
    const bw = 80;
    const bh = 34;

    // 升级
    const upMax = g.level >= MAX_LEVEL;
    const upCost = upgradeCost(g.def, g.level);
    const upLabel = upMax ? '已满级' : `升级 ${upCost}`;
    this._mkMenuBtn(cont, -48, by, bw, bh, upLabel, upMax ? 0x555049 : 0x2f7d4a, () => {
      if (!upMax) gs.upgradeGeneral(g);
    }, { disabled: upMax || gs.gold < upCost });

    // 撤退
    const refund = retreatRefund(g.def, g.level);
    this._mkMenuBtn(cont, 48, by, bw, bh, `撤退 +${refund}`, 0x8a4a3a, () => {
      gs.retreatGeneral(g);
      this._closeMenu();
    });

    // 关闭
    this._mkMenuBtn(cont, 0, by - bh - 8, bw, bh, '关闭', 0x5a4a36, () => this._closeMenu());

    this._menu = cont;
  }

  _mkMenuBtn(parent, lx, ly, w, h, label, color, action, opts = {}) {
    const disabled = !!opts.disabled;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(lx - w / 2 + 2, ly - h / 2 + 2, w, h, 8);
    g.fillStyle(color, disabled ? 0.5 : 1);
    g.fillRoundedRect(lx - w / 2, ly - h / 2, w, h, 8);
    g.lineStyle(1.5, COLORS.ink, 0.6);
    g.strokeRoundedRect(lx - w / 2, ly - h / 2, w, h, 8);
    parent.add(g);
    parent.add(this.add.text(lx, ly, label, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '14px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5));
    this._menuButtons.push({
      rect: { x: parent.x + lx - w / 2, y: parent.y + ly - h / 2, w, h },
      action,
    });
  }

  _closeMenu() {
    if (this._menu) {
      this._menu.destroy(true);
      this._menu = null;
    }
    this._menuButtons = [];
    this._menuStat = null;
    this._menuGen = null;
    this._menuSig = '';
    this._selected = null;
    this.gameScene.selectGeneral(null);
  }

  // ---------------- 状态刷新 ----------------
  _onState(s) {
    this.lastState = s;
    this.livesText.setText(String(s.lives));
    if (s.lives <= 3) this.livesText.setColor('#ff8a78');
    else this.livesText.setColor('#ffd9cf');

    this.goldText.setText(String(s.gold));

    // 气势条
    const ratio = Math.max(0, Math.min(1, s.morale / s.ultCost));
    this.moraleFill.clear();
    this.moraleFill.fillStyle(s.ultReady ? 0xff8a3a : COLORS.morale, 1);
    this.moraleFill.fillRoundedRect(MORALE_BAR_X, HUD_TOP + 22, MORALE_BAR_W * ratio, 16, 8);
    this.moraleText.setText(`${s.morale}/${s.ultCost}`);

    // 大招按钮
    this.ultContainer.setAlpha(s.ultReady ? 1 : 0.5);
    const costTxt = this.ultContainer.getByName('cost');
    if (costTxt) costTxt.setText(s.ultReady ? '-ready-' : `需 ${s.ultCost}`);

    // 顶部按钮注册
    this._topButtons = [
      {
        rect: { x: this.ultContainer.x - this.ultContainer._bw / 2, y: this.ultContainer.y - this.ultContainer._bh / 2, w: this.ultContainer._bw, h: this.ultContainer._bh },
        action: () => this.gameScene.useUltimate(),
        enabled: s.ultReady,
        visible: true,
      },
    ];

    // 波次文本
    const ws = s.waveState;
    let main = '';
    let sub = '';
    if (ws === 'idle') {
      main = '准备出征';
      sub = `共 ${s.totalWaves} 波敌军`;
    } else if (ws === 'running') {
      main = `第 ${s.wave} / ${s.totalWaves} 波`;
      sub = `残敌 ${s.enemiesAlive}`;
    } else if (ws === 'between') {
      main = `第 ${s.wave} / ${s.totalWaves} 波 · 结束`;
      sub = `下一波 ${s.betweenRemaining}s 后开启`;
    } else if (ws === 'cleared') {
      main = '扫平千军';
      sub = '最后一波已清剿';
    }
    this.waveText.setText(main);
    this.waveSubText.setText(sub);

    // 召唤按钮
    let ctaLabel = '';
    let ctaEnabled = false;
    if (ws === 'idle') {
      ctaLabel = '开始第一波';
      ctaEnabled = true;
    } else if (ws === 'between') {
      ctaLabel = `提前迎战 (+25金)`;
      ctaEnabled = true;
    }
    this._setBtnLabel(this.ctaContainer, ctaLabel || '——');
    this.ctaContainer.setAlpha(ctaEnabled ? 1 : 0.4);
    this.ctaContainer.setVisible(ws === 'idle' || ws === 'between');
    this._topButtons.push({
      rect: { x: this.ctaContainer.x - this.ctaContainer._bw / 2, y: this.ctaContainer.y - this.ctaContainer._bh / 2, w: this.ctaContainer._bw, h: this.ctaContainer._bh },
      action: () => this.gameScene.startNextWave(),
      enabled: ctaEnabled,
      visible: this.ctaContainer.visible,
    });

    // 武将卡可负担状态
    for (const card of this.cards) {
      card.dim.setVisible(this.gameScene.gold < card.def.cost);
    }

    // 羁绊展示
    const ids = s.bonds.map((b) => b.id).sort().join(',');
    if (ids !== this._lastBondIds) {
      this._lastBondIds = ids;
      this._renderBonds(s.bonds);
    }

    // 菜单数值随金币/等级刷新
    if (this._selected) this._refreshMenu();
  }

  _renderBonds(bonds) {
    this.bondsContainer.removeAll(true);
    if (!bonds.length) {
      const t = this.add.text(0, 0, '部署相邻武将以激活羁绊阵法', {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#9a8a6a',
      }).setOrigin(0.5);
      this.bondsContainer.add(t);
      return;
    }
    const gap = 8;
    const items = bonds.map((b) => {
      const c = this.add.container(0, 0);
      const g = this.add.graphics();
      g.fillStyle(0x2a4a32, 0.9);
      g.fillRoundedRect(-50, -12, 100, 24, 8);
      g.lineStyle(1.5, COLORS.gold, 0.7);
      g.strokeRoundedRect(-50, -12, 100, 24, 8);
      c.add(g);
      c.add(this.add.text(0, 0, b.name, {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#ffe9a8', fontStyle: 'bold',
      }).setOrigin(0.5));
      c._w = 100;
      return c;
    });
    const total = items.reduce((n, c) => n + c._w, 0) + gap * (items.length - 1);
    let x = -total / 2;
    for (const c of items) {
      c.x = x + c._w / 2;
      this.bondsContainer.add(c);
      x += c._w + gap;
    }
  }

  update() {
    // 选中武将的描边跟随
    if (this._selected) {
      this.gameScene._drawSelection();
    }
  }
}
