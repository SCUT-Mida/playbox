// ============================================================================
// 托业模考 · 语音合成模块（双引擎：Web Speech API + 有道 TTS 音频兜底）
//
// 问题：小米澎湃系统（HyperOS）、华为 EMUI 等国产 ROM 的 WebView 通常没有
// 英文 TTS 引擎，speechSynthesis.getVoices() 返回空数组，导致静默失败。
//
// 方案：两级降级——
//   1. 有英文语音 → 原生 speechSynthesis（质量最好，离线可用）
//   2. 无英文语音 → 直接用有道音频，跳过原生（避免国产 ROM 静默失败）
// ============================================================================

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
  const enAny = voices.find((v) => v.lang && v.lang.startsWith('en'));
  return enAny || null;
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
  if (!window.speechSynthesis.getVoices().length) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      _cachedVoice = pickEnglishVoice();
      _voiceChecked = true;
    }, { once: true });
  }
}

let _audioEl = null;
let _speaking = false;

// 音频发音：有道(单词) → 百度(句子) 双保险
function speakWithAudio(text, opts = {}) {
  if (_audioEl) { _audioEl.pause(); _audioEl = null; }
  const truncated = text.length > 500 ? text.slice(0, 500) : text;
  const encoded = encodeURIComponent(truncated);
  const youdaoUrl = 'https://dict.youdao.com/dictvoice?audio=' + encoded + '&type=2';
  const baiduUrl = 'https://fanyi.baidu.com/gettts?lan=en&text=' + encoded + '&spd=3&source=web';

  let triedBaidu = false;
  _speaking = true;

  function tryBaidu() {
    if (triedBaidu) { _speaking = false; return; } // 两个都失败了
    triedBaidu = true;
    _audioEl = new Audio(baiduUrl);
    _audioEl.onended = () => { _speaking = false; };
    _audioEl.onerror = () => { _speaking = false; };
    _audioEl.play().catch(() => { _speaking = false; });
  }

  // 先试有道（单词/短语能成功，句子会 500 → onerror）
  _audioEl = new Audio(youdaoUrl);
  _audioEl.onended = () => { _speaking = false; };
  _audioEl.onerror = () => { tryBaidu(); }; // 有道失败 → 试百度
  _audioEl.play().catch(() => { tryBaidu(); }); // play() 被拒 → 试百度
  return true;
}

export function isSpeechSupported() { return true; }

export function getSpeechEngine() {
  if (hasNativeAPI() && hasEnglishVoice()) return 'native';
  return 'audio';
}

/**
 * 发音策略：统一用有道音频。
 * 有道 dictvoice API 对单词和句子都能读，国产手机兼容性好。
 * 如果有英文语音则优先原生（质量更好），否则全走有道。
 */
export function speak(text, opts = {}) {
  if (!text) return false;
  stopSpeaking();

  // 有英文语音 → 原生 TTS（桌面浏览器，质量好）
  if (hasNativeAPI() && hasEnglishVoice()) {
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.voice = _cachedVoice;
      utter.lang = _cachedVoice.lang || 'en-US';
      utter.rate = opts.slow ? 0.6 : (opts.rate || 0.9);
      utter.onstart = () => { _speaking = true; };
      utter.onend = () => { _speaking = false; };
      utter.onerror = () => { _speaking = false; speakWithAudio(text, opts); };
      _speaking = true;
      window.speechSynthesis.speak(utter);
      return true;
    } catch (_) { _speaking = false; }
  }

  // 无英文语音（国产 ROM）→ 全部用有道
  return speakWithAudio(text, opts);
}

export function stopSpeaking() {
  _speaking = false;
  if (hasNativeAPI()) { try { window.speechSynthesis.cancel(); } catch (_) {} }
  if (_audioEl) { _audioEl.pause(); _audioEl = null; }
}

export function isSpeaking() { return _speaking; }
