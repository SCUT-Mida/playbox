// ============================================================================
// 大富翁 · 环游之城 · UI 渲染与回合驱动（纯原生 DOM，竖屏优先）。
// 界面：启动器 → 选人（天赋各异）+选图（6 张地图逐步解锁）→ 对局
//   （外环+内街的大棋盘可拖动平移 + 镜头跟随、腹地点缀风景、浮动双骰信息条、
//    玩家 HUD（4 人自动 2×2 网格防重叠，含道具徽章）、可收缩运行记录（展开可滚动翻历史）、
//    买地/抽卡/商店/道具栏/结算弹窗——商店等交易弹窗内嵌钱包条，随时看得到现金）
//   → 终局排名（夺冠解锁下一张地图）。
// 角色形象全部来自共享素材库 _lib/kairo.js（预置 · 开罗风 · 可复用）。
// ============================================================================
import '../ui/style.css';
import { attachKeyboardShell } from '../../../_lib/keyboard-shell.js';
import { kairoSVG } from '../../../_lib/kairo.js';
import { h, clear } from './dom.js';
import {
  MAPS, mapDefOf, boardOf, tileCountOf, pathOf, decoCells, tileGrid, PALETTE,
  CHARACTERS, AI_CHARACTERS, CHIP_COLORS, SHOP_ITEMS,
  SWIFT_CAP, CHARM_CAP, EQUAL_CAP, boomMult,
  rentOf,
} from '../config.js';
import {
  newGame, rollAndMove, resolveTile, buyTile, upgradeTile, declineDecision,
  endTurn, aiDecide, ranking, ownedTilesOf, hasMonopoly, log as logSt, mapOf,
  buyItem, leaveShop, aiShopBuy, useItem,
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

// 地图迷你缩略图：按路径（外环+内街）落子，路径格按类型/街区着色，腹地为浅色
function miniBoard(map) {
  const tiles = boardOf(map.key);
  const path = pathOf(map);
  const wrap = h('span', { class: 'map-mini' });
  wrap.style.gridTemplateColumns = `repeat(${map.cols}, 1fr)`;
  for (let i = 0; i < map.cols * map.rows; i++) {
    wrap.appendChild(h('i', { class: 'map-mini__cell inner' }));
  }
  tiles.forEach((t, i) => {
    const g = path[i];
    const cell = wrap.children[(g.row - 1) * map.cols + (g.col - 1)];
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
            h('span', { class: 'muted' }, `第 ${info.round} 回合 · ${info.players} 人${info.finished ? ' · 已终局' : ''}`))
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
        h('span', { class: 'hero-perk' }, c.tag),
      ));
    }
    const hero = CHARACTERS.find((c) => c.key === t.heroKey) || CHARACTERS[0];
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
          ? `${tileCountOf(m)} 格 · 淘汰制`
          : `在「${prev ? prev.name : ''}」夺冠解锁`),
      ));
    });
    wrap.append(
      h('div', { class: 'create__head' },
        h('button', { class: 'btn-ghost', onClick: () => this.showLauncher() }, '← 返回'),
        h('h1', null, '组建商队'),
      ),
      h('div', { class: 'panel' },
        h('h4', null, '选择主角（天赋各异）'),
        heroRow,
        h('p', { class: 'perk-note' }, h('b', null, `${hero.name} · ${hero.tag}`), ` — ${hero.desc}`),
      ),
      h('div', { class: 'panel' },
        h('h4', null, 'AI 对手'),
        aiRow,
        h('p', { class: 'muted', style: { marginTop: '0.4rem' } },
          `对手依次为：${AI_CHARACTERS.slice(0, t.aiCount).map((a) => `${a.name}（${a.tag}）`).join('、')}`),
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
    const path = pathOf(map);
    // 棋盘视口（可拖动平移）→ 平移层 → 固定像素网格棋盘 + 棋子层
    this.boardView = h('div', { class: 'board-view' });
    this.boardPan = h('div', { class: 'board-pan' });
    this.boardEl = h('div', { class: 'board' });
    this.boardEl.style.gridTemplateColumns = `repeat(${map.cols}, ${CELL}px)`;
    this.boardEl.style.gridTemplateRows = `repeat(${map.rows}, ${CELL}px)`;
    this.tileEls = [];
    tiles.forEach((t, i) => {
      const g = path[i];
      const el = h('button', { class: `tile t-${t.type}`, dataset: { tile: String(i) }, onClick: () => this.showTileSheet(i) });
      el.style.gridRow = String(g.row);
      el.style.gridColumn = String(g.col);
      this.tileEls.push(el);
      this.boardEl.appendChild(el);
    });
    // 腹地点缀风景（不挡路、不可点），让地图中央有烟火气
    for (const d of decoCells(map)) {
      const el = h('div', { class: 'tile deco' }, d.icon);
      el.style.gridRow = String(d.row);
      el.style.gridColumn = String(d.col);
      this.boardEl.appendChild(el);
    }
    this.tokenLayer = h('div', { class: 'token-layer' });
    this.tokenEls = [];
    this.boardPan.append(this.boardEl, this.tokenLayer);
    this.boardView.appendChild(this.boardPan);
    // 浮动信息条（悬浮于棋盘上方，不挡拖动）：双骰 + 当前回合 + 提示
    this.diceEl = h('span', { class: 'bh-dice' }, '🎲🎲');
    this.centerName = h('b', { class: 'bh-name' }, '—');
    this.centerHint = h('span', { class: 'bh-hint muted' }, '掷骰开始');
    this.boardHud = h('div', { class: 'board-hud' },
      this.diceEl,
      h('div', { class: 'bh-main' }, this.centerName, this.centerHint),
    );
    this.boardView.appendChild(this.boardHud);
    this.stage.appendChild(this.boardView);
    this.wirePan();
    this.measureBoard();
  }

  buildHud() {
    // 玩家 HUD（4 人时切换 2×2 网格，避免名字/金币挤在一行相互重叠）
    this.hudEl = h('div', { class: 'hud' });
    this.stage.appendChild(this.hudEl);
    // 运行记录：默认收缩成一行（头部预览最新一条），点击展开后可滚动翻看全部历史
    this._logOpen = false;
    this._logStick = true;    // 用户滚到底部时才自动跟随新日志，翻历史不打扰
    this._logRendered = '';   // 已渲染日志的签名（长度+末条文本）
    this.logPeek = h('span', { class: 'log-strip__peek' }, '暂无记录');
    this.logToggle = h('span', { class: 'log-strip__toggle' }, '▸');
    this.logLines = h('div', { class: 'log-strip__lines' });
    this.logLines.addEventListener('scroll', () => {
      this._logStick = this.logLines.scrollHeight - this.logLines.scrollTop - this.logLines.clientHeight < 24;
    });
    this.logEl = h('div', { class: 'log-strip collapsed' },
      h('div', { class: 'log-strip__head', onClick: () => this.toggleLog() },
        h('span', { class: 'log-strip__title' }, '运行记录'),
        this.logPeek,
        this.logToggle,
      ),
      this.logLines,
    );
    this.stage.appendChild(this.logEl);
  }

  toggleLog() {
    this._logOpen = !this._logOpen;
    this.logEl.classList.toggle('collapsed', !this._logOpen);
    this.logToggle.textContent = this._logOpen ? '▾' : '▸';
    if (this._logOpen) {
      this._logStick = true;
      this.scrollLog(true);
    }
  }

  scrollLog(force = false) {
    if (!this._logOpen) return;
    if (!force && !this._logStick) return; // 用户正在翻历史时不抢滚动位置
    this.logLines.scrollTop = this.logLines.scrollHeight;
  }

  buildBottom() {
    this.rollBtn = h('button', {
      class: 'turn-btn',
      onClick: () => this.onRollTap(),
    }, '🎲 掷骰子');
    this.menuBtn = h('button', { class: 'icon-btn', title: '菜单', onClick: () => this.showMenuSheet() }, '☰');
    this.itemBadge = h('span', { class: 'icon-badge', style: { display: 'none' } }, '0');
    this.itemBtn = h('button', {
      class: 'icon-btn item-btn', title: '道具',
      onClick: () => this.showItemSheet(),
    }, h('span', null, '🎒'), this.itemBadge);
    this.bottomBar = h('div', { class: 'bottom-bar' },
      this.menuBtn,
      this.itemBtn,
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
    const { row, col } = tileGrid(st.players[pIdx].pos, map);
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
    const { row, col } = tileGrid(tileIdx, map);
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
    // HUD（4 人局切 2×2 网格，卡片不再挤压重叠）
    clear(this.hudEl);
    this.hudEl.className = `hud${st.players.length >= 4 ? ' hud--grid' : ''}`;
    st.players.forEach((p, i) => {
      const badges = [];
      if (!p.bankrupt && p.items && p.items.swift > 0) badges.push(`🌬️${p.items.swift}`);
      if (!p.bankrupt && p.items && p.items.charms > 0) badges.push(`🧿${p.items.charms}`);
      if (!p.bankrupt && p.items && p.items.equal > 0) badges.push(`🎴${p.items.equal}`);
      this.hudEl.appendChild(h('div', {
        class: `pcard ${i === st.turnIdx ? 'active' : ''} ${p.bankrupt ? 'dead' : ''}`,
        style: { '--chip': CHIP_COLORS[i % CHIP_COLORS.length] },
      },
        h('span', { class: 'pcard__ava', html: kairoSVG(p.look, 30) }),
        h('div', { class: 'pcard__body' },
          h('div', { class: 'pcard__name' }, `${p.name}${p.isAI ? '' : '（你）'}`),
          h('div', { class: 'pcard__cash' }, p.bankrupt ? '破产' : `$${p.cash}`),
        ),
        h('div', { class: 'pcard__side' },
          h('span', { class: 'pcard__prop' }, `${ownedTilesOf(st, i).length} 处`),
          h('span', { class: 'pcard__items' }, badges.join(' ')),
          p.skipTurns > 0 && !p.bankrupt ? h('span', { class: 'pcard__skip' }, '停') : null,
        ),
      ));
    });
    // 浮动信息条
    const cp = st.players[st.turnIdx];
    const boom = boomMult(st.round);
    const boomTxt = boom > 1 ? ` · 繁荣×${Number(boom.toFixed(2))}` : '';
    this.centerName.textContent = st.finished ? '对局结束' : `${cp.name} 的回合`;
    this.centerHint.textContent = st.finished
      ? '查看结算'
      : `第 ${st.round} 回合${boomTxt} · ${st.phase === 'roll' ? (cp.isAI ? '思考中…' : '掷骰前进') : '结算中…'}`;
    if (!st.finished) {
      const [rd1, rd2] = st.lastRoll || [0, 0];
      this.diceEl.textContent = rd1 + rd2 > 0 ? `🎲${rd1}+${rd2}` : '🎲🎲';
    }
    // 按钮
    const canRoll = !this.busy && !st.finished && st.phase === 'roll' && !cp.isAI;
    this.rollBtn.disabled = !canRoll;
    // 道具按钮角标：主角待打出的均富卡数
    const hero = st.players[0];
    const eqHeld = hero && hero.items ? (hero.items.equal || 0) : 0;
    this.itemBadge.textContent = String(eqHeld);
    this.itemBadge.style.display = eqHeld > 0 ? '' : 'none';
    // 日志：全量渲染（可滚动翻历史），收缩时仅在标题行预览最新一条。
    // 日志封顶 80 条后长度不再变化（新增即截断），故以「长度+末条」联合判变更。
    const logSig = `${st.log.length}:${st.log[st.log.length - 1] || ''}`;
    if (logSig !== this._logRendered) {
      clear(this.logLines);
      st.log.forEach((t) => this.logLines.appendChild(h('div', { class: 'ln' }, t)));
      this._logRendered = logSig;
      this.scrollLog();
    }
    this.logPeek.textContent = st.log.length ? st.log[st.log.length - 1] : '暂无记录';
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
        this.diceEl.textContent = `🎲${1 + ((i * 5 + pIdx) % 6)}+${1 + ((i * 3 + pIdx + 2) % 6)}`;
        await sleep(60);
      }
      const r = rollAndMove(st);
      if (r.skipped) {
        this.refresh();
        this.toast(`${st.players[pIdx].name} 停掷一回合`);
      } else if (r.jailed) {
        this.diceEl.textContent = `🎲${r.d1}+${r.d2}`;
        this.refresh();
        this.centerOnToken(pIdx, true);
        this.toast(`${st.players[pIdx].name} 连掷三次对子，被疑出千押入大牢！`, 'bad');
        await sleep(900);
      } else {
        this.diceEl.textContent = `🎲${r.d1}+${r.d2}`;
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
        const boom = boomMult(st.round);
        this.toast(`${p.name} 付给 ${st.players[res.owner].name} 租金 $${res.amount}`
          + `${res.mono ? '（垄断×1.5）' : ''}${boom > 1 ? `（繁荣×${Number(boom.toFixed(2))}）` : ''}`);
        await sleep(isAI ? 600 : 800);
        break;
      }
      case 'charm': {
        this.toast(`🧿 ${p.name} 的护身符碎裂，免除了这笔租金`);
        await sleep(700);
        break;
      }
      case 'shop': {
        this.centerOnToken(pIdx, true);
        if (isAI) {
          const bought = aiShopBuy(st);
          leaveShop(st);
          this.toast(bought.length
            ? `${p.name} 采购了：${bought.map((id) => SHOP_ITEMS.find((s) => s.id === id).name).join('、')}`
            : `${p.name} 逛了逛商店，什么也没买`);
          await sleep(900);
        } else {
          await this.showShopSheet();
        }
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

  // —— 钱包条：交易类弹窗顶部内嵌玩家现金（弹窗为底部抽屉会盖住 HUD，
  //    不内嵌的话购物/买地时完全看不到自己有多少钱）——
  walletRow(p) {
    return h('div', { class: 'wallet-row' },
      h('span', { class: 'wallet-row__ava', html: kairoSVG(p.look, 34) }),
      h('b', { class: 'wallet-row__name' }, `${p.name}${p.isAI ? '' : '（你）'}`),
      h('span', { class: 'grow' }),
      h('span', { class: 'wallet-row__cash' }, p.bankrupt ? '已破产' : `现金 $${p.cash}`),
    );
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
      // 展示口径与实收一致：基础租金 × 繁荣系数（见 resolveTile 的租金计算）
      const boom = boomMult(st.round);
      const rentNow = (lv, mono) => Math.round(rentOf(t, lv, mono) * boom);
      const done = (fn) => { fn(); this.closeSheet(); this.refresh(); resolve(); };
      // 点遮罩 = 放弃（与「放弃」按钮同路径），避免 await 挂起软锁
      this.showSheet({
        title: isBuy ? `购买「${t.name}」` : `升级「${t.name}」`,
        body: h('div', { class: 'buy-sheet' },
          this.walletRow(p),
          h('div', { class: 'muted buy-sheet__price' },
            `${d.name} · ${isBuy
              ? (res.listPrice && res.listPrice !== res.price ? `地价 $${res.price}（天赋折扣，原价 $${res.listPrice}）` : `地价 $${res.price}`)
              : `当前 ${ts.level} 级 → ${ts.level + 1} 级`}${afford ? '' : ' · 现金不足'}`),
          h('div', { class: 'rent-table' },
            isBuy
              ? [1, 2, 3].map((lv) => h('div', { class: 'rent-row' },
                  h('span', null, `${lv} 级租金`), h('b', null, `$${rentNow(lv, false)}`),
                  lv === 1 ? h('span', { class: 'muted' }, `（垄断 ×1.5 → $${rentNow(lv, true)}）`) : null))
              : h('div', { class: 'rent-row' }, h('span', null, `升后租金`), h('b', null, `$${rentNow(ts.level + 1, false)}`)),
            boom > 1 ? h('div', { class: 'rent-row' },
              h('span', { class: 'muted' }, `城市繁荣 ×${Number(boom.toFixed(2))}（已计入）`)) : null,
          ),
        ),
        foot: [
          h('button', { class: 'btn-ghost', onClick: () => done(() => declineDecision(st)) }, '放弃'),
          h('button', {
            class: 'btn-primary', disabled: !afford,
            onClick: () => done(() => { isBuy ? buyTile(st, res.tile) : upgradeTile(st, res.tile); }),
          }, isBuy ? `买下 $${cost}` : `升级 $${cost}`),
        ],
      }, { onMask: () => done(() => declineDecision(st)) });
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
      }, { onMask: close }); // 点遮罩 = 继续，避免 await 挂起软锁
    });
  }

  // 商店：道具列表 + 已持有量 + 上限，可连续购买，离开后回到回合流程。
  // 顶部内嵌钱包条：抽屉弹窗盖住 HUD，不内嵌就看不到自己有多少钱。
  // 点遮罩 = 离开商店（与按钮同路径）：若走默认 closeSheet 会让 playTurn 的
  // await 永久挂起、busy 卡死，对局软锁。
  showShopSheet() {
    return new Promise((resolve) => {
      const st = this.state;
      const finish = () => { this.closeSheet(); resolve(); };
      const leave = () => { leaveShop(st); this.refresh(); finish(); };
      const render = () => {
        const p = st.players[st.turnIdx];
        const list = SHOP_ITEMS.map((item) => {
          const held = item.id === 'swift'
            ? `生效剩 ${p.items.swift}/${SWIFT_CAP} 次`
            : item.id === 'charm'
              ? `持有 ${p.items.charms}/${CHARM_CAP} 枚`
              : `持有 ${p.items.equal} 张 · 本局限购 ${p.equalBought}/${EQUAL_CAP}`;
          const capped = (item.id === 'swift' && p.items.swift >= SWIFT_CAP)
            || (item.id === 'charm' && p.items.charms >= CHARM_CAP)
            || (item.id === 'equal' && p.equalBought >= EQUAL_CAP);
          const afford = p.cash >= item.price && !capped;
          return h('div', { class: 'shop-item' },
            h('span', { class: 'shop-item__icon' }, item.icon),
            h('div', { class: 'grow' },
              h('div', null, h('b', null, item.name), ' ', h('span', { class: 'shop-item__price' }, `$${item.price}`)),
              h('div', { class: 'muted' }, item.desc),
              h('div', { class: 'muted shop-item__held' }, held),
            ),
            h('button', {
              class: 'btn-ghost',
              disabled: !afford,
              onClick: () => {
                const r = buyItem(st, item.id);
                this.refresh();
                if (!r.ok) this.toast(r.reason === 'cap' ? '已达上限'
                  : r.reason === 'no_target' ? '没有可平分的存活对手'
                  : '现金不足', 'bad');
                else if (item.id === 'equal') this.toast('均富卡已收入道具栏（🎒），自己回合可打出');
                render();
              },
            }, capped ? '已满' : '购买'),
          );
        });
        this.showSheet({
          title: '🛒 商店',
          body: h('div', { class: 'shop-sheet' },
            this.walletRow(p),
            h('p', { class: 'muted' }, '掌柜笑眯眯：客官，来点什么？'),
            ...list,
          ),
          foot: [h('button', { class: 'btn-primary', onClick: leave }, '离开商店')],
        }, { onMask: leave });
      };
      render();
    });
  }

  // ============ 道具栏（主角道具总览 + 均富卡择机打出） ============
  // 均富卡购入后不再立即生效，而是收进道具栏：这里展示持有量，
  // 并在自己回合（掷骰前 roll / 收尾 end 阶段）提供「打出」入口。
  showItemSheet() {
    const st = this.state;
    if (!st) return;
    const render = () => {
      const me = st.players[0];
      const eqHeld = (me.items && me.items.equal) || 0;
      const myTurn = !st.finished && st.turnIdx === 0 && (st.phase === 'roll' || st.phase === 'end');
      const canPlay = myTurn && eqHeld > 0 && !this.busy;
      const rows = [
        { id: 'swift', icon: '🌬️', name: '顺风骰', note: '掷骰时自动生效，无需操作' },
        { id: 'charm', icon: '🧿', name: '护身符', note: '交租时自动抵消一次，无需操作' },
        {
          id: 'equal', icon: '🎴', name: '均富卡',
          note: st.finished ? '对局已结束'
            : !myTurn ? '仅在自己的回合（掷骰前后）可打出'
            : eqHeld < 1 ? '暂无可打出的均富卡'
            : '打出后立即与现金最多的对手平分双方现金',
        },
      ];
      this.showSheet({
        title: '🎒 道具栏',
        body: h('div', { class: 'item-sheet' },
          this.walletRow(me),
          ...rows.map((r) => {
            const held = r.id === 'swift' ? me.items.swift : r.id === 'charm' ? me.items.charms : eqHeld;
            return h('div', { class: `shop-item${held > 0 ? '' : ' dim'}` },
              h('span', { class: 'shop-item__icon' }, r.icon),
              h('div', { class: 'grow' },
                h('div', null, h('b', null, r.name), ' ', h('span', { class: 'muted' }, `持有 ${held}`)),
                h('div', { class: 'muted shop-item__held' }, r.note),
              ),
              r.id === 'equal' ? h('button', {
                class: 'btn-primary', disabled: !canPlay,
                onClick: () => {
                  const r2 = useItem(st, 'equal');
                  if (!r2.ok) { this.toast('现在无法打出', 'bad'); return; }
                  this.refresh();
                  this.toast('均富卡生效：已与最富的对手平分现金');
                  render();
                },
              }, '打出') : null,
            );
          }),
          h('p', { class: 'muted item-sheet__tip' }, '顺风骰与护身符会在恰当时机自动生效；均富卡可择机打出，在商店购得后到这里使用。'),
        ),
        foot: [h('button', { class: 'btn-primary', onClick: () => this.closeSheet() }, '关闭')],
      });
    };
    render();
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
      const boom = boomMult(st.round); // 展示口径与实收一致（含繁荣系数）
      const rentNow = (lv, mono) => Math.round(rentOf(t, lv, mono) * boom);
      body.push(h('div', { class: 'muted', style: { marginBottom: '0.4rem' } },
        `${d.name} · 地价 $${t.price}`));
      body.push(h('div', { class: 'rent-table' },
        [1, 2, 3].map((lv) => h('div', { class: 'rent-row' },
          h('span', null, `${lv} 级租金`),
          h('b', null, `$${rentNow(lv, false)}`),
          lv === 3 ? h('span', { class: 'muted' }, `（垄断 $${rentNow(3, true)}）`) : null,
        )),
        boom > 1 ? h('div', { class: 'rent-row' },
          h('span', { class: 'muted' }, `城市繁荣 ×${Number(boom.toFixed(2))}（已计入）`)) : null));
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
        shop: '商店：可购顺风骰（掷骰自动多走）、护身符（自动免一次租金）、均富卡（收入道具栏，自己回合可打出，与最富对手平分现金）。',
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
        h('button', {
          class: 'btn-ghost', style: { flex: 1 }, disabled: this.busy,
          onClick: () => this.exportCurrent(),
        }, '导出'),
        h('button', {
          class: 'btn-ghost', style: { flex: 1 }, disabled: this.busy,
          onClick: () => this.importPrompt(),
        }, '导入'),
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
    const reasonText = {
      last: '对手全部破产，一家独大！',
      dead: '你已破产出局，商途折戟。',
    }[st.finished.reason] || '对局结束，清点资产。';
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
  // opts.blocker：点遮罩不可关（终局结算等强制弹窗）；
  // opts.onMask：点遮罩的自定义回调（供 Promise 门控弹窗安全收尾，避免挂起 await）。
  showSheet({ title, body, foot }, opts = {}) {
    this.closeSheet();
    const mask = h('div', {
      class: 'sheet-mask',
      onClick: () => {
        if (opts.onMask) { opts.onMask(); return; }
        if (!opts.blocker) this.closeSheet();
      },
    });
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
