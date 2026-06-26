// 全局常量与工具函数 —— 画布尺寸、网格、配色、伤害公式

// 画布逻辑分辨率（移动端优先，Scale.FIT 自动缩放到任意屏幕）
export const GAME_WIDTH = 1334;
export const GAME_HEIGHT = 750;

// 网格战场：20 列 x 9 行，单元格 60px
export const TILE = 60;
export const MAP_COLS = 20;
export const MAP_ROWS = 9;
export const MAP_WIDTH = MAP_COLS * TILE; // 1200
export const MAP_HEIGHT = MAP_ROWS * TILE; // 540

// 战场在画布中的偏移（居中，上方留 HUD，下方留武将栏）
export const MAP_X = Math.floor((GAME_WIDTH - MAP_WIDTH) / 2); // 67
export const MAP_Y = 110;

// 高地（远程/策士）与路面（近战阻挡）槽位类型
export const SLOT = {
  HIGH: 'high', // 高地：RANGE / MAGE
  ROAD: 'road', // 路面：MELEE
};

// 武将职业 → 可放置槽位类型
export function slotTypeForClass(cls) {
  return cls === 'MELEE' ? SLOT.ROAD : SLOT.HIGH;
}

// 配色（泼墨 / 竹简 风格）
export const COLORS = {
  bg: 0x1f1812,
  parchment: 0xead9b6,
  parchmentDark: 0xd6c094,
  ink: 0x2c2418,
  inkSoft: 0x4a3f30,
  path: 0xcda45f,
  pathEdge: 0x9a7232,
  highland: 0x8fae6b,
  highlandEdge: 0x5d7240,
  highlandAlt: 0x7d9a5e,
  road: 0xb9924f,
  roadEdge: 0x8a6831,
  base: 0xb03a2e,
  baseEdge: 0x7d2620,
  gold: 0xf0c040,
  peach: 0xf08a78,
  morale: 0x57c0e8,
  valid: 0x5fd06a,
  invalid: 0xe55757,
  white: 0xffffff,
  faction: {
    蜀: 0x3da563,
    魏: 0x4a7fc0,
    吴: 0xcc4f36,
    群: 0x9b78c4,
  },
};

// 网格 ↔ 像素 互转
export function gridToPixel(col, row) {
  return {
    x: MAP_X + col * TILE + TILE / 2,
    y: MAP_Y + row * TILE + TILE / 2,
  };
}

export function pixelToGrid(x, y) {
  return {
    col: Math.floor((x - MAP_X) / TILE),
    row: Math.floor((y - MAP_Y) / TILE),
  };
}

export function cellKey(col, row) {
  return `${col},${row}`;
}

export function inBounds(col, row) {
  return col >= 0 && col < MAP_COLS && row >= 0 && row < MAP_ROWS;
}

export function dist(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

// 护甲减伤：策士(法术)对重甲有额外加成
// armor: NONE | PHYSICAL | HEAVY | MAGIC
export function computeDamage(base, dmgType, armor) {
  if (dmgType === 'MAGIC') {
    if (armor === 'MAGIC') return base * 0.4;
    if (armor === 'HEAVY') return base * 1.5; // 重甲惧法
    return base;
  }
  // PHYSICAL
  if (armor === 'HEAVY') return base * 0.4;
  if (armor === 'PHYSICAL') return base * 0.5;
  return base;
}

// 限制帧间隔，避免后台切回时超大 dt 炸毁物理
export function clampDt(dt) {
  if (dt > 0.05) return 0.05;
  if (dt < 0) return 0;
  return dt;
}
