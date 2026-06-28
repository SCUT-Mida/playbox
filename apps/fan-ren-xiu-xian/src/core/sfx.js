// ============================================================================
// 音效系统：用 Web Audio API 现场合成短音（无外部音频文件，保持体积小、加载快）。
// 所有调用均做了环境与异常兜底：无 AudioContext（Node / 老旧浏览器 / jsdom）时静默 no-op，
// 绝不抛错影响游戏主流程。开关持久化于 localStorage。
// ============================================================================
const ENABLE_KEY = 'frxx_sfx_on';

let _ctx = null;          // 懒创建的 AudioContext（首次发声时建）
let _enabled = readEnabled();
let _lastUnlock = 0;      // 上次尝试解锁（resume）的时间，节流

function readEnabled() {
  try {
    if (typeof localStorage === 'undefined') return true;
    const v = localStorage.getItem(ENABLE_KEY);
    // 未设置时默认开启；显式 '0' 才关闭
    return v == null ? true : v !== '0';
  } catch (_) { return true; }
}

export function isSfxEnabled() { return _enabled; }

export function setSfxEnabled(on) {
  _enabled = !!on;
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(ENABLE_KEY, on ? '1' : '0'); } catch (_) {}
  // 开启时顺手播一个轻提示音，给玩家即时反馈
  if (_enabled) playSfx('click');
  return _enabled;
}

// 取得可用的 AudioContext（浏览器专属；其它环境返回 null）
function ctx() {
  if (_ctx) return _ctx;
  try {
    const AC = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
    if (typeof AC !== 'function') return null;
    _ctx = new AC();
  } catch (_) { _ctx = null; }
  return _ctx;
}

// 浏览器自动播放策略要求「用户手势内」才能发声；首次交互后尝试 resume。
// 在 Node / jsdom 下 ctx() 为 null，整段 no-op。
function ensureRunning() {
  const c = ctx();
  if (!c) return;
  const now = (typeof Date !== 'undefined' && Date.now) ? Date.now() : 0;
  if (c.state === 'suspended' && now - _lastUnlock > 800) {
    _lastUnlock = now;
    try { const p = c.resume(); if (p && p.catch) p.catch(() => {}); } catch (_) {}
  }
}

// 单个合成音符：oscillator → gain（指数衰减包络）→ destination
function tone(freq, dur, opts = {}) {
  const c = ctx();
  if (!c) return;
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = opts.type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.slideTo), t0 + dur);
  const vol = opts.vol == null ? 0.12 : opts.vol;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// 用「起音延迟」串起多段音符，合成小旋律 / 音效
function seq(notes, opts = {}) {
  const c = ctx();
  if (!c) return;
  let delay = 0;
  for (const n of notes) {
    const dur = n.dur || 0.12;
    // 闭包捕获 delay：在绝对时间点上排程，避免 setTimeout 抖动
    const at = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = n.type || opts.type || 'sine';
    osc.frequency.setValueAtTime(n.f, at);
    if (n.slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, n.slideTo), at + dur);
    const vol = n.vol == null ? (opts.vol == null ? 0.12 : opts.vol) : n.vol;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(vol, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(at);
    osc.stop(at + dur + 0.02);
    delay += (n.gap == null ? dur : n.gap);
  }
}

// 音效编排表：每个名字 → 一段合成动作。
const SFX = {
  click:      () => tone(520, 0.06, { type: 'triangle', vol: 0.07 }),
  cultivate:  () => seq([{ f: 392, dur: 0.10, type: 'sine' }, { f: 523, dur: 0.12, type: 'sine' }], { vol: 0.08 }),
  epiphany:   () => seq([{ f: 523, dur: 0.10 }, { f: 659, dur: 0.10 }, { f: 784, dur: 0.10 }, { f: 1047, dur: 0.18 }], { vol: 0.10 }),
  explore:    () => seq([{ f: 440, dur: 0.08, type: 'triangle' }, { f: 660, dur: 0.12, type: 'triangle' }], { vol: 0.08 }),
  battle_hit: () => tone(180, 0.10, { type: 'square', vol: 0.09, slideTo: 90 }),
  battle_win: () => seq([{ f: 523, dur: 0.10 }, { f: 659, dur: 0.10 }, { f: 880, dur: 0.20 }], { vol: 0.10 }),
  battle_lose:() => seq([{ f: 330, dur: 0.14, type: 'sawtooth' }, { f: 220, dur: 0.22, type: 'sawtooth' }], { vol: 0.09 }),
  reward:     () => seq([{ f: 784, dur: 0.08 }, { f: 1047, dur: 0.14 }], { vol: 0.09, type: 'triangle' }),
  breakthrough: () => seq([{ f: 440, dur: 0.10 }, { f: 554, dur: 0.10 }, { f: 659, dur: 0.10 }, { f: 880, dur: 0.26 }], { vol: 0.11 }),
  fail:       () => tone(200, 0.18, { type: 'sawtooth', vol: 0.08, slideTo: 120 }),
  error:      () => tone(160, 0.12, { type: 'square', vol: 0.07 }),
  meet:       () => seq([{ f: 659, dur: 0.08, type: 'sine' }, { f: 880, dur: 0.10, type: 'sine' }, { f: 1175, dur: 0.16, type: 'sine' }], { vol: 0.09 }),
  gift:       () => seq([{ f: 698, dur: 0.08, type: 'triangle' }, { f: 988, dur: 0.14, type: 'triangle' }], { vol: 0.09 }),
};

// 播放指定音效；未知名称 / 关闭 / 无音频环境时静默。
export function playSfx(name) {
  if (!_enabled) return;
  const fn = SFX[name];
  if (!fn) return;
  ensureRunning();
  try { fn(); } catch (_) { /* 合成失败也不影响游戏 */ }
}
