// ============================================================================
// 凡人修仙录 · UI 控制器（纯原生 DOM）
// 负责渲染顶部状态栏 / 日志 / 五大功能页 / 弹窗（事件·战斗·渡劫·成就·设置），
// 并驱动每秒修炼循环、自动存档与离线结算。
// ============================================================================
import '../ui/style.css';
import { h, clear, bar } from './dom.js';
import { portraitSVG } from './portrait.js';
import {
  REALMS, SPIRIT_ROOTS, ACTIVE_CULTIVATE_MP_COST, EXPLORE_MP_COST, EXPLORE_HP_COST,
  VITALITY_COSTS, breakthroughChance, cultivateSpeedMult, passiveXpPerSec, nowSec,
} from '../config.js';
import { ITEMS, TREASURE_SKILLS } from '../data/items.js';
import { RECIPE_BY_ID, ALCHEMY_RECIPES, FORGE_BLUEPRINTS } from '../data/recipes.js';
import { TALENTS, BACKGROUNDS, pickPortrait, portraitDef, qiyunLabel } from '../data/characters.js';
import {
  newPlayer, recompute, realmInfo, rootDef, addXp, isXpFull, xpOverflow,
  equip, unequip, expandBag, bagExpandCost, countItem, hasItem, removeItem, addItemOrLog,
  distinctItems, learnTechnique, upgradeRoot,
  rollCharacter, effectiveQiyun,
  rolloverVitality, canAffordVitality, spendVitality, restToNextDay, vitalityDepleted,
} from '../core/player.js';
import { activeCultivate, passiveTick } from '../core/cultivate.js';
import { rollExplore, applyReward, chaosActive } from '../core/explore.js';
import { createBattle, battleStep, battleRewards } from '../core/battle.js';
import {
  nextTarget, canBreakthrough, needsTrial, attemptMinorBreakthrough,
  startMajorTrial, trialRespond, advanceRealm, failMajor,
} from '../core/breakthrough.js';
import { tryAlchemy, tryForge, hasMaterials, successRate } from '../core/alchemy.js';
import { rollMarket, buyItem, sellItem, sellPrice } from '../core/market.js';
import { ACHIEVEMENTS, TITLES, checkAchievements } from '../core/achievements.js';
import {
  saveGame, clearSave, exportSave, importSave, computeOffline,
  listSlots, loadSlot, saveSlot, deleteSlot, getActiveSlot, setActiveSlot, migrateLegacy,
} from '../core/save.js';

const TABS = [
  { key: 'cultivate', icon: '🧘', label: '修炼' },
  { key: 'explore', icon: '🗺️', label: '探索' },
  { key: 'market', icon: '🏪', label: '坊市' },
  { key: 'bag', icon: '🎒', label: '背包' },
  { key: 'alchemy', icon: '⚗️', label: '炼丹' },
];

export class GameUI {
  constructor(parent) {
    this.parent = parent;
    this.player = null;
    this.tab = 'cultivate';
    this.market = null;
    this.alchemySub = 'dan';
    this.log = [];
    this.battle = null;
    this.trial = null;
    this.encounter = null;
    this.tickTimer = null;
    this.saveTimer = null;
    this.ui = {};
    // 创角 / 存档选择态
    this.screen = 'slots';     // 'slots' | 'create' | 'game'
    this.activeSlot = 1;
    this.charTemplate = null;  // 创角预览模板
    this.pendingOffline = null;
    // 绑定 visibilitychange 回调：addEventListener 注册的普通函数 this 为事件目标(document)，
    // 不绑定则 this.player 为 undefined，切后台存档会抛错被静默吞掉。绑定后 add/remove 用同一引用。
    this._onVis = this._onVis.bind(this);
  }

  mount() {
    this.root = h('div', { class: 'frxx' });
    clear(this.parent);
    this.parent.appendChild(this.root);
    this.toastWrap = h('div', { class: 'toast-wrap' });
    this.stage = h('div', { class: 'frxx-stage' });
    this.modalRoot = h('div', { class: 'frxx-modals' });
    this.root.append(this.toastWrap, this.stage, this.modalRoot);
    migrateLegacy();
    this.showSlots();
    return this;
  }

  // ============ 存档选择 ============
  showSlots() {
    // 返回存档列表前先落盘当前进度
    try { if (this.player) saveGame(this.player); } catch (_) {}
    this.stopLoop();
    this.player = null;
    this.screen = 'slots';
    clear(this.modalRoot);
    clear(this.stage);
    const wrap = h('div', { class: 'launcher' },
      h('div', { class: 'launcher__brand' }, h('div', { class: 'emblem' }, '仙'), h('h1', null, '凡人修仙录'), h('p', { class: 'sub' }, '一念凡夫，至道飞升 · 选择你的修仙档案')),
      h('div', { class: 'slot-list' }),
    );
    const list = wrap.querySelector('.slot-list');
    for (const s of listSlots()) list.appendChild(this.renderSlotCard(s));
    this.stage.appendChild(wrap);
  }

  renderSlotCard(s) {
    if (s.empty) {
      return h('div', { class: 'slot-card empty' },
        h('div', { class: 'slot-portrait placeholder' }, '➕'),
        h('div', { class: 'slot-meta' }, h('div', { class: 'slot-name' }, '空档位'), h('div', { class: 'muted' }, '开辟一段新的修仙历程')),
        h('button', { class: 'btn-primary', onClick: () => this.showCreate(s.slot) }, '新建角色'),
      );
    }
    if (s.corrupt) {
      return h('div', { class: 'slot-card corrupt' },
        h('div', { class: 'slot-portrait placeholder' }, '⚠️'),
        h('div', { class: 'slot-meta' }, h('div', { class: 'slot-name' }, `存档 ${s.slot} · 损坏`), h('div', { class: 'muted' }, '档案无法读取')),
        h('button', { class: 'btn-danger', onClick: () => this.confirmDeleteSlot(s.slot) }, '删除'),
      );
    }
    const pt = portraitDef(s.portraitId);
    return h('div', { class: 'slot-card' },
      h('div', { class: 'slot-portrait', html: portraitSVG(pt, 48) }),
      h('div', { class: 'slot-meta' },
        h('div', { class: 'slot-name' }, s.name),
        h('div', { class: 'muted' }, `${s.realm}${s.ascended ? ' · 已飞升' : ''}`),
        h('div', { class: 'muted' }, `${timeAgo(s.lastSeen)} · 💎${s.stones}`),
      ),
      h('div', { class: 'slot-actions' },
        h('button', { class: 'btn-primary', onClick: () => this.enterSlot(s.slot) }, '进入'),
        h('button', { class: 'icon-btn', title: '删除档案', onClick: () => this.confirmDeleteSlot(s.slot) }, '🗑️'),
      ),
    );
  }

  confirmDeleteSlot(slot) {
    this.showSheet({
      title: `删除存档 ${slot}？`,
      body: [h('div', { class: 'muted' }, '此档案将被永久抹去，无法恢复。')],
      foot: [
        h('button', { class: 'btn-danger', onClick: () => { deleteSlot(slot); this.closeModal(); this.showSlots(); } }, '确认删除'),
        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '取消'),
      ],
    });
  }

  enterSlot(slot) {
    const p = loadSlot(slot);
    if (!p) { this.toast('档案读取失败', 'bad'); this.showSlots(); return; }
    this.enterGame(p, { isNew: false });
  }

  // ============ 创角 ============
  showCreate(slot, opts = {}) {
    this.stopLoop();
    this.player = null;
    this.screen = 'create';
    this.activeSlot = slot;
    clear(this.modalRoot);
    // 初始模板：保留已选性别（首次随机）
    if (!this.charTemplate || opts.fresh) {
      const t = rollCharacter(Math.random);
      this.charTemplate = t;
    }
    this.renderCreate();
  }

  renderCreate() {
    const t = this.charTemplate;
    const root = rootDef(t.rootId);
    const pt = pickPortrait(t.gender, t.talentIds);
    const qy = (t.qiyun || 0) + sumTalent(t.talentIds, 'qiyunBonus');
    const ql = qiyunLabel(qy);
    const bg = BACKGROUNDS[t.bgId] || BACKGROUNDS[Object.keys(BACKGROUNDS)[0]];

    clear(this.stage);
    const wrap = h('div', { class: 'launcher create' });
    wrap.append(
      h('div', { class: 'create__head' },
        h('button', { class: 'btn-ghost', onClick: () => { this.charTemplate = null; this.showSlots(); } }, '← 返回'),
        h('h1', null, '开辟新角色'),
        h('div', { class: 'muted', style: { textAlign: 'right' } }, `存档 ${this.activeSlot}`),
      ),
      h('div', { class: 'create__body' },
        h('div', { class: 'create__portrait' },
          h('div', { class: `portrait-big ${t.gender}`, html: portraitSVG(pt, 96) }),
          h('div', { class: 'portrait-tag' }, pt.tag),
          h('div', { class: 'gender-toggle' },
            h('button', { class: t.gender === 'male' ? 'active' : '', onClick: () => { this.charTemplate.gender = 'male'; this.charTemplate.portraitId = pickPortrait('male', t.talentIds).id; this.renderCreate(); } }, '♂ 男'),
            h('button', { class: t.gender === 'female' ? 'active' : '', onClick: () => { this.charTemplate.gender = 'female'; this.charTemplate.portraitId = pickPortrait('female', t.talentIds).id; this.renderCreate(); } }, '♀ 女'),
          ),
        ),
        // 流程① 先随机：灵根 / 气运 / 天赋 / 出身，不满意可反复重随
        h('div', { class: 'card' },
          h('div', { class: 'row' },
            h('div', { class: 'grow' }, h('h4', null, `灵根 · ${root.name}`), h('div', { class: 'muted' }, root.desc)),
            h('div', { class: 'muted', style: { textAlign: 'right' } }, h('div', null, `修炼 ×${root.mult.toFixed(2)}`), h('div', null, `突破 ${(root.breakBonus >= 0 ? '+' : '')}${Math.round(root.breakBonus * 100)}%`)),
          ),
          h('div', { class: 'row', style: { marginTop: '0.5rem', alignItems: 'center' } },
            h('span', { class: 'k' }, '气运'),
            h('div', { class: 'qiyun-bar' }, h('div', { class: 'qiyun-bar__fill', style: { width: `${qy}%` } })),
            h('span', { class: `qiyun-label ${ql.cls}` }, `${qy} · ${ql.text}`),
          ),
          h('div', { class: 'talent-list' },
            h('div', { class: 'muted', style: { margin: '0.5rem 0 0.25rem' } }, '天赋'),
            ...(t.talentIds.length ? t.talentIds.map((id) => talentChip(id)) : [h('div', { class: 'muted' }, '（无）')]),
          ),
          h('div', { class: 'muted', style: { margin: '0.5rem 0 0.25rem' } }, `出身 · ${bg.emoji} ${bg.name}`),
          h('div', { class: 'muted' }, bg.desc),
        ),
        h('button', { class: 'btn-ghost big-btn reroll-btn', onClick: () => this.reroll() }, '🎲 重新随机属性'),
        // 流程② 后取名：属性随机满意后，再主动点击此处输入道号
        h('div', { class: 'card' },
          h('h4', null, '道号'),
          h('input', { class: 'name-input', dataset: { id: 'name' }, maxlength: 8, placeholder: '请输入道号（可留空）', value: this.charName || '' }),
          h('div', { class: 'muted', style: { marginTop: '0.3rem' } }, '取一个称心的名号，踏入修仙之途。'),
        ),
      ),
      h('div', { class: 'create__foot' },
        h('button', { class: 'btn-primary big-btn', onClick: () => this.confirmCreate() }, '⚡ 开始修仙'),
      ),
      h('div', { class: 'muted', style: { textAlign: 'center', padding: '0 1rem 1rem' } }, '灵根、天赋、气运、出身皆随机生成；先随机至称心，再取道号入道。'),
    );
    this.stage.appendChild(wrap);
    const inp = wrap.querySelector('[data-id="name"]');
    if (inp) {
      inp.addEventListener('input', () => { this.charName = inp.value; });
      // 不自动聚焦：手机端聚焦会唤起软键盘遮挡「重新随机」按钮，且每次重随都会重复弹出。
      // 流程上应先随机满意后，由玩家主动点击此处取名。
    }
  }

  // 重新随机：保留当前性别选择，重掷其余设定
  reroll() {
    const keepGender = this.charTemplate ? this.charTemplate.gender : null;
    const t = rollCharacter(Math.random);
    if (keepGender) t.gender = keepGender;
    t.portraitId = pickPortrait(t.gender, t.talentIds).id;
    this.charTemplate = t;
    this.renderCreate();
  }

  confirmCreate() {
    const name = (this.charName || '').trim().slice(0, 8);
    const t = { ...this.charTemplate, name, slot: this.activeSlot };
    const p = newPlayer(Math.random, t);
    saveSlot(this.activeSlot, p);
    this.charTemplate = null;
    this.charName = '';
    this.log = [];
    this.pushLog('你睁开双眼，发觉自己竟来到修仙之界……', 'epic');
    this.pushLog('一缕天地灵气被你纳入体内，修炼之路由此始。', 'normal');
    if (name) this.pushLog(`自此，修士「${name}」踏上仙途。`, 'epic');
    this.enterGame(p, { isNew: true });
  }

  // ============ 进入游戏 ============
  enterGame(player, opts = {}) {
    this.player = player;
    this.activeSlot = player.slot || getActiveSlot();
    setActiveSlot(this.activeSlot);
    this.screen = 'game';

    // 离线收益（仅Returning 玩家：新角色 lastSeen=0 不结算）
    let offline = null;
    if (!opts.isNew) {
      const off = computeOffline(player);
      if (off.xp > 0) { addXp(player, off.xp); offline = off; }
    }
    // 立即落盘刷新 lastSeen：否则 lastSeen 要等到 10 秒定时器 / 首次 afterAction 才更新，
    // 若玩家开档后 10 秒内、未做任何操作即关闭页面，下次开档会按旧 lastSeen 再次发放同一时段收益。
    recompute(player);
    this.pendingOffline = offline;
    saveGame(player);

    this.tab = 'cultivate';
    this.market = null;
    this.battle = null;
    this.trial = null;
    this.buildSkeleton();
    this.refreshStatus();
    this.renderPanel();
    this.startLoop();
    // 每日活力跨日刷新（仅 Returning 玩家提示）
    this.checkDayRollover(opts.isNew ? false : true);
  }

  buildSkeleton() {
    clear(this.stage);
    clear(this.modalRoot);
    this.gameRoot = h('div', { class: 'frxx-game' });
    this.statusEl = h('div', { class: 'status-bar' });
    this.logEl = h('div', { class: 'log-strip' });
    this.content = h('div', { class: 'content' });
    this.tabBar = h('div', { class: 'tab-bar' });
    this.gameRoot.append(this.statusEl, this.logEl, this.content, this.tabBar);
    this.stage.append(this.gameRoot);
    this.buildStatus();
    this.buildTabs();
    this.renderLog();
    if (this.pendingOffline) { this.showOfflinePopup(this.pendingOffline); this.pendingOffline = null; }
  }

  // —— 状态栏（一次构建，刷新时只更新数值）——
  buildStatus() {
    clear(this.statusEl);
    const p = this.player;
    const info = realmInfo(p);
    const pt = portraitDef(p.portraitId);
    this.ui.avatar = h('button', { class: 'avatar-btn', title: '人物', html: portraitSVG(pt, 34), onClick: () => this.showCharacter() });
    this.ui.realmBadge = h('div', { class: 'realm-badge' },
      h('span', { class: 'seal', style: { background: info.realm.color } }, info.realm.short),
      h('span', { class: 'realm-name' }, realmDisplay(info)),
    );
    this.ui.stones = h('span', { class: 'stones' }, `💎 ${fmt(p.stones)}`);
    this.ui.vitality = h('span', { class: 'vit-pill', title: '每日活力：消耗型行动力，跨日恢复' }, `⚡${Math.floor(p.vitality)}/${p.maxVitality}`);
    this.ui.chaosBanner = h('div', { class: 'chaos-banner', style: { display: 'none' } });

    this.ui.hpBar = bar(p.hp, p.maxHp, { class: 'hp', label: `气血 ${Math.floor(p.hp)}/${p.maxHp}` });
    this.ui.mpBar = bar(p.mp, p.maxMp, { class: 'mp', label: `灵力 ${Math.floor(p.mp)}/${p.maxMp}` });
    this.ui.xpBar = bar(p.xp, p.xpMax, { class: 'xp', label: `修为 ${Math.floor(p.xp)}/${p.xpMax}` });

    this.statusEl.append(
      h('div', { class: 'status-row' },
        this.ui.avatar,
        this.ui.realmBadge,
        h('div', { class: 'spacer' }),
        this.ui.vitality,
        this.ui.stones,
        h('button', { class: 'icon-btn', title: '成就与称号', onClick: () => this.showAchievements() }, '🏆'),
        h('button', { class: 'icon-btn', title: '设置 / 存档', onClick: () => this.showSettings() }, '⚙️'),
      ),
      h('div', { class: 'res-bars' }, this.ui.hpBar, this.ui.mpBar),
      h('div', { class: 'xp-wrap' }, this.ui.xpBar),
      this.ui.chaosBanner,
    );
  }

  refreshStatus() {
    const p = this.player;
    const info = realmInfo(p);
    // 境界徽章：颜色/文字
    const seal = this.ui.realmBadge.querySelector('.seal');
    seal.style.background = info.realm.color;
    this.ui.realmBadge.lastChild.textContent = realmDisplay(info);
    // 头像：飞升后切换为仙尊形象
    const pt = portraitDef(p.ascended ? 'pt_ascend' : p.portraitId);
    this.ui.avatar.innerHTML = portraitSVG(pt, 34);
    this.ui.stones.textContent = `💎 ${fmt(p.stones)}`;
    this._setVitality(p);
    this._setBar(this.ui.hpBar, p.hp, p.maxHp, `气血 ${Math.floor(p.hp)}/${p.maxHp}`);
    this._setBar(this.ui.mpBar, p.mp, p.maxMp, `灵力 ${Math.floor(p.mp)}/${p.maxMp}`);
    // 修为条：满额之外的累积(溢出)会显示出来并高亮，提示这部分会在突破时结转，不再被清零。
    const overflow = xpOverflow(p);
    const xpLabel = overflow > 0
      ? `修为 ${Math.floor(p.xp)}/${p.xpMax}　溢出 +${Math.floor(overflow)}`
      : `修为 ${Math.floor(p.xp)}/${p.xpMax}`;
    this._setBar(this.ui.xpBar, p.xp, p.xpMax, xpLabel);
    this.ui.xpBar.classList.toggle('overflow', overflow > 0);
    // 混沌事件横幅
    const c = chaosActive(p);
    if (c === 'lingchao') this._setChaos('🌊 灵潮爆发中，修炼速度翻倍！', 'lingchao');
    else if (c === 'mojie') this._setChaos('👿 魔劫入侵，物价飙升！', 'mojie');
    else this.ui.chaosBanner.style.display = 'none';
  }

  _setVitality(p) {
    const cur = Math.floor(p.vitality || 0);
    const max = p.maxVitality || 100;
    const low = cur <= 0;
    this.ui.vitality.textContent = `⚡${cur}/${max}`;
    this.ui.vitality.classList.toggle('low', low);
  }

  _setBar(node, value, max, label) {
    const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
    node.querySelector('.bar__fill').style.width = `${pct}%`;
    node.querySelector('.bar__label').textContent = label;
  }
  _setChaos(text, kind) {
    this.ui.chaosBanner.style.display = '';
    this.ui.chaosBanner.className = `chaos-banner ${kind}`;
    this.ui.chaosBanner.textContent = text;
  }

  buildTabs() {
    clear(this.tabBar);
    for (const t of TABS) {
      const btn = h('button', {
        class: `tab ${this.tab === t.key ? 'active' : ''}`,
        onClick: () => { this.tab = t.key; if (t.key === 'market' && !this.market) this.market = rollMarket(this.player, Math.random); this.buildTabs(); this.renderPanel(); },
      }, h('span', { class: 'ic' }, t.icon), h('span', null, t.label));
      this.tabBar.appendChild(btn);
    }
  }

  // —— 日志 ——
  pushLog(text, type = 'normal') {
    this.log.push({ text, type });
    if (this.log.length > 40) this.log.shift();
    if (this.logEl) this.renderLog();
  }
  renderLog() {
    clear(this.logEl);
    const recent = this.log.slice(-10);
    for (const ln of recent) this.logEl.appendChild(h('div', { class: `ln ${ln.type}` }, ln.text));
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  // —— 内容面板路由 ——
  renderPanel() {
    clear(this.content);
    if (this.player.ascended) { this.renderAscended(); return; }
    // 活力耗尽（连最省的修炼都付不起）时，所有页顶部给出醒目的「进入次日」入口，
    // 避免玩家活力用尽后无任何行动可做、又找不到次日按钮而死锁卡关。
    if (this.isVitalityDepleted()) this.content.appendChild(this.renderRestBanner());
    switch (this.tab) {
      case 'cultivate': this.renderCultivate(); break;
      case 'explore': this.renderExplore(); break;
      case 'market': this.renderMarket(); break;
      case 'bag': this.renderBag(); break;
      case 'alchemy': this.renderAlchemy(); break;
    }
  }

  rerender() { this.refreshStatus(); this.renderPanel(); }

  // ============ 修炼页 ============
  renderCultivate() {
    const p = this.player;
    const root = rootDef(p.rootId);
    const target = nextTarget(p);
    const speed = passiveXpPerSec(p.tier, cultivateSpeedMult(p));
    const canActive = p.mp >= ACTIVE_CULTIVATE_MP_COST && !p.ascended && canAffordVitality(p, VITALITY_COSTS.cultivate);

    const c = h('div', null);
    c.append(
      h('div', { class: 'panel-title' }, '道心修炼'),
      h('div', { class: 'card' },
        h('div', { class: 'row' },
          h('div', { class: 'grow' },
            h('h4', null, `灵根 · ${root.name}`),
            h('div', { class: 'muted' }, root.desc),
          ),
          h('div', { class: 'muted', style: { textAlign: 'right' } },
            h('div', null, `修炼 ×${root.mult.toFixed(2)}`),
            h('div', null, `突破 ${(p.rootBonus >= 0 ? '+' : '')}${Math.round(p.rootBonus * 100)}%`),
          ),
        ),
        h('div', { class: 'stat-grid', style: { marginTop: '0.5rem' } },
          kv('攻击', p.atk), kv('防御', p.def), kv('神识', p.spirit),
          kv('气血上限', p.maxHp), kv('灵力上限', p.maxMp), kv('修炼/秒', speed.toFixed(2)),
        ),
      ),
      h('button', {
        class: 'btn-primary big-btn', disabled: !canActive,
        onClick: () => this.doActiveCultivate(),
      }, `🧘 主动修炼（灵力 ${ACTIVE_CULTIVATE_MP_COST} · 活力 ${VITALITY_COSTS.cultivate}）`),
      h('div', { class: 'muted', style: { textAlign: 'center' } }, vitalityHint(p, VITALITY_COSTS.cultivate) || '小概率触发顿悟，修为翻三倍。'),
    );

    // 突破区
    if (target) {
      const nextRealm = REALMS[target.tier];
      const xpFull = isXpFull(p);
      const hasTupo = hasItem(p, 'pill_tupo');
      const baseChance = breakthroughChance(p, false, target.tier);
      const pillChance = breakthroughChance(p, true, target.tier);
      const major = needsTrial(p);
      const reqItemDef = target.reqItem ? ITEMS[target.reqItem] : null;
      const hasReq = !target.reqItem || hasItem(p, target.reqItem);

      const reqLines = [];
      const overflow = xpOverflow(p);
      reqLines.push(xpFull
        ? line(overflow > 0 ? `修为已圆满（溢出 +${Math.floor(overflow)}，突破时结转）` : '修为已圆满', true)
        : line(`修为 ${Math.floor(p.xp)}/${p.xpMax}`, xpFull));
      if (reqItemDef) reqLines.push(line(`${reqItemDef.name}：${hasReq ? '已备' : '缺失'}（${reqItemDef.desc}）`, hasReq));
      if (major) reqLines.push(h('div', { class: 'req-line' }, trialLabel(target.trial)));

      c.append(
        h('div', { class: 'card', style: { marginTop: '0.6rem' } },
          h('h4', null, `下一境界：${nextRealm.name}${nextRealm.subs[target.sub]}`),
          h('div', { class: 'muted', style: { marginBottom: '0.4rem' } }, nextRealm.desc),
          ...reqLines,
          h('div', { class: 'req-line' },
            major ? h('span', null, `成功率随渡劫表现而定`)
                  : h('span', null, `突破成功率 ${Math.round(baseChance * 100)}%${hasTupo ? ` → 服丹 ${Math.round(pillChance * 100)}%` : ''}`),
          ),
          h('button', {
            class: 'btn-jade big-btn', disabled: !canBreakthrough(p),
            onClick: () => this.startBreakthrough(),
          }, major ? `⚡ 准备${trialLabel(target.trial)}` : '🌀 突破瓶颈'),
        ),
      );
    }
    this.content.appendChild(c);
  }

  doActiveCultivate() {
    const p = this.player;
    if (!canAffordVitality(p, VITALITY_COSTS.cultivate)) { this.toast('活力不足，明日恢复', 'bad'); return; }
    const res = activeCultivate(p, Math.random);
    if (!res.ok) { this.toast(res.reason, 'bad'); return; }
    spendVitality(p, VITALITY_COSTS.cultivate);
    if (res.epiphany) {
      this.float(`顿悟！+${res.xp}`, 'epic');
      this.pushLog(`✨ 顿悟！修为 +${res.xp}`, 'epic');
      this.statusEl.classList.add('flash-gold');
      setTimeout(() => this.statusEl.classList.remove('flash-gold'), 500);
    } else {
      this.float(`+${res.xp}`, 'good');
    }
    this.afterAction();
  }

  startBreakthrough() {
    const p = this.player;
    if (!canBreakthrough(p)) return;
    if (needsTrial(p)) { this.openTrial(); return; }
    // 小境界：选择是否服突破丹
    const target = nextTarget(p);
    const hasTupo = hasItem(p, 'pill_tupo');
    const foot = [];
    foot.push(h('button', { class: 'btn-jade', onClick: () => { this.closeModal(); this.doMinorBreakthrough(false); } }, '直接突破'));
    if (hasTupo) foot.push(h('button', { class: 'btn-primary', onClick: () => { this.closeModal(); this.doMinorBreakthrough(true); } }, `服突破丹(+20%)`));
    foot.push(h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '再等等'));
    this.showSheet({
      title: `突破 · ${REALMS[target.tier].name}${REALMS[target.tier].subs[target.sub]}`,
      body: [h('div', { class: 'muted' }, '修为圆满，只差临门一脚。突破失败会折损部分修为。')],
      foot,
    });
  }

  doMinorBreakthrough(useTupo) {
    const res = attemptMinorBreakthrough(this.player, useTupo, Math.random);
    if (!res.ok) { this.toast(res.reason, 'bad'); return; }
    for (const l of res.log) this.pushLog(l, res.success ? 'epic' : 'bad');
    if (res.success) { this.float('突破成功！', 'epic'); this.toast(`迈入${realmInfo(this.player).majorName}${realmInfo(this.player).subName}！`, 'epic'); }
    else { this.float('突破失败', 'bad'); }
    this.afterAction();
  }

  // ============ 探索页 ============
  renderExplore() {
    const p = this.player;
    const noVit = !canAffordVitality(p, VITALITY_COSTS.explore);
    this.content.append(
      h('div', { class: 'panel-title' }, '行走江湖'),
      h('div', { class: 'card' },
        h('h4', null, '外出探索'),
        h('div', { class: 'muted', style: { marginBottom: '0.5rem' } },
          '灵山、洞府、遗迹、野外……随机场景暗藏机缘与凶险。'),
        h('div', { class: 'stat-grid', style: { marginBottom: '0.5rem' } },
          kv('消耗灵力', EXPLORE_MP_COST), kv('消耗气血', EXPLORE_HP_COST),
          kv('消耗活力', VITALITY_COSTS.explore), kv('已探索', p.stats.exploreCount),
        ),
        h('button', {
          class: 'btn-primary big-btn',
          disabled: noVit || p.mp < EXPLORE_MP_COST || p.hp <= EXPLORE_HP_COST || p.ascended,
          onClick: () => this.doExplore(),
        }, '🗺️ 外出探索'),
        h('div', { class: 'muted', style: { marginTop: '0.4rem' } },
          noVit ? '⚡ 活力不足，明日恢复后再探。' : (p.pity.explore >= 5 ? '⭐ 你感到一阵机缘在酝酿……' : '深度探索可能遭遇更强妖兽，也可能爆出重宝。')),
      ),
      h('div', { class: 'card' },
        h('h4', null, '随机性说明'),
        h('div', { class: 'muted' },
          '事件、掉落、伤害均含随机浮动；连续多次无奇遇时，奇遇概率会提升（保底）。气运越高，奇遇越易降临。极小概率触发灵潮/魔劫等世界事件。'),
      ),
    );
  }

  doExplore() {
    const p = this.player;
    if (!canAffordVitality(p, VITALITY_COSTS.explore)) { this.toast('活力不足，明日恢复', 'bad'); return; }
    const res = rollExplore(p, Math.random);
    if (res.error) { this.toast(res.error, 'bad'); this.rerender(); return; }
    spendVitality(p, VITALITY_COSTS.explore);
    this.pushLog(`你前往${res.sceneName}探索……`, 'normal');
    this.encounter = res.encounter;
    this.sceneName = res.sceneName;
    this.openEncounter();
    this.refreshStatus();
  }

  openEncounter() {
    const e = this.encounter;
    if (e.kind === 'battle') { this.startBattle(e.enemy, e.title, e.text); return; }
    if (e.kind === 'choice') { this.renderChoice(e); return; }
    // instant / world
    this.renderInstant(e);
  }

  renderInstant(e) {
    const isWorld = e.kind === 'world';
    this.showSheet({
      title: e.title,
      body: [
        h('div', { style: { textAlign: 'center', fontSize: '2rem', marginBottom: '0.4rem' } }, e.emoji),
        h('div', { class: 'muted', style: { textAlign: 'center', marginBottom: '0.6rem' } }, e.text),
      ],
      foot: [h('button', { class: isWorld ? 'btn-primary' : 'btn-jade', onClick: () => {
        const logs = applyReward(this.player, e.result, Math.random);
        for (const l of logs) this.pushLog(l.text, l.type);
        this.checkAchvAndToast();
        this.closeModal();
        this.afterAction();
      } }, '收下')],
    });
  }

  renderChoice(e) {
    const body = [
      h('div', { style: { textAlign: 'center', fontSize: '2rem', marginBottom: '0.4rem' } }, e.emoji),
      h('div', { class: 'muted', style: { textAlign: 'center', marginBottom: '0.6rem' } }, e.text),
      h('div', { class: 'choice-list' },
        e.options.map((opt) => h('button', {
          class: 'btn-ghost',
          onClick: () => this.resolveChoice(opt),
        }, `${opt.emoji || ''} ${opt.label}`)),
      ),
    ];
    this.showSheet({ title: e.title, body, foot: [] });
  }

  resolveChoice(opt) {
    const outcome = opt.resolve(Math.random);
    if (outcome && outcome.battle) {
      this.pushLog(outcome.text || '战端骤起！', 'bad');
      this.startBattle(outcome.battle, '变生肘腋', outcome.text || '对方赫然出手！');
      return;
    }
    const logs = applyReward(this.player, outcome, Math.random);
    for (const l of logs) this.pushLog(l.text, l.type);
    this.checkAchvAndToast();
    this.closeModal();
    this.afterAction();
  }

  // ============ 战斗 ============
  startBattle(enemy, title, text) {
    this.battle = { state: createBattle(this.player, enemy), enemy };
    this.renderBattle(title, text);
  }

  renderBattle(title, text) {
    const { state, enemy } = this.battle;
    const p = this.player;
    const usablePills = ['pill_huitian', 'pill_huitian2', 'pill_buling', 'pill_buling2'].filter((id) => countItem(p, id) > 0);
    const hasTreasureSkill = !!(p.equipment && ITEMS[p.equipment].stats && ITEMS[p.equipment].stats.skill);

    const body = [
      h('div', { class: `enemy-head ${enemy.elite ? 'elite' : ''}` },
        h('div', { class: 'emo' }, enemy.elite ? '👹' : '🐉'),
        h('div', null, `${enemy.name}${enemy.elite ? '（精英）' : ''}`),
      ),
      bar(state.enemy.hp, enemy.maxHp, { class: 'hp', label: `妖兽气血 ${Math.max(0, Math.floor(state.enemy.hp))}/${enemy.maxHp}` }),
      h('div', { class: 'muted', style: { margin: '0.3rem 0' } }, `攻 ${enemy.atk} · 防 ${enemy.def} · ${elName(enemy.el)}`),
      h('div', { class: 'battle-log', dataset: { id: 'blog' } }),
      h('div', { class: 'muted' }, text || ''),
    ];
    this.showSheet({
      title: title || '战斗',
      body,
      foot: [
        h('div', { class: 'action-grid' },
          h('button', { class: 'btn-danger', onClick: () => this.doBattle({ type: 'attack' }) }, '⚔️ 攻击'),
          h('button', { onClick: () => this.doBattle({ type: 'defend' }) }, '🛡️ 防御'),
          h('button', { class: 'btn-primary', disabled: !hasTreasureSkill, onClick: () => this.doBattle({ type: 'skill' }) }, '✨ 法宝'),
          h('button', { onClick: () => this.doBattle({ type: 'flee' }) }, '🏃 逃跑'),
        ),
        usablePills.length
          ? h('div', { class: 'row wrap', style: { marginTop: '0.4rem' } },
              usablePills.map((id) => h('button', { class: 'btn-ghost', style: { flex: '1 1 40%' }, onClick: () => this.doBattle({ type: 'item', itemId: id }) }, `${ITEMS[id].emoji}${ITEMS[id].name} ×${countItem(p, id)}`)),
            )
          : null,
      ],
    });
    this._renderBattleLog();
  }

  _renderBattleLog() {
    const box = this.modalRoot.querySelector('[data-id="blog"]');
    if (!box) return;
    clear(box);
    for (const l of this.battle.state.log) {
      const type = l.includes('击败') ? 'epic' : (l.includes('反击') || l.includes('对你造成') || l.includes('败退')) ? 'bad' : 'good';
      box.appendChild(h('div', { class: `ln ${type}` }, l));
    }
    box.scrollTop = box.scrollHeight;
  }

  doBattle(action) {
    const p = this.player;
    const res = battleStep(this.battle.state, p, action, Math.random);
    for (const l of res.logs) this.battle.state.log.push(l);
    this.refreshStatus();
    if (res.over) {
      this.finishBattle(res.result);
      return;
    }
    // 更新妖兽血条 + 日志（重建战斗弹窗体）
    this.renderBattle('战斗', '');
  }

  finishBattle(result) {
    const { enemy } = this.battle;
    const p = this.player;
    this.battle = null;
    if (result === 'win') {
      p.stats.battlesWon += 1;
      if (p.hp <= 1) p.stats.lowHpWins += 1;
      const rw = battleRewards(p, enemy, Math.random);
      // 结算奖励
      if (rw.gain.stones) p.stones += rw.gain.stones;
      for (const l of rw.logs) this.pushLog(l, 'good');
      // 掉落入袋：背包满（新种类）则遗失并提示，避免 addItem 返回 0 被忽略而静默丢物
      for (const it of rw.gain.items) {
        const { log } = addItemOrLog(p, it.id, it.qty);
        this.pushLog(log.text, log.type);
      }
      if (rw.gain.treasure) {
        const { log } = addItemOrLog(p, rw.gain.treasure, 1);
        this.pushLog(log.text, log.type);
      }
      if (rw.gain.recipe) {
        try {
          const had = p.recipes.includes(rw.gain.recipe);
          learnRecipeGuard(p, rw.gain.recipe);
          if (!had) this.pushLog(`意外获得配方【${RECIPE_BY_ID[rw.gain.recipe] ? RECIPE_BY_ID[rw.gain.recipe].name : rw.gain.recipe}】`, 'epic');
        } catch (_) {}
      }
      // 战斗修为奖励
      const xp = Math.round(p.xpMax * 0.05);
      addXp(p, xp);
      this.pushLog(`战斗胜利！修为 +${xp}。`, 'epic');
      this.float('胜利！', 'epic');
    } else if (result === 'lose') {
      p.stats.deaths += 1;
      const lostStones = Math.floor(p.stones * 0.1);
      p.stones -= lostStones;
      // addXp 不支持负数：直接扣除修为
      const xpLoss = Math.floor(p.xpMax * 0.05);
      p.xp = Math.max(0, p.xp - xpLoss);
      this.pushLog(`战败！损失 ${lostStones} 灵石与部分修为，被逐回安全之地。`, 'bad');
      this.toast('战败重伤……', 'bad');
    } else {
      this.pushLog('你脱离了战斗。', 'normal');
    }
    recompute(p);
    this.closeModal();
    this.checkAchvAndToast();
    this.afterAction();
  }

  // ============ 渡劫 / 心魔 ============
  openTrial() {
    const t = startMajorTrial(this.player, Math.random);
    if (!t) return;
    this.trial = t;
    for (const l of t.log) this.pushLog(l, 'epic');
    this.renderTrial();
  }

  renderTrial() {
    const t = this.trial;
    const p = this.player;
    const progress = t.kind === 'heart'
      ? `心境考验 第 ${Math.min(t.round + 1, t.rounds)}/${t.rounds} 轮（已过 ${t.passes}，需 ${Math.ceil(t.rounds / 2)}）`
      : `${t.kind === 'ascend' ? '飞升天劫' : '天劫'} 第 ${Math.min(t.round + 1, t.rounds)}/${t.rounds} 道`;
    const body = [
      h('div', { class: 'enemy-head' }, h('div', { class: 'emo' }, t.kind === 'heart' ? '👁️‍🗨️' : '⚡')),
      h('div', { style: { textAlign: 'center', fontWeight: 600, marginBottom: '0.4rem' } }, progress),
      t.kind !== 'heart' ? bar(p.hp, p.maxHp, { class: 'hp', label: `气血 ${Math.floor(p.hp)}/${p.maxHp}` }) : null,
      h('div', { class: 'battle-log', dataset: { id: 'tlog' } }),
    ];
    let foot;
    if (t.kind === 'heart') {
      const hasQingxin = hasItem(p, 'pill_qingxin');
      foot = [h('div', { class: 'action-grid' },
        h('button', { class: 'btn-jade', onClick: () => this.doTrial({ type: 'stand' }) }, '🧘 坚守本心'),
        h('button', { class: 'btn-primary', disabled: !hasQingxin, onClick: () => this.doTrial({ type: 'pill' }) }, `🧿 清心丹 ×${countItem(p, 'pill_qingxin')}`),
      )];
    } else {
      const hasTreasure = !!p.equipment;
      const hasHeal = hasItem(p, 'pill_huitian') || hasItem(p, 'pill_huitian2');
      foot = [h('div', { class: 'action-grid' },
        h('button', { class: 'btn-danger', onClick: () => this.doTrial({ type: 'endure' }) }, '💥 硬抗'),
        h('button', { class: 'btn-primary', disabled: !hasTreasure, onClick: () => this.doTrial({ type: 'treasure' }) }, '🛡️ 祭法宝'),
        h('button', { onClick: () => this.doTrial({ type: 'pill' }), disabled: !hasHeal, style: { gridColumn: 'span 2' } }, '💊 服回血丹'),
      )];
    }
    this.showSheet({ title: t.kind === 'heart' ? '渡心魔' : (t.kind === 'ascend' ? '飞升天劫' : '渡天劫'), body, foot });
    this._renderTrialLog();
  }

  _renderTrialLog() {
    const box = this.modalRoot.querySelector('[data-id="tlog"]');
    if (!box) return;
    clear(box);
    for (const l of this.trial.log) {
      const type = l.includes('失败') || l.includes('失守') || l.includes('劫伤') ? 'bad' : l.includes('成功') || l.includes('稳渡') || l.includes('散去') || l.includes('坚守') ? 'good' : 'normal';
      box.appendChild(h('div', { class: `ln ${type !== 'normal' ? type : ''}` }, l));
    }
    box.scrollTop = box.scrollHeight;
  }

  doTrial(action) {
    const t = this.trial;
    const res = trialRespond(t, this.player, action, Math.random);
    for (const l of res.logs) t.log.push(l);
    this.refreshStatus();
    if (res.over) {
      if (res.success) {
        const adv = advanceRealm(this.player, t.target);
        this.pushLog(`渡劫功成！迈入${realmInfo(this.player).majorName}${realmInfo(this.player).subName}。获得 ${adv.stones} 灵石。`, 'epic');
        this.float(t.kind === 'ascend' ? '白日飞升！' : '渡劫成功！', 'epic');
        this.toast(`突破至${realmInfo(this.player).majorName}！`, 'epic');
      } else {
        failMajor(this.player, t.kind);
        this.pushLog('渡劫失败，修为折损，需重整旗鼓。', 'bad');
        this.toast('渡劫失败……', 'bad');
      }
      this.trial = null;
      this.closeModal();
      this.checkAchvAndToast();
      this.afterAction();
      return;
    }
    this.renderTrial();
  }

  // ============ 坊市 ============
  renderMarket() {
    const p = this.player;
    if (!this.market) this.market = rollMarket(p, Math.random);
    const c = h('div', null);
    c.append(
      h('div', { class: 'panel-title' }, '坊市'),
      h('div', { class: 'row', style: { marginBottom: '0.6rem' } },
        h('div', { class: 'grow muted' }, `持有 💎 ${Math.floor(p.stones)}${this.market.mojie ? ' · 魔劫中物价飙升' : ''}`),
        h('button', { class: 'btn-ghost', onClick: () => this.doRefreshMarket() }, '🔄 刷新(10)'),
      ),
      h('h4', { class: 'muted', style: { margin: '0.2rem 0 0.4rem' } }, '货架'),
    );
    if (!this.market.entries.length) c.append(h('div', { class: 'muted' }, '货架空空如也。'));
    for (const e of this.market.entries) {
      c.append(h('div', { class: 'shop-row' },
        h('div', { class: 'emo' }, e.emoji),
        h('div', { class: 'meta' }, h('div', { class: 'nm' }, e.name), h('div', { class: 'px' }, `💎${e.price}　库存 ${e.stock}`)),
        h('button', {
          class: 'btn-primary', disabled: p.stones < e.price || e.stock <= 0,
          onClick: () => this.doBuy(e),
        }, '购买'),
      ));
    }
    // 出售区
    c.append(h('h4', { class: 'muted', style: { margin: '0.6rem 0 0.4rem' } }, '出售物品（半价回收）'));
    const sellable = distinctItems(p).filter((id) => {
      const d = ITEMS[id];
      return d && (d.type === 'material' || d.type === 'misc' || d.type === 'treasure' || d.type === 'pill');
    });
    if (!sellable.length) c.append(h('div', { class: 'muted' }, '无可出售之物。'));
    for (const id of sellable) {
      const d = ITEMS[id];
      c.append(h('div', { class: 'shop-row' },
        h('div', { class: 'emo' }, d.emoji),
        h('div', { class: 'meta' }, h('div', { class: 'nm' }, `${d.name} ×${countItem(p, id)}`), h('div', { class: 'px' }, `回收 💎${sellPrice(id)}`)),
        h('button', { class: 'btn-ghost', onClick: () => this.doSell(id) }, '出售'),
      ));
    }
    this.content.appendChild(c);
  }

  doRefreshMarket() {
    if (this.player.stones < 10) { this.toast('灵石不足', 'bad'); return; }
    this.player.stones -= 10;
    this.market = rollMarket(this.player, Math.random);
    this.pushLog('坊市货架已刷新。', 'normal');
    this.afterAction();
  }

  doBuy(entry) {
    const res = buyItem(this.player, entry, 1);
    if (!res.ok) { this.toast(res.reason, 'bad'); this.afterAction(); return; }
    if (res.learned) this.pushLog(`习得/获得【${entry.name}】（花费 ${res.cost} 灵石）。`, 'epic');
    else this.pushLog(`购入 ${res.qty} × ${entry.name}（花费 ${res.cost} 灵石）。`, 'normal');
    this.afterAction();
  }

  doSell(id) {
    const res = sellItem(this.player, id, 1);
    if (!res.ok) return;
    this.pushLog(`售出 ${res.qty} × ${ITEMS[id].name}（得 ${res.gain} 灵石）。`, 'normal');
    this.afterAction();
  }

  // ============ 背包 ============
  renderBag() {
    const p = this.player;
    const used = distinctItems(p).length;
    const c = h('div', null);
    c.append(
      h('div', { class: 'panel-title' }, '储物袋'),
      h('div', { class: 'card' },
        h('div', { class: 'row' },
          h('div', { class: 'grow' }, h('h4', null, `容量 ${used}/${p.bagCapacity}`)),
          h('button', { class: 'btn-ghost', disabled: p.stones < bagExpandCost(p), onClick: () => { if (expandBag(p)) { this.pushLog('储物袋扩容 +5！', 'good'); } this.afterAction(); } }, `扩容+5 (💎${bagExpandCost(p)})`),
        ),
        bar(used, p.bagCapacity, { class: 'xp', label: `${used}/${p.bagCapacity}` }),
      ),
    );

    // 装备中
    if (p.equipment) {
      const tr = ITEMS[p.equipment];
      c.append(h('div', { class: 'card' },
        h('h4', null, '装备中'),
        h('div', { class: 'row' },
          h('div', { class: 'grow' }, `${tr.emoji} ${tr.name}`, h('div', { class: 'muted' }, `${tr.stats.atk ? `攻+${tr.stats.atk} ` : ''}${tr.stats.def ? `防+${tr.stats.def} ` : ''}${elName(tr.stats.el)}${tr.stats.skill ? ` · ${TREASURE_SKILLS[tr.stats.skill].name}` : ''}`)),
          h('button', { class: 'btn-ghost', onClick: () => { if (!unequip(p)) this.toast('储物袋已满，无法卸下装备', 'bad'); this.afterAction(); } }, '卸下'),
        ),
      ));
    }

    const items = distinctItems(p);
    const types = ['pill', 'treasure', 'material', 'misc'];
    for (const type of types) {
      const ids = items.filter((id) => ITEMS[id] && ITEMS[id].type === type);
      if (!ids.length) continue;
      c.append(h('h4', { class: 'muted', style: { margin: '0.5rem 0 0.3rem' } }, typeName(type)));
      const grid = h('div', { class: 'item-grid' });
      for (const id of ids) {
        const d = ITEMS[id];
        grid.appendChild(h('div', { class: `item ${id === p.equipment ? 'equipped' : ''}`, onClick: () => this.showItemDetail(id) },
          h('div', { class: 'emo' }, d.emoji),
          h('div', { class: 'nm' }, d.name),
          h('div', { class: 'qty' }, `×${countItem(p, id)}`),
        ));
      }
      c.append(grid);
    }

    // 功法 & 称号
    if (p.techniques.length || p.titles.length) {
      c.append(h('div', { class: 'card', style: { marginTop: '0.6rem' } },
        p.techniques.length ? h('div', null, h('h4', null, '已习功法'), h('div', { class: 'muted' }, p.techniques.map((id) => ITEMS[id].name).join('、'))) : null,
        p.titles.length ? h('div', { style: { marginTop: '0.4rem' } }, h('h4', null, '称号'), h('div', { class: 'muted' }, p.titles.map((id) => `${TITLES[id] ? TITLES[id].emoji + TITLES[id].name : id}`).join('、'))) : null,
      ));
    }
    this.content.appendChild(c);
  }

  showItemDetail(id) {
    const p = this.player;
    const d = ITEMS[id];
    const body = [
      h('div', { style: { textAlign: 'center', fontSize: '2.2rem' } }, d.emoji),
      h('h4', { style: { textAlign: 'center' } }, d.name),
      h('div', { class: 'muted', style: { textAlign: 'center', marginBottom: '0.5rem' } }, d.desc),
      h('div', { class: 'muted', style: { textAlign: 'center' } }, `持有 ×${countItem(p, id)} · 回收 💎${sellPrice(id)}`),
    ];
    const foot = [];
    if (d.type === 'pill') {
      if (d.effect) foot.push(h('button', { class: 'btn-jade', onClick: () => { this.usePill(id); this.closeModal(); } }, '使用'));
      else foot.push(h('div', { class: 'muted', style: { flex: 1, textAlign: 'center', alignSelf: 'center' } }, '此丹需在突破/渡劫时使用'));
    }
    if (d.type === 'treasure') {
      foot.push(h('button', { class: 'btn-primary', onClick: () => { if (equip(p, id)) { this.closeModal(); this.afterAction(); } else { this.toast('储物袋已满，无法换装（会销毁旧装备）', 'bad'); } } }, id === p.equipment ? '已装备' : '装备'));
    }
    foot.push(h('button', { class: 'btn-ghost', onClick: () => { this.doSell(id); this.closeModal(); } }, '出售'));
    foot.push(h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '关闭'));
    this.showSheet({ title: typeName(d.type), body, foot });
  }

  usePill(id) {
    const p = this.player;
    const d = ITEMS[id];
    if (!d.effect) { this.toast('此丹无法直接使用', 'bad'); return; }
    if (!removeItem(p, id, 1)) return;
    const e = d.effect;
    if (e.kind === 'heal_hp') { p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * e.pct)); this.pushLog(`服下${d.name}，恢复气血。`, 'good'); }
    else if (e.kind === 'heal_mp') { p.mp = Math.min(p.maxMp, p.mp + Math.round(p.maxMp * e.pct)); this.pushLog(`服下${d.name}，恢复灵力。`, 'good'); }
    else if (e.kind === 'root_upgrade') {
      const up = upgradeRoot(p);
      this.pushLog(up ? `服下${d.name}，灵根提升为${rootDef(p.rootId).name}！` : '灵根已至极境，洗髓丹无效。', up ? 'epic' : 'normal');
    } else if (e.kind === 'revive') { p.hp = p.maxHp; p.mp = p.maxMp; addXp(p, Math.round(p.xpMax * 0.3)); this.pushLog(`服下${d.name}，气血灵力全复，修为回升。`, 'epic'); }
    this.afterAction();
  }

  // ============ 炼丹 / 炼器 ============
  renderAlchemy() {
    const p = this.player;
    const c = h('div', null);
    c.append(
      h('div', { class: 'panel-title' }, '丹炉·器炉'),
      h('div', { class: 'pill-tabs' },
        h('button', { class: this.alchemySub === 'dan' ? 'active' : '', onClick: () => { this.alchemySub = 'dan'; this.renderPanel(); } }, '⚗️ 炼丹'),
        h('button', { class: this.alchemySub === 'qi' ? 'active' : '', onClick: () => { this.alchemySub = 'qi'; this.renderPanel(); } }, '🔨 炼器'),
      ),
    );
    const known = this.alchemySub === 'dan' ? ALCHEMY_RECIPES : FORGE_BLUEPRINTS;
    const list = known.filter((r) => p.recipes.includes(r.id));
    if (!list.length) c.append(h('div', { class: 'card muted' }, '尚未掌握任何配方，可在探索、坊市或击杀妖兽时获取。'));
    for (const r of list) {
      const ok = hasMaterials(p, r.inputs) && canAffordVitality(p, VITALITY_COSTS.craft);
      const rate = successRate(p, r.diff);
      const inputTxt = Object.entries(r.inputs).map(([mid, n]) => {
        const have = countItem(p, mid);
        return `${ITEMS[mid] ? ITEMS[mid].name : mid} ${have}/${n}`;
      }).join('、');
      const label = !hasMaterials(p, r.inputs) ? '材料不足' : (this.alchemySub === 'dan' ? `⚗️ 炼制（活力 ${VITALITY_COSTS.craft}）` : `🔨 锻造（活力 ${VITALITY_COSTS.craft}）`);
      c.append(h('div', { class: 'card' },
        h('div', { class: 'row' },
          h('div', { class: 'grow' }, h('h4', null, r.name), h('div', { class: 'muted', style: { marginTop: '0.2rem' } }, inputTxt)),
          h('div', { class: 'muted', style: { textAlign: 'right' } }, `成率 ${Math.round(rate * 100)}%`),
        ),
        h('button', { class: 'btn-primary big-btn', disabled: !ok, onClick: () => this.doCraft(r.id), style: { marginTop: '0.4rem' } }, label),
      ));
    }
    this.content.appendChild(c);
  }

  doCraft(recipeId) {
    const p = this.player;
    if (!canAffordVitality(p, VITALITY_COSTS.craft)) { this.toast('活力不足，明日恢复', 'bad'); return; }
    const res = this.alchemySub === 'dan' ? tryAlchemy(p, recipeId, Math.random) : tryForge(p, recipeId, Math.random);
    if (!res.ok) { this.toast(res.reason, 'bad'); return; }
    spendVitality(p, VITALITY_COSTS.craft);
    for (const l of res.logs) this.pushLog(l.text, l.type);
    this.checkAchvAndToast();
    this.afterAction();
  }

  // ============ 人物档案 ============
  showCharacter() {
    const p = this.player;
    const info = realmInfo(p);
    const root = rootDef(p.rootId);
    const pt = portraitDef(p.ascended ? 'pt_ascend' : p.portraitId);
    const qy = effectiveQiyun(p);
    const ql = qiyunLabel(qy);
    const bg = BACKGROUNDS[p.bgId] || BACKGROUNDS[Object.keys(BACKGROUNDS)[0]];
    const talents = (p.talentIds || []).map((id) => TALENTS[id]).filter(Boolean);

    const body = [
      h('div', { class: 'char-head' },
        h('div', { class: `portrait-big ${p.gender}`, html: portraitSVG(pt, 72) }),
        h('div', { class: 'char-id' },
          h('div', { class: 'char-name' }, p.name || '无名修士'),
          h('div', { class: 'muted' }, `${p.gender === 'female' ? '女' : '男'}修 · ${pt.tag}`),
          h('div', { class: 'char-realm', style: { color: info.realm.color } }, `${info.majorName}${info.subName}`),
        ),
      ),
      h('div', { class: 'stat-grid', style: { margin: '0.6rem 0' } },
        kv('灵根', root.name), kv('气运', `${qy} · ${ql.text}`),
        kv('攻击', p.atk), kv('防御', p.def),
        kv('神识', p.spirit), kv('气血上限', p.maxHp),
        kv('灵力上限', p.maxMp), kv('每日活力', `${Math.floor(p.vitality)}/${p.maxVitality}`),
        kv('修炼/秒', passiveXpPerSec(p.tier, cultivateSpeedMult(p)).toFixed(2)), kv('出身', `${bg.emoji}${bg.name}`),
      ),
    ];
    if (talents.length) {
      body.push(h('div', { class: 'muted', style: { margin: '0.4rem 0 0.3rem' } }, '天赋'));
      for (const t of talents) body.push(talentChip(t.id));
    }
    body.push(h('div', { class: 'muted', style: { margin: '0.5rem 0 0.3rem' } }, '出身来历'));
    body.push(h('div', { class: 'muted' }, bg.desc));
    if (p.ascended) body.push(h('div', { class: 'muted', style: { marginTop: '0.5rem' } }, '⛰️ 已白日飞升，得道成仙。'));
    this.showSheet({ title: '人物档案', body, foot: [h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '关闭')] });
  }

  // ============ 成就 / 设置 弹窗 ============
  showAchievements() {
    const p = this.player;
    const body = [h('div', { class: 'card' },
      h('h4', null, '称号'),
      p.titles.length ? h('div', { class: 'muted' }, p.titles.map((id) => `${TITLES[id] ? TITLES[id].emoji + ' ' + TITLES[id].name + '：' + TITLES[id].desc : id}`).join('\n')) : h('div', { class: 'muted' }, '尚无称号。'),
    )];
    for (const a of ACHIEVEMENTS) {
      const got = p.achievements.includes(a.id);
      body.push(h('div', { class: `achv ${got ? '' : 'locked'}` },
        h('div', { class: 'emo' }, a.emoji),
        h('div', { class: 'grow' }, h('div', null, a.name), h('div', { class: 'muted' }, a.desc)),
        h('div', { class: 'muted' }, got ? '✓' : '✗'),
      ));
    }
    this.showSheet({ title: '成就与称号', body, foot: [h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '关闭')] });
  }

  showSettings() {
    const p = this.player;
    const exportStr = exportSave(p);
    const body = [
      h('div', { class: 'card' },
        h('h4', null, '存档导出'),
        h('div', { class: 'muted', style: { marginBottom: '0.3rem' } }, '复制下方字符串，可在他处导入恢复。'),
        h('textarea', { dataset: { id: 'exp' }, style: { width: '100%', height: '60px', background: '#0a0703', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '0.7rem', resize: 'none' } }, exportStr),
        h('div', { class: 'row', style: { marginTop: '0.3rem' } },
          h('button', { class: 'btn-ghost', style: { flex: 1 }, onClick: () => { this.copyText(exportStr); } }, '复制'),
        ),
      ),
      h('div', { class: 'card' },
        h('h4', null, '存档导入'),
        h('textarea', { dataset: { id: 'imp' }, placeholder: '粘贴存档字符串…', style: { width: '100%', height: '50px', background: '#0a0703', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '0.7rem', resize: 'none' } }),
        h('button', { class: 'btn-primary', style: { width: '100%', marginTop: '0.3rem' }, onClick: () => this.doImport() }, '导入并覆盖'),
      ),
      h('div', { class: 'card' },
        h('h4', null, '存档管理'),
        h('div', { class: 'muted', style: { marginBottom: '0.4rem' } }, '返回存档列表可切换 / 新建 / 删除其它档案（当前进度已自动保存）。'),
        h('button', { class: 'btn-ghost', style: { width: '100%', marginBottom: '0.4rem' }, onClick: () => { this.closeModal(); this.showSlots(); } }, '📂 返回存档列表'),
        h('div', { class: 'muted', style: { marginBottom: '0.4rem' } }, '清空当前档案，重新生成一名凡人修士。'),
        h('button', { class: 'btn-danger', style: { width: '100%' }, onClick: () => this.confirmReset() }, '确认重开'),
      ),
      h('div', { class: 'muted', style: { textAlign: 'center' } }, `凡人修仙录 v2 · 纯前端 · 5 槽存档`),
    ];
    this.showSheet({ title: '设置 / 存档', body, foot: [h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '关闭')] });
  }

  copyText(t) {
    try { if (navigator.clipboard) navigator.clipboard.writeText(t); } catch (_) {}
    this.toast('已复制到剪贴板', 'good');
  }

  doImport() {
    const ta = this.modalRoot.querySelector('[data-id="imp"]');
    const str = (ta && ta.value || '').trim();
    if (!str) { this.toast('请粘贴存档字符串', 'bad'); return; }
    const imported = importSave(str);
    if (!imported) { this.toast('存档无效', 'bad'); return; }
    this.player = imported;
    this.market = null;
    this.closeModal();
    this.buildStatus();
    this.rerender();
    this.toast('存档已导入', 'good');
    this.pushLog('存档导入成功。', 'epic');
  }

  confirmReset() {
    this.showSheet({
      title: '确认重开？',
      body: [h('div', { class: 'muted' }, '此操作不可撤销，当前修仙历程将被抹去，你将重新创角。')],
      foot: [
        h('button', { class: 'btn-danger', onClick: () => { clearSave(this.activeSlot); this.closeModal(); this.charTemplate = null; this.charName = ''; this.showCreate(this.activeSlot, { fresh: true }); } }, '确认重开'),
        h('button', { class: 'btn-ghost', onClick: () => { this.closeModal(); this.showSettings(); } }, '取消'),
      ],
    });
  }

  showOfflinePopup(off) {
    const mins = Math.round(off.seconds / 60);
    this.showSheet({
      title: '闭关收益',
      body: [h('div', { style: { textAlign: 'center' } },
        h('div', { style: { fontSize: '2rem' } }, '🧘'),
        h('div', { class: 'muted', style: { margin: '0.4rem 0' } }, `闭关 ${mins} 分钟${off.capped ? '（已达 8 小时上限）' : ''}`),
        h('div', { style: { fontSize: '1.2rem', color: 'var(--epic)', fontWeight: 600 } }, `修为 +${off.xp}`),
      )],
      foot: [h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '收功') ],
    });
  }

  // ============ 飞升结局 ============
  renderAscended() {
    clear(this.content);
    this.content.append(h('div', { class: 'ascend-screen' },
      h('h1', null, '⛩️ 白日飞升'),
      h('div', { class: 'sub' }, '九重天劫尽数渡过，你霞举飞升，得道成仙！'),
      h('div', { class: 'muted' }, `累计突破 ${this.player.stats.breakthroughs} 次 · 战胜 ${this.player.stats.battlesWon} 战 · 探索 ${this.player.stats.exploreCount} 次`),
      h('button', { class: 'btn-primary big-btn', style: { maxWidth: '200px' }, onClick: () => this.confirmReset() }, '再入轮回'),
    ));
  }

  // ============ 通用：弹窗 / 提示 / 循环 ============
  showSheet({ title, body, foot }) {
    clear(this.modalRoot);
    const sheet = h('div', { class: 'overlay' },
      h('div', { class: 'sheet' },
        h('div', { class: 'sheet__head' }, h('span', { class: 't' }, title)),
        h('div', { class: 'sheet__body' }, body || []),
        foot && foot.length ? h('div', { class: 'sheet__foot' }, foot) : null,
      ),
    );
    sheet.addEventListener('click', (ev) => { if (ev.target === sheet && !this.battle && !this.trial) this.closeModal(); });
    this.modalRoot.appendChild(sheet);
  }

  closeModal() { clear(this.modalRoot); }

  toast(text, type = 'normal') {
    const t = h('div', { class: `toast ${type}` }, text);
    this.toastWrap.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }

  float(text, type = 'good') {
    const f = h('div', { class: `float-num ${type}` }, text);
    this.root.appendChild(f);
    setTimeout(() => f.remove(), 1100);
  }

  checkAchvAndToast() {
    const granted = checkAchievements(this.player);
    for (const a of granted) {
      this.pushLog(`🏅 成就达成：${a.name}`, 'epic');
      this.toast(`成就：${a.name}`, 'epic');
    }
    if (granted.length) recompute(this.player);
  }

  afterAction() {
    recompute(this.player);
    saveGame(this.player);
    this.refreshStatus();
    this.renderPanel();
  }

  // 活力是否已耗尽到「连最省力的修炼都付不起」——此时无可消耗活力的修行可做，
  // 视为卡死态，需提供「闭关静修」兜底（坊市买卖、装备穿脱、扩容等不耗活力的操作仍可进行）。
  isVitalityDepleted() {
    return this.player ? vitalityDepleted(this.player) : false;
  }

  renderRestBanner() {
    return h('div', { class: 'card rest-banner' },
      h('div', { class: 'row' },
        h('div', { class: 'grow' },
          h('h4', null, '⚡ 活力不足'),
          h('div', { class: 'muted', style: { marginTop: '0.2rem' } }, '消耗活力的修行暂不可继续。可「闭关静修」即刻恢复一次活力（每日限一次）；坊市买卖、装备穿脱等仍可进行，亦可静候次日自然回满。'),
        ),
        h('button', { class: 'btn-jade rest-btn', onClick: () => this.doRestToNextDay() }, '🧘 闭关静修'),
      ),
    );
  }

  doRestToNextDay() {
    // restToNextDay 含「每日仅一次 + 须活力耗尽」守卫；被拒（今日已用过）时给出提示而非静默
    if (!restToNextDay(this.player)) {
      this.toast('今日已闭关静修，明日方可再来', 'bad');
      return;
    }
    this.pushLog('🧘 你闭关静修，吐纳天地灵气，元气渐复，活力回满。', 'good');
    this.toast('闭关静修，活力回满', 'good');
    this.afterAction();
  }

  // 跨自然日刷新活力（在线挂机跨过零点时回满）；silent 时不弹提示
  checkDayRollover(notify) {
    if (!this.player || this.screen !== 'game') return;
    if (rolloverVitality(this.player)) {
      if (notify) {
        this.pushLog('🌅 新的一日，活力已回满。', 'good');
        this.toast('新的一天，活力回满', 'good');
      }
      saveGame(this.player);
      this.refreshStatus();
    }
  }

  startLoop() {
    this.stopLoop();
    this.tickTimer = setInterval(() => this.tick(), 1000);
    this.saveTimer = setInterval(() => { if (this.player) saveGame(this.player); }, 10000);
    document.addEventListener('visibilitychange', this._onVis);
  }

  stopLoop() {
    if (this.tickTimer) { clearInterval(this.tickTimer); this.tickTimer = null; }
    if (this.saveTimer) { clearInterval(this.saveTimer); this.saveTimer = null; }
    document.removeEventListener('visibilitychange', this._onVis);
  }

  tick() {
    if (!this.player || this.player.ascended) return;
    this.checkDayRollover(true);
    // 修炼页挂机时，记录「突破前」可用态；修为积满会令按钮由灰转亮，需实时刷新面板
    const watching = this.tab === 'cultivate' && !this.battle && !this.trial;
    const couldBreak = watching ? canBreakthrough(this.player) : false;
    // 渡劫/战斗弹窗期间不自动回血（保留压力），仅累积修为与恢复灵力
    passiveTick(this.player, 1, { hp: !(this.battle || this.trial) });
    this.refreshStatus();
    // 修为圆满→突破按钮可用：实时重建修炼面板，免得玩家还要切页再回来才点得动
    if (watching && !couldBreak && canBreakthrough(this.player)) this.renderPanel();
  }

  destroy() {
    this.stopLoop();
    try { if (this.player) saveGame(this.player); } catch (_) {}
    clear(this.parent);
  }
}

GameUI.prototype._onVis = function () {
  if (document.visibilityState === 'hidden') { try { if (this.player) saveGame(this.player); } catch (_) {} }
};

// —— 小工具（模板内）——
function kv(k, v) { return [h('div', { class: 'k' }, k), h('div', { class: 'v' }, String(v))]; }
function line(text, ok) { return h('div', { class: 'req-line' }, h('span', { class: ok ? 'ok' : 'no' }, `${ok ? '✓' : '○'} ${text}`)); }
function typeName(t) { return { pill: '丹药', material: '材料', treasure: '法宝', technique: '功法', misc: '杂物', recipe: '配方' }[t] || t; }
function elName(el) { return ({ metal: '金', wood: '木', water: '水', fire: '火', earth: '土' })[el] ? `${({ metal: '金', wood: '木', water: '水', fire: '火', earth: '土' })[el]}属性` : ''; }
// 顶部境界徽章的紧凑文案：凡人去重（避免「凡人凡人」）、大境界去「期」（「炼气期一层」→「炼气一层」）、
// 飞升单独处理，让窄屏顶栏也能完整显示当前境界。
function realmDisplay(info) {
  const major = info.majorName || '';
  const sub = info.subName || '';
  if (major === '凡人') return '凡人';
  if (major === '飞升') return '飞升';
  return `${major.replace(/期$/, '')}${sub}`;
}
function trialLabel(kind) { return { heart: '渡心魔', trib: '渡天劫', ascend: '飞升天劫' }[kind] || '突破'; }
function learnRecipeGuard(p, id) { const r = RECIPE_BY_ID[id]; if (r && !p.recipes.includes(id)) p.recipes.push(id); }
// 大数简写：1.2k / 3.4w
function fmt(n) {
  n = Math.floor(n || 0);
  if (n < 10000) return String(n);
  if (n < 100000000) return `${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)}万`;
  return `${(n / 100000000).toFixed(1)}亿`;
}
// 累加某项天赋加成
function sumTalent(ids, field) {
  let s = 0;
  for (const id of ids || []) { const t = TALENTS[id]; if (t && typeof t[field] === 'number') s += t[field]; }
  return s;
}
// 天赋展示芯片
function talentChip(id) {
  const t = TALENTS[id];
  if (!t) return null;
  return h('div', { class: 'talent-chip' },
    h('span', { class: 'emo' }, t.emoji),
    h('div', { class: 'grow' }, h('div', { class: 'nm' }, t.name), h('div', { class: 'muted' }, t.desc)),
  );
}
// 活力不足时的提示行；充足返回空串（调用方回退到默认文案）
function vitalityHint(p, cost) {
  if (!canAffordVitality(p, cost)) return '⚡ 活力不足，明日恢复。';
  return '';
}
// 相对时间
function timeAgo(ts) {
  if (!ts) return '新档';
  const diff = Math.max(0, nowSec() - ts);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  return `${Math.floor(diff / 86400)} 天前`;
}
