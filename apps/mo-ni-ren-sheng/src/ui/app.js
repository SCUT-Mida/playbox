// ============================================================================
// 模拟人生 · UI 渲染模块（UI Renderer，纯原生 DOM）
// 负责渲染：启动器（新游戏/继续）→ 创角 → 游戏主体（状态栏 + 人生大事记 + 下一回合）
// 以及随机事件抉择弹窗、人生总结结算弹窗、设置弹窗。驱动回合推进与自动存档。
// ============================================================================
import '../ui/style.css';
import { h, clear, bar } from './dom.js';
import {
  ATTRS, ATTR_META, ageLabel, ageYearsFromWeeks, stageForAge, EVENT_CHANCE,
} from '../config.js';
import {
  newPlayer, stageOf, applyChanges, stepTime, isDead, evaluateLife,
} from '../core/player.js';
import { rollEvent, applyOption, ambientLine } from '../core/events.js';
import {
  saveGame, loadGame, hasSave, clearSave, exportSave, importSave,
} from '../core/save.js';
import { makeRng } from '../core/rng.js';

// 创角出身：提供小幅初始属性倾向，增加重玩差异。
const BACKGROUNDS = [
  { id: 'scholar', emoji: '📚', name: '书香门第', desc: '世代读书，家学渊源。', adj: { intelligence: 8, mood: 2 } },
  { id: 'merchant', emoji: '🏪', name: '商贾之家', desc: '家中经商，耳濡目染。', adj: { wealth: 10, social: 3 } },
  { id: 'martial', emoji: '🥋', name: '武术世家', desc: '尚武之家，体魄强健。', adj: { health: 10, mood: -2 } },
  { id: 'artisan', emoji: '🎭', name: '梨园世家', desc: '以艺谋生，性情开朗。', adj: { mood: 8, social: 5, wealth: -3 } },
  { id: 'humble', emoji: '🌾', name: '寒门子弟', desc: '家徒四壁，唯有志气。', adj: { wealth: -6, intelligence: 3, mood: -2 } },
  { id: 'ordinary', emoji: '🏠', name: '寻常人家', desc: '平平淡淡才是真。', adj: {} },
];

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
  }

  mount() {
    this.root = h('div', { class: 'mnrs' });
    clear(this.parent);
    this.parent.appendChild(this.root);
    this.toastWrap = h('div', { class: 'toast-wrap' });
    this.stage = h('div', { class: 'mnrs-stage' });
    this.modalRoot = h('div', { class: 'mnrs-modals' });
    this.root.append(this.toastWrap, this.stage, this.modalRoot);
    this.showLauncher();
    return this;
  }

  // ============ 启动器 ============
  showLauncher() {
    this.screen = 'launcher';
    this.over = false;
    this.player = null;
    clear(this.modalRoot);
    clear(this.stage);
    const saved = hasSave();
    const wrap = h('div', { class: 'launcher' },
      h('div', { class: 'launcher__brand' },
        h('div', { class: 'emblem' }, '生'),
        h('h1', null, '模拟人生'),
        h('p', { class: 'sub' }, '一周一周，过完这一生 · 文字版人生模拟'),
      ),
      h('div', { class: 'launcher__actions' },
        saved
          ? h('button', { class: 'btn-primary big-btn', onClick: () => this.continueGame() }, '▶ 继续游戏')
          : h('button', { class: 'btn-primary big-btn', onClick: () => this.showCreate() }, '🌱 开始新的人生'),
        saved
          ? h('button', { class: 'btn-ghost', onClick: () => this.showCreate() }, '🆕 重新开始（覆盖旧档）')
          : null,
        h('button', { class: 'btn-ghost', onClick: () => this.showSettings(true) }, '⚙️ 设置 / 存档'),
      ),
      h('p', { class: 'launcher__hint muted' }, '健康归零或寿元耗尽，这一生便落下帷幕。每一次抉择，都在改写你的人生。'),
    );
    this.stage.appendChild(wrap);
  }

  continueGame() {
    const p = loadGame();
    if (!p) { this.toast('没有可继续的存档', 'bad'); this.showLauncher(); return; }
    this.enterGame(p);
  }

  // ============ 创角 ============
  showCreate() {
    this.screen = 'create';
    clear(this.modalRoot);
    clear(this.stage);
    this.renderCreate();
  }

  renderCreate() {
    const t = this.createTpl;
    const bg = BACKGROUNDS.find((b) => b.id === t.bgId) || BACKGROUNDS[0];
    // 由当前出身派生一份预览角色（不入档），展示初始属性。
    const preview = newPlayer(this.rng, { gender: t.gender, name: '预览' });
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
            ATTRS.map((k) => attrPreview(k, preview.attrs[k], bg.adj[k])),
          ),
        ),
        h('div', { class: 'card' },
          h('h4', null, '姓名'),
          h('input', { class: 'name-input', dataset: { id: 'name' }, maxlength: 8, placeholder: '请输入姓名（可留空）', value: this.charName || '' }),
          h('div', { class: 'muted', style: { marginTop: '0.3rem' } }, '取一个名字，降生于世。'),
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
    const p = newPlayer(this.rng, { name, gender: this.createTpl.gender });
    applyChanges(p, bg.adj);
    this.enterGame(p); // 先就位 player 与 UI，再写入诞生大事记（确保落入 this.log 与 player.log）
    this.pushLog(`一声啼哭，${p.name} 降生于${bg.name}。`, 'milestone');
  }

  // ============ 进入游戏 ============
  enterGame(player) {
    this.player = player;
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
    saveGame(this.player);
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

  // —— 状态栏：身份概览 + 五大属性（一次构建，刷新时增量更新 + 闪烁）——
  buildStatus() {
    clear(this.statusEl);
    const p = this.player;
    this.idLine = h('div', { class: 'id-line' },
      h('span', { class: 'id-name' }, p.name),
      h('span', { class: 'id-stage' }, stageEmoji(p) + ' ' + stageOf(p).name),
      h('span', { class: 'id-age' }, ageLabel(p.weeks)),
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
      h('button', { class: 'icon-btn', title: '设置 / 存档', onClick: () => this.showSettings(false) }, '⚙️'),
    );
    this.bottomBar.append(this.turnBtn, tools);
  }

  setTurnEnabled(on) {
    this.turnArmed = on;
    if (this.turnBtn) {
      this.turnBtn.disabled = !on;
      this.turnBtn.classList.toggle('busy', !on);
      this.turnBtn.textContent = on ? '⏭️ 下一回合' : '…';
    }
  }

  // —— 增量刷新状态栏，并按 deltas 闪烁变化属性（绿增红减 + 数字跳动）——
  refreshStatus(deltas = {}) {
    const p = this.player;
    this.idLine.querySelector('.id-name').textContent = p.name;
    this.idLine.querySelector('.id-stage').textContent = stageEmoji(p) + ' ' + stageOf(p).name;
    this.idLine.querySelector('.id-age').textContent = ageLabel(p.weeks);
    this.idLine.querySelector('.id-turn').textContent = `第 ${p.turn} 回合`;
    for (const k of ATTRS) {
      const n = this.attrNodes[k];
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

  // ============ 下一回合（核心循环）============
  nextTurn() {
    if (this.over || !this.player || !this.turnArmed) return;
    this.setTurnEnabled(false);

    // 1) 推进时间 + 被动漂移
    const snap = snapshotAttrs(this.player);
    const step = stepTime(this.player, this.rng);
    const driftDelta = diffAttrs(snap, this.player.attrs);
    this.refreshStatus(driftDelta);
    if (step.stageChanged) {
      this.pushLog(`🎯 ${milestoneHead(step.toStage.key)}：${stageOf(this.player).desc}`, 'milestone');
    }
    saveGame(this.player);

    // 2) 漂移致死的兜底（如老年健康耗尽）
    if (isDead(this.player)) { this.endGame(); return; }

    // 3) 抉择事件：依阶段概率决定本回合是否触发，避免每回合都被打断。
    const chance = EVENT_CHANCE[stageOf(this.player).key] ?? 0.5;
    if (this.rng() < chance) {
      const ev = rollEvent(this.player, this.rng);
      if (ev) {
        this.openEvent(ev);
        return; // 选项结算后会重新启用按钮
      }
    }
    // 无事件：一条日常旁白，按钮恢复
    this.pushLog(ambientLine(this.player, this.rng), 'normal');
    this.setTurnEnabled(true);
  }

  // —— 随机事件抉择弹窗 ——
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
    const snap = snapshotAttrs(this.player);
    const res = applyOption(this.player, option, this.rng) || {};
    const delta = diffAttrs(snap, this.player.attrs);
    this.refreshStatus(delta);
    // 把抉择结果写入大事记：标题 + 结局 + 增减一览，自解释。
    const tail = ATTRS.map((k) => (delta[k] ? ` ${ATTR_META[k].emoji}${delta[k] > 0 ? '+' : ''}${delta[k]}` : '')).join('');
    this.pushLog(`${ev.emoji} ${ev.title}：${res.outcome || ''}${tail}`, 'choice');
    saveGame(this.player);
    if (isDead(this.player)) { this.endGame(); return; }
    this.setTurnEnabled(true);
  }

  // ============ 人生总结（结局）============
  endGame() {
    this.over = true;
    this.setTurnEnabled(false);
    const result = evaluateLife(this.player);
    this.pushLog(`🌙 ${result.cause}，${result.name} 的人生落幕。`, 'milestone');
    saveGame(this.player);
    clear(this.modalRoot);
    // 清屏并展示整页结算（覆盖游戏主体）
    clear(this.stage);
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
    clearSave();
    this.player = null;
    this.log = [];
    this.showCreate();
  }

  // ============ 人物档案 ============
  showProfile() {
    const p = this.player;
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
        metaRow('职业', p.career || '尚无'),
        metaRow('婚姻', p.flags?.married ? '已成家' : '未婚'),
        metaRow('回合数', String(p.turn)),
        metaRow('生命阶段', stageEmoji(p) + ' ' + stageOf(p).name),
      ),
    ];
    this.showSheet({ title: '人物档案', body, foot: [h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '关闭')] });
  }

  // ============ 设置 / 存档 ============
  showSettings(fromLauncher) {
    const p = this.player;
    const body = [
      h('div', { class: 'card' },
        h('h4', null, '存档'),
        h('div', { class: 'muted', style: { marginBottom: '0.4rem' } },
          hasSave() ? `当前有存档${p ? `（${p.name} · ${ageLabel(p.weeks)}）` : ''}，进度自动保存。` : '尚无存档。'),
        h('button', { class: 'btn-primary', style: { width: '100%', marginBottom: '0.4rem' }, onClick: () => this.doExport() }, '📤 导出存档字符串'),
        h('textarea', { class: 'save-io', dataset: { id: 'io' }, placeholder: '在此粘贴导入字符串…', readonly: true }),
        h('div', { class: 'row wrap', style: { marginTop: '0.4rem' } },
          h('button', { class: 'btn-ghost', style: { flex: '1 1 45%' }, onClick: () => this.toggleIoInput() }, '✏️ 切换为输入'),
          h('button', { class: 'btn-jade', style: { flex: '1 1 45%' }, onClick: () => this.doImport() }, '📥 导入'),
          h('button', { class: 'btn-danger', style: { flex: '1 1 45%' }, onClick: () => this.confirmReset() }, '🗑️ 删除存档'),
        ),
      ),
      h('div', { class: 'muted', style: { textAlign: 'center' } }, '导出字符串可跨设备迁移你的进度；导入会覆盖当前存档。'),
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
    const p = this.player || loadGame();
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
    saveGame(p);
    this.toast('导入成功，即将载入', 'good');
    this.closeModal();
    this.enterGame(p);
  }

  confirmReset() {
    this.showSheet({
      title: '删除存档？',
      body: [h('div', { class: 'muted' }, '此存档将被永久删除，无法恢复。')],
      foot: [
        h('button', { class: 'btn-danger', onClick: () => { clearSave(); this.closeModal(); this.toast('存档已删除', 'normal'); this.showLauncher(); } }, '确认删除'),
        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '取消'),
      ],
    });
  }

  confirmExitToLauncher() {
    if (!this.player) { this.showLauncher(); return; }
    this.showSheet({
      title: '返回标题？',
      body: [h('div', { class: 'muted' }, '进度已自动保存，可随时从「继续游戏」回到这里。')],
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
