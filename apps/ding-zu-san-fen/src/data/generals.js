// 武将数据字典
// cls: MELEE(近战/阻挡) | RANGE(远程) | MAGE(策士/法术)
// tags: 用于羁绊判定（如 五虎、魏、吴）
// skill.type: AOE(范围) | SNIPE(单体爆发) | SPELL(法术范围+状态)
//   AOE:   { radius(格), mult }        围绕自身范围伤害 = atk*mult
//   SNIPE: { mult }                     对目标造成 atk*mult
//   SPELL: { radius(格), mult, slow?, burn? } 范围法术 + 减速/燃烧
export const GENERALS = [
  // ---------- 蜀 · 五虎 / 卧龙凤雏 ----------
  {
    id: 'guanyu', name: '关羽', char: '关', faction: '蜀', cls: 'MELEE', tags: ['五虎'],
    cost: 160, hp: 1300, atk: 58, range: 1.1, block: 2, atkCD: 0.85, dmgType: 'PHYSICAL',
    skill: { name: '青龙偃月', type: 'AOE', cd: 8, radius: 1.6, mult: 3 },
    desc: '近战 · 阻挡 2 · 范围斩击',
  },
  {
    id: 'zhangfei', name: '张飞', char: '张', faction: '蜀', cls: 'MELEE', tags: ['五虎'],
    cost: 170, hp: 1900, atk: 46, range: 1.0, block: 3, atkCD: 1.0, dmgType: 'PHYSICAL',
    skill: { name: '丈八蛇矛', type: 'AOE', cd: 9, radius: 1.4, mult: 2.6 },
    desc: '肉盾 · 阻挡 3 · 高血厚甲',
  },
  {
    id: 'zhaoyun', name: '赵云', char: '赵', faction: '蜀', cls: 'MELEE', tags: ['五虎'],
    cost: 150, hp: 1150, atk: 56, range: 1.1, block: 2, atkCD: 0.7, dmgType: 'PHYSICAL',
    skill: { name: '七进七出', type: 'AOE', cd: 7, radius: 1.8, mult: 2.2 },
    desc: '近战 · 攻速快 · 灵动突进',
  },
  {
    id: 'machao', name: '马超', char: '马', faction: '蜀', cls: 'MELEE', tags: ['五虎'],
    cost: 150, hp: 1200, atk: 57, range: 1.1, block: 2, atkCD: 0.78, dmgType: 'PHYSICAL',
    skill: { name: '银甲冲锋', type: 'AOE', cd: 8, radius: 1.6, mult: 2.5 },
    desc: '近战 · 西凉铁骑',
  },
  {
    id: 'huangzhong', name: '黄忠', char: '黄', faction: '蜀', cls: 'RANGE', tags: ['五虎'],
    cost: 180, hp: 620, atk: 72, range: 3.6, block: 0, atkCD: 1.1, dmgType: 'PHYSICAL',
    skill: { name: '百步穿杨', type: 'SNIPE', cd: 10, mult: 5 },
    desc: '远程 · 射程极远 · 单发爆头',
  },
  {
    id: 'zhuge', name: '诸葛亮', char: '亮', faction: '蜀', cls: 'MAGE', tags: ['蜀'],
    cost: 200, hp: 560, atk: 52, range: 2.9, block: 0, atkCD: 1.4, dmgType: 'MAGIC',
    skill: { name: '八阵图', type: 'SPELL', cd: 11, radius: 2.0, mult: 2, slow: { factor: 0.45, dur: 2.5 } },
    desc: '策士 · 法术范围 · 减速',
  },
  {
    id: 'pangtong', name: '庞统', char: '统', faction: '蜀', cls: 'MAGE', tags: ['蜀'],
    cost: 190, hp: 520, atk: 55, range: 2.7, block: 0, atkCD: 1.5, dmgType: 'MAGIC',
    skill: { name: '火连环', type: 'SPELL', cd: 10, radius: 2.0, mult: 2.2, burn: { dps: 30, dur: 3 } },
    desc: '策士 · 法术范围 · 灼烧',
  },

  // ---------- 魏 ----------
  {
    id: 'caocao', name: '曹操', char: '曹', faction: '魏', cls: 'RANGE', tags: ['魏'],
    cost: 190, hp: 720, atk: 64, range: 3.3, block: 0, atkCD: 1.0, dmgType: 'PHYSICAL',
    skill: { name: '奸雄', type: 'SNIPE', cd: 10, mult: 4 },
    desc: '远程 · 雄主 · 统御三军',
  },
  {
    id: 'sima', name: '司马懿', char: '懿', faction: '魏', cls: 'MAGE', tags: ['魏'],
    cost: 195, hp: 560, atk: 53, range: 2.9, block: 0, atkCD: 1.3, dmgType: 'MAGIC',
    skill: { name: '鬼谋', type: 'SPELL', cd: 11, radius: 2.0, mult: 1.8, slow: { factor: 0.5, dur: 2.5 } },
    desc: '策士 · 法术 · 深谋减速',
  },
  {
    id: 'xiahou', name: '夏侯惇', char: '夏', faction: '魏', cls: 'MELEE', tags: ['魏'],
    cost: 160, hp: 1600, atk: 51, range: 1.0, block: 3, atkCD: 0.9, dmgType: 'PHYSICAL',
    skill: { name: '刚烈', type: 'AOE', cd: 9, radius: 1.5, mult: 2.6 },
    desc: '肉盾 · 阻挡 3 · 魏之刚烈',
  },

  // ---------- 吴 ----------
  {
    id: 'zhouyu', name: '周瑜', char: '瑜', faction: '吴', cls: 'MAGE', tags: ['吴'],
    cost: 195, hp: 540, atk: 55, range: 2.8, block: 0, atkCD: 1.4, dmgType: 'MAGIC',
    skill: { name: '火攻', type: 'SPELL', cd: 10, radius: 2.2, mult: 2.0, burn: { dps: 35, dur: 3 } },
    desc: '策士 · 烈火 · 群体灼烧',
  },
  {
    id: 'sunce', name: '孙策', char: '策', faction: '吴', cls: 'MELEE', tags: ['吴'],
    cost: 150, hp: 1250, atk: 57, range: 1.1, block: 2, atkCD: 0.78, dmgType: 'PHYSICAL',
    skill: { name: '小霸王', type: 'AOE', cd: 8, radius: 1.6, mult: 2.5 },
    desc: '近战 · 江东小霸王',
  },

  // ---------- 群雄 ----------
  {
    id: 'lvbu', name: '吕布', char: '吕', faction: '群', cls: 'MELEE', tags: ['群'],
    cost: 240, hp: 1700, atk: 78, range: 1.3, block: 2, atkCD: 0.7, dmgType: 'PHYSICAL',
    skill: { name: '无双', type: 'AOE', cd: 9, radius: 1.9, mult: 3 },
    desc: '近战 · 三国第一猛将',
  },
  {
    id: 'diaochan', name: '貂蝉', char: '蝉', faction: '群', cls: 'MAGE', tags: ['群'],
    cost: 185, hp: 520, atk: 49, range: 2.7, block: 0, atkCD: 1.3, dmgType: 'MAGIC',
    skill: { name: '连环', type: 'SPELL', cd: 11, radius: 2.0, mult: 1.6, slow: { factor: 0.4, dur: 3 } },
    desc: '策士 · 倾国 · 群体迟滞',
  },
];

export const GENERAL_BY_ID = Object.fromEntries(GENERALS.map((g) => [g.id, g]));

// 升级数值（每级相对 1 级）
export const LEVEL_MULT = {
  atk: [1.0, 1.4, 1.9], // 攻击倍率
  hp: [1.0, 1.5, 2.2], // 血量倍率
  speed: [1.0, 1.15, 1.3], // 攻速/冷却倍率
};

export const MAX_LEVEL = 3;

// 升级所需金币（按武将基础费用）
export function upgradeCost(def, currentLevel) {
  return Math.round(def.cost * (0.8 + currentLevel * 0.7));
}

// 撤退返还（按累计投入）
export function retreatRefund(def, level) {
  let invested = def.cost;
  for (let l = 1; l < level; l++) invested += upgradeCost(def, l);
  return Math.round(invested * 0.7);
}
