// ============================================================================
// 打卡 · UI 层（纯原生 DOM，无框架）
//
// CheckInUI：挂在任意容器，自管理「启动器（输入昵称）/ 主视图（日历打卡）」两态。
// 数据模型（见 core/checkin.js）：昵称档案 → 多个打卡任务 → 每任务独立打卡记录。
// 设计要点：
//  - 所有数据落 localStorage（store.js，按昵称归档）；UI 仅做渲染与事件分发。
//  - 主视图始终展示「当前任务」的打卡数据；点任务条可切换 / 新建 / 改名 / 删除任务。
//  - 今日另有醒目大按钮；日历今日格可直点；【过去日期】点击需二次确认才能补卡 / 取消。
//  - 每累计 10 天触发爱心庆祝动画；爱心集陈列已解锁与未解锁占位。
// ============================================================================
import './style.css';
import {
  NICKNAME_MIN_LEN, NICKNAME_MAX_LEN,
  TASK_NAME_MIN_LEN, TASK_NAME_MAX_LEN,
  HEARTS_STEP, WEEK_START, WEEKDAY_LABELS, MONTH_LABELS,
} from '../config.js';
import {
  isValidNickname, normalizeNickname, normalizeKey,
  toggleCheckin, isChecked, totalDays, heartsEarned,
  daysToNextHeart, heartProgress, currentStreak, longestStreak,
  listTasks, getTask, getActiveTask, setActiveTaskKey, ensureTask, renameTask, deleteTask,
  isValidTaskName, nowSec,
} from '../core/checkin.js';
import {
  _setStorage, loadAll, ensureProfile, upsertProfile, deleteProfile,
  renameProfile, listProfiles, getActiveKey, setActiveKey,
} from '../core/store.js';
import {
  todayDate, toISODate, parseISO, monthMatrix, isToday, isFuture, diffDays,
} from '../core/calendar.js';

export class CheckInUI {
  constructor(parent) {
    this.parent = parent;
    this.root = null;
    // 当前展示的年/月（可前后翻页），初始化为今天所在月。
    const t = todayDate();
    this.view = { year: t.getFullYear(), month: t.getMonth() };
    this.today = t; // 固定为构造时的「今天」，单测可构造后改写
    this.profile = null; // 当前激活档案（昵称容器）
    this._sheetOpen = false; // 档案管理弹层是否展开
    this._taskSheetOpen = false; // 任务管理弹层是否展开
    this._confirmOpen = false; // 二次确认弹层是否展开
    this._celebrating = false;
    // 各类延时句柄（toast / 弹层移除 / 庆祝自动收场），destroy 时统一清理。
    this._toastTimer = null;
    this._toastRemoveTimer = null;
    this._sheetTimer = null;
    this._taskSheetTimer = null;
    this._confirmTimer = null;
    this._celebrateTimer = null;
    this._celebrateRemoveTimer = null;
    // 暴露存档注入器，便于单测 / 调试
    this._setStorage = _setStorage;
  }

  mount() {
    this.root = document.createElement('div');
    this.root.className = 'daka-root';
    this.parent.appendChild(this.root);
    this._bindGlobal();
    this._restoreActive();
    this.render();
  }

  destroy() {
    // 先停下进行中的动画 / 弹层（会各自重置状态），再统一清理所有未触发的定时器，
    // 避免回调在实例销毁后命中已移除的 DOM / 旧引用。
    if (this._confirmOpen) this._closeConfirm(true);
    if (this._taskSheetOpen) this._closeTaskSheet(true);
    if (this._sheetOpen) this._closeSheet(true);
    if (this._celebrating) this._endCelebrate(true);
    for (const id of [this._toastTimer, this._toastRemoveTimer, this._sheetTimer, this._taskSheetTimer, this._confirmTimer, this._celebrateTimer, this._celebrateRemoveTimer]) {
      if (id) clearTimeout(id);
    }
    this._toastTimer = this._toastRemoveTimer = this._sheetTimer = this._taskSheetTimer = this._confirmTimer = this._celebrateTimer = this._celebrateRemoveTimer = null;
    if (this._keyHandler) {
      window.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
    this.root = null;
  }

  // 当前展示的任务（主视图所有打卡数据都取自它）。
  _activeTask() {
    return this.profile ? getActiveTask(this.profile) : null;
  }

  // —— 启动时恢复上次激活的档案 ——
  _restoreActive() {
    const key = getActiveKey();
    if (!key) return;
    const map = loadAll();
    if (map[key]) this.profile = map[key];
  }

  _bindGlobal() {
    this._keyHandler = (e) => {
      if (e.key === 'Escape') {
        if (this._celebrating) this._endCelebrate();
        else if (this._confirmOpen) this._closeConfirm();
        else if (this._taskSheetOpen) this._closeTaskSheet();
        else if (this._sheetOpen) this._closeSheet();
        return;
      }
      if (e.key === 'Enter') {
        // 中文输入法（拼音等）选词时的回车会以 key==='Enter' 冒泡，需忽略，否则会提前触发提交。
        if (e.isComposing) return;
        // 任务改名 / 任务新建 / 档案改名框都不在 <form> 内，回车等价于点「保存 / 新建」，
        // 与启动器昵称表单的回车提交保持一致。
        const el = e.target;
        const id = el && el.dataset && el.dataset.id;
        if (id === 'task-rename-input') {
          e.preventDefault();
          this._doTaskRename(el.dataset.key, el.value);
        } else if (id === 'task-new-input') {
          e.preventDefault();
          this._onTaskNew();
        } else if (id === 'sheet-rename-input') {
          e.preventDefault();
          this._doRename(el.dataset.key, el.value);
        }
      }
    };
    window.addEventListener('keydown', this._keyHandler);
    // 事件委托：所有点击统一在此分发，避免每次 render 重建监听。
    this._clickHandler = (e) => this._onClick(e);
    this.root.addEventListener('click', this._clickHandler);
    this._inputHandler = (e) => this._onInput(e);
    this.root.addEventListener('input', this._inputHandler);
    // 输入框按回车 = 提交（与点按钮等价）。点击按钮走 click 委托并阻止默认提交。
    this._submitHandler = (e) => {
      if (e.target.closest('[data-id="form"]')) {
        e.preventDefault();
        this._onStart(e);
      }
    };
    this.root.addEventListener('submit', this._submitHandler);
  }

  // ===================== 渲染入口 =====================
  render() {
    if (!this.root) return;
    this.root.innerHTML = '';
    if (this.profile) this._renderMain();
    else this._renderLauncher();
    this._renderToastHost();
  }

  // ===================== 启动器 =====================
  _renderLauncher() {
    const profiles = listProfiles();
    const items = profiles.map((p) => `
      <button class="profile-item" data-act="open" data-key="${esc(p.key)}" type="button">
        <span class="profile-item__avatar" aria-hidden="true">${esc(firstChar(p.nickname))}</span>
        <span class="profile-item__meta">
          <span class="profile-item__name">${esc(p.nickname)}</span>
          <span class="profile-item__sub">${p.taskCount} 个任务 · 累计 ${p.total} 天 · ${'♡'.repeat(Math.min(p.hearts, 8))}${p.hearts > 8 ? '…' : ''}</span>
        </span>
        <span class="profile-item__go" aria-hidden="true">›</span>
      </button>
    `).join('');

    this.root.insertAdjacentHTML('beforeend', `
      <section class="daka-launcher">
        <div class="launcher-hero">
          <div class="launcher-emoji" aria-hidden="true">♡</div>
          <h1 class="launcher-title">每日打卡</h1>
          <p class="launcher-sub">坚持的每一天，都开出一朵小花 🌸<br/>一个昵称下，可建多个打卡任务。</p>
        </div>
        <form class="launcher-form" data-id="form">
          <input
            class="launcher-input"
            data-id="nickname"
            type="text"
            autocomplete="off"
            maxlength="${NICKNAME_MAX_LEN * 2}"
            placeholder="输入你的昵称…"
            aria-label="昵称"
          />
          <button class="launcher-btn" data-act="start" type="submit">开始打卡 ♡</button>
        </form>
        ${profiles.length ? `<div class="launcher-list"><p class="launcher-list__title">我的档案</p>${items}</div>` : ''}
        <p class="launcher-hint">数据保存在本设备，可建多个昵称档案</p>
      </section>
    `);
    // 自动聚焦输入框（非触摸环境更友好；触摸环境不强制弹键盘）
    const input = this.root.querySelector('[data-id="nickname"]');
    if (input && !('ontouchstart' in window)) input.focus();
  }

  // ===================== 主视图 =====================
  _renderMain() {
    const p = this.profile;
    const task = this._activeTask();
    if (!task) return; // migrate 已保证至少一个任务，此处仅防御
    const todayISO = toISODate(this.today);
    const checkedToday = isChecked(task, todayISO);
    const total = totalDays(task);
    const hearts = heartsEarned(task);
    const streak = currentStreak(task, this.today);
    const best = longestStreak(task);
    const toNext = daysToNextHeart(task);
    const progress = heartProgress(task);
    const dateLabel = `${this.today.getMonth() + 1} 月 ${this.today.getDate()} 日`;

    this.root.insertAdjacentHTML('beforeend', `
      <section class="daka-main">
        <header class="daka-header">
          <div class="daka-nick">
            <span class="daka-nick__name" data-act="rename" title="点此改名">${esc(p.nickname)}</span>
            <span class="daka-nick__badge">♡ ${hearts}</span>
          </div>
          <button class="daka-switch" data-act="sheet" type="button" title="切换 / 管理档案">档案</button>
        </header>

        <button class="task-bar" data-act="task-sheet" type="button" title="切换 / 管理打卡任务">
          <span class="task-bar__icon" aria-hidden="true">✓</span>
          <span class="task-bar__name">${esc(task.name)}</span>
          <span class="task-bar__hint">切换任务</span>
          <span class="task-bar__chev" aria-hidden="true">›</span>
        </button>

        <div class="stats">
          <div class="stat">
            <span class="stat__num">${total}</span>
            <span class="stat__lbl">累计天数</span>
          </div>
          <div class="stat stat--accent">
            <span class="stat__num">${streak}</span>
            <span class="stat__lbl">连续打卡</span>
          </div>
          <div class="stat">
            <span class="stat__num">${best}</span>
            <span class="stat__lbl">最长连击</span>
          </div>
        </div>

        <button class="today-card ${checkedToday ? 'is-checked' : ''}" data-act="today" type="button">
          <span class="today-card__date">${dateLabel}</span>
          <span class="today-card__btn">
            ${checkedToday ? '✓ 今日已打卡' : '点此打卡'}
          </span>
        </button>

        <div class="progress">
          <div class="progress__top">
            <span class="progress__lbl">${toNext === HEARTS_STEP ? '下一颗爱心 ♡' : `距下一颗爱心还差 ${toNext} 天`}</span>
            <span class="progress__cnt">${total % HEARTS_STEP}/${HEARTS_STEP}</span>
          </div>
          <div class="progress__bar"><span class="progress__fill" style="width:${Math.round(progress * 100)}%"></span></div>
        </div>

        <div class="calendar" data-id="calendar">
          ${this._renderCalendarInner()}
        </div>

        <div class="hearts">
          <div class="hearts__head">
            <span class="hearts__title">爱心收藏</span>
            <span class="hearts__cnt">已收集 ${hearts} 颗</span>
          </div>
          <div class="hearts__grid">${this._renderHeartsInner(hearts)}</div>
        </div>
      </section>
    `);
  }

  _renderCalendarInner() {
    const { year, month } = this.view;
    const { cells } = monthMatrix(year, month, WEEK_START);
    const task = this._activeTask();
    const head = WEEKDAY_LABELS.map((w) => `<span class="cal-dow">${w}</span>`).join('');
    const grid = cells.map((d) => {
      const iso = toISODate(d);
      const inMonth = d.getMonth() === month;
      const checked = isChecked(task, iso);
      const today = isToday(d, this.today);
      const future = isFuture(d, this.today);
      const past = diffDays(this.today, d) < 0; // 过去日：点击需二次确认
      const cls = [
        'day',
        inMonth ? '' : 'day--out',
        checked ? 'is-checked' : '',
        today ? 'is-today' : '',
        future ? 'is-future' : '',
        past ? 'is-past' : '',
      ].filter(Boolean).join(' ');
      return `<button class="${cls}" data-act="day" data-iso="${iso}" type="button"${future ? ' disabled' : ''}>
        <span class="day__num">${d.getDate()}</span>
        ${checked ? '<span class="day__heart" aria-hidden="true">♡</span>' : ''}
      </button>`;
    }).join('');
    return `
      <div class="cal-nav">
        <button class="cal-nav__btn" data-act="prev-month" type="button" aria-label="上一月">‹</button>
        <span class="cal-nav__title">${year} 年 ${MONTH_LABELS[month]}</span>
        <button class="cal-nav__btn" data-act="next-month" type="button" aria-label="下一月">›</button>
      </div>
      <div class="cal-weekdays">${head}</div>
      <div class="cal-grid">${grid}</div>
    `;
  }

  // 局部刷新日历（保留翻页位置，避免整页重渲染打断动画）。
  _refreshCalendar() {
    const cal = this.root.querySelector('[data-id="calendar"]');
    if (cal) cal.innerHTML = this._renderCalendarInner();
  }

  _renderHeartsInner(hearts) {
    // 至少展示若干格占位，让「未解锁」可视化（业界惯例：可见目标更激励坚持）。
    const slots = Math.max(hearts + 4, 6);
    let html = '';
    for (let i = 0; i < slots; i++) {
      const unlocked = i < hearts;
      html += `<span class="heart-slot ${unlocked ? 'is-on' : ''}" aria-label="${unlocked ? '已解锁爱心' : '未解锁'}">
        ${unlocked ? '♥' : '♡'}
      </span>`;
    }
    return html;
  }

  // ===================== 事件分发 =====================
  _onClick(e) {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    switch (act) {
      case 'start': this._onStart(e); break;
      case 'open': this._onOpenProfile(btn.dataset.key); break;
      case 'today': this._onToggleToday(); break;
      case 'day': this._onToggleDay(btn.dataset.iso); break;
      case 'prev-month': this._shiftMonth(-1); break;
      case 'next-month': this._shiftMonth(1); break;
      case 'sheet': this._openSheet(); break;
      case 'close-sheet': this._closeSheet(); break;
      case 'rename': this._onRenameClick(); break;
      case 'sheet-open': this._onOpenProfile(btn.dataset.key); break;
      case 'sheet-new': this._onNewFromSheet(); break;
      case 'sheet-rename': this._onSheetRename(btn.dataset.key); break;
      case 'sheet-delete': this._onSheetDelete(btn.dataset.key); break;
      case 'task-sheet': this._openTaskSheet(); break;
      case 'close-task-sheet': this._closeTaskSheet(); break;
      case 'task-open': this._onTaskOpen(btn.dataset.key); break;
      case 'task-rename': this._onTaskRename(btn.dataset.key); break;
      case 'task-delete': this._onTaskDelete(btn.dataset.key); break;
      case 'task-new': this._onTaskNew(); break;
      case 'confirm-ok': this._onConfirmOk(); break;
      case 'confirm-cancel': this._closeConfirm(); break;
      default: break;
    }
  }

  _onInput(e) {
    const el = e.target;
    if (el.dataset.id === 'rename-input'
        || el.dataset.id === 'sheet-rename-input'
        || el.dataset.id === 'task-rename-input'
        || el.dataset.id === 'task-new-input') {
      // 实时截断长度，防止超长
      const max = el.dataset.id === 'task-rename-input' || el.dataset.id === 'task-new-input' ? TASK_NAME_MAX_LEN : NICKNAME_MAX_LEN;
      const chars = [...el.value];
      if (chars.length > max) el.value = chars.slice(0, max).join('');
    }
  }

  // —— 启动器：开始打卡（输入昵称 → 建档 / 进入）——
  _onStart(e) {
    e.preventDefault();
    const input = this.root.querySelector('[data-id="nickname"]');
    const raw = input ? input.value : '';
    if (!isValidNickname(raw, NICKNAME_MIN_LEN, NICKNAME_MAX_LEN)) {
      this._toast(`昵称需 ${NICKNAME_MIN_LEN}~${NICKNAME_MAX_LEN} 个字`);
      if (input) input.focus();
      return;
    }
    const name = normalizeNickname(raw, NICKNAME_MAX_LEN);
    const p = ensureProfile(name);
    this.profile = p;
    setActiveKey(p.key);
    // 进入时定位到当月
    const t = todayDate();
    this.view = { year: t.getFullYear(), month: t.getMonth() };
    this.render();
    this._toast(`欢迎，${p.nickname} ♡`);
  }

  _onOpenProfile(key) {
    const map = loadAll();
    const p = map[normalizeKey(key)];
    if (!p) { this._toast('档案不见了'); return; }
    this.profile = p;
    setActiveKey(p.key);
    this._closeSheet();
    const t = todayDate();
    this.view = { year: t.getFullYear(), month: t.getMonth() };
    this.render();
  }

  _onNewFromSheet() {
    this._closeSheet();
    this.profile = null;
    setActiveKey(null);
    this.render();
  }

  // —— 今日大按钮：切换今日打卡（无需二次确认）——
  _onToggleToday() {
    const iso = toISODate(this.today);
    this._applyToggle(iso);
  }

  _onToggleDay(iso) {
    if (!this.profile) return;
    // 今日格可直点；【过去日期】需二次确认才能补卡 / 取消，避免误触改历史。
    const dt = parseISO(iso);
    const isPast = dt && diffDays(this.today, dt) < 0;
    if (!isPast) {
      this._applyToggle(iso);
      return;
    }
    const task = this._activeTask();
    const willCheck = !isChecked(task, iso);
    const label = this._fmtISO(iso);
    this._confirm({
      title: willCheck ? '补打卡' : '取消打卡',
      message: willCheck ? `确定为 ${label} 补打卡吗？` : `确定取消 ${label} 的打卡吗？`,
      confirmText: willCheck ? '确认补卡' : '确认取消',
      danger: !willCheck,
      onConfirm: () => this._applyToggle(iso),
    });
  }

  _applyToggle(iso) {
    if (!this.profile) return;
    const task = this._activeTask();
    if (!task) return;
    const before = isChecked(task, iso);
    const { task: nextTask, checked, milestone } = toggleCheckin(task, iso, this.today);
    // 写回档案内对应任务槽位，并刷新活跃指针 / 最近活跃时间。
    this.profile.tasks[nextTask.key] = nextTask;
    this.profile.activeTaskKey = nextTask.key;
    this.profile.lastSeen = nowSec();
    const saved = upsertProfile(this.profile);
    // 仅刷新日历格子 + 今日卡 + 统计 + 爱心 + 进度（局部刷新，体验顺滑）。
    this._refreshInteractive();
    if (milestone && checked) {
      this._celebrate(heartsEarned(nextTask));
    } else if (checked) {
      this._toast(before ? '' : '打卡成功 ♡');
    } else {
      this._toast('已取消打卡');
    }
    // 持久化失败（配额满 / 隐私模式）：内存态已切换但落盘失败，提示用户避免虚假成功。
    if (!saved) this._toast('存储写入失败，请检查浏览器存储空间');
  }

  // 局部刷新：任务条 + 日历 + 今日卡 + 统计 + 进度 + 爱心。比整页重渲染更稳。
  _refreshInteractive() {
    const task = this._activeTask();
    if (!task) return;
    const todayISO = toISODate(this.today);
    const checkedToday = isChecked(task, todayISO);
    const total = totalDays(task);
    const hearts = heartsEarned(task);
    const streak = currentStreak(task, this.today);
    const best = longestStreak(task);
    const toNext = daysToNextHeart(task);
    const progress = heartProgress(task);

    this._refreshCalendar();

    const taskName = this.root.querySelector('.task-bar__name');
    if (taskName) taskName.textContent = task.name;

    const todayCard = this.root.querySelector('.today-card');
    if (todayCard) {
      todayCard.classList.toggle('is-checked', checkedToday);
      const btn = todayCard.querySelector('.today-card__btn');
      if (btn) btn.textContent = checkedToday ? '✓ 今日已打卡' : '点此打卡';
    }

    const stats = this.root.querySelectorAll('.stat');
    if (stats.length >= 3) {
      stats[0].querySelector('.stat__num').textContent = total;
      stats[1].querySelector('.stat__num').textContent = streak;
      stats[2].querySelector('.stat__num').textContent = best;
    }

    const progTop = this.root.querySelector('.progress__lbl');
    const progCnt = this.root.querySelector('.progress__cnt');
    const progFill = this.root.querySelector('.progress__fill');
    if (progTop) progTop.textContent = toNext === HEARTS_STEP ? '下一颗爱心 ♡' : `距下一颗爱心还差 ${toNext} 天`;
    if (progCnt) progCnt.textContent = `${total % HEARTS_STEP}/${HEARTS_STEP}`;
    if (progFill) progFill.style.width = `${Math.round(progress * 100)}%`;

    const badge = this.root.querySelector('.daka-nick__badge');
    if (badge) badge.textContent = `♡ ${hearts}`;

    const heartsGrid = this.root.querySelector('.hearts__grid');
    if (heartsGrid) heartsGrid.innerHTML = this._renderHeartsInner(hearts);
    const heartsCnt = this.root.querySelector('.hearts__cnt');
    if (heartsCnt) heartsCnt.textContent = `已收集 ${hearts} 颗`;
  }

  _shiftMonth(delta) {
    let { year, month } = this.view;
    month += delta;
    if (month < 0) { month = 11; year--; }
    else if (month > 11) { month = 0; year++; }
    this.view = { year, month };
    // 不允许翻到「今天所在月之后」太远（仅约束未来，避免空荡的远期月份）。
    const ty = this.today.getFullYear();
    const tm = this.today.getMonth();
    if (year > ty || (year === ty && month > tm)) {
      this.view = { year: ty, month: tm };
      this._toast('已经是最新月份啦');
      return;
    }
    this._refreshCalendar();
  }

  // —— 今日卡上点击昵称旁的改名入口（主视图 header 的昵称） ——
  _onRenameClick() {
    if (!this.profile) return;
    this._openSheet({ focusRename: this.profile.key });
  }

  // 把 'YYYY-MM-DD' 格式化为「X 月 Y 日」展示。
  _fmtISO(iso) {
    const d = parseISO(iso);
    if (!d) return iso;
    return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  }

  // 在指定弹层容器内按 act + 精确 key 查找按钮。
  // 不把用户态 key 拼进 CSS 选择器——key 含 " \ ] 等字符会让
  // querySelector('[data-key="…"]') 抛 SyntaxError，导致改名/删除静默失效。
  _findBtn(container, act, key) {
    if (!container) return null;
    const btns = container.querySelectorAll(`[data-act="${act}"]`);
    for (const b of btns) {
      if (b.dataset.key === key) return b;
    }
    return null;
  }

  // ===================== 档案管理弹层（昵称级）=====================
  _openSheet(opts = {}) {
    this._closeSheet(true);
    const profiles = listProfiles();
    const items = profiles.map((p) => {
      const active = this.profile && p.key === this.profile.key;
      return `
        <div class="sheet-row ${active ? 'is-active' : ''}">
          <button class="sheet-row__main" data-act="sheet-open" data-key="${esc(p.key)}" type="button">
            <span class="sheet-row__avatar" aria-hidden="true">${esc(firstChar(p.nickname))}</span>
            <span class="sheet-row__meta">
              <span class="sheet-row__name">${esc(p.nickname)}${active ? ' <em>当前</em>' : ''}</span>
              <span class="sheet-row__sub">${p.taskCount} 个任务 · 累计 ${p.total} 天 · ${p.hearts} 颗爱心</span>
            </span>
          </button>
          <button class="sheet-row__icon" data-act="sheet-rename" data-key="${esc(p.key)}" type="button" title="改名" aria-label="改名">✎</button>
          <button class="sheet-row__icon sheet-row__icon--danger" data-act="sheet-delete" data-key="${esc(p.key)}" type="button" title="删除" aria-label="删除">✕</button>
        </div>
      `;
    }).join('');
    const el = document.createElement('div');
    el.className = 'sheet';
    el.innerHTML = `
      <div class="sheet__backdrop" data-act="close-sheet"></div>
      <div class="sheet__panel" role="dialog" aria-label="档案管理">
        <div class="sheet__head">
          <span class="sheet__title">档案管理</span>
          <button class="sheet__close" data-act="close-sheet" type="button" aria-label="关闭">✕</button>
        </div>
        <div class="sheet__body">
          ${items || '<p class="sheet__empty">还没有档案</p>'}
        </div>
        <div class="sheet__foot">
          <button class="sheet__new" data-act="sheet-new" type="button">＋ 新建档案</button>
        </div>
      </div>
    `;
    this.root.appendChild(el);
    this._sheetEl = el;
    this._sheetOpen = true;
    requestFrame(() => el.classList.add('is-open'));
    if (opts.focusRename) {
      requestFrame(() => this._onSheetRename(opts.focusRename));
    }
  }

  _closeSheet(silent = false) {
    if (!this._sheetEl) return;
    const el = this._sheetEl;
    this._sheetEl = null;
    this._sheetOpen = false;
    el.classList.remove('is-open');
    if (this._sheetTimer) clearTimeout(this._sheetTimer);
    this._sheetTimer = setTimeout(() => {
      this._sheetTimer = null;
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 200);
    void silent;
  }

  _onSheetRename(key) {
    const btn = this._findBtn(this._sheetEl, 'sheet-rename', key);
    const row = btn && btn.closest('.sheet-row');
    if (!row) return;
    if (row.querySelector('.sheet-rename')) return; // 已展开
    // 回填值直接取原始数据源，而非从 DOM 文本反推——
    // 否则昵称本身含「当前」二字（如「当前测试」）会被正则从内部截断。
    const prof = loadAll()[normalizeKey(key)];
    const current = prof ? prof.nickname : '';
    const wrap = document.createElement('div');
    wrap.className = 'sheet-rename';
    wrap.innerHTML = `
      <input class="sheet-rename__input" data-id="sheet-rename-input" data-key="${esc(key)}" type="text" maxlength="${NICKNAME_MAX_LEN * 2}" value="${esc(current)}" aria-label="新昵称" />
      <button class="sheet-rename__ok" data-act="sheet-rename-ok" data-key="${esc(key)}" type="button">保存</button>
    `;
    row.appendChild(wrap);
    const input = wrap.querySelector('input');
    if (input) { input.focus(); input.select(); }
    // 委托里没有 sheet-rename-ok，补一个监听
    wrap.querySelector('.sheet-rename__ok').addEventListener('click', (e) => {
      e.stopPropagation();
      this._doRename(key, input.value);
    });
  }

  _doRename(key, value) {
    if (!isValidNickname(value, NICKNAME_MIN_LEN, NICKNAME_MAX_LEN)) {
      this._toast(`昵称需 ${NICKNAME_MIN_LEN}~${NICKNAME_MAX_LEN} 个字`);
      return;
    }
    const name = normalizeNickname(value, NICKNAME_MAX_LEN);
    const ok = renameProfile(key, name);
    if (!ok) { this._toast('该昵称已被占用'); return; }
    // 重命名可能改了 key，重新加载当前档案
    if (this.profile && normalizeKey(key) === this.profile.key) {
      this.profile = loadAll()[normalizeKey(name)] || this.profile;
      setActiveKey(this.profile.key);
    }
    this._closeSheet();
    this.render();
    // toast 必须在 render() 之后：render 首行清空 root.innerHTML 会把旧 toast-host
    //（连同刚 append 的 toast 元素）一并抹掉，requestFrame 还没触发元素就已离屏。
    this._toast('已改名 ♡');
  }

  _onSheetDelete(key) {
    const map = loadAll();
    const p = map[normalizeKey(key)];
    if (!p) return;
    // 二次确认：点一次变红「确认删除」，再点一次才真删。
    const delBtn = this._findBtn(this._sheetEl, 'sheet-delete', key);
    if (delBtn && !delBtn.classList.contains('is-armed')) {
      delBtn.classList.add('is-armed');
      delBtn.textContent = '确认?';
      setTimeout(() => {
        if (delBtn.classList.contains('is-armed')) {
          delBtn.classList.remove('is-armed');
          delBtn.textContent = '✕';
        }
      }, 2200);
      return;
    }
    deleteProfile(key);
    if (this.profile && normalizeKey(key) === this.profile.key) {
      this.profile = null;
    }
    this._closeSheet();
    this.render();
    // toast 放在 render() 之后，避免被重渲染擦除（见 _doRename 同款注释）。
    this._toast('已删除档案');
  }

  // ===================== 任务管理弹层（任务级，挂在当前昵称下）=====================
  _openTaskSheet() {
    if (!this.profile) return;
    this._closeTaskSheet(true);
    this._renderTaskSheet();
  }

  _renderTaskSheet() {
    const profile = this.profile;
    const tasks = listTasks(profile);
    const items = tasks.map((t) => {
      const active = t.key === profile.activeTaskKey;
      const hearts = heartsEarned(t);
      const total = totalDays(t);
      const last = tasks.length <= 1;
      return `
        <div class="sheet-row ${active ? 'is-active' : ''}">
          <button class="sheet-row__main" data-act="task-open" data-key="${esc(t.key)}" type="button">
            <span class="sheet-row__avatar sheet-row__avatar--task" aria-hidden="true">✓</span>
            <span class="sheet-row__meta">
              <span class="sheet-row__name">${esc(t.name)}${active ? ' <em>当前</em>' : ''}</span>
              <span class="sheet-row__sub">累计 ${total} 天 · ${hearts} 颗爱心</span>
            </span>
          </button>
          <button class="sheet-row__icon" data-act="task-rename" data-key="${esc(t.key)}" type="button" title="改名" aria-label="改名">✎</button>
          <button class="sheet-row__icon sheet-row__icon--danger" data-act="task-delete" data-key="${esc(t.key)}" type="button" title="${last ? '至少保留一个任务' : '删除'}" aria-label="删除" ${last ? 'disabled' : ''}>✕</button>
        </div>
      `;
    }).join('');
    const el = document.createElement('div');
    el.className = 'sheet';
    el.innerHTML = `
      <div class="sheet__backdrop" data-act="close-task-sheet"></div>
      <div class="sheet__panel" role="dialog" aria-label="打卡任务管理">
        <div class="sheet__head">
          <span class="sheet__title">打卡任务</span>
          <button class="sheet__close" data-act="close-task-sheet" type="button" aria-label="关闭">✕</button>
        </div>
        <div class="sheet__body">
          ${items || '<p class="sheet__empty">还没有任务</p>'}
        </div>
        <div class="sheet__foot sheet__foot--form">
          <input class="sheet__input" data-id="task-new-input" type="text" maxlength="${TASK_NAME_MAX_LEN * 2}" placeholder="新任务名（如 跑步 / 读书）" aria-label="新任务名" />
          <button class="sheet__new" data-act="task-new" type="button">＋ 新建</button>
        </div>
      </div>
    `;
    this.root.appendChild(el);
    this._taskSheetEl = el;
    this._taskSheetOpen = true;
    requestFrame(() => el.classList.add('is-open'));
    const input = el.querySelector('[data-id="task-new-input"]');
    if (input && !('ontouchstart' in window)) input.focus();
  }

  _closeTaskSheet(silent = false) {
    if (!this._taskSheetEl) return;
    const el = this._taskSheetEl;
    this._taskSheetEl = null;
    this._taskSheetOpen = false;
    el.classList.remove('is-open');
    if (this._taskSheetTimer) clearTimeout(this._taskSheetTimer);
    this._taskSheetTimer = setTimeout(() => {
      this._taskSheetTimer = null;
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 200);
    void silent;
  }

  // 切换任务后整页重渲染（数据全变了，局部刷新不如重画稳妥）。
  _onTaskOpen(key) {
    if (!setActiveTaskKey(this.profile, key)) { this._toast('任务不见了'); return; }
    this.profile.lastSeen = nowSec();
    upsertProfile(this.profile);
    this._closeTaskSheet();
    this.render();
  }

  _onTaskRename(key) {
    const btn = this._findBtn(this._taskSheetEl, 'task-rename', key);
    const row = btn && btn.closest('.sheet-row');
    if (!row) return;
    if (row.querySelector('.sheet-rename')) return; // 已展开
    // 回填值直接取原始数据源，而非从 DOM 文本反推——
    // 否则任务名本身含「当前」二字（如「当前进度」）会被正则从内部截断。
    const task = getTask(this.profile, key);
    const current = task ? task.name : '';
    const wrap = document.createElement('div');
    wrap.className = 'sheet-rename';
    wrap.innerHTML = `
      <input class="sheet-rename__input" data-id="task-rename-input" data-key="${esc(key)}" type="text" maxlength="${TASK_NAME_MAX_LEN * 2}" value="${esc(current)}" aria-label="新任务名" />
      <button class="sheet-rename__ok" data-act="task-rename-ok" data-key="${esc(key)}" type="button">保存</button>
    `;
    row.appendChild(wrap);
    const input = wrap.querySelector('input');
    if (input) { input.focus(); input.select(); }
    wrap.querySelector('.sheet-rename__ok').addEventListener('click', (e) => {
      e.stopPropagation();
      this._doTaskRename(key, input.value);
    });
  }

  _doTaskRename(key, value) {
    if (!isValidTaskName(value, TASK_NAME_MIN_LEN, TASK_NAME_MAX_LEN)) {
      this._toast(`任务名需 ${TASK_NAME_MIN_LEN}~${TASK_NAME_MAX_LEN} 个字`);
      return;
    }
    const r = renameTask(this.profile, key, value);
    if (!r.ok) {
      this._toast(r.error === 'dup' ? '该任务名已存在' : '改名失败');
      return;
    }
    this.profile.lastSeen = nowSec();
    upsertProfile(this.profile);
    this._closeTaskSheet();
    this.render();
    // toast 放在 render() 之后，避免被重渲染擦除（与 _onTaskNew 成功分支一致）。
    this._toast('已改名 ♡');
  }

  _onTaskDelete(key) {
    // 二次确认：点一次变红「确认删除」，再点一次才真删。
    const delBtn = this._findBtn(this._taskSheetEl, 'task-delete', key);
    if (delBtn && delBtn.disabled) return; // 仅剩一个任务时不允许删
    if (delBtn && !delBtn.classList.contains('is-armed')) {
      delBtn.classList.add('is-armed');
      delBtn.textContent = '确认?';
      setTimeout(() => {
        if (delBtn.classList.contains('is-armed')) {
          delBtn.classList.remove('is-armed');
          delBtn.textContent = '✕';
        }
      }, 2200);
      return;
    }
    const r = deleteTask(this.profile, key);
    if (!r.ok) {
      this._toast(r.error === 'last' ? '至少保留一个任务' : '删除失败');
      return;
    }
    this.profile.lastSeen = nowSec();
    upsertProfile(this.profile);
    this._closeTaskSheet();
    this.render();
    // toast 放在 render() 之后，避免被重渲染擦除（见 _doTaskRename 同款注释）。
    this._toast('已删除任务');
  }

  _onTaskNew() {
    const input = this._taskSheetEl && this._taskSheetEl.querySelector('[data-id="task-new-input"]');
    const raw = input ? input.value : '';
    if (!isValidTaskName(raw, TASK_NAME_MIN_LEN, TASK_NAME_MAX_LEN)) {
      this._toast(`任务名需 ${TASK_NAME_MIN_LEN}~${TASK_NAME_MAX_LEN} 个字`);
      if (input) input.focus();
      return;
    }
    const { task, created } = ensureTask(this.profile, raw);
    if (!task) { this._toast('新建失败'); return; }
    this.profile.lastSeen = nowSec();
    upsertProfile(this.profile);
    this._closeTaskSheet();
    this.render();
    // toast 放在 render() 之后：成功 / 重名两条分支都需在此提示，否则会被重渲染擦除。
    if (created) this._toast(`已新建任务「${task.name}」♡`);
    else this._toast('该任务已存在');
  }

  // ===================== 二次确认弹层（过去日期补卡 / 取消）=====================
  _confirm({ title, message, confirmText = '确认', cancelText = '取消', danger = false, onConfirm }) {
    this._closeConfirm(true);
    const el = document.createElement('div');
    el.className = 'confirm';
    el.innerHTML = `
      <div class="confirm__backdrop" data-act="confirm-cancel"></div>
      <div class="confirm__panel ${danger ? 'is-danger' : ''}" role="alertdialog" aria-label="${esc(title)}">
        <div class="confirm__title">${esc(title)}</div>
        <div class="confirm__msg">${esc(message)}</div>
        <div class="confirm__actions">
          <button class="confirm__btn confirm__btn--cancel" data-act="confirm-cancel" type="button">${esc(cancelText)}</button>
          <button class="confirm__btn confirm__btn--ok ${danger ? 'is-danger' : ''}" data-act="confirm-ok" type="button">${esc(confirmText)}</button>
        </div>
      </div>
    `;
    this.root.appendChild(el);
    this._confirmEl = el;
    this._confirmOpen = true;
    this._confirmOnOk = onConfirm;
    requestFrame(() => el.classList.add('is-open'));
  }

  _onConfirmOk() {
    const cb = this._confirmOnOk;
    this._closeConfirm();
    if (typeof cb === 'function') cb();
  }

  _closeConfirm(silent = false) {
    if (!this._confirmEl) return;
    const el = this._confirmEl;
    this._confirmEl = null;
    this._confirmOpen = false;
    this._confirmOnOk = null;
    el.classList.remove('is-open');
    if (this._confirmTimer) clearTimeout(this._confirmTimer);
    this._confirmTimer = setTimeout(() => {
      this._confirmTimer = null;
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 200);
    void silent;
  }

  // ===================== 庆祝动画（每 10 天） =====================
  _celebrate(heartCount) {
    if (!this.root) return;
    this._endCelebrate(true);
    const overlay = document.createElement('div');
    overlay.className = 'celebrate';
    overlay.setAttribute('data-id', 'celebrate');
    // 飞散的小心心：位置由 index 决定，无随机依赖，便于冒烟测试稳定。
    const hearts = Array.from({ length: 14 }, (_, i) => {
      const left = 8 + (i * 6) % 84;
      const delay = (i % 7) * 90;
      const dur = 1100 + (i % 5) * 160;
      return `<span class="celebrate__particle" style="left:${left}%;animation-delay:${delay}ms;animation-duration:${dur}ms">${i % 2 ? '♥' : '♡'}</span>`;
    }).join('');
    overlay.innerHTML = `
      <div class="celebrate__particles">${hearts}</div>
      <div class="celebrate__card">
        <div class="celebrate__bigheart">♥</div>
        <div class="celebrate__title">第 ${heartCount * HEARTS_STEP} 天！</div>
        <div class="celebrate__sub">收获第 ${heartCount} 颗爱心 🎉</div>
        <button class="celebrate__btn" data-act="celebrate-ok" type="button">好耶 ♡</button>
      </div>
    `;
    this.root.appendChild(overlay);
    this._celebrateEl = overlay;
    this._celebrating = true;
    requestFrame(() => overlay.classList.add('is-open'));
    // 给「好耶」按钮单独绑定（委托已在 root，其实也会命中；这里只是兼容 ESC / 自动收场）
    overlay.querySelector('[data-act="celebrate-ok"]').addEventListener('click', () => this._endCelebrate());
    this._celebrateTimer = setTimeout(() => this._endCelebrate(), 3600);
  }

  _endCelebrate(skipToast = false) {
    if (this._celebrateTimer) { clearTimeout(this._celebrateTimer); this._celebrateTimer = null; }
    const el = this._celebrateEl;
    if (!el) { this._celebrating = false; return; }
    this._celebrateEl = null;
    this._celebrating = false;
    el.classList.remove('is-open');
    if (this._celebrateRemoveTimer) clearTimeout(this._celebrateRemoveTimer);
    this._celebrateRemoveTimer = setTimeout(() => {
      this._celebrateRemoveTimer = null;
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 300);
    if (!skipToast) this._toast('继续加油，下一颗爱心在路上 ♡');
  }

  // ===================== Toast =====================
  _renderToastHost() {
    const host = document.createElement('div');
    host.className = 'toast-host';
    host.setAttribute('data-id', 'toast-host');
    this.root.appendChild(host);
    this._toastHost = host;
  }

  _toast(msg) {
    if (!msg || !this._toastHost) return;
    if (this._toastTimer) { clearTimeout(this._toastTimer); this._toastTimer = null; }
    if (this._toastRemoveTimer) { clearTimeout(this._toastRemoveTimer); this._toastRemoveTimer = null; }
    this._toastHost.innerHTML = '';
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    this._toastHost.appendChild(t);
    requestFrame(() => t.classList.add('is-show'));
    this._toastTimer = setTimeout(() => {
      this._toastTimer = null;
      t.classList.remove('is-show');
      this._toastRemoveTimer = setTimeout(() => {
        this._toastRemoveTimer = null;
        if (t.parentNode) t.parentNode.removeChild(t);
      }, 250);
    }, 1800);
  }
}

// ===================== 小工具 =====================
// 转义 HTML，防止昵称 / 任务名含 < > & " 撑破 DOM / XSS。
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
// 取昵称首字作为头像（支持中文 / emoji 首码点）。
function firstChar(s) {
  const chars = [...String(s || '')];
  return chars[0] || '?';
}
// 下一帧（jsdom 下回退到 setTimeout）。
function requestFrame(fn) {
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(fn);
  else setTimeout(fn, 0);
}
