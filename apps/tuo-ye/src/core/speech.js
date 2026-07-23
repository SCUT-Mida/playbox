// ============================================================================
// 托业模考 · 语音合成模块（Web Speech API 封装）
//
// 利用浏览器内置的 SpeechSynthesis API 实现英文发音，无需后端 / API Key。
// 支持单词和句子发音，自动选择英文语音，兼容不支持的环境（静默降级）。
// ============================================================================

// 检测浏览器是否支持语音合成
export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// 缓存已选好的英文语音对象（避免每次发音都遍历语音列表）
let _cachedVoice = null;

// 从语音列表中选一个英文语音（优先 en-US，其次 en-GB，再次任意 en）
function pickEnglishVoice() {
  if (!isSpeechSupported()) return null;
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

// 确保语音已加载（Chrome 异步加载 voices，需监听 onvoiceschanged）
function ensureVoice() {
  if (_cachedVoice) return _cachedVoice;
  _cachedVoice = pickEnglishVoice();
  return _cachedVoice;
}

// 提前预热语音列表（Chrome 异步加载，调用此方法触发加载）
export function warmupVoices() {
  if (!isSpeechSupported()) return;
  ensureVoice();
  // Chrome 的 voices 可能尚未加载完成，注册一次性监听
  if (!window.speechSynthesis.getVoices().length) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      _cachedVoice = pickEnglishVoice();
    }, { once: true });
  }
}

// 当前是否正在发音
let _speaking = false;

/**
 * 发音。
 * @param {string} text — 要朗读的英文文本
 * @param {object} [opts] — { rate: 0.5~2 (默认 0.9), slow: boolean (慢速模式 0.6) }
 * @returns {boolean} 是否成功开始发音（不支持时返回 false）
 */
export function speak(text, opts = {}) {
  if (!isSpeechSupported() || !text) return false;
  // 停止当前正在进行的发音
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  const voice = ensureVoice();
  if (voice) utter.voice = voice;
  // 语速：默认 0.9（略慢，适合语言学习），slow 模式 0.6
  utter.rate = opts.slow ? 0.6 : (opts.rate || 0.9);
  utter.pitch = 1;
  utter.volume = 1;

  utter.onstart = () => { _speaking = true; };
  utter.onend = () => { _speaking = false; };
  utter.onerror = () => { _speaking = false; };

  window.speechSynthesis.speak(utter);
  return true;
}

/** 停止当前发音。 */
export function stopSpeaking() {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
  _speaking = false;
}

/** 当前是否正在发音。 */
export function isSpeaking() {
  return _speaking;
}
