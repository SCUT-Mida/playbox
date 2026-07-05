// ============================================================================
// 打卡 · UI 层（纯原生 DOM，无框架）
//
// CheckInUI：挂在任意容器，自管理「启动器（输入昵称）/ 主视图（日历打卡）」两态。
// 设计要点：
//  - 所有数据落 localStorage（store.js，按昵称归档）；UI 仅做渲染与事件分发。
//  - 日期格子可点击打卡 / 取消（未来日禁用）；今日另有醒目大按钮。
//  - 每累计 10 天触发爱心庆祝动画；爱心集陈列已解锁与未解锁占位。
// ============================================================================
import './style.css';
import { NICKNAME_MIN_LEN, NICKNAME_MAX_LEN, HEARTS_STEP, WEEK_START, WEEKDAY_LABELS, MONTH_LABELS } from '../config.js';
import {
  newProfile, isValidNickname, normalizeNickname, normalizeKey,
  toggleCheckin, isChecked, isCheckedToday, totalDays, heartsEarned,
  daysToNextHeart, heartProgress, currentStreak, longestStreak,
} from '../core/checkin.js';
import {
  _setStorage, loadAll, ensureProfile, upsertProfile, deleteProfile,
  renameProfile, listProfiles, getActiveKey, setActiveKey,
} from '../core/store.js';
import {
  todayDate, toISODate, monthMatrix, isToday, isFuture, diffDays,
} from '../core/calendar.js';

export class CheckInUI {
  constructor(parent) {
    this.parent = parent;
    this.root = null;
    // 当前展示的年/月（可前后翻页），初始化为今天所在月。
    const t = todayDate();
    this.view = { year: t.getFullYear(), month: t.getMonth() };
    this.today = t; // 固定为构造时的「今天」，单测可构造后改写
    this.profile = null; // 当前激活档案
    this._sheetOpen = false; // 档案管理弹层是否展开
    this._celebrating = false;
    this._toastTimer = null;
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
    if (this._toastTimer) { clearTimeout(this._toastTimer); this._toastTimer = null; }
    if (this._keyHandler) {
      window.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
    this.root = null;
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
        else if (this._sheetOpen) this._closeSheet();
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
          <span class="profile-item__sub">累计 ${p.total} 天 · ${'♡'.repeat(Math.min(p.hearts, 8))}${p.hearts > 8 ? '…' : ''}</span>
        </span>
        <span class="profile-item__go" aria-hidden="true">›</span>
      </button>
    `).join('');

    this.root.insertAdjacentHTML('beforeend', `
      <section class="daka-launcher">
        <div class="launcher-hero">
          <div class="launcher-emoji" aria-hidden="true">♡</div>
          <h1 class="launcher-title">每日打卡</h1>
          <p class="launcher-sub">坚持的每一天，都开出一朵小花 🌸<br/>每累计 10 天，收获一颗爱心。</p>
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
    const todayISO = toISODate(this.today);
    const checkedToday = isChecked(p, todayISO);
    const total = totalDays(p);
    const hearts = heartsEarned(p);
    const streak = currentStreak(p, this.today);
    const best = longestStreak(p);
    const toNext = daysToNextHeart(p);
    const progress = heartProgress(p);
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
    const p = this.profile;
    const head = WEEKDAY_LABELS.map((w) => `<span class="cal-dow">${w}</span>`).join('');
    const grid = cells.map((d) => {
      const iso = toISODate(d);
      const inMonth = d.getMonth() === month;
      const checked = isChecked(p, iso);
      const today = isToday(d, this.today);
      const future = isFuture(d, this.today);
      const cls = [
        'day',
        inMonth ? '' : 'day--out',
        checked ? 'is-checked' : '',
        today ? 'is-today' : '',
        future ? 'is-future' : '',
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
      default: break;
    }
  }

  _onInput(e) {
    const el = e.target;
    if (el.dataset.id === 'rename-input' || el.dataset.id === 'sheet-rename-input') {
      // 实时截断长度，防止超长
      const max = NICKNAME_MAX_LEN;
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

  // —— 今日大按钮：切换今日打卡 ——
  _onToggleToday() {
    const iso = toISODate(this.today);
    this._applyToggle(iso);
  }

  _onToggleDay(iso) {
    this._applyToggle(iso);
  }

  _applyToggle(iso) {
    if (!this.profile) return;
    const before = isChecked(this.profile, iso);
    const { profile, checked, milestone } = toggleCheckin(this.profile, iso, this.today);
    this.profile = profile;
    upsertProfile(profile);
    // 仅刷新日历格子 + 今日卡 + 统计 + 爱心 + 进度（局部刷新，体验顺滑）。
    this._refreshInteractive();
    if (milestone && checked) {
      this._celebrate(heartsEarned(profile));
    } else if (checked) {
      this._toast(before ? '' : '打卡成功 ♡');
    } else {
      this._toast('已取消今日打卡');
    }
  }

  // 局部刷新：日历 + 今日卡 + 统计 + 进度 + 爱心。比整页重渲染更稳。
  _refreshInteractive() {
    const p = this.profile;
    if (!p) return;
    const todayISO = toISODate(this.today);
    const checkedToday = isChecked(p, todayISO);
    const total = totalDays(p);
    const hearts = heartsEarned(p);
    const streak = currentStreak(p, this.today);
    const best = longestStreak(p);
    const toNext = daysToNextHeart(p);
    const progress = heartProgress(p);

    this._refreshCalendar();

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

  // ===================== 档案管理弹层 =====================
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
              <span class="sheet-row__sub">累计 ${p.total} 天 · ${p.hearts} 颗爱心</span>
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
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 200);
    void silent;
  }

  _onSheetRename(key) {
    const row = this._sheetEl && this._sheetEl.querySelector(`[data-act="sheet-rename"][data-key="${cssEscape(key)}"]`)?.closest('.sheet-row');
    if (!row) return;
    if (row.querySelector('.sheet-rename')) return; // 已展开
    const nameEl = row.querySelector('.sheet-row__name');
    const current = nameEl ? nameEl.textContent.replace(/\s*当前.*$/, '').trim() : '';
    const wrap = document.createElement('div');
    wrap.className = 'sheet-rename';
    wrap.innerHTML = `
      <input class="sheet-rename__input" data-id="sheet-rename-input" type="text" maxlength="${NICKNAME_MAX_LEN * 2}" value="${esc(current)}" aria-label="新昵称" />
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
    this._toast('已改名 ♡');
    this._closeSheet();
    this.render();
  }

  _onSheetDelete(key) {
    const map = loadAll();
    const p = map[normalizeKey(key)];
    if (!p) return;
    // 二次确认：点一次变红「确认删除」，再点一次才真删。
    const row = this._sheetEl && this._sheetEl.querySelector(`[data-act="sheet-delete"][data-key="${cssEscape(key)}"]`)?.closest('.sheet-row');
    const delBtn = row && row.querySelector('[data-act="sheet-delete"]');
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
    this._toast('已删除档案');
    this._closeSheet();
    this.render();
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
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
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
    this._toastHost.innerHTML = '';
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    this._toastHost.appendChild(t);
    requestFrame(() => t.classList.add('is-show'));
    this._toastTimer = setTimeout(() => {
      t.classList.remove('is-show');
      setTimeout(() => { if (t.parentNode) t.parentNode.removeChild(t); }, 250);
    }, 1800);
  }
}

// ===================== 小工具 =====================
// 转义 HTML，防止昵称含 < > & " 撑破 DOM / XSS。
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
// CSS 选择器转义：key 含特殊字符时 attribute selector 需引号包裹，无需额外转义。
function cssEscape(s) { return String(s || ''); }
// 下一帧（jsdom 下回退到 setTimeout）。
function requestFrame(fn) {
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(fn);
  else setTimeout(fn, 0);
}
