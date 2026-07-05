// ============================================================================
// 存档管理模块（Store）：按昵称归档的多档案 localStorage 持久化。
//
// 所有档案集中存于 STORE_KEY 一个 JSON（{ [key]: profile }），
// 当前激活昵称单独存于 ACTIVE_KEY，首启即可直达上次游玩的档案。
// 通过 storage 访问器隔离 localStorage，便于 Node 单测注入。
// 档案结构的规范化由本模块的 migrate 负责（含旧档→tasks 结构迁移），checkin.js 只管业务逻辑。
// ============================================================================
import { STORE_KEY, ACTIVE_KEY, NICKNAME_MAX_LEN, HEARTS_STEP, DEFAULT_TASK_NAME } from '../config.js';
import { normalizeKey, normalizeNickname, newProfile, newTask, nowSec, profileTotals } from './checkin.js';
import { parseISO } from './calendar.js';

let storage = null;
try {
  if (typeof localStorage !== 'undefined') storage = localStorage;
} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }

// 测试 / 注入用
export function _setStorage(s) { storage = s; }

// 读取全部档案 map（已规范化）。存储缺失或损坏时返回空 map，绝不抛错。
export function loadAll() {
  try {
    if (!storage) return {};
    const raw = storage.getItem(STORE_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object') return {};
    const out = {};
    for (const k of Object.keys(obj)) {
      const p = migrate(obj[k]);
      if (p && p.key) out[p.key] = p;
    }
    return out;
  } catch (_) { return {}; }
}

// 落盘全部档案 map。
export function saveAll(map) {
  try {
    if (!storage) return false;
    storage.setItem(STORE_KEY, JSON.stringify(map || {}));
    return true;
  } catch (_) { return false; }
}

// 当前激活档案的 key（无则 null）。
export function getActiveKey() {
  try {
    if (!storage) return null;
    const k = storage.getItem(ACTIVE_KEY);
    return k || null;
  } catch (_) { return null; }
}

// 设置当前激活档案。
export function setActiveKey(key) {
  try {
    if (!storage) return false;
    if (key == null) storage.removeItem(ACTIVE_KEY);
    else storage.setItem(ACTIVE_KEY, key);
    return true;
  } catch (_) { return false; }
}

// 列举所有档案的概要（按最近活跃倒序），供启动器展示。
// total / hearts 为该昵称下全部任务的聚合（见 checkin.profileTotals）。
export function listProfiles() {
  const map = loadAll();
  return Object.values(map)
    .map((p) => {
      const t = profileTotals(p);
      return {
        key: p.key,
        nickname: p.nickname,
        total: t.total,
        hearts: t.hearts,
        taskCount: t.taskCount,
        lastSeen: p.lastSeen || 0,
      };
    })
    .sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
}

// 是否存在任意档案。
export function hasAnyProfile() {
  return Object.keys(loadAll()).length > 0;
}

// 按 key 取完整档案（不存在返回 null）。
export function getProfile(key) {
  const map = loadAll();
  return map[normalizeKey(key)] || null;
}

// 按 key 取档案；不存在则按 nickname 新建并写入。返回写入后的档案。
// nickname 仅在新建时使用；key 优先以传入为准，回退到由 nickname 派生。
export function ensureProfile(nickname, key) {
  const map = loadAll();
  const k = normalizeKey(key || nickname || '未命名');
  if (map[k]) {
    // 已存在：刷新 lastSeen 并回写。
    map[k].lastSeen = nowSec();
    saveAll(map);
    return map[k];
  }
  const p = newProfile(normalizeNickname(nickname, NICKNAME_MAX_LEN) || '未命名', k);
  map[k] = p;
  saveAll(map);
  return p;
}

// 更新某个档案（按 profile.key 覆盖），返回是否成功。
// 先 migrate 补齐字段，避免原始 key 为空时被误判而拒绝写入。
export function upsertProfile(profile) {
  if (!profile || typeof profile !== 'object') return false;
  const p = migrate(profile);
  if (!p || !p.key) return false;
  const map = loadAll();
  map[p.key] = p;
  return saveAll(map);
}

// 删除某个档案（连带清掉激活指针若指向它）。
export function deleteProfile(key) {
  const k = normalizeKey(key);
  const map = loadAll();
  if (!map[k]) return false;
  delete map[k];
  saveAll(map);
  if (getActiveKey() === k) setActiveKey(null);
  return true;
}

// 改昵称：保留同一 key 时仅改展示名；若新昵称派生的 key 与他人冲突则拒绝（返回 false）。
export function renameProfile(key, newNickname) {
  const k = normalizeKey(key);
  const map = loadAll();
  const p = map[k];
  if (!p) return false;
  const newKey = normalizeKey(newNickname);
  if (!newKey) return false;
  p.nickname = normalizeNickname(newNickname, NICKNAME_MAX_LEN);
  // key 变化时需迁移到新 key，且新 key 不能已被占用。
  if (newKey !== k) {
    if (map[newKey]) return false;
    p.key = newKey;
    delete map[k];
    map[newKey] = p;
    if (getActiveKey() === k) setActiveKey(newKey);
  }
  saveAll(map);
  return true;
}

// 任务结构向后兼容：补齐 / 钳制字段，过滤非法 / 重复日期。
function migrateTask(t) {
  if (!t || typeof t !== 'object') return null;
  if (typeof t.name !== 'string' || !t.name.trim()) t.name = DEFAULT_TASK_NAME;
  t.name = normalizeNickname(t.name, NICKNAME_MAX_LEN) || DEFAULT_TASK_NAME;
  if (typeof t.key !== 'string' || !t.key) t.key = normalizeKey(t.name);
  if (!Array.isArray(t.checkins)) t.checkins = [];
  // 仅保留合法（真实日历日）且唯一的 ISO 日期串。
  const seen = new Set();
  const clean = [];
  for (const s of t.checkins) {
    if (typeof s === 'string' && !seen.has(s) && parseISO(s)) {
      seen.add(s);
      clean.push(s);
    }
  }
  t.checkins = clean.sort();
  // 历史最高爱心数（高水位）：旧任务无该字段时按当前进度回填，
  // 避免升级后对已解锁爱心重复庆祝。已写入的高水位不会被进度回退覆盖。
  if (!Number.isFinite(t.maxHearts)) t.maxHearts = Math.floor(t.checkins.length / HEARTS_STEP);
  if (!Number.isFinite(t.createdAt)) t.createdAt = 0;
  return t;
}

// 存档结构向后兼容：补齐 / 钳制字段，并把旧档（顶层 checkins）迁移进 tasks。
// 旧档形如 { nickname, key, checkins, maxHearts } —— 把它整体收进一个默认任务，
// 保证升级后历史打卡不丢，且统一按「昵称 → 多任务」结构处理。
function migrate(p) {
  if (!p || typeof p !== 'object') return null;
  if (typeof p.nickname !== 'string' || !p.nickname.trim()) p.nickname = '未命名';
  p.nickname = normalizeNickname(p.nickname, NICKNAME_MAX_LEN) || '未命名';
  if (typeof p.key !== 'string' || !p.key) p.key = normalizeKey(p.nickname);

  if (!p.tasks || typeof p.tasks !== 'object') {
    // 旧档：把顶层 checkins / maxHearts 收进默认任务。
    const tkey = normalizeKey(DEFAULT_TASK_NAME);
    p.tasks = {};
    p.tasks[tkey] = migrateTask({
      name: DEFAULT_TASK_NAME,
      key: tkey,
      checkins: Array.isArray(p.checkins) ? p.checkins : [],
      maxHearts: Number.isFinite(p.maxHearts) ? p.maxHearts : undefined,
      createdAt: Number.isFinite(p.createdAt) ? p.createdAt : 0,
    });
    p.activeTaskKey = tkey;
  } else {
    // 新档：逐个规范化任务。
    const out = {};
    for (const k of Object.keys(p.tasks)) {
      const t = migrateTask(p.tasks[k]);
      if (t && t.key) out[t.key] = t;
    }
    // 任务全损时兜底一个默认任务，确保档案永远有可打卡单元。
    if (Object.keys(out).length === 0) {
      const tkey = normalizeKey(DEFAULT_TASK_NAME);
      out[tkey] = migrateTask({ name: DEFAULT_TASK_NAME, key: tkey, checkins: [], maxHearts: 0, createdAt: 0 });
    }
    p.tasks = out;
    if (!p.activeTaskKey || !out[p.activeTaskKey]) {
      p.activeTaskKey = Object.keys(out)[0];
    }
  }
  // 清理已迁入任务的旧顶层字段，避免双写造成歧义。
  delete p.checkins;
  delete p.maxHearts;

  if (!Number.isFinite(p.createdAt)) p.createdAt = 0;
  if (!Number.isFinite(p.lastSeen)) p.lastSeen = 0;
  return p;
}

export { migrate, migrateTask };
