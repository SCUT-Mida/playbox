// ============================================================================
// 雄图·三国志文明 · UI 控制器（纯原生 DOM）
// 三层屏幕：启动器（新局 / 继续）→ 创角 → 对局（顶栏 + 五标签 + 弹窗）。
// 对局标签：地图 / 势力 / 名将 / 科技 / 系统。
// ============================================================================
import './style.css';
import { attachKeyboardShell } from '../../../_lib/keyboard-shell.js';
import { kairoSVG } from '../../../_lib/kairo.js';
import { heroLook } from './heroArt.js';
import { h, clear, bar } from './dom.js';
import {
  TECHS, FORMATIONS, STRATAGEMS, TECH_COST_GOLD,
  TRAINING_MAX, FACTION_COLORS, NEUTRAL_COLOR, seasonOf, clamp,
  CITY_OFFICES, cmdCostOf,
  buildCapForCity, cityUpgradeGoldCost, CITY_MAX_LEVEL, exchangeRate,
  TRADE_GRAIN_COST, tradeGoldYield,
} from '../config.js';
import { CITIES, CITY_MAP, MAP_RIVERS, MAP_REGIONS, CAPITAL_IDS, cityTier, TIER_CLASS, TIER_NAME } from '../data/cities.js';
import { HEROES, HERO_MAP, FACTION_SEEDS } from '../data/heroes.js';
import { newGame, resolveTurn, cityById, heroById, factionById, playerFaction,
  neighbors, heroesOfFaction, heroesInCity, wildHeroesInCity, prisonersOfFaction,
  troopCap, troopCapForce, cmdPoints, cmdRemaining, bestDefender, lordOf, maxDefense, officeHolder } from '../core/state.js';
import { citiesOf, factionGoldIncome, factionGrainNet, governorEconMult, generalDefMult } from '../core/economy.js';
import { effLead, effWar } from '../core/combat.js';
import { techLevel, techMaxLevel } from '../core/tech.js';
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

// 兵力简写：1200 → 1.2k，800 → 800
function fmtTroops(n) {
  n = Math.max(0, Math.round(n || 0));
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

// 共享地图画布：SVG 河流 / 州郡名作背景，城市点为绝对定位按钮。
// 城市点为「城堡」造型：城体（按规模大/中/小分级）+ 顶部雉堞 + 旧都👑，不再千篇一律圆圈。
// nodes: [{ id, name, x, y, color, tier, isPlayer, isCapital, badge, isSel, dimmed }]
// onPick(cityId) 点击城市回调。返回 .map-wrap 元素。
function buildMapCanvas(nodes, onPick) {
  const wrap = h('div', { class: 'map-wrap' });
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'map-svg');
  svg.setAttribute('viewBox', '0 0 1000 760');
  svg.setAttribute('preserveAspectRatio', 'none');

  // 州郡名（淡墨大字，仅方位参考）
  for (const r of MAP_REGIONS) {
    const t = document.createElementNS(svgNS, 'text');
    t.setAttribute('x', r.x); t.setAttribute('y', r.y);
    t.setAttribute('class', 'map-region'); t.textContent = r.name;
    svg.appendChild(t);
  }
  // 河流（黄河 / 长江）
  for (const rv of MAP_RIVERS) {
    const p = document.createElementNS(svgNS, 'path');
    p.setAttribute('d', rv.d); p.setAttribute('class', 'map-river');
    svg.appendChild(p);
  }
  // 连线（仅当节点带 adjacent 时绘制，去重）
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  for (const n of nodes) {
    if (!n.adjacent) continue;
    for (const nid of n.adjacent) {
      if (n.id < nid && nodeMap.has(nid)) {
        const m = nodeMap.get(nid);
        const ln = document.createElementNS(svgNS, 'line');
        ln.setAttribute('x1', n.x); ln.setAttribute('y1', n.y);
        ln.setAttribute('x2', m.x); ln.setAttribute('y2', m.y);
        ln.setAttribute('class', 'map-line');
        svg.appendChild(ln);
      }
    }
  }
  wrap.appendChild(svg);

  // 城市点（城堡图标，规模分级）
  for (const n of nodes) {
    const center = n.badge != null ? n.badge : n.name.slice(0, 1);
    const tier = n.tier || 2;
    const color = n.color || NEUTRAL_COLOR;
    const dot = h('button', {
      class: `map-dot ${TIER_CLASS[tier] || TIER_CLASS[2]}${n.isPlayer ? ' map-dot--player' : ''}${n.isSel ? ' map-dot--selected' : ''}${n.dimmed ? ' map-dot--dim' : ''}${n.isCapital ? ' map-dot--capital' : ''}`,
      style: { left: `${(n.x / 1000) * 100}%`, top: `${(n.y / 760) * 100}%`, background: color },
      title: `${n.name}（${TIER_NAME[tier]}）`,
      onClick: () => onPick && onPick(n.id),
    }, h('span', { class: 'map-dot__battlement', style: { background: color } }),
      n.isCapital ? h('span', { class: 'map-dot__crown' }, '👑') : null,
      h('span', { class: `map-dot__txt${n.badge != null ? ' map-dot__txt--badge' : ''}` }, center));
    wrap.appendChild(dot);
    wrap.appendChild(h('span', { class: 'map-label', style: { left: `${(n.x / 1000) * 100}%`, top: `${(n.y / 760) * 100}%` } }, n.name));
  }
  return wrap;
}

// 指令消耗小标签：令1 / 免费
function costTag(cost) {
  if (cost == null) return null;
  return h('span', { class: `cmd-cost${cost === 0 ? ' cmd-cost--free' : ''}` }, cost === 0 ? '免费' : `令${cost}`);
}

// —— 创角期静态查表（不依赖 state）：在野名将按城聚合；诸侯旧都 → 种子势力 ——
const WILD_BY_CITY = HEROES.reduce((acc, hh) => {
  if (hh.wild) { (acc[hh.wild] = acc[hh.wild] || []).push(hh); }
  return acc;
}, {});
const SEED_BY_CAPITAL = Object.fromEntries(FACTION_SEEDS.map((sd) => [sd.capital, sd]));
const CAPITAL_COLOR = FACTION_SEEDS.reduce((acc, sd, i) => {
  acc[sd.capital] = FACTION_COLORS[(i + 1) % FACTION_COLORS.length]; // +1 避开玩家红
  return acc;
}, {});

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

    // 起兵之城：地图点选（ Capitals 标👑并淡染诸侯色），下方展示该城详情
    const pickNodes = CITIES.map((c) => ({
      id: c.id, name: c.name, x: c.x, y: c.y, adjacent: c.adjacent,
      color: CAPITAL_COLOR[c.id] || NEUTRAL_COLOR,
      tier: cityTier(c),
      isCapital: !!SEED_BY_CAPITAL[c.id],
      isSel: this.startCityPick === c.id,
      dimmed: !!this.startCityPick && this.startCityPick !== c.id,
    }));
    const cityMap = buildMapCanvas(pickNodes, (id) => { this.startCityPick = id; this.renderCreate(); });

    const startBtn = h('button', { class: 'btn-primary btn-block',
      disabled: !this.startCityPick,
      onClick: () => this.beginGame(),
    }, this.startCityPick ? `于 ${CITY_MAP[this.startCityPick].name} 起兵出征` : '请先在地图上点选起兵之城');

    const wrap = h('div', { class: 'create' },
      h('h2', null, '一、立君'),
      h('div', { class: 'create__field' }, h('label', null, '君主姓名（2~4 个汉字）'), nameInput),
      h('div', { class: 'create__field' }, h('label', null, '君主属性'), statGrid, rerollBtn),
      h('h2', null, '二、择都'),
      h('p', { class: 'hint' }, '点选地图上的城市作为起兵之地。👑为诸侯旧都，占据后其旧部将就地转为在野，可择机登用。'),
      cityMap,
      h('div', { style: { height: '0.6rem' } }),
      this.renderCreateCityDetail(this.startCityPick),
      h('div', { style: { height: '0.8rem' } }),
      startBtn,
      h('div', { style: { height: '0.4rem' } }),
      h('button', { class: 'btn-ghost btn-block', onClick: () => this.showStart() }, '返回'),
    );
    this.stage.appendChild(wrap);
    // 挂载临时引用，便于 beginGame 读取输入框最新值
    this._nameInput = nameInput;
  }

  // 创角期：展示所选城市的资源、特性、在野名将 / 旧都旧部
  renderCreateCityDetail(cityId) {
    if (!cityId) return h('div', { class: 'city-detail city-detail--empty' }, h('span', { class: 'muted' }, '尚未择都——点选地图上一座城市查看详情。'));
    const c = CITY_MAP[cityId];
    const seed = SEED_BY_CAPITAL[cityId];
    const wilds = WILD_BY_CITY[cityId] || [];
    // 占据旧都时，该势力全部名将（含君主）转为在野，可登用
    const oldOfficers = seed ? HEROES.filter((hh) => hh.serve === seed.key) : [];
    const r = (k, v) => h('div', null, h('span', { class: 'muted' }, k), ' ', v);
    return h('div', { class: 'city-detail' },
      h('div', { class: 'panel__head' },
        h('span', { class: 'panel__swatch', style: { background: CAPITAL_COLOR[cityId] || NEUTRAL_COLOR } }),
        h('h4', null, c.name),
        h('span', { class: 'hero-card__sub' }, `${c.trait.name} · ${c.trait.desc}`),
      ),
      h('div', { class: 'panel__rows' },
        r('规模', `${TIER_NAME[cityTier(c)]}（人口上限 ${c.popMax.toLocaleString()}）`),
        r('人口', `${c.pop0.toLocaleString()} / ${c.popMax.toLocaleString()}`),
        r('驻军', c.soldiers0.toLocaleString()),
        r('城防', c.defense0.toLocaleString()),
        r('城库', `${c.gold0.toLocaleString()} 金 · ${c.grain0.toLocaleString()} 粮`),
      ),
      seed ? h('div', { class: 'hint', style: { marginTop: '0.4rem' } },
        h('b', null, `诸侯旧都：${HERO_MAP[seed.lordId].name} 起家之地。`),
        `占据此地，该势力不生成，其 ${oldOfficers.length} 名旧部（含君主）就地转为在野，可登用。`) : null,
      wilds.length ? h('div', { style: { marginTop: '0.4rem' } },
        h('div', { class: 'hint' }, '本城在野名将风闻：'),
        h('div', { class: 'chip-row' }, wilds.map((w) => h('span', { class: 'chip' }, w.name))),
      ) : h('div', { class: 'hint', style: { marginTop: '0.4rem' } }, '本城暂无在野名将风闻。'),
    );
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
    const cmdTotal = cmdPoints(s, s.playerFactionId);
    clear(this.topbar);
    this.topbar.appendChild(h('div', { class: 'topbar__row' },
      h('span', { class: 'topbar__title' }, `${fac.name}`),
      h('span', { class: 'res-pill' }, `${seasonOf(s.turn)} · 第${s.turn}回合`),
      h('span', { class: 'res-pill' }, `金 `, h('b', null, Math.round(fac.money))),
      h('span', { class: 'res-pill' }, `粮 `, h('b', null, Math.round(fac.grain))),
      h('span', { class: `res-pill cmd-pill${cmd === 0 ? ' cmd-pill--empty' : ''}` }, `令 ${cmd}/${cmdTotal}`),
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
    const nodes = s.cities.map((c) => {
      const fac = c.ownerFactionId != null ? factionById(s, c.ownerFactionId) : null;
      const isPlayer = c.ownerFactionId === s.playerFactionId;
      return {
        id: c.id, name: c.name, x: c.x, y: c.y, adjacent: c.adjacent,
        color: fac ? fac.color : NEUTRAL_COLOR,
        tier: cityTier(c),
        isPlayer, isCapital: CAPITAL_IDS.includes(c.id),
        isSel: this.selectedCityId === c.id,
        badge: c.ownerFactionId != null ? fmtTroops(c.soldiers) : null,
      };
    });
    const wrap = buildMapCanvas(nodes, (id) => { this.selectedCityId = id; this.openCityMenu(id); });
    const legend = h('div', { class: 'map-legend' },
      h('span', null, h('i', { class: 'lg lg--player' }), '己方'),
      h('span', null, h('i', { class: 'lg lg--neutral' }), '空城'),
      h('span', null, h('i', { class: 'lg lg--foe' }), '诸侯'),
      h('span', null, '👑', '旧都'),
      h('span', null, h('i', { class: 'lg lg--lg' }), '大城'),
      h('span', null, h('i', { class: 'lg lg--sm' }), '小城'),
    );
    this.content.appendChild(h('div', null,
      h('h3', null, '九州形势图'),
      h('p', { class: 'hint' }, '点击城市查看详情。城池图标按规模分大/中/小三等（大城图标更大）；金边为己方、灰色为空城、他色为诸侯，👑为诸侯旧都。'),
      wrap,
      legend,
    ));
  }

  // ============ 城市操作菜单 ============
  openCityMenu(cityId) {
    const s = this.state;
    const c = cityById(s, cityId);
    if (!c) return;
    // 不在此处重绘整张地图（弹窗会覆盖其上，关闭时 afterAction 自然刷新），
    // 避免点击城市后地图下方重复出现选中提示的视觉 bug。
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
    const s = this.state;
    const gov = officeHolder(s, c, 'governor');
    const gen = officeHolder(s, c, 'general');
    const strat = officeHolder(s, c, 'strategist');
    const cap = buildCapForCity(c);
    const lvl = c.level || 1;
    const r = (k, v) => h('div', null, h('span', { class: 'muted' }, k), ' ', v);
    return h('div', { class: 'panel__rows' },
      r('归属', c.ownerFactionId != null ? (factionById(s, c.ownerFactionId)?.name || '—') : '空城'),
      r('规模', `${TIER_NAME[cityTier(c)]}（人口上限 ${c.maxPopulation.toLocaleString()}）`),
      r('城池等级', `${lvl} / ${CITY_MAX_LEVEL}（资源上限 Lv${cap}）`),
      r('人口', `${Math.round(c.population)} / ${c.maxPopulation}`),
      r('士兵', Math.round(c.soldiers)),
      r('城防', `${Math.round(c.defense)}`),
      r('农田', `Lv${c.farmLevel} / ${cap}`),
      r('市集', `Lv${c.marketLevel} / ${cap}`),
      r('城墙', `Lv${c.wallLevel} / ${cap}`),
      r('训练度', c.training),
      r('太守', gov ? `${gov.name}（政${gov.stats.p}）` : '—'),
      r('将军', gen ? `${gen.name}（统${gen.stats.l}）` : '—'),
      r('军师', strat ? `${strat.name}（智${strat.stats.i}）` : '—'),
    );
  }

  // 城市职官面板：列出太守 / 将军 / 军师在任者与其加成；owned=true 时附任命入口。
  officesBlock(c, owned) {
    const s = this.state;
    const econMult = governorEconMult(s, c);
    const defMult = generalDefMult(s, c);
    const rows = CITY_OFFICES.map((o) => {
      const h2 = officeHolder(s, c, o.key);
      const stat = h2 ? h2.stats[o.stat] : null;
      return h('div', { class: 'office-row' },
        h('span', { class: 'office-row__name' }, `${o.icon} ${o.name}`),
        h('span', { class: 'office-row__who' }, h2 ? `${h2.name}（${o.statName}${stat}）` : '虚位以待'),
        owned ? h('button', { class: 'btn-ghost office-row__btn', onClick: () => this.uiAppointOffice(c, o.key) },
          h2 ? '更换' : '任命') : null,
      );
    });
    const bonus = h('div', { class: 'hint', style: { marginTop: '0.3rem' } },
      `本城加成：农商收入 ×${econMult.toFixed(2)}（太守政治）· 城防 ×${defMult.toFixed(2)}（将军统率）`);
    return h('div', { class: 'offices' },
      h('div', { class: 'offices__title' }, '城中职官'),
      rows, bonus,
    );
  }

  openOwnedCity(c) {
    const s = this.state;
    const fid = s.playerFactionId;
    // refresh=true：动作在弹窗内就地完成后，重绘城务弹窗以刷新兵数/等级/职官/在野列表。
    // fn 若返回 { ok, msg }（如内政指令）则就地提示并按需刷新；
    // fn 若自行打开表单（如资源对换 / 贸易）则返回 undefined，仅做后续统一刷新。
    const cmdBtn = (label, fn, { danger, refresh, cost } = {}) => h('button', {
      class: `cmd-btn ${danger ? 'btn-danger' : 'btn-primary'}`,
      onClick: () => {
        const r = fn();
        if (r && r.msg) this.toast(r.msg);
        this.afterAction();
        if (refresh && r && r.ok) this.openOwnedCity(c);
      },
    }, label, costTag(cost));
    // 探索的实际消耗：仍有未发现名将才耗 1 指令，否则免费（动态标注，避免误导）
    const wildsAll = wildHeroesInCity(s, c.id);
    const exploreCost = (wildsAll.length && wildsAll.some((w) => !w.discovered)) ? 1 : 0;
    const grid = h('div', { class: 'cmd-grid' },
      cmdBtn(`农田 Lv${c.farmLevel}`, () => A.developFarm(s, c.id), { refresh: true, cost: cmdCostOf('developFarm') }),
      cmdBtn(`市集 Lv${c.marketLevel}`, () => A.developMarket(s, c.id), { refresh: true, cost: cmdCostOf('developMarket') }),
      cmdBtn(`城墙 Lv${c.wallLevel}`, () => A.buildWall(s, c.id), { refresh: true, cost: cmdCostOf('buildWall') }),
      cmdBtn('征兵', () => this.uiRecruit(c), { cost: cmdCostOf('recruit') }),
      cmdBtn('操练', () => A.train(s, c.id), { refresh: true, cost: cmdCostOf('train') }),
      cmdBtn('探索', () => A.explore(s, c.id), { refresh: true, cost: exploreCost }),
    );
    const advBtns = h('div', { class: 'hero-card__foot' },
      h('button', { class: 'btn-jade', onClick: () => this.uiMoveHero(c) }, '调遣武将', costTag(cmdCostOf('moveHero'))),
      h('button', { class: 'btn-primary', onClick: () => this.uiTransport(c) }, '输送资源', costTag(cmdCostOf('transport'))),
    );
    // 商业行：升级城池 / 资源对换（金↔粮）/ 相邻贸易
    const cap = buildCapForCity(c);
    const cLevel = c.level || 1;
    const cityMaxed = cLevel >= CITY_MAX_LEVEL;
    const cityReady = c.farmLevel >= cap && c.marketLevel >= cap && c.wallLevel >= cap;
    const upCost = cityUpgradeGoldCost(cLevel);
    const tradeTargets = neighbors(s, c.id).filter((n) => n.ownerFactionId !== s.playerFactionId);
    const commerce = h('div', { class: 'commerce-block' },
      h('div', { class: 'hint', style: { marginBottom: '0.3rem' } }, '商贸 · 城建'),
      h('div', { class: 'cmd-grid' },
        cmdBtn(cityMaxed ? `城池满级 Lv${cLevel}` : `升级城池 Lv${cLevel}→${cLevel + 1}`,
          () => A.upgradeCity(s, c.id, s.playerFactionId),
          { refresh: true, cost: cityMaxed ? null : cmdCostOf('upgradeCity') }),
        cmdBtn('资源对换', () => this.uiExchange(c), { cost: cmdCostOf('exchange') }),
        cmdBtn(tradeTargets.length ? '通商贸易' : '无邻接商路',
          () => this.uiTrade(c),
          { cost: tradeTargets.length ? cmdCostOf('trade') : null }),
      ),
      h('div', { class: 'hint', style: { marginTop: '0.25rem' } },
        cityMaxed ? '城池已达最高等级。'
          : (cityReady ? `三项资源已满 Lv${cap}，升级需 ${upCost} 金（解锁资源上限至 Lv${cap + 5}）。`
            : `三项资源均达 Lv${cap} 后方可升级城池（当前 田${c.farmLevel}/市${c.marketLevel}/墙${c.wallLevel}）。`)),
    );
    // 在野名将登用入口
    const wilds = wildHeroesInCity(s, c.id).filter((w) => w.discovered);
    const wildBlock = wilds.length ? h('div', { style: { marginTop: '0.6rem' } },
      h('div', { class: 'hint' }, '本城在野名将：'),
      h('div', { class: 'hero-card__foot' }, wilds.map((w) => h('button', { class: 'btn-ghost', onClick: () => { const r = A.recruitHero(s, w.id); this.toast(r.msg); this.afterAction(); if (r.ok) this.openOwnedCity(c); } }, `登用 ${w.name}`, costTag(cmdCostOf('recruitHero'))))),
    ) : null;

    const body = h('div', null, this.cityHeader(c), this.cityRows(c), grid, commerce, this.officesBlock(c, true), advBtns, wildBlock);
    this.openModal({ title: `城务 · ${c.name}`, body, foot: [h('button', { class: 'btn-ghost grow', onClick: () => this.closeModal() }, '关闭')] });
  }

  // —— 资源对换（金 ↔ 粮）——
  uiExchange(c) {
    const s = this.state;
    const fac = playerFaction(s);
    const rate = exchangeRate(s, c);
    const dirSel = h('select', null,
      h('option', { value: 'buy' }, `买粮（金→粮）：1金≈${rate.toFixed(2)}粮`),
      h('option', { value: 'sell' }, `卖粮（粮→金）：约${(1 / rate * 0.7).toFixed(3)}金/粮（七折）`),
    );
    const amtIn = h('input', { type: 'number', value: 500, min: 1, step: 50, style: { width: '5rem' } });
    const body = h('div', null,
      h('p', { class: 'hint' }, `金 ${Math.round(fac.money)} · 粮 ${Math.round(fac.grain)}。市集等级与商贸科技越高，汇率越优。`),
      h('div', { class: 'create__field' }, h('label', null, '兑换方向'), dirSel),
      h('div', { class: 'create__field' }, h('label', null, '数量（金 或 粮）'), amtIn),
    );
    this.openForm('资源对换', body, () => {
      const r = A.exchange(s, c.id, dirSel.value, parseInt(amtIn.value, 10) || 0, s.playerFactionId);
      this.toast(r.msg); this.closeModal(); this.afterAction();
      if (r.ok) this.openOwnedCity(c);
    }, '兑换');
  }

  // —— 相邻贸易 ——
  uiTrade(c) {
    const s = this.state;
    const fac = playerFaction(s);
    const targets = neighbors(s, c.id).filter((n) => n.ownerFactionId !== s.playerFactionId);
    if (!targets.length) { this.toast('无相邻的非己方城市可通商'); return; }
    const tSel = h('select', null, targets.map((n) => {
      const kind = n.ownerFactionId == null ? '中立' : (factionById(s, n.ownerFactionId)?.name || '他国');
      const yield_ = tradeGoldYield(s, c, n);
      const risky = n.ownerFactionId != null ? '（他国·有劫掠风险）' : '';
      return h('option', { value: n.id }, `${n.name}（${kind}）· 预计 +${yield_} 金${risky}`);
    }));
    const body = h('div', null,
      h('p', { class: 'hint' }, `派商队前往相邻非己方城市通商。消耗 ${TRADE_GRAIN_COST} 粮（当前 ${Math.round(fac.grain)}）。中立城市稳赚；他国城市有被劫掠风险。`),
      h('div', { class: 'create__field' }, h('label', null, '通商目标'), tSel),
    );
    this.openForm('通商贸易', body, () => {
      const r = A.trade(s, c.id, tSel.value, s.playerFactionId, Math.random);
      this.toast(r.msg); this.closeModal(); this.afterAction();
    }, '派出商队');
  }

  openEnemyCity(c) {
    const s = this.state;
    const body = h('div', null,
      this.cityHeader(c),
      this.cityRows(c),
      this.officesBlock(c, false),
      h('div', { class: 'hero-card__foot' },
        h('button', { class: 'btn-danger', onClick: () => this.uiCampaign(c) }, '出征攻打', costTag(cmdCostOf('campaign'))),
        h('button', { class: 'btn-ghost', onClick: () => this.uiStratagem(c) }, '施计', costTag(cmdCostOf('stratagem'))),
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

  // —— 任命城市职官（太守 / 将军 / 军师）——
  uiAppointOffice(c, officeKey) {
    const s = this.state;
    const office = CITY_OFFICES.find((o) => o.key === officeKey) || CITY_OFFICES[0];
    const roster = heroesInCity(s, c.id, s.playerFactionId);
    if (!roster.length) { this.toast('城中无可任命之武将'); return; }
    // 按该职官主属性降序，便于挑选最合适者
    const sorted = roster.slice().sort((a, b) => (b.stats[office.stat] || 0) - (a.stats[office.stat] || 0));
    const current = officeHolder(s, c, officeKey);
    const sel = h('select', null, sorted.map((h2) => {
      const busy = CITY_OFFICES.filter((o) => c[o.field] === h2.id).map((o) => o.name);
      const tag = busy.length ? `（现任${busy.join('/')}）` : '';
      return h('option', { value: h2.id }, `${h2.name}（${office.statName}${h2.stats[office.stat]}）${tag}`);
    }));
    sel.value = current ? current.id : sorted[0].id;
    const body = h('div', null,
      h('p', { class: 'hint' }, `${office.icon} ${office.name}：${office.effect}。免费任命，离城自动卸任。`),
      sel);
    this.openForm(`任命${office.name}`, body, () => {
      const r = A.appointOffice(s, c.id, sel.value, officeKey);
      this.toast(r.msg); this.closeModal(); this.afterAction();
      if (r.ok) this.openOwnedCity(c);
    }, current ? '更换' : '任命');
  }

  // —— 调遣武将（本城 → 任意己方城，疆域内急行军直达）——
  uiMoveHero(c) {
    const s = this.state;
    const roster = heroesInCity(s, c.id, s.playerFactionId);
    // 同一势力疆域内可直达任意己方城池，无需逐城相邻中转。
    const targets = citiesOf(s, s.playerFactionId).filter((n) => n.id !== c.id);
    if (!roster.length || !targets.length) { this.toast('无可调遣武将或无其他己城'); return; }
    const hSel = h('select', null, roster.map((h2) => h('option', { value: h2.id }, h2.name)));
    const tSel = h('select', null, targets.map((n) => h('option', { value: n.id }, n.name)));
    const body = h('div', null, h('p', { class: 'hint' }, '将本城武将调往己方任意城市（疆域内急行军直达，免费）。'), hSel, h('div', { style: { height: '0.4rem' } }), tSel);
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

  // —— 出征（主帅 + 副将）——
  uiCampaign(target) {
    const s = this.state;
    // 可出发的己方邻城
    const sources = neighbors(s, target.id).filter((n) => n.ownerFactionId === s.playerFactionId);
    if (!sources.length) { this.toast('无可出发的相邻己城'); return; }
    const srcSel = h('select', null, sources.map((n) => h('option', { value: n.id }, n.name)));
    const formSel = h('select', null, Object.entries(FORMATIONS).map(([k, f]) => h('option', { value: k }, `${f.name}（${f.desc}）`)));
    const genSel = h('select');
    const troopsIn = h('input', { type: 'number', value: 1000, min: 100, step: 100, style: { width: '5rem' } });
    const capHint = h('div', { class: 'hint', style: { marginTop: '0.2rem' } }, '');
    // 副将勾选区：随出发城 / 主将变化而刷新；最多 2 名。
    const depWrap = h('div', { class: 'dep-list' });
    // 带兵上限 = 主帅 + 已勾选副将各自统兵上限相加；随主将 / 副将勾选实时刷新。
    const updateCap = () => {
      const src = cityById(s, srcSel.value);
      const g = heroById(s, genSel.value);
      if (!src || !g) { capHint.textContent = ''; return; }
      const depIds = Array.from(depWrap.querySelectorAll('input[type=checkbox]:checked')).map((c2) => c2.value);
      const deps = depIds.map((id) => heroById(s, id)).filter(Boolean);
      const mainCap = troopCap(s, g);
      const cap = troopCapForce(s, g, deps);
      troopsIn.max = Math.min(src.soldiers, cap);
      troopsIn.value = Math.min(parseInt(troopsIn.value, 10) || 1000, parseInt(troopsIn.max, 10));
      capHint.textContent = deps.length
        ? `统兵上限 ${cap}（主帅 ${mainCap} + 副将 ${cap - mainCap}）`
        : `统兵上限 ${mainCap}（点选副将可叠加统兵）`;
    };
    const renderDeputies = (srcId, mainId) => {
      clear(depWrap);
      const gens = heroesInCity(s, srcId, s.playerFactionId).filter((g2) => g2.id !== mainId);
      if (!gens.length) { depWrap.appendChild(h('span', { class: 'muted' }, '城中无其他武将可任副将')); updateCap(); return; }
      for (const g2 of gens) {
        const cb = h('input', { type: 'checkbox', value: g2.id });
        cb.addEventListener('change', () => {
          const boxes = Array.from(depWrap.querySelectorAll('input[type=checkbox]'));
          const checked = boxes.filter((c2) => c2.checked).length;
          boxes.forEach((c2) => { c2.disabled = false; });
          if (checked >= 2) boxes.filter((c2) => !c2.checked).forEach((c2) => { c2.disabled = true; });
          updateCap();
        });
        depWrap.appendChild(h('label', { class: 'dep-item' }, cb,
          h('span', null, `${g2.name}（武${g2.stats.w}·统${g2.stats.l}）`)));
      }
      updateCap();
    };
    const refreshGenerals = () => {
      const src = cityById(s, srcSel.value);
      const gens = heroesInCity(s, src.id, s.playerFactionId);
      clear(genSel);
      if (!gens.length) { genSel.appendChild(h('option', null, '无可用武将')); renderDeputies(src.id, null); return; }
      for (const g of gens) genSel.appendChild(h('option', { value: g.id }, `${g.name}（统${g.stats.l}）`));
      renderDeputies(src.id, genSel.value);
    };
    srcSel.addEventListener('change', refreshGenerals);
    genSel.addEventListener('change', () => renderDeputies(srcSel.value, genSel.value));
    const body = h('div', null,
      h('p', { class: 'hint' }, `攻打 ${target.name}（守军 ${Math.round(target.soldiers)} · 城防 ${Math.round(target.defense)}）`),
      h('div', { class: 'create__field' }, h('label', null, '出发城市'), srcSel),
      h('div', { class: 'create__field' }, h('label', null, '主帅'), genSel),
      h('div', { class: 'create__field' }, h('label', null, '副将（最多 2 名 · 提升攻击、加统兵、可替战）'), depWrap),
      h('div', { class: 'create__field' }, h('label', null, '出兵数量（按路程耗粮）'), troopsIn, capHint),
      h('div', { class: 'create__field' }, h('label', null, '阵型'), formSel),
    );
    this.openForm('出征', body, () => {
      const src = cityById(s, srcSel.value);
      const g = heroById(s, genSel.value);
      if (!g) { this.toast('请选择主帅'); return; }
      const deputyIds = Array.from(depWrap.querySelectorAll('input[type=checkbox]:checked')).map((c2) => c2.value);
      const r = A.campaign(s, src.id, target.id, g.id, parseInt(troopsIn.value, 10) || 0, formSel.value, s.playerFactionId, Math.random, deputyIds);
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
    const aDeputies = a.deputies && a.deputies.length;
    const body = h('div', null,
      h('div', { class: 'force-vs' },
        h('div', { class: 'force-vs__side' },
          h('b', null, a.general.name),
          h('div', { class: 'muted' }, `主帅 · 攻方 · ${Math.round(a.soldiers)} 兵`),
          aDeputies ? h('div', { class: 'muted' }, `副将：${a.deputies.map((x) => x.name).join('、')}`) : null),
        h('div', { class: 'force-vs__side' },
          h('b', null, d.general.name),
          h('div', { class: 'muted' }, `守方 · ${Math.round(d.soldiers)} 兵 · 城${Math.round(d.defense)}`)),
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
            h('div', null, h('span', { class: 'muted' }, '城池'), ` Lv${c.level || 1}`),
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
    // 被敌方关押的本方武将：出征失利被俘后会「消失」于名录，此处集中展示其下落。
    const captured = s.heroes.filter((h) => h.factionId === fid && h.status === 'prisoner');

    // 该武将当前所任职官（扫全图城市）
    const officeOf = (heroId) => {
      for (const c of s.cities) {
        for (const o of CITY_OFFICES) {
          if (c[o.field] === heroId) return o;
        }
      }
      return null;
    };
    const heroCard = (h2, foot) => {
      const off = officeOf(h2.id);
      return h('div', { class: 'hero-card' },
        h('div', { class: 'hero-card__head' },
          // 开罗风像素武将像（共享素材库 _lib/kairo.js，47 名将逐人预设）
          h('span', { class: 'hero-card__avatar', html: kairoSVG(heroLook(h2), 40) }),
          h('span', { class: 'hero-card__name' }, h2.name),
          off ? h('span', { class: 'hero-card__office' }, `${off.icon}${off.name}`) : null,
          h('span', { class: 'hero-card__sub' }, h2.skill ? h2.skill.name : '无技能'),
          h2.loyalty != null ? h('span', { class: 'hero-card__sub' }, `忠 ${h2.loyalty}`) : null,
        ),
        h('div', { class: 'hero-card__stats' }, STAT_KEYS.map(([k, l]) => h('span', null, `${l}`, h('b', null, h2.stats[k])))),
        h2.skill ? h('div', { class: 'hero-card__skill' }, `【${h2.skill.name}】`) : null,
        h('div', { class: 'hint' }, `所在：${cityById(s, h2.cityId)?.name || '在野'}`),
        foot ? h('div', { class: 'hero-card__foot' }, foot) : null,
      );
    };

    this.content.appendChild(h('div', null,
      h('h3', null, '麾下武将'),
      h('div', { class: 'card-list' }, mine.length ? mine.map((h2) => heroCard(h2, [
        h('button', { class: 'btn-ghost', onClick: () => { const r = A.reward(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '赏赐', costTag(cmdCostOf('reward'))),
        h('button', { class: 'btn-ghost', onClick: () => { this.selectedCityId = h2.cityId; this.uiAppointOffice(cityById(s, h2.cityId), 'governor'); } }, '任太守'),
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

      captured.length ? h('div', null,
        h('h3', { style: { marginTop: '0.8rem' } }, '被俘在外'),
        h('p', { class: 'hint' }, '以下武将出征失利被俘，正被敌方关押。攻陷其关押之城或灭其势力即可营救归队。'),
        h('div', { class: 'card-list' }, captured.map((h2) => {
          const holder = h2.prisonerOf != null ? factionById(s, h2.prisonerOf) : null;
          const jailCity = cityById(s, h2.cityId);
          return heroCard(h2, [
            h('span', { class: 'hero-card__sub' }, `⛓️ 被关押于${jailCity ? jailCity.name : '敌方'}${holder ? `（${holder.name}）` : ''}`),
          ]);
        })),
      ) : null,
    ));
  }

  // ============ 科技 ============
  renderTech() {
    const s = this.state;
    const fid = s.playerFactionId;
    const techMax = techMaxLevel(s, fid);
    const research = s.researchByFaction && s.researchByFaction[fid];
    this.content.appendChild(h('div', null,
      h('h3', null, '科技树（势力独有）'),
      h('p', { class: 'hint' }, `当前科技上限 Lv${techMax} —— 升级城池可解锁更高上限（势力最高城池等级越高，科技天花板越高）。`),
      research ? h('div', { class: 'panel', style: { marginBottom: '0.6rem' } },
        h('div', null, h('b', null, `正在研究：${TECHS[research.key].name}`), ` · 剩余 ${research.turnsLeft} 回合`),
      ) : null,
      h('div', { class: 'tech-grid' }, Object.entries(TECHS).map(([k, t]) => {
        const lv = techLevel(s, fid, k);
        const maxed = lv >= techMax;
        const ongoing = research && research.key === k;
        const dots = Array.from({ length: techMax }, (_, i) => h('i', { class: i < lv ? 'on' : '' }));
        return h('div', { class: 'tech-card' },
          h('div', { class: 'tech-card__head' },
            h('span', { class: 'tech-card__icon' }, t.icon),
            h('div', { class: 'grow' }, h('div', { class: 'hero-card__name', style: { fontSize: '0.95rem' } }, t.name), h('div', { class: 'hint' }, t.desc)),
            h('span', { class: 'tech-lv' }, dots),
          ),
          h('div', { class: 'hero-card__foot' },
            h('span', { class: 'hero-card__sub' }, `${lv}/${techMax}${maxed ? ' · 已满' : ''}`),
            h('span', { class: 'grow' }),
            h('button', {
              class: 'btn-primary', disabled: maxed || !!research,
              onClick: () => { const r = A.research(s, k); this.toast(r.msg); this.afterAction(); },
            }, ongoing ? '研究中…' : (maxed ? '已满' : '研究')),
          ),
        );
      })),
      h('p', { class: 'hint', style: { marginTop: '0.6rem' } }, '研究每级消耗 800 金，约 3 回合（君主智力可缩短），完成后本势力全城共享加成，各势力科技互不共享。'),
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
