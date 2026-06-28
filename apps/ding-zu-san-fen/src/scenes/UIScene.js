import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, TILE, MAP_Y, slotTypeForClass, COLORS,
} from '../config.js';
import { upgradeCost, retreatRefund, MAX_LEVEL } from '../data/generals.js';
import { unlockedGenerals, generalStar, starAtkMult, starHpMult, MAX_STAR } from '../data/meta.js';
import { bondsForGeneral, bondPartners } from '../data/bonds.js';
import { drawChibi, optsForGeneral } from '../utils/Chibi.js';
import audio from '../audio/Audio.js';

// 布局常量（竖屏 720×1280）
const HUD_TOP = 8;
const HUD_H = 152; // 8 .. 160（两行 HUD）
const HUD_ROW1 = 44; // 桃 / 金 / 气势
const HUD_ROW2 = 100; // 波次 / 大招 / 召唤
const CARD_BAR_TOP = 1084;
const CARD_BAR_H = 160; // 1084 .. 1244（两行武将卡）
const CARD_W = 84;
const CARD_H = 72;
const CARD_GAP = 8;
const CARDS_PER_ROW = 7;
const CARD_ROW1_CY = CARD_BAR_TOP + 42;
const CARD_ROW2_CY = CARD_BAR_TOP + 118;

const MORALE_BAR_X = 236;
const MORALE_BAR_Y = 36;
const MORALE_BAR_W = 336;

// UIScene: 顶部 HUD + 底部武将卡（拖拽部署）+ 武将操作菜单 + 大招/波次控制
export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    this.gameScene = this.scene.get('GameScene');
    this.drag = null;
    this.cards = []; // { def, container, dim, rect:{x,y,w,h} }
    this._press = null; // 长按等待中的卡牌按下：{ def, px, py, longFired }
    this._pressTimer = null;
    this._codex = null; // 长按弹出的武将图鉴浮层
    this._topButtons = [];
    this._menuButtons = [];
    this._menu = null;
    this._selected = null;
    this._lastBondIds = null;
    // 菜单就地刷新相关：仅在选中变化/等级变化/金币跨过升级阈值时重建，否则就地 setText
    this._menuGen = null; // 当前菜单绑定的武将实例
    this._menuSig = ''; // 触发重建的签名：selection|level|upMax|affordable
    this._menuStat = null; // 就地更新的数值文本引用
    this._early = null; // 波间"提前迎战"倒计时横幅（场景重启时重置引用，避免悬空）

    this._buildTopHud();
    this._buildCardBar();

    // 浏览器策略：首次点击解锁 AudioContext
    this.input.once('pointerdown', () => audio.unlock());
    this.input.on('pointerdown', (p) => this._onDown(p));
    this.input.on('pointermove', (p) => this._onMove(p));
    this.input.on('pointerup', (p) => this._onUp(p));

    // 监听 GameScene 的状态广播。务必在 UIScene 关闭时解绑：
    // GameScene.create() 内会立即 _emitState（见其第 81 行，早于 launch('UIScene')）。
    // 若不解绑，"进入下一关/返回主菜单"重启 GameScene 时，上一局遗留的监听会在
    // 本场景已被 stop、文本(livesText 等)已销毁的瞬间被触发，setColor→updateText
    // 会在 null 画布上 drawImage 抛错并整局卡死——这正是"结算按钮点了没反应"的根因。
    this._onStateHandler = (s) => this._onState(s);
    this.gameScene.events.on('state', this._onStateHandler);
    this.events.once('shutdown', () => {
      if (this.gameScene && this.gameScene.events) this.gameScene.events.off('state', this._onStateHandler);
      this._onStateHandler = null;
    });
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
      earlyBonus: g.EARLY_BONUS,
      wave: g.waveManager.currentWaveNumber,
      totalWaves: g.waveManager.totalWaves,
      waveState: g.waveManager.state,
      betweenRemaining: g.waveManager.betweenRemaining,
      betweenDelay: g.waveManager.betweenDelay,
      betweenMax: g.waveManager.betweenMax,
      enemiesAlive: g.enemies.reduce((n, e) => n + (e.alive ? 1 : 0), 0),
      bonds: g.bondManager.active.map((b) => ({ id: b.id, name: b.name, desc: b.desc })),
      deployedCount: g.generals.size,
      speed: g._speed,
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

    // —— 第一行：桃 / 金 / 气势条 ——
    const cy1 = HUD_ROW1;
    this._pill(40, cy1, 0xf08a78, '桃', '#3a1410');
    this.livesText = this.add.text(72, cy1, '12', {
      fontFamily: 'serif', fontSize: '24px', color: '#ffd9cf', fontStyle: 'bold',
    }).setOrigin(0, 0.5).setDepth(6);

    this._pill(150, cy1, COLORS.gold, '金', '#2c2418');
    this.goldText = this.add.text(182, cy1, '0', {
      fontFamily: 'serif', fontSize: '24px', color: '#ffe9a8', fontStyle: 'bold',
    }).setOrigin(0, 0.5).setDepth(6);

    // 气势条
    this.add.text(MORALE_BAR_X, MORALE_BAR_Y - 8, '气势', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#bcd6e6',
    }).setOrigin(0, 1).setDepth(6);
    const barBg = this.add.graphics().setDepth(6);
    barBg.fillStyle(0x10100c, 0.8);
    barBg.fillRoundedRect(MORALE_BAR_X, MORALE_BAR_Y, MORALE_BAR_W, 16, 8);
    this.moraleBarBg = barBg;
    this.moraleFill = this.add.graphics().setDepth(6);
    this.moraleText = this.add.text(MORALE_BAR_X + MORALE_BAR_W + 6, cy1, '0/100', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#dff3ff',
    }).setOrigin(0, 0.5).setDepth(7);

    // 倍速切换（右上角）：1× / 2×，长关卡加速推进
    this._buildSpeedToggle();

    // —— 第二行：波次 / 大招 / 召唤 ——
    const cy2 = HUD_ROW2;
    this.waveText = this.add.text(24, cy2 - 10, '准备出征', {
      fontFamily: '"PingFang SC",serif', fontSize: '22px', color: '#ffe9b8', fontStyle: 'bold',
    }).setOrigin(0, 0.5).setDepth(6);
    this.waveSubText = this.add.text(24, cy2 + 14, '', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '14px', color: '#cbb888',
    }).setOrigin(0, 0.5).setDepth(6);

    // 火烧连营 大招按钮
    this.ultContainer = this.add.container(360, cy2).setDepth(6);
    this._buildButton(this.ultContainer, 160, 42, '火烧连营', 0xb23a1e, '#ffe6d8');
    this.ultContainer.add(this.add.text(0, 13, '', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '11px', color: '#ffd9c8',
    }).setOrigin(0.5).setName('cost'));

    // 召唤下一波按钮
    this.ctaContainer = this.add.container(600, cy2).setDepth(6);
    this._buildButton(this.ctaContainer, 190, 44, '开始第一波', 0x2f7d4a, '#eafff0');

    // 羁绊行
    this.bondsContainer = this.add.container(GAME_WIDTH / 2, HUD_TOP + 132).setDepth(6);
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

  // 右上角圆形倍速按钮（1× / 2×）。命中与点击由 _topButtons 统一处理，与其它按钮一致。
  _buildSpeedToggle() {
    const cx = GAME_WIDTH - 40;
    const cy = HUD_ROW1;
    const r = 24;
    this.speedContainer = this.add.container(cx, cy).setDepth(7);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(2, 3, r);
    g.fillStyle(0x2c2218, 0.97);
    g.fillCircle(0, 0, r);
    g.lineStyle(2, COLORS.gold, 0.7);
    g.strokeCircle(0, 0, r);
    this.speedContainer.add(g);
    this.speedContainer.add(this.add.text(0, 0, '1×', {
      fontFamily: 'serif', fontSize: '20px', color: '#ffe9a8', fontStyle: 'bold',
    }).setOrigin(0.5).setName('label'));
    this._speedRect = { x: cx - r, y: cy - r, w: r * 2, h: r * 2 };
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

    // 仅展示已解锁武将，按行（每行至多 7 张）居中排布；解锁越多行数越多
    const list = unlockedGenerals();
    for (let i = 0; i < list.length; i += CARDS_PER_ROW) {
      const rowList = list.slice(i, i + CARDS_PER_ROW);
      const n = rowList.length;
      const totalW = n * CARD_W + (n - 1) * CARD_GAP;
      const startX = (GAME_WIDTH - totalW) / 2 + CARD_W / 2;
      const r = Math.floor(i / CARDS_PER_ROW);
      const cy = CARD_ROW1_CY + r * (CARD_ROW2_CY - CARD_ROW1_CY);
      rowList.forEach((def, c) => {
        const cx = startX + c * (CARD_W + CARD_GAP);
        this.cards.push(this._buildCard(cx, cy, def));
      });
    }
  }

  _buildCard(cx, cy, def) {
    const cont = this.add.container(cx, cy).setDepth(6);
    const fac = COLORS.faction[def.faction] || COLORS.ink;
    const w = CARD_W;
    const h = CARD_H;

    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 3, w, h, 8);
    g.fillStyle(0x4a3a28, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    g.fillStyle(fac, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, 24, 8);
    g.fillRect(-w / 2, -h / 2 + 14, w, 12);
    g.lineStyle(2, 0x1a1410, 0.6);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    cont.add(g);

    // 头部 Q版小人头像（开罗风格）
    const portrait = this.add.graphics();
    drawChibi(portrait, { ...optsForGeneral(def), size: 26 });
    portrait.setPosition(0, -h / 2 + 15);
    cont.add(portrait);

    // 名字
    cont.add(this.add.text(0, 7, def.name, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#f0dcae', fontStyle: 'bold',
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

    // 星级角标（合并升级 >1 星时显示，左上角）
    const star = generalStar(def.id);
    if (star > 1) {
      cont.add(this.add.text(-w / 2 + 4, -h / 2 + 2, '★'.repeat(Math.min(star, MAX_STAR)), {
        fontFamily: 'serif', fontSize: '10px', color: star >= MAX_STAR ? '#ffd27a' : '#b0e0ff',
      }).setOrigin(0, 0));
    }

    // 不可负担时的遮罩
    const dim = this.add.graphics();
    dim.fillStyle(0x10100c, 0.55);
    dim.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    dim.setVisible(false);
    cont.add(dim);

    // 已部署标记：同名武将每局仅可部署一个。已上场时盖一枚"已部署"徽章并禁用拖拽，
    // 避免玩家见"金币够→可拖"却放不下的困惑（点按仍可长按查看图鉴）。
    const deployedTag = this.add.container(0, 0).setVisible(false);
    const dtBg = this.add.graphics();
    dtBg.fillStyle(0x2f5d3a, 0.94);
    dtBg.fillRoundedRect(-31, -9, 62, 18, 9);
    dtBg.lineStyle(1.5, 0x6fd08a, 0.95);
    dtBg.strokeRoundedRect(-31, -9, 62, 18, 9);
    deployedTag.add(dtBg);
    deployedTag.add(this.add.text(0, 0, '✓ 已部署', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '11px', color: '#eafff0', fontStyle: 'bold',
    }).setOrigin(0.5));
    cont.add(deployedTag);

    return { def, container: cont, dim, deployedTag, rect: { x: cx - w / 2, y: cy - h / 2, w, h } };
  }

  // 该武将是否已上场（同名唯一）：同名每局仅可部署一个
  _isDeployed(id) {
    for (const g of this.gameScene.generals.values()) {
      if (g.def.id === id) return true;
    }
    return false;
  }

  // ---------------- 输入 ----------------
  _onDown(p) {
    const px = p.x;
    const py = p.y;
    const gs = this.gameScene;

    // 0) 图鉴浮层打开时，任意点击关闭
    if (this._codex) {
      audio.play('click');
      this._closeCodex();
      return;
    }

    // 0.5) 波间"提前迎战"倒计时横幅：命中即提前开波（+金币奖励）
    if (this._early && this._hitRects([this._early], px, py)) {
      audio.play('click');
      this.tweens.add({ targets: this._early.cont, scale: 0.96, duration: 60, yoyo: true });
      this.gameScene.startNextWave();
      return;
    }

    // 1) 菜单按钮
    if (this._menu && this._menu.visible) {
      const btn = this._hitRects(this._menuButtons, px, py);
      if (btn) {
        audio.play('click');
        btn.action();
        this._refreshMenu();
        return;
      }
    }

    // 2) 顶部按钮（大招 / 召唤波次）
    const tb = this._hitTopButtons(px, py);
    if (tb) {
      audio.play('click');
      tb.action();
      return;
    }

    // 3) 选中已有武将
    const gen = gs.getGeneralAt(px, py);
    if (gen) {
      this._openMenu(gen);
      return;
    }

    // 4) 武将卡：长按打开图鉴，移动则转为拖拽（不立即拖拽，留出长按判定窗口）
    const card = this._hitRects(this.cards.map((c) => ({ rect: c.rect, ref: c })), px, py);
    if (card && card.ref) {
      audio.play('click');
      this._closeMenu();
      this._beginPress(card.ref.def, px, py);
      return;
    }

    // 5) 空白处 → 取消选中
    this._closeMenu();
  }

  _onMove(p) {
    // 卡牌按下等待长按：位移超过阈值则判定为拖拽，取消长按计时
    if (this._press && !this._press.longFired && !this.drag) {
      const dx = p.x - this._press.px;
      const dy = p.y - this._press.py;
      if (dx * dx + dy * dy > 144) { // 12px 起拖阈值
        if (this._press.noDrag) {
          // 已上场武将不可重复部署：给出反馈但不启动拖拽（长按查看图鉴仍可用）
          this._cancelPress();
          audio.play('error');
          return;
        }
        const def = this._press.def;
        this._cancelPress();
        this._startDrag(def, p.x, p.y);
      } else {
        return; // 微小抖动：既不长按也不拖拽
      }
    }
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
    // 松手即取消长按等待（无论是否已转拖拽）
    this._cancelPress();
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
    const g = this.add.graphics();
    drawChibi(g, { ...optsForGeneral(def), size: TILE * 0.82 });
    ghost.add(g);
    ghost.setAlpha(0.85);
    ghost.setScale(1.05);
    this.drag = { def, ghost, valid: false, col: null, row: null };
  }

  // —— 长按图鉴：按下后等待 ~450ms，期间未移动则弹出图鉴浮层 ——
  _beginPress(def, px, py) {
    this._cancelPress();
    // 已上场武将不可重复部署：仍允许长按查看图鉴，但拖拽无效
    this._press = { def, px, py, longFired: false, noDrag: this._isDeployed(def.id) };
    this._pressTimer = this.time.delayedCall(450, () => {
      if (this._press && !this._press.longFired && !this.drag) {
        const d = this._press.def;
        this._press = null;
        this._openCodex(d);
      }
    });
  }

  _cancelPress() {
    if (this._pressTimer) {
      this._pressTimer.remove(false);
      this._pressTimer = null;
    }
    this._press = null;
  }

  // 武将图鉴浮层（对阵中长按底部武将卡唤出）：头像 / 属性 / 战法
  _openCodex(def) {
    this._closeCodex();
    const fac = COLORS.faction[def.faction] || COLORS.ink;
    const star = generalStar(def.id);
    const owned = star > 0;
    const clsLabel = def.cls === 'MELEE' ? '近战' : def.cls === 'RANGE' ? '远程' : '策士';
    const pw = 480;
    const ph = 560;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const overlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55)
      .setDepth(90).setInteractive();

    const panel = this.add.container(cx, cy).setDepth(91);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(-pw / 2 + 3, -ph / 2 + 4, pw, ph, 16);
    g.fillStyle(0x4a3a28, 0.99);
    g.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 16);
    g.fillStyle(fac, 1);
    g.fillRoundedRect(-pw / 2, -ph / 2, pw, 44, 16);
    g.fillRect(-pw / 2, -ph / 2 + 28, pw, 18);
    g.lineStyle(3, COLORS.gold, 0.9);
    g.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 16);
    panel.add(g);

    // 头像
    const portrait = this.add.graphics();
    drawChibi(portrait, { ...optsForGeneral(def), size: 96 });
    portrait.setPosition(-pw / 2 + 80, -ph / 2 + 116);
    panel.add(portrait);

    panel.add(this.add.text(-pw / 2 + 150, -ph / 2 + 58, def.name, {
      fontFamily: 'serif', fontSize: '36px', color: '#ffe9b8', fontStyle: 'bold',
    }).setOrigin(0, 0.5));
    panel.add(this.add.text(-pw / 2 + 152, -ph / 2 + 98, `${def.faction} · ${clsLabel} · 费 ${def.cost}`, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '15px', color: '#cdb888',
    }).setOrigin(0, 0.5));

    // 星级
    if (owned) {
      panel.add(this.add.text(pw / 2 - 24, -ph / 2 + 64, '★'.repeat(Math.min(star, MAX_STAR)), {
        fontFamily: 'serif', fontSize: '18px', color: star >= MAX_STAR ? '#ffd27a' : '#ffe08a',
        stroke: '#3a2a10', strokeThickness: 3,
      }).setOrigin(1, 0.5));
    }

    // 描述
    panel.add(this.add.text(0, -ph / 2 + 176, def.desc, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '15px', color: '#cbb888',
    }).setOrigin(0.5, 0));

    // 关键属性（已收录时显示星级加成后数值）
    const atkShow = owned ? Math.round(def.atk * starAtkMult(star)) : def.atk;
    const hpShow = owned ? Math.round(def.hp * starHpMult(star)) : def.hp;
    const statLine = def.cls === 'MELEE'
      ? `攻击 ${atkShow}　血量 ${hpShow}　阻挡 ${def.block}`
      : `攻击 ${atkShow}　血量 ${hpShow}　射程 ${def.range.toFixed(1)}`;
    panel.add(this.add.text(0, -ph / 2 + 206, statLine, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '15px', color: '#e6d4ac',
    }).setOrigin(0.5, 0));

    // 战法
    panel.add(this.add.text(0, -ph / 2 + 248, '— 战 法 —', {
      fontFamily: 'serif', fontSize: '18px', color: '#f0c040',
    }).setOrigin(0.5, 0));
    panel.add(this.add.text(0, -ph / 2 + 278, `${def.skill.name}（冷却 ${def.skill.cd}s）`, {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '17px', color: '#ffe9b8', fontStyle: 'bold',
    }).setOrigin(0.5, 0));
    panel.add(this.add.text(0, -ph / 2 + 308, this._skillDesc(def), {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '14px', color: '#e6d4ac', align: 'center',
    }).setOrigin(0.5, 0).setWordWrapWidth(pw - 60));

    // 羁绊搭档（与图鉴详情一致，长按即可完整查看该武将的"图鉴信息"）
    const bonds = bondsForGeneral(def);
    const bondsY = -ph / 2 + 372;
    panel.add(this.add.text(0, bondsY, '— 羁 搭 档 —', {
      fontFamily: 'serif', fontSize: '18px', color: '#f0c040',
    }).setOrigin(0.5, 0));
    if (bonds.length === 0) {
      panel.add(this.add.text(0, bondsY + 30, '暂无专属羁绊', {
        fontFamily: '"PingFang SC",sans-serif', fontSize: '14px', color: '#9a8a6a',
      }).setOrigin(0.5, 0));
    } else {
      bonds.forEach((b, i) => {
        const partners = bondPartners(b, def);
        const partnerTxt = partners.length ? `　搭档：${partners.join('、')}` : '';
        panel.add(this.add.text(0, bondsY + 30 + i * 30, `${b.name}${partnerTxt}`, {
          fontFamily: '"PingFang SC",sans-serif', fontSize: '14px', color: '#e6d4ac',
        }).setOrigin(0.5, 0).setWordWrapWidth(pw - 60));
      });
    }

    // 操作提示
    panel.add(this.add.text(0, ph / 2 - 64, '长按查看 · 拖拽部署 · 点此关闭', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#9a8a6a',
    }).setOrigin(0.5, 0));

    this._codex = { overlay, panel };
    panel.setScale(0.85).setAlpha(0);
    this.tweens.add({ targets: panel, scale: 1, alpha: 1, duration: 180, ease: 'Back.Out' });
  }

  _closeCodex() {
    if (!this._codex) return;
    this._codex.overlay.destroy();
    this._codex.panel.destroy(true);
    this._codex = null;
  }

  _skillDesc(def) {
    const s = def.skill;
    if (s.type === 'AOE') return `范围斩击：半径 ${s.radius} 格内造成攻击×${s.mult} 伤害`;
    if (s.type === 'SNIPE') return `单体爆发：对最远目标造成攻击×${s.mult} 伤害`;
    let txt = `法术轰击：目标半径 ${s.radius} 格内造成攻击×${s.mult} 法术伤害`;
    if (s.slow) txt += `；减速 ${Math.round((1 - s.slow.factor) * 100)}% 持续 ${s.slow.dur}s`;
    if (s.burn) txt += `；灼烧 ${s.burn.dps}/s 持续 ${s.burn.dur}s`;
    return txt;
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
    audio.play('select');
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

    // 面板位置（贴在武将上方，超界则夹紧在顶部 HUD 与底部武将卡之间）
    const w = 196;
    const h = 168;
    let cx = g.x;
    let cy = g.y - h / 2 - TILE * 0.6;
    cx = Phaser.Math.Clamp(cx, w / 2 + 12, GAME_WIDTH - w / 2 - 12);
    cy = Phaser.Math.Clamp(cy, HUD_TOP + HUD_H + h / 2 + 8, CARD_BAR_TOP - h / 2 - 8);

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
    // 双保险：场景已被 stop（重启过渡期）时仍可能收到过期 state 事件，此时文本已销毁，
    // 直接忽略，避免在销毁的文本上 setText/setColor 触发 drawImage null 崩溃。
    if (!this.scene.isActive()) return;
    this.lastState = s;
    this.livesText.setText(String(s.lives));
    if (s.lives <= 3) this.livesText.setColor('#ff8a78');
    else this.livesText.setColor('#ffd9cf');

    this.goldText.setText(String(s.gold));

    // 气势条
    const ratio = Math.max(0, Math.min(1, s.morale / s.ultCost));
    this.moraleFill.clear();
    this.moraleFill.fillStyle(s.ultReady ? 0xff8a3a : COLORS.morale, 1);
    this.moraleFill.fillRoundedRect(MORALE_BAR_X, MORALE_BAR_Y, MORALE_BAR_W * ratio, 16, 8);
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
    // 倍速按钮：切换并即时刷新标签
    this._setBtnLabel(this.speedContainer, `${s.speed}×`);
    this.speedContainer.setAlpha(s.speed >= 2 ? 1 : 0.78);
    this._topButtons.push({
      rect: this._speedRect,
      action: () => {
        const sp = this.gameScene.toggleSpeed();
        audio.play('click');
        this.tweens.add({ targets: this.speedContainer, scale: 0.9, duration: 70, yoyo: true });
        return sp;
      },
      enabled: true,
      visible: true,
    });

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

    // 召唤按钮：仅 idle 时显示在 HUD；between 时改用更醒目的"提前迎战"倒计时横幅（见 _updateEarlyBanner）
    let ctaLabel = '';
    let ctaEnabled = false;
    if (ws === 'idle') {
      ctaLabel = '开始第一波';
      ctaEnabled = true;
    }
    this._setBtnLabel(this.ctaContainer, ctaLabel || '——');
    this.ctaContainer.setAlpha(ctaEnabled ? 1 : 0.4);
    this.ctaContainer.setVisible(ws === 'idle');
    this._topButtons.push({
      rect: { x: this.ctaContainer.x - this.ctaContainer._bw / 2, y: this.ctaContainer.y - this.ctaContainer._bh / 2, w: this.ctaContainer._bw, h: this.ctaContainer._bh },
      action: () => this.gameScene.startNextWave(),
      enabled: ctaEnabled,
      visible: this.ctaContainer.visible,
    });

    // 波间空档：在棋盘空白处呈现可点击的"提前迎战"倒计时横幅（圆环 + 秒数）
    this._updateEarlyBanner(s);

    // 武将卡状态：金币不足 或 已上场同名武将 时禁用（已上场者额外盖"已部署"徽章）
    const deployedIds = new Set();
    for (const g of this.gameScene.generals.values()) deployedIds.add(g.def.id);
    for (const card of this.cards) {
      const deployed = deployedIds.has(card.def.id);
      const cantAfford = this.gameScene.gold < card.def.cost;
      card.dim.setVisible(cantAfford || deployed);
      if (card.deployedTag) card.deployedTag.setVisible(deployed);
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

  // 波间空档的"提前迎战"倒计时横幅：放在棋盘上方的空白处，
  // 带可点击的圆环倒计时（如 5s），比顶部 HUD 小按钮更易点中、也更醒目。
  _updateEarlyBanner(s) {
    if (s.waveState !== 'between') {
      this._hideEarlyBanner();
      return;
    }
    if (!this._early) this._showEarlyBanner(s);
    this._refreshEarlyBanner(s);
  }

  _showEarlyBanner(s) {
    const cx = GAME_WIDTH / 2;
    const cy = MAP_Y + 52; // 棋盘上沿内侧的空白区（HUD 下方、敌军入场点附近，波间无怪）
    const w = 408;
    const h = 76;
    const cont = this.add.container(cx, cy).setDepth(72);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.35);
    bg.fillRoundedRect(-w / 2 + 3, -h / 2 + 4, w, h, 14);
    bg.fillStyle(0x2f5d3a, 0.97);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.lineStyle(3, 0x6fd08a, 0.95);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    cont.add(bg);

    // 倒计时圆环（左侧）
    const ringX = -w / 2 + 40;
    const ringBg = this.add.graphics();
    ringBg.lineStyle(5, 0x10301a, 0.9);
    ringBg.strokeCircle(ringX, 0, 22);
    cont.add(ringBg);
    const ring = this.add.graphics();
    cont.add(ring);

    const numTxt = this.add.text(ringX, 0, '5', {
      fontFamily: 'serif', fontSize: '26px', color: '#eafff0', fontStyle: 'bold',
    }).setOrigin(0.5);
    cont.add(numTxt);

    cont.add(this.add.text(-w / 2 + 76, -16, '提 前 迎 战', {
      fontFamily: 'serif', fontSize: '24px', color: '#eafff0', fontStyle: 'bold',
    }).setOrigin(0, 0.5));
    const bonusTxt = this.add.text(-w / 2 + 76, 14, '', {
      fontFamily: '"PingFang SC",sans-serif', fontSize: '14px', color: '#9affb8',
    }).setOrigin(0, 0.5);
    cont.add(bonusTxt);

    cont.add(this.add.text(w / 2 - 20, 0, '▶', {
      fontFamily: 'serif', fontSize: '24px', color: '#9affb8',
    }).setOrigin(0.5));

    // 入场动画
    cont.setScale(0.85).setAlpha(0);
    this.tweens.add({ targets: cont, scale: 1, alpha: 1, duration: 180, ease: 'Back.Out' });

    // 悬停反馈区（命中与点击交由 _onDown 统一处理，与其它按钮一致，避免重复触发）
    const zone = this.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true }).setDepth(73);
    zone.on('pointerover', () => cont.setScale(1.03));
    zone.on('pointerout', () => cont.setScale(1));

    this._early = {
      cont, ring, ringX, numTxt, bonusTxt, zone,
      rect: { x: cx - w / 2, y: cy - h / 2, w, h },
      lastSec: -1,
    };
    this._refreshEarlyBanner(s);
  }

  _refreshEarlyBanner(s) {
    if (!this._early) return;
    const { ring, ringX, numTxt, bonusTxt, lastSec } = this._early;
    const max = s.betweenMax || 5;
    const ratio = Math.max(0, Math.min(1, (s.betweenDelay ?? 0) / max));
    // 圆环从满到空顺时针消减
    ring.clear();
    ring.lineStyle(5, 0x9affb8, 1);
    ring.beginPath();
    ring.arc(ringX, 0, 22, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2, false);
    ring.strokePath();
    const sec = Math.max(0, s.betweenRemaining);
    numTxt.setText(String(sec));
    bonusTxt.setText(`立即开波 · 奖 +${s.earlyBonus ?? 25} 金`);
    // 每秒滴答，最后 3 秒更急促的视觉
    if (sec !== lastSec) {
      this._early.lastSec = sec;
      if (sec > 0 && sec <= 3) {
        audio.play('countdown');
        numTxt.setColor(sec <= 3 ? '#ffd27a' : '#eafff0');
      } else {
        numTxt.setColor('#eafff0');
      }
    }
  }

  _hideEarlyBanner() {
    if (!this._early) return;
    this._early.zone.destroy();
    this._early.cont.destroy(true);
    this._early = null;
  }

  update() {
    // 选中武将的描边跟随
    if (this._selected) {
      this.gameScene._drawSelection();
    }
  }
}
