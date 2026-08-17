// ============================================================================
// 2.5D 战斗场景·山河社稷图（设计稿增量 第三节）
// 由战斗引擎的结构化事件（battle.events）驱动回合制回放：
//   - 等距阵型：敌方后3前2 / 我方前2后3（站位映射设计稿 3.1）。
//   - 动态反馈：回合水墨横幅、出手金色描边上浮、命中水墨飞溅、五行边光「克！」、
//     暴击震屏、治疗绿色涟漪、阵亡墨迹消散、胜负画卷过渡（设计稿 3.2）。
//   - 控制：×1 / ×2 / ×3 倍速、跳过（设计稿 3.3）。
// 纯 DOM + CSS，不依赖 Canvas，可在 jsdom 中冒烟。
// ============================================================================
import { h, clear, bar } from './dom.js';
import { resName, resEmoji } from '../config.js';
import { cardDef } from '../data/cards.js';
import { renderSilhouette } from './silhouetteRenderer.js';
import { enemyLook } from './charArt.js';
import { kairoSVG } from '../../../_lib/kairo.js';

const EL_COLOR = { metal: '#c8a951', wood: '#5fa85f', water: '#4a90c2', fire: '#d4564f', earth: '#a17b4a', none: '#9a8a72' };

// 设计稿 3.1 站位映射：pos → 前后排（玩家前排=1,2；后排=3,4,5。敌方镜像）
function rowOf(side, pos) {
  if (side === 'player') return pos <= 2 ? 'front' : 'back';
  return pos <= 2 ? 'front' : 'back';
}

export class BattleScene {
  // opts: { battle, result, rewards:{res,frags}, stars, title, onDone }
  constructor(opts) {
    this.battle = opts.battle;
    this.result = opts.result;
    this.rewards = opts.rewards || { res: {}, frags: {} };
    this.stars = opts.stars || 0;
    this.title = opts.title || '战斗';
    this.onDone = opts.onDone || (() => {});
    this.events = (this.battle && this.battle.events) ? this.battle.events.slice() : [];
    this.idx = 0;
    this.speed = 1;
    this.playing = false;
    this.done = false;
    this.units = {}; // `${side}-${pos}` -> { el, hp, maxHp, element, name }
    this._timer = null;
    this._fx = []; // 待清理的临时元素/定时器
  }

  mount(parent) {
    this.parent = parent || document.body;
    this.root = h('div', { class: 'bs' },
      this.buildArena(),
      h('div', { class: 'bs__round' }), // 回合横幅层
      h('div', { class: 'bs__edge' }),  // 五行边光层
      h('div', { class: 'bs__shake' }), // 占位（震屏 class 加在 root）
      this.buildControls(),
      this.buildResultLayer(),
    );
    this.parent.appendChild(this.root);
    // 先把所有 init 事件灌入（建立棋盘），再开始回放
    this.seedInit();
    this.play();
    return this.root;
  }

  buildArena() {
    // 敌方区（上）+ 中阵 + 我方区（下）
    const eFront = h('div', { class: 'bs__row bs__row--front' });
    const eBack = h('div', { class: 'bs__row bs__row--back' });
    const pFront = h('div', { class: 'bs__row bs__row--front' });
    const pBack = h('div', { class: 'bs__row bs__row--back' });
    this.rows = {
      'enemy-front': eFront, 'enemy-back': eBack,
      'player-front': pFront, 'player-back': pBack,
    };
    return h('div', { class: 'bs__arena' },
      h('div', { class: 'bs__side bs__side--enemy' }, eBack, eFront),
      h('div', { class: 'bs__mid' }, h('span', { class: 'bs__mid-rune' }, '☯')),
      h('div', { class: 'bs__side bs__side--player' }, pFront, pBack),
    );
  }

  buildControls() {
    this.speedLabel = h('span', { class: 'bs__speed-val' }, '×1');
    const speedBtns = [1, 2, 3].map((s) => h('button', {
      class: `bs__speed ${s === 1 ? 'active' : ''}`, dataset: { s: String(s) },
      onClick: () => this.setSpeed(s),
    }, `×${s}`));
    return h('div', { class: 'bs__controls' },
      h('div', { class: 'bs__title' }, this.title),
      h('div', { class: 'bs__ctrl-right' },
        h('div', { class: 'bs__speed-wrap' }, speedBtns),
        h('button', { class: 'btn btn-ghost bs__skip', onClick: () => this.finish() }, '跳过'),
      ),
    );
  }

  buildResultLayer() {
    this.resultLayer = h('div', { class: 'bs__result-layer bs__result-layer--hidden' });
    return this.resultLayer;
  }

  // —— 单位渲染 ——
  unitKey(side, pos) { return `${side}-${pos}`; }
  ensureUnit(side, pos, data) {
    const key = this.unitKey(side, pos);
    if (this.units[key]) {
      this.units[key].maxHp = data.maxHp;
      return this.units[key];
    }
    const floatLayer = h('div', { class: 'bs-unit__float' });
    const hpBar = bar(data.hp, data.maxHp, { class: 'bs-hp', color: side === 'player' ? '' : '#d4564f' });
    // 我方真实卡牌 → 皮影剪影 + 属性光晕（设计稿增量 第六节）；敌方用开罗风像素妖魔（按五行配形）。
    const playerCard = side === 'player' && data.ref ? cardDef(data.ref) : null;
    // 战斗事件只携带卡牌 id（data.ref），拿不到 instance，故光环用卡牌基础稀有度
    // playerCard.rarity；进化升档后的 effectiveRarity 光环可能与卡面不一致，属已知取舍。
    const art = h('div', { class: `bs-unit__art${playerCard ? '' : ' kairo-foe'}`, style: { background: hexA(EL_COLOR[data.element], 0.16) } },
      playerCard ? renderSilhouette(playerCard, playerCard.rarity) : h('span', { class: 'kairo-foe__wrap', html: kairoSVG(enemyLook(data), 40) }));
    const el = h('div', {
      class: `bs-unit bs-unit--${side} ${data.isBoss ? 'bs-unit--boss' : ''}`,
      dataset: { side, pos: String(pos) },
      style: { borderColor: EL_COLOR[data.element] || '#9a8a72' },
    },
      art,
      h('div', { class: 'bs-unit__name' }, data.name),
      hpBar,
      floatLayer,
    );
    const row = rowOf(side, pos);
    const container = this.rows[`${side}-${row}`];
    if (container) container.appendChild(el);
    const u = { el, hpBar, floatLayer, hp: data.hp, maxHp: data.maxHp, element: data.element, name: data.name, side, pos };
    this.units[key] = u;
    return u;
  }

  seedInit() {
    while (this.idx < this.events.length && this.events[this.idx].t === 'init') {
      const e = this.events[this.idx++];
      this.ensureUnit(e.side, e.pos, e);
    }
  }

  // —— 回放控制 ——
  setSpeed(s) {
    this.speed = s;
    const btns = this.root.querySelectorAll('.bs__speed');
    btns.forEach((b) => { b.classList.toggle('active', Number(b.dataset.s) === s); });
  }
  play() {
    if (this.done) return;
    this.playing = true;
    this.scheduleNext();
  }
  delayFor(e) {
    const base = { round: 900, act: 220, hit: 520, heal: 520, death: 620, save: 700, immune: 500, enrage: 600 };
    const b = base[e && e.t] || 200;
    return Math.max(90, b / this.speed);
  }
  scheduleNext() {
    if (!this.playing || this.done) return;
    if (this.idx >= this.events.length) { this.finish(); return; }
    const e = this.events[this.idx];
    this._timer = setTimeout(() => this.step(), this.delayFor(e));
  }
  step() {
    if (this.done || !this.playing) return;
    if (this.idx >= this.events.length) { this.finish(); return; }
    const e = this.events[this.idx++];
    this.applyEvent(e);
    if (e.t === 'over') { this.finish(); return; }
    this.scheduleNext();
  }

  applyEvent(e) {
    switch (e.t) {
      case 'round': return this.showRound(e.n);
      case 'act': return this.markActing(e);
      case 'hit': return this.applyHit(e);
      case 'heal': return this.applyHeal(e);
      case 'immune': return this.floatText(e.side, e.pos, '免疫', '#D4A04A');
      case 'save': return this.applySave(e);
      case 'enrage': return this.floatText(e.side, e.pos, '怒', '#C23B22');
      case 'death': return this.applyDeath(e);
      case 'over': return; // finish() handles
      default: return;
    }
  }

  showRound(n) {
    const layer = this.root.querySelector('.bs__round');
    clear(layer);
    layer.append(h('div', { class: 'bs__round-text' }, `第 ${n} 回合`));
    layer.classList.remove('show');
    // 强制重绘以重启动画
    void layer.offsetWidth;
    layer.classList.add('show');
    this._later(() => { layer.classList.remove('show'); }, 1400);
  }

  markActing(e) {
    if (this._lastActor) this._lastActor.el.classList.remove('acting');
    const u = this.units[this.unitKey(e.side, e.pos)];
    if (u) { u.el.classList.add('acting'); this._lastActor = u; }
  }

  updateHp(u, hp) {
    u.hp = Math.max(0, Math.round(hp));
    const pct = u.maxHp > 0 ? Math.min(100, (u.hp / u.maxHp) * 100) : 0;
    const fill = u.hpBar.querySelector('.bar__fill');
    if (fill) fill.style.width = `${pct}%`;
    const label = u.hpBar.querySelector('.bar__label');
    if (label) label.textContent = `${u.hp}/${u.maxHp}`;
  }

  applyHit(e) {
    const u = this.units[this.unitKey(e.side, e.pos)];
    if (!u) return;
    this.updateHp(u, e.hp);
    // 水墨飞溅 + 伤害数字
    u.el.classList.remove('hit-flash');
    void u.el.offsetWidth;
    u.el.classList.add('hit-flash');
    this._later(() => u.el.classList.remove('hit-flash'), 360);
    const dmg = Number.isFinite(e.dmg) ? e.dmg : 0;
    if (dmg > 0) this.floatText(e.side, e.pos, `-${dmg}`, '#C23B22', e.crit);
    // 暴击震屏
    if (e.crit) this.shake();
    // 五行克制边光
    if (Number.isFinite(e.counterMult) && (e.counterMult > 1.001 || e.counterMult < 0.999)) {
      const srcU = e.src ? this.units[this.unitKey(e.src.side, e.src.pos)] : null;
      const color = EL_COLOR[(srcU && srcU.element) || e.el] || '#c8a951';
      this.edgeFlash(color, e.counterMult > 1.001 ? '克！' : '克');
    }
  }

  applyHeal(e) {
    const u = this.units[this.unitKey(e.side, e.pos)];
    if (!u) return;
    this.updateHp(u, e.hp);
    u.el.classList.remove('heal-pulse');
    void u.el.offsetWidth;
    u.el.classList.add('heal-pulse');
    this._later(() => u.el.classList.remove('heal-pulse'), 600);
    if (Number.isFinite(e.amt) && e.amt > 0) this.floatText(e.side, e.pos, `+${e.amt}`, '#4a8a4a');
  }

  applySave(e) {
    const u = this.units[this.unitKey(e.side, e.pos)];
    if (!u) return;
    this.updateHp(u, e.hp);
    u.el.classList.remove('save-flash');
    void u.el.offsetWidth;
    u.el.classList.add('save-flash');
    this._later(() => u.el.classList.remove('save-flash'), 700);
    const label = e.kind === 'revive' ? '复活' : e.kind === 'team_revive' ? '天泽万物' : '免疫致命';
    this.floatText(e.side, e.pos, label, '#D4A04A');
  }

  applyDeath(e) {
    const u = this.units[this.unitKey(e.side, e.pos)];
    if (!u) return;
    u.el.classList.add('dying');
  }

  floatText(side, pos, text, color, big) {
    const u = this.units[this.unitKey(side, pos)];
    if (!u) return;
    const node = h('span', { class: `bs-float ${big ? 'bs-float--big' : ''}`, style: { color: color || '#C23B22' } }, String(text));
    u.floatLayer.appendChild(node);
    this._later(() => { if (node.parentNode) node.parentNode.removeChild(node); }, 900);
  }

  edgeFlash(color, text) {
    const edge = this.root.querySelector('.bs__edge');
    if (!edge) return;
    edge.style.setProperty('--edge-color', color);
    edge.textContent = text || '';
    edge.classList.remove('flash');
    void edge.offsetWidth;
    edge.classList.add('flash');
    this._later(() => edge.classList.remove('flash'), 500);
  }

  shake() {
    this.root.classList.remove('shake');
    void this.root.offsetWidth;
    this.root.classList.add('shake');
    this._later(() => this.root.classList.remove('shake'), 320);
  }

  // —— 结束 ——
  finish() {
    if (this.done) return;
    this.done = true;
    this.playing = false;
    if (this._timer) clearTimeout(this._timer);
    // 推到最终血量（保险）
    const players = (this.battle && this.battle.players) || [];
    const enemies = (this.battle && this.battle.enemies) || [];
    for (const c of [...players, ...enemies]) {
      const u = this.units[this.unitKey(c.side, c.pos)];
      if (u) { this.updateHp(u, c.hp); if (!c.alive) u.el.classList.add('dying'); }
    }
    this.showResult();
  }

  showResult() {
    const layer = this.resultLayer;
    clear(layer);
    const win = this.result === 'win';
    layer.classList.remove('bs__result-layer--hidden', 'win', 'lose');
    layer.classList.add(win ? 'win' : 'lose');
    const gain = h('div', { class: 'bs__gain' });
    const rw = this.rewards.res || {};
    const fr = this.rewards.frags || {};
    for (const id of Object.keys(rw)) gain.append(h('span', { class: 'gain-chip' }, `${resEmoji(id)}${resName(id)} +${rw[id]}`));
    for (const cid of Object.keys(fr)) {
      const d = cardDef(cid);
      gain.append(h('span', { class: 'gain-chip' }, `${d ? d.name : cid} 碎片 +${fr[cid]}`));
    }
    const stars = win && this.stars > 0
      ? h('div', { class: 'bs__stars' }, [1, 2, 3].map((i) => h('span', { class: `bs__star ${i <= this.stars ? 'on' : ''}` }, '★')))
      : null;
    layer.append(
      h('div', { class: `bs__result-title ${win ? 'win' : 'lose'}` }, win ? '★ 大胜！' : '★ 败北…'),
      stars,
      (Object.keys(rw).length || Object.keys(fr).length) ? h('div', { class: 'bs__gain-wrap' }, h('div', { class: 'muted' }, '战利品'), gain) : null,
      h('div', { class: 'bs__result-foot' },
        h('button', { class: 'btn btn-primary', onClick: () => { this.destroy(); this.onDone(); } }, '确定'),
      ),
    );
  }

  _later(fn, ms) {
    const id = setTimeout(() => {
      this._fx = this._fx.filter((x) => x !== id);
      try { fn(); } catch (_) {}
    }, ms / this.speed);
    this._fx.push(id);
  }

  destroy() {
    this.playing = false;
    this.done = true;
    if (this._timer) clearTimeout(this._timer);
    for (const id of this._fx) clearTimeout(id);
    this._fx = [];
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
  }
}

// hex → rgba（用于单位立绘底色淡显）
function hexA(hex, a) {
  if (!hex || hex[0] !== '#') return hex || 'transparent';
  const n = hex.length === 4
    ? hex.slice(1).split('').map((c) => parseInt(c + c, 16))
    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  return `rgba(${n[0]}, ${n[1]}, ${n[2]}, ${a})`;
}
