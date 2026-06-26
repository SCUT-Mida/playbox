import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, TILE, MAP_COLS, MAP_ROWS, MAP_X, MAP_Y, MAP_WIDTH, MAP_HEIGHT,
  COLORS, gridToPixel, pixelToGrid, cellKey, inBounds, dist, clampDt, slotTypeForClass, SLOT,
} from '../config.js';
import { LEVELS } from '../data/levels.js';
import { GENERAL_BY_ID, upgradeCost, retreatRefund, MAX_LEVEL } from '../data/generals.js';
import MapManager from '../managers/MapManager.js';
import WaveManager from '../managers/WaveManager.js';
import BondManager from '../managers/BondManager.js';
import Enemy from '../entities/Enemy.js';
import General from '../entities/General.js';
import Projectile from '../entities/Projectile.js';
import Fx from '../utils/Fx.js';

const ULT_COST = 100;
const ULT_DAMAGE = 900;
const EARLY_BONUS = 25;

// GameScene: 主循环 —— 输入(交由 UIScene)、战斗逻辑、碰撞/伤害、胜负判定
export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.levelKey = (data && data.levelKey) || this.registry.get('levelKey') || 'huangjin';
    this.registry.set('levelKey', this.levelKey);
  }

  create() {
    const level = LEVELS[this.levelKey] || LEVELS.huangjin;
    this.level = level;
    this.cameras.main.setBackgroundColor(level.bgTone);

    // 场景（重开）时重置敌人 UID 计数
    Enemy.resetUid();

    // 状态
    this.gold = level.startGold;
    this.maxLives = level.startLives;
    this.lives = level.startLives;
    this.morale = 0;
    this.ended = false;
    this.result = null;

    // 管理器 / 集合
    this.map = new MapManager(level);
    this.bondManager = new BondManager();
    this.fx = new Fx(this);
    this.enemies = [];
    this.generals = new Map(); // cellKey -> General
    this.projectiles = [];
    this._bondsDirty = true;

    this.waveManager = new WaveManager(level.waves, (k) => this.spawnEnemy(k));

    // 渲染棋盘
    this._renderBoard();

    // 高亮与提示图层（动态）
    this.hoverGfx = this.add.graphics().setDepth(70);
    this.selectionGfx = this.add.graphics().setDepth(69);

    this._stateAcc = 0;
    this._emitState();

    // 启动 UI 层
    this.scene.launch('UIScene');

    // 事件：UIScene 通知部署/操作时统一从这里改状态
    this.events.on('shutdown', () => this._cleanup());
  }

  // ---------------- 棋盘渲染 ----------------
  _renderBoard() {
    const g = this.add.graphics().setDepth(0);
    // 战场底板
    g.fillStyle(0x000000, 0.25);
    g.fillRoundedRect(MAP_X - 10, MAP_Y - 10, MAP_WIDTH + 20, MAP_HEIGHT + 20, 12);
    g.fillStyle(COLORS.parchmentDark, 1);
    g.fillRoundedRect(MAP_X - 6, MAP_Y - 6, MAP_WIDTH + 12, MAP_HEIGHT + 12, 10);
    g.fillStyle(0xe3cf9f, 1);
    g.fillRect(MAP_X, MAP_Y, MAP_WIDTH, MAP_HEIGHT);

    // 网格细线
    g.lineStyle(1, 0xcbb482, 0.5);
    for (let c = 0; c <= MAP_COLS; c++) {
      g.lineBetween(MAP_X + c * TILE, MAP_Y, MAP_X + c * TILE, MAP_Y + MAP_HEIGHT);
    }
    for (let r = 0; r <= MAP_ROWS; r++) {
      g.lineBetween(MAP_X, MAP_Y + r * TILE, MAP_X + MAP_WIDTH, MAP_Y + r * TILE);
    }

    // 路径格
    for (const key of this.map.pathCells) {
      const [c, r] = key.split(',').map(Number);
      const x = MAP_X + c * TILE;
      const y = MAP_Y + r * TILE;
      g.fillStyle(COLORS.path, 1);
      g.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
      g.lineStyle(1, COLORS.pathEdge, 0.4);
      g.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
    }

    // 路径中线（方向指引）
    const wp = this.map.waypoints;
    g.lineStyle(TILE * 0.34, 0xc39a52, 0.6);
    g.beginPath();
    g.moveTo(wp[0].x, wp[0].y);
    for (let i = 1; i < wp.length; i++) g.lineTo(wp[i].x, wp[i].y);
    g.strokePath();
    g.lineStyle(2, 0xf0d9a0, 0.7);
    g.beginPath();
    g.moveTo(wp[0].x, wp[0].y);
    for (let i = 1; i < wp.length; i++) g.lineTo(wp[i].x, wp[i].y);
    g.strokePath();

    // 高地（可部署远程/策士）
    for (const [key, type] of this.map.slots) {
      if (type !== SLOT.HIGH) continue;
      const [c, r] = key.split(',').map(Number);
      const cx = MAP_X + c * TILE + TILE / 2;
      const cy = MAP_Y + r * TILE + TILE / 2;
      g.fillStyle(COLORS.highlandAlt, 0.95);
      g.fillRoundedRect(cx - TILE / 2 + 4, cy - TILE / 2 + 4, TILE - 8, TILE - 8, 8);
      g.lineStyle(2, COLORS.highlandEdge, 0.9);
      g.strokeRoundedRect(cx - TILE / 2 + 4, cy - TILE / 2 + 4, TILE - 8, TILE - 8, 8);
    }

    // 路面部署位（近战）标记
    for (const [key, type] of this.map.slots) {
      if (type !== SLOT.ROAD) continue;
      const [c, r] = key.split(',').map(Number);
      const cx = MAP_X + c * TILE + TILE / 2;
      const cy = MAP_Y + r * TILE + TILE / 2;
      g.lineStyle(2, 0x8a5a2a, 0.8);
      g.strokeCircle(cx, cy, TILE * 0.28);
      g.fillStyle(0x8a5a2a, 0.18);
      g.fillCircle(cx, cy, TILE * 0.28);
    }

    // 基地（营寨）
    const base = this.map.getBase();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(base.x - 4, base.y - 30, 56, 60, 8);
    g.fillStyle(COLORS.base, 1);
    g.fillRoundedRect(base.x - 6, base.y - 32, 52, 60, 8);
    g.lineStyle(3, COLORS.baseEdge, 1);
    g.strokeRoundedRect(base.x - 6, base.y - 32, 52, 60, 8);
    this.add.text(base.x + 20, base.y - 2, '主营', {
      fontFamily: '"PingFang SC",serif',
      fontSize: '20px',
      color: '#ffe6d8',
      stroke: '#3a1410',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(2);

    // 入口标记
    const start = this.map.getStart();
    const arrow = this.add.text(start.x + 14, start.y, '⇉', {
      fontSize: '28px',
      color: '#9a6a32',
    }).setOrigin(0.5).setDepth(2);
    this.tweens.add({ targets: arrow, x: start.x + 26, duration: 600, yoyo: true, repeat: -1 });
  }

  // ---------------- 主循环 ----------------
  update(time, delta) {
    if (this.ended) return;
    const dt = clampDt(delta / 1000);

    // 波次推进
    const aliveCount = this.enemies.reduce((n, e) => n + (e.alive ? 1 : 0), 0);
    this.waveManager.update(dt, aliveCount);
    if (this.waveManager.state === 'between') {
      this.waveManager.tickBetween(dt);
    }

    // 阻挡分配
    this._assignBlocks();

    // 更新实体
    for (const e of this.enemies) e.update(dt, this);
    for (const g of this.generals.values()) g.update(dt, this);
    for (const p of this.projectiles) p.update(dt, this);

    // 结算死亡 / 漏怪
    const remaining = [];
    for (const e of this.enemies) {
      if (e.alive) {
        remaining.push(e);
        continue;
      }
      if (e.leaked) {
        this._handleLeak(e);
      } else {
        this._handleKill(e);
      }
      e.destroy();
    }
    this.enemies = remaining;

    // 清理投射物
    if (this.projectiles.some((p) => p.dead)) {
      this.projectiles = this.projectiles.filter((p) => !p.dead);
    }

    // 清理阵亡武将
    let generalLost = false;
    for (const [key, g] of this.generals) {
      if (!g.alive) {
        g.destroy();
        this.generals.delete(key);
        generalLost = true;
      }
    }
    if (generalLost || this._bondsDirty) {
      this._recomputeBonds();
      this._bondsDirty = false;
    }

    this._checkEnd();

    // 节流推送状态
    this._stateAcc += dt;
    if (this._stateAcc >= 0.1) {
      this._stateAcc = 0;
      this._emitState();
    }
  }

  _assignBlocks() {
    for (const g of this.generals.values()) g.blockedEnemies = [];
    const melee = [];
    for (const g of this.generals.values()) {
      if (g.cls === 'MELEE' && g.alive) melee.push(g);
    }
    const rr = TILE * 1.08;
    const rr2 = rr * rr;
    for (const e of this.enemies) {
      e.blockedBy = null;
      if (!e.alive || e.progress >= this.map.length) continue;
      for (const g of melee) {
        if (g.blockedEnemies.length >= g.def.block) continue;
        const dx = e.x - g.x;
        const dy = e.y - g.y;
        if (dx * dx + dy * dy <= rr2) {
          e.blockedBy = g;
          g.blockedEnemies.push(e);
          break;
        }
      }
    }
  }

  // ---------------- 生成 / 结算 ----------------
  spawnEnemy(key) {
    const e = new Enemy(this, key, 0);
    const p = this.map.pointAt(0);
    e.container.x = p.x;
    e.container.y = p.y;
    this.enemies.push(e);
    this._emitState();
  }

  _handleKill(e) {
    this.gold += e.def.gold;
    this.morale = Math.min(100, this.morale + e.def.morale);
    this.fx.spark(e.x, e.y, e.def.color);
    this._emitState();
  }

  _handleLeak(e) {
    const loss = e.def.leakLives || 1;
    this.lives -= loss;
    this.fx.impact(this.map.getBase().x + 20, this.map.getBase().y, 60, COLORS.base);
    this._emitState();
  }

  // 敌人抵达基地（漏怪）：标记漏怪并移出存活集合，交由主循环结算扣血
  onLeak(e) {
    e.leaked = true;
    e.alive = false;
  }

  // ---------------- 部署 / 操作 ----------------
  getSlotInfoAt(px, py) {
    const { col, row } = pixelToGrid(px, py);
    if (!inBounds(col, row)) return null;
    const type = this.map.getSlot(col, row);
    if (!type) return null;
    return {
      col, row, type,
      occupied: this.generals.has(cellKey(col, row)),
    };
  }

  canPlace(id, col, row) {
    const slot = this.getSlotInfoAt(gridToPixel(col, row).x, gridToPixel(col, row).y);
    if (!slot) return false;
    const def = GENERAL_BY_ID[id];
    if (!def) return false;
    if (slotTypeForClass(def.cls) !== slot.type) return false;
    if (slot.occupied) return false;
    if (this.gold < def.cost) return false;
    // 同名武将唯一：每局每种武将仅可部署一个，避免 BondManager.byId 覆盖
    for (const g of this.generals.values()) {
      if (g.def.id === id) return false;
    }
    return true;
  }

  tryPlace(id, col, row) {
    if (!this.canPlace(id, col, row)) return false;
    const def = GENERAL_BY_ID[id];
    this.gold -= def.cost;
    const g = new General(this, def, col, row);
    this.generals.set(cellKey(col, row), g);
    this._bondsDirty = true;
    this.fx.impact(g.x, g.y, TILE * 0.8, COLORS.faction[def.faction] || COLORS.gold);
    this._emitState();
    return true;
  }

  upgradeGeneral(g) {
    if (!g || !g.alive || g.level >= MAX_LEVEL) return false;
    const cost = upgradeCost(g.def, g.level);
    if (this.gold < cost) return false;
    this.gold -= cost;
    g.upgrade();
    this._bondsDirty = true;
    this.fx.impact(g.x, g.y, TILE * 0.9, COLORS.gold);
    this._emitState();
    return true;
  }

  retreatGeneral(g) {
    if (!g || !g.alive) return false;
    const refund = retreatRefund(g.def, g.level);
    this.gold += refund;
    const key = cellKey(g.col, g.row);
    g.destroy();
    this.generals.delete(key);
    this._bondsDirty = true;
    this._emitState();
    return refund;
  }

  useUltimate() {
    if (this.morale < ULT_COST || this.ended) return false;
    this.morale -= ULT_COST;
    this.fx.fireAssault(this.map.waypoints);
    for (const e of this.enemies) {
      if (!e.alive) continue;
      e.takeDamage(ULT_DAMAGE, 'MAGIC');
      e.applyBurn(40, 3);
    }
    this._emitState();
    return true;
  }

  startNextWave() {
    // 仅波间空档"提前迎战"才发放奖励，第一波（idle）正常开始不计
    const wasBetween = this.waveManager.state === 'between';
    const started = this.waveManager.startNextWave();
    if (started && wasBetween) {
      this.gold += EARLY_BONUS;
      this._emitState();
    }
    return started;
  }

  // 选中武将（由 UIScene 调用，控制射程显示）
  selectGeneral(g) {
    if (this._selected) this._selected.setShowRange(false);
    this._selected = g || null;
    if (g) g.setShowRange(true);
    this._drawSelection();
  }

  _drawSelection() {
    this.selectionGfx.clear();
    if (!this._selected || !this._selected.alive) return;
    const g = this._selected;
    this.selectionGfx.lineStyle(3, COLORS.gold, 0.9);
    this.selectionGfx.strokeCircle(g.x, g.y, TILE * 0.42);
  }

  getGeneralAt(px, py) {
    let best = null;
    let bestD = TILE * 0.46;
    for (const g of this.generals.values()) {
      if (!g.alive) continue;
      const d = dist(px, py, g.x, g.y);
      if (d <= bestD) {
        bestD = d;
        best = g;
      }
    }
    return best;
  }

  spawnProjectile(x, y, target, opts) {
    const p = new Projectile(this, x, y, target, opts);
    this.projectiles.push(p);
  }

  _recomputeBonds() {
    const list = [...this.generals.values()].filter((g) => g.alive);
    this.bondManager.recompute(list);
    for (const g of list) g.refreshBonds();
  }

  // ---------------- 胜负 ----------------
  _checkEnd() {
    if (this.ended) return;
    if (this.lives <= 0) {
      this.lives = 0;
      return this._endGame('lose');
    }
    if (this.waveManager.state === 'cleared' && this.enemies.length === 0) {
      this._endGame('win');
    }
  }

  _endGame(result) {
    if (this.ended) return;
    this.ended = true;
    this.result = result;
    this.registry.set('result', result);
    this.registry.set('levelKey', this.levelKey);
    this.scene.launch('GameOverScene');
    this.scene.pause();
    this.scene.pause('UIScene');
  }

  // ---------------- 状态广播 ----------------
  _emitState() {
    this.events.emit('state', {
      gold: Math.floor(this.gold),
      lives: this.lives,
      maxLives: this.maxLives,
      morale: Math.floor(this.morale),
      ultCost: ULT_COST,
      ultReady: this.morale >= ULT_COST,
      wave: this.waveManager.currentWaveNumber,
      totalWaves: this.waveManager.totalWaves,
      waveState: this.waveManager.state,
      betweenRemaining: this.waveManager.betweenRemaining,
      enemiesAlive: this.enemies.reduce((n, e) => n + (e.alive ? 1 : 0), 0),
      bonds: this.bondManager.active.map((b) => ({ id: b.id, name: b.name, desc: b.desc })),
      deployedCount: this.generals.size,
    });
  }

  _cleanup() {
    this.selectGeneral(null);
  }

  get ULT_COST() { return ULT_COST; }

  // 部署悬停高亮（由 UIScene 拖拽时调用）
  setHover(col, row, valid) {
    this.hoverGfx.clear();
    if (col == null || row == null) return;
    const x = MAP_X + col * TILE;
    const y = MAP_Y + row * TILE;
    const c = valid ? COLORS.valid : COLORS.invalid;
    const c2 = valid ? 0x2f9e3a : 0xb13b3b;
    this.hoverGfx.fillStyle(c, 0.35);
    this.hoverGfx.fillRoundedRect(x + 3, y + 3, TILE - 6, TILE - 6, 6);
    this.hoverGfx.lineStyle(3, c2, 0.95);
    this.hoverGfx.strokeRoundedRect(x + 3, y + 3, TILE - 6, TILE - 6, 6);
  }

  clearHover() {
    this.hoverGfx.clear();
  }
}
