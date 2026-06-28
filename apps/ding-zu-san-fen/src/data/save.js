// 对局存档：在"波间空档 / 开局布阵"等无存活敌军的干净时点快照当前战局，
// 让玩家下次进入时可"基于存档继续玩"，而非永远从头开始。
// 仅保存可干净恢复的状态（不保存战斗中瞬时敌人/投射物），恢复时回到最近一次安全检查点。
// 多存档槽：对局快照按当前活跃存档槽隔离（dzsf_battle_v1_slot_<n>），切槽互不干扰。
// localStorage 不可用时静默降级（功能不可用，但不影响游玩）。

import { getActiveSlot } from './meta.js';

const BATTLE_PREFIX = 'dzsf_battle_v1_slot_';
const LEGACY_BATTLE = 'dzsf_battle_v1';

function battleKey() { return `${BATTLE_PREFIX}${getActiveSlot()}`; }

// 旧版单档对局迁移到当前活跃槽（仅当该槽无对局时，避免覆盖）
function migrateBattleLegacy() {
  if (!storageAvailable()) return;
  try {
    const old = localStorage.getItem(LEGACY_BATTLE);
    if (old && !localStorage.getItem(battleKey())) {
      localStorage.setItem(battleKey(), old);
    }
    if (old) localStorage.removeItem(LEGACY_BATTLE);
  } catch {
    /* noop */
  }
}

function storageAvailable() {
  try {
    return typeof localStorage !== 'undefined' && localStorage;
  } catch {
    return false;
  }
}

// snapshot: { levelKey, waveIndex, lives, gold, morale, deployed:[{id,col,row,level}] }
export function saveBattle(snapshot) {
  if (!snapshot || !storageAvailable()) return;
  try {
    localStorage.setItem(battleKey(), JSON.stringify(snapshot));
  } catch {
    /* 配额/隐私模式写入失败 —— 忽略 */
  }
}

export function loadBattle() {
  if (!storageAvailable()) return null;
  migrateBattleLegacy();
  try {
    const raw = localStorage.getItem(battleKey());
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || typeof s.levelKey !== 'string' || !Array.isArray(s.deployed)) return null;
    return s;
  } catch {
    return null;
  }
}

export function hasBattle() {
  return loadBattle() != null;
}

export function clearBattle() {
  if (!storageAvailable()) return;
  try {
    localStorage.removeItem(battleKey());
  } catch {
    /* noop */
  }
}
