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

// 有道 TTS 音频（单词和句子均支持）
function speakWithAudio(text, opts = {}) {
  if (_audioEl) { _audioEl.pause(); _audioEl = null; }
  const truncated = text.length > 500 ? text.slice(0, 500) : text;
  const type = opts.slow ? 1 : 2;
  const url = 'https://dict.youdao.com/dictvoice?audio=' + encodeURIComponent(truncated) + '&type=' + type;
  _audioEl = new Audio(url);
  _speaking = true;
  _audioEl.onended = () => { _speaking = false; };
  _audioEl.onerror = () => { _speaking = false; };
  _audioEl.play().catch(() => { _speaking = false; });
  return true;
}

export function isSpeechSupported() { return true; }

export function getSpeechEngine() {
  if (hasNativeAPI() && hasEnglishVoice()) return 'native';
  return 'audio';
}

/**
 * 发音策略（按文本长度分流）：
 * - 短文本（≤40字符，单词/短语）：用原生 TTS（国产 ROM 的中文引擎能读单词）
 * - 长文本（>40字符，句子）：直接用有道音频（原生引擎对英文长句静默失败）
 *
 * 这是关键：原生 TTS 对单词会触发 onstart 并真正发声，
 * 但对英文长句也会触发 onstart 却不出声（静默失败），
 * 导致超时检测无效。按长度分流可绕过这个问题。
 */
export function speak(text, opts = {}) {
  if (!text) return false;
  stopSpeaking();
  const isShort = text.length <= 40;

  if (isShort && hasNativeAPI()) {
    // 短文本：先试原生
    let nativeStarted = false;
    try {
      const utter = new SpeechSynthesisUtterance(text);
      if (_cachedVoice) { utter.voice = _cachedVoice; utter.lang = _cachedVoice.lang || 'en-US'; }
      else { utter.lang = 'en-US'; }
      utter.rate = opts.slow ? 0.6 : (opts.rate || 0.9);
      utter.onstart = () => { nativeStarted = true; _speaking = true; };
      utter.onend = () => { _speaking = false; };
      utter.onerror = () => { _speaking = false; if (!nativeStarted) speakWithAudio(text, opts); };
      _speaking = true;
      window.speechSynthesis.speak(utter);
      setTimeout(() => { if (!nativeStarted) { try{window.speechSynthesis.cancel()}catch(_){}; _speaking=false; speakWithAudio(text, opts); } }, 1500);
      return true;
    } catch (_) { _speaking = false; }
  }

  // 长文本或原生不可用：直接有道音频
  return speakWithAudio(text, opts);
}

export function stopSpeaking() {
  _speaking = false;
  if (hasNativeAPI()) { try { window.speechSynthesis.cancel(); } catch (_) {} }
  if (_audioEl) { _audioEl.pause(); _audioEl = null; }
}

export function isSpeaking() { return _speaking; }
