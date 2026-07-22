// ============================================================================
// 托业模考 · 学习材料逻辑模块（纯函数）
//
// 管理学习内容：词汇、语法、商务短语。
// 数据来源：data/study-materials.json（由 questionBank.js 加载）。
// ============================================================================
import { getStudyMaterials, getStudyCategory } from './questionBank.js';
import { STUDY_CATEGORIES } from '../config.js';

// 获取所有分类名。
export function getCategoryNames() {
  return Object.entries(STUDY_CATEGORIES).map(([key, info]) => ({
    key,
    name: info.name,
    icon: info.icon,
  }));
}

// 获取某个分类的全部学习材料。
export function getMaterials(category) {
  const data = getStudyCategory(category);
  if (!data || !data.items) return [];
  return data.items;
}

// 获取某个分类的材料数量。
export function getMaterialCount(category) {
  return getMaterials(category).length;
}

// 全部材料数量。
export function getTotalMaterialCount() {
  let total = 0;
  for (const key of Object.keys(STUDY_CATEGORIES)) {
    total += getMaterialCount(key);
  }
  return total;
}

// 获取学习材料版本信息。
export function getStudyVersion() {
  const data = getStudyMaterials();
  return {
    version: data?.version || 'unknown',
    lastUpdated: data?.lastUpdated || 'unknown',
  };
}

// 格式化单词卡数据（统一输出格式，便于 UI 渲染）。
export function formatVocabCard(item) {
  return {
    id: item.id,
    type: 'vocab',
    title: item.word || '',
    subtitle: item.phonetic || '',
    body: item.definition || '',
    example: item.example || '',
  };
}

// 格式化语法卡数据。
export function formatGrammarCard(item) {
  return {
    id: item.id,
    type: 'grammar',
    title: item.title || '',
    subtitle: '',
    body: item.explanation || '',
    examples: item.examples || [],
  };
}

// 格式化商务短语卡数据。
export function formatBusinessCard(item) {
  return {
    id: item.id,
    type: 'business',
    title: item.phrase || '',
    subtitle: item.meaning || '',
    body: item.usage || '',
  };
}

// 按 category 统一格式化卡片。
export function formatCard(category, item) {
  switch (category) {
    case 'vocab': return formatVocabCard(item);
    case 'grammar': return formatGrammarCard(item);
    case 'business': return formatBusinessCard(item);
    default: return { id: item.id, title: '', body: '' };
  }
}

// 批量格式化某分类的全部卡片。
export function getFormattedCards(category) {
  return getMaterials(category).map((item) => formatCard(category, item));
}
