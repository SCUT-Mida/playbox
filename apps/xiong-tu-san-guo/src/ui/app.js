// ============================================================================
// 雄图·三国志文明 · UI 控制器（纯原生 DOM）
// 三层屏幕：启动器（新局 / 继续）→ 创角 → 对局（顶栏 + 五标签 + 弹窗）。
// 对局标签：地图 / 势力 / 名将 / 科技 / 系统。
// ============================================================================
import './style.css';
import { attachKeyboardShell } from '../../../_lib/keyboard-shell.js';
import { h, clear, bar } from './dom.js';
import {
  TECHS, FORMATIONS, STRATAGEMS, BUILD_MAX, TECH_MAX_LEVEL, TECH_COST_GOLD,
  TRAINING_MAX, FACTION_COLORS, NEUTRAL_COLOR, seasonOf, clamp,
} from '../config.js';
import { CITIES } from '../data/cities.js';
import { newGame, resolveTurn, cityById, heroById, factionById, playerFaction,
  neighbors, heroesOfFaction, heroesInCity, wildHeroesInCity, prisonersOfFaction,
  troopCap, cmdPoints, cmdRemaining, bestDefender, lordOf, maxDefense } from '../core/state.js';
import { citiesOf, factionGoldIncome, factionGrainNet } from '../core/economy.js';
import { effLead, effWar } from '../core/combat.js';
import { techLevel } from '../core/tech.js';
import * as A from '../core/actions.js';
import { aiTurnAll } from '../core/ai.js';
import { hasSave, saveGame, loadGame, clearSave } from '../core/save.js';
import { chance } from '../core/rng.js';

const STAT_KEYS = [
  ['l', '统'], ['w', '武'], ['i', '智'], ['p', '政'], ['c', '魅'],
];
const TABS = [
  { key: 'map', icon: '🗺️', label: '地图' },
  { key: 'faction', icon: '🏯', label: '势力' },
  { key: 'heroes', icon: '⚔️', label: '名将' },
  { key: 'tech', icon: '📜', label: '科技' },
  { key: 'system', icon: '⚙️', label: '系统' },
];

export class GameUI {
  constructor(parent) {
    this.parent = parent;
    this.state = null;
    this.tab = 'map';
    this.selectedCityId = null;
    this.screen = 'start';
    this.charTemplate = null;
    this.startCityPick = null;
  }

  mount() {
    this.root = h('div', { class: 'xtsg' });
    clear(this.parent);
    this.parent.appendChild(this.root);
    this.toastWrap = h('div', { class: 'toast-wrap' });
    this.stage = h('div', { class: 'stage' });
    this.modalRoot = h('div', { class: 'xtsg-modals' });
    this.root.append(this.toastWrap, this.stage, this.modalRoot);
    this._detachKeyboard = attachKeyboardShell(this.root);
    this.showStart();
    return this;
  }

  destroy() {
    if (this._detachKeyboard) { try { this._detachKeyboard(); } catch (_) {} }
    try { clear(this.parent); } catch (_) {}
  }

  // ============ Toast / Modal ============
  toast(msg) {
    const t = h('div', { class: 'toast' }, msg);
    this.toastWrap.appendChild(t);
    setTimeout(() => { try { this.toastWrap.removeChild(t); } catch (_) {} }, 2400);
  }
  closeModal() { clear(this.modalRoot); }
  openModal({ title, body, foot }) {
    clear(this.modalRoot);
    const card = h('div', { class: 'modal__card' },
      h('div', { class: 'modal__head' }, h('h3', null, title)),
      h('div', { class: 'modal__body' }, body),
      foot ? h('div', { class: 'modal__foot' }, foot) : null,
    );
    // 点遮罩关闭；点卡片内不关闭（避免误触）
    const backdrop = h('div', { class: 'modal', onClick: (e) => { if (e.target === e.currentTarget) this.closeModal(); } }, card);
    this.modalRoot.appendChild(backdrop);
    return card;
  }
  // 带确认/取消的表单弹窗
  openForm(title, bodyNode, onConfirm, confirmLabel = '确认') {
    const foot = [
      h('button', { class: 'btn-ghost grow', onClick: () => this.closeModal() }, '取消'),
      h('button', { class: 'btn-primary grow', onClick: onConfirm }, confirmLabel),
    ];
    return this.openModal({ title, body: bodyNode, foot });
  }

  // ============ 启动器 ============
  showStart() {
    this.screen = 'start';
    this.state = null;
    clear(this.stage);
    const wrap = h('div', { class: 'launcher' },
      h('div', { class: 'launcher__brand' },
        h('div', { class: 'emblem' }, '雄'),
        h('h1', null, '雄图·三国志文明'),
        h('p', { class: 'sub' }, '内政 · 科技 · 名将 · 征伐 · 统一天下'),
      ),
      h('div', { class: 'launcher__menu' },
        h('button', { class: 'btn-primary btn-block', onClick: () => this.showCreate() }, '新游戏'),
        h('button', {
          class: 'btn-ghost btn-block', disabled: !hasSave(), onClick: () => this.continueGame(),
        }, hasSave() ? '继续游戏' : '继续游戏（无存档）'),
      ),
      h('p', { class: 'hint center' }, '选择一座城池起兵，招揽名将、发展内政、征战四方。'),
    );
    this.stage.appendChild(wrap);
  }

  continueGame() {
    const s = loadGame();
    if (!s) { this.toast('存档读取失败'); return; }
    this.state = s;
    this.enterGame();
  }

  // ============ 创角 ============
  showCreate() {
    this.screen = 'create';
    this.charTemplate = { name: '', stats: this.rollStats(), rerolls: 0 };
    this.startCityPick = null;
    this.renderCreate();
  }
  rollStats() {
    const s = {};
    for (const [k] of STAT_KEYS) s[k] = 50 + Math.floor(Math.random() * 51); // 50~100
    return s;
  }
  renderCreate() {
    clear(this.stage);
    const t = this.charTemplate;

    const nameInput = h('input', { type: 'text', maxlength: 4, placeholder: '2~4 个汉字', value: t.name,
      onInput: (e) => { t.name = e.target.value; } });

    const statGrid = h('div', { class: 'stat-grid' },
      STAT_KEYS.map(([k, label]) => h('div', { class: 'stat' },
        h('div', { class: 'stat__k' }, label), h('div', { class: 'stat__v' }, t.stats[k]))));
    const rerollBtn = h('button', { class: 'btn-ghost btn-block', disabled: t.rerolls >= 5,
      onClick: () => { t.stats = this.rollStats(); t.rerolls += 1; this.renderCreate(); } },
      `重新随机属性（${t.rerolls}/5）`);

    const cityPick = h('div', { class: 'city-pick' }, CITIES.map((c) => {
      const sel = this.startCityPick === c.id;
      return h('button', {
        class: `city-pick__item${sel ? ' city-pick__item--sel' : ''}`,
        onClick: () => { this.startCityPick = c.id; this.renderCreate(); },
      },
        h('div', null, h('b', null, c.name)),
        h('div', { class: 'muted' }, c.trait.name),
      );
    }));

    const startBtn = h('button', { class: 'btn-primary btn-block',
      onClick: () => this.beginGame(),
    }, '起兵出征');

    const wrap = h('div', { class: 'create' },
      h('h2', null, '一、立君'),
      h('div', { class: 'create__field' }, h('label', null, '君主姓名（2~4 个汉字）'), nameInput),
      h('div', { class: 'create__field' }, h('label', null, '君主属性'), statGrid, rerollBtn),
      h('h2', null, '二、择都'),
      h('p', { class: 'hint' }, '选择起兵之城。占据诸侯旧都，其旧部将转为在野，可择机登用。'),
      cityPick,
      h('div', { style: { height: '0.8rem' } }),
      startBtn,
      h('div', { style: { height: '0.4rem' } }),
      h('button', { class: 'btn-ghost btn-block', onClick: () => this.showStart() }, '返回'),
    );
    this.stage.appendChild(wrap);
    // 挂载临时引用，便于 beginGame 读取输入框最新值
    this._nameInput = nameInput;
  }

  beginGame() {
    const name = (this._nameInput?.value || this.charTemplate.name || '').trim();
    if (!/^[一-龥]{2,4}$/.test(name)) { this.toast('君主姓名须为 2~4 个汉字'); return; }
    if (!this.startCityPick) { this.toast('请选择起兵之城'); return; }
    this.state = newGame({ lordName: name, startCity: this.startCityPick, stats: this.charTemplate.stats });
    saveGame(this.state);
    this.toast(`${name} 于 ${cityById(this.state, this.startCityPick).name} 起兵！`);
    this.enterGame();
  }

  // ============ 进入对局 ============
  enterGame() {
    this.screen = 'game';
    this.tab = 'map';
    this.selectedCityId = playerFaction(this.state) && citiesOf(this.state, this.state.playerFactionId)[0]?.id;
    this.renderGame();
  }

  renderGame() {
    if (this.state.over) { this.renderGameOver(); return; }
    clear(this.stage);
    this.gameRoot = h('div', { class: 'game' });
    this.stage.appendChild(this.gameRoot);
    this.topbar = h('div', { class: 'topbar' });
    this.tabbar = h('div', { class: 'tabbar' });
    this.content = h('div', { class: 'content' });
    this.gameRoot.append(this.topbar, this.tabbar, this.content);
    this.refreshTopbar();
    this.renderTabbar();
    this.renderContent();
  }

  refreshTopbar() {
    const s = this.state;
    const fac = playerFaction(s);
    const goldIn = Math.round(factionGoldIncome(s, s.playerFactionId));
    const grainNet = factionGrainNet(s, s.playerFactionId);
    const cmd = cmdRemaining(s, s.playerFactionId);
    clear(this.topbar);
    this.topbar.appendChild(h('div', { class: 'topbar__row' },
      h('span', { class: 'topbar__title' }, `${fac.name}`),
      h('span', { class: 'res-pill' }, `${seasonOf(s.turn)} · 第${s.turn}回合`),
      h('span', { class: 'res-pill' }, `金 `, h('b', null, Math.round(fac.money))),
      h('span', { class: 'res-pill' }, `粮 `, h('b', null, Math.round(fac.grain))),
      h('span', { class: 'res-pill cmd-pill' }, `令 ${cmd}`),
    ));
    this.topbar.appendChild(h('div', { class: 'topbar__row', style: { marginTop: '0.35rem' } },
      h('span', { class: 'hint', style: { margin: 0 } }, `金 +${goldIn}/回 · 粮 ${Math.round(grainNet.net)}/回（产${Math.round(grainNet.prod)} 耗${Math.round(grainNet.upkeep)}）`),
      h('span', { class: 'grow' }),
      h('button', { class: 'btn-primary', onClick: () => this.confirmEndTurn() }, '结束回合'),
    ));
  }

  renderTabbar() {
    clear(this.tabbar);
    for (const t of TABS) {
      this.tabbar.appendChild(h('button', {
        class: `tab${this.tab === t.key ? ' tab--active' : ''}`,
        onClick: () => { this.tab = t.key; this.renderTabbar(); this.renderContent(); },
      }, `${t.icon} ${t.label}`));
    }
  }

  renderContent() {
    clear(this.content);
    if (this.tab === 'map') this.renderMap();
    else if (this.tab === 'faction') this.renderFaction();
    else if (this.tab === 'heroes') this.renderHeroes();
    else if (this.tab === 'tech') this.renderTech();
    else if (this.tab === 'system') this.renderSystem();
  }

  // ============ 地图 ============
  renderMap() {
    const s = this.state;
    const wrap = h('div', { class: 'map-wrap' });
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'map-svg');
    svg.setAttribute('viewBox', '0 0 1000 760');
    svg.setAttribute('preserveAspectRatio', 'none');
    // 连线（去重）
    for (const c of s.cities) {
      for (const nid of c.adjacent) {
        if (c.id < nid) {
          const n = cityById(s, nid);
          const ln = document.createElementNS(svgNS, 'line');
          ln.setAttribute('x1', c.x); ln.setAttribute('y1', c.y);
          ln.setAttribute('x2', n.x); ln.setAttribute('y2', n.y);
          ln.setAttribute('class', 'map-line');
          svg.appendChild(ln);
        }
      }
    }
    wrap.appendChild(svg);
    // 城市点
    for (const c of s.cities) {
      const fac = c.ownerFactionId != null ? factionById(s, c.ownerFactionId) : null;
      const color = fac ? fac.color : NEUTRAL_COLOR;
      const isPlayer = c.ownerFactionId === s.playerFactionId;
      const isSel = this.selectedCityId === c.id;
      const dot = h('button', {
        class: `map-dot${isPlayer ? ' map-dot--player' : ''}${isSel ? ' map-dot--selected' : ''}`,
        style: { left: `${(c.x / 1000) * 100}%`, top: `${(c.y / 760) * 100}%`, background: color },
        onClick: () => { this.selectedCityId = c.id; this.openCityMenu(c.id); },
      }, c.name.slice(0, 2));
      wrap.appendChild(dot);
      wrap.appendChild(h('span', { class: 'map-label', style: { left: `${(c.x / 1000) * 100}%`, top: `${(c.y / 760) * 100}%` } }, c.name));
    }
    this.content.appendChild(h('div', null,
      h('h3', null, '九州形势图'),
      h('p', { class: 'hint' }, '点击城市查看详情与指令。金边为己方，灰点为空城，他色为诸侯。'),
      wrap,
    ));
    // 提示当前选中
    if (this.selectedCityId) {
      const c = cityById(s, this.selectedCityId);
      this.content.appendChild(h('div', { class: 'hint center' }, `已选：${c ? c.name : '无'}（再次点击城市可操作）`));
    }
  }

  // ============ 城市操作菜单 ============
  openCityMenu(cityId) {
    const s = this.state;
    const c = cityById(s, cityId);
    if (!c) return;
    this.renderMap(); // 刷新选中态
    const owned = c.ownerFactionId === s.playerFactionId;
    if (owned) this.openOwnedCity(c);
    else this.openEnemyCity(c);
  }

  cityHeader(c) {
    const fac = c.ownerFactionId != null ? factionById(this.state, c.ownerFactionId) : null;
    const color = fac ? fac.color : NEUTRAL_COLOR;
    return h('div', { class: 'panel__head' },
      h('span', { class: 'panel__swatch', style: { background: color } }),
      h('h4', null, c.name),
      h('span', { class: 'hero-card__sub' }, `${c.trait.name} · ${c.trait.desc}`),
    );
  }
  cityRows(c) {
    const gov = c.governorHeroId ? heroById(this.state, c.governorHeroId) : null;
    const r = (k, v) => h('div', null, h('span', { class: 'muted' }, k), ' ', v);
    return h('div', { class: 'panel__rows' },
      r('归属', c.ownerFactionId != null ? (factionById(this.state, c.ownerFactionId)?.name || '—') : '空城'),
      r('人口', `${Math.round(c.population)} / ${c.maxPopulation}`),
      r('士兵', Math.round(c.soldiers)),
      r('城防', `${Math.round(c.defense)}`),
      r('农田', `Lv${c.farmLevel}`),
      r('市集', `Lv${c.marketLevel}`),
      r('城墙', `Lv${c.wallLevel}`),
      r('兵营', `Lv${c.barracksLevel}`),
      r('训练度', c.training),
      r('太守', gov ? gov.name : '—'),
    );
  }

  openOwnedCity(c) {
    const s = this.state;
    const fid = s.playerFactionId;
    const cmdBtn = (label, fn, danger) => h('button', {
      class: `cmd-btn ${danger ? 'btn-danger' : 'btn-primary'}`, onClick: () => { const r = fn(); if (r.msg) this.toast(r.msg); this.afterAction(); },
    }, label);
    const grid = h('div', { class: 'cmd-grid' },
      cmdBtn(`农田 Lv${c.farmLevel}`, () => A.developFarm(s, c.id)),
      cmdBtn(`市集 Lv${c.marketLevel}`, () => A.developMarket(s, c.id)),
      cmdBtn(`城墙 Lv${c.wallLevel}`, () => A.buildWall(s, c.id)),
      cmdBtn('征兵', () => this.uiRecruit(c)),
      cmdBtn('操练', () => A.train(s, c.id)),
      cmdBtn('探索', () => A.explore(s, c.id)),
    );
    const advBtns = h('div', { class: 'hero-card__foot' },
      h('button', { class: 'btn-jade', onClick: () => this.uiAppoint(c) }, '任命太守'),
      h('button', { class: 'btn-jade', onClick: () => this.uiMoveHero(c) }, '调遣武将'),
      h('button', { class: 'btn-primary', onClick: () => this.uiTransport(c) }, '输送资源'),
    );
    // 在野名将登用入口
    const wilds = wildHeroesInCity(s, c.id).filter((w) => w.discovered);
    const wildBlock = wilds.length ? h('div', { style: { marginTop: '0.6rem' } },
      h('div', { class: 'hint' }, '本城在野名将：'),
      h('div', { class: 'hero-card__foot' }, wilds.map((w) => h('button', { class: 'btn-ghost', onClick: () => { const r = A.recruitHero(s, w.id); this.toast(r.msg); this.afterAction(); } }, `登用 ${w.name}`))),
    ) : null;

    const body = h('div', null, this.cityHeader(c), this.cityRows(c), grid, advBtns, wildBlock);
    this.openModal({ title: `城务 · ${c.name}`, body, foot: [h('button', { class: 'btn-ghost grow', onClick: () => this.closeModal() }, '关闭')] });
  }

  openEnemyCity(c) {
    const s = this.state;
    const body = h('div', null,
      this.cityHeader(c),
      this.cityRows(c),
      h('div', { class: 'hero-card__foot' },
        h('button', { class: 'btn-danger', onClick: () => this.uiCampaign(c) }, '出征攻打'),
        h('button', { class: 'btn-ghost', onClick: () => this.uiStratagem(c) }, '施计'),
      ),
    );
    this.openModal({ title: `敌情 · ${c.name}`, body, foot: [h('button', { class: 'btn-ghost grow', onClick: () => this.closeModal() }, '关闭')] });
  }

  // —— 征兵 ——
  uiRecruit(c) {
    const s = this.state;
    const fac = playerFaction(s);
    let n = Math.min(1000, Math.floor(c.population * 0.1));
    n = Math.max(50, n);
    const input = h('input', { type: 'number', value: n, min: 50, step: 50, style: { width: '5rem' } });
    const body = h('div', null,
      h('p', { class: 'hint' }, `城中人口 ${Math.round(c.population)}，金 ${Math.round(fac.money)}。每兵耗 1.5 金 + 1 人口。`),
      h('div', { class: 'create__field' }, h('label', null, '征兵数量'), input),
    );
    this.openForm('征兵', body, () => {
      const cnt = clamp(parseInt(input.value, 10) || 0, 0, 99999);
      const r = A.recruit(s, c.id, cnt);
      this.toast(r.msg);
      this.closeModal();
      this.afterAction();
    }, '征兵');
    return { ok: true, msg: '' };
  }

  // —— 任命太守 ——
  uiAppoint(c) {
    const s = this.state;
    const roster = heroesInCity(s, c.id, s.playerFactionId);
    if (!roster.length) { this.toast('城中无可任命之武将'); return; }
    const sel = h('select', null, roster.map((h2) => h('option', { value: h2.id }, `${h2.name}（统${h2.stats.l}）`)));
    sel.value = c.governorHeroId || roster[0].id;
    const body = h('div', null, h('p', { class: 'hint' }, '太守政治影响本城人口增长。'), sel);
    this.openForm('任命太守', body, () => {
      const r = A.appointGovernor(s, c.id, sel.value);
      this.toast(r.msg); this.closeModal(); this.afterAction();
    }, '任命');
  }

  // —— 调遣武将（本城 → 邻接己城）——
  uiMoveHero(c) {
    const s = this.state;
    const roster = heroesInCity(s, c.id, s.playerFactionId);
    const targets = neighbors(s, c.id).filter((n) => n.ownerFactionId === s.playerFactionId);
    if (!roster.length || !targets.length) { this.toast('无可调遣武将或无邻接己城'); return; }
    const hSel = h('select', null, roster.map((h2) => h('option', { value: h2.id }, h2.name)));
    const tSel = h('select', null, targets.map((n) => h('option', { value: n.id }, n.name)));
    const body = h('div', null, h('p', { class: 'hint' }, '将本城武将调往相邻己方城市。'), hSel, h('div', { style: { height: '0.4rem' } }), tSel);
    this.openForm('调遣武将', body, () => {
      const r = A.moveHero(s, hSel.value, tSel.value);
      this.toast(r.msg); this.closeModal(); this.afterAction();
    }, '调遣');
  }

  // —— 输送资源 ——
  uiTransport(c) {
    const s = this.state;
    const targets = neighbors(s, c.id).filter((n) => n.ownerFactionId === s.playerFactionId);
    if (!targets.length) { this.toast('无邻接己城可输送'); return; }
    const fac = playerFaction(s);
    const tSel = h('select', null, targets.map((n) => h('option', { value: n.id }, n.name)));
    const sIn = h('input', { type: 'number', value: Math.min(500, c.soldiers), min: 0, style: { width: '5rem' } });
    const body = h('div', null,
      h('p', { class: 'hint' }, `金 ${Math.round(fac.money)} · 粮 ${Math.round(fac.grain)}（势力共享，无需输送）· 本城兵 ${Math.round(c.soldiers)}`),
      h('div', { class: 'create__field' }, h('label', null, '目标城市'), tSel),
      h('div', { class: 'stat-grid' },
        h('div', { class: 'stat' }, h('div', { class: 'stat__k' }, '兵'), h('div', { class: 'stat__v', style: { fontSize: '0.9rem' } }, sIn)),
      ),
    );
    this.openForm('输送士兵', body, () => {
      const r = A.transport(s, c.id, tSel.value, { soldiers: parseInt(sIn.value, 10) || 0 });
      this.toast(r.msg); this.closeModal(); this.afterAction();
    }, '输送');
  }

  // —— 出征 ——
  uiCampaign(target) {
    const s = this.state;
    // 可出发的己方邻城
    const sources = neighbors(s, target.id).filter((n) => n.ownerFactionId === s.playerFactionId);
    if (!sources.length) { this.toast('无可出发的相邻己城'); return; }
    const srcSel = h('select', null, sources.map((n) => h('option', { value: n.id }, n.name)));
    const formSel = h('select', null, Object.entries(FORMATIONS).map(([k, f]) => h('option', { value: k }, `${f.name}（${f.desc}）`)));
    const genSel = h('select');
    const troopsIn = h('input', { type: 'number', value: 1000, min: 100, step: 100, style: { width: '5rem' } });
    const refreshGenerals = () => {
      const src = cityById(s, srcSel.value);
      const gens = heroesInCity(s, src.id, s.playerFactionId);
      clear(genSel);
      if (!gens.length) { genSel.appendChild(h('option', null, '无可用武将')); return; }
      for (const g of gens) genSel.appendChild(h('option', { value: g.id }, `${g.name}（统${g.stats.l} · 上限${troopCap(s, g)}）`));
      const g = gens[0];
      troopsIn.max = Math.min(src.soldiers, troopCap(s, g));
      troopsIn.value = Math.min(parseInt(troopsIn.value, 10) || 1000, parseInt(troopsIn.max, 10));
    };
    srcSel.addEventListener('change', refreshGenerals);
    const body = h('div', null,
      h('p', { class: 'hint' }, `攻打 ${target.name}（守军 ${Math.round(target.soldiers)} · 城防 ${Math.round(target.defense)}）`),
      h('div', { class: 'create__field' }, h('label', null, '出发城市'), srcSel),
      h('div', { class: 'create__field' }, h('label', null, '主将'), genSel),
      h('div', { class: 'create__field' }, h('label', null, '出兵数量（按路程耗粮）'), troopsIn),
      h('div', { class: 'create__field' }, h('label', null, '阵型'), formSel),
    );
    this.openForm('出征', body, () => {
      const src = cityById(s, srcSel.value);
      const g = heroById(s, genSel.value);
      if (!g) { this.toast('请选择主将'); return; }
      const r = A.campaign(s, src.id, target.id, g.id, parseInt(troopsIn.value, 10) || 0, formSel.value);
      this.closeModal();
      if (r.battle) this.showBattleReport(r.battle, r.won, r.msg);
      else this.toast(r.msg);
      this.afterAction();
    }, '开战');
    refreshGenerals();
  }

  // —— 计略 ——
  uiStratagem(target) {
    const s = this.state;
    const sources = neighbors(s, target.id).filter((n) => n.ownerFactionId === s.playerFactionId);
    if (!sources.length) { this.toast('无可施计的相邻己城'); return; }
    const srcSel = h('select', null, sources.map((n) => h('option', { value: n.id }, n.name)));
    const typeSel = h('select', null, Object.entries(STRATAGEMS).map(([k, d]) => h('option', { value: k }, `${d.name}（${d.desc}）`)));
    const body = h('div', null,
      h('div', { class: 'create__field' }, h('label', null, '从己方城市施计'), srcSel),
      h('div', { class: 'create__field' }, h('label', null, '计略'), typeSel),
    );
    this.openForm('施计', body, () => {
      const r = A.stratagem(s, srcSel.value, target.id, typeSel.value);
      this.toast(r.msg); this.closeModal(); this.afterAction();
    }, '施计');
  }

  showBattleReport(battle, won, titleMsg) {
    const a = battle.attacker; const d = battle.defender;
    const body = h('div', null,
      h('div', { class: 'force-vs' },
        h('div', { class: 'force-vs__side' }, h('b', null, a.general.name), h('div', { class: 'muted' }, `攻方 · ${Math.round(a.soldiers)} 兵`)),
        h('div', { class: 'force-vs__side' }, h('b', null, d.general.name), h('div', { class: 'muted' }, `守方 · ${Math.round(d.soldiers)} 兵 · 城${Math.round(d.defense)}`)),
      ),
      h('div', { class: 'battle-log' }, battle.log.map((l) => h('p', null, l))),
      h('p', { class: won ? 'center' : 'center muted', style: { color: won ? 'var(--good)' : 'var(--bad)', fontWeight: 700 } }, won ? '⚔ 大胜！城池归我！' : '⚔ 兵败而归。'),
    );
    this.openModal({ title: titleMsg, body, foot: [h('button', { class: 'btn-primary grow', onClick: () => this.closeModal() }, '知晓')] });
  }

  // ============ 势力总览 ============
  renderFaction() {
    const s = this.state;
    const fid = s.playerFactionId;
    const fac = playerFaction(s);
    const myCities = citiesOf(s, fid);
    const grainNet = factionGrainNet(s, fid);
    const heroCount = heroesOfFaction(s, fid).length;
    const prisonerCount = prisonersOfFaction(s, fid).length;
    this.content.appendChild(h('div', null,
      h('h3', null, `${fac.name} · 总览`),
      h('div', { class: 'panel' },
        h('div', { class: 'panel__rows' },
          h('div', null, h('span', { class: 'muted' }, '城池'), ' ', myCities.length, ' / 18'),
          h('div', null, h('span', { class: 'muted' }, '武将'), ' ', heroCount),
          h('div', null, h('span', { class: 'muted' }, '俘虏'), ' ', prisonerCount),
          h('div', null, h('span', { class: 'muted' }, '金钱'), ' ', Math.round(fac.money)),
          h('div', null, h('span', { class: 'muted' }, '军粮'), ' ', Math.round(fac.grain)),
          h('div', null, h('span', { class: 'muted' }, '粮收支'), ' ', `${Math.round(grainNet.net)}/回`),
        ),
      ),
      h('h3', { style: { marginTop: '0.8rem' } }, '辖下城池'),
      h('div', { class: 'card-list' }, myCities.map((c) => {
        const gov = c.governorHeroId ? heroById(s, c.governorHeroId) : null;
        return h('div', { class: 'city-card', onClick: () => { this.tab = 'map'; this.selectedCityId = c.id; this.renderTabbar(); this.renderContent(); this.openCityMenu(c.id); }, role: 'button' },
          h('div', { class: 'hero-card__head' }, h('span', { class: 'panel__swatch', style: { background: fac.color } }), h('span', { class: 'hero-card__name' }, c.name), h('span', { class: 'hero-card__sub' }, c.trait.name)),
          h('div', { class: 'panel__rows' },
            h('div', null, h('span', { class: 'muted' }, '兵'), ' ', Math.round(c.soldiers)),
            h('div', null, h('span', { class: 'muted' }, '防'), ' ', Math.round(c.defense)),
            h('div', null, h('span', { class: 'muted' }, '田/市/墙'), ` ${c.farmLevel}/${c.marketLevel}/${c.wallLevel}`),
            h('div', null, h('span', { class: 'muted' }, '守将'), ' ', gov ? gov.name : '—'),
          ),
        );
      })),
      h('h3', { style: { marginTop: '0.8rem' } }, '天下诸侯'),
      h('div', { class: 'card-list' }, s.factions.filter((f) => f.id !== fid).map((f) => {
        const n = citiesOf(s, f.id).length;
        return h('div', { class: 'city-card' },
          h('div', { class: 'hero-card__head' }, h('span', { class: 'panel__swatch', style: { background: f.color } }), h('span', { class: 'hero-card__name' }, f.name), h('span', { class: 'hero-card__sub' }, `${n} 城`)),
        );
      })),
    ));
  }

  // ============ 名将 ============
  renderHeroes() {
    const s = this.state;
    const fid = s.playerFactionId;
    const mine = heroesOfFaction(s, fid);
    const wilds = s.heroes.filter((h) => h.wild && h.discovered && h.status !== 'gone'
      && citiesOf(s, fid).some((c) => c.id === h.cityId)); // 仅己方城市中已发现的
    const prisoners = prisonersOfFaction(s, fid);

    const heroCard = (h2, foot) => h('div', { class: 'hero-card' },
      h('div', { class: 'hero-card__head' },
        h('span', { class: 'hero-card__name' }, h2.name),
        h('span', { class: 'hero-card__sub' }, h2.skill ? h2.skill.name : '无技能'),
        h2.loyalty != null ? h('span', { class: 'hero-card__sub' }, `忠 ${h2.loyalty}`) : null,
      ),
      h('div', { class: 'hero-card__stats' }, STAT_KEYS.map(([k, l]) => h('span', null, `${l}`, h('b', null, h2.stats[k])))),
      h2.skill ? h('div', { class: 'hero-card__skill' }, `【${h2.skill.name}】`) : null,
      h('div', { class: 'hint' }, `所在：${cityById(s, h2.cityId)?.name || '在野'}`),
      foot ? h('div', { class: 'hero-card__foot' }, foot) : null,
    );

    this.content.appendChild(h('div', null,
      h('h3', null, '麾下武将'),
      h('div', { class: 'card-list' }, mine.length ? mine.map((h2) => heroCard(h2, [
        h('button', { class: 'btn-ghost', onClick: () => { const r = A.reward(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '赏赐'),
        h('button', { class: 'btn-ghost', onClick: () => { this.selectedCityId = h2.cityId; this.uiAppoint(cityById(s, h2.cityId)); } }, '任太守'),
      ])) : h('p', { class: 'hint' }, '尚无武将，去「探索」招揽在野名将吧。')),

      h('h3', { style: { marginTop: '0.8rem' } }, '在野名将（己方城市）'),
      h('div', { class: 'card-list' }, wilds.length ? wilds.map((h2) => heroCard(h2, [
        h('button', { class: 'btn-primary', onClick: () => { const r = A.recruitHero(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '登用'),
      ])) : h('p', { class: 'hint' }, '在城市执行「探索」可发现本城在野名将。')),

      prisoners.length ? h('div', null,
        h('h3', { style: { marginTop: '0.8rem' } }, '俘虏'),
        h('div', { class: 'card-list' }, prisoners.map((h2) => heroCard(h2, [
          h('button', { class: 'btn-jade', onClick: () => { const r = A.recruitPrisoner(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '招降'),
          h('button', { class: 'btn-ghost', onClick: () => { const r = A.releasePrisoner(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '释放'),
          h('button', { class: 'btn-danger', onClick: () => { const r = A.executePrisoner(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '处决'),
        ]))),
      ) : null,
    ));
  }

  // ============ 科技 ============
  renderTech() {
    const s = this.state;
    const research = s.researchByFaction && s.researchByFaction[s.playerFactionId];
    this.content.appendChild(h('div', null,
      h('h3', null, '科技树（势力共享）'),
      research ? h('div', { class: 'panel', style: { marginBottom: '0.6rem' } },
        h('div', null, h('b', null, `正在研究：${TECHS[research.key].name}`), ` · 剩余 ${research.turnsLeft} 回合`),
      ) : null,
      h('div', { class: 'tech-grid' }, Object.entries(TECHS).map(([k, t]) => {
        const lv = techLevel(s, k);
        const maxed = lv >= TECH_MAX_LEVEL;
        const ongoing = research && research.key === k;
        const dots = Array.from({ length: TECH_MAX_LEVEL }, (_, i) => h('i', { class: i < lv ? 'on' : '' }));
        return h('div', { class: 'tech-card' },
          h('div', { class: 'tech-card__head' },
            h('span', { class: 'tech-card__icon' }, t.icon),
            h('div', { class: 'grow' }, h('div', { class: 'hero-card__name', style: { fontSize: '0.95rem' } }, t.name), h('div', { class: 'hint' }, t.desc)),
            h('span', { class: 'tech-lv' }, dots),
          ),
          h('div', { class: 'hero-card__foot' },
            h('span', { class: 'hero-card__sub' }, maxed ? '已满级' : `下级 ${TECH_COST_GOLD} 金`),
            h('span', { class: 'grow' }),
            h('button', {
              class: 'btn-primary', disabled: maxed || !!research,
              onClick: () => { const r = A.research(s, k); this.toast(r.msg); this.afterAction(); },
            }, ongoing ? '研究中…' : (maxed ? '已满' : '研究')),
          ),
        );
      })),
      h('p', { class: 'hint', style: { marginTop: '0.6rem' } }, '研究每级消耗 800 金，约 3 回合（君主智力可缩短），完成后势力全城共享加成。'),
    ));
  }

  // ============ 系统 ============
  renderSystem() {
    this.content.appendChild(h('div', null,
      h('h3', null, '系统'),
      h('div', { class: 'sys-list' },
        h('button', { class: 'btn-primary btn-block', onClick: () => { saveGame(this.state); this.toast('已保存'); } }, '保存游戏'),
        h('button', { class: 'btn-ghost btn-block', onClick: () => this.confirmEndTurn() }, '结束本回合'),
        h('button', { class: 'btn-ghost btn-block', onClick: () => { this.tab = 'map'; this.renderTabbar(); this.renderContent(); } }, '返回地图'),
        h('button', { class: 'btn-danger btn-block', onClick: () => this.confirmAbandon() }, '放弃本局，开新游戏'),
      ),
      h('p', { class: 'hint center', style: { marginTop: '1rem' } }, '雄图·三国志文明 · 存档于本地浏览器'),
    ));
  }

  confirmAbandon() {
    const body = h('p', null, '确认放弃当前进度并开始新游戏？当前存档将被覆盖。');
    this.openForm('放弃本局', body, () => {
      clearSave();
      this.closeModal();
      this.showStart();
    }, '确认放弃');
  }

  // ============ 结束回合 ============
  confirmEndTurn() {
    const body = h('p', null, '结束本回合后，天下诸侯将各自施政、出兵，资源依内政结算。是否继续？');
    this.openForm('结束回合', body, () => {
      this.closeModal();
      this.doEndTurn();
    }, '结束回合');
  }

  doEndTurn() {
    const s = this.state;
    saveGame(s);
    const log = resolveTurn(s, { aiTurnAll }, Math.random);
    saveGame(s);
    this.refreshTopbar();
    if (s.over) { this.renderGameOver(); return; }
    this.showTurnSummary(log);
  }

  showTurnSummary(log) {
    const items = (log && log.length) ? log : ['天下无事，岁月静好。'];
    const body = h('div', null,
      h('p', { class: 'hint' }, `第 ${this.state.turn} 回合 · ${seasonOf(this.state.turn)}季 简报`),
      h('ul', { class: 'summary-list' }, items.map((l) => h('li', null, l))),
    );
    this.openModal({
      title: '回合简报',
      body,
      foot: [h('button', { class: 'btn-primary grow', onClick: () => { this.closeModal(); this.afterAction(); } }, '继续')],
    });
  }

  renderGameOver() {
    clear(this.stage);
    const win = this.state.over === 'win';
    this.stage.appendChild(h('div', { class: 'gameover' },
      h('h2', null, win ? '🏛 一统天下！' : '🏰 大业未成'),
      h('p', { class: 'hint' }, win ? `${playerFaction(this.state).name} 席卷九州，定鼎中原。` : '群雄逐鹿，君之基业已失。再图后举吧。'),
      h('div', { class: 'launcher__menu', style: { marginTop: '1.2rem' } },
        h('button', { class: 'btn-primary btn-block', onClick: () => { clearSave(); this.showCreate(); } }, '再战一局'),
        h('button', { class: 'btn-ghost btn-block', onClick: () => { clearSave(); this.showStart(); } }, '返回首页'),
      ),
    ));
  }

  // ============ 动作后统一刷新 ============
  afterAction() {
    saveGame(this.state);
    if (this.screen !== 'game') return;
    if (this.state.over) { this.renderGameOver(); return; }
    this.refreshTopbar();
    // 若当前弹窗已关闭，则重绘内容；否则仅顶栏刷新
    if (!this.modalRoot.firstChild) this.renderContent();
  }
}
