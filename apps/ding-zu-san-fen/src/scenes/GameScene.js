import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, TILE, MAP_COLS, MAP_ROWS, MAP_X, MAP_Y, MAP_WIDTH, MAP_HEIGHT,
  COLORS, gridToPixel, pixelToGrid, cellKey, inBounds, dist, clampDt, slotTypeForClass, SLOT,
} from '../config.js';
import { LEVELS } from '../data/levels.js';
import { GENERAL_BY_ID, upgradeCost, retreatRefund, MAX_LEVEL } from '../data/generals.js';
import { starOf } from '../data/meta.js';
import { saveBattle, loadBattle, clearBattle } from '../data/save.js';
import MapManager from '../managers/MapManager.js';
import WaveManager from '../managers/WaveManager.js';
import BondManager from '../managers/BondManager.js';
import Enemy from '../entities/Enemy.js';
import General from '../entities/General.js';
import Projectile from '../entities/Projectile.js';
import Fx from '../utils/Fx.js';
import audio from '../audio/Audio.js';

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
    // resume=true 时尝试从存档恢复该关卡的最近一次安全检查点
    this._resume = !!(data && data.resume);
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
    this._lastWaveState = null;
    this._suppressEarlyBonus = false;

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

    // 存档恢复：若有匹配的快照，回到最近一次"波间空档/开局布阵"检查点
    this._resume && this._restoreFromSave();
    this._resume = false;
    // 存档在部署/波间等"有意义动作"时才写入，避免刚进关卡尚未操作
    // 就出现无意义的"继续上次出征"。

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

    // 基地（主营营寨）—— 位于路径终点（底部）
    const base = this.map.getBase();
    const bw = 58;
    const bh = 46;
    g.fillStyle(0x000000, 0.32);
    g.fillRoundedRect(base.x - bw / 2 + 2, base.y - bh / 2 + 4, bw, bh, 8);
    g.fillStyle(COLORS.base, 1);
    g.fillRoundedRect(base.x - bw / 2, base.y - bh / 2, bw, bh, 8);
    g.lineStyle(3, COLORS.baseEdge, 1);
    g.strokeRoundedRect(base.x - bw / 2, base.y - bh / 2, bw, bh, 8);
    // 旗杆 + 旗帜
    g.lineStyle(3, 0xeae0cc, 1);
    g.lineBetween(base.x - 12, base.y - bh / 2 + 4, base.x - 12, base.y - bh / 2 - 22);
    g.fillStyle(COLORS.gold, 1);
    g.fillTriangle(
      base.x - 12, base.y - bh / 2 - 22,
      base.x - 12, base.y - bh / 2 - 8,
      base.x + 8, base.y - bh / 2 - 15,
    );
    this.add.text(base.x, base.y, '主营', {
      fontFamily: '"PingFang SC",serif',
      fontSize: '20px',
      color: '#ffe6d8',
      stroke: '#3a1410',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(2);

    // 入口标记（顶部，敌军自上而下入场）
    const start = this.map.getStart();
    const arrow = this.add.text(start.x, MAP_Y - 14, '▼', {
      fontSize: '28px',
      color: '#c89238',
    }).setOrigin(0.5).setDepth(2);
    this.tweens.add({ targets: arrow, y: MAP_Y - 2, duration: 600, yoyo: true, repeat: -1 });
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

    // 波次进入"波间空档"（无存活敌军的干净检查点）→ 更新存档快照
    const ws = this.waveManager.state;
    if (ws !== this._lastWaveState) {
      this._lastWaveState = ws;
      if (ws === 'between') this._saveBattle();
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
    audio.play('kill');
    this._emitState();
  }

  _handleLeak(e) {
    const loss = e.def.leakLives || 1;
    // 即时夹紧至 0，避免 BOSS 漏怪(leakLives 5/8)导致 _emitState 推送负 lives（同帧 _checkEnd 才夹紧）
    this.lives = Math.max(0, this.lives - loss);
    this.fx.impact(this.map.getBase().x + 20, this.map.getBase().y, 60, COLORS.base);
    audio.play('hurt');
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
    const g = new General(this, def, col, row, starOf(id));
    this.generals.set(cellKey(col, row), g);
    this._bondsDirty = true;
    this.fx.impact(g.x, g.y, TILE * 0.8, COLORS.faction[def.faction] || COLORS.gold);
    audio.play('place');
    this._emitState();
    // 非战斗中（布阵/波间）部署会改变可恢复状态 → 更新存档快照
    if (this.waveManager.state !== 'running') this._saveBattle();
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
    audio.play('coin');
    this._emitState();
    if (this.waveManager.state !== 'running') this._saveBattle();
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
    audio.play('click');
    this._emitState();
    if (this.waveManager.state !== 'running') this._saveBattle();
    return refund;
  }

  // 恢复存档时重建武将（不扣费、不触发部署动画），并恢复其战场等级
  _placeRestored(id, col, row, level) {
    const def = GENERAL_BY_ID[id];
    if (!def) return null;
    const key = cellKey(col, row);
    if (this.generals.has(key)) return null;
    if (this.map.getSlot(col, row) !== slotTypeForClass(def.cls)) return null;
    const g = new General(this, def, col, row, starOf(id));
    if (level && level > 1) g.applySavedLevel(level);
    this.generals.set(key, g);
    return g;
  }

  useUltimate() {
    if (this.morale < ULT_COST || this.ended) return false;
    this.morale -= ULT_COST;
    this.fx.fireAssault(this.map.waypoints);
    audio.play('ult');
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
    if (started) {
      audio.play('wave');
      // 续战后首次开波不再发放"提前迎战"奖励：该奖励属于本局推进，
      // 避免反复"续战→开波→退出"刷取 EARLY_BONUS 金币
      if (wasBetween && !this._suppressEarlyBonus) {
        this.gold += EARLY_BONUS;
      }
      this._suppressEarlyBonus = false;
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
    // 战局已结束 → 清除存档，避免菜单出现无意义的"继续"
    clearBattle();
    audio.play(result === 'win' ? 'win' : 'lose');
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

  // ---------------- 存档 / 恢复 ----------------
  // 快照当前可恢复状态（仅在无存活敌军的检查点调用）
  _saveBattle() {
    if (this.ended) return;
    try {
      const deployed = [];
      for (const g of this.generals.values()) {
        if (g.alive) deployed.push({ id: g.def.id, col: g.col, row: g.row, level: g.level });
      }
      saveBattle({
        levelKey: this.levelKey,
        waveIndex: this.waveManager.waveIndex,
        lives: this.lives,
        gold: Math.floor(this.gold),
        morale: Math.floor(this.morale),
        deployed,
      });
    } catch {
      /* 存档失败不影响游玩 */
    }
  }

  // 从存档恢复：回到最近一次"波间空档/开局布阵"检查点，重建武将与状态
  // 返回是否成功恢复（失败则按全新对局处理）
  _restoreFromSave() {
    const snap = loadBattle();
    if (!snap || snap.levelKey !== this.levelKey) return false;
    try {
      this.gold = Math.max(0, Math.floor(snap.gold));
      this.lives = Math.max(0, Math.min(this.maxLives, Math.floor(snap.lives)));
      this.morale = Math.max(0, Math.floor(snap.morale));
      // 回到检查点：waveIndex 为"已结束"的波，state 置为 between 以待下一波
      // 限制在 [-1, 总波数-2]：保证 between 之后总有下一波可开，避免无波可出的软锁
      const wi = Math.max(-1, Math.min(this.waveManager.totalWaves - 2, Math.floor(snap.waveIndex)));
      this.waveManager.waveIndex = wi;
      if (wi < 0) {
        this.waveManager.state = 'idle';
      } else {
        this.waveManager.state = 'between';
        this.waveManager.betweenDelay = 4.0;
      }
      this._lastWaveState = this.waveManager.state;
      // 续战后首次开波抑制 EARLY_BONUS，防止刷金币
      this._suppressEarlyBonus = true;
      // 重建已部署武将
      for (const d of snap.deployed) {
        this._placeRestored(d.id, d.col, d.row, d.level);
      }
      this._bondsDirty = true;
      this._recomputeBonds();
      return true;
    } catch {
      return false;
    }
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
