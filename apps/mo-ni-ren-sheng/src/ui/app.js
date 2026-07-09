// ============================================================================
// 模拟人生 · UI 渲染模块（UI Renderer，纯原生 DOM）
// 负责渲染：启动器（新游戏/继续/存档管理）→ 创角 → 游戏主体（状态栏 + 人生大事记 + 下一回合）
// 以及随机事件抉择弹窗、人生总结结算弹窗、设置弹窗（存档 / 挂机）。驱动回合推进与自动存档。
// ============================================================================
import '../ui/style.css';
import { attachKeyboardShell } from '../../../_lib/keyboard-shell.js';
import { h, clear, bar } from './dom.js';
import {
  ATTRS, ATTR_META, ageLabel, ageYearsFromWeeks, stageForAge, EVENT_CHANCE, stepLabel,
} from '../config.js';
import {
  newPlayer, stageOf, applyChanges, stepTime, isDead, evaluateLife, careerLabel,
} from '../core/player.js';
import { rollEvent, applyOption, ambientLine } from '../core/events.js';
import {
  saveToSlot, loadFromSlot, deleteSlot, listSaves, hasAnySave, latestSlot,
  exportSave, importSave, SAVE_SLOTS,
} from '../core/save.js';
import {
  AUTO_POLICIES, normalizeAutoPlay, pickOption, DEFAULT_INTERVAL_MS, MIN_INTERVAL_MS, MAX_INTERVAL_MS,
} from '../core/autoplay.js';
import { makeRng } from '../core/rng.js';

// 创角出身：提供小幅初始属性倾向，并作为家庭背景影响后续可触发事件，增加重玩差异。
const BACKGROUNDS = [
  { id: 'scholar', emoji: '📚', name: '书香门第', desc: '世代读书，家学渊源。', adj: { intelligence: 8, mood: 2 } },
  { id: 'merchant', emoji: '🏪', name: '商贾之家', desc: '家中经商，耳濡目染。', adj: { wealth: 10, social: 3 } },
  { id: 'martial', emoji: '🥋', name: '武术世家', desc: '尚武之家，体魄强健。', adj: { health: 10, mood: -2 } },
  { id: 'artisan', emoji: '🎭', name: '梨园世家', desc: '以艺谋生，性情开朗。', adj: { mood: 8, social: 5, wealth: -3 } },
  { id: 'humble', emoji: '🌾', name: '寒门子弟', desc: '家徒四壁，唯有志气。', adj: { wealth: -6, intelligence: 3, mood: -2 } },
  { id: 'ordinary', emoji: '🏠', name: '寻常人家', desc: '平平淡淡才是真。', adj: {} },
];
const BG_BY_ID = Object.fromEntries(BACKGROUNDS.map((b) => [b.id, b]));

export class GameUI {
  constructor(parent) {
    this.parent = parent;
    this.player = null;
    this.rng = Math.random;            // 随机源（测试可注入 this.rng）
    this.screen = 'launcher';          // 'launcher' | 'create' | 'game' | 'over'
    this.over = false;
    this.log = [];                     // 当前显示的人生大事记（与 player.log 分离：UI 侧近期缓冲）
    this.modalRoot = null;
    this.createTpl = { gender: 'male', bgId: 'ordinary' };
    this.charName = '';
    this.attrNodes = {};               // 各属性 DOM 引用，便于增量刷新 + 闪烁
    this.turnBtn = null;
    this.turnArmed = true;             // 下一回合按钮可用态
    this.activeSlot = null;            // 当前游戏所写入的存档槽位（0 ~ SAVE_SLOTS-1）
    this.autoTimer = null;             // 挂机轮询定时器
    this.autoAccum = 0;                // 挂机周期累计（ms），达 intervalMs 触发一轮
  }

  mount() {
    this.root = h('div', { class: 'mnrs' });
    clear(this.parent);
    this.parent.appendChild(this.root);
    this.toastWrap = h('div', { class: 'toast-wrap' });
    this.stage = h('div', { class: 'mnrs-stage' });
    this.modalRoot = h('div', { class: 'mnrs-modals' });
    this.root.append(this.toastWrap, this.stage, this.modalRoot);
    // 软键盘收口：键盘弹起时把根容器限定在「键盘以上可见区」，输入框落在屏幕上半部分中部。
    this._detachKeyboard = attachKeyboardShell(this.root);
    this.showLauncher();
    return this;
  }

  // ============ 启动器 ============
  showLauncher() {
    this.screen = 'launcher';
    this.over = false;
    this.player = null;
    this.activeSlot = null;
    this.stopAutoLoop();
    clear(this.modalRoot);
    clear(this.stage);
    const hasSave = hasAnySave();
    const wrap = h('div', { class: 'launcher' },
      h('div', { class: 'launcher__brand' },
        h('div', { class: 'emblem' }, '生'),
        h('h1', null, '模拟人生'),
        h('p', { class: 'sub' }, '月复一月，年复一年，过完这一生 · 文字版人生模拟'),
      ),
      h('div', { class: 'launcher__actions' },
        hasSave
          ? h('button', { class: 'btn-primary big-btn', onClick: () => this.continueGame() }, '▶ 继续游戏')
          : h('button', { class: 'btn-primary big-btn', onClick: () => this.showCreate() }, '🌱 开始新的人生'),
        hasSave
          ? h('button', { class: 'btn-ghost', onClick: () => this.showCreate() }, '🆕 开始新的人生（选空槽）')
          : null,
        h('button', { class: 'btn-ghost', onClick: () => this.showSlots(true) }, '📂 存档管理'),
        h('button', { class: 'btn-ghost', onClick: () => this.showSettings(true) }, '⚙️ 设置 / 存档'),
      ),
      h('p', { class: 'launcher__hint muted' }, '一个月一个周期，健康归零或寿元耗尽便落幕。可开启挂机，让岁月自行流淌。'),
    );
    this.stage.appendChild(wrap);
  }

  continueGame() {
    const slot = latestSlot();
    if (slot == null) { this.toast('没有可继续的存档', 'bad'); this.showLauncher(); return; }
    const p = loadFromSlot(slot);
    if (!p) { this.toast('读取存档失败', 'bad'); this.showLauncher(); return; }
    this.enterGame(p, slot);
  }

  // ============ 存档管理（多槽位）============
  showSlots(fromLauncher) {
    const list = listSaves();
    const body = [
      h('div', { class: 'muted', style: { marginBottom: '0.5rem' } },
        `共 ${SAVE_SLOTS} 个存档槽位。点击空槽可在此开始新人生，已有存档可读取或删除。`),
      h('div', { class: 'slot-list' },
        list.map((s) => this.renderSlotRow(s)),
      ),
    ];
    const foot = [
      fromLauncher ? null : h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '关闭'),
      h('button', { class: 'btn-primary', onClick: () => { this.closeModal(); this.showCreate(); } }, '🆕 开始新的人生'),
    ];
    this.showSheet({ title: '📂 存档管理', body, foot: foot.filter(Boolean) });
  }

  // 渲染单个存档槽位行。
  renderSlotRow(s) {
    const head = s.exists
      ? h('div', { class: 'slot-info' },
          h('div', { class: 'slot-name' }, `${s.name || '无名氏'}`),
          h('div', { class: 'muted slot-meta' },
            s.career ? `${s.career} · ` : '', ageLabel(s.weeks || 0), ` · 第 ${s.turn || 0} 回合`),
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
      h('span', { class: 'slot-no' }, `#${s.slot + 1}`),
      head,
      actions,
    );
  }

  loadSlot(slot) {
    const p = loadFromSlot(slot);
    if (!p) { this.toast('读取失败', 'bad'); return; }
    this.closeModal();
    this.enterGame(p, slot);
  }

  confirmDeleteSlot(slot) {
    this.showSheet({
      title: '删除该存档？',
      body: [h('div', { class: 'muted' }, `将永久删除 #${slot + 1} 号槽位的存档，无法恢复。`)],
      foot: [
        h('button', { class: 'btn-danger', onClick: () => { deleteSlot(slot); this.closeModal(); this.toast('存档已删除', 'normal'); this.showSlots(this.screen === 'launcher'); } }, '确认删除'),
        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '取消'),
      ],
    });
  }

  // ============ 创角 ============
  showCreate(preferSlot) {
    this.screen = 'create';
    this.stopAutoLoop();
    this.createTpl._preferSlot = Number.isInteger(preferSlot) ? preferSlot : null;
    clear(this.modalRoot);
    clear(this.stage);
    this.renderCreate();
  }

  renderCreate() {
    const t = this.createTpl;
    const bg = BG_BY_ID[t.bgId] || BACKGROUNDS[0];
    // 由当前出身派生一份预览角色（不入档），展示初始属性。
    const preview = newPlayer(this.rng, { gender: t.gender, name: '预览', background: bg.id });
    applyChanges(preview, bg.adj);
    clear(this.stage);
    const wrap = h('div', { class: 'launcher create' });
    wrap.append(
      h('div', { class: 'create__head' },
        h('button', { class: 'btn-ghost', onClick: () => this.showLauncher() }, '← 返回'),
        h('h1', null, '开启新人生'),
      ),
      h('div', { class: 'create__body' },
        h('div', { class: 'card' },
          h('h4', null, '性别'),
          h('div', { class: 'gender-toggle' },
            h('button', { class: t.gender === 'male' ? 'active' : '', onClick: () => { this.createTpl.gender = 'male'; this.renderCreate(); } }, '♂ 男'),
            h('button', { class: t.gender === 'female' ? 'active' : '', onClick: () => { this.createTpl.gender = 'female'; this.renderCreate(); } }, '♀ 女'),
          ),
        ),
        h('div', { class: 'card' },
          h('div', { class: 'row' },
            h('div', { class: 'grow' },
              h('h4', null, `${bg.emoji} ${bg.name}`),
              h('div', { class: 'muted' }, bg.desc),
            ),
            h('button', { class: 'btn-ghost reroll-bg', onClick: () => this.rerollBg() }, '🎲 换个出身'),
          ),
          h('div', { class: 'attr-grid', style: { marginTop: '0.5rem' } },
            ATTRS.map((k) => attrPreview(k, preview.attrs[k], bg.adj)),
          ),
        ),
        h('div', { class: 'card' },
          h('h4', null, '姓名'),
          h('input', { class: 'name-input', dataset: { id: 'name' }, maxlength: 8, placeholder: '请输入姓名（可留空）', value: this.charName || '' }),
          h('div', { class: 'muted', style: { marginTop: '0.3rem' } }, '取一个名字，降生于世。出身会影响一生的际遇。'),
        ),
      ),
      h('div', { class: 'create__foot' },
        h('button', { class: 'btn-primary big-btn', onClick: () => this.confirmCreate(bg) }, '🍼 降生'),
      ),
    );
    this.stage.appendChild(wrap);
    const inp = wrap.querySelector('[data-id="name"]');
    if (inp) inp.addEventListener('input', () => { this.charName = inp.value; });
  }

  rerollBg() {
    const cur = this.createTpl.bgId;
    let next = cur;
    while (next === cur) next = BACKGROUNDS[Math.floor(this.rng() * BACKGROUNDS.length)].id;
    this.createTpl.bgId = next;
    this.renderCreate();
  }

  confirmCreate(bg) {
    const name = (this.charName || '').trim().slice(0, 8);
    const p = newPlayer(this.rng, { name, gender: this.createTpl.gender, background: bg.id });
    // 选定写入槽位：优先创角页指定的空槽，否则取首个空槽，都没有则覆盖最旧的。
    const slot = this.pickSlotForNewSave();
    this.activeSlot = slot;
    this.enterGame(p, slot); // 先就位 player 与 UI，再写入诞生大事记（确保落入 this.log 与 player.log）
    this.pushLog(`一声啼哭，${p.name} 降生于${bg.name}。`, 'milestone');
    this.toast(`已保存到 #${slot + 1} 号槽位`, 'good');
  }

  // 为新存档挑选槽位：指定空槽 > 首个空槽 > 最旧槽位。
  pickSlotForNewSave() {
    const prefer = this.createTpl && this.createTpl._preferSlot;
    const list = listSaves();
    if (Number.isInteger(prefer) && prefer >= 0 && prefer < SAVE_SLOTS && !list[prefer].exists) return prefer;
    const empty = list.find((s) => !s.exists);
    if (empty) return empty.slot;
    list.sort((a, b) => (a.lastSeen || 0) - (b.lastSeen || 0));
    return list[0].slot;
  }

  // ============ 进入游戏 ============
  enterGame(player, slot) {
    this.player = player;
    this.activeSlot = Number.isInteger(slot) ? slot : (this.activeSlot != null ? this.activeSlot : 0);
    // 挂机配置兜底（旧档 / 损坏档缺失字段时补默认，绝不擅自开启）。
    player.autoplay = normalizeAutoPlay(player.autoplay);
    this.screen = 'game';
    this.over = false;
    // 由持久化大事记重建 UI 侧日志缓冲（继续游戏 / 结算历史都依赖于此）。
    this.log = Array.isArray(player.log)
      ? player.log.slice(-60).map((l) => ({ text: l.text, type: l.type }))
      : [];
    this.buildGame();
    this.refreshStatus();
    this.renderLog();
    this.setTurnEnabled(true);
    saveToSlot(this.activeSlot, this.player);
    this.syncAutoBadge();
    this.startAutoLoop();
    // 若读入的就是已死亡存档（理论上不该出现），直接结算
    if (isDead(this.player)) this.endGame();
  }

  buildGame() {
    clear(this.stage);
    clear(this.modalRoot);
    const game = h('div', { class: 'mnrs-game' });
    this.statusEl = h('div', { class: 'status-bar' });
    this.logEl = h('div', { class: 'log-strip' }, h('div', { class: 'log-strip__lines' }));
    this.bottomBar = h('div', { class: 'bottom-bar' });
    game.append(this.statusEl, this.logEl, this.bottomBar);
    this.stage.appendChild(game);
    this.buildStatus();
    this.buildBottomBar();
  }

  // —— 状态栏：身份概览 + 挂机徽丸 + 五大属性（一次构建，刷新时增量更新 + 闪烁）——
  buildStatus() {
    clear(this.statusEl);
    const p = this.player;
    this.autoBadge = h('span', { class: 'auto-badge', title: '挂机进行中（打开任意弹窗时自动暂停）', style: { display: 'none' } }, '🤖 挂机');
    this.idLine = h('div', { class: 'id-line' },
      h('span', { class: 'id-name' }, p.name),
      h('span', { class: 'id-stage' }, stageEmoji(p) + ' ' + stageOf(p).name),
      h('span', { class: 'id-age' }, ageLabel(p.weeks)),
      this.autoBadge,
      h('span', { class: 'id-turn' }, `第 ${p.turn} 回合`),
    );
    const attrWrap = h('div', { class: 'attr-list' });
    this.attrNodes = {};
    for (const k of ATTRS) {
      const meta = ATTR_META[k];
      const fill = h('div', { class: 'attr-fill', style: { background: meta.color } });
      const row = h('div', { class: 'attr-row', dataset: { key: k } },
        h('span', { class: 'attr-label' }, `${meta.emoji} ${meta.name}`),
        h('div', { class: 'attr-track' }, fill),
        h('span', { class: 'attr-val' }, String(p.attrs[k])),
        h('span', { class: 'attr-delta' }),
      );
      this.attrNodes[k] = { row, fill, val: row.querySelector('.attr-val'), delta: row.querySelector('.attr-delta') };
      attrWrap.appendChild(row);
    }
    this.statusEl.append(this.idLine, attrWrap);
  }

  buildBottomBar() {
    clear(this.bottomBar);
    // 「下一回合」：底部固定悬浮主操作按钮，高度≥48px，符合拇指热区。
    this.turnBtn = h('button', {
      class: 'turn-btn', onClick: () => this.nextTurn(),
    }, '⏭️ 下一回合');
    const tools = h('div', { class: 'bottom-tools' },
      h('button', { class: 'icon-btn', title: '人物档案', onClick: () => this.showProfile() }, '👤'),
      h('button', { class: 'icon-btn', title: '挂机模式', onClick: () => this.showAutoSheet() }, '🤖'),
      h('button', { class: 'icon-btn', title: '设置 / 存档', onClick: () => this.showSettings(false) }, '⚙️'),
    );
    this.bottomBar.append(this.turnBtn, tools);
  }

  setTurnEnabled(on) {
    this.turnArmed = on;
    if (!this.turnBtn) return;
    // 挂机开启时，手动按钮让位给自动推进。
    const apOn = this.player && this.player.autoplay && this.player.autoplay.enabled;
    if (apOn) {
      this.turnBtn.disabled = true;
      this.turnBtn.classList.add('busy');
      this.turnBtn.textContent = '🤖 挂机中…';
      return;
    }
    this.turnBtn.disabled = !on;
    this.turnBtn.classList.toggle('busy', !on);
    // 按钮透明展示「这一步会推进多少时间」，呼应整除历法（4 周 = 1 个月）。
    const step = this.player ? stepLabel(stageOf(this.player).weeksPerTurn) : '';
    this.turnBtn.textContent = on ? `⏭️ 下一回合 · ${step}` : '…';
  }

  // —— 增量刷新状态栏，并按 deltas 闪烁变化属性（绿增红减 + 数字跳动）——
  refreshStatus(deltas = {}) {
    const p = this.player;
    if (!p || !this.idLine) return;
    this.idLine.querySelector('.id-name').textContent = p.name;
    this.idLine.querySelector('.id-stage').textContent = stageEmoji(p) + ' ' + stageOf(p).name;
    this.idLine.querySelector('.id-age').textContent = ageLabel(p.weeks);
    this.idLine.querySelector('.id-turn').textContent = `第 ${p.turn} 回合`;
    for (const k of ATTRS) {
      const n = this.attrNodes[k];
      if (!n) continue;
      const v = p.attrs[k];
      n.fill.style.width = `${v}%`;
      n.val.textContent = String(v);
      const d = deltas[k];
      if (Number.isFinite(d) && d !== 0) this.flashAttr(k, d);
    }
  }

  // 在属性行上播放「跳动 + 闪色」反馈：绿色↑ / 红色↓，并浮一个 +/- 数字。
  flashAttr(key, delta) {
    const n = this.attrNodes[key];
    if (!n) return;
    const up = delta > 0;
    n.row.classList.remove('flash-up', 'flash-down');
    // 强制重排以重启动画
    void n.row.offsetWidth;
    n.row.classList.add(up ? 'flash-up' : 'flash-down');
    n.delta.textContent = (up ? '+' : '') + delta;
    n.delta.className = `attr-delta ${up ? 'up' : 'down'} show`;
    clearTimeout(n._t);
    n._t = setTimeout(() => {
      n.row.classList.remove('flash-up', 'flash-down');
      n.delta.classList.remove('show');
    }, 700);
  }

  // —— 人生大事记（动态文本展示区）——
  // 同时写入 UI 缓冲（this.log，供结算页展示）与持久化大事记（player.log，随存档保存）。
  pushLog(text, type = 'normal') {
    this.log.push({ text, type });
    if (this.log.length > 60) this.log.shift();
    if (this.player) {
      this.player.log.push({ turn: this.player.turn, text, type });
      if (this.player.log.length > 200) this.player.log.shift();
    }
    if (this.logEl) this.renderLog();
  }
  renderLog() {
    const box = this.logEl.querySelector('.log-strip__lines') || this.logEl;
    clear(box);
    const recent = this.log.slice(-12);
    for (const ln of recent) box.appendChild(h('div', { class: `ln ${ln.type}` }, ln.text));
    box.scrollTop = box.scrollHeight;
  }

  // ============ 回合推进（核心循环）============
  // 推进一个月：步进时间 + 被动漂移，再依概率决定是否触发抉择事件。
  //   interactive=true → 事件以弹窗呈现，等玩家手动抉择（手动「下一回合」）。
  //   interactive=false → 事件由挂机策略自动抉择，全程不开弹窗（挂机模式）。
  // 返回是否触发了需等待的事件（true=已处理或弹窗打开；false=无事件）。
  advanceTurn({ interactive } = {}) {
    if (this.over || !this.player) return false;

    // 1) 推进时间 + 被动漂移
    const snap = snapshotAttrs(this.player);
    const step = stepTime(this.player, this.rng);
    const driftDelta = diffAttrs(snap, this.player.attrs);
    this.refreshStatus(driftDelta);
    if (step.stageChanged) {
      this.pushLog(`🎯 ${milestoneHead(step.toStage.key)}：${stageOf(this.player).desc}`, 'milestone');
    }
    saveToSlot(this.activeSlot, this.player);

    // 2) 漂移致死的兜底（如老年健康耗尽）
    if (isDead(this.player)) { this.endGame(); return true; }

    // 3) 抉择事件：依阶段概率决定本月是否触发。
    const chance = EVENT_CHANCE[stageOf(this.player).key] ?? 0.5;
    if (this.rng() < chance) {
      const ev = rollEvent(this.player, this.rng);
      if (ev) {
        if (interactive) this.openEvent(ev);
        else this.autoResolveEvent(ev);
        return true;
      }
    }
    // 无事件：一条日常旁白
    this.pushLog(ambientLine(this.player, this.rng), 'normal');
    return false;
  }

  // 手动「下一回合」：交互式推进，无事件时恢复按钮。
  nextTurn() {
    if (this.over || !this.player || !this.turnArmed) return;
    this.setTurnEnabled(false);
    this.advanceTurn({ interactive: true });
    // 未弹出事件抉择弹窗、且未死亡时，恢复按钮可用
    if (!this.over && !this._sheet) this.setTurnEnabled(true);
  }

  // —— 随机事件抉择弹窗（手动）——
  openEvent(ev) {
    const body = [
      h('div', { class: 'event-emoji' }, ev.emoji),
      h('div', { class: 'event-text muted' }, ev.text),
    ];
    const foot = [h('div', { class: 'event-options' },
      ev.options.map((opt) => h('button', {
        class: 'btn-ghost event-opt',
        onClick: () => this.resolveEvent(ev, opt),
      }, `${opt.emoji || ''} ${opt.label}`)),
    )];
    this.showSheet({ title: ev.title, body, foot });
  }

  resolveEvent(ev, option) {
    this.closeModal();
    this.applyEventResult(ev, option);
    if (!this.over) this.setTurnEnabled(true);
  }

  // 挂机自动抉择：按策略挑一个选项并结算（不开弹窗）。
  autoResolveEvent(ev) {
    const policy = (this.player.autoplay && this.player.autoplay.policy) || 'balanced';
    const opt = pickOption(this.player, ev, policy, this.rng);
    if (!opt) return;
    // 在大事记里标注是自动抉择的，便于玩家回看。
    this.pushLog(`🤖 自动抉择「${ev.title}」：${opt.emoji || ''} ${opt.label}`, 'normal');
    this.applyEventResult(ev, opt);
  }

  // 结算一个选项：应用属性变化、设置职业/职级/标志，返回带 outcome 文本的完整结果。
  applyEventResult(ev, option) {
    const snap = snapshotAttrs(this.player);
    const res = applyOption(this.player, option, this.rng) || {};
    const delta = diffAttrs(snap, this.player.attrs);
    this.refreshStatus(delta);
    // 把抉择结果写入大事记：标题 + 结局 + 增减一览，自解释。
    const tail = ATTRS.map((k) => (delta[k] ? ` ${ATTR_META[k].emoji}${delta[k] > 0 ? '+' : ''}${delta[k]}` : '')).join('');
    this.pushLog(`${ev.emoji} ${ev.title}：${res.outcome || ''}${tail}`, 'choice');
    saveToSlot(this.activeSlot, this.player);
    if (isDead(this.player)) { this.endGame(); }
  }

  // ============ 人生总结（结局）============
  endGame() {
    if (this.over) return;
    this.over = true;
    this.stopAutoLoop();
    this.setTurnEnabled(false);
    const result = evaluateLife(this.player);
    this.pushLog(`🌙 ${result.cause}，${result.name} 的人生落幕。`, 'milestone');
    saveToSlot(this.activeSlot, this.player);
    clear(this.modalRoot);
    // 清屏并展示整页结算（覆盖游戏主体）
    clear(this.stage);
    this.syncAutoBadge();
    this.renderGameOver(result);
  }

  renderGameOver(result) {
    this.screen = 'over';
    const wrap = h('div', { class: 'launcher over' });
    wrap.append(
      h('div', { class: `over-grade ${result.grade.tone}` },
        h('div', { class: 'over-grade__emoji' }, result.grade.emoji),
        h('h2', null, result.grade.label),
        h('div', { class: 'muted' }, `${result.name} · ${result.age} 岁 · ${result.cause}`),
      ),
      h('div', { class: 'card' },
        h('div', { class: 'over-summary' }, result.summary),
        h('div', { class: 'over-tags' }, result.tags.map((t) => h('span', { class: 'tag' }, t))),
      ),
      h('div', { class: 'card' },
        h('h4', null, '人生属性'),
        h('div', { class: 'attr-grid' },
          ATTRS.map((k) => h('div', { class: 'attr-mini' },
            h('span', { class: 'attr-label' }, `${ATTR_META[k].emoji} ${ATTR_META[k].name}`),
            bar(result.attrs[k], 100, { color: ATTR_META[k].color, label: String(result.attrs[k]) }),
          )),
        ),
      ),
      h('div', { class: 'over-history' },
        h('h4', { class: 'muted' }, '人生大事记'),
        h('div', { class: 'over-history__list' },
          ...(this.log.length
            ? this.log.map((ln) => h('div', { class: `ln ${ln.type}` }, ln.text))
            : [h('div', { class: 'muted' }, '平淡的一生，波澜不惊。')]),
        ),
      ),
      h('div', { class: 'over-actions' },
        h('button', { class: 'btn-primary big-btn', onClick: () => { this.deleteAndRestart(); } }, '🔄 再活一次'),
        h('button', { class: 'btn-ghost', onClick: () => this.showSettings(false) }, '⚙️ 导出 / 存档'),
      ),
    );
    this.stage.appendChild(wrap);
  }

  deleteAndRestart() {
    if (this.activeSlot != null) deleteSlot(this.activeSlot);
    this.player = null;
    this.log = [];
    this.showCreate();
  }

  // ============ 人物档案 ============
  showProfile() {
    const p = this.player;
    const bg = BG_BY_ID[p.background] || BG_BY_ID.ordinary;
    const body = [
      h('div', { class: 'profile-head' },
        h('div', { class: 'profile-name' }, p.name),
        h('div', { class: 'muted' }, `${stageEmoji(p)} ${stageOf(p).name} · ${ageLabel(p.weeks)} · 寿元上限 ${p.maxAge} 岁`),
      ),
      h('div', { class: 'attr-grid' },
        ATTRS.map((k) => h('div', { class: 'attr-mini' },
          h('span', { class: 'attr-label' }, `${ATTR_META[k].emoji} ${ATTR_META[k].name}`),
          h('div', { class: 'muted', style: { fontSize: '0.72rem', marginBottom: '0.2rem' } }, ATTR_META[k].desc),
          bar(p.attrs[k], 100, { color: ATTR_META[k].color, label: String(p.attrs[k]) }),
        )),
      ),
      h('div', { class: 'profile-meta' },
        metaRow('出身', `${bg.emoji} ${bg.name}`),
        metaRow('职业', careerLabel(p)),
        metaRow('婚姻', p.flags?.married ? '已成家' : '未婚'),
        metaRow('子女', famRow(p)),
        metaRow('房产', p.flags?.homeowner ? '有房' : '无'),
        metaRow('回合数', String(p.turn)),
        metaRow('生命阶段', stageEmoji(p) + ' ' + stageOf(p).name),
      ),
    ];
    this.showSheet({ title: '人物档案', body, foot: [h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '关闭')] });
  }

  // ============ 挂机模式 ============
  showAutoSheet() {
    if (!this.player) return;
    this.player.autoplay = normalizeAutoPlay(this.player.autoplay);
    const ap = this.player.autoplay;
    const policyDef = AUTO_POLICIES.find((p) => p.id === ap.policy) || AUTO_POLICIES[1];
    const body = [
      h('div', { class: 'muted', style: { marginBottom: '0.5rem' } },
        '开启后，岁月将按下方节奏与策略自动流淌——每月自动推进，遇到抉择也由策略自动处置。打开任何弹窗时会自动暂停，不与你的操作冲突。'),
      h('div', { class: 'card' },
        h('button', {
          class: `btn-primary auto-toggle ${ap.enabled ? 'on' : ''}`,
          style: { width: '100%', marginBottom: '0.5rem' },
          onClick: () => this.toggleAutoplay(),
        }, ap.enabled ? '✅ 挂机：已开启（点此关闭）' : '💤 挂机：已关闭（点此开启）'),
        h('div', { class: 'auto-cfg-row' },
          h('span', { class: 'muted' }, '推进节奏'),
          this._stepper(ap.intervalMs, MIN_INTERVAL_MS, MAX_INTERVAL_MS, 100, (v) => this.setAutoInterval(v), 'ms/月'),
        ),
        h('div', { class: 'muted', style: { fontSize: '0.74rem', marginTop: '0.2rem' } },
          `当前策略：${policyDef.emoji} ${policyDef.label} · ${policyDef.desc}`),
        h('div', { class: 'policy-row', style: { marginTop: '0.5rem' } },
          AUTO_POLICIES.map((p) => h('button', {
            class: `btn-ghost policy-opt ${ap.policy === p.id ? 'active' : ''}`,
            onClick: () => this.setAutoPolicy(p.id),
          }, `${p.emoji} ${p.label}`)),
        ),
      ),
      h('button', { class: 'btn-ghost', style: { width: '100%' }, onClick: () => this.runAutoOnce() }, '▶ 立即推进一月（预览）'),
    ];
    const foot = [
      h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '关闭'),
    ];
    this.showSheet({ title: '🤖 挂机模式', body, foot });
  }

  toggleAutoplay() {
    const ap = this.player.autoplay;
    ap.enabled = !ap.enabled;
    this.persistAutoplay();
    if (ap.enabled) {
      this.autoAccum = 0;
      this.startAutoLoop();
      this.toast('挂机已开启，岁月自动流淌', 'normal');
    } else {
      this.stopAutoLoop();
      this.toast('挂机已关闭', 'normal');
    }
    this.setTurnEnabled(!ap.enabled);
    this.syncAutoBadge();
    if (this.screen === 'game') this.showAutoSheet();
  }

  setAutoInterval(v) {
    this.player.autoplay.intervalMs = v;
    this.persistAutoplay();
    this.autoAccum = 0;
    if (this.screen === 'game') this.showAutoSheet();
  }

  setAutoPolicy(id) {
    if (!AUTO_POLICIES.some((p) => p.id === id)) return;
    this.player.autoplay.policy = id;
    this.persistAutoplay();
    if (this.screen === 'game') this.showAutoSheet();
  }

  persistAutoplay() {
    this.player.autoplay = normalizeAutoPlay(this.player.autoplay);
    saveToSlot(this.activeSlot, this.player);
  }

  // 立即推进一月（无视开关执行一次），便于玩家直观感受。
  runAutoOnce() {
    this.closeModal();
    this.advanceTurn({ interactive: false });
    this.toast('已自动推进一月', 'normal');
  }

  // 挂机徽丸显隐：仅游戏中且开启时显示。
  syncAutoBadge() {
    const on = this.player && this.player.autoplay && this.player.autoplay.enabled && this.screen === 'game';
    if (this.autoBadge) this.autoBadge.style.display = on ? '' : 'none';
  }

  // —— 挂机驱动：轮询累计，达 intervalMs 触发一轮；弹窗 / 死亡 / 非游戏中时暂停 ——
  startAutoLoop() {
    this.stopAutoLoop();
    this.autoAccum = 0;
    this.autoTimer = setInterval(() => this.autoTick(), 250);
  }
  stopAutoLoop() {
    if (this.autoTimer) { clearInterval(this.autoTimer); this.autoTimer = null; }
    this.autoAccum = 0;
  }
  autoTick() {
    const ap = this.player && this.player.autoplay;
    if (!ap || !ap.enabled || this.over || this.screen !== 'game') return;
    if (this._sheet) return; // 任意弹窗打开时暂停
    this.autoAccum += 250;
    const interval = Math.max(MIN_INTERVAL_MS, ap.intervalMs || DEFAULT_INTERVAL_MS);
    if (this.autoAccum >= interval) {
      this.autoAccum = 0;
      this.autoStep();
    }
  }
  autoStep() {
    try {
      this.advanceTurn({ interactive: false });
    } catch (_) { /* 吞异常，绝不中断主循环 */ }
    if (this.over) this.stopAutoLoop();
  }

  // 简易步进器：- 值 +，回调返回新值。
  _stepper(val, min, max, step, onChange, unit) {
    const clamp = (v) => Math.min(max, Math.max(min, v));
    return h('div', { class: 'stepper' },
      h('button', { class: 'btn-ghost step-btn', onClick: () => onChange(clamp(val - step)) }, '−'),
      h('span', { class: 'step-val' }, `${val} ${unit || ''}`),
      h('button', { class: 'btn-ghost step-btn', onClick: () => onChange(clamp(val + step)) }, '+'),
    );
  }

  // ============ 设置 / 存档 ============
  showSettings(fromLauncher) {
    const p = this.player;
    const body = [
      h('div', { class: 'card' },
        h('h4', null, '存档'),
        h('div', { class: 'muted', style: { marginBottom: '0.4rem' } },
          hasAnySave() ? `当前进度自动保存${p ? `（#${(this.activeSlot == null ? '?' : this.activeSlot + 1)} 槽 · ${p.name} · ${ageLabel(p.weeks)}）` : ''}。` : '尚无存档。'),
        h('button', { class: 'btn-primary', style: { width: '100%', marginBottom: '0.4rem' }, onClick: () => { this.closeModal(); this.showSlots(fromLauncher); } }, '📂 存档管理（多槽位）'),
        h('button', { class: 'btn-jade', style: { width: '100%', marginBottom: '0.4rem' }, onClick: () => this.doExport() }, '📤 导出存档字符串'),
        h('textarea', { class: 'save-io', dataset: { id: 'io' }, placeholder: '在此粘贴导入字符串…', readonly: true }),
        h('div', { class: 'row wrap', style: { marginTop: '0.4rem' } },
          h('button', { class: 'btn-ghost', style: { flex: '1 1 45%' }, onClick: () => this.toggleIoInput() }, '✏️ 切换为输入'),
          h('button', { class: 'btn-jade', style: { flex: '1 1 45%' }, onClick: () => this.doImport() }, '📥 导入到当前槽位'),
        ),
      ),
      h('div', { class: 'muted', style: { textAlign: 'center' } }, '导出字符串可跨设备迁移；导入会覆盖当前槽位存档。'),
    ];
    const foot = [
      fromLauncher
        ? null
        : h('button', { class: 'btn-ghost', onClick: () => { this.closeModal(); this.confirmExitToLauncher(); } }, '🏠 返回标题'),
      h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '关闭'),
    ];
    this.showSheet({ title: '设置 / 存档', body, foot: foot.filter(Boolean) });
  }

  toggleIoInput() {
    const io = this.modalRoot.querySelector('[data-id="io"]');
    if (!io) return;
    io.readOnly = !io.readOnly;
    if (io.readOnly) { io.value = ''; this.toast('已切回导出模式', 'normal'); }
    else { this.toast('请在框中粘贴导入字符串后点导入', 'normal'); }
  }

  doExport() {
    const p = this.player || (this.activeSlot != null ? loadFromSlot(this.activeSlot) : null) || (latestSlot() != null ? loadFromSlot(latestSlot()) : null);
    if (!p) { this.toast('暂无可导出的存档', 'bad'); return; }
    const io = this.modalRoot.querySelector('[data-id="io"]');
    const str = exportSave(p);
    if (io) { io.readOnly = true; io.value = str; }
    this.toast('存档字符串已生成，可复制', 'good');
  }

  doImport() {
    const io = this.modalRoot.querySelector('[data-id="io"]');
    const str = (io && io.value || '').trim();
    if (!str) { this.toast('请先在框中粘贴导入字符串', 'bad'); return; }
    const p = importSave(str);
    if (!p) { this.toast('导入失败：字符串无效', 'bad'); return; }
    const slot = this.activeSlot != null ? this.activeSlot : this.pickSlotForNewSave();
    this.activeSlot = slot;
    saveToSlot(slot, p);
    this.toast(`导入成功，已写入 #${slot + 1} 槽位`, 'good');
    this.closeModal();
    this.enterGame(p, slot);
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

  // ============ 通用弹窗（Sheet）============
  showSheet({ title, body, foot }) {
    clear(this.modalRoot);
    const overlay = h('div', { class: 'sheet-overlay', onClick: () => this.closeModal() });
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
  }

  toast(text, type = 'normal') {
    const t = h('div', { class: `toast ${type}` }, text);
    this.toastWrap.appendChild(t);
    setTimeout(() => { t.classList.add('hide'); setTimeout(() => t.remove(), 300); }, 1600);
  }

  destroy() {
    this.stopAutoLoop();
    try { if (this.player) saveToSlot(this.activeSlot, this.player); } catch (_) {}
    if (this._detachKeyboard) { this._detachKeyboard(); this._detachKeyboard = null; }
    clear(this.parent);
    clear(this.modalRoot);
    clear(this.toastWrap);
    this.player = null;
    this.over = false;
  }
}

// —— 纯辅助（不依赖 this）——
function snapshotAttrs(p) {
  const out = {};
  for (const k of ATTRS) out[k] = p.attrs[k];
  return out;
}
function diffAttrs(before, after) {
  const out = {};
  for (const k of ATTRS) {
    const d = (after[k] - before[k]);
    if (d !== 0) out[k] = d;
  }
  return out;
}
function stageEmoji(p) {
  return stageForAge(ageYearsFromWeeks(p.weeks)).emoji;
}
function milestoneHead(stageKey) {
  // 按进入的新阶段给出里程碑标题，须与 config 中各阶段语义对齐：
  // child（学龄期）→ 步入校园；adult（成年期）→ 步入社会；elder（老年期）→ 迈入晚年。
  return ({ infant: '幼年时光', child: '步入校园', adult: '步入社会', elder: '迈入晚年' })[stageKey] || '人生新章';
}
function attrPreview(key, val, adj) {
  const meta = ATTR_META[key];
  const d = adj && Number.isFinite(adj[key]) ? adj[key] : 0;
  const tag = d ? h('span', { class: `adj ${d > 0 ? 'up' : 'down'}` }, `${d > 0 ? '+' : ''}${d}`) : null;
  return h('div', { class: 'attr-mini' },
    h('span', { class: 'attr-label' }, `${meta.emoji} ${meta.name}`, tag),
    bar(val, 100, { color: meta.color, label: String(val) }),
  );
}
function metaRow(k, v) {
  return h('div', { class: 'meta-row' }, h('span', { class: 'muted' }, k), h('span', null, v));
}
// 家庭概况：子女数 + 是否养宠，无则「尚无」。
function famRow(p) {
  const kids = p.flags?.children || 0;
  const pet = p.flags?.pet;
  if (!kids && !pet) return '尚无';
  const parts = [];
  if (kids) parts.push(`${kids} 个孩子`);
  if (pet) parts.push('🐾 有宠');
  return parts.join(' · ');
}
