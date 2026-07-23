// ============================================================================
// 托业模考 · UI 层（纯原生 DOM，无框架）
//
// AppUI：挂在任意容器，管理「启动器 → 首页 → 学习/打卡/自测/考试/题库」多屏路由。
// 数据全部来自 core/ 各引擎模块，UI 仅做渲染与事件分发。
// 设计要点：
//  - 单档案模式（无多昵称切换）；profile 为 null 时展示启动器。
//  - 所有屏幕由 render() 按 this.screen 状态分发。
//  - 事件委托：所有点击统一在 root 上分发，通过 data-act 属性路由。
//  - HTML 转义：所有动态内容经 esc() 处理，防 XSS。
//  - 考试计时器：setInterval 驱动，destroy() 时统一清理。
// ============================================================================
import './style.css';
import { attachKeyboardShell } from '../../../_lib/keyboard-shell.js';
import {
  NICKNAME_MIN_LEN, NICKNAME_MAX_LEN,
  WEEK_START, WEEKDAY_LABELS, MONTH_LABELS,
  MILESTONE_STEP,
  PART_INFO, EXAM_TIME_LIMITS,
  STUDY_CATEGORIES,
} from '../config.js';
import {
  getProfile, saveProfile, loadData, saveData, clearAll,
  getCheckin, saveCheckin,
  getExamResults, addExamResult,
  getQuizStats, saveQuizStats,
} from '../core/store.js';
import {
  normalizeCheckin, isChecked, isCheckedToday, totalDays,
  currentStreak, longestStreak, toggleCheckin, addStudyMinutes,
  daysToNextMilestone, milestoneProgress, milestonesEarned, checkinStats,
} from '../core/checkinEngine.js';
import {
  startQuiz, currentQuestion, submitAnswer, isAnswered,
  nextQuestion, prevQuestion, goToQuestion, getProgress,
  finishQuiz, getWrongAnswers,
} from '../core/quizEngine.js';
import {
  startExam, submitExamAnswer, getRemainingTime, isTimeUp,
  finishExam, formatTime, getExamProgress, scoreLevel,
} from '../core/examEngine.js';
import {
  getCategoryNames, getMaterials, getFormattedCards,
  getTotalMaterialCount, getStudyVersion,
} from '../core/studyEngine.js';
import { getBankInfo, loadCustomPack, getCustomPackInfo } from '../core/questionBank.js';
import { getCustomQuestions, saveCustomQuestions, clearCustomQuestions,
  getStudyProgress, markStudied, unmarkStudied, isStudied, studiedCount,
} from '../core/store.js';
import {
  todayDate, toISODate, parseISO, monthMatrix, isToday, isFuture, diffDays,
  monthDayLabel,
} from '../core/calendar.js';
import { isSpeechSupported, speak, stopSpeaking, warmupVoices } from '../core/speech.js';

export class AppUI {
  constructor(parent) {
    this.parent = parent;
    this.root = null;
    // 屏幕状态：'launcher' | 'home' | 'study' | 'checkin' | 'quiz-setup'
    //   | 'quiz-session' | 'quiz-result' | 'exam-setup' | 'exam-session'
    //   | 'exam-result' | 'bank'
    this.screen = 'launcher';
    const t = todayDate();
    this.view = { year: t.getFullYear(), month: t.getMonth() };
    this.today = t;
    this.profile = null; // 当前档案（单档案，null = 未建）
    // 弹层 / 动画状态
    this._sheetOpen = false;
    this._confirmOpen = false;
    this._celebrating = false;
    // 学习状态
    this._studyCat = 'vocab'; // 当前学习分类
    this._studyCards = [];     // 当前分类的卡片列表
    // 自测状态
    this._quizSession = null;  // quizEngine session
    this._quizSetupPart = 'part5';
    this._quizSetupCount = 10;
    // 考试状态
    this._examSession = null;  // examEngine session
    this._examSetupParts = ['part5'];
    this._examTimerId = null;  // setInterval handle
    this._examTick = 0;        // 用于触发重渲染的计数
    this._examCurrentIdx = 0;  // 考试当前题目索引
    // 各类延时句柄
    this._toastTimer = null;
    this._toastRemoveTimer = null;
    this._sheetTimer = null;
    this._confirmTimer = null;
    this._celebrateTimer = null;
    this._celebrateRemoveTimer = null;
  }

  // ===================== 生命周期 =====================
  mount() {
    this.root = document.createElement('div');
    this.root.className = 'tuoye-root';
    this.parent.appendChild(this.root);
    this._detachKeyboard = attachKeyboardShell(this.root);
    this._bindGlobal();
    this._restoreProfile();
    // 恢复自定义题包（从 localStorage 加载用户之前导入的题目）
    const savedPack = getCustomQuestions();
    if (savedPack) loadCustomPack(savedPack);
    // 预热语音合成（Chrome 异步加载语音列表）
    warmupVoices();
    this.render();
  }

  destroy() {
    if (this._confirmOpen) this._closeConfirm(true);
    if (this._celebrating) this._endCelebrate(true);
    if (this._sheetOpen) this._closeSheet(true);
    this._stopExamTimer();
    for (const id of [
      this._toastTimer, this._toastRemoveTimer,
      this._sheetTimer, this._confirmTimer,
      this._celebrateTimer, this._celebrateRemoveTimer,
    ]) {
      if (id) clearTimeout(id);
    }
    this._toastTimer = this._toastRemoveTimer = null;
    this._sheetTimer = this._confirmTimer = null;
    this._celebrateTimer = this._celebrateRemoveTimer = null;
    if (this._keyHandler) {
      window.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
    if (this._detachKeyboard) { this._detachKeyboard(); this._detachKeyboard = null; }
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
    this.root = null;
  }

  // ===================== 事件绑定 =====================
  _bindGlobal() {
    this._keyHandler = (e) => {
      if (e.key === 'Escape') {
        if (this._celebrating) { this._endCelebrate(); return; }
        if (this._confirmOpen) { this._closeConfirm(); return; }
        if (this._sheetOpen) { this._closeSheet(); return; }
        // 导航回退
        if (this.screen === 'quiz-session') { this._confirmLeaveQuiz(); return; }
        if (this.screen === 'exam-session') { this._confirmLeaveExam(); return; }
        if (this.screen !== 'launcher' && this.screen !== 'home') {
          this.screen = 'home';
          this.render();
        }
        return;
      }
      if (e.key === 'Enter') {
        if (e.isComposing) return;
        const el = e.target;
        const id = el && el.dataset && el.dataset.id;
        if (id === 'nickname') {
          e.preventDefault();
          this._onStart();
        } else if (id === 'sheet-rename-input') {
          e.preventDefault();
          this._doRename(el.value);
        }
      }
    };
    window.addEventListener('keydown', this._keyHandler);
    this._clickHandler = (e) => this._onClick(e);
    this.root.addEventListener('click', this._clickHandler);
    this._submitHandler = (e) => {
      if (e.target.closest('[data-id="form"]')) {
        e.preventDefault();
        this._onStart();
      }
    };
    this.root.addEventListener('submit', this._submitHandler);
  }

  // ===================== 渲染入口 =====================
  render() {
    if (!this.root) return;
    this.root.innerHTML = '';
    this._stopExamTimer();
    switch (this.screen) {
      case 'launcher': this._renderLauncher(); break;
      case 'home': this._renderHome(); break;
      case 'study': this._renderStudy(); break;
      case 'checkin': this._renderCheckin(); break;
      case 'quiz-setup': this._renderQuizSetup(); break;
      case 'quiz-session': this._renderQuizSession(); break;
      case 'quiz-result': this._renderQuizResult(); break;
      case 'exam-setup': this._renderExamSetup(); break;
      case 'exam-session': this._renderExamSession(); break;
      case 'exam-result': this._renderExamResult(); break;
      case 'bank': this._renderBank(); break;
      default: this._renderHome(); break;
    }
    this._renderToastHost();
  }

  // ===================== 启动器（Screen 1）=====================
  _renderLauncher() {
    this.root.insertAdjacentHTML('beforeend', `
      <section class="launcher">
        <div class="launcher-icon" aria-hidden="true">托</div>
        <h1 class="launcher-title">托业模考</h1>
        <p class="launcher-sub">TOEIC Reading 专项练习<br/>词汇 · 语法 · 阅读理解 · 全真模考</p>
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
          <button class="launcher-btn" data-act="start" type="submit">开始学习</button>
        </form>
        <p class="launcher-hint">数据保存在本设备，无需联网</p>
      </section>
    `);
    const input = this.root.querySelector('[data-id="nickname"]');
    if (input && !('ontouchstart' in window)) input.focus();
  }

  // ===================== 首页（Screen 2）=====================
  _renderHome() {
    if (!this.profile) { this.screen = 'launcher'; this.render(); return; }
    const checkin = getCheckin();
    const todayISO = toISODate(this.today);
    const checkedToday = isChecked(checkin, todayISO);
    const stats = checkinStats(checkin, this.today);
    const bank = getBankInfo();
    const dateLabel = `${this.today.getMonth() + 1} 月 ${this.today.getDate()} 日`;

    this.root.insertAdjacentHTML('beforeend', `
      <section class="main-view">
        <header class="header">
          <div class="header-left">
            <span class="header-name">${esc(this.profile.nickname)}</span>
            <span class="header-streak">🔥 ${stats.streak} 天</span>
          </div>
          <button class="header-settings" data-act="open-sheet" type="button">设置</button>
        </header>

        <button class="checkin-card ${checkedToday ? 'is-checked' : ''}" data-act="today-checkin" type="button">
          <span class="checkin-card__date">${dateLabel}</span>
          <span class="checkin-card__btn">${checkedToday ? '✓ 今日已打卡' : '打卡'}</span>
        </button>

        <div class="stats">
          <div class="stat">
            <span class="stat__num">${stats.totalDays}</span>
            <span class="stat__lbl">累计天数</span>
          </div>
          <div class="stat stat--accent">
            <span class="stat__num">${stats.streak}</span>
            <span class="stat__lbl">连续打卡</span>
          </div>
          <div class="stat">
            <span class="stat__num">${stats.totalMinutes}</span>
            <span class="stat__lbl">学习分钟</span>
          </div>
        </div>

        <div class="nav-grid">
          <button class="nav-btn" data-act="nav-study" type="button">
            <span class="nav-btn__icon">📖</span>
            <span class="nav-btn__label">学习</span>
            <span class="nav-btn__sub">词汇 · 语法 · 商务短语</span>
          </button>
          <button class="nav-btn" data-act="nav-checkin" type="button">
            <span class="nav-btn__icon">✅</span>
            <span class="nav-btn__label">打卡</span>
            <span class="nav-btn__sub">连续 ${stats.streak} 天</span>
          </button>
          <button class="nav-btn" data-act="nav-quiz" type="button">
            <span class="nav-btn__icon">✏️</span>
            <span class="nav-btn__label">自测</span>
            <span class="nav-btn__sub">分项练习 · 即时反馈</span>
          </button>
          <button class="nav-btn" data-act="nav-exam" type="button">
            <span class="nav-btn__icon">📝</span>
            <span class="nav-btn__label">考试</span>
            <span class="nav-btn__sub">全真模考 · 10-990 分</span>
          </button>
        </div>

        <button class="info-bar" data-act="nav-bank" type="button">
          题库 v${esc(bank.version)} · ${bank.totalQuestions} 题 · 点击查看详情
        </button>
      </section>
    `);
  }

  // ===================== 学习（Screen 3）=====================
  _renderStudy() {
    this._loadStudyCards();
    const cats = getCategoryNames();
    const tabsHtml = cats.map((c) => {
      const total = getMaterials(c.key).length;
      const done = studiedCount(c.key);
      return `
        <button class="study-tab ${c.key === this._studyCat ? 'is-active' : ''}"
                data-act="study-tab" data-cat="${esc(c.key)}" type="button">
          ${esc(c.icon)} ${esc(c.name)}
          <span class="study-tab__count">${done}/${total}</span>
        </button>
      `;
    }).join('');
    const cardsHtml = this._renderStudyCards();

    this.root.insertAdjacentHTML('beforeend', `
      <section class="screen">
        <div class="screen-header">
          <button class="back-btn" data-act="nav-home" type="button" aria-label="返回">‹</button>
          <span class="screen-title">学习</span>
        </div>
        <div class="study-tabs">${tabsHtml}</div>
        <div class="study-cards">${cardsHtml}</div>
      </section>
    `);
  }

  _loadStudyCards() {
    this._studyCards = getFormattedCards(this._studyCat);
  }

  _renderStudyCards() {
    if (!this._studyCards.length) return '<p class="study-empty">暂无学习资料</p>';
    const canSpeak = isSpeechSupported();
    const cat = this._studyCat;
    return this._studyCards.map((c) => {
      const studied = isStudied(cat, c.id);
      const studiedCls = studied ? 'is-studied' : '';
      const studiedBtn = `<button class="learned-toggle ${studied ? 'is-on' : ''}" data-act="toggle-learned" data-cat="${esc(cat)}" data-id="${esc(c.id)}" type="button">${studied ? '✓ 已学习' : '标记已学习'}</button>`;
      if (c.type === 'vocab') {
        const exampleHtml = c.example ? `
          <button class="study-example-btn" data-act="speak" data-text="${esc(c.example)}" type="button">
            <span class="study-example-btn__text">"${esc(c.example)}"</span>
            <span class="study-example-btn__icon">🔊</span>
          </button>` : '';
        return `
          <div class="study-card ${studiedCls}">
            <div class="study-card__head">
              <div class="study-card__word">${esc(c.title)}</div>
              ${canSpeak ? `<button class="speak-btn" data-act="speak" data-text="${esc(c.title)}" type="button" aria-label="发音">🔊</button>` : ''}
            </div>
            ${c.subtitle ? `<div class="study-card__phonetic">${esc(c.subtitle)}</div>` : ''}
            <div class="study-card__def">${esc(c.body)}</div>
            ${exampleHtml}
            ${studiedBtn}
          </div>`;
      }
      if (c.type === 'grammar') {
        const examplesHtml = (c.examples || []).map((ex) =>
          `<button class="study-example-btn" data-act="speak" data-text="${esc(ex)}" type="button">
            <span class="study-example-btn__text">${esc(ex)}</span>
            <span class="study-example-btn__icon">🔊</span>
          </button>`
        ).join('');
        return `
          <div class="study-card ${studiedCls}">
            <div class="study-card__title">${esc(c.title)}</div>
            <div class="study-card__explanation">${esc(c.body)}</div>
            ${examplesHtml ? `<div class="study-card__examples">${examplesHtml}</div>` : ''}
            ${studiedBtn}
          </div>`;
      }
      // business
      return `
        <div class="study-card ${studiedCls}">
          <div class="study-card__head">
            <div class="study-card__phrase">${esc(c.title)}</div>
            ${canSpeak ? `<button class="speak-btn" data-act="speak" data-text="${esc(c.title)}" type="button" aria-label="发音">🔊</button>` : ''}
          </div>
          <div class="study-card__meaning">${esc(c.subtitle)}</div>
          <div class="study-card__def">${esc(c.body)}</div>
          ${studiedBtn}
        </div>`;
    }).join('');
  }

  // ===================== 打卡（Screen 4）=====================
  _renderCheckin() {
    const checkin = getCheckin();
    const stats = checkinStats(checkin, this.today);
    const progress = milestoneProgress(checkin);
    const toNext = daysToNextMilestone(checkin);
    const msEarned = milestonesEarned(checkin);
    const total = stats.totalDays;

    this.root.insertAdjacentHTML('beforeend', `
      <section class="screen checkin-screen">
        <div class="screen-header">
          <button class="back-btn" data-act="nav-home" type="button" aria-label="返回">‹</button>
          <span class="screen-title">打卡</span>
        </div>
        <div class="stats">
          <div class="stat">
            <span class="stat__num">${total}</span>
            <span class="stat__lbl">累计天数</span>
          </div>
          <div class="stat stat--accent">
            <span class="stat__num">${stats.streak}</span>
            <span class="stat__lbl">连续打卡</span>
          </div>
          <div class="stat">
            <span class="stat__num">${stats.longest}</span>
            <span class="stat__lbl">最长连击</span>
          </div>
        </div>

        <div class="milestone">
          <div class="milestone__top">
            <span class="milestone__lbl">${toNext === MILESTONE_STEP ? '已达新里程碑！' : `距下一里程碑还差 ${toNext} 天`}</span>
            <span class="milestone__cnt">${total % MILESTONE_STEP}/${MILESTONE_STEP}</span>
          </div>
          <div class="milestone__bar"><span class="milestone__fill" style="width:${Math.round(progress * 100)}%"></span></div>
        </div>

        <div class="calendar" data-id="calendar">
          ${this._renderCalendarInner()}
        </div>

        <div class="milestones">
          <div class="milestones__head">
            <span class="milestones__title">里程碑</span>
            <span class="milestones__cnt">已解锁 ${msEarned} 个</span>
          </div>
          <div class="milestones__grid">${this._renderMilestonesInner(msEarned)}</div>
        </div>
      </section>
    `);
  }

  _renderCalendarInner() {
    const { year, month } = this.view;
    const { cells } = monthMatrix(year, month, WEEK_START);
    const checkin = getCheckin();
    const head = WEEKDAY_LABELS.map((w) => `<span class="cal-dow">${w}</span>`).join('');
    const grid = cells.map((d) => {
      const iso = toISODate(d);
      const inMonth = d.getMonth() === month;
      const checked = isChecked(checkin, iso);
      const today = isToday(d, this.today);
      const future = isFuture(d, this.today);
      const past = diffDays(this.today, d) < 0;
      const cls = [
        'day',
        inMonth ? '' : 'day--out',
        checked ? 'is-checked' : '',
        today ? 'is-today' : '',
        future ? 'is-future' : '',
        past ? 'is-past' : '',
      ].filter(Boolean).join(' ');
      return `<button class="${cls}" data-act="day" data-iso="${esc(iso)}" type="button"${future ? ' disabled' : ''}>
        <span class="day__num">${d.getDate()}</span>
        ${checked ? '<span class="day__check" aria-hidden="true">✓</span>' : ''}
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

  _refreshCalendar() {
    const cal = this.root.querySelector('[data-id="calendar"]');
    if (cal) cal.innerHTML = this._renderCalendarInner();
  }

  _renderMilestonesInner(count) {
    const slots = Math.max(count + 4, 6);
    let html = '';
    for (let i = 0; i < slots; i++) {
      const unlocked = i < count;
      html += `<span class="mslot ${unlocked ? 'is-on' : ''}" aria-label="${unlocked ? '已解锁' : '未解锁'}">
        ${unlocked ? '⭐' : '☆'}
      </span>`;
    }
    return html;
  }

  // ===================== 自测设置（Screen 5）=====================
  _renderQuizSetup() {
    const parts = [
      { key: 'part5', name: 'Part 5 · 语法填空', sub: `${PART_INFO.part5.total} 题` },
      { key: 'part6', name: 'Part 6 · 完形填空', sub: `${PART_INFO.part6.total} 题` },
      { key: 'part7', name: 'Part 7 · 阅读理解', sub: `${PART_INFO.part7.total} 题` },
    ];
    const counts = [5, 10, 15];

    this.root.insertAdjacentHTML('beforeend', `
      <section class="screen">
        <div class="screen-header">
          <button class="back-btn" data-act="nav-home" type="button" aria-label="返回">‹</button>
          <span class="screen-title">自测</span>
        </div>

        <div class="setup-section">
          <div class="setup-label">选择题型</div>
          <div class="part-options">
            ${parts.map((p) => `
              <button class="part-opt ${this._quizSetupPart === p.key ? 'is-selected' : ''}"
                      data-act="quiz-part" data-part="${esc(p.key)}" type="button">
                <span class="part-opt__dot"></span>
                <span class="part-opt__info">
                  <span class="part-opt__name">${esc(p.name)}</span>
                  <span class="part-opt__sub">${esc(p.sub)}</span>
                </span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="setup-section">
          <div class="setup-label">题目数量</div>
          <div class="count-options">
            ${counts.map((c) => `
              <button class="count-opt ${this._quizSetupCount === c ? 'is-selected' : ''}"
                      data-act="quiz-count" data-count="${c}" type="button">
                ${c} 题
              </button>
            `).join('')}
          </div>
        </div>

        <button class="start-btn" data-act="quiz-start" type="button">开始自测</button>
      </section>
    `);
  }

  // ===================== 自测答题（Screen 6）=====================
  _renderQuizSession() {
    if (!this._quizSession) { this.screen = 'quiz-setup'; this.render(); return; }
    const q = currentQuestion(this._quizSession);
    const prog = getProgress(this._quizSession);
    const pct = prog.total > 0 ? Math.round((prog.current / prog.total) * 100) : 0;
    const answered = isAnswered(this._quizSession, q.id);
    const partLabel = PART_INFO[this._quizSession.part]?.shortName || '';

    let passageHtml = '';
    if (q.passageText) {
      const canSpeak = isSpeechSupported();
      passageHtml = `<div class="question-card__passage"><div class="question-card__passage-head"><span>阅读材料</span>${canSpeak ? `<button class="speak-btn speak-btn--sm" data-act="speak" data-text="${esc(q.passageText)}" type="button" aria-label="朗读">🔊 朗读</button>` : ''}</div>${esc(q.passageText)}</div>`;
    }

    let optionsHtml = '';
    const labels = ['A', 'B', 'C', 'D'];
    for (let i = 0; i < (q.options || []).length; i++) {
      let cls = 'option-btn';
      if (answered) {
        cls += ' is-disabled';
        if (i === q.answer) cls += ' is-correct';
        else if (i === this._quizSession.answers[q.id] && i !== q.answer) cls += ' is-wrong';
      }
      optionsHtml += `
        <button class="${cls}" data-act="quiz-answer" data-qid="${esc(q.id)}" data-idx="${i}" type="button">
          <span class="option-btn__marker">${labels[i]}</span>
          <span>${esc(q.options[i])}</span>
        </button>`;
    }

    let feedbackHtml = '';
    if (answered) {
      const correct = this._quizSession.results[q.id];
      feedbackHtml = `
        <div class="feedback ${correct ? 'feedback--correct' : 'feedback--wrong'}">
          <div class="feedback__label">${correct ? '✓ 回答正确' : '✗ 回答错误'}</div>
          <div>${correct ? (q.explanation ? esc(q.explanation) : '很好，继续保持！') : (q.explanation ? esc(q.explanation) : '正确答案是 ' + labels[q.answer])}</div>
        </div>`;
    }

    this.root.insertAdjacentHTML('beforeend', `
      <section class="screen">
        <div class="screen-header">
          <button class="back-btn" data-act="nav-home" type="button" aria-label="返回">‹</button>
          <span class="screen-title">${esc(partLabel)} 自测</span>
        </div>

        <div class="quiz-bar">
          <span class="quiz-bar__progress">第 ${prog.current} / ${prog.total} 题</span>
          <span class="quiz-bar__count">已答 ${prog.answered}</span>
        </div>
        <div class="quiz-progress">
          <span class="quiz-progress__fill" style="width:${pct}%"></span>
        </div>

        <div class="question-card">
          ${passageHtml}
          <div class="question-card__text">${esc(q.stem || '')}</div>
        </div>

        <div class="options">${optionsHtml}</div>
        ${feedbackHtml}

        <div class="quiz-nav">
          <button class="quiz-nav-btn" data-act="quiz-prev" type="button" ${prog.current <= 1 ? 'disabled' : ''}>上一题</button>
          <button class="quiz-nav-btn quiz-nav-btn--primary" data-act="${answered ? 'quiz-next' : 'quiz-finish'}" type="button">
            ${answered ? (prog.current < prog.total ? '下一题' : '查看结果') : '完成自测'}
          </button>
        </div>
      </section>
    `);
  }

  // ===================== 自测结果（Screen 7）=====================
  _renderQuizResult() {
    if (!this._quizSession) { this.screen = 'quiz-setup'; this.render(); return; }
    const summary = finishQuiz(this._quizSession);
    const wrongs = getWrongAnswers(this._quizSession);
    const level = summary.accuracy >= 80 ? 'is-high' : summary.accuracy >= 50 ? 'is-mid' : 'is-low';
    const partLabel = PART_INFO[summary.part]?.shortName || '';
    const timeMin = Math.floor(summary.timeSpent / 60);
    const timeSec = summary.timeSpent % 60;
    const timeStr = timeMin > 0 ? `${timeMin} 分 ${timeSec} 秒` : `${timeSec} 秒`;

    let wrongHtml = '';
    if (wrongs.length > 0) {
      const items = wrongs.slice(0, 10).map((q) => {
        const labels = ['A', 'B', 'C', 'D'];
        return `
          <div class="wrong-item">
            <div class="wrong-item__q">${esc(q.stem || '')}</div>
            <div class="wrong-item__ans">
              你的答案：${esc(labels[this._quizSession.answers[q.id]] || '-')}
              · 正确答案：<strong>${esc(labels[q.answer])}</strong>
            </div>
          </div>`;
      }).join('');
      wrongHtml = `
        <div class="result-breakdown">
          <div class="result-breakdown__title">错题回顾（${wrongs.length} 题）</div>
          <div class="wrong-list">${items}</div>
        </div>`;
    }

    this.root.insertAdjacentHTML('beforeend', `
      <section class="screen">
        <div class="screen-header">
          <button class="back-btn" data-act="nav-home" type="button" aria-label="返回">‹</button>
          <span class="screen-title">自测结果</span>
        </div>

        <div class="result-card">
          <div class="result-score">${summary.correct} <span>/ ${summary.total}</span></div>
          <div class="result-accuracy ${level}">正确率 ${summary.accuracy}%</div>
          <div class="result-time">${esc(partLabel)} · 用时 ${esc(timeStr)}</div>
        </div>

        ${wrongHtml}

        <div class="result-actions">
          <button class="start-btn" data-act="quiz-retry" type="button">再来一次</button>
          <button class="start-btn start-btn--exam" data-act="nav-home" type="button">返回首页</button>
        </div>
      </section>
    `);
  }

  // ===================== 考试设置（Screen 8a）=====================
  _renderExamSetup() {
    const parts = [
      { key: 'part5', name: 'Part 5 · 语法填空', sub: `${PART_INFO.part5.total} 题 · ${EXAM_TIME_LIMITS.part5 / 60} 分钟` },
      { key: 'part6', name: 'Part 6 · 完形填空', sub: `${PART_INFO.part6.total} 题 · ${EXAM_TIME_LIMITS.part6 / 60} 分钟` },
      { key: 'part7', name: 'Part 7 · 阅读理解', sub: `${PART_INFO.part7.total} 题 · ${EXAM_TIME_LIMITS.part7 / 60} 分钟` },
    ];
    const totalSec = this._examSetupParts.reduce((s, p) => s + (EXAM_TIME_LIMITS[p] || 0), 0);
    const totalMin = Math.ceil(totalSec / 60);

    this.root.insertAdjacentHTML('beforeend', `
      <section class="screen">
        <div class="screen-header">
          <button class="back-btn" data-act="nav-home" type="button" aria-label="返回">‹</button>
          <span class="screen-title">考试</span>
        </div>

        <div class="setup-section">
          <div class="setup-label">选择考试内容（可多选）</div>
          <div class="part-options">
            ${parts.map((p) => `
              <button class="part-opt ${this._examSetupParts.includes(p.key) ? 'is-selected' : ''}"
                      data-act="exam-part" data-part="${esc(p.key)}" type="button">
                <span class="part-opt__check"></span>
                <span class="part-opt__info">
                  <span class="part-opt__name">${esc(p.name)}</span>
                  <span class="part-opt__sub">${esc(p.sub)}</span>
                </span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="time-display">
          <span>考试时长</span>
          <span class="time-display__val">${totalMin} 分钟</span>
        </div>

        <p class="warning-text">⏱ 考试将计时，请确保有足够时间完成</p>
        <button class="start-btn start-btn--exam" data-act="exam-start" type="button"
                ${this._examSetupParts.length === 0 ? 'disabled' : ''}>开始考试</button>
      </section>
    `);
  }

  // ===================== 考试答题（Screen 8b）=====================
  _renderExamSession() {
    if (!this._examSession) { this.screen = 'exam-setup'; this.render(); return; }
    const remaining = getRemainingTime(this._examSession);
    const prog = getExamProgress(this._examSession);
    const timeStr = formatTime(remaining);
    const timerClass = remaining <= 300 ? (remaining <= 60 ? 'is-danger' : 'is-warning') : '';
    const q = this._examSession.questions[this._examCurrentIdx];
    if (!q) { this._submitExam(); return; }

    // Question nav grid
    const qNavHtml = this._examSession.questions.map((_, i) => {
      const qs = this._examSession.questions[i];
      const isAnswered = this._examSession.answers[qs.id] !== undefined;
      const isCurrent = i === this._examCurrentIdx;
      return `<button class="exam-qnav__btn ${isAnswered ? 'is-answered' : ''} ${isCurrent ? 'is-current' : ''}"
               data-act="exam-goto" data-idx="${i}" type="button">${i + 1}</button>`;
    }).join('');

    // Options
    const labels = ['A', 'B', 'C', 'D'];
    let optionsHtml = '';
    for (let i = 0; i < (q.options || []).length; i++) {
      const isSelected = this._examSession.answers[q.id] === i;
      optionsHtml += `
        <button class="option-btn ${isSelected ? 'is-selected' : ''}"
                data-act="exam-answer" data-qid="${esc(q.id)}" data-idx="${i}" type="button">
          <span class="option-btn__marker">${labels[i]}</span>
          <span>${esc(q.options[i])}</span>
        </button>`;
    }

    let passageHtml = '';
    if (q.passageText) {
      passageHtml = `<div class="question-card__passage">${esc(q.passageText)}</div>`;
    }

    this.root.insertAdjacentHTML('beforeend', `
      <section class="screen">
        <div class="exam-top-bar">
          <span class="exam-timer ${timerClass}" data-id="exam-timer">${timeStr}</span>
          <span class="exam-progress-text">${prog.answered}/${prog.total} 已答</span>
          <button class="exam-submit-btn" data-act="exam-submit" type="button">交卷</button>
        </div>

        <div class="exam-qnav">${qNavHtml}</div>

        <div class="question-card">
          ${passageHtml}
          <div class="question-card__text">${esc(q.stem || '')}</div>
        </div>

        <div class="options">${optionsHtml}</div>

        <div class="quiz-nav">
          <button class="quiz-nav-btn" data-act="exam-prev" type="button" ${this._examCurrentIdx <= 0 ? 'disabled' : ''}>上一题</button>
          <button class="quiz-nav-btn quiz-nav-btn--primary" data-act="exam-next" type="button"
                  ${this._examCurrentIdx >= this._examSession.questions.length - 1 ? 'disabled' : ''}>下一题</button>
        </div>
      </section>
    `);

    // Start exam timer if not running
    this._startExamTimer();
  }

  // ===================== 考试结果（Screen 8c）=====================
  _renderExamResult() {
    if (!this._lastExamResult) { this.screen = 'home'; this.render(); return; }
    const r = this._lastExamResult;
    const level = scoreLevel(r.scaledScore);
    const timeMin = Math.floor(r.timeSpent / 60);
    const timeSec = r.timeSpent % 60;

    // Per-part breakdown
    let partRows = '';
    for (const part of r.parts) {
      const info = PART_INFO[part];
      const sc = r.scores[part];
      if (sc) {
        partRows += `
          <div class="result-row">
            <span class="result-row__label">${esc(info?.shortName || part)}</span>
            <span class="result-row__val">${sc.correct} / ${sc.total}</span>
          </div>`;
      }
    }

    this.root.insertAdjacentHTML('beforeend', `
      <section class="screen">
        <div class="screen-header">
          <button class="back-btn" data-act="nav-home" type="button" aria-label="返回">‹</button>
          <span class="screen-title">考试结果</span>
        </div>

        <div class="exam-result-hero">
          <div class="exam-result-score">${r.scaledScore} <span>/ 990</span></div>
          <div class="exam-result-level" style="background:${level.color}15;color:${level.color}">
            等级 ${esc(level.name)} · ${esc(level.label)}
          </div>
          <div class="exam-result-reading">阅读分 <strong>${r.readingScore} / 495</strong></div>
          <div class="result-time">用时 ${timeMin} 分 ${timeSec} 秒</div>
        </div>

        <div class="result-breakdown">
          <div class="result-breakdown__title">各部分得分</div>
          ${partRows}
          <div class="result-row">
            <span class="result-row__label">总正确</span>
            <span class="result-row__val">${r.rawCorrect} / ${r.rawTotal}</span>
          </div>
        </div>

        <div class="result-actions">
          <button class="start-btn start-btn--exam" data-act="exam-retry" type="button">再考一次</button>
          <button class="start-btn" data-act="nav-home" type="button">返回首页</button>
        </div>
      </section>
    `);
  }

  // ===================== 题库信息（Screen 9）=====================
  _renderBank() {
    const bank = getBankInfo();
    const study = getStudyVersion();
    const custom = bank.customPack;
    this.root.insertAdjacentHTML('beforeend', `
      <section class="screen">
        <div class="screen-header">
          <button class="back-btn" data-act="nav-home" type="button" aria-label="返回">‹</button>
          <span class="screen-title">题库信息</span>
        </div>

        <div class="bank-card">
          <div class="bank-card__title">题目数据</div>
          <div class="bank-row">
            <span class="bank-row__label">题库版本</span>
            <span class="bank-row__val">${esc(bank.version)}</span>
          </div>
          <div class="bank-row">
            <span class="bank-row__label">更新日期</span>
            <span class="bank-row__val">${esc(bank.lastUpdated)}</span>
          </div>
          <div class="bank-row">
            <span class="bank-row__label">总题数</span>
            <span class="bank-row__val">${bank.totalQuestions} 题</span>
          </div>
        </div>

        <div class="bank-card">
          <div class="bank-card__title">各部分题数</div>
          <div class="bank-row">
            <span class="bank-row__label">Part 5 · 语法填空</span>
            <span class="bank-row__val">${bank.partCounts.part5} 题</span>
          </div>
          <div class="bank-row">
            <span class="bank-row__label">Part 6 · 完形填空</span>
            <span class="bank-row__val">${bank.partCounts.part6} 题</span>
          </div>
          <div class="bank-row">
            <span class="bank-row__label">Part 7 · 阅读理解</span>
            <span class="bank-row__val">${bank.partCounts.part7} 题</span>
          </div>
        </div>

        <div class="bank-card">
          <div class="bank-card__title">检查更新</div>
          <p class="bank-update-hint">点击下方按钮，从服务器获取最新题库。有新版本时会自动更新。</p>
          <button class="bank-update-btn" data-act="check-update" type="button">
            🔄 检查更新
          </button>
        </div>

        ${custom ? `
        <div class="bank-card bank-card--custom">
          <div class="bank-card__title">已加载额外题包</div>
          <div class="bank-row">
            <span class="bank-row__label">题包版本</span>
            <span class="bank-row__val">${esc(custom.version || '未标注')}</span>
          </div>
          <div class="bank-row">
            <span class="bank-row__label">更新日期</span>
            <span class="bank-row__val">${esc(custom.lastUpdated || '未标注')}</span>
          </div>
          <div class="bank-row">
            <span class="bank-row__label">新增题目</span>
            <span class="bank-row__val">${custom.total} 题</span>
          </div>
          <button class="bank-update-btn bank-update-btn--danger" data-act="remove-custom-pack" type="button">移除额外题包</button>
        </div>
        ` : ''}

        <div class="bank-card">
          <div class="bank-card__title">学习资料</div>
          <div class="bank-row">
            <span class="bank-row__label">版本</span>
            <span class="bank-row__val">${esc(study.version)}</span>
          </div>
          <div class="bank-row">
            <span class="bank-row__label">更新日期</span>
            <span class="bank-row__val">${esc(study.lastUpdated)}</span>
          </div>
          <div class="bank-row">
            <span class="bank-row__label">资料总数</span>
            <span class="bank-row__val">${getTotalMaterialCount()} 条</span>
          </div>
        </div>
      </section>
    `);
  }

  // ===================== 事件分发 =====================
  _onClick(e) {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    switch (act) {
      // 启动器
      case 'start': this._onStart(); break;
      // 导航
      case 'nav-home': this.screen = 'home'; this.render(); break;
      case 'nav-study': this.screen = 'study'; this.render(); break;
      case 'nav-checkin': this.screen = 'checkin'; this.render(); break;
      case 'nav-quiz': this.screen = 'quiz-setup'; this.render(); break;
      case 'nav-exam': this.screen = 'exam-setup'; this.render(); break;
      case 'nav-bank': this.screen = 'bank'; this.render(); break;
      // 首页打卡
      case 'today-checkin': this._onTodayCheckin(); break;
      // 学习
      case 'study-tab': this._onStudyTab(btn.dataset.cat); break;
      // 打卡日历
      case 'day': this._onDayClick(btn.dataset.iso); break;
      case 'prev-month': this._shiftMonth(-1); break;
      case 'next-month': this._shiftMonth(1); break;
      // 自测
      case 'quiz-part': this._quizSetupPart = btn.dataset.part; this.render(); break;
      case 'quiz-count': this._quizSetupCount = Number(btn.dataset.count) || 10; this.render(); break;
      case 'quiz-start': this._onQuizStart(); break;
      case 'quiz-answer': this._onQuizAnswer(btn.dataset.qid, Number(btn.dataset.idx)); break;
      case 'quiz-next': this._onQuizNext(); break;
      case 'quiz-prev': this._onQuizPrev(); break;
      case 'quiz-finish': this._onQuizFinish(); break;
      case 'quiz-retry': this.screen = 'quiz-setup'; this.render(); break;
      // 考试
      case 'exam-part': this._onExamPartToggle(btn.dataset.part); break;
      case 'exam-start': this._onExamStart(); break;
      case 'exam-answer': this._onExamAnswer(btn.dataset.qid, Number(btn.dataset.idx)); break;
      case 'exam-goto': this._onExamGoto(Number(btn.dataset.idx)); break;
      case 'exam-next': this._onExamNext(); break;
      case 'exam-prev': this._onExamPrev(); break;
      case 'exam-submit': this._onExamSubmitConfirm(); break;
      case 'exam-retry': this.screen = 'exam-setup'; this.render(); break;
      // 弹层
      case 'open-sheet': this._openSheet(); break;
      case 'close-sheet': this._closeSheet(); break;
      case 'confirm-ok': this._onConfirmOk(); break;
      case 'confirm-cancel': this._closeConfirm(); break;
      case 'celebrate-ok': this._endCelebrate(); break;
      case 'remove-custom-pack': this._onRemoveCustomPack(); break;
      case 'check-update': this._onCheckUpdate(btn); break;
      case 'speak': this._onSpeak(btn.dataset.text, btn.dataset.slow === '1'); break;
      case 'stop-speak': stopSpeaking(); break;
      case 'toggle-learned': this._onToggleLearned(btn.dataset.cat, btn.dataset.id); break;
      default: break;
    }
  }

  // ===================== 启动器逻辑 =====================
  _onStart() {
    const input = this.root.querySelector('[data-id="nickname"]');
    const raw = input ? input.value : '';
    const trimmed = raw.trim();
    if (trimmed.length < NICKNAME_MIN_LEN || trimmed.length > NICKNAME_MAX_LEN) {
      this._toast(`昵称需 ${NICKNAME_MIN_LEN}~${NICKNAME_MAX_LEN} 个字`);
      if (input) input.focus();
      return;
    }
    const name = trimmed.slice(0, NICKNAME_MAX_LEN);
    const now = Math.floor(Date.now() / 1000);
    saveProfile({ nickname: name, createdAt: now, lastSeen: now });
    // 初始化 checkin
    const existingCheckin = getCheckin();
    if (!existingCheckin || !existingCheckin.dates) {
      saveCheckin(normalizeCheckin({ dates: [], totalMinutes: 0 }));
    }
    this.profile = getProfile();
    this.screen = 'home';
    this.render();
    this._toast(`欢迎，${name} 🎉`);
  }

  _restoreProfile() {
    this.profile = getProfile();
    if (this.profile) this.screen = 'home';
    else this.screen = 'launcher';
  }

  // ===================== 首页打卡 =====================
  _onTodayCheckin() {
    if (!this.profile) return;
    const checkin = getCheckin();
    const todayISO = toISODate(this.today);
    const before = isChecked(checkin, todayISO);
    const { checkin: newCheckin, checked, milestone } = toggleCheckin(checkin, todayISO, this.today);
    saveCheckin(newCheckin);
    // Add 15 study minutes on check-in
    if (checked) {
      const updated = addStudyMinutes(newCheckin, 15);
      saveCheckin(updated);
    }
    this.render();
    if (milestone && checked) {
      this._celebrate(milestonesEarned(newCheckin));
    } else if (checked) {
      this._toast(before ? '' : '打卡成功 ✨');
    } else {
      this._toast('已取消打卡');
    }
  }

  // ===================== 打卡日历 =====================
  _onDayClick(iso) {
    if (!this.profile || !iso) return;
    const dt = parseISO(iso);
    if (!dt) return;
    if (diffDays(this.today, dt) > 0) return; // future
    const isPast = diffDays(this.today, dt) < 0;
    if (!isPast) {
      this._applyDayToggle(iso);
      return;
    }
    const checkin = getCheckin();
    const willCheck = !isChecked(checkin, iso);
    const label = this._fmtISO(iso);
    this._confirm({
      title: willCheck ? '补打卡' : '取消打卡',
      message: willCheck ? `确定为 ${label} 补打卡吗？` : `确定取消 ${label} 的打卡吗？`,
      confirmText: willCheck ? '确认补卡' : '确认取消',
      danger: !willCheck,
      onConfirm: () => this._applyDayToggle(iso),
    });
  }

  _applyDayToggle(iso) {
    const checkin = getCheckin();
    const { checkin: newCheckin, checked, milestone } = toggleCheckin(checkin, iso, this.today);
    saveCheckin(newCheckin);
    this._refreshCalendar();
    // Also refresh stats on checkin screen
    this._refreshCheckinStats();
    if (milestone && checked) {
      this._celebrate(milestonesEarned(newCheckin));
    } else {
      this._toast(checked ? '打卡成功 ✨' : '已取消打卡');
    }
  }

  _refreshCheckinStats() {
    const checkin = getCheckin();
    const stats = checkinStats(checkin, this.today);
    const progress = milestoneProgress(checkin);
    const toNext = daysToNextMilestone(checkin);
    const msEarned = milestonesEarned(checkin);

    const nums = this.root.querySelectorAll('.stat__num');
    if (nums.length >= 3) {
      nums[0].textContent = stats.totalDays;
      nums[1].textContent = stats.streak;
      nums[2].textContent = stats.longest;
    }

    const fill = this.root.querySelector('.milestone__fill');
    if (fill) fill.style.width = `${Math.round(progress * 100)}%`;
    const msCnt = this.root.querySelector('.milestone__cnt');
    if (msCnt) msCnt.textContent = `${stats.totalDays % MILESTONE_STEP}/${MILESTONE_STEP}`;
    const msLabel = this.root.querySelector('.milestone__lbl');
    if (msLabel) msLabel.textContent = toNext === MILESTONE_STEP ? '已达新里程碑！' : `距下一里程碑还差 ${toNext} 天`;

    const msGrid = this.root.querySelector('.milestones__grid');
    if (msGrid) msGrid.innerHTML = this._renderMilestonesInner(msEarned);
    const msTotal = this.root.querySelector('.milestones__cnt');
    if (msTotal) msTotal.textContent = `已解锁 ${msEarned} 个`;
  }

  _shiftMonth(delta) {
    let { year, month } = this.view;
    month += delta;
    if (month < 0) { month = 11; year--; }
    else if (month > 11) { month = 0; year++; }
    this.view = { year, month };
    const ty = this.today.getFullYear();
    const tm = this.today.getMonth();
    if (year > ty || (year === ty && month > tm)) {
      this.view = { year: ty, month: tm };
      this._toast('已经是最新月份啦');
      return;
    }
    this._refreshCalendar();
  }

  _fmtISO(iso) {
    const d = parseISO(iso);
    if (!d) return iso;
    return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  }

  // ===================== 学习 =====================
  _onStudyTab(cat) {
    if (!cat || cat === this._studyCat) return;
    this._studyCat = cat;
    this._loadStudyCards();
    // 只刷新 tabs 和 cards，保留 header
    const tabs = this.root.querySelectorAll('.study-tab');
    tabs.forEach((t) => t.classList.toggle('is-active', t.dataset.cat === cat));
    const cardsContainer = this.root.querySelector('.study-cards');
    if (cardsContainer) cardsContainer.innerHTML = this._renderStudyCards();
  }

  // ===================== 自测逻辑 =====================
  _onQuizStart() {
    const session = startQuiz(this._quizSetupPart, this._quizSetupCount);
    if (!session) {
      this._toast('题目不足，无法开始自测');
      return;
    }
    this._quizSession = session;
    this.screen = 'quiz-session';
    this.render();
  }

  _onQuizAnswer(qid, idx) {
    if (!this._quizSession) return;
    if (isAnswered(this._quizSession, qid)) return;
    submitAnswer(this._quizSession, qid, idx);
    this.render();
    // Update quiz stats
    const correct = this._quizSession.results[qid];
    const stats = getQuizStats();
    const part = this._quizSession.part;
    stats.totalAnswered++;
    if (correct) stats.totalCorrect++;
    if (!stats.byPart[part]) stats.byPart[part] = { answered: 0, correct: 0 };
    stats.byPart[part].answered++;
    if (correct) stats.byPart[part].correct++;
    saveQuizStats(stats);
  }

  _onQuizNext() {
    if (!this._quizSession) return;
    if (nextQuestion(this._quizSession)) {
      this.render();
    } else {
      this._onQuizFinish();
    }
  }

  _onQuizPrev() {
    if (!this._quizSession) return;
    if (prevQuestion(this._quizSession)) {
      this.render();
    }
  }

  _onQuizFinish() {
    this.screen = 'quiz-result';
    this.render();
  }

  _confirmLeaveQuiz() {
    this._confirm({
      title: '退出自测？',
      message: '当前进度将不会保存，确定退出吗？',
      confirmText: '退出',
      danger: true,
      onConfirm: () => {
        this._quizSession = null;
        this.screen = 'home';
        this.render();
      },
    });
  }

  // ===================== 考试逻辑 =====================
  _onExamPartToggle(part) {
    const idx = this._examSetupParts.indexOf(part);
    if (idx >= 0) {
      if (this._examSetupParts.length > 1) {
        this._examSetupParts.splice(idx, 1);
      } else {
        this._toast('至少选择一个部分');
      }
    } else {
      this._examSetupParts.push(part);
    }
    this.render();
  }

  _onExamStart() {
    if (this._examSetupParts.length === 0) {
      this._toast('请先选择考试内容');
      return;
    }
    const session = startExam(this._examSetupParts);
    if (!session) {
      this._toast('无法创建考试');
      return;
    }
    this._examSession = session;
    this._examCurrentIdx = 0;
    this.screen = 'exam-session';
    this.render();
  }

  _onExamAnswer(qid, idx) {
    if (!this._examSession) return;
    submitExamAnswer(this._examSession, qid, idx);
    // Re-render options only (avoid full re-render during exam for performance)
    const options = this.root.querySelectorAll('.option-btn');
    const labels = ['A', 'B', 'C', 'D'];
    options.forEach((opt, i) => {
      const isSelected = this._examSession.answers[qid] === i;
      opt.classList.toggle('is-selected', isSelected);
      const marker = opt.querySelector('.option-btn__marker');
      if (marker) marker.textContent = labels[i];
    });
    // Update nav grid
    const qNavBtns = this.root.querySelectorAll('.exam-qnav__btn');
    qNavBtns.forEach((btn, i) => {
      const qs = this._examSession.questions[i];
      if (qs) btn.classList.toggle('is-answered', this._examSession.answers[qs.id] !== undefined);
    });
    // Update progress text
    const prog = getExamProgress(this._examSession);
    const progText = this.root.querySelector('.exam-progress-text');
    if (progText) progText.textContent = `${prog.answered}/${prog.total} 已答`;
  }

  _onExamGoto(idx) {
    if (!this._examSession) return;
    if (idx < 0 || idx >= this._examSession.questions.length) return;
    this._examCurrentIdx = idx;
    this.render();
  }

  _onExamNext() {
    if (!this._examSession) return;
    if (this._examCurrentIdx < this._examSession.questions.length - 1) {
      this._examCurrentIdx++;
      this.render();
    }
  }

  _onExamPrev() {
    if (!this._examSession) return;
    if (this._examCurrentIdx > 0) {
      this._examCurrentIdx--;
      this.render();
    }
  }

  _onExamSubmitConfirm() {
    const prog = getExamProgress(this._examSession);
    this._confirm({
      title: '确认交卷？',
      message: prog.unanswered > 0
        ? `还有 ${prog.unanswered} 题未作答，确定交卷吗？`
        : '所有题目已作答完毕，确认交卷。',
      confirmText: '交卷',
      onConfirm: () => this._submitExam(),
    });
  }

  _submitExam() {
    if (!this._examSession) return;
    this._stopExamTimer();
    const result = finishExam(this._examSession);
    this._lastExamResult = result;
    if (result) addExamResult(result);
    this._examSession = null;
    this.screen = 'exam-result';
    this.render();
  }

  _confirmLeaveExam() {
    this._confirm({
      title: '退出考试？',
      message: '考试进度将丢失，确定退出吗？',
      confirmText: '退出',
      danger: true,
      onConfirm: () => {
        this._stopExamTimer();
        this._examSession = null;
        this.screen = 'home';
        this.render();
      },
    });
  }

  // —— 考试计时器 ——
  _startExamTimer() {
    if (this._examTimerId) return;
    this._examTimerId = setInterval(() => {
      if (!this._examSession) { this._stopExamTimer(); return; }
      if (isTimeUp(this._examSession)) {
        this._toast('时间到，自动交卷');
        this._submitExam();
        return;
      }
      // Update timer display without full re-render
      const timerEl = this.root.querySelector('[data-id="exam-timer"]');
      if (timerEl) {
        const remaining = getRemainingTime(this._examSession);
        timerEl.textContent = formatTime(remaining);
        timerEl.classList.toggle('is-warning', remaining <= 300 && remaining > 60);
        timerEl.classList.toggle('is-danger', remaining <= 60);
      }
    }, 1000);
  }

  _stopExamTimer() {
    if (this._examTimerId) {
      clearInterval(this._examTimerId);
      this._examTimerId = null;
    }
  }

  // ===================== Profile Sheet =====================
  _openSheet() {
    if (!this.profile) return;
    this._closeSheet(true);
    const el = document.createElement('div');
    el.className = 'sheet';
    el.innerHTML = `
      <div class="sheet__backdrop" data-act="close-sheet"></div>
      <div class="sheet__panel" role="dialog" aria-label="设置">
        <div class="sheet__head">
          <span class="sheet__title">设置</span>
          <button class="sheet__close" data-act="close-sheet" type="button" aria-label="关闭">✕</button>
        </div>
        <div class="sheet__body">
          <div class="sheet__body-row">
            <span class="sheet__body-label">昵称</span>
            <span class="sheet__body-val">${esc(this.profile.nickname)}</span>
          </div>
          <div class="sheet__rename-row">
            <input class="sheet__rename-input" data-id="sheet-rename-input" type="text"
                   maxlength="${NICKNAME_MAX_LEN * 2}" placeholder="修改昵称" aria-label="新昵称" />
            <button class="sheet__rename-ok" data-act="sheet-rename-ok" type="button">保存</button>
          </div>
        </div>
        <div class="sheet__foot">
          <button class="sheet__danger-btn" data-act="clear-data" type="button">清除所有数据</button>
        </div>
      </div>
    `;
    this.root.appendChild(el);
    this._sheetEl = el;
    this._sheetOpen = true;
    requestFrame(() => el.classList.add('is-open'));
    // Bind sheet-specific events
    el.querySelector('[data-act="sheet-rename-ok"]').addEventListener('click', (e) => {
      e.stopPropagation();
      const input = el.querySelector('[data-id="sheet-rename-input"]');
      this._doRename(input ? input.value : '');
    });
    el.querySelector('[data-act="clear-data"]').addEventListener('click', (e) => {
      e.stopPropagation();
      this._onClearData();
    });
  }

  _closeSheet(silent) {
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

  _doRename(value) {
    const trimmed = value.trim();
    if (trimmed.length < NICKNAME_MIN_LEN || trimmed.length > NICKNAME_MAX_LEN) {
      this._toast(`昵称需 ${NICKNAME_MIN_LEN}~${NICKNAME_MAX_LEN} 个字`);
      return;
    }
    const name = trimmed.slice(0, NICKNAME_MAX_LEN);
    this.profile.nickname = name;
    saveProfile(this.profile);
    this._closeSheet();
    this.render();
    this._toast('已改名 ✓');
  }

  _onClearData() {
    this._confirm({
      title: '清除所有数据？',
      message: '此操作不可撤销，所有打卡记录、考试成绩、学习进度将被删除。',
      confirmText: '确认清除',
      danger: true,
      onConfirm: () => {
        clearAll();
        this.profile = null;
        this._quizSession = null;
        this._examSession = null;
        this._lastExamResult = null;
        this._closeSheet();
        this.screen = 'launcher';
        this.render();
        this._toast('已清除所有数据');
      },
    });
  }

  // ===================== 二次确认弹窗 =====================
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

  _closeConfirm(silent) {
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

  // ===================== 庆祝动画 =====================
  _celebrate(msCount) {
    if (!this.root) return;
    this._endCelebrate(true);
    const overlay = document.createElement('div');
    overlay.className = 'celebrate';
    overlay.setAttribute('data-id', 'celebrate');
    const particles = Array.from({ length: 14 }, (_, i) => {
      const left = 8 + (i * 6) % 84;
      const delay = (i % 7) * 90;
      const dur = 1100 + (i % 5) * 160;
      return `<span class="celebrate__particle" style="left:${left}%;animation-delay:${delay}ms;animation-duration:${dur}ms">${i % 2 ? '⭐' : '✨'}</span>`;
    }).join('');
    overlay.innerHTML = `
      <div class="celebrate__particles">${particles}</div>
      <div class="celebrate__card">
        <div class="celebrate__big">⭐</div>
        <div class="celebrate__title">第 ${msCount * MILESTONE_STEP} 天！</div>
        <div class="celebrate__sub">恭喜达成第 ${msCount} 个里程碑 🎉</div>
        <button class="celebrate__btn" data-act="celebrate-ok" type="button">继续加油</button>
      </div>
    `;
    this.root.appendChild(overlay);
    this._celebrateEl = overlay;
    this._celebrating = true;
    requestFrame(() => overlay.classList.add('is-open'));
    overlay.querySelector('[data-act="celebrate-ok"]').addEventListener('click', () => this._endCelebrate());
    this._celebrateTimer = setTimeout(() => this._endCelebrate(), 3600);
  }

  _endCelebrate(skipToast) {
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
    if (!skipToast) this._toast('继续加油，下一个里程碑在前方 ⭐');
  }

  // ===================== 题库更新 =====================
  async _onCheckUpdate(btn) {
    const UPDATE_URL = 'https://raw.githubusercontent.com/SCUT-Mida/playbox/main/apps/tuo-ye/data/questions.json';
    const oldText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '正在检查…';
    try {
      const resp = await fetch(UPDATE_URL + '?t=' + Date.now());
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const pack = await resp.json();
      if (!pack || !pack.parts) throw new Error('数据格式错误');
      const oldBank = getBankInfo();
      const newTotal = (pack.parts.part5?.questions?.length || 0)
        + (pack.parts.part6?.passages?.reduce((s, p) => s + (p.items?.length || 0), 0) || 0)
        + (pack.parts.part7?.passages?.reduce((s, p) => s + (p.items?.length || 0), 0) || 0);
      // 比较版本
      if (pack.version === oldBank.version && !oldBank.customPack) {
        btn.textContent = '已是最新版本';
        this._toast('当前已是最新题库（v' + pack.version + '）');
      } else {
        loadCustomPack(pack);
        saveCustomQuestions(pack);
        btn.textContent = '更新成功！';
        this._toast(`题库已更新！共 ${newTotal} 道题目`);
        setTimeout(() => this.render(), 1500);
      }
    } catch (err) {
      btn.textContent = oldText;
      btn.disabled = false;
      this._toast('更新失败：' + (err.message || '网络错误'));
    }
  }

  _onRemoveCustomPack() {
    this._confirm({
      title: '移除额外题包？',
      message: '额外题目将从题库中移除，不影响内置题目。',
      confirmText: '确认移除',
      danger: true,
      onConfirm: () => {
        loadCustomPack(null);
        clearCustomQuestions();
        this.render();
        this._toast('已移除额外题包');
      },
    });
  }

  // ===================== 学习标记 =====================
  _onToggleLearned(cat, id) {
    if (!cat || !id) return;
    if (isStudied(cat, id)) {
      unmarkStudied(cat, id);
    } else {
      markStudied(cat, id);
      this._toast('已标记为已学习 ✓');
    }
    this._refreshStudyProgress();
  }

  _refreshStudyProgress() {
    const tabs = this.root.querySelectorAll('.study-tab');
    const cats = getCategoryNames();
    tabs.forEach((tab, i) => {
      const c = cats[i];
      if (!c) return;
      const countEl = tab.querySelector('.study-tab__count');
      if (countEl) countEl.textContent = `${studiedCount(c.key)}/${getMaterials(c.key).length}`;
    });
    const cards = this.root.querySelectorAll('.study-card');
    cards.forEach((card) => {
      const btn = card.querySelector('.learned-toggle');
      if (!btn) return;
      const id = btn.dataset.id;
      const cat = btn.dataset.cat;
      const studied = isStudied(cat, id);
      btn.classList.toggle('is-on', studied);
      btn.textContent = studied ? '✓ 已学习' : '标记已学习';
      card.classList.toggle('is-studied', studied);
    });
  }

  // ===================== 发音 =====================
  _onSpeak(text, slow) {
    if (!text) return;
    speak(text, { slow: !!slow });
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

// ===================== 工具函数 =====================
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function requestFrame(fn) {
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(fn);
  else setTimeout(fn, 0);
}
