// ============================================================================
// 浮岛生成模块：程序化生成 16×16 地图（房间感 + 连通保证）、迷雾、移动校验。
// 纯数据与纯函数：生成 floorState 供 UI 渲染，移动 / 视野查询无副作用（除显式 mutate）。
// ============================================================================
import {
  GRID, VISION_RADIUS, TILES, FLOOR_TILES, tileOf, isWalkable,
  floorConfig, enemyPoolFor, EVENT_TYPES, EVENT_META, MAX_FLOOR, MEMORY_CHAPTERS,
  biomeFor, floorTilesFor, DECOR,
} from '../config.js';
import { randInt, weightedPick, pick } from './rng.js';

const key = (x, y) => `${x},${y}`;
const inBounds = (x, y) => x >= 0 && y >= 0 && x < GRID && y < GRID;

// —— 生成一张浮岛（floorState）——
//   rng：可注入随机源；floor：楼层；player：用于 Boss 判定等（可选）。
//   返回 { grid, pos, entities, explored, floor }
export function generateFloor(rng, floor, player) {
  const r = rng || Math.random;
  const f = Math.max(1, Math.min(MAX_FLOOR, floor || 1));
  const cfg = floorConfig(f);
  const isBoss = f >= MAX_FLOOR;

  // 多次尝试，直到连通率合格（避免被障碍物封死）。
  let state = null;
  for (let attempt = 0; attempt < 8; attempt++) {
    state = tryGenerate(r, f, isBoss, cfg);
    const reach = bfsReachable(state.grid, state.pos.x, state.pos.y);
    const reachCount = reach.dist.size;
    if (reachCount >= GRID * GRID * 0.6) {
      state._reach = reach;
      break;
    }
  }
  if (!state._reach) state._reach = bfsReachable(state.grid, state.pos.x, state.pos.y);
  const reach = state._reach;
  delete state._reach;

  // 阶梯：取可达集中距出生点最远的可行走地块。Boss 层无阶梯——击败 Boss 即通关。
  let stairsCell = null;
  if (!isBoss) {
    stairsCell = pickFarReachable(r, reach, state.pos, 6);
    if (stairsCell) state.grid[stairsCell.y][stairsCell.x] = 'stairs';
  }

  // 实体放置（仅在可达且未被占用的地块上）。
  const occupied = new Set([key(state.pos.x, state.pos.y), key(stairsCell?.x, stairsCell?.y)]);
  const reachableTiles = [...reach.dist.keys()]
    .filter((k) => !occupied.has(k))
    .map((k) => { const [x, y] = k.split(',').map(Number); return { x, y }; });

  const entities = [];
  let eid = 1;
  const place = (type, dataFn) => {
    const cell = takeCell(r, reachableTiles, occupied);
    if (!cell) return null;
    const e = { id: `e${eid++}`, type, x: cell.x, y: cell.y, ...(dataFn ? dataFn(cell) : {}) };
    entities.push(e);
    return e;
  };

  // Boss 层：只放 Boss + 记忆；普通层按 cfg 放怪 / 箱 / 事件 / 记忆。
  if (isBoss) {
    place('enemy', () => bossEnemy());
  } else {
    const pool = enemyPoolFor(f);
    for (let i = 0; i < cfg.enemyCount; i++) {
      place('enemy', () => spawnEnemy(r, pool, f));
    }
    for (let i = 0; i < cfg.chestCount; i++) place('chest', () => ({ reward: chestReward(r, f) }));
    if (cfg.eventCount) place(pick(r, EVENT_TYPES));
  }
  // 每层 1 枚记忆回响（章节 = 楼层 - 1，对应 1..10 章）。
  if (cfg.memory) place('memory', () => ({ chapter: Math.min(f - 1, MEMORY_CHAPTERS.length - 1) }));

  state.entities = entities;
  // 点缀层：稀疏地在可行走地块上撒装饰（纯视觉，不影响通行/实体/战斗）。
  state.decor = makeDecor(r, state.grid, biomeFor(f));
  // explored 用普通对象（JSON 原生可序列化），随存档往返不丢失；key 形如 "x,y"。
  const explored = {};
  for (const k of visibleKeys(state.grid, state.pos.x, state.pos.y)) explored[k] = true;
  state.explored = explored;
  return state;
}

// 一次生成尝试：网格 + 障碍 + 出生点。
function tryGenerate(r, f, isBoss, cfg) {
  const floorPalette = floorTilesFor(f); // 按楼层生态选地块，给视觉层次
  const grid = Array.from({ length: GRID }, () =>
    Array.from({ length: GRID }, () => pick(r, floorPalette)));
  // 边界石墙
  for (let i = 0; i < GRID; i++) {
    grid[0][i] = 'wall'; grid[GRID - 1][i] = 'wall';
    grid[i][0] = 'wall'; grid[i][GRID - 1] = 'wall';
  }
  // 散布障碍：石墙 / 深墙 / 水域（不可走），密度随楼层略升。
  const density = 0.10 + Math.min(0.06, (f - 1) * 0.008);
  for (let y = 1; y < GRID - 1; y++) {
    for (let x = 1; x < GRID - 1; x++) {
      if (r() < density) {
        grid[y][x] = weightedPick(r, { wall: 5, wallDark: 2, water: 3 }) || 'wall';
      }
    }
  }
  // 出生点：左上角附近的安全格，清空 3×3 邻域保证不卡。
  const pos = { x: randInt(r, 1, 3), y: randInt(r, 1, 3) };
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const x = pos.x + dx, y = pos.y + dy;
      if (inBounds(x, y) && grid[y][x] !== 'floor') grid[y][x] = pick(r, ['floor', 'floor2']);
    }
  }
  return { grid, pos, entities: [], explored: new Set(), floor: f };
}

function takeCell(r, pool, occupied) {
  // 从可达池中随机取一个尚未占用的格子。
  const avail = pool.filter((c) => !occupied.has(key(c.x, c.y)));
  if (!avail.length) return null;
  const c = pick(r, avail); // 复用 pick（内含 clampUnit 兜底），避免注入源 r()≥1 时下标越界取到 undefined
  occupied.add(key(c.x, c.y));
  return c;
}

// 生成点缀矩阵（GRID×GRID，空串表示无点缀）。仅在内部可行走格上低密度撒，
// 复用生态风味池；出生点 3×3 邻域不撒，避免遮挡角色。
function makeDecor(r, grid, biome) {
  const flavor = (biome && biome.decor) || ['spark'];
  const decor = Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => ''));
  for (let y = 1; y < GRID - 1; y++) {
    for (let x = 1; x < GRID - 1; x++) {
      if (!isWalkable(grid[y][x])) continue;
      if (r() < 0.13) decor[y][x] = pick(r, flavor);
    }
  }
  return decor;
}

function pickFarReachable(r, reach, from, minDist) {
  // 在可达集中挑选距 from 距离 ≥ minDist 的格子（优先最远），保证阶梯远离出生点。
  const entries = [...reach.dist.entries()]
    .map(([k, d]) => { const [x, y] = k.split(',').map(Number); return { x, y, d }; })
    .filter((c) => c.d >= minDist);
  if (!entries.length) {
    // 退化：取可达集中最远的。
    const all = [...reach.dist.entries()].map(([k, d]) => { const [x, y] = k.split(',').map(Number); return { x, y, d }; });
    if (!all.length) return null;
    all.sort((a, b) => b.d - a.d);
    return all[0];
  }
  entries.sort((a, b) => b.d - a.d);
  // 取前 1/3 中随机一个，避免每次都最远角落。
  const top = entries.slice(0, Math.max(1, Math.floor(entries.length / 3)));
  return pick(r, top);
}

// 生成一个敌人实例（基于敌人定义池加权抽取）。
function spawnEnemy(r, pool, floor) {
  if (!pool || !pool.length) pool = enemyPoolFor(floor);
  const weights = Object.fromEntries(pool.map((e, i) => [i, 1]));
  const idx = Number(weightedPick(r, weights) || 0);
  const def = pool[idx] || pool[0];
  return enemyFromDef(def, floor);
}
function bossEnemy() {
  const def = enemyPoolFor(MAX_FLOOR).find((e) => e.boss) || enemyPoolFor(MAX_FLOOR)[0];
  return enemyFromDef(def, MAX_FLOOR);
}
export function enemyFromDef(def, floor) {
  // 敌人 HP / 攻击随楼层小幅上扬，保证后期更有压力。
  const tier = Math.max(0, (floor || 1) - (def.minFloor || 1));
  return {
    defId: def.id, name: def.name, emoji: def.emoji,
    hp: def.hp + tier * 4, maxHp: def.hp + tier * 4,
    atk: def.atk + tier, stances: { ...def.stances },
    stardust: def.stardust, parts: def.parts, exp: def.exp,
    boss: !!def.boss,
  };
}

// 宝箱奖励：零件为主，偶有星骸。
function chestReward(r, floor) {
  const roll = r();
  if (roll < 0.6) return { parts: randInt(r, 2, 4) + Math.floor(floor / 3) };
  if (roll < 0.9) return { stardust: randInt(r, 3, 6) };
  return { parts: randInt(r, 1, 3), stardust: randInt(r, 2, 4) };
}

// —— 视野（迷雾）：以 (x,y) 为中心的 5×5 切比雪夫窗口 ——
export function visibleKeys(grid, x, y) {
  const out = [];
  for (let dy = -VISION_RADIUS; dy <= VISION_RADIUS; dy++) {
    for (let dx = -VISION_RADIUS; dx <= VISION_RADIUS; dx++) {
      const nx = x + dx, ny = y + dy;
      if (inBounds(nx, ny)) out.push(key(nx, ny));
    }
  }
  return out;
}
export function isVisible(x, y, pos) {
  return Math.max(Math.abs(x - pos.x), Math.abs(y - pos.y)) <= VISION_RADIUS;
}

// —— BFS 可达性：从 (sx,sy) 出发，墙 / 水域 / 深墙视为阻挡 ——
// 返回 { dist: Map(key->steps), prev: Map(key->key) }。
export function bfsReachable(grid, sx, sy) {
  const dist = new Map();
  const prev = new Map();
  if (!inBounds(sx, sy) || !isWalkable(grid[sy][sx])) return { dist, prev };
  const q = [[sx, sy]];
  dist.set(key(sx, sy), 0);
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (!inBounds(nx, ny)) continue;
      if (!isWalkable(grid[ny][nx])) continue;
      const k = key(nx, ny);
      if (dist.has(k)) continue;
      dist.set(k, dist.get(key(x, y)) + 1);
      prev.set(k, key(x, y));
      q.push([nx, ny]);
    }
  }
  return { dist, prev };
}

// 计算从 from 到 to 的路径（仅四向、避开阻挡与敌占格），返回步序列 [{x,y},...]（含 to，不含 from）。
// range 为步数上限；超出或不可达返回 null。avoid 是额外阻挡坐标集合（如敌人）。
export function findPath(state, from, to, range, avoid) {
  if (!state) return null;
  const block = new Set(avoid || []);
  // 敌人所在格视为阻挡。
  for (const e of state.entities) if (e.type === 'enemy') block.add(key(e.x, e.y));
  const dist = new Map();
  const prev = new Map();
  const startK = key(from.x, from.y);
  dist.set(startK, 0);
  const q = [[from.x, from.y]];
  let found = false;
  while (q.length) {
    const [x, y] = q.shift();
    if (x === to.x && y === to.y) { found = true; break; }
    const base = dist.get(key(x, y));
    if (base >= range) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      const k = key(nx, ny);
      if (dist.has(k)) continue;
      if (!inBounds(nx, ny)) continue;
      const isTarget = nx === to.x && ny === to.y;
      if (block.has(k) && !isTarget) continue;       // 阻挡格不可踏入（目标格除外）
      if (!isWalkable(state.grid[ny][nx]) && !isTarget) continue;
      dist.set(k, base + 1);
      prev.set(k, key(x, y));
      q.push([nx, ny]);
    }
  }
  if (!found && !(from.x === to.x && from.y === to.y)) return null;
  // 回溯路径
  const path = [];
  let cur = key(to.x, to.y);
  if (!dist.has(cur)) return null;
  const steps = dist.get(cur);
  if (steps > range) return null;
  while (cur !== startK) {
    const [cx, cy] = cur.split(',').map(Number);
    path.unshift({ x: cx, y: cy });
    cur = prev.get(cur);
    if (cur == null) break;
  }
  return path;
}

// 计算从 from 出发、步数 ≤ range 的所有可达地块（四向；墙 / 水域 / 敌人格视为阻挡）。
// 返回 Set(key)。供 UI 标注「可点击移动」高亮。
export function reachableTiles(state, from, range) {
  const out = new Set();
  if (!state) return out;
  const block = new Set();
  for (const e of state.entities) if (e.type === 'enemy') block.add(key(e.x, e.y));
  const dist = new Map();
  const startK = key(from.x, from.y);
  dist.set(startK, 0);
  out.add(startK);
  const q = [[from.x, from.y]];
  while (q.length) {
    const [x, y] = q.shift();
    const base = dist.get(key(x, y));
    if (base >= range) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      const k = key(nx, ny);
      if (dist.has(k)) continue;
      if (!inBounds(nx, ny)) continue;
      if (block.has(k)) continue;
      if (!isWalkable(state.grid[ny][nx])) continue;
      dist.set(k, base + 1);
      out.add(k);
      q.push([nx, ny]);
    }
  }
  return out;
}

// 查询某格上的实体。
export function entityAt(state, x, y) {
  if (!state || !state.entities) return null;
  return state.entities.find((e) => e.x === x && e.y === y) || null;
}
export function removeEntity(state, id) {
  if (!state || !state.entities) return false;
  const i = state.entities.findIndex((e) => e.id === id);
  if (i < 0) return false;
  state.entities.splice(i, 1);
  return true;
}

export function tileAt(state, x, y) {
  if (!state || !inBounds(x, y)) return 'wall';
  return state.grid[y][x];
}

// 下行：楼层 +1（上限 MAX_FLOOR），更新最远记录。返回新楼层。
export function descend(player) {
  if (!player) return 1;
  player.floor = Math.min(MAX_FLOOR, player.floor + 1);
  if (player.floor > player.maxFloor) player.maxFloor = player.floor;
  return player.floor;
}

export { key, inBounds, GRID, VISION_RADIUS, TILES, tileOf, isWalkable, EVENT_META, MAX_FLOOR };
