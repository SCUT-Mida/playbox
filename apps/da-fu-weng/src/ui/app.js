// ============================================================================
// 大富翁 · 环游之城 · UI 渲染与回合驱动（纯原生 DOM，竖屏优先）。
// 界面：启动器 → 选人+选图（6 张地图逐步解锁）→ 对局
//   （大棋盘可拖动平移 + 镜头跟随、骰子、玩家 HUD、日志、买地/抽卡/结算弹窗）
//   → 终局排名（夺冠解锁下一张地图）。
// 角色形象全部来自共享素材库 _lib/kairo.js（预置 · 开罗风 · 可复用）。
// ============================================================================
import '../ui/style.css';
import { attachKeyboardShell } from '../../../_lib/keyboard-shell.js';
import { kairoSVG } from '../../../_lib/kairo.js';
import { h, clear } from './dom.js';
import {
  MAPS, mapDefOf, boardOf, perimeterOf, tileGrid, PALETTE,
  CHARACTERS, AI_CHARACTERS, CHIP_COLORS,
  rentOf,
} from '../config.js';
import {
  newGame, rollAndMove, resolveTile, buyTile, upgradeTile, declineDecision,
  endTurn, aiDecide, ranking, ownedTilesOf, hasMonopoly, log as logSt, mapOf,
} from '../core/game.js';
import { makeSeed } from '../core/rng.js';
import { loadMeta, isUnlocked, unlockNext } from '../core/meta.js';
import {
  SAVE_SLOTS, saveToSlot, loadFromSlot, deleteSlot, listSlots,
  exportSave, importSave,
} from '../core/save.js';
void SAVE_SLOTS;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CELL = 56; // 棋盘格像素尺寸（大地图超屏，拖动平移）

function districtOf(st, i) {
  const t = boardOf(st.mapKey)[i];
  const dists = mapDefOf(st.mapKey).districts;
  return t && t.district != null ? dists[t.district] : null;
}

// 地图迷你缩略图：外环小方点按类型/街区着色
function miniBoard(map) {
  const tiles = boardOf(map.key);
  const wrap = h('span', { class: 'map-mini' });
  wrap.style.gridTemplateColumns = `repeat(${map.cols}, 1fr)`;
  for (let r = 1; r <= map.rows; r++) {
    for (let c = 1; c <= map.cols; c++) wrap.appendChild(h('i', { class: 'map-mini__cell inner' }));
  }
  tiles.forEach((t, i) => {
    const { row, col } = tileGrid(i, map.cols, map.rows);
    const idx = (row - 1) * map.cols + (col - 1);
    const cell = wrap.children[idx];
    cell.className = 'map-mini__cell';
    if (t.type === 'prop') cell.style.background = PALETTE[map.districts[t.district].color];
    else cell.dataset.t = t.type;
  });
  return wrap;
}

export class GameUI {
  constructor(parent) {
    this.root = parent;
    this.state = null;
    this.activeSlot = null;
    this.busy = false;
    this.sheetEl = null;
    this._aiTimer = null;
    const meta = loadMeta();
    this._createTpl = { heroKey: CHARACTERS[0].key, aiCount: 2, mapKey: meta.unlocked[meta.unlocked.length - 1] };
    this._pan = { x: 0, y: 0, w: 0, h: 0, bw: 0, bh: 0, dragging: false, moved: false, follow: true };
  }

  mount() {
    this.showLauncher();
  }

  // ============ 启动器 ============
  showLauncher() {
    this._teardown();
    clear(this.root);
    const wrap = h('div', { class: 'dfw launcher' });
    const slots = listSlots();
    const slotRow = (info, i) => h('div', { class: `slot-row ${info ? 'used' : ''}` },
      h('div', { class: 'slot-info' },
        info
          ? h('div', null,
            h('b', null, `${info.heroName} · ${info.mapName}`),
            h('span', { class: 'muted' }, `R${info.round}/${info.maxRound} · ${info.players} 人${info.finished ? ' · 已终局' : ''}`))
          : h('span', { class: 'muted' }, '空档位'),
      ),
      info
        ? h('div', { class: 'row' },
          h('button', { class: 'btn-primary', onClick: () => this.loadSlot(i) }, '继续'),
          h('button', { class: 'btn-ghost', onClick: () => { deleteSlot(i); this.showLauncher(); } }, '删除'))
        : null,
    );
    wrap.append(
      h('div', { class: 'launcher__hero' },
        h('span', { class: 'launcher__emblem' }, '富'),
        h('h1', null, '大富翁'),
        h('p', { class: 'muted' }, '环游之城 · 六图环游 · 垄断为王'),
      ),
      h('div', { class: 'launcher__actions' },
        h('button', { class: 'btn-primary', onClick: () => this.showSetup() }, '开始新对局'),
      ),
      h('div', { class: 'panel slots' },
        h('h4', null, '存档'),
        ...slots.map((info, i) => slotRow(info, i)),
      ),
    );
    this.root.appendChild(wrap);
  }

  loadSlot(i) {
    const st = loadFromSlot(i);
    if (!st) return;
    this.activeSlot = i;
    this.startGame(st, false);
  }

  // ============ 选人 + 选图 ============
  showSetup() {
    this._teardown();
    clear(this.root);
    const t = this._createTpl;
    const meta = loadMeta();
    const wrap = h('div', { class: 'dfw launcher create' });
    const heroRow = h('div', { class: 'hero-grid' });
    for (const c of CHARACTERS) {
      heroRow.appendChild(h('button', {
        class: `hero-cell ${t.heroKey === c.key ? 'active' : ''}`,
        onClick: () => { this._createTpl.heroKey = c.key; this.showSetup(); },
      },
        h('span', { class: 'hero-cell__ava', html: kairoSVG(c.look, 56) }),
        h('b', null, c.name),
        h('span', { class: 'muted' }, c.title),
      ));
    }
    const aiRow = h('div', { class: 'ai-toggle' });
    for (const n of [1, 2, 3]) {
      aiRow.appendChild(h('button', {
        class: t.aiCount === n ? 'active' : '',
        onClick: () => { this._createTpl.aiCount = n; this.showSetup(); },
      }, `${n} 位`));
    }
    // 地图卡（锁定/解锁 + 迷你预览）
    const mapRow = h('div', { class: 'map-grid' });
    MAPS.forEach((m, i) => {
      const unlocked = meta.unlocked.includes(m.key);
      const prev = i > 0 ? MAPS[i - 1] : null;
      mapRow.appendChild(h('button', {
        class: `map-cell ${t.mapKey === m.key && unlocked ? 'active' : ''} ${unlocked ? '' : 'locked'}`,
        disabled: !unlocked,
        onClick: () => { this._createTpl.mapKey = m.key; this.showSetup(); },
      },
        miniBoard(m),
        h('b', null, unlocked ? m.name : '🔒 未解锁'),
        h('span', { class: 'muted' }, unlocked
          ? `${perimeterOf(m)} 格 · ${m.rounds} 回合`
          : `在「${prev ? prev.name : ''}」夺冠解锁`),
      ));
    });
    wrap.append(
      h('div', { class: 'create__head' },
        h('button', { class: 'btn-ghost', onClick: () => this.showLauncher() }, '← 返回'),
        h('h1', null, '组建商队'),
      ),
      h('div', { class: 'panel' }, h('h4', null, '选择主角'), heroRow),
      h('div', { class: 'panel' },
        h('h4', null, 'AI 对手'),
        aiRow,
        h('p', { class: 'muted', style: { marginTop: '0.4rem' } },
          `对手依次为：${AI_CHARACTERS.slice(0, t.aiCount).map((a) => a.name).join('、')}`),
      ),
      h('div', { class: 'panel' },
        h('h4', null, '选择地图（夺冠逐步解锁）'),
        mapRow,
      ),
      h('button', {
        class: 'btn-primary btn-block',
        onClick: () => this.startGame(newGame({
          heroKey: t.heroKey, aiCount: t.aiCount, mapKey: t.mapKey, seed: makeSeed(),
        }), true),
      }, '出发！'),
    );
    this.root.appendChild(wrap);
  }

  // ============ 对局 ============
  startGame(state, isNew) {
    this._teardown();
    this.state = state;
    this.busy = false;
    this._pan.follow = true;
    clear(this.root);
    this.stage = h('div', { class: 'dfw game' });
    this.root.appendChild(this.stage);
    if (attachKeyboardShell) {
      try { this._kb = attachKeyboardShell(this.stage); } catch (_) { /* 无键盘环境忽略 */ }
    }
    this.buildBoard();
    this.buildHud();
    this.buildBottom();
    this.refresh();
    logSt(state, isNew ? `新对局 ·「${mapOf(state).name}」出发！` : '读档继续对局');
    this.refresh();
    this.centerOnToken(state.turnIdx, false);
    this.maybeScheduleAI();
  }

  buildBoard() {
    const st = this.state;
    const map = mapDefOf(st);
    const tiles = boardOf(st.mapKey);
    // 棋盘视口（可拖动平移）→ 平移层 → 固定像素网格棋盘 + 棋子层
    this.boardView = h('div', { class: 'board-view' });
    this.boardPan = h('div', { class: 'board-pan' });
    this.boardEl = h('div', { class: 'board' });
    this.boardEl.style.gridTemplateColumns = `repeat(${map.cols}, ${CELL}px)`;
    this.boardEl.style.gridTemplateRows = `repeat(${map.rows}, ${CELL}px)`;
    this.tileEls = [];
    tiles.forEach((t, i) => {
      const { row, col } = tileGrid(i, map.cols, map.rows);
      const el = h('button', { class: `tile t-${t.type}`, dataset: { tile: String(i) }, onClick: () => this.showTileSheet(i) });
      el.style.gridRow = String(row);
      el.style.gridColumn = String(col);
      this.tileEls.push(el);
      this.boardEl.appendChild(el);
    });
    this.centerEl = h('div', { class: 'board-center' });
    this.centerEl.style.gridRow = `2 / ${map.rows}`;
    this.centerEl.style.gridColumn = `2 / ${map.cols}`;
    this.diceEl = h('div', { class: 'dice' }, '🎲');
    this.centerName = h('div', { class: 'center-name' }, '—');
    this.centerHint = h('div', { class: 'center-hint muted' }, '掷骰开始');
    this.centerEl.append(this.diceEl, this.centerName, this.centerHint);
    this.boardEl.appendChild(this.centerEl);
    this.tokenLayer = h('div', { class: 'token-layer' });
    this.tokenEls = [];
    this.boardPan.append(this.boardEl, this.tokenLayer);
    this.boardView.appendChild(this.boardPan);
    this.stage.appendChild(this.boardView);
    this.wirePan();
    this.measureBoard();
  }

  buildHud() {
    this.hudEl = h('div', { class: 'hud' });
    this.stage.appendChild(this.hudEl);
    this.logEl = h('div', { class: 'log-strip' }, h('div', { class: 'log-strip__lines' }));
    this.stage.appendChild(this.logEl);
  }

  buildBottom() {
    this.rollBtn = h('button', {
      class: 'turn-btn',
      onClick: () => this.onRollTap(),
    }, '🎲 掷骰子');
    this.menuBtn = h('button', { class: 'icon-btn', title: '菜单', onClick: () => this.showMenuSheet() }, '☰');
    this.bottomBar = h('div', { class: 'bottom-bar' },
      this.menuBtn,
      this.rollBtn,
    );
    this.stage.appendChild(this.bottomBar);
  }

  // —— 棋盘平移（拖动）——
  measureBoard() {
    if (!this.boardView || !this.boardEl) return;
    const vw = this.boardView.clientWidth;
    const vh = this.boardView.clientHeight;
    const bw = this.boardEl.offsetWidth;
    const bh = this.boardEl.offsetHeight;
    const p = this._pan;
    p.w = vw; p.h = vh; p.bw = bw; p.bh = bh;
    // 棋盘小于视口时居中；否则夹紧平移范围
    this.clampPan();
  }

  clampPan() {
    const p = this._pan;
    const minX = Math.min(0, p.w - p.bw);
    const minY = Math.min(0, p.h - p.bh);
    p.x = Math.max(minX, Math.min(0, p.x));
    p.y = Math.max(minY, Math.min(0, p.y));
    if (p.w >= p.bw) p.x = (p.w - p.bw) / 2;  // 居中（board-pan 尺寸=棋盘尺寸）
    if (p.h >= p.bh) p.y = (p.h - p.bh) / 2;
    this.applyPan();
  }

  applyPan(animate = false) {
    if (!this.boardPan) return;
    this.boardPan.classList.toggle('pan-anim', !!animate && !this._pan.dragging);
    this.boardPan.style.transform = `translate3d(${Math.round(this._pan.x)}px, ${Math.round(this._pan.y)}px, 0)`;
  }

  wirePan() {
    const view = this.boardView;
    let sx = 0, sy = 0, px = 0, py = 0;
    const p = this._pan;
    const down = (e) => {
      if (e.target.closest('.sheet-root')) return; // 弹窗交互不平移
      p.dragging = true; p.moved = false;
      sx = e.clientX; sy = e.clientY; px = p.x; py = p.y;
    };
    const move = (e) => {
      if (!p.dragging) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 6) { p.moved = true; p.follow = false; }
      if (!p.moved) return;
      p.x = px + dx; p.y = py + dy;
      this.clampPan();
    };
    const up = () => { p.dragging = false; };
    // 不用 pointer capture：让格子按钮的 click 自然触发，
    // 拖动后的尾随点击由 showTileSheet 的 moved 标记吞掉。
    view.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    this._panCleanups = [
      () => view.removeEventListener('pointerdown', down),
      () => window.removeEventListener('pointermove', move),
      () => window.removeEventListener('pointerup', up),
      () => window.removeEventListener('pointercancel', up),
    ];
    // 视口尺寸变化（旋转/折叠）时重算
    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => this.measureBoard());
      this._ro.observe(view);
    } else {
      const onResize = () => this.measureBoard();
      window.addEventListener('resize', onResize);
      this._panCleanups.push(() => window.removeEventListener('resize', onResize));
    }
  }

  // 镜头对准某玩家棋子（回合开始/移动时自动跟随；用户拖动后暂停跟随）
  centerOnToken(pIdx, animate = true) {
    const p = this._pan;
    if (!p.follow || !p.bw) return;
    const st = this.state;
    const map = mapOf(st);
    const { row, col } = tileGrid(st.players[pIdx].pos, map.cols, map.rows);
    const tx = (col - 0.5) * CELL;
    const ty = (row - 0.5) * CELL;
    p.x = p.w / 2 - tx;
    p.y = p.h / 2 - ty;
    this.clampPan();
    this.applyPan(animate);
  }

  // —— 棋子定位：格中心 + 同格多人微错位（相对棋盘像素）——
  tokenXY(pIdx, tileIdx) {
    const map = mapOf(this.state);
    const { row, col } = tileGrid(tileIdx, map.cols, map.rows);
    const cx = (col - 0.5) * CELL;
    const cy = (row - 0.5) * CELL;
    const players = this.state.players;
    const onTile = players.map((p, i) => (p.pos === tileIdx && !p.bankrupt ? i : -1)).filter((i) => i >= 0);
    const k = onTile.indexOf(pIdx);
    const n = Math.max(1, onTile.length);
    const dx = (k - (n - 1) / 2) * 10;
    return { x: cx + dx, y: cy };
  }

  setTokenPos(pIdx, tileIdx) {
    const el = this.tokenEls[pIdx];
    if (!el) return;
    const { x, y } = this.tokenXY(pIdx, tileIdx);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }

  refreshTokens() {
    this.state.players.forEach((p, i) => this.setTokenPos(i, p.pos));
  }

  // —— 全量刷新 ——
  refresh() {
    const st = this.state;
    if (!st) return;
    const tiles = boardOf(st.mapKey);
    const map = mapOf(st);
    // 格子
    tiles.forEach((t, i) => {
      const el = this.tileEls[i];
      const ts = st.tiles[i];
      clear(el);
      if (t.type === 'prop') {
        const d = map.districts[t.district];
        const owner = ts && ts.owner >= 0 ? st.players[ts.owner] : null;
        el.append(
          h('span', { class: 'tile__bar', style: { background: PALETTE[d.color] } }),
          h('span', { class: 'tile__name' }, t.name),
          h('span', { class: 'tile__meta' },
            owner ? `${owner.name.slice(0, 1)}·${'★'.repeat(ts.level)}` : `${t.price}`),
        );
        if (owner) el.style.setProperty('--chip', CHIP_COLORS[ts.owner % CHIP_COLORS.length]);
        else el.style.removeProperty('--chip');
      } else {
        el.append(
          h('span', { class: 'tile__icon' }, t.icon || ''),
          h('span', { class: 'tile__name' }, t.name),
        );
      }
    });
    // 棋子（首次懒建）
    if (this.tokenEls.length !== st.players.length) {
      clear(this.tokenLayer);
      this.tokenEls = st.players.map((p, i) => {
        const el = h('span', {
          class: `token token--${i}`,
          style: { '--chip': CHIP_COLORS[i % CHIP_COLORS.length] },
          title: p.name,
          html: kairoSVG(p.look, 30),
        });
        this.tokenLayer.appendChild(el);
        return el;
      });
      this.measureBoard();
    }
    this.refreshTokens();
    // HUD
    clear(this.hudEl);
    st.players.forEach((p, i) => {
      this.hudEl.appendChild(h('div', {
        class: `pcard ${i === st.turnIdx ? 'active' : ''} ${p.bankrupt ? 'dead' : ''}`,
        style: { '--chip': CHIP_COLORS[i % CHIP_COLORS.length] },
      },
        h('span', { class: 'pcard__ava', html: kairoSVG(p.look, 30) }),
        h('div', { class: 'pcard__body' },
          h('div', { class: 'pcard__name' }, `${p.name}${p.isAI ? '' : '（你）'}`),
          h('div', { class: 'pcard__cash' }, p.bankrupt ? '破产' : `$${p.cash}`),
        ),
        h('span', { class: 'pcard__prop' }, `${ownedTilesOf(st, i).length} 处`),
        p.skipTurns > 0 && !p.bankrupt ? h('span', { class: 'pcard__skip' }, '停') : null,
      ));
    });
    // 中央信息
    const cp = st.players[st.turnIdx];
    this.centerName.textContent = st.finished ? '对局结束' : `${cp.name} 的回合`;
    this.centerHint.textContent = st.finished
      ? '查看结算'
      : `R${st.round}/${map.rounds} · ${st.phase === 'roll' ? (cp.isAI ? '思考中…' : '掷骰前进') : '结算中…'}`;
    if (!st.finished) this.diceEl.textContent = st.lastDice > 0 ? `🎲 ${st.lastDice}` : '🎲';
    // 按钮
    const canRoll = !this.busy && !st.finished && st.phase === 'roll' && !cp.isAI;
    this.rollBtn.disabled = !canRoll;
    // 日志（末 4 条）
    const lines = this.logEl.querySelector('.log-strip__lines');
    clear(lines);
    st.log.slice(-4).forEach((t) => lines.appendChild(h('div', { class: 'ln' }, t)));
    lines.scrollTop = lines.scrollHeight;
  }

  toast(text, kind = 'normal') {
    if (this._toastTimer) clearTimeout(this._toastTimer);
    let el = this.stage.querySelector('.toast');
    if (!el) {
      el = h('div', { class: 'toast' });
      this.stage.appendChild(el);
    }
    el.textContent = text;
    el.className = `toast ${kind}`;
    this._toastTimer = setTimeout(() => { el.remove(); }, 1800);
  }

  // ============ 回合驱动 ============
  async onRollTap() {
    if (this.busy || !this.state || this.state.finished) return;
    const cp = this.state.players[this.state.turnIdx];
    if (cp.isAI) return;
    await this.playTurn();
  }

  async playTurn() {
    if (this.busy || !this.state || this.state.finished) return;
    this.busy = true;
    try {
      const st = this.state;
      const pIdx = st.turnIdx;
      this._pan.follow = true; // 新回合恢复镜头跟随
      const from = st.players[pIdx].pos;
      for (let i = 0; i < 6; i++) {
        this.diceEl.textContent = `🎲 ${1 + ((i * 5 + pIdx) % 6)}`;
        await sleep(60);
      }
      const r = rollAndMove(st);
      if (r.skipped) {
        this.refresh();
        this.toast(`${st.players[pIdx].name} 停掷一回合`);
      } else {
        this.diceEl.textContent = `🎲 ${r.dice}`;
        await this.animateMove(pIdx, from, r.dest);
        await this.resolveLoop(pIdx);
      }
      if (st.finished) {
        this.onGameOver();
        return;
      }
      const et = endTurn(st);
      if (et.finished) {
        this.onGameOver();
        return;
      }
      this.autosave();
    } finally {
      this.busy = false;
      this.refresh();
    }
    // busy 已复位（finally 之后），轮到 AI 时自动接管
    this.maybeScheduleAI();
  }

  async animateMove(pIdx, from, dest) {
    const st = this.state;
    const n = st.tiles.length;
    const steps = (dest - from + n) % n || n;
    for (let s = 1; s <= steps; s++) {
      const pos = (from + s) % n;
      this.setTokenPos(pIdx, pos);
      this.centerOnToken(pIdx, true);
      await sleep(110);
    }
    this.refresh(); // 棋子归位（同格错位重排）
  }

  async resolveLoop(pIdx) {
    const st = this.state;
    for (let guard = 0; guard < 3; guard++) {
      if (st.finished) return;
      const res = resolveTile(st);
      await this.presentResult(pIdx, res);
      if (!res.resolveAgain) return;
    }
  }

  async presentResult(pIdx, res) {
    const st = this.state;
    const p = st.players[pIdx];
    const isAI = p.isAI;
    switch (res.kind) {
      case 'buy':
      case 'upgrade': {
        this.centerOnToken(pIdx, true);
        if (isAI) {
          const want = aiDecide(st, res);
          await sleep(450);
          if (want) {
            if (res.kind === 'buy') buyTile(st, res.tile);
            else upgradeTile(st, res.tile);
          } else declineDecision(st);
        } else {
          await this.askDecision(res);
        }
        break;
      }
      case 'rent': {
        this.toast(`${p.name} 付给 ${st.players[res.owner].name} 租金 $${res.amount}${res.mono ? '（垄断×1.5）' : ''}`);
        await sleep(isAI ? 600 : 800);
        break;
      }
      case 'card': {
        await this.showCardSheet(res.card, isAI);
        break;
      }
      case 'tax': {
        this.toast(`税务司查账，缴税 $${res.amount}`);
        await sleep(700);
        break;
      }
      case 'jail': {
        this.toast(`${p.name} 进了监狱，罚款并停掷`);
        await sleep(700);
        break;
      }
      case 'hospital': {
        this.toast(`${p.name} 就医，医药费开支`);
        await sleep(700);
        break;
      }
      case 'info': {
        this.toast(res.text || '');
        await sleep(500);
        break;
      }
      default: break;
    }
    this.refresh();
  }

  askDecision(res) {
    return new Promise((resolve) => {
      const st = this.state;
      const p = st.players[st.turnIdx];
      const t = boardOf(st.mapKey)[res.tile];
      const d = districtOf(st, res.tile);
      const ts = st.tiles[res.tile];
      const isBuy = res.kind === 'buy';
      const cost = isBuy ? res.price : res.cost;
      const afford = p.cash >= cost;
      const rents = isBuy
        ? [1, 2, 3].map((lv) => rentOf(t, lv, false))
        : [rentOf(t, ts.level + 1, false)];
      const done = (fn) => { fn(); this.closeSheet(); this.refresh(); resolve(); };
      this.showSheet({
        title: isBuy ? `购买「${t.name}」` : `升级「${t.name}」`,
        body: h('div', { class: 'buy-sheet' },
          h('div', { class: 'row', style: { alignItems: 'center', gap: '0.6rem' } },
            h('span', { class: 'buy-ava', html: kairoSVG(p.look, 44) }),
            h('div', { class: 'grow' },
              h('div', null, `${d.name} · ${isBuy ? `地价 $${res.price}` : `当前 ${ts.level} 级 → ${ts.level + 1} 级`}`),
              h('div', { class: 'muted' }, `现金 $${p.cash}${afford ? '' : '（不足）'}`),
            ),
          ),
          h('div', { class: 'rent-table' },
            isBuy
              ? rents.map((rv, i) => h('div', { class: 'rent-row' },
                  h('span', null, `${i + 1} 级租金`), h('b', null, `$${rv}`),
                  i === 0 ? h('span', { class: 'muted' }, `（垄断 ×1.5 → $${Math.round(rv * 1.5)}）`) : null))
              : h('div', { class: 'rent-row' }, h('span', null, `升后租金`), h('b', null, `$${rents[0]}`)),
          ),
        ),
        foot: [
          h('button', { class: 'btn-ghost', onClick: () => done(() => declineDecision(st)) }, '放弃'),
          h('button', {
            class: 'btn-primary', disabled: !afford,
            onClick: () => done(() => { isBuy ? buyTile(st, res.tile) : upgradeTile(st, res.tile); }),
          }, isBuy ? `买下 $${cost}` : `升级 $${cost}`),
        ],
      });
    });
  }

  showCardSheet(card, isAI) {
    return new Promise((resolve) => {
      const close = () => { this.closeSheet(); resolve(); };
      if (isAI) {
        this.toast(`抽到「${card.text}」`);
        setTimeout(close, 900);
        return;
      }
      this.showSheet({
        title: '事件卡',
        body: h('div', { class: 'card-sheet' },
          h('div', { class: 'card-sheet__icon' }, '🎴'),
          h('p', { class: 'card-sheet__text' }, card.text),
        ),
        foot: [h('button', { class: 'btn-primary', onClick: close }, '继续')],
      });
    });
  }

  showTileSheet(i) {
    if (this._pan && this._pan.moved) { this._pan.moved = false; return; } // 拖动尾随点击不弹详情
    const st = this.state;
    const t = boardOf(st.mapKey)[i];
    const ts = st.tiles[i];
    const d = districtOf(st, i);
    const body = [];
    if (t.type === 'prop') {
      const owner = ts && ts.owner >= 0 ? st.players[ts.owner] : null;
      body.push(h('div', { class: 'muted', style: { marginBottom: '0.4rem' } },
        `${d.name} · 地价 $${t.price}`));
      body.push(h('div', { class: 'rent-table' },
        [1, 2, 3].map((lv) => h('div', { class: 'rent-row' },
          h('span', null, `${lv} 级租金`),
          h('b', null, `$${rentOf(t, lv, false)}`),
          lv === 3 ? h('span', { class: 'muted' }, `（垄断 $${rentOf(t, 3, true)}）`) : null,
        ))));
      body.push(h('div', { style: { marginTop: '0.4rem' } },
        owner ? `业主：${owner.name} · ${ts.level} 级${hasMonopoly(st, t.district, ts.owner) ? ' · 街区垄断！' : ''}`
          : '尚无业主'));
    } else {
      const desc = {
        start: '经过即领工资；恰好落上另有奖励。',
        chance: '抽一张机会卡，祸福难料。',
        fate: '抽一张命运卡，全看造化。',
        jail: '落入者罚款并停掷一回合。',
        hospital: '落入者支付医药费。',
        park: '御园赏花，平安无事。',
        tax: '按现金一成缴税（50~500）。',
      }[t.type] || '';
      body.push(h('p', { class: 'muted' }, desc));
    }
    this.showSheet({ title: `${t.icon || '🏛️'} ${t.name}`, body, foot: [h('button', { class: 'btn-ghost', onClick: () => this.closeSheet() }, '关闭')] });
  }

  showMenuSheet() {
    const st = this.state;
    const slots = listSlots();
    const body = h('div', { class: 'menu-sheet' },
      h('h4', null, '存档'),
      ...slots.map((info, i) => h('div', { class: 'slot-row' + (info ? ' used' : '') },
        h('span', { class: 'grow' }, info ? `档${i + 1} · ${info.heroName} · ${info.mapName} R${info.round}` : `档${i + 1} · 空`),
        h('div', { class: 'row' },
          h('button', {
            class: 'btn-ghost', disabled: this.busy,
            onClick: () => {
              this.activeSlot = i;
              saveToSlot(i, { ...st, savedAt: Date.now() });
              this.toast('已保存');
              this.closeSheet();
            },
          }, '保存'),
          info ? h('button', { class: 'btn-ghost', disabled: this.busy, onClick: () => { this.loadSlot(i); this.closeSheet(); } }, '读取') : null,
        ),
      )),
      h('div', { class: 'row', style: { marginTop: '0.6rem' } },
        h('button', { class: 'btn-ghost', style: { flex: 1 }, onClick: () => this.exportCurrent() }, '导出'),
        h('button', { class: 'btn-ghost', style: { flex: 1 }, onClick: () => this.importPrompt() }, '导入'),
      ),
      h('button', { class: 'btn-danger btn-block', style: { marginTop: '0.8rem' }, onClick: () => { this.closeSheet(); this.showLauncher(); } }, '退出对局'),
    );
    this.showSheet({ title: `菜单 · ${mapOf(st).name}`, body, foot: [] });
  }

  exportCurrent() {
    const code = exportSave(this.state);
    const ta = h('textarea', { class: 'save-code', readonly: true }, code);
    this.showSheet({
      title: '导出存档码',
      body: h('div', null, h('p', { class: 'muted' }, '复制以下存档码保存：'), ta),
      foot: [h('button', { class: 'btn-ghost', onClick: () => this.showMenuSheet() }, '返回')],
    });
    ta.select();
  }

  importPrompt() {
    const ta = h('textarea', { class: 'save-code', placeholder: '粘贴存档码…' });
    this.showSheet({
      title: '导入存档',
      body: ta,
      foot: [h('button', {
        class: 'btn-primary',
        onClick: () => {
          const st = importSave(ta.value);
          if (!st) { this.toast('存档码无效', 'bad'); return; }
          this.closeSheet();
          this.startGame(st, false);
        },
      }, '导入')],
    });
  }

  onGameOver() {
    const st = this.state;
    const rank = ranking(st);
    // 主角夺冠 → 解锁下一张地图
    let unlockLine = null;
    if (rank[0].idx === 0) {
      const fresh = unlockNext(st.mapKey);
      if (fresh) {
        const nm = mapDefOf(fresh).name;
        unlockLine = h('p', { class: 'unlock-line' }, `🔓 夺冠解锁新地图：「${nm}」`);
      }
    }
    const map = mapOf(st);
    const reasonText = st.finished.reason === 'last' ? '对手全部破产，一家独大！' : `${map.rounds} 回合期满，清点资产。`;
    const body = h('div', { class: 'over-sheet' },
      h('p', { class: 'muted' }, `${map.name} · ${reasonText}`),
      unlockLine,
      ...rank.map((r, i) => h('div', { class: `over-row ${i === 0 ? 'champion' : ''}` },
        h('span', { class: 'over-rank' }, ['🥇', '🥈', '🥉', '🏅'][i] || `${i + 1}`),
        h('span', { class: 'over-ava', html: kairoSVG(st.players[r.idx].look, 36) }),
        h('span', { class: 'grow' }, st.players[r.idx].name, r.bankrupt ? h('span', { class: 'muted' }, '（破产）') : null),
        h('b', null, `$${r.assets}`),
      )),
    );
    this.showSheet({
      title: '🏁 终局结算',
      body,
      foot: [
        h('button', { class: 'btn-ghost', onClick: () => { this.closeSheet(); this.showLauncher(); } }, '返回主页'),
        h('button', { class: 'btn-primary', onClick: () => { this.closeSheet(); this.showSetup(); } }, '再来一局'),
      ],
    }, { blocker: true });
  }

  maybeScheduleAI() {
    const st = this.state;
    if (!st || st.finished || this.busy) return;
    const cp = st.players[st.turnIdx];
    if (!cp || !cp.isAI) return;
    if (this._aiTimer) clearTimeout(this._aiTimer);
    this._aiTimer = setTimeout(() => { this._aiTimer = null; this.playTurn(); }, 800);
  }

  autosave() {
    if (this.activeSlot == null) {
      const slots = listSlots();
      this.activeSlot = slots.findIndex((s) => !s);
      if (this.activeSlot < 0) this.activeSlot = 0;
    }
    saveToSlot(this.activeSlot, { ...this.state, savedAt: Date.now() });
  }

  // ============ 弹窗骨架 ============
  showSheet({ title, body, foot }, opts = {}) {
    this.closeSheet();
    const mask = h('div', { class: 'sheet-mask', onClick: () => { if (!opts.blocker) this.closeSheet(); } });
    const sheet = h('div', { class: 'sheet' },
      h('div', { class: 'sheet__head' }, h('b', null, title)),
      h('div', { class: 'sheet__body' }, body),
      foot && foot.length ? h('div', { class: 'sheet__foot' }, ...foot) : null,
    );
    this.sheetEl = h('div', { class: 'sheet-root' }, mask, sheet);
    this.stage.appendChild(this.sheetEl);
  }

  closeSheet() {
    if (this.sheetEl) { this.sheetEl.remove(); this.sheetEl = null; }
  }

  _teardown() {
    if (this._aiTimer) { clearTimeout(this._aiTimer); this._aiTimer = null; }
    if (this._ro) { try { this._ro.disconnect(); } catch (_) { /* 忽略 */ } this._ro = null; }
    if (this._panCleanups) { this._panCleanups.forEach((fn) => fn()); this._panCleanups = null; }
    this.closeSheet();
  }
}
