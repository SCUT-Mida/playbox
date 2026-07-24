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
    return JSON.parse(raw);
  } catch (_) { return null; }
}

export function clearSave() {
  try { if (storage) storage.removeItem(SAVE_KEY); return true; } catch (_) { return false; }
}
