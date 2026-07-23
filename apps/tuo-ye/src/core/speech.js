// ============================================================================
// 托业模考 · 语音合成模块（双引擎：Web Speech API + 有道 TTS 音频兜底）
//
// 问题：小米澎湃系统（HyperOS）、华为 EMUI 等国产 ROM 的 WebView 通常没有
// 英文 TTS 引擎，speechSynthesis.getVoices() 返回空数组，导致静默失败。
//
// 方案：两级降级——
//   1. 优先使用浏览器原生 speechSynthesis（质量最好，离线可用）
//   2. 若无英文语音（国产 ROM 常见），回退到有道词典 TTS 音频接口
//      （有道 dictvoice API 无需 Key、无 CORS 限制、单词短语均可朗读）
// ============================================================================

// —— 原生 Speech Synthesis —— 

function hasNativeAPI() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

// 缓存已选好的英文语音对象
let _cachedVoice = null;
let _voiceChecked = false; // 是否已确认有/无英文语音（避免每次发音都遍历）

function pickEnglishVoice() {
  if (!hasNativeAPI()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || !voices.length) return null;
  // 优先选高质量的英文女声（更自然），其次任意英文语音
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

// 提前预热语音列表（Chrome 异步加载 voices）
export function warmupVoices() {
  if (!hasNativeAPI()) return;
  hasEnglishVoice(); // 触发首次检测
  // Chrome 的 voices 可能尚未加载完成，注册一次性监听
  if (!window.speechSynthesis.getVoices().length) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      _cachedVoice = pickEnglishVoice();
      _voiceChecked = true;
    }, { once: true });
  }
}

// —— 有道词典 TTS 音频兜底 ——
// 有道 dictvoice API：https://dict.youdao.com/dictvoice?audio=TEXT&type=2
// type=1 英式英语，type=2 美式英语。无需 API Key，无 CORS 限制。
// 适合单词和短句（长文本可能被截断，限制约 200 字符）。

let _audioEl = null; // 复用同一个 Audio 元素

function speakWithAudio(text, opts = {}) {
  // 停止上一个音频
  if (_audioEl) {
    _audioEl.pause();
    _audioEl = null;
  }
  // 长文本截断（有道 API 对超长文本支持不佳）
  const truncated = text.length > 200 ? text.slice(0, 200) : text;
  const type = opts.slow ? 1 : 2; // slow 模式用英式（语速天然偏慢）
  const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(truncated)}&type=${type}`;

  _audioEl = new Audio(url);
  _speaking = true;
  _audioEl.onended = () => { _speaking = false; };
  _audioEl.onerror = () => { _speaking = false; };
  _audioEl.play().catch(() => {
    _speaking = false;
    // 网络错误时静默
  });
  return true;
}

// —— 统一对外接口 ——

/**
 * 是否支持发音（原生 TTS 或音频兜底至少有一个可用）。
 * 音频兜底始终可用（只需网络），故始终返回 true。
 */
export function isSpeechSupported() {
  return true; // 有道音频兜底始终可用
}

/**
 * 当前使用的发音引擎。
 * @returns {'native'|'audio'|'none'}
 */
export function getSpeechEngine() {
  if (hasNativeAPI() && hasEnglishVoice()) return 'native';
  return 'audio'; // 有道音频兜底
}

let _speaking = false;

/**
 * 发音。
 * @param {string} text — 要朗读的英文文本
 * @param {object} [opts] — { rate: 0.5~2, slow: boolean }
 * @returns {boolean} 是否成功开始发音
 */
export function speak(text, opts = {}) {
  if (!text) return false;

  // 策略 1：原生 speechSynthesis（有英文语音时优先）
  if (hasNativeAPI() && hasEnglishVoice()) {
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.voice = _cachedVoice;
      utter.lang = _cachedVoice?.lang || 'en-US';
      utter.rate = opts.slow ? 0.6 : (opts.rate || 0.9);
      utter.pitch = 1;
      utter.volume = 1;

      utter.onstart = () => { _speaking = true; };
      utter.onend = () => { _speaking = false; };
      utter.onerror = () => {
        _speaking = false;
        // 原生失败时回退到音频
        speakWithAudio(text, opts);
      };

      _speaking = true;
      window.speechSynthesis.speak(utter);
      return true;
    } catch (_) {
      // 原生 API 抛异常时回退
    }
  }

  // 策略 2：有道 TTS 音频兜底（国产 ROM 无英文语音时）
  return speakWithAudio(text, opts);
}

/** 停止当前发音。 */
export function stopSpeaking() {
  _speaking = false;
  if (hasNativeAPI()) {
    try { window.speechSynthesis.cancel(); } catch (_) {}
  }
  if (_audioEl) {
    _audioEl.pause();
    _audioEl = null;
  }
}

/** 当前是否正在发音。 */
export function isSpeaking() {
  return _speaking;
}
