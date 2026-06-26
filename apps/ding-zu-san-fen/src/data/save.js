// 对局存档：在"波间空档 / 开局布阵"等无存活敌军的干净时点快照当前战局，
// 让玩家下次进入时可"基于存档继续玩"，而非永远从头开始。
// 仅保存可干净恢复的状态（不保存战斗中瞬时敌人/投射物），恢复时回到最近一次安全检查点。
// localStorage 不可用时静默降级（功能不可用，但不影响游玩）。

const SAVE_KEY = 'dzsf_battle_v1';

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
    localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
  } catch {
    /* 配额/隐私模式写入失败 —— 忽略 */
  }
}

export function loadBattle() {
  if (!storageAvailable()) return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
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
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* noop */
  }
}
