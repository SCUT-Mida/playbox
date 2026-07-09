// ============================================================================
// 状态管理模块（State Manager）：角色状态、装备强化、天赋、升级与数值结算。
// 所有数值结算集中于此，UI 只负责调用与渲染，不内含业务逻辑。
// ============================================================================
import {
  BASE_MAX_HP, BASE_MAX_STAMINA, BASE_ATK, BASE_DEF, BASE_MOVE_RANGE,
  MAX_PLUS, AFFIX_AT, AFFIXES, starterEquipment, enhanceCost,
  TALENTS, TALENT_BY_BRANCH, talentCost,
  expToNext, clamp, clampStat, MAX_FLOOR, MEMORY_CHAPTERS, GRID,
} from '../config.js';
import { randInt, pick } from './rng.js';

// 创建一名新角色。
//   opts: { name?, seed?, floor? }
export function newPlayer(rng, opts = {}) {
  const r = rng || Math.random;
  const seed = Number.isFinite(opts.seed) ? opts.seed : randInt(r, 1, 1e9);
  return {
    name: (opts.name || '').toString().slice(0, 8) || '旅者',
    hp: BASE_MAX_HP,
    stamina: BASE_MAX_STAMINA,
    stardust: 0,
    parts: 0,
    level: 1,
    exp: 0,
    equipment: starterEquipment(),
    talents: { survival: 0, combat: 0, luck: 0 },
    floor: Math.max(1, Number.isFinite(opts.floor) ? opts.floor : 1),
    maxFloor: 1,
    memory: Array.from({ length: MEMORY_CHAPTERS.length }, () => false),
    log: [],
    turn: 0,
    seed,
    floorState: null,   // 由 world 生成；存档保存，重载可恢复探索
    ending: null,       // 通关结局记录
    born: 0,
    lastSeen: 0,
  };
}

// —— 存档结构向后兼容：补齐 / 钳制字段，防止旧档或损坏档导致整页闪退 ——
export function migrate(p) {
  if (!p) return p;
  if (typeof p.name !== 'string') p.name = '旅者';
  p.name = p.name.slice(0, 8) || '旅者';
  if (!Number.isFinite(p.hp)) p.hp = BASE_MAX_HP;
  if (!Number.isFinite(p.stamina)) p.stamina = BASE_MAX_STAMINA;
  if (!Number.isFinite(p.stardust) || p.stardust < 0) p.stardust = 0;
  if (!Number.isFinite(p.parts) || p.parts < 0) p.parts = 0;
  if (!Number.isFinite(p.level) || p.level < 1) p.level = 1;
  if (!Number.isFinite(p.exp) || p.exp < 0) p.exp = 0;
  if (!Number.isFinite(p.floor) || p.floor < 1) p.floor = 1;
  if (p.floor > MAX_FLOOR) p.floor = MAX_FLOOR;
  if (!Number.isFinite(p.maxFloor) || p.maxFloor < 1) p.maxFloor = p.floor;
  if (!Number.isFinite(p.seed)) p.seed = 12345;
  if (!Number.isFinite(p.turn) || p.turn < 0) p.turn = 0;
  // 装备补齐
  if (!p.equipment || typeof p.equipment !== 'object') p.equipment = starterEquipment();
  else p.equipment = { ...starterEquipment(), ...p.equipment };
  for (const slot of ['weapon', 'armor', 'booster']) {
    const e = p.equipment[slot];
    if (!e || typeof e !== 'object') { p.equipment[slot] = starterEquipment()[slot]; continue; }
    if (typeof e.name !== 'string') e.name = starterEquipment()[slot].name;
    if (!Number.isFinite(e.stat)) e.stat = starterEquipment()[slot].stat;
    if (!Number.isFinite(e.plus) || e.plus < 0) e.plus = 0;
    if (e.plus > MAX_PLUS) e.plus = MAX_PLUS;
    e.affix = validAffix(e.affix) ? e.affix : null;
  }
  // 天赋补齐
  if (!p.talents || typeof p.talents !== 'object') p.talents = { survival: 0, combat: 0, luck: 0 };
  for (const t of TALENTS) {
    const v = Math.floor(p.talents[t.branch]);
    p.talents[t.branch] = (!Number.isFinite(v) || v < 0) ? 0 : Math.min(v, t.maxRank);
  }
  // 记忆数组补齐到章节长度
  if (!Array.isArray(p.memory)) p.memory = [];
  while (p.memory.length < MEMORY_CHAPTERS.length) p.memory.push(false);
  p.memory = p.memory.slice(0, MEMORY_CHAPTERS.length).map((x) => x === true);
  if (!Array.isArray(p.log)) p.log = [];
  // 楼层快照规范化：结构损坏则置空（由 UI 重生成当前层），explored 归一为普通对象。
  if (p.floorState && typeof p.floorState === 'object') {
    const fs = p.floorState;
    // grid 必须是 GRID×GRID 的字符串矩阵（逐行校验，避免某行为 null 致 tileAt 崩溃）。
    const gridOk = Array.isArray(fs.grid) && fs.grid.length === GRID
      && fs.grid.every((row) => Array.isArray(row) && row.length === GRID);
    if (!gridOk) {
      p.floorState = null;
    } else {
      // pos 坐标必须为合法网格内整数，否则钳到安全点（避免 renderMap 无角色 / 移动失灵）。
      const px = Math.floor(fs.pos && fs.pos.x), py = Math.floor(fs.pos && fs.pos.y);
      if (!Number.isInteger(px) || px < 0 || px >= GRID || !Number.isInteger(py) || py < 0 || py >= GRID) {
        fs.pos = { x: 1, y: 1 };
      } else {
        fs.pos = { x: px, y: py };
      }
      if (!Array.isArray(fs.entities)) fs.entities = [];
      if (Array.isArray(fs.explored)) { const o = {}; for (const k of fs.explored) o[k] = true; fs.explored = o; }
      else if (!fs.explored || typeof fs.explored !== 'object' || Array.isArray(fs.explored)) fs.explored = {};
      if (!Number.isFinite(fs.floor)) fs.floor = p.floor;
    }
  } else {
    p.floorState = null;
  }
  p.ending = (p.ending === 'peace' || p.ending === 'dark') ? p.ending : null;
  if (!Number.isFinite(p.born)) p.born = 0;
  if (!Number.isFinite(p.lastSeen)) p.lastSeen = 0;
  // 收尾钳制：HP / 精力落到合法区间（依赖已规范化的 talents / level）。
  p.hp = clamp(p.hp, 0, maxHp(p));
  p.stamina = clamp(p.stamina, 0, maxStamina());
  return p;
}

function validAffix(a) {
  return a && AFFIXES.some((x) => x.id === a.id);
}

// —— 派生数值（装备 + 强化 + 词缀 + 天赋 + 等级）——
export function maxHp(p) {
  return BASE_MAX_HP + (p.talents.survival || 0) * 20 + (p.level - 1) * 5;
}
export function maxStamina() { return BASE_MAX_STAMINA; }

export function effectiveAtk(p) {
  const w = p.equipment.weapon;
  let atk = BASE_ATK + (w.stat || 0) + (w.plus || 0) + Math.floor((p.level - 1) / 2);
  if (w.affix && w.affix.id === 'keen') atk *= 1.2;
  atk *= 1 + 0.1 * (p.talents.combat || 0); // 战斗天赋
  return Math.max(1, Math.round(atk));
}

export function effectiveDef(p) {
  const a = p.equipment.armor;
  let def = BASE_DEF + (a.stat || 0) + (a.plus || 0) + Math.floor((p.level - 1) / 3);
  if (a.affix && a.affix.id === 'guard') def *= 1.2;
  return Math.max(0, Math.round(def));
}

export function effectiveMoveRange(p) {
  const b = p.equipment.booster;
  let range = BASE_MOVE_RANGE + (b.plus || 0);
  if (b.affix && b.affix.id === 'swift') range += 1;
  return range;
}

// 词缀在 +5（及之后每 5 级）触发变异；已存在词缀则替换为新的随机词缀。
export function rollAffix(rng) {
  const r = rng || Math.random;
  return { ...pick(r, AFFIXES) };
}

// 强化装备：消耗零件，plus+1；达 AFFIX_AT 的倍数时触发词缀变异。返回结果描述。
export function enhanceEquipment(p, slot, rng) {
  const r = rng || Math.random;
  const e = p.equipment[slot];
  if (!e) return { ok: false, reason: 'no-slot' };
  if (e.plus >= MAX_PLUS) return { ok: false, reason: 'max' };
  const cost = enhanceCost(e.plus);
  if (p.parts < cost) return { ok: false, reason: 'no-parts', cost };
  p.parts -= cost;
  e.plus += 1;
  let affixed = null;
  if (e.plus % AFFIX_AT === 0) {
    e.affix = rollAffix(r);
    affixed = e.affix;
  }
  return { ok: true, plus: e.plus, affixed, slot };
}

// 点亮天赋：消耗星骸。返回结果。
export function buyTalent(p, branch) {
  const def = TALENT_BY_BRANCH[branch];
  if (!def) return { ok: false, reason: 'no-branch' };
  const rank = p.talents[branch] || 0;
  if (rank >= def.maxRank) return { ok: false, reason: 'max' };
  const cost = talentCost(branch, rank);
  if (p.stardust < cost) return { ok: false, reason: 'no-stardust', cost };
  p.stardust -= cost;
  p.talents[branch] = rank + 1;
  // 生存天赋提升上限后，同步补满 HP（鼓励投资生存）。
  if (branch === 'survival') p.hp = Math.min(maxHp(p), p.hp + 20);
  return { ok: true, branch, rank: rank + 1 };
}

// 重置天赋：全额返还星骸，可随时免费重置（鼓励试错）。
export function resetTalents(p) {
  let refund = 0;
  for (const t of TALENTS) {
    const rank = p.talents[t.branch] || 0;
    for (let i = 0; i < rank; i++) refund += talentCost(t.branch, i);
    p.talents[t.branch] = 0;
  }
  p.stardust += refund;
  // 上限下调后钳制 HP。
  p.hp = Math.min(p.hp, maxHp(p));
  return { ok: true, refund };
}

// 获取战斗 / 拾取奖励（星骸 / 零件 / 经验），含幸运天赋加成与升级。
export function gainReward(p, reward = {}, rng) {
  const luck = 1 + 0.15 * (p.talents.luck || 0);
  const sd = Math.round((reward.stardust || 0) * luck);
  const pt = Math.round((reward.parts || 0) * luck);
  p.stardust += sd;
  p.parts += pt;
  let leveled = 0;
  if (reward.exp) {
    p.exp += reward.exp;
    while (p.exp >= expToNext(p.level)) {
      p.exp -= expToNext(p.level);
      p.level += 1;
      leveled += 1;
    }
    if (leveled > 0) {
      // 升级回血 40%（开罗式贴心）。
      p.hp = Math.min(maxHp(p), p.hp + Math.round(maxHp(p) * 0.4));
    }
  }
  return { stardust: sd, parts: pt, leveled };
}

// —— HP / 精力 ——
export function damagePlayer(p, amount) {
  const d = Math.max(0, Math.round(amount || 0));
  p.hp = clamp(p.hp - d, 0, maxHp(p));
  return d;
}
export function healPlayer(p, amount) {
  const before = p.hp;
  p.hp = clamp(p.hp + (amount || 0), 0, maxHp(p));
  return p.hp - before;
}
export function healFull(p) {
  const before = p.hp;
  p.hp = maxHp(p);
  p.stamina = maxStamina();
  return p.hp - before;
}
export function spendStamina(p, amount) {
  p.stamina = clamp(p.stamina - (amount || 0), 0, maxStamina());
  return p.stamina;
}
export function regenStamina(p, amount) {
  const before = p.stamina;
  p.stamina = clamp(p.stamina + (amount || 0), 0, maxStamina());
  return p.stamina - before;
}

export function isDead(p) { return p.hp <= 0; }

// 记忆碎片收集：解锁对应章节，生存天赋额外回 HP。返回是否新解锁。
export function collectMemory(p, chapterIndex) {
  const idx = Math.max(0, Math.min(p.memory.length - 1, chapterIndex));
  if (p.memory[idx]) return { ok: false, already: true };
  p.memory[idx] = true;
  const heal = 5 + (p.talents.survival || 0) * 5;
  healPlayer(p, heal);
  return { ok: true, chapter: idx, heal };
}

export function collectedMemoryCount(p) {
  return p.memory.filter(Boolean).length;
}

export { MAX_PLUS, AFFIX_AT, AFFIXES, TALENTS, TALENT_BY_BRANCH, enhanceCost, talentCost, expToNext, clamp, clampStat, MAX_FLOOR, MEMORY_CHAPTERS };
