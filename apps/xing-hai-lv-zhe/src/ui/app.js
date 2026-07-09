// ============================================================================
// 星骸旅者 · UI 渲染模块（UI Renderer，纯原生 DOM + CSS 像素网格）
// 状态机：BOOT(launcher) → MAP → BATTLE → INVENTORY / EVENT → 结局。
// 负责：启动器/创角、像素地图渲染与点击移动、猜拳战斗、背包(装备/天赋/剧情)、
// 随机事件、双重结局、多槽位存档。requestAnimationFrame 驱动战斗计时与闲置回精。
// ============================================================================
import './style.css';
import { h, clear, bar } from './dom.js';
import {
  PALETTE, GRID, VISION_RADIUS, TILES, tileOf, isWalkable,
  EQUIP_SLOTS, MAX_PLUS, AFFIX_AT, AFFIXES, enhanceCost,
  TALENTS, TALENT_BY_BRANCH, talentCost,
  STAMINA_COST_PER_ROUND, STAMINA_REGEN_PER_STEP, STAMINA_REGEN_INTERVAL_MS, STAMINA_TIRED,
  SHOP_ITEMS, DRONE_COST, EVENT_META, MEMORY_CHAPTERS, STORY, ENDINGS, MAX_FLOOR, expToNext,
} from '../config.js';
import {
  newPlayer, migrate, maxHp, maxStamina, effectiveAtk, effectiveDef, effectiveMoveRange,
  enhanceEquipment, buyTalent, resetTalents, gainReward, healFull, regenStamina, spendStamina,
  isDead, collectMemory, collectedMemoryCount,
} from '../core/player.js';
import {
  generateFloor, findPath, reachableTiles, entityAt, removeEntity, tileAt, descend,
} from '../core/world.js';
import {
  STANCES, ACTIONS, COUNTERS, TELEGRAPH_CHANCE,
  pickEnemyStance, isTelegraphed, autoPickAction, resolveRound, enemyReward,
} from '../core/battle.js';
import {
  saveToSlot, loadFromSlot, deleteSlot, listSaves, hasAnySave, latestSlot,
  exportSave, importSave, SAVE_SLOTS,
} from '../core/save.js';

const BATTLE_TIME_MS = 3000;       // 每回合限时（可于设置关闭）
const IDLE_FRAME_MS = 1000 / 20;   // 闲置降帧至 ~20fps 节省电量

export class GameUI {
  constructor(parent) {
    this.parent = parent;
    this.player = null;
    this.rng = Math.random;
    this.screen = 'launcher';
    this.over = false;
    this.activeSlot = null;
    this.timerEnabled = true;      // 战斗限时（测试可关闭）
    this._sheet = null;
    this.charName = '';
    this.cellNodes = [];           // 2D 地块 DOM 引用（脏更新）
    this.floatLayer = null;
    this.running = false;          // rAF 循环开关
    this._raf = 0;
    this._lastFrame = 0;
    this._staminaAccum = 0;
    this.battle = null;            // 战斗会话状态
  }

  mount() {
    this.root = h('div', { class: 'xhlz' });
    clear(this.parent);
    this.parent.appendChild(this.root);
    this.toastWrap = h('div', { class: 'toast-wrap' });
    this.stage = h('div', { class: 'xhlz-stage' });
    this.modalRoot = h('div', { class: 'xhlz-modals' });
    this.root.append(this.toastWrap, this.stage, this.modalRoot);
    this.showLauncher();
    return this;
  }

  // ===================== 启动器 =====================
  showLauncher() {
    this.screen = 'launcher';
    this.over = false;
    this.player = null;
    this.battle = null;
    this.activeSlot = null;
    this.stopLoop();
    clear(this.modalRoot);
    clear(this.stage);
    const hasSave = hasAnySave();
    const wrap = h('div', { class: 'launcher' },
      h('div', { class: 'launcher__brand' },
        h('div', { class: 'emblem' }, '星'),
        h('h1', null, '星骸旅者'),
        h('p', { class: 'sub' }, '开罗式像素 Roguelike · 在破碎星球拾荒、战斗、寻回记忆'),
      ),
      h('div', { class: 'launcher__actions' },
        hasSave
          ? h('button', { class: 'btn-primary big-btn', onClick: () => this.continueGame() }, '▶ 继续旅程')
          : h('button', { class: 'btn-primary big-btn', onClick: () => this.showCreate() }, '🚀 开启新旅程'),
        hasSave
          ? h('button', { class: 'btn-ghost', onClick: () => this.showCreate() }, '🆕 新旅程（选空槽）')
          : null,
        h('button', { class: 'btn-ghost', onClick: () => this.showSlots(true) }, '📂 存档管理'),
        h('button', { class: 'btn-ghost', onClick: () => this.showAbout() }, '📖 关于 / 玩法'),
      ),
      h('p', { class: 'launcher__hint muted' }, '点击地块移动，靠近敌人即可交战；集齐 10 枚星骸回响，揭开星球的真相。'),
    );
    this.stage.appendChild(wrap);
  }

  continueGame() {
    const slot = latestSlot();
    if (slot == null) { this.toast('没有可继续的存档', 'bad'); this.showLauncher(); return; }
    const p = loadFromSlot(slot);
    if (!p) { this.toast('读取存档失败', 'bad'); this.showLauncher(); return; }
    if (p.ending) { this.renderEnding(p.ending, true, p); return; }
    if (isDead(p)) { this.player = p; this.activeSlot = slot; this.gameOver(); return; } // 陨落档直接展示终结画面，避免「继续」瞬间又死亡
    this.enterGame(p, slot);
  }

  showAbout() {
    const body = [
      h('div', { class: 'card' },
        h('h4', null, '🎮 核心循环'),
        h('div', { class: 'muted', style: { lineHeight: 1.7 } },
          '浮岛探索（点击移动）→ 触发战斗 / 宝箱 / 陷阱 → 回到背包消耗零件强化装备、用星骸点亮天赋 → 挑战更深层浮岛。'),
      ),
      h('div', { class: 'card' },
        h('h4', null, '⚔️ 战斗：猜拳克制'),
        h('div', { class: 'muted', style: { lineHeight: 1.7 } },
          '敌人摆出 突刺🗡️ / 横斩🌀 / 重击💥；你选 格挡🛡️ / 闪避💨 / 反击⚔️。',
          h('br'),
          '反击克突刺、格挡克横斩、闪避克重击。成功克制 → 下一击专注力 ×1.5。精力过低会失手；可开启自动战斗代打。'),
      ),
      h('div', { class: 'card' },
        h('h4', null, '💎 成长'),
        h('div', { class: 'muted', style: { lineHeight: 1.7 } },
          '武器/护甲/推进器消耗「零件」强化，+5 触发词缀变异；天赋树三条分支（生存/战斗/幸运）消耗「星骸」点亮，可免费重置。'),
      ),
    ];
    this.showSheet({ title: '📖 关于 / 玩法', body, foot: [h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '明白')] });
  }

  // ===================== 存档管理（多槽位）=====================
  showSlots(fromLauncher) {
    const list = listSaves();
    const body = [
      h('div', { class: 'muted', style: { marginBottom: '0.5rem' } },
        `共 ${SAVE_SLOTS} 个存档槽位。点击空槽可在此开始新旅程，已有存档可读取或删除。`),
      h('div', { class: 'slot-list' }, list.map((s) => this.renderSlotRow(s))),
    ];
    const foot = [
      fromLauncher ? null : h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '关闭'),
      h('button', { class: 'btn-primary', onClick: () => { this.closeModal(); this.showCreate(); } }, '🆕 新旅程'),
    ];
    this.showSheet({ title: '📂 存档管理', body, foot: foot.filter(Boolean) });
  }

  renderSlotRow(s) {
    const head = s.exists
      ? h('div', { class: 'slot-info' },
          h('div', { class: 'slot-name' }, `${s.name || '旅者'}${s.ending ? '  · 已通关' : s.dead ? ' · 已陨落' : ''}`),
          h('div', { class: 'slot-meta' }, `第 ${s.floor || 1} 层 · 最深 ${s.maxFloor || 1} · Lv${s.level || 1} · 💎${s.memoryCount || 0}/10 · ✨${s.stardust || 0}`),
        )
      : h('div', { class: 'slot-info' }, h('div', { class: 'muted' }, '空槽位'));
    const actions = h('div', { class: 'slot-actions' },
      s.exists
        ? [
            h('button', { class: 'btn-primary slot-act', onClick: () => this.loadSlot(s.slot) }, '读取'),
            h('button', { class: 'btn-ghost slot-act', onClick: () => this.confirmDeleteSlot(s.slot) }, '🗑️'),
          ]
        : h('button', { class: 'btn-jade slot-act', onClick: () => { this.closeModal(); this.showCreate(s.slot); } }, '在此开始'),
    );
    return h('div', { class: `slot-row ${s.exists ? '' : 'empty'}`, dataset: { slot: s.slot } },
      h('span', { class: 'slot-no' }, `#${s.slot + 1}`), head, actions);
  }

  loadSlot(slot) {
    const p = loadFromSlot(slot);
    if (!p) { this.toast('读取失败', 'bad'); return; }
    this.closeModal();
    if (p.ending) { this.renderEnding(p.ending, true, p); return; }
    if (isDead(p)) { this.player = p; this.activeSlot = slot; this.gameOver(); return; } // 陨落档：避免读取后再次瞬间死亡
    this.enterGame(p, slot);
  }

  confirmDeleteSlot(slot) {
    this.showSheet({
      title: '删除该存档？',
      body: [h('div', { class: 'muted' }, `将永久删除 #${slot + 1} 号槽位的存档，无法恢复。`)],
      foot: [
        h('button', { class: 'btn-danger', onClick: () => { deleteSlot(slot); this.closeModal(); this.toast('存档已删除'); this.showSlots(this.screen === 'launcher'); } }, '确认删除'),
        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '取消'),
      ],
    });
  }

  // ===================== 创角 =====================
  showCreate(preferSlot) {
    this.screen = 'create';
    this.stopLoop();
    this._preferSlot = Number.isInteger(preferSlot) ? preferSlot : null;
    clear(this.modalRoot);
    clear(this.stage);
    this.renderCreate();
  }

  renderCreate() {
    clear(this.stage);
    const wrap = h('div', { class: 'launcher' });
    wrap.append(
      h('div', { class: 'create__head' },
        h('button', { class: 'btn-ghost', onClick: () => this.showLauncher() }, '← 返回'),
        h('h1', null, '开启新旅程'),
      ),
      h('div', { class: 'card' },
        h('h4', null, '姓名'),
        h('input', { class: 'name-input', dataset: { id: 'name' }, maxlength: 8, placeholder: '旅者（可留空）', value: this.charName || '' }),
        h('div', { class: 'muted', style: { marginTop: '0.3rem' } }, '为这位拾荒者取个名字。每个浮岛都藏着一枚记忆碎片，等着被你寻回。'),
      ),
      h('div', { class: 'create__foot' },
        h('button', { class: 'btn-primary big-btn', onClick: () => this.confirmCreate() }, '🚀 迫降墨比乌斯'),
      ),
    );
    this.stage.appendChild(wrap);
    const inp = wrap.querySelector('[data-id="name"]');
    if (inp) inp.addEventListener('input', () => { this.charName = inp.value; });
  }

  confirmCreate() {
    const name = (this.charName || '').trim().slice(0, 8);
    const p = newPlayer(this.rng, { name });
    const slot = this.pickSlotForNewSave();
    // 全槽位已满时 pickSlotForNewSave 会返回最久未玩档（已存在）→ 覆盖前二次确认，避免误删旧档。
    const target = listSaves()[slot];
    if (target && target.exists) {
      this.confirmOverwriteSlot(slot, () => this.finalizeCreate(p, slot));
      return;
    }
    this.finalizeCreate(p, slot);
  }

  finalizeCreate(p, slot) {
    this.activeSlot = slot;
    p.floorState = generateFloor(this.rng, p.floor, p);
    this.enterGame(p, slot);
    this.pushLog(STORY.prologue, 'milestone');
    saveToSlot(this.activeSlot, this.player); // 序章写入后补存，避免重载前首条故事丢失
    this.toast(`已保存到 #${slot + 1} 号槽位`, 'good');
  }

  confirmOverwriteSlot(slot, onConfirm) {
    this.showSheet({
      title: '覆盖该存档？',
      body: [h('div', { class: 'muted' }, `所有槽位已满，新旅程将覆盖 #${slot + 1} 号槽位（最久未玩）的存档，无法恢复。`)],
      foot: [
        h('button', { class: 'btn-danger', onClick: () => { this.closeModal(); onConfirm(); } }, '确认覆盖'),
        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '取消'),
      ],
    });
  }

  pickSlotForNewSave() {
    const prefer = this._preferSlot;
    const list = listSaves();
    if (Number.isInteger(prefer) && prefer >= 0 && prefer < SAVE_SLOTS && !list[prefer].exists) return prefer;
    const empty = list.find((s) => !s.exists);
    if (empty) return empty.slot;
    list.sort((a, b) => (a.lastSeen || 0) - (b.lastSeen || 0));
    return list[0].slot;
  }

  // ===================== 进入游戏 =====================
  enterGame(player, slot) {
    this.player = player;
    this.activeSlot = Number.isInteger(slot) ? slot : (this.activeSlot != null ? this.activeSlot : 0);
    this.screen = 'game';
    this.over = false;
    this.battle = null;
    // 存档无楼层快照（旧档 / 损坏）→ 重新生成当前层。
    if (!this.player.floorState) this.player.floorState = generateFloor(this.rng, this.player.floor, this.player);
    this.buildGame();
    this.refreshStatus();
    this.renderMap();
    this.refreshInteract();
    saveToSlot(this.activeSlot, this.player);
    this.startLoop();
    if (isDead(this.player)) this.gameOver();
  }

  buildGame() {
    clear(this.stage);
    clear(this.modalRoot);
    const game = h('div', { class: 'xhlz-game' });
    this.statusEl = h('div', { class: 'status-bar' });
    const mapWrap = h('div', { class: 'map-wrap' },
      this.floatLayer = h('div', { class: 'float-layer' }),
      h('div', { class: 'map-frame' }, h('div', { class: 'map-grid', onClick: (e) => this.onMapTap(e) })),
    );
    this.bottomBar = h('div', { class: 'bottom-bar' });
    game.append(this.statusEl, mapWrap, this.bottomBar);
    this.stage.appendChild(game);
    this.gridEl = mapWrap.querySelector('.map-grid');
    this.buildStatus();
    this.buildMap();
    this.buildBottomBar();
  }

  // —— 顶部状态栏 ——
  buildStatus() {
    clear(this.statusEl);
    const p = this.player;
    this.hpFill = h('div', { class: 'bl-fill', style: { background: PALETTE.hp } });
    this.hpVal = h('span', { class: 'bl-val' }, `${p.hp}/${maxHp(p)}`);
    this.staFill = h('div', { class: 'bl-fill', style: { background: PALETTE.teal } });
    this.staVal = h('span', { class: 'bl-val' }, `${p.stamina}/${maxStamina()}`);
    this.statusEl.append(
      h('div', { class: 'status-top' },
        h('span', { class: 'status-name' }, p.name),
        h('span', { class: 'status-lv' }, `Lv${p.level}`),
        h('span', { class: 'status-floor' }, '第 ', h('b', null, String(p.floor)), ` / ${MAX_FLOOR} 层`),
        h('span', { class: 'status-res' },
          h('span', { class: 'r' }, h('span', null, '✨'), this.sdEl = h('span', null, String(p.stardust))),
          h('span', { class: 'r' }, h('span', null, '🔩'), this.ptEl = h('span', null, String(p.parts))),
        ),
      ),
      h('div', { class: 'status-bars' },
        h('div', { class: 'barline' }, h('span', { class: 'bl-icon' }, '❤️'), h('div', { class: 'bl-track' }, this.hpFill), this.hpVal),
        h('div', { class: 'barline' }, h('span', { class: 'bl-icon' }, '⚡'), h('div', { class: 'bl-track' }, this.staFill), this.staVal),
      ),
    );
  }

  refreshStatus() {
    const p = this.player;
    if (!p || !this.hpFill) return;
    this.hpFill.style.width = `${(p.hp / maxHp(p)) * 100}%`;
    this.hpVal.textContent = `${p.hp}/${maxHp(p)}`;
    this.staFill.style.width = `${(p.stamina / maxStamina()) * 100}%`;
    this.staVal.textContent = `${p.stamina}/${maxStamina()}`;
    const nameEl = this.statusEl.querySelector('.status-name');
    if (nameEl) nameEl.textContent = p.name;
    const lvEl = this.statusEl.querySelector('.status-lv');
    if (lvEl) lvEl.textContent = `Lv${p.level}`;
    const floorB = this.statusEl.querySelector('.status-floor b');
    if (floorB) floorB.textContent = String(p.floor);
    if (this.sdEl) this.sdEl.textContent = String(p.stardust);
    if (this.ptEl) this.ptEl.textContent = String(p.parts);
  }

  // —— 像素地图 ——
  buildMap() {
    clear(this.gridEl);
    this.cellNodes = [];
    for (let y = 0; y < GRID; y++) {
      const row = [];
      for (let x = 0; x < GRID; x++) {
        const cell = h('div', { class: 'cell fog', dataset: { x: String(x), y: String(y) } });
        this.gridEl.appendChild(cell);
        row.push(cell);
      }
      this.cellNodes.push(row);
    }
  }

  state() { return this.player.floorState; }

  renderMap() {
    const st = this.state();
    if (!st) return;
    const pos = st.pos;
    const reach = this.screen === 'game' && !this._sheet ? reachableTiles(st, pos, effectiveMoveRange(this.player)) : new Set();
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const cell = this.cellNodes[y][x];
        const k = `${x},${y}`;
        const explored = !!st.explored[k];
        const visible = isVisible(x, y, pos);
        const tileId = tileAt(st, x, y);
        const ent = entityAt(st, x, y);
        let cls = 'cell';
        if (!explored && !visible) cls += ' fog';
        else if (!visible) cls += ' dim';
        else cls += ' visible';
        const isPlayer = pos.x === x && pos.y === y;
        if (isPlayer) cls += ' player';
        if (tileId === 'stairs') cls += ' stairs';
        if (reach.has(k) && !isPlayer) cls += ' reachable';
        cell.className = cls;
        // 背景：地块色（玩家格叠加蓝色调）
        if (!explored && !visible) {
          cell.style.background = '';
        } else {
          cell.style.background = isPlayer
            ? `linear-gradient(rgba(77,150,255,0.45), rgba(77,150,255,0.45)), ${tileOf(tileId).color}`
            : tileOf(tileId).color;
        }
        // 实体 emoji（陷阱不显示——踩到才发现）
        let emoji = '';
        if (visible || explored) {
          if (isPlayer) emoji = '🧑‍🚀';
          else if (ent) emoji = entityEmoji(ent, tileId);
        }
        // 仅在内容变化时更新，减少重排
        const cur = cell.firstChild;
        if (emoji) {
          if (!cur || cur.textContent !== emoji) {
            if (cur) cur.remove();
            cell.appendChild(h('span', { class: 'ent' }, emoji));
          }
        } else if (cur) {
          cur.remove();
        }
        cell.dataset.x = String(x);
        cell.dataset.y = String(y);
      }
    }
  }

  // —— 移动：点击地块 ——
  onMapTap(e) {
    if (this.screen !== 'game' || this._sheet) return;
    const cell = e.target.closest('.cell');
    if (!cell) return;
    const x = Number(cell.dataset.x), y = Number(cell.dataset.y);
    this.tryMoveTo(x, y);
  }

  tryMoveTo(tx, ty) {
    const st = this.state();
    if (!st) return;
    if (st.pos.x === tx && st.pos.y === ty) { this.refreshInteract(); return; }
    const ent = entityAt(st, tx, ty);
    if (ent && ent.type === 'enemy') { this.toast('靠近敌人后用「攻击」交战', 'normal'); return; }
    if (!isWalkable(tileAt(st, tx, ty))) { this.toast('那里无法通行', 'normal'); return; }
    const range = effectiveMoveRange(this.player);
    const path = findPath(st, st.pos, { x: tx, y: ty }, range);
    if (!path || !path.length) { this.toast('超出移动步数', 'normal'); return; }
    this.walkPath(path);
  }

  // 沿路径行走，逐格结算（遇交互实体则停下）。
  walkPath(path) {
    const st = this.state();
    for (const step of path) {
      st.pos = { x: step.x, y: step.y };
      this.player.turn += 1;
      regenStamina(this.player, STAMINA_REGEN_PER_STEP);
      this.revealAround();
      const ent = entityAt(st, step.x, step.y);
      if (ent) {
        this.renderMap();
        this.refreshStatus();
        this.refreshInteract();
        saveToSlot(this.activeSlot, this.player);
        if (this.resolveEntity(ent)) return; // 进入战斗 / 弹窗则终止移动
      }
    }
    this.renderMap();
    this.refreshStatus();
    this.refreshInteract();
    saveToSlot(this.activeSlot, this.player);
  }

  revealAround() {
    const st = this.state();
    for (const k of visibleKeysList(st, st.pos.x, st.pos.y)) st.explored[k] = true;
  }

  // 踩到交互实体：返回 true 表示已切入战斗 / 弹窗，应中止移动。
  resolveEntity(ent) {
    const st = this.state();
    if (ent.type === 'chest') {
      const r = ent.reward || {};
      // 用 gainReward 的实发量（含幸运加成）展示，避免飘字与状态栏不一致。
      const g = gainReward(this.player, r, this.rng);
      removeEntity(st, ent.id);
      this.floatAt(ent.x, ent.y, `+✨${g.stardust} 🔩${g.parts}`, 'gold');
      this.pushLog(`🎁 拾得宝箱：${g.stardust ? `✨${g.stardust} ` : ''}${g.parts ? `🔩${g.parts}` : ''}`, 'good');
      this.toast('拾得宝箱', 'good');
      this.refreshStatus();
      return false;
    }
    if (ent.type === 'memory') {
      const res = collectMemory(this.player, ent.chapter);
      removeEntity(st, ent.id);
      if (res.ok) {
        this.floatAt(ent.x, ent.y, '💎 记忆', 'gold');
        this.pushLog(`💎 寻回星骸回响：${MEMORY_CHAPTERS[res.chapter].title}`, 'milestone');
        this.refreshStatus();
        saveToSlot(this.activeSlot, this.player);
        this.showChapter(res.chapter);
        return true;
      }
      return false;
    }
    if (ent.type === 'trap') {
      // 一次性陷阱：触发即消失。先移除再传送，teleport() 内的 saveToSlot 会落盘移除结果，
      // 否则陷阱（emoji '' 不可见）会永久残留于地图。
      removeEntity(st, ent.id);
      this.teleport();
      return true;
    }
    if (ent.type === 'merchant') { this.showMerchant(); return true; }
    if (ent.type === 'drone') { this.showDrone(); return true; }
    return false;
  }

  // 重力陷阱：传送到随机可达地块。
  teleport() {
    const st = this.state();
    const reach = [...reachableTiles(st, st.pos, 99)];
    const choices = reach.filter((k) => {
      const [x, y] = k.split(',').map(Number);
      return !(x === st.pos.x && y === st.pos.y) && !entityAt(st, x, y);
    });
    const pool = choices.length ? choices : reach;
    const k = pool[Math.floor(this.rng() * pool.length)];
    const [nx, ny] = k.split(',').map(Number);
    st.pos = { x: nx, y: ny };
    this.revealAround();
    this.shake();
    this.pushLog('🌀 触发重力陷阱！空间扭曲，你被抛向未知之处。', 'bad');
    this.toast('重力陷阱！被传送', 'bad');
    this.renderMap();
    this.refreshStatus();
    this.refreshInteract();
    saveToSlot(this.activeSlot, this.player);
  }

  // —— 方向键单步移动 ——
  dpadMove(dx, dy) {
    if (this.screen !== 'game' || this._sheet) return;
    const st = this.state();
    const nx = st.pos.x + dx, ny = st.pos.y + dy;
    this.tryMoveTo(nx, ny);
  }

  // —— 中央交互键（随上下文动态）——
  buildBottomBar() {
    clear(this.bottomBar);
    const dpad = h('div', { class: 'dpad' },
      h('button', { class: 'd-up', onClick: () => this.dpadMove(0, -1) }, '▲'),
      h('button', { class: 'd-left', onClick: () => this.dpadMove(-1, 0) }, '◀'),
      h('button', { class: 'd-center', onClick: () => this.refreshInteract() }, '·'),
      h('button', { class: 'd-right', onClick: () => this.dpadMove(1, 0) }, '▶'),
      h('button', { class: 'd-down', onClick: () => this.dpadMove(0, 1) }, '▼'),
    );
    this.interactBtn = h('button', { class: 'btn-primary interact-btn', onClick: () => this.doInteract() }, '🔍 调查');
    const tools = h('div', { class: 'tool-col' },
      h('button', { class: 'icon-btn', title: '背包 / 状态', onClick: () => this.openInventory() }, '🎒'),
      h('button', { class: 'icon-btn', title: '设置 / 存档', onClick: () => this.showSettings(false) }, '⚙️'),
    );
    this.bottomBar.append(dpad, h('div', { class: 'act-col' }, this.interactBtn), tools);
  }

  // 依据周围上下文刷新中央键文案与可用性。
  refreshInteract() {
    if (!this.interactBtn || this.screen !== 'game') return;
    const st = this.state();
    const adj = adjacentEnemy(st, st.pos);
    if (adj) {
      this.interactBtn.className = 'btn-danger interact-btn';
      this.interactBtn.textContent = `⚔️ 攻击·${adj.name}`;
      this.interactBtn.disabled = false;
      this._interactMode = { mode: 'attack', enemy: adj };
      return;
    }
    if (tileAt(st, st.pos.x, st.pos.y) === 'stairs') {
      this.interactBtn.className = 'btn-jade interact-btn';
      this.interactBtn.textContent = '⬇️ 下行至下一浮岛';
      this.interactBtn.disabled = false;
      this._interactMode = { mode: 'descend' };
      return;
    }
    const here = entityAt(st, st.pos.x, st.pos.y);
    if (here && (here.type === 'chest' || here.type === 'memory')) {
      this.interactBtn.className = 'btn-primary interact-btn';
      this.interactBtn.textContent = here.type === 'memory' ? '💎 拾取回响' : '🎁 拾取宝箱';
      this.interactBtn.disabled = false;
      this._interactMode = { mode: 'pickup', ent: here };
      return;
    }
    this.interactBtn.className = 'btn-ghost interact-btn';
    this.interactBtn.textContent = '🔍 调查';
    this.interactBtn.disabled = false;
    this._interactMode = { mode: 'investigate' };
  }

  doInteract() {
    if (this.screen !== 'game' || !this._interactMode) return;
    const m = this._interactMode;
    if (m.mode === 'attack') this.startBattle(m.enemy);
    else if (m.mode === 'descend') this.descendFloor();
    else if (m.mode === 'pickup') this.resolveEntity(m.ent);
    else this.toast('周围没有可交互的对象', 'normal');
  }

  descendFloor() {
    const st = this.state();
    if (tileAt(st, st.pos.x, st.pos.y) !== 'stairs') { this.toast('需站在下行阶梯上', 'normal'); return; }
    descend(this.player);
    this.player.floorState = generateFloor(this.rng, this.player.floor, this.player);
    this.pushLog(`⬇️ 降至第 ${this.player.floor} 层浮岛。`, 'milestone');
    if (this.player.floor === 3) this.pushLog(STORY.midpoint, 'milestone');
    this.refreshStatus();
    this.renderMap();
    this.refreshInteract();
    saveToSlot(this.activeSlot, this.player);
    this.toast(`进入第 ${this.player.floor} 层`, 'good');
  }

  // ===================== 战斗 =====================
  startBattle(enemyEntity) {
    if (this.screen !== 'game') return;
    this.screen = 'battle';
    this.battle = {
      enemy: enemyEntity, focus: false, auto: false, round: 0,
      stance: null, telegraphed: false, timerEnd: 0, busy: false,
    };
    clear(this.modalRoot);
    this.buildBattle();
    this.nextRound();
  }

  buildBattle() {
    clear(this.stage);
    const e = this.battle.enemy;
    const wrap = h('div', { class: 'battle' });
    this.foeEmoji = h('div', { class: 'emoji' }, e.emoji || '👾');
    this.foeName = h('div', { class: 'name' }, `${e.name}${e.boss ? ' · BOSS' : ''}`);
    this.foeHpFill = h('div', { class: 'bar__fill', style: { background: PALETTE.monster } });
    this.foeHpLabel = h('span', { class: 'bar__label' }, `${e.hp}/${e.maxHp}`);
    this.stanceChip = h('div', { class: 'stance-chip unknown' }, '敌人蓄势中…');
    this.battleLog = h('div', { class: 'battle__log' });
    this.timerFill = h('div', { class: 't', style: { width: '100%' } });
    this.actionBtns = ['block', 'dodge', 'counter'].map((a) =>
      h('button', { class: `act ${a}`, dataset: { action: a }, onClick: () => this.chooseAction(a) },
        h('div', null, ACTIONS[a].emoji), h('div', null, ACTIONS[a].name)));
    this.fleeBtn = h('button', { class: 'btn-ghost icon-btn', title: '撤退', onClick: () => this.confirmFlee() }, '🏃');
    this.autoToggle = h('button', { class: 'btn-ghost icon-btn', title: '自动战斗', onClick: () => this.toggleAuto() }, '🤖');

    this.hpFill = h('div', { class: 'bl-fill', style: { background: PALETTE.hp } });
    this.hpVal = h('span', { class: 'bl-val' }, `${this.player.hp}/${maxHp(this.player)}`);
    // 战斗屏独立浮动层（buildGame 的 floatLayer 已随 stage 清空而脱离）。
    this.floatLayer = h('div', { class: 'float-layer' });

    wrap.append(
      h('div', { class: 'battle__topbar' },
        this.fleeBtn,
        h('span', { class: 'title' }, '战斗'),
        this.autoToggle,
      ),
      h('div', { class: 'battle__foe' }, this.foeEmoji, this.foeName,
        h('div', { class: 'bar', style: { marginTop: '0.4rem' } }, this.foeHpFill, this.foeHpLabel)),
      h('div', { class: 'battle__stance' }, this.stanceChip),
      this.battleLog,
      h('div', { class: 'battle__self' },
        h('span', null, '❤️'),
        h('div', { class: 'barline', style: { flex: 1 } }, h('div', { class: 'bl-track' }, this.hpFill), this.hpVal),
      ),
      h('div', { class: 'battle__timer' }, this.timerFill),
      h('div', { class: 'battle__actions' }, this.actionBtns),
      this.floatLayer,
    );
    this.stage.appendChild(wrap);
    this.logBattle(`与 ${e.name} 交战！`, 'normal');
  }

  nextRound() {
    if (!this.battle) return;
    this.battle.round += 1;
    const stance = pickEnemyStance(this.battle.enemy, this.rng);
    const tele = isTelegraphed(this.rng);
    this.battle.stance = stance;
    this.battle.telegraphed = tele;
    this.battle.busy = false;
    // 架势展示：识破时明牌，否则「??」需盲猜。
    if (tele) {
      const s = STANCES[stance];
      this.stanceChip.className = 'stance-chip';
      this.stanceChip.textContent = `${s.emoji} 敌人摆出「${s.name}」`;
    } else {
      this.stanceChip.className = 'stance-chip unknown';
      this.stanceChip.textContent = '❓ 敌人意图难辨…';
    }
    for (const b of this.actionBtns) b.disabled = false;
    if (this.fleeBtn) this.fleeBtn.disabled = false;
    if (this.timerEnabled && !this.battle.auto) {
      this.battle.timerEnd = nowMs() + BATTLE_TIME_MS;
    } else {
      this.timerFill.style.width = '100%';
    }
    if (this.battle.auto) {
      const act = autoPickAction(stance);
      // 不预置 busy=true：chooseAction 自带 busy 守卫，预置会令其立即返回，导致自动战斗死锁。
      setTimeout(() => { if (this.battle) this.chooseAction(act); }, 320);
    }
  }

  chooseAction(action) {
    if (!this.battle || this.battle.busy) return;
    this.battle.busy = true;
    for (const b of this.actionBtns) b.disabled = true;
    if (this.fleeBtn) this.fleeBtn.disabled = true; // 结算窗口期间禁用撤退，避免与胜负结算交错
    this.resolveBattleRound(action);
  }

  resolveBattleRound(action) {
    const b = this.battle;
    const p = this.player;
    spendStamina(p, STAMINA_COST_PER_ROUND);
    const res = resolveRound(p, b.enemy, action, b.focus, b.stance, this.rng);
    b.focus = res.nextFocus;

    // 敌人受伤反馈
    if (res.enemyDmg > 0) {
      this.foeHpFill.style.width = `${(b.enemy.hp / b.enemy.maxHp) * 100}%`;
      this.foeHpLabel.textContent = `${b.enemy.hp}/${b.enemy.maxHp}`;
      this.floatAtCenter(`${res.countered ? '💥 ' : ''}-${res.enemyDmg}`, 'up');
    }
    // 玩家受伤反馈
    if (res.playerDmg > 0) { this.shake(); this.floatAtCenter(`-${res.playerDmg}`, 'down'); }
    if (res.healed > 0) this.floatAtCenter(`+${res.healed}`, 'up');
    this.hpFill.style.width = `${(p.hp / maxHp(p)) * 100}%`;
    this.hpVal.textContent = `${p.hp}/${maxHp(p)}`;

    // 战报
    const sName = STANCES[res.stance].name;
    if (res.fumble) this.logBattle(`精力不济，${ACTIONS[res.action]?.name || '应对'}失手！受到 ${res.playerDmg} 伤害。`, 'bad');
    else if (res.countered) this.logBattle(`${ACTIONS[res.action].name} 完美克制「${sName}」！造成 ${res.enemyDmg} 伤害，专注力蓄满。`, 'good');
    else this.logBattle(`${ACTIONS[res.action]?.name || '犹豫'}未能克制「${sName}」，受到 ${res.playerDmg} 伤害。`, 'bad');

    if (res.enemyDead) { setTimeout(() => { if (this.battle) this.winBattle(); }, 360); return; }
    if (res.playerDead) { setTimeout(() => { if (this.battle) this.loseBattle(); }, 360); return; }
    setTimeout(() => { if (this.battle) this.nextRound(); }, 520);
  }

  toggleAuto() {
    if (!this.battle) return;
    this.battle.auto = !this.battle.auto;
    this.autoToggle.classList.toggle('btn-jade', this.battle.auto);
    this.autoToggle.textContent = this.battle.auto ? '🤖✅' : '🤖';
    this.toast(this.battle.auto ? '自动战斗：开' : '自动战斗：关');
    if (this.battle.auto && !this.battle.busy) {
      const act = autoPickAction(this.battle.stance);
      setTimeout(() => { if (this.battle) this.chooseAction(act); }, 320);
      return;
    }
    // 关闭自动时，若正等待玩家操作，重置一个完整限时窗口。
    // 否则 timerEnd 仍停留在自动期间未更新的旧值（可能早已过期），
    // onTick 会立刻判定 remain==0 → 瞬间失手，把「关自动」误判为玩家反应不及。
    if (!this.battle.auto && this.timerEnabled && !this.battle.busy) {
      this.battle.timerEnd = nowMs() + BATTLE_TIME_MS;
    }
  }

  confirmFlee() {
    this.showSheet({
      title: '脱离战斗？',
      body: [h('div', { class: 'muted' }, '撤退会损失少量星骸，回到地图（敌人仍在）。')],
      foot: [
        h('button', { class: 'btn-danger', onClick: () => this.flee() }, '撤退'),
        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '继续战斗'),
      ],
    });
  }

  flee() {
    this.closeModal();
    const cost = Math.min(this.player.stardust, 2);
    this.player.stardust -= cost;
    this.pushLog(`🏃 撤离战斗，散落 ${cost} 星骸。`, 'normal');
    // exitBattle(false) 不落盘，此处显式保存星骸扣除，避免关浏览器后回滚。
    saveToSlot(this.activeSlot, this.player);
    this.exitBattle(false);
  }

  winBattle() {
    if (!this.battle) return; // 360ms 窗口内若已脱离战斗（撤退/卸载），丢弃本次结算
    const e = this.battle.enemy;
    const reward = enemyReward(e);
    const gained = gainReward(this.player, reward, this.rng);
    // 移除地图上的敌人实体
    removeEntity(this.state(), e.id);
    this.pushLog(`🏆 击败 ${e.name}！获得 ✨${gained.stardust} 🔩${gained.parts}${gained.leveled ? ` · 升级至 Lv${this.player.level}！` : ''}`, 'milestone');
    this.exitBattle(true);
    if (e.boss) { this.offerEnding(); return; }
    this.toast(gained.leveled ? '升级！' : '胜利', 'good');
  }

  loseBattle() {
    if (!this.battle) return;
    this.exitBattle(false);
    this.gameOver();
  }

  // 退出战斗回到地图（恢复 game 屏）。
  exitBattle(save) {
    this.battle = null;
    this.screen = 'game';
    this.buildGame();
    this.refreshStatus();
    this.renderMap();
    this.refreshInteract();
    if (save) saveToSlot(this.activeSlot, this.player);
  }

  logBattle(text, type = 'normal') {
    if (!this.battleLog) return;
    this.battleLog.appendChild(h('div', { class: `ln ${type}` }, text));
    this.battleLog.scrollTop = this.battleLog.scrollHeight;
  }

  // —— 结局抉择（击败 Boss 后）——
  // 仅展示抉择弹窗；最终 'over' 态由 chooseEnding / renderEnding 落定，
  // 这样即便玩家误触关闭弹窗，也能回到可交互的地图（Boss 已除、当前层无下行）。
  offerEnding() {
    saveToSlot(this.activeSlot, this.player);
    const body = [
      h('div', { class: 'ending' },
        h('div', { class: 'ending__emoji' }, '🌟'),
        h('h2', null, '星骸之核已寂灭'),
        h('div', { class: 'ending__text' },
          `你集齐了 ${collectedMemoryCount(this.player)} 枚星骸回响。所有的记忆在掌心翻涌——现在，由你回答那个被整个文明搁置的问题。`),
      ),
    ];
    const foot = [
      h('button', { class: 'btn-jade', onClick: () => this.chooseEnding('peace') }, `${ENDINGS.peace.emoji} ${ENDINGS.peace.name}`),
      h('button', { class: 'btn-danger', onClick: () => this.chooseEnding('dark') }, `${ENDINGS.dark.emoji} ${ENDINGS.dark.name}`),
    ];
    this.showSheet({ title: '终章 · 你的回答', body, foot, dismissable: false });
  }

  chooseEnding(key) {
    this.closeModal();
    this.player.ending = key;
    saveToSlot(this.activeSlot, this.player);
    this.renderEnding(key, false, this.player);
  }

  renderEnding(key, fromSave, player) {
    this.screen = 'over';
    this.over = true;
    this.player = player || this.player;
    this.stopLoop();
    clear(this.modalRoot);
    clear(this.stage);
    const e = ENDINGS[key] || ENDINGS.peace;
    const wrap = h('div', { class: 'launcher' });
    wrap.append(
      h('div', { class: `ending ${e.tone}` },
        h('div', { class: 'ending__emoji' }, e.emoji),
        h('h2', null, e.title),
        h('div', { class: 'muted' }, `${this.player.name} · 第 ${this.player.maxFloor} 层 · Lv${this.player.level} · 💎${collectedMemoryCount(this.player)}/10`),
        h('div', { class: 'ending__text' }, e.text),
      ),
      h('div', { class: 'ending__choice' },
        fromSave
          ? h('button', { class: 'btn-ghost big-btn', onClick: () => this.showLauncher() }, '← 返回标题')
          : null,
        h('button', { class: 'btn-primary big-btn', onClick: () => this.restart() }, '🔄 再启新旅程'),
      ),
    );
    this.stage.appendChild(wrap);
  }

  gameOver() {
    if (this.over) return;
    this.over = true;
    this.screen = 'over';
    this.stopLoop();
    this.battle = null;
    saveToSlot(this.activeSlot, this.player);
    clear(this.modalRoot);
    clear(this.stage);
    const wrap = h('div', { class: 'launcher' });
    wrap.append(
      h('div', { class: 'ending dark' },
        h('div', { class: 'ending__emoji' }, '💀'),
        h('h2', null, '旅程终结'),
        h('div', { class: 'muted' }, `${this.player.name} 倒在了第 ${this.player.floor} 层。`),
        h('div', { class: 'ending__text' }, '星骸的光在你眼中缓缓熄灭。墨比乌斯依旧漂浮、寂静——但或许，下一位旅者能走得更远。'),
      ),
      h('div', { class: 'ending__choice' },
        h('button', { class: 'btn-primary big-btn', onClick: () => this.restart() }, '🔄 再启新旅程'),
        h('button', { class: 'btn-ghost', onClick: () => this.showSettings(false) }, '⚙️ 导出 / 存档'),
      ),
    );
    this.stage.appendChild(wrap);
  }

  restart() {
    if (this.activeSlot != null) deleteSlot(this.activeSlot);
    this.player = null;
    this.over = false;
    this.showCreate();
  }

  // ===================== 背包 / 天赋 / 剧情 =====================
  openInventory() {
    if (this.screen !== 'game') return;
    this.showInventoryTab('equip');
  }

  showInventoryTab(tab) {
    clear(this.modalRoot);
    const p = this.player;
    const tabs = h('div', { class: 'tabs' },
      h('button', { class: `tab ${tab === 'equip' ? 'active' : ''}`, onClick: () => this.showInventoryTab('equip') }, '🗡️ 装备'),
      h('button', { class: `tab ${tab === 'talent' ? 'active' : ''}`, onClick: () => this.showInventoryTab('talent') }, '🌟 天赋'),
      h('button', { class: `tab ${tab === 'story' ? 'active' : ''}`, onClick: () => this.showInventoryTab('story') }, '📖 回响'),
    );
    let body;
    if (tab === 'equip') body = this.renderEquipTab();
    else if (tab === 'talent') body = this.renderTalentTab();
    else body = this.renderStoryTab();
    const sheet = h('div', { class: 'sheet' },
      h('div', { class: 'sheet__head' }, h('span', { class: 't' }, '🎒 背包')),
      tabs,
      h('div', { class: 'sheet__body' }, body),
      h('div', { class: 'sheet__foot' },
        h('span', { class: 'muted', style: { flex: 1, alignSelf: 'center' } }, `✨ ${p.stardust} 星骸　🔩 ${p.parts} 零件`),
        h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '关闭'),
      ),
    );
    this.modalRoot.append(h('div', { class: 'sheet-overlay', onClick: () => this.closeModal() }), sheet);
    this._sheet = sheet;
  }

  renderEquipTab() {
    const p = this.player;
    const frag = [];
    const meta = {
      weapon: { emoji: '🗡️', label: '武器', statName: '攻击', statFn: () => effectiveAtk(p) },
      armor: { emoji: '🛡️', label: '护甲', statName: '防御', statFn: () => effectiveDef(p) },
      booster: { emoji: '🥾', label: '推进器', statName: '步数', statFn: () => effectiveMoveRange(p) },
    };
    for (const slot of EQUIP_SLOTS) {
      const e = p.equipment[slot];
      const m = meta[slot];
      const cost = enhanceCost(e.plus);
      const maxed = e.plus >= MAX_PLUS;
      const afford = p.parts >= cost;
      const affix = e.affix ? AFFIXES.find((a) => a.id === e.affix.id) : null;
      frag.push(h('div', { class: 'card equip-card' },
        h('div', { class: 'eq-emoji' }, m.emoji),
        h('div', { class: 'eq-info' },
          h('div', { class: 'eq-name' }, `${e.name} `, h('span', { class: 'plus' }, e.plus > 0 ? `+${e.plus}` : ''),
            h('span', { class: 'muted', style: { fontWeight: 400, fontSize: '0.78rem' } }, `　当前${m.statName} ${m.statFn()}`)),
          h('div', { class: 'eq-affix' }, affix ? `${affix.emoji} 词缀·${affix.name}：${affix.desc}` : `+${AFFIX_AT} 触发词缀变异`),
          h('div', { class: 'eq-cost' }, maxed ? '已达强化上限' : `强化消耗 🔩${cost}`),
        ),
        h('button', {
          class: 'btn-primary', disabled: maxed || !afford,
          onClick: () => this.doEnhance(slot),
        }, maxed ? '满级' : '强化'),
      ));
    }
    return frag;
  }

  doEnhance(slot) {
    const res = enhanceEquipment(this.player, slot, this.rng);
    if (!res.ok) {
      if (res.reason === 'no-parts') this.toast(`零件不足（需 🔩${res.cost}）`, 'bad');
      else if (res.reason === 'max') this.toast('已达强化上限', 'normal');
      return;
    }
    saveToSlot(this.activeSlot, this.player);
    this.refreshStatus();
    if (res.affixed) this.toast(`+${res.plus}！触发词缀变异：${res.affixed.emoji} ${res.affixed.name}`, 'good');
    else this.toast(`强化成功 +${res.plus}`, 'good');
    this.showInventoryTab('equip');
  }

  renderTalentTab() {
    const p = this.player;
    const frag = [h('div', { class: 'muted', style: { marginBottom: '0.5rem' } },
      `消耗星骸点亮，可随时免费重置。已用 ✨${spentStardust(p)}。`)];
    for (const t of TALENTS) {
      const rank = p.talents[t.branch] || 0;
      const maxed = rank >= t.maxRank;
      const cost = talentCost(t.branch, rank);
      const afford = p.stardust >= cost;
      const pips = Array.from({ length: t.maxRank }, (_, i) => h('span', { class: `talent-pip ${i < rank ? 'on' : ''}` }));
      frag.push(h('div', { class: 'card talent-branch' },
        h('div', { class: 'talent-head' },
          h('span', { style: { fontSize: '1.3rem' } }, t.emoji),
          h('div', { class: 'grow' }, h('div', { style: { fontWeight: 700 } }, `${t.name} · Lv${rank}/${t.maxRank}`),
            h('div', { class: 'muted', style: { fontSize: '0.78rem' } }, t.desc)),
          h('button', {
            class: 'btn-primary', disabled: maxed || !afford, style: { flex: 'none' },
            onClick: () => this.doBuyTalent(t.branch),
          }, maxed ? '满级' : `✨${cost}`),
        ),
        h('div', { class: 'talent-ranks' }, pips),
      ));
    }
    frag.push(h('button', { class: 'btn-ghost', style: { width: '100%' }, onClick: () => this.doResetTalents() }, '↩️ 免费重置天赋'));
    return frag;
  }

  doBuyTalent(branch) {
    const res = buyTalent(this.player, branch);
    if (!res.ok) {
      if (res.reason === 'no-stardust') this.toast(`星骸不足（需 ✨${res.cost}）`, 'bad');
      return;
    }
    saveToSlot(this.activeSlot, this.player);
    this.refreshStatus();
    this.toast(`${TALENT_BY_BRANCH[branch].name} → Lv${res.rank}`, 'good');
    this.showInventoryTab('talent');
  }

  doResetTalents() {
    const res = resetTalents(this.player);
    saveToSlot(this.activeSlot, this.player);
    this.refreshStatus();
    this.toast(`天赋已重置，返还 ✨${res.refund}`, 'good');
    this.showInventoryTab('talent');
  }

  renderStoryTab() {
    const p = this.player;
    const frag = [h('div', { class: 'muted', style: { marginBottom: '0.5rem' } },
      `已寻回 ${collectedMemoryCount(p)} / ${MEMORY_CHAPTERS.length} 枚星骸回响。`)];
    MEMORY_CHAPTERS.forEach((ch, i) => {
      const unlocked = p.memory[i];
      frag.push(h('div', { class: `chapter ${unlocked ? '' : 'locked'}` },
        h('div', { class: 'ch-title' }, `${unlocked ? '💎' : '🔒'} ${ch.title}`),
        h('div', { class: 'ch-text' }, unlocked ? ch.text : '尚未寻回这枚记忆碎片。继续深入浮岛吧。'),
      ));
    });
    return frag;
  }

  showChapter(idx) {
    const ch = MEMORY_CHAPTERS[idx];
    if (!ch) return;
    const body = [
      h('div', { class: 'chapter' },
        h('div', { class: 'ch-title' }, `💎 ${ch.title}`),
        h('div', { class: 'ch-text' }, ch.text),
      ),
    ];
    this.showSheet({
      title: '星骸回响',
      body,
      foot: [h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '继续')],
    });
  }

  // ===================== 随机事件 =====================
  showMerchant() {
    const p = this.player;
    const body = [
      h('div', { class: 'muted', style: { marginBottom: '0.5rem' } }, `${EVENT_META.merchant.desc}（持有 ✨${p.stardust}）`),
      h('div', { class: 'slot-list' }, SHOP_ITEMS.map((it) => {
        const afford = p.stardust >= it.cost;
        return h('div', { class: 'slot-row' },
          h('span', { class: 'slot-no' }, it.emoji),
          h('div', { class: 'slot-info' }, h('div', { class: 'slot-name' }, it.name)),
          h('div', { class: 'slot-actions' },
            h('button', { class: 'btn-primary slot-act', disabled: !afford, onClick: () => this.buyItem(it) }, `✨${it.cost}`)),
        );
      })),
    ];
    this.showSheet({ title: '🛒 流浪商人', body, foot: [h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '离开')] });
  }

  buyItem(it) {
    const p = this.player;
    if (p.stardust < it.cost) { this.toast('星骸不足', 'bad'); return; }
    p.stardust -= it.cost;
    if (it.give.fullHeal) { healFull(p); this.toast('已满状态恢复', 'good'); }
    else { gainReward(p, it.give, this.rng); this.toast(`购得 ${it.name}`, 'good'); }
    saveToSlot(this.activeSlot, this.player);
    this.refreshStatus();
    this.showMerchant();
  }

  showDrone() {
    const p = this.player;
    const afford = p.stardust >= DRONE_COST;
    const body = [
      h('div', { class: 'muted', style: { marginBottom: '0.5rem' } }, `${EVENT_META.drone.desc}（持有 ✨${p.stardust}，需 ✨${DRONE_COST}）`),
    ];
    this.showSheet({
      title: '🔧 维修无人机',
      body,
      foot: [
        h('button', { class: 'btn-jade', disabled: !afford, onClick: () => this.useDrone() }, `维修（✨${DRONE_COST}）`),
        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '离开'),
      ],
    });
  }

  useDrone() {
    const p = this.player;
    if (p.stardust < DRONE_COST) { this.toast('星骸不足', 'bad'); return; }
    p.stardust -= DRONE_COST;
    healFull(p);
    this.closeModal();
    this.refreshStatus();
    this.toast('全状态已恢复', 'good');
    this.pushLog('🔧 维修无人机为你回满 HP 与精力。', 'good');
    saveToSlot(this.activeSlot, this.player);
  }

  // ===================== 设置 / 存档 =====================
  showSettings(fromLauncher) {
    const p = this.player;
    const body = [
      h('div', { class: 'card' },
        h('h4', null, '存档'),
        h('div', { class: 'muted', style: { marginBottom: '0.4rem' } },
          `进度自动保存${p ? `（#${(this.activeSlot == null ? '?' : this.activeSlot + 1)} · ${p.name} · 第 ${p.floor} 层）` : '。'}`),
        h('button', { class: 'btn-primary', style: { width: '100%', marginBottom: '0.4rem' }, onClick: () => { this.closeModal(); this.showSlots(fromLauncher); } }, '📂 存档管理（多槽位）'),
        h('button', { class: 'btn-jade', style: { width: '100%', marginBottom: '0.4rem' }, onClick: () => this.doExport() }, '📤 导出存档字符串'),
        h('textarea', { class: 'save-io', dataset: { id: 'io' }, placeholder: '在此粘贴导入字符串…', readonly: true }),
        h('div', { class: 'tabs', style: { marginTop: '0.4rem' } },
          h('button', { class: 'tab', style: { flex: '1 1 45%' }, onClick: () => this.toggleIoInput() }, '✏️ 切换为输入'),
          h('button', { class: 'tab', style: { flex: '1 1 45%', background: 'linear-gradient(180deg,#6fe0b0,#2f9a72)', color: '#06241a', borderColor: '#2f9a72' }, onClick: () => this.doImport() }, '📥 导入'),
        ),
      ),
      h('div', { class: 'card' },
        h('h4', null, '选项'),
        h('div', { class: 'row', style: { justifyContent: 'space-between' } },
          h('span', null, '战斗限时（3 秒/回合）'),
          h('button', { class: `tab ${this.timerEnabled ? 'active' : ''}`, onClick: () => { this.timerEnabled = !this.timerEnabled; this.showSettings(fromLauncher); } }, this.timerEnabled ? '开' : '关'),
        ),
      ),
    ];
    const foot = [
      fromLauncher ? null : h('button', { class: 'btn-ghost', onClick: () => { this.closeModal(); this.confirmExitToLauncher(); } }, '🏠 返回标题'),
      h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '关闭'),
    ];
    this.showSheet({ title: '设置 / 存档', body, foot: foot.filter(Boolean) });
  }

  toggleIoInput() {
    const io = this.modalRoot.querySelector('[data-id="io"]');
    if (!io) return;
    io.readOnly = !io.readOnly;
    if (io.readOnly) { io.value = ''; this.toast('已切回导出模式'); }
    else { this.toast('请粘贴导入字符串后点导入'); }
  }

  doExport() {
    const p = this.player || (this.activeSlot != null ? loadFromSlot(this.activeSlot) : null) || (latestSlot() != null ? loadFromSlot(latestSlot()) : null);
    if (!p) { this.toast('暂无可导出的存档', 'bad'); return; }
    const io = this.modalRoot.querySelector('[data-id="io"]');
    const str = exportSave(p);
    if (io) { io.readOnly = true; io.value = str; }
    this.toast('存档字符串已生成', 'good');
  }

  doImport() {
    const io = this.modalRoot.querySelector('[data-id="io"]');
    const str = (io && io.value || '').trim();
    if (!str) { this.toast('请先粘贴导入字符串', 'bad'); return; }
    const p = importSave(str);
    if (!p) { this.toast('导入失败：字符串无效', 'bad'); return; }
    const slot = this.activeSlot != null ? this.activeSlot : this.pickSlotForNewSave();
    this.activeSlot = slot;
    p.floorState = null; // 导入档重生成当前层
    saveToSlot(slot, p);
    this.toast(`导入成功，已写入 #${slot + 1} 槽位`, 'good');
    this.closeModal();
    // 通关档直接进入结局画面，与「继续旅程」行为一致，而非落回可游玩地图。
    if (p.ending) { this.player = p; this.renderEnding(p.ending, true, p); }
    else this.enterGame(p, slot);
  }

  confirmExitToLauncher() {
    if (!this.player) { this.showLauncher(); return; }
    this.showSheet({
      title: '返回标题？',
      body: [h('div', { class: 'muted' }, '进度已自动保存，可随时从存档管理回到这里。')],
      foot: [
        h('button', { class: 'btn-primary', onClick: () => { this.closeModal(); this.showLauncher(); } }, '返回标题'),
        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '留在游戏'),
      ],
    });
  }

  // ===================== 通用弹窗 / 反馈 =====================
  showSheet({ title, body, foot, dismissable = true }) {
    clear(this.modalRoot);
    // 限时战斗回合中开弹窗（如撤退确认）：onTick 倒计时分支因 !this._sheet 整体跳过，
    // 视觉上「暂停」。这里同步记下开弹窗瞬间的剩余时间，关弹窗时据此顺延 timerEnd，
    // 否则 timerEnd 这个绝对截止时间不会随暂停顺延 → 取消弹窗后 remain==0 → 瞬间失手，
    // 把玩家的深思熟虑误判为反应不及（与 toggleAuto/nextRound 同源的计时器陈旧漏洞）。
    if (this.screen === 'battle' && this.battle && this.timerEnabled && !this.battle.auto && !this.battle.busy) {
      this._battlePauseRemain = Math.max(0, this.battle.timerEnd - nowMs());
    }
    // dismissable=false 时遮罩不可点击关闭（用于必须做出选择的结局抉择，避免软锁）。
    const overlay = h('div', { class: 'sheet-overlay', onClick: () => { if (dismissable) this.closeModal(); } });
    const sheet = h('div', { class: 'sheet' },
      h('div', { class: 'sheet__head' }, h('span', { class: 't' }, title || '')),
      h('div', { class: 'sheet__body' }, ...(body || [])),
      h('div', { class: 'sheet__foot' }, ...(foot || [])),
    );
    this.modalRoot.append(overlay, sheet);
    this._sheet = sheet;
  }
  closeModal() {
    clear(this.modalRoot);
    this._sheet = null;
    // 关弹窗回到限时战斗回合：按开弹窗时记录的剩余时间顺延 timerEnd，
    // 使「视觉暂停」与「绝对截止时间」一致（不会因 timerEnd 陈旧而瞬间失手）。
    if (this._battlePauseRemain != null) {
      if (this.screen === 'battle' && this.battle && this.timerEnabled && !this.battle.auto && !this.battle.busy) {
        this.battle.timerEnd = nowMs() + this._battlePauseRemain;
      }
      this._battlePauseRemain = null;
    }
  }

  toast(text, type = 'normal') {
    const t = h('div', { class: `toast ${type}` }, text);
    this.toastWrap.appendChild(t);
    setTimeout(() => { t.classList.add('hide'); setTimeout(() => t.remove(), 300); }, 1500);
  }

  pushLog(text, type = 'normal') {
    if (!this.player) return;
    this.player.log.push({ turn: this.player.turn, text, type });
    if (this.player.log.length > 200) this.player.log.shift();
  }

  // 浮动飘字：相对地图格定位。
  floatAt(gx, gy, text, cls) {
    if (!this.floatLayer) return;
    const cell = this.cellNodes[gy] && this.cellNodes[gy][gx];
    if (!cell) return;
    const r = this.floatLayer.getBoundingClientRect();
    const cr = cell.getBoundingClientRect();
    const x = cr.left - r.left + cr.width / 2;
    const y = cr.top - r.top + cr.height / 2;
    this.spawnFloat(x, y, text, cls);
  }
  floatAtCenter(text, cls) {
    if (!this.floatLayer) return;
    const r = this.floatLayer.getBoundingClientRect();
    this.spawnFloat(r.width / 2, r.height / 2 - 20, text, cls);
  }
  spawnFloat(x, y, text, cls) {
    if (!this.floatLayer) return;
    const el = h('div', { class: `float-num ${cls || ''}`, style: { left: `${x}px`, top: `${y}px` } }, text);
    this.floatLayer.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  shake() {
    const game = this.stage.querySelector('.xhlz-game') || this.stage.querySelector('.battle');
    if (!game) return;
    game.classList.remove('shake');
    void game.offsetWidth;
    game.classList.add('shake');
  }

  // ===================== 主循环（rAF）=====================
  startLoop() {
    if (this.running) return;
    this.running = true;
    this._lastFrame = nowMs();
    this._prevTick = nowMs(); // 归零基线，避免从启动器/创角返回时首帧 delta 过大，一次性计入大段精力回补
    this._staminaAccum = 0;
    const tick = () => {
      if (!this.running) return;
      this._raf = requestAnimationFrame(tick);
      const t = nowMs();
      // 闲置降帧：地图且无弹窗时节流到 ~20fps；战斗全速（驱动计时条）。
      const idle = this.screen === 'game' && !this._sheet;
      if (idle && t - this._lastFrame < IDLE_FRAME_MS) return;
      this._lastFrame = t;
      this.onTick(t);
    };
    this._raf = requestAnimationFrame(tick);
  }
  stopLoop() {
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = 0;
  }

  onTick(t) {
    // 每帧刷新 _prevTick，避免战斗/弹窗期间未更新导致回到地图时把整段时间一次性计入回精。
    const delta = t - (this._prevTick || t);
    this._prevTick = t;
    // 战斗限时倒计时（开弹窗时暂停，不与玩家的脱离确认冲突）
    if (this.screen === 'battle' && this.battle && this.timerEnabled && !this.battle.auto && !this.battle.busy && !this._sheet) {
      const remain = Math.max(0, this.battle.timerEnd - t);
      this.timerFill.style.width = `${(remain / BATTLE_TIME_MS) * 100}%`;
      if (remain <= 0) { this.logBattle('⏰ 来不及反应！', 'bad'); this.chooseAction('hesitate'); }
      return;
    }
    // 地图闲置：缓慢回复精力（delta 已按帧刷新，不会跨战斗累积）。
    if (this.screen === 'game' && !this._sheet && this.player.stamina < maxStamina()) {
      this._staminaAccum += delta;
      while (this._staminaAccum >= STAMINA_REGEN_INTERVAL_MS) {
        this._staminaAccum -= STAMINA_REGEN_INTERVAL_MS;
        regenStamina(this.player, 1);
      }
      this.refreshStatus();
    }
  }

  destroy() {
    this.stopLoop();
    try { if (this.player) saveToSlot(this.activeSlot, this.player); } catch (_) {}
    clear(this.parent);
    clear(this.modalRoot);
    clear(this.toastWrap);
    this.player = null;
    this.battle = null;
    this.over = false;
  }
}

// —— 纯辅助（不依赖 this）——
function isVisible(x, y, pos) {
  return Math.max(Math.abs(x - pos.x), Math.abs(y - pos.y)) <= VISION_RADIUS;
}
function visibleKeysList(st, x, y) {
  const out = [];
  for (let dy = -VISION_RADIUS; dy <= VISION_RADIUS; dy++) {
    for (let dx = -VISION_RADIUS; dx <= VISION_RADIUS; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < GRID && ny < GRID) out.push(`${nx},${ny}`);
    }
  }
  return out;
}
function adjacentEnemy(st, pos) {
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const e = entityAt(st, pos.x + dx, pos.y + dy);
    if (e && e.type === 'enemy') return e;
  }
  return null;
}
function entityEmoji(ent, tileId) {
  switch (ent.type) {
    case 'enemy': return ent.emoji || '👾';
    case 'chest': return '🎁';
    case 'merchant': return '🛒';
    case 'drone': return '🔧';
    case 'memory': return '💎';
    case 'trap': return ''; // 陷阱不显示
    default: return '';
  }
}
function spentStardust(p) {
  let s = 0;
  for (const t of TALENTS) {
    const rank = p.talents[t.branch] || 0;
    for (let i = 0; i < rank; i++) s += talentCost(t.branch, i);
  }
  return s;
}
function nowMs() {
  try { return Date.now(); } catch (_) { return 0; }
}
