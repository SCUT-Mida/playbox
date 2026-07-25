// ============================================================================
// 存档：localStorage 持久化（单槽）。
// 通过 storage 访问器隔离 localStorage，便于 Node 单测注入内存版。
// ============================================================================
import { SAVE_KEY } from '../config.js';

let storage = null;
try {
  if (typeof localStorage !== 'undefined') storage = localStorage;
} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }

export function _setStorage(s) { storage = s; }

export function hasSave() {
  try { return !!(storage && storage.getItem(SAVE_KEY)); } catch (_) { return false; }
}

export function saveGame(state) {
  try {
    if (storage && state) {
      storage.setItem(SAVE_KEY, JSON.stringify(state));
      return true;
    }
  } catch (_) {}
  return false;
}

export function loadGame() {
  try {
    const raw = storage ? storage.getItem(SAVE_KEY) : null;
    if (!raw) return null;
    return migrateSave(JSON.parse(raw));
  } catch (_) { return null; }
}

// 存档兼容：
//   1) 旧版科技等级为全局 state.techLevels（所有势力共享），现改为按势力独立的
//      state.techLevelsByFaction。旧存档中已研究的科技视作玩家势力掌握；AI 从 0 起算。
//   2) 新增城市职官将军 / 军师（generalHeroId / strategistHeroId），旧存档城市缺省 → 补 null。
function migrateSave(state) {
  if (!state) return state;
  if (!state.techLevelsByFaction) {
    state.techLevelsByFaction = state.techLevels
      ? { [state.playerFactionId]: { ...state.techLevels } }
      : {};
    delete state.techLevels;
  }
  if (Array.isArray(state.cities)) {
    for (const c of state.cities) {
      if (c.generalHeroId === undefined) c.generalHeroId = null;
      if (c.strategistHeroId === undefined) c.strategistHeroId = null;
    }
  }
  return state;
}

export function clearSave() {
  try { if (storage) storage.removeItem(SAVE_KEY); return true; } catch (_) { return false; }
}
