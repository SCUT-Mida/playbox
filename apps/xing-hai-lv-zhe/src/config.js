// ============================================================================
// 星骸旅者 · 配置层（纯常量与纯函数，无副作用，便于单测）
// 定义调色板、地块、装备、天赋、敌人、记忆章节、随机事件与各类阈值。
// ============================================================================

// —— 开罗经典 16 色调色板（明亮饱和色块）——
export const PALETTE = {
  bg: '#2b2d3a',        // 深底（星空）
  parchment: '#f8f4e6', // 亮米（羊皮纸 / 浅地砖）
  sand: '#f7b731',      // 沙地金
  water: '#4a90e2',     // 水域蓝
  monster: '#e8634a',   // 怪物红
  grass: '#6bcb77',     // 草地绿
  stone: '#5d5376',     // 遗迹石（墙）
  stoneDark: '#3a3a4a', // 深石（墙心）
  gold: '#ffd93d',      // 星骸金 / 阶梯
  player: '#4d96ff',    // 玩家蓝
  hp: '#ff6b6b',        // 血量红
  arcane: '#9d4edd',    // 回响紫（记忆碎片）
  teal: '#38a3a5',      // 推进器青
  light: '#f2f2f2',     // 浅地砖
  gray: '#b0b0b0',      // 中灰
  luck: '#57c785',      // 幸运绿
};

// —— 地图网格 ——
export const GRID = 16;            // 16×16 地块
export const VISION_RADIUS = 2;    // 视野半径（5×5 可见）

// 地块类型枚举。walkable 决定能否踏入；color 为像素绘制色（纹理细节由 CSS .t-<id> 叠加）。
export const TILES = {
  floor:    { id: 'floor',    name: '地砖', walkable: true,  color: PALETTE.light },
  floor2:   { id: 'floor2',   name: '石板', walkable: true,  color: PALETTE.parchment },
  sand:     { id: 'sand',     name: '沙地', walkable: true,  color: PALETTE.sand },
  grass:    { id: 'grass',    name: '草地', walkable: true,  color: PALETTE.grass },
  moss:     { id: 'moss',     name: '苔石', walkable: true,  color: '#7fae6b' }, // 装饰性地砖（通行同地砖）
  crystal:  { id: 'crystal',  name: '晶簇', walkable: true,  color: '#7fd6e0' }, // 装饰性地砖
  rune:     { id: 'rune',     name: '符文', walkable: true,  color: '#b08fd6' }, // 装饰性地砖
  ice:      { id: 'ice',      name: '冰面', walkable: true,  color: '#bfe9ff' }, // 装饰性地砖（晶穴/虚空风味）
  ash:      { id: 'ash',      name: '灰烬', walkable: true,  color: '#c9b89a' }, // 装饰性地砖（遗迹风味）
  water:    { id: 'water',    name: '水域', walkable: false, color: PALETTE.water },
  wall:     { id: 'wall',     name: '石墙', walkable: false, color: PALETTE.stone },
  wallDark: { id: 'wallDark', name: '深墙', walkable: false, color: PALETTE.stoneDark },
  stairs:   { id: 'stairs',   name: '下行阶梯', walkable: true, color: PALETTE.gold },
};
// 随机生成时的全部「可行走」地块候选（无重复）；具体楼层用 floorTilesFor 按生态筛选子集。
export const FLOOR_TILES = ['floor', 'floor2', 'sand', 'grass', 'moss', 'crystal', 'rune', 'ice', 'ash'];

// 楼层生态（按楼层分段）：仅影响地图配色、地块分布与点缀风味，不影响任何战斗/通行逻辑。
export const BIOMES = [
  { from: 1, to: 3, key: 'ruins',  name: '遗迹地表', accent: '#c9a36a', tint: 'rgba(201,163,106,0.10)', tiles: ['floor', 'floor2', 'sand', 'grass', 'moss', 'ash'], decor: ['plant', 'rubble', 'spark', 'flower', 'bone'] },
  { from: 4, to: 6, key: 'cavern', name: '晶簇洞穴', accent: '#5fb0d8', tint: 'rgba(95,176,216,0.12)', tiles: ['floor', 'floor2', 'moss', 'crystal', 'ice'],         decor: ['crystal', 'spark', 'rubble', 'mushroom'] },
  { from: 7, to: 9, key: 'void',   name: '虚空裂隙', accent: '#9d6edb', tint: 'rgba(157,110,219,0.12)', tiles: ['floor', 'floor2', 'crystal', 'rune', 'ice'],        decor: ['rune', 'crystal', 'spark', 'bone'] },
  { from: 10, to: 10, key: 'core', name: '星骸之核', accent: '#ffd93d', tint: 'rgba(255,217,61,0.14)', tiles: ['floor2', 'crystal', 'rune'],                       decor: ['rune', 'crystal', 'spark'] },
];
export function biomeFor(floor) {
  const f = Math.max(1, floor || 1);
  return BIOMES.find((b) => f >= b.from && f <= b.to) || BIOMES[0];
}
// 按楼层生态返回地块候选子集（退化时回退到全集，保证总有可行走地块）。
export function floorTilesFor(floor) {
  const list = biomeFor(floor).tiles;
  return list && list.length ? list : FLOOR_TILES;
}

// —— 星球（星球线路）：每颗星球对应一段楼层区间与一种生态，构成星图上的航点 ——
// 仅决定星图的呈现与文案风味；战斗/通行/掉落仍由楼层与生态驱动，避免影响既有逻辑。
export const PLANETS = [
  { key: 'ruins',  name: '碎星遗迹带',   emoji: '🗿', from: 1, to: 3,  biomeKey: 'ruins',
    desc: '上古文明崩解后漂浮的废墟。藤蔓与锈迹之间，低语般的回响时隐时现。' },
  { key: 'cavern', name: '晶簇星穴',     emoji: '💠', from: 4, to: 6,  biomeKey: 'cavern',
    desc: '洞穴深处，星骸晶簇自发脉动，照亮了古老矿道里潜伏的硬壳生物。' },
  { key: 'void',   name: '虚空裂带',     emoji: '🌌', from: 7, to: 9,  biomeKey: 'void',
    desc: '星球的裂口向虚空敞开，时间在此变得粘稠——这里栖息着最危险的掠食者。' },
  { key: 'core',   name: '墨比乌斯之核', emoji: '🌟', from: 10, to: 10, biomeKey: 'core',
    desc: '所有星骸的源头。文明的情感在此凝结为一颗缓慢搏动的心核。' },
];
// 按楼层返回所在星球（退化回退到首颗星球，保证总有归属）。
export function planetFor(floor) {
  const f = Math.max(1, floor || 1);
  return PLANETS.find((p) => f >= p.from && f <= p.to) || PLANETS[0];
}

// 地图点缀（纯装饰，不占实体、不阻挡）：key -> emoji。
export const DECOR = {
  plant:   { emoji: '🌿' },
  rubble:  { emoji: '🪨' },
  crystal: { emoji: '💠' },
  spark:   { emoji: '✨' },
  rune:    { emoji: '🔮' },
  mushroom:{ emoji: '🍄' },
  flower:  { emoji: '🌸' },
  bone:    { emoji: '🦴' },
};

export function tileOf(id) { return TILES[id] || TILES.floor; }
export function isWalkable(id) { return !!tileOf(id).walkable; }

// —— 角色基础数值 ——
export const BASE_MAX_HP = 100;
export const BASE_MAX_STAMINA = 80;
export const BASE_ATK = 6;     // 裸装攻击（武器加成叠加其上）
export const BASE_DEF = 2;     // 裸装防御
export const BASE_MOVE_RANGE = 1; // 推进器 plus 每点 +1 步

// 精力影响命中率：低于此阈值进入「疲惫」，战斗中有失手概率。
export const STAMINA_TIRED = 30;
export const STAMINA_FUMBLE_CHANCE = 0.35; // 疲惫时失手概率上限
// 战斗每回合消耗精力；地图上每移动一格回复精力。
export const STAMINA_COST_PER_ROUND = 4;
export const STAMINA_REGEN_PER_STEP = 3;
// 闲置缓慢回精（rAF 驱动，每 STAMINA_REGEN_INTERVAL_MS 回 1 点）。
export const STAMINA_REGEN_INTERVAL_MS = 1600;

// —— 装备 ——
export const EQUIP_SLOTS = ['weapon', 'armor', 'booster'];
export const MAX_PLUS = 10;     // 强化上限
export const AFFIX_AT = 5;      // +5 触发词缀变异
// 强化消耗「零件」：随 plus 递增（线性）。
export function enhanceCost(plus) { return 2 + (plus || 0) * 2; }

// 词缀池（+5 变异时随机附加其一）。
export const AFFIXES = [
  { id: 'lifesteal', name: '吸血',   desc: '造成伤害时回复等量 HP 的 30%。', emoji: '🩸' },
  { id: 'thorns',    name: '反伤',   desc: '受击时反弹 25% 伤害给敌人。',   emoji: '🌵' },
  { id: 'keen',      name: '锐利',   desc: '攻击 +20%。',                   emoji: '🗡️' },
  { id: 'guard',     name: '坚固',   desc: '防御 +20%。',                   emoji: '🛡️' },
  { id: 'swift',     name: '迅捷',   desc: '移动步数 +1。',                 emoji: '💨' },
];

// 起始装备（生锈砍刀 + 破布衣 + 滑轨推进器）。
export function starterEquipment() {
  return {
    weapon:  { name: '生锈砍刀', stat: 8,  plus: 0, affix: null },
    armor:   { name: '破布外衣', stat: 5,  plus: 0, affix: null },
    booster: { name: '滑轨推进器', stat: 0, plus: 0, affix: null },
  };
}

// —— 装备掉落池（武器 / 护甲 / 推进器多样性）：宝箱可掉落命名装备 ——
// stat 为该部位的基础数值（推进器 stat 不直接生效，步数由 plus 驱动，但保留字段形状一致）。
// minFloor 用于按楼层过滤可得品质，越深的星球越能拾到强力装备。
export const WEAPONS = [
  { name: '生锈砍刀', stat: 8,  minFloor: 1 },
  { name: '合金短刀', stat: 11, minFloor: 1 },
  { name: '晶簇长矛', stat: 14, minFloor: 4 },
  { name: '电磁战锤', stat: 18, minFloor: 4 },
  { name: '虚空裂刃', stat: 23, minFloor: 7 },
  { name: '星骸圣剑', stat: 30, minFloor: 10 },
];
export const ARMORS = [
  { name: '破布外衣', stat: 5,  minFloor: 1 },
  { name: '皮甲外套', stat: 8,  minFloor: 1 },
  { name: '晶鳞护胸', stat: 12, minFloor: 4 },
  { name: '斥候轻甲', stat: 16, minFloor: 7 },
  { name: '星骸战铠', stat: 22, minFloor: 10 },
];
export const BOOSTERS = [
  { name: '滑轨推进器', stat: 0, minFloor: 1 },
  { name: '弹射靴',     stat: 0, minFloor: 4 },
  { name: '虚空滑翔翼', stat: 0, minFloor: 7 },
];
// 部位元信息：emoji / 中文名 / 数值名，供掉落与背包 UI 复用。
export const GEAR_SLOT_META = {
  weapon:  { emoji: '🗡️', label: '武器',   statName: '攻击' },
  armor:   { emoji: '🛡️', label: '护甲',   statName: '防御' },
  booster: { emoji: '🥾', label: '推进器', statName: '步数' },
};
// 按楼层返回某部位的可得装备候选（退化回退到全集，保证不空）。
export function gearPoolFor(slot, floor) {
  const all = slot === 'armor' ? ARMORS : slot === 'booster' ? BOOSTERS : WEAPONS;
  const f = Math.max(1, floor || 1);
  const pool = all.filter((g) => g.minFloor <= f);
  return pool.length ? pool : all;
}

// —— 天赋树：三条分支（生存 / 战斗 / 幸运），消耗星骸点亮，可免费重置 ——
export const TALENTS = [
  {
    branch: 'survival', name: '生存', emoji: '❤️', color: PALETTE.hp, maxRank: 5,
    desc: '每级最大 HP +20、回响拾取额外回复 HP。',
    cost: (rank) => 3 + rank * 2,
  },
  {
    branch: 'combat', name: '战斗', emoji: '⚔️', color: PALETTE.monster, maxRank: 5,
    desc: '每级造成伤害 +10%、克制成功专注力倍率更高。',
    cost: (rank) => 3 + rank * 2,
  },
  {
    branch: 'luck', name: '幸运', emoji: '🍀', color: PALETTE.luck, maxRank: 5,
    desc: '每级掉落星骸 / 零件 +15%、宝箱品质提升。',
    cost: (rank) => 3 + rank * 2,
  },
];
export const TALENT_BY_BRANCH = Object.fromEntries(TALENTS.map((t) => [t.branch, t]));
export function talentCost(branch, rank) { return (TALENT_BY_BRANCH[branch] || { cost: () => 99 }).cost(rank || 0); }

// —— 敌人定义池（按楼层分阶）——
// stances：敌人摆出各架势的相对权重；reward：星骸 / 零件 / 经验基准。
export const ENEMIES = [
  { id: 'puppet',  name: '弃械傀儡', emoji: '🤖', minFloor: 1, hp: 26, atk: 7,  stances: { thrust: 4, slash: 3, smash: 2 }, stardust: 4,  parts: 2, exp: 6 },
  { id: 'wraith',  name: '游荡幽影', emoji: '👻', minFloor: 1, hp: 20, atk: 9,  stances: { thrust: 3, slash: 2, smash: 4 }, stardust: 5,  parts: 1, exp: 7 },
  { id: 'spore',   name: '孢子蛛',   emoji: '🕷️', minFloor: 1, hp: 16, atk: 6,  stances: { thrust: 3, slash: 4, smash: 2 }, stardust: 3,  parts: 1, exp: 5 },
  { id: 'bat',     name: '锈翼蝠',   emoji: '🦇', minFloor: 4, hp: 34, atk: 11, stances: { thrust: 5, slash: 2, smash: 1 }, stardust: 7,  parts: 3, exp: 10 },
  { id: 'crab',    name: '晶甲蟹',   emoji: '🦀', minFloor: 4, hp: 46, atk: 10, stances: { thrust: 2, slash: 5, smash: 3 }, stardust: 8,  parts: 4, exp: 12 },
  { id: 'shard',   name: '晶屑虫',   emoji: '🐛', minFloor: 4, hp: 30, atk: 13, stances: { thrust: 4, slash: 3, smash: 2 }, stardust: 6,  parts: 3, exp: 9 },
  { id: 'knight',  name: '残响骑士', emoji: '🛡️', minFloor: 7, hp: 60, atk: 14, stances: { thrust: 3, slash: 4, smash: 4 }, stardust: 11, parts: 5, exp: 16 },
  { id: 'stalker', name: '虚空潜行者', emoji: '👹', minFloor: 7, hp: 52, atk: 17, stances: { thrust: 4, slash: 3, smash: 3 }, stardust: 12, parts: 4, exp: 18 },
  { id: 'warden',  name: '虚空典狱', emoji: '👁️', minFloor: 7, hp: 58, atk: 15, stances: { thrust: 3, slash: 5, smash: 2 }, stardust: 13, parts: 5, exp: 17 },
  { id: 'reaver',  name: '星骸劫夺者', emoji: '💀', minFloor: 7, hp: 48, atk: 19, stances: { thrust: 5, slash: 2, smash: 4 }, stardust: 14, parts: 4, exp: 19 },
  { id: 'core',    name: '星骸之核', emoji: '🌟', minFloor: 10, hp: 160, atk: 20, stances: { thrust: 3, slash: 3, smash: 3 }, stardust: 60, parts: 30, exp: 100, boss: true },
];

// 按楼层挑选一个合适敌人定义（同 minFloor 池中加权随机由调用方处理）。
export function enemyPoolFor(floor) {
  const f = Math.max(1, floor || 1);
  return ENEMIES.filter((e) => e.minFloor <= f && !(e.boss && f < 10));
}

// 楼层配置：敌人数量、宝箱、事件密度随楼层缓慢上升。
export function floorConfig(floor) {
  const f = Math.max(1, floor || 1);
  return {
    enemyCount: Math.min(6, 2 + Math.floor(f / 2)),   // 1→2, 2→3 ... 上限 6
    chestCount: f >= 10 ? 0 : (1 + (f % 2)),           // 1~2
    memory: f <= 10,                                    // 每层 1 枚回响（1~10）
    eventCount: f >= 10 ? 0 : 1,                        // 每层 1 个随机事件点
  };
}

// —— 记忆章节（碎片化叙事，共 10 章）——
export const MEMORY_CHAPTERS = [
  { title: '序章 · 苏醒', text: '逃生舱的舱门弹开，你大口喘着气。副官「小星」的全息影像闪烁亮起：「旅者，你终于醒了……抱歉，你的记忆和导航数据一起损坏了。」破碎的星球墨比乌斯在头顶缓缓旋转。' },
  { title: '第二章 · 漂浮的遗迹', text: '这些浮岛并非天然——它们是上古文明崩解后残留的碎片。脚下的石板间，偶尔能听见极轻的、像叹息一样的回响。' },
  { title: '第三章 · 星骸', text: '你第一次触摸到那枚发光的晶体「星骸」。温热的，像谁的心跳。一瞬间，你想起了一间洒满午后阳光的厨房。' },
  { title: '第四章 · 不是矿石', text: '小星分析后沉默了很久：「旅者……星骸不是矿物。它们是上古文明的情感凝结体。每一枚，都是某个人的一段记忆。」' },
  { title: '第五章 · 灶台与歌', text: '回响里浮现一个孩子的笑声，和一首你听不懂却莫名想哭的歌。那是谁？为什么你的眼眶会发酸？' },
  { title: '第六章 · 文明的黄昏', text: '越来越清晰了：这座文明并非毁于灾祸，而是在某个黄昏，人们集体选择了将情感封存进星骸，让文明「睡去」。' },
  { title: '第七章 · 你曾在这里', text: '一帧画面闪过——年轻的你站在某座广场上，身边是无数张笑脸。你忽然确信：你曾属于这里。' },
  { title: '第八章 · 小星的秘密', text: '小星终于坦白：「我是按照她的性格模型建造的。她……把你送进逃生舱时，把所有的星骸都留给了你。」' },
  { title: '第九章 · 抉择的重量', text: '星骸之核就在前方。十枚回响在你掌心发烫。重建它们，还是……？小星轻声说：「无论你选什么，我都陪你。」' },
  { title: '终章 · 你的回答', text: '所有的记忆都已归位。现在，轮到你来回答那个被整个文明搁置的问题了。' },
];

// 中期 / 结局叙事（楼层触发）。
export const STORY = {
  prologue: '你迫降在破碎星球「墨比乌斯」。副官小星唤醒了你——记忆全失，只有零星的星骸在岛上闪烁。拾荒，活下去，找回你自己。',
  midpoint: '三层之下，你隐约明白：星骸不是矿石，而是上古文明凝结的情感。每一次拾取，都像重温一段别人的日常。',
};

// 双结局文本。
export const ENDINGS = {
  peace: {
    key: 'peace', name: '重建文明', emoji: '🕊️', tone: 'good',
    title: '和平结局 · 星河重燃',
    text: '你将所有星骸归还大地。千百枚情感体重新苏醒，化作人形，彼此相认。墨比乌斯的夜空第一次亮起万家灯火。你不再是孤独的旅者——你回到了家。',
  },
  dark: {
    key: 'dark', name: '成为新神', emoji: '🔥', tone: 'bad',
    title: '暗黑结局 · 独星长明',
    text: '你引爆了所有星骸。滔天的情感能量灌入你一人之躯，星球在你脚下震颤重生。你成为了墨比乌斯唯一的新神——永生，且永远孤独。小星的光在你身后，缓缓熄灭。',
  },
};

// —— 随机事件池（地图踩点触发）——
// type 用于 world 生成时占位；resolve 在 player/ui 中结算。
export const EVENT_TYPES = ['merchant', 'drone', 'trap'];
export const EVENT_META = {
  merchant: { emoji: '🛒', name: '流浪商人', desc: '高价出售稀有零件与精炼星骸。' },
  drone:    { emoji: '🔧', name: '维修无人机', desc: '消耗星骸，回复全部 HP 与精力。' },
  trap:     { emoji: '🌀', name: '重力陷阱', desc: '空间扭曲，强制传送至随机位置。' },
};

// 商人货架（零件 / 强化材料 / 偶尔的星骸）。
export const SHOP_ITEMS = [
  { id: 'parts_s', name: '零件包×3', cost: 6, give: { parts: 3 }, emoji: '🔩' },
  { id: 'parts_l', name: '零件箱×8', cost: 14, give: { parts: 8 }, emoji: '📦' },
  { id: 'stardust', name: '精炼星骸×10', cost: 18, give: { stardust: 10 }, emoji: '✨' },
  { id: 'heal', name: '应急维修（满状态）', cost: 10, give: { fullHeal: true }, emoji: '❤️‍🩹' },
];

// 无人机维修价（星骸）。
export const DRONE_COST = 8;
// 最低楼层数（含 Boss）。
export const MAX_FLOOR = 10;

// —— 升级（经验）——
export function expToNext(level) { return 10 + (level || 1) * 8; }

// —— 钳制 / 数值辅助 ——
export function clamp(v, lo, hi) {
  if (!Number.isFinite(v)) return lo;
  return Math.max(lo, Math.min(hi, Math.round(v)));
}
export function clampStat(v) { return clamp(v, 0, 99999); }

// 曼哈顿距离。
export function manhattan(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }
