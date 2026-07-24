// ============================================================================
// 音频清单：将学习材料文本映射到预生成的 MP3 文件 URL。
// Vite 构建时通过 import.meta.glob 解析实际资源路径。
// ============================================================================
import studyData from '../../data/study-materials.json' with { type: 'json' };

// Vite 构建时加载所有音频文件，返回 URL 映射
const audioFiles = import.meta.glob('../../data/audio/*.mp3', { eager: true, query: '?url', import: 'default' });

// 构建 filename → URL 映射
const _urlMap = {};
for (const [path, url] of Object.entries(audioFiles)) {
  const m = path.match(/\/([^/]+)\.mp3$/);
  if (m) _urlMap[m[1]] = url;
}

// 构建 text(lowercase) → audioId 映射
const _textToId = {};
for (const item of (studyData.categories.vocab.items || [])) {
  if (item.word) _textToId[item.word.toLowerCase().trim()] = item.id;
  if (item.example) _textToId[item.example.toLowerCase().trim()] = item.id + '-ex';
}
for (const item of (studyData.categories.grammar.items || [])) {
  (item.examples || []).forEach((ex, i) => {
    _textToId[ex.toLowerCase().trim()] = item.id + '-' + i;
  });
}
for (const item of (studyData.categories.business.items || [])) {
  if (item.phrase) _textToId[item.phrase.toLowerCase().trim()] = item.id;
}

/**
 * 检查文本是否有预生成本地音频。
 * @returns {string|null} 音频 URL 或 null
 */
export function getLocalAudio(text) {
  if (!text) return null;
  const id = _textToId[text.toLowerCase().trim()];
  return id ? (_urlMap[id] || null) : null;
}

/** 已加载音频数量 */
export function getAudioCount() {
  return Object.keys(_urlMap).length;
}
