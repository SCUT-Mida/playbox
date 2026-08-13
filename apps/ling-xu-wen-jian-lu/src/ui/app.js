// ============================================================================
// 灵墟·问剑录 · UI 控制器（纯原生 DOM）
// 国风 2.5D 卡牌修仙：阵容 / 问道 / 修炼 / 主线 / 秘境 / 洞府 / 图鉴 / 设置。
// 驱动自动存档与离线洞府结算。
// ============================================================================
import '../ui/style.css';
import { attachKeyboardShell } from '../../../_lib/keyboard-shell.js';
import { h, clear, bar } from './dom.js';

import {
  RARITIES, rarityDef, ELEMENTS, elDef, elName, elEmoji,
  RESOURCES, resName, resEmoji, PILL_EXP, BREAK_STONE, THEME,
  dayKey, cardCap,
} from '../config.js';
import { CARDS, cardDef } from '../data/cards.js';
import { BOSSES } from '../data/enemies.js';
import {
  newPlayer, recompute, addRes, countRes, canAfford, spendRes,
  ownCard, addFrag, countFrag, hasCard, setFormation, activeFormation, formationPower,
  collectionCount, collectionTotal, collectionProgress, totalStars, CODEX_TIERS,
} from '../core/player.js';
import { instanceStats, instancePower, skillMult, isMaxLevel, expToNext } from '../core/card.js';
import {
  canLevelUp, levelCeiling, feedPill, breakCost, canBreakThrough, doBreakThrough,
  starUpCost, canStarUp, doStarUp, canSkillUp, doSkillUp, skillUpCost, MAX_SKILL_LEVEL,
} from '../core/cultivate.js';
import { drawOne, drawTen, dailyFreeAvailable, pitySSRRemaining, pitySRRemaining } from '../core/gacha.js';
import { playerSpecsFrom } from '../core/battle.js';
import {
  CHAPTERS, stagesForChapter, stageDef, canEnterStage, isStageCleared, enterStage,
} from '../core/stage.js';
import { enterFloor, tianOf, floorPower, TOTAL_FLOORS, resetSecret } from '../core/secret.js';
import { collectCave, previewCave, caveTotalLevel, caveSSRCount } from '../core/cave.js';
import { ACHIEVEMENTS, ACH_CATS, checkAchievements, achProgress, rewardDesc } from '../core/achievements.js';
import {
  saveGame, loadGame, clearSave, exportSave, importSave,
  listSlots, loadSlot, saveSlot, deleteSlot, getActiveSlot, setActiveSlot,
} from '../core/save.js';
import { makeRng } from '../core/rng.js';

const TABS = [
  { key: 'lineup', icon: '⚔️', label: '阵容' },
  { key: 'ask', icon: '🎏', label: '问道' },
  { key: 'cultivate', icon: '🧘', label: '修炼' },
  { key: 'stage', icon: '🗺️', label: '主线' },
  { key: 'secret', icon: '🌀', label: '秘境' },
  { key: 'cave', icon: '🏘️', label: '洞府' },
  { key: 'codex', icon: '📖', label: '图鉴' },
  { key: 'setting', icon: '⚙️', label: '设置' },
];

export class GameUI {
  constructor(parent) {
    this.parent = parent;
    this.player = null;
    this.tab = 'lineup';
    this.screen = 'slots';
    this.activeSlot = 1;
    this.cultivateId = null;
    this.viewChapter = 1;
    this.lastBattle = null;
    this._timers = [];
    this._rngSeed = 0;
    this._onVis = this._onVis.bind(this);
  }

  mount() {
    this.root = h('div', { class: 'lxx' });
    clear(this.parent);
    this.parent.appendChild(this.root);
    this.toastWrap = h('div', { class: 'toast-wrap' });
    this.stage = h('div', { class: 'lxx-stage' });
    this.modalRoot = h('div', { class: 'lxx-modals' });
    this.root.append(this.toastWrap, this.stage, this.modalRoot);
    this._detachKeyboard = attachKeyboardShell(this.root);
    this.showSlots();
    return this;
  }

  destroy() {
    this.stopLoop();
    if (this._detachKeyboard) this._detachKeyboard();
    try { document.removeEventListener('visibilitychange', this._onVis); } catch (_) {}
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
  }

  // ============ 通用 ============
  rng() { return makeRng(++this._rngSeed); }

  toast(text) {
    const t = h('div', { class: 'toast' }, text);
    this.toastWrap.appendChild(t);
    setTimeout(() => { t.classList.add('fade'); setTimeout(() => t.remove(), 300); }, 2200);
  }

  openModal(title, body, opts = {}) {
    clear(this.modalRoot);
    const foot = h('div', { class: 'sheet__foot' });
    if (opts.foot) foot.append(...(Array.isArray(opts.foot) ? opts.foot : [opts.foot]));
    else foot.append(h('button', { class: 'btn btn-ghost', onClick: () => this.closeModal() }, '关闭'));
    const sheet = h('div', { class: 'sheet' },
      h('div', { class: 'sheet__head' }, h('span', { class: 't' }, title), h('button', { class: 'sheet__x', onClick: () => this.closeModal() }, '✕')),
      h('div', { class: 'sheet__body' }, body),
      foot,
    );
    const mask = h('div', { class: 'modal-mask', onClick: () => { if (opts.dismissable !== false) this.closeModal(); } }, sheet);
    mask.addEventListener('click', (e) => { if (e.target === mask && opts.dismissable !== false) this.closeModal(); });
    this.modalRoot.appendChild(mask);
  }
  closeModal() { clear(this.modalRoot); }

  afterAction() {
    // 成就检查 + 落盘 + 刷新
    const granted = checkAchievements(this.player);
    for (const a of granted) this.toast(`成就达成：${a.name}`);
    try { saveGame(this.player); } catch (_) {}
    this.refresh();
  }

  refresh() {
    if (this.screen !== 'game') return;
    this.renderTopbar();
    this.renderTab();
  }

  // ============ 存档选择 ============
  showSlots() {
    try { if (this.player) saveGame(this.player); } catch (_) {}
    this.stopLoop();
    this.player = null;
    this.screen = 'slots';
    clear(this.modalRoot);
    clear(this.stage);
    const wrap = h('div', { class: 'launcher' },
      h('div', { class: 'launcher__brand' },
        h('div', { class: 'emblem' }, '剑'),
        h('h1', null, '灵墟·问剑录'),
        h('p', { class: 'sub' }, '问道抽卡 · 五行布阵 · 回合制国风卡牌修仙'),
      ),
      h('div', { class: 'slot-list' }),
      h('p', { class: 'launcher__tip' }, '点击空槽「开辟仙府」开始；新档赠送 4 张 R 卡与 10 枚问道令。'),
    );
    const list = wrap.querySelector('.slot-list');
    for (const s of listSlots()) list.append(this.slotCard(s));
    this.stage.appendChild(wrap);
  }

  slotCard(s) {
    if (s.empty) {
      return h('div', { class: 'slot-card empty' },
        h('div', { class: 'slot-head' }, h('span', { class: 'slot-no' }, `第 ${s.slot} 槽`), h('span', { class: 'slot-tag' }, '空')),
        h('p', { class: 'slot-name' }, '未开辟'),
        h('button', { class: 'btn btn-primary', onClick: () => this.startNew(s.slot) }, '开辟仙府'),
      );
    }
    if (s.corrupt) {
      return h('div', { class: 'slot-card corrupt' },
        h('div', { class: 'slot-head' }, h('span', { class: 'slot-no' }, `第 ${s.slot} 槽`), h('span', { class: 'slot-tag warn' }, '损坏')),
        h('p', { class: 'slot-name' }, '存档已损坏'),
        h('button', { class: 'btn btn-danger', onClick: () => { deleteSlot(s.slot); this.showSlots(); } }, '删除'),
      );
    }
    return h('div', { class: 'slot-card' },
      h('div', { class: 'slot-head' },
        h('span', { class: 'slot-no' }, `第 ${s.slot} 槽`),
        h('span', { class: 'slot-tag' }, `${s.highestChapter}/12 章 · 秘境${s.secretFloor}层`),
      ),
      h('p', { class: 'slot-name' }, `灵石 ${s.lingshi} · 问道令 ${s.wendao}`),
      h('p', { class: 'slot-sub' }, `已拥 ${s.cards} 张 · 图鉴 ${s.codex}/15`),
      h('div', { class: 'slot-btns' },
        h('button', { class: 'btn btn-primary', onClick: () => this.continueSlot(s.slot) }, '进入'),
        h('button', { class: 'icon-btn', title: '删除', onClick: () => this.confirmDelete(s.slot) }, '🗑️'),
      ),
    );
  }

  confirmDelete(slot) {
    this.openModal('删除存档', h('div', { class: 'pad' }, h('p', null, `确定删除第 ${slot} 槽存档？此操作不可撤销。`)), {
      foot: [
        h('button', { class: 'btn btn-ghost', onClick: () => this.closeModal() }, '取消'),
        h('button', { class: 'btn btn-danger', onClick: () => { deleteSlot(slot); this.closeModal(); this.showSlots(); } }, '确认删除'),
      ],
    });
  }

  startNew(slot) {
    const p = newPlayer();
    p.slot = slot;
    p.createdAt = Math.floor(Date.now() / 1000);
    setActiveSlot(slot);
    saveSlot(slot, p);
    this.enterGame(p, true);
  }
  continueSlot(slot) {
    const p = loadSlot(slot);
    if (!p) { this.toast('读取失败'); this.showSlots(); return; }
    this.enterGame(p, false);
  }

  // ============ 进入游戏 ============
  enterGame(player, isNew) {
    this.player = player;
    this.screen = 'game';
    this.tab = 'lineup';
    this.viewChapter = player.story.highestChapter || 1;
    this.cultivateId = Object.keys(player.cards)[0] || null;
    recompute(this.player);
    // 离线洞府结算（非新档）
    if (!isNew) {
      const off = collectCave(this.player);
      if (off.seconds >= 60) {
        const mins = Math.round(off.seconds / 60);
        setTimeout(() => this.toast(`洞府挂机 ${mins} 分钟：灵石 +${off.lingshi}${off.exp_s ? `，修为丹·小 +${off.exp_s}` : ''}${off.capped ? '（已达 12 小时上限）' : ''}`), 400);
      }
    } else {
      this.player.cave.lastSeen = Math.floor(Date.now() / 1000);
    }
    checkAchievements(this.player);
    try { saveGame(this.player); } catch (_) {}
    this.renderShell();
    this.startLoop();
  }

  renderShell() {
    clear(this.stage);
    this.topbarEl = h('div', { class: 'topbar' });
    this.contentEl = h('div', { class: 'content' });
    const nav = h('nav', { class: 'tabnav' }, ...TABS.map((t) => h('button', {
      class: `tabnav__btn ${this.tab === t.key ? 'active' : ''}`,
      dataset: { tab: t.key },
      onClick: () => { this.tab = t.key; this.refresh(); },
    }, h('span', { class: 'tabnav__icon' }, t.icon), h('span', { class: 'tabnav__label' }, t.label))));
    this.stage.append(this.topbarEl, this.contentEl, nav);
    this.refresh();
  }

  renderTopbar() {
    const p = this.player;
    clear(this.topbarEl);
    this.topbarEl.append(
      h('div', { class: 'topbar__brand' }, h('span', { class: 'seal' }, '剑'), '灵墟'),
      h('div', { class: 'topbar__res' },
        resChip('🪙', countRes(p, 'lingshi'), '灵石'),
        resChip('🎏', countRes(p, 'wendao'), '问道令'),
        resChip('⚔️', formationPower(p), '战力'),
        resChip('📖', `${collectionCount(p)}/${collectionTotal()}`, '图鉴'),
      ),
      h('button', { class: 'icon-btn topbar__home', title: '返回存档', onClick: () => this.showSlots() }, '⌂'),
    );
  }

  renderTab() {
    clear(this.contentEl);
    switch (this.tab) {
      case 'lineup': return this.renderLineup();
      case 'ask': return this.renderAsk();
      case 'cultivate': return this.renderCultivate();
      case 'stage': return this.renderStage();
      case 'secret': return this.renderSecret();
      case 'cave': return this.renderCave();
      case 'codex': return this.renderCodex();
      case 'setting': return this.renderSetting();
      default: return this.renderLineup();
    }
  }

  // ============ 阵容 ============
  renderLineup() {
    const p = this.player;
    const form = activeFormation(p);
    const slots = [];
    for (let i = 0; i < 5; i++) {
      const id = p.formation[i];
      const occ = id && p.cards[id] ? { id, instance: p.cards[id] } : null;
      slots.push(h('div', {
        class: `slot slot--pos${i + 1} ${occ ? '' : 'empty'}`,
        onClick: () => { if (occ) { this.removeFromFormation(i); } },
      },
        h('span', { class: 'slot__pos' }, `${i + 1}号位`),
        occ ? this.miniCard(occ.id, occ.instance) : h('span', { class: 'slot__hint' }, '空位'),
      ));
    }
    const owned = Object.keys(p.cards).sort(byRarityThenPower(p));
    const grid = owned.map((id) => this.miniCard(id, p.cards[id], {
      onClick: () => this.addToFormation(id),
    }));
    this.contentEl.append(
      h('h3', { class: 'sec-title' }, '布阵 · 站位影响受击（1号位主坦 +30%、2号位 +10%）'),
      h('div', { class: 'formation' }, slots),
      h('div', { class: 'row' },
        h('button', { class: 'btn btn-ghost', onClick: () => this.autoFormation() }, '一键最强阵容'),
        h('span', { class: 'muted' }, '点卡牌上阵 · 点位移下'),
      ),
      h('h3', { class: 'sec-title' }, `我的卡牌（${owned.length}）`),
      h('div', { class: 'card-grid' }, ...grid),
    );
  }
  addToFormation(id) {
    const p = this.player;
    // 已在阵 → 取消
    const idx = p.formation.indexOf(id);
    if (idx >= 0) { p.formation[idx] = null; this.afterAction(); return; }
    const empty = p.formation.indexOf(null);
    if (empty < 0) { this.toast('阵容已满，先移下一位'); return; }
    p.formation[empty] = id;
    this.afterAction();
  }
  removeFromFormation(i) { this.player.formation[i] = null; this.afterAction(); }
  autoFormation() {
    const p = this.player;
    const owned = Object.keys(p.cards).sort(byRarityThenPower(p));
    const next = [null, null, null, null, null];
    let i = 0;
    for (const id of owned) { if (i >= 5) break; next[i++] = id; }
    setFormation(p, next);
    this.afterAction();
  }

  // ============ 问道 ============
  renderAsk() {
    const p = this.player;
    const free = dailyFreeAvailable(p);
    this.contentEl.append(
      h('div', { class: 'ask-banner' },
        h('h3', { class: 'sec-title' }, '问道 · 召唤灵契'),
        h('p', { class: 'muted' }, 'R 70% / SR 25% / SSR 5% · 累计 90 抽必出 SSR · 每 30 抽必出 SR · 十连保底 SR'),
        h('div', { class: 'ask-pity' },
          pityChip('距 SSR 保底', `${pitySSRRemaining(p)}/${90}`),
          pityChip('距 SR 保底', `${pitySRRemaining(p)}/${30}`),
          pityChip('已抽', p.pity.total || 0),
        ),
      ),
      h('div', { class: 'ask-actions' },
        h('button', {
          class: 'btn btn-primary', disabled: !free,
          onClick: () => this.doDraw(false, true),
        }, free ? '每日免费单抽' : '今日免费已用'),
        h('button', {
          class: 'btn', disabled: countRes(p, 'wendao') < 1,
          onClick: () => this.doDraw(false, false),
        }, '单抽（问道令×1）'),
        h('button', {
          class: 'btn btn-gold', disabled: countRes(p, 'wendao') < 10,
          onClick: () => this.doDraw(true, false),
        }, '十连问道（×10）'),
      ),
      h('p', { class: 'muted center' }, `当前问道令：${countRes(p, 'wendao')}`),
    );
  }
  doDraw(ten, free) {
    const rng = this.rng();
    const res = ten ? drawTen(this.player, rng) : drawOne(this.player, rng, { free });
    if (res.error) { this.toast(res.error); return; }
    this.afterAction();
    this.showGachaResult(res.results);
  }
  showGachaResult(results) {
    const body = h('div', { class: 'gacha-result' }, ...results.map((r) => {
      const def = cardDef(r.cardId);
      const c = rarityDef(r.rarity).color;
      return h('div', { class: `gacha-card rarity-${r.rarity}`, style: { borderColor: c } },
        h('div', { class: 'gacha-card__name', style: { color: c } }, def ? def.name : r.cardId),
        h('div', { class: 'gacha-card__sub' }, `${r.rarity} · ${def ? elName(def.element) : ''}${def ? def.cls : ''}`),
        r.isNew ? h('span', { class: 'tag tag-new' }, 'NEW') : (r.frag ? h('span', { class: 'tag tag-dup' }, `+${r.frag}碎片`) : null),
      );
    }));
    const ssr = results.filter((r) => r.rarity === 'SSR').length;
    const sr = results.filter((r) => r.rarity === 'SR').length;
    const head = results.length > 1 ? `问道 · 十连（SSR×${ssr} SR×${sr}）` : '问道 · 单抽';
    this.openModal(head, body);
  }

  // ============ 修炼 ============
  renderCultivate() {
    const p = this.player;
    const owned = Object.keys(p.cards).sort(byRarityThenPower(p));
    if (!this.cultivateId || !p.cards[this.cultivateId]) this.cultivateId = owned[0] || null;
    const id = this.cultivateId;
    const def = cardDef(id);
    const picker = h('div', { class: 'card-picker' }, ...owned.map((cid) => {
      const d = cardDef(cid);
      return h('button', {
        class: `picker-chip rarity-${d.rarity} ${cid === id ? 'active' : ''}`,
        style: { borderColor: rarityDef(d.rarity).color },
        onClick: () => { this.cultivateId = cid; this.refresh(); },
      }, `${d.name} ${elEmoji(d.element)}`);
    }));
    if (!def) { this.contentEl.append(picker, h('p', { class: 'muted' }, '暂无卡牌')); return; }
    const inst = p.cards[id];
    const r = rarityDef(def.rarity);
    const st = instanceStats(inst);
    this.contentEl.append(
      picker,
      h('div', { class: 'cult-card' },
        h('div', { class: 'cult-card__head' },
          h('div', { class: `rarity-badge rarity-${def.rarity}`, style: { background: r.color } }, `${def.rarity} ${'★'.repeat(inst.star)}`),
          h('div', null,
            h('div', { class: 'cult-card__name' }, `${def.name} ${elEmoji(def.element)}`),
            h('div', { class: 'muted' }, `${elName(def.element)}系 · ${def.cls} · ${def.role}`),
          ),
        ),
        h('div', { class: 'cult-stats' },
          statLine('攻击', st.atk), statLine('防御', st.def),
          statLine('气血', st.hp), statLine('速度', st.spd),
          statLine('等级', `${inst.level}/${cardCap(r, inst.star)}`, '灵'),
          statLine('突破', `第${inst.br}重`, '灵'),
          statLine('技能', `Lv.${inst.skillLv}（×${skillMult(inst).toFixed(2)}）`, '灵'),
        ),
        h('div', { class: 'cult-exp' },
          h('span', { class: 'muted' }, '修为'),
          bar(inst.exp, expToNext(inst), { label: `${Math.floor(inst.exp)}/${expToNext(inst)}` }),
        ),
        h('p', { class: 'quote' }, `「${def.quote}」`),
        h('p', { class: 'story' }, def.story),
      ),
      // 升级
      h('div', { class: 'panel' },
        h('div', { class: 'panel__head' }, '修炼升级（喂修为丹）'),
        h('div', { class: 'panel__body row' },
          pillBtn(p, this, inst, 'exp_s', '小丹(+50)'),
          pillBtn(p, this, inst, 'exp_m', '中丹(+200)'),
          pillBtn(p, this, inst, 'exp_l', '大丹(+1000)'),
          h('span', { class: 'muted' }, isMaxLevel(inst) ? '已达等级上限（升星可提升）' : (canLevelUp(inst) ? `瓶颈 ${levelCeiling(inst)} 级` : '需突破'),
          ),
        ),
      ),
      // 突破
      h('div', { class: 'panel' },
        h('div', { class: 'panel__head' }, '突破（每 10 级一次，+8% 全属性）'),
        h('div', { class: 'panel__body row' },
          (() => {
            const c = breakCost(inst);
            const ok2 = canBreakThrough(p, inst);
            const stoneId = Object.keys(c).find((k) => k.startsWith('break_'));
            const txt = `突破第 ${inst.br + 1} 重（${resName(stoneId)}×${c[stoneId]} · 灵石×${c.lingshi}）`;
            return h('button', { class: 'btn', disabled: !ok2, onClick: () => this.doBreak(inst) }, txt);
          })(),
        ),
      ),
      // 升星
      h('div', { class: 'panel' },
        h('div', { class: 'panel__head' }, `升星（${inst.star}/${r.maxStar}★，+12% 全属性 / 星）`),
        h('div', { class: 'panel__body row' },
          (() => {
            if (inst.star >= r.maxStar) return h('span', { class: 'muted' }, '已达星级上限');
            const c = starUpCost(inst);
            const tf = c.tiandao_f ? ` · 天道碎片×${c.tiandao_f}` : '';
            const ok2 = canStarUp(p, inst);
            return h('button', { class: 'btn btn-gold', disabled: !ok2, onClick: () => this.doStar(inst) },
              `升至 ${inst.star + 1}★（灵契碎片×${c.frag}${tf} · 已有${countFrag(p, id)}）`);
          })(),
        ),
      ),
      // 技能
      h('div', { class: 'panel' },
        h('div', { class: 'panel__head' }, `技能升级（${inst.skillLv}/${MAX_SKILL_LEVEL}，+5% 倍率/级）`),
        h('div', { class: 'panel__body row' },
          (() => {
            if (inst.skillLv >= MAX_SKILL_LEVEL) return h('span', { class: 'muted' }, '技能已满级');
            const c = skillUpCost(inst);
            const ok2 = canSkillUp(p, inst);
            return h('button', { class: 'btn', disabled: !ok2, onClick: () => this.doSkill(inst) },
              `升级技能（功法残页×${c.gongfa} · 已有${countRes(p, 'gongfa')}）`);
          })(),
        ),
      ),
    );
  }
  doFeedPill(inst, pillId) {
    const r = feedPill(this.player, inst, pillId, 1);
    if (!r.ok) { this.toast(r.reason); return; }
    for (const l of (r.logs || [])) if (l.kind === 'level') this.toast(l.text);
    this.afterAction();
  }
  doBreak(inst) { const r = doBreakThrough(this.player, inst); if (!r.ok) this.toast(r.reason); else this.toast(r.text); this.afterAction(); }
  doStar(inst) { const r = doStarUp(this.player, inst); if (!r.ok) this.toast(r.reason); else this.toast(r.text); this.afterAction(); }
  doSkill(inst) { const r = doSkillUp(this.player, inst); if (!r.ok) this.toast(r.reason); else this.toast(r.text); this.afterAction(); }

  // ============ 主线 ============
  renderStage() {
    const p = this.player;
    const ch = CHAPTERS[Math.max(0, Math.min(CHAPTERS.length - 1, this.viewChapter - 1))];
    const unlocked = p.story.highestChapter >= ch.chapter;
    const stages = stagesForChapter(ch.chapter - 1);
    this.contentEl.append(
      h('div', { class: 'chapter-bar' },
        h('button', { class: 'icon-btn', disabled: this.viewChapter <= 1, onClick: () => { this.viewChapter--; this.refresh(); } }, '‹'),
        h('div', { class: 'chapter-bar__info' },
          h('div', { class: 'chapter-bar__name' }, `卷${cn(ch.chapter)} ${ch.name}`),
          h('div', { class: 'muted' }, `推荐战力 ${ch.power} · 五行倾向 ${elName(ch.element)}${elEmoji(ch.element)}`),
        ),
        h('button', { class: 'icon-btn', disabled: this.viewChapter >= CHAPTERS.length, onClick: () => { this.viewChapter++; this.refresh(); } }, '›'),
      ),
      unlocked ? null : h('p', { class: 'muted center' }, '本章尚未解锁，通关上一章首领即可开启。'),
      h('div', { class: 'stage-list' }, ...stages.map((st) => {
        const can = unlocked && canEnterStage(p, st.id);
        const cleared = isStageCleared(p, st.id);
        const typeTag = st.type === 'boss' ? '首领' : st.type === 'elite' ? '精英' : '普通';
        return h('button', {
          class: `stage-row stage-${st.type} ${can ? '' : 'locked'} ${cleared ? 'cleared' : ''}`,
          disabled: !can,
          onClick: () => this.doStage(st.id),
        },
          h('div', { class: 'stage-row__main' },
            h('span', { class: 'stage-row__id' }, st.id),
            h('span', { class: 'stage-row__name' }, st.name),
          ),
          h('div', { class: 'stage-row__meta' },
            h('span', { class: `tag tag-${st.type}` }, typeTag),
            cleared ? h('span', { class: 'tag tag-done' }, '已通关') : h('span', { class: 'muted' }, `战力≈${Math.round(st.power * (st.type === 'boss' ? 1.5 : 1))}`),
          ),
        );
      })),
    );
  }
  doStage(stageId) {
    const res = enterStage(this.player, stageId, this.rng());
    if (!res.ok) { this.toast(res.reason); return; }
    this.showBattle(res, () => { this.afterAction(); });
  }

  // ============ 秘境 ============
  renderSecret() {
    const p = this.player;
    const pv = previewCave(p);
    const floor = p.secret.floor;
    this.contentEl.append(
      h('div', { class: 'secret-head' },
        h('h3', { class: 'sec-title' }, '秘境 · 九重天爬塔（90 层）'),
        h('p', { class: 'muted' }, `当前 ${floor} 层 · 第 ${tianOf(floor)} 重天 · 最高 ${p.secret.bestFloor} 层 · 存档点 ${p.secret.saveFloor} 层`),
        h('p', { class: 'muted' }, `本层战力 ≈ ${floorPower(floor)} · 每 5 层秘境宝箱 · 每 10 层存档`),
      ),
      h('div', { class: 'ask-actions' },
        h('button', { class: 'btn btn-primary', onClick: () => this.doFloor() }, `探索第 ${floor} 层`),
        h('button', { class: 'btn btn-ghost', onClick: () => { resetSecret(p, true); this.toast(`已退回存档点 ${p.secret.saveFloor} 层`); this.afterAction(); } }, '退回存档点'),
        h('button', { class: 'btn btn-ghost', onClick: () => { resetSecret(p, false); this.toast('已重置至第 1 层'); this.afterAction(); } }, '从第 1 层重开'),
      ),
    );
  }
  doFloor() {
    const res = enterFloor(this.player, this.rng());
    const title = res.text || `第 ${res.floor} 层`;
    const result = res.kind === 'battle' ? (res.win ? 'win' : 'lose') : 'event';
    this.showBattle({ log: res.battle ? res.battle.log : [res.text || '（探索有所得）'], result, rounds: res.battle ? res.battle.rounds : 0, rewards: { res: res.rewards.res, frags: res.rewards.frags } },
      () => {
        if (res.boxFloor) this.toast(`秘境宝箱：问道令 +1`);
        if (res.savedFloor) this.toast(`抵达存档点 ${res.savedFloor} 层`);
        if (res.over) this.toast('恭喜通关秘境九十层！');
        this.afterAction();
      }, title);
  }

  // ============ 洞府 ============
  renderCave() {
    const p = this.player;
    const pv = previewCave(p);
    const mins = Math.floor(pv.seconds / 60);
    this.contentEl.append(
      h('div', { class: 'cave' },
        h('h3', { class: 'sec-title' }, '洞府 · 挂机画卷（离线收益，上限 12 小时）'),
        h('p', { class: 'muted' }, `已挂入 ${Object.keys(p.cards).length} 张卡牌 · 总等级 ${caveTotalLevel(p)} · SSR ${caveSSRCount(p)} 张`),
        h('div', { class: 'cave__box' },
          h('div', null, h('span', { class: 'big' }, `灵石 +${pv.lingshi}`), h('span', { class: 'muted' }, `修为丹·小 +${pv.exp_s}`)),
          h('div', { class: 'muted' }, `已累积 ${mins} 分钟${pv.capped ? '（已满 12 小时）' : ''}`),
        ),
        h('div', { class: 'ask-actions' },
          h('button', { class: 'btn btn-primary', disabled: pv.lingshi <= 0 && pv.exp_s <= 0, onClick: () => { const c = collectCave(p); this.toast(`领取 灵石+${c.lingshi}${c.exp_s ? ` 修为丹·小+${c.exp_s}` : ''}`); this.afterAction(); } }, '收取收益'),
        ),
        h('p', { class: 'muted center' }, '每小时产出：灵石 = 总等级/10；修为丹·小 = SSR 数量。'),
      ),
    );
  }

  // ============ 图鉴 ============
  renderCodex() {
    const p = this.player;
    const prog = collectionProgress(p);
    this.contentEl.append(
      h('h3', { class: 'sec-title' }, `图鉴卷轴 · 收集 ${collectionCount(p)}/${collectionTotal()}（${Math.round(prog * 100)}%）`),
      ...CODEX_TIERS.map((t) => {
        const reached = prog >= t.pct;
        return h('div', { class: `codex-tier ${reached ? 'done' : ''}` },
          h('span', null, `${Math.round(t.pct * 100)}% 奖励：${t.label}`),
          h('span', { class: 'muted' }, reached ? '已达成' : '未达成'),
        );
      }),
      h('div', { class: 'codex-scroll' }, ...CARDS.map((c) => {
        const got = !!p.codex[c.id];
        return h('div', { class: `codex-card ${got ? '' : 'locked'}` },
          h('div', { class: 'codex-card__art', style: { borderColor: rarityDef(c.rarity).color } },
            got ? elEmoji(c.element) : '？'),
          h('div', { class: 'codex-card__name' }, got ? c.name : '???'),
          got ? h('div', { class: 'codex-card__sub', style: { color: rarityDef(c.rarity).color } }, `${c.rarity} · ${elName(c.element)}${c.cls}`) : null,
        );
      })),
    );
  }

  // ============ 设置 ============
  renderSetting() {
    const p = this.player;
    const expStr = exportSave(p);
    this.contentEl.append(
      h('h3', { class: 'sec-title' }, '设置 · 存档管理'),
      h('div', { class: 'panel' },
        h('div', { class: 'panel__head' }, '伪云存档（导出 / 导入）'),
        h('div', { class: 'panel__body' },
          h('p', { class: 'muted' }, '复制下方存档码妥善保存；换设备时粘贴即可恢复进度。'),
          h('textarea', { class: 'save-code', readonly: true }, expStr),
          h('div', { class: 'row' },
            h('button', { class: 'btn btn-ghost', onClick: () => { copyText(expStr); this.toast('存档码已复制'); } }, '复制存档码'),
            h('button', { class: 'btn btn-ghost', onClick: () => this.openImport() }, '导入存档码'),
          ),
        ),
      ),
      h('div', { class: 'panel' },
        h('div', { class: 'panel__head' }, '成就与称号'),
        h('div', { class: 'panel__body' },
          ...ACH_CATS.map((cat) => h('div', { class: 'achv-cat' },
            h('div', { class: 'achv-cat__head' }, cat.name),
            h('div', { class: 'achv-list' }, ...ACHIEVEMENTS.filter((a) => a.cat === cat.id).map((a) => {
              const pr = achProgress(p, a);
              const done = p.achievements.includes(a.id);
              return h('div', { class: `achv ${done ? 'done' : ''}` },
                h('div', { class: 'achv__name' }, `${done ? '✓' : '○'} ${a.name}`),
                h('div', { class: 'achv__desc muted' }, `${a.desc}（奖励：${rewardDesc(a.reward)}）`),
                done ? null : bar(pr.cur, pr.target, { label: `${fmtNum(pr.cur)}/${fmtNum(pr.target)}` }),
              );
            })),
          )),
        ),
      ),
      h('button', { class: 'btn btn-ghost', onClick: () => this.showSlots() }, '返回存档列表'),
    );
  }
  openImport() {
    const ta = h('textarea', { class: 'save-code', placeholder: '在此粘贴存档码…' });
    this.openModal('导入存档', h('div', { class: 'pad' }, h('p', { class: 'muted' }, '将覆盖当前槽位进度。'), ta), {
      foot: [
        h('button', { class: 'btn btn-ghost', onClick: () => this.closeModal() }, '取消'),
        h('button', { class: 'btn btn-primary', onClick: () => {
          const imp = importSave(ta.value.trim());
          if (!imp) { this.toast('存档码无效'); return; }
          imp.slot = getActiveSlot();
          this.player = imp;
          this.closeModal();
          this.enterGame(imp, true);
          this.toast('存档导入成功');
        } }, '确认导入'),
      ],
    });
  }

  // ============ 战斗结果弹窗 ============
  showBattle(res, after, title) {
    const logLines = (res.log || []).slice(-120);
    const body = h('div', { class: 'battle' });
    const head = h('div', { class: `battle__result battle__result--${res.result}` },
      res.result === 'win' ? '★ 大胜！' : res.result === 'lose' ? '★ 败北…' : '◆ 事件');
    body.append(head);
    if (res.rounds) body.append(h('div', { class: 'muted center' }, `耗时 ${res.rounds} 回合`));
    const rewards = res.rewards || {};
    const rw = rewards.res || {};
    const fr = rewards.frags || {};
    const fragKeys = Object.keys(fr);
    const resKeys = Object.keys(rw);
    if (resKeys.length || fragKeys.length) {
      const gain = h('div', { class: 'battle__gain' });
      for (const id of resKeys) gain.append(h('span', { class: 'gain-chip' }, `${resEmoji(id)}${resName(id)} +${rw[id]}`));
      for (const cid of fragKeys) {
        const d = cardDef(cid);
        gain.append(h('span', { class: 'gain-chip' }, `${d ? d.name : cid} 碎片 +${fr[cid]}`));
      }
      body.append(h('div', { class: 'muted' }, '战利品'), gain);
    }
    body.append(h('div', { class: 'battle__log' }, logLines.map((l) => h('div', { class: 'battle__line' }, l))));
    this.openModal(title || '战斗', body, {
      dismissable: false,
      foot: [h('button', { class: 'btn btn-primary', onClick: () => { this.closeModal(); if (after) after(); } }, '确定')],
    });
  }

  // ============ 卡牌迷你卡 ============
  miniCard(id, instance, opts = {}) {
    const def = cardDef(id);
    if (!def) return h('div', { class: 'mini-card' }, id);
    const r = rarityDef(def.rarity);
    const st = instanceStats(instance);
    return h('div', {
      class: `mini-card rarity-${def.rarity} ${opts.onClick ? 'clickable' : ''}`,
      style: { borderColor: r.color },
      onClick: opts.onClick || null,
    },
      h('div', { class: 'mini-card__head' },
        h('span', { class: 'mini-card__el' }, elEmoji(def.element)),
        h('span', { class: 'mini-card__star', style: { color: r.color } }, `${def.rarity}${'★'.repeat(instance.star)}`),
      ),
      h('div', { class: 'mini-card__name' }, def.name),
      h('div', { class: 'mini-card__sub' }, `Lv.${instance.level} · 战力${instancePower(instance)}`),
      h('div', { class: 'mini-card__stats' },
        h('span', null, `攻${st.atk}`), h('span', null, `防${st.def}`),
        h('span', null, `血${st.hp}`), h('span', null, `速${st.spd}`)),
    );
  }

  // ============ 循环 / 自动存档 ============
  startLoop() {
    this.stopLoop();
    this._timers.push(setInterval(() => { try { saveGame(this.player); } catch (_) {} }, 10000));
    document.addEventListener('visibilitychange', this._onVis);
  }
  stopLoop() {
    for (const t of this._timers) clearInterval(t);
    this._timers = [];
  }
  _onVis() {
    if (document.visibilityState === 'hidden') { try { saveGame(this.player); } catch (_) {} }
    else if (this.player) { collectCave(this.player); this.refresh(); }
  }
}

// ── 工具函数 ──────────────────────────────────────────────────────────────────
function resChip(emoji, val, title) {
  return h('span', { class: 'res-chip', title }, h('span', null, emoji), h('span', { class: 'res-chip__val' }, String(val)));
}
function pityChip(label, val) {
  return h('div', { class: 'pity-chip' }, h('span', { class: 'muted' }, label), h('span', { class: 'pity-chip__val' }, String(val)));
}
function statLine(label, val, extra) {
  return h('div', { class: `stat-line ${extra || ''}` }, h('span', { class: 'stat-line__label' }, label), h('span', { class: 'stat-line__val' }, String(val)));
}
function pillBtn(p, ui, inst, pillId, label) {
  const ok = countRes(p, pillId) > 0;
  return h('button', { class: 'btn btn-ghost', disabled: !ok, onClick: () => ui.doFeedPill(inst, pillId) },
    `${label}（${countRes(p, pillId)}）`);
}
function byRarityThenPower(p) {
  const order = { SSR: 0, SR: 1, R: 2 };
  return (a, b) => {
    const da = cardDef(a), db = cardDef(b);
    const oa = order[da.rarity], ob = order[db.rarity];
    if (oa !== ob) return oa - ob;
    return instancePower(p.cards[b]) - instancePower(p.cards[a]);
  };
}
function fmtNum(n) {
  if (typeof n === 'number' && n < 1 && n > 0) return `${Math.round(n * 100)}%`;
  return String(Math.floor(n));
}
function cn(n) { return ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾', '拾壹', '拾贰'][n] || String(n); }
function copyText(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text); return; }
  } catch (_) {}
  try {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
  } catch (_) {}
}
