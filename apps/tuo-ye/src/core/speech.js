// ============================================================================
// 托业模考 · 语音合成模块
// 策略：单词/短语 → 有道API（快）；句子 → 本地预生成MP3（可靠）
// ============================================================================
import { getLocalAudio } from './audioManifest.js';

function hasNativeAPI() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

let _cachedVoice = null;
let _voiceChecked = false;

function pickEnglishVoice() {
  if (!hasNativeAPI()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || !voices.length) return null;
  const enUS = voices.find((v) => v.lang === 'en-US' && /female|samantha|google/i.test(v.name));
  if (enUS) return enUS;
  const enUSAny = voices.find((v) => v.lang === 'en-US');
  if (enUSAny) return enUSAny;
  const enGB = voices.find((v) => v.lang === 'en-GB');
  if (enGB) return enGB;
  return voices.find((v) => v.lang && v.lang.startsWith('en')) || null;
}

function hasEnglishVoice() {
  if (_voiceChecked) return _cachedVoice !== null;
  _voiceChecked = true;
  _cachedVoice = pickEnglishVoice();
  return _cachedVoice !== null;
}

export function warmupVoices() {
  if (!hasNativeAPI()) return;
  hasEnglishVoice();
  if (hasNativeAPI() && !window.speechSynthesis.getVoices().length) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      _cachedVoice = pickEnglishVoice();
      _voiceChecked = true;
    }, { once: true });
  }
}

let _audioEl = null;
let _speaking = false;
let _speakingBtn = null; // 当前正在发音的按钮元素（用于动画）

// 有道 TTS（单词/短语专用，速度快）
function speakWithYoudao(text) {
  if (_audioEl) { _audioEl.pause(); _audioEl = null; }
  const url = 'https://dict.youdao.com/dictvoice?audio=' + encodeURIComponent(text) + '&type=2';
  _audioEl = new Audio(url);
  _speaking = true;
  _audioEl.onended = () => { _speaking = false; _clearBtnAnim(); };
  _audioEl.onerror = () => { _speaking = false; _clearBtnAnim(); };
  _audioEl.play().catch(() => { _speaking = false; _clearBtnAnim(); });
  return true;
}

// 播放本地音频文件
function speakLocal(url) {
  if (_audioEl) { _audioEl.pause(); _audioEl = null; }
  _audioEl = new Audio(url);
  _speaking = true;
  _audioEl.onended = () => { _speaking = false; _clearBtnAnim(); };
  _audioEl.onerror = () => { _speaking = false; _clearBtnAnim(); };
  _audioEl.play().catch(() => { _speaking = false; _clearBtnAnim(); });
  return true;
}

export function isSpeechSupported() { return true; }
export function getSpeechEngine() {
  if (hasNativeAPI() && hasEnglishVoice()) return 'native';
  return 'audio';
}

/** 判断是否为句子（有句号或长度>35） */
function isSentence(text) {
  return text.length > 35 || /\.\s*$/.test(text) || /\?\s*$/.test(text);
}

/**
 * 发音入口
 */
export function speak(text, opts = {}) {
  if (!text) return false;
  stopSpeaking();

  // 句子 → 优先本地预生成 MP3
  if (isSentence(text)) {
    const localUrl = getLocalAudio(text);
    if (localUrl) return speakLocal(localUrl);
    // 本地没有 → 百度兜底
    return speakWithBaidu(text);
  }

  // 单词/短语 → 有道 API（快、可靠）
  return speakWithYoudao(text);
}

// 百度 TTS（句子兜底，预生成文件没覆盖时）
function speakWithBaidu(text) {
  if (_audioEl) { _audioEl.pause(); _audioEl = null; }
  const url = 'https://fanyi.baidu.com/gettts?lan=en&text=' + encodeURIComponent(text.slice(0, 500)) + '&spd=4&source=web';
  _audioEl = new Audio(url);
  _speaking = true;
  _audioEl.onended = () => { _speaking = false; _clearBtnAnim(); };
  _audioEl.onerror = () => { _speaking = false; _clearBtnAnim(); };
  _audioEl.play().catch(() => { _speaking = false; _clearBtnAnim(); });
  return true;
}

/** 绑定按钮动画 */
export function setSpeakingBtn(btn) {
  _speakingBtn = btn;
  if (!btn) return;
  btn.classList.add('is-speaking');
  // 纯 JS 动画：切换波纹符号
  const frames = ['▁', '▃', '▅', '▇', '▅', '▃'];
  let i = 0;
  if (_waveTimer) clearInterval(_waveTimer);
  _waveTimer = setInterval(() => {
    if (!_speakingBtn || _speakingBtn !== btn) { clearInterval(_waveTimer); _waveTimer = null; return; }
    btn.textContent = frames[i % frames.length];
    i++;
  }, 120);
}

let _waveTimer = null;

function _clearBtnAnim() {
  if (_waveTimer) { clearInterval(_waveTimer); _waveTimer = null; }
  if (_speakingBtn) {
    _speakingBtn.classList.remove('is-speaking');
    // 恢复原始按钮内容
    _speakingBtn.innerHTML = '<span class="si-on">🔊</span><span class="si-wave"><i></i><i></i><i></i></span>';
    _speakingBtn = null;
  }
}

export function stopSpeaking() {
  _speaking = false;
  _clearBtnAnim();
  if (hasNativeAPI()) { try { window.speechSynthesis.cancel(); } catch (_) {} }
  if (_audioEl) { _audioEl.pause(); _audioEl = null; }
}

export function isSpeaking() { return _speaking; }
