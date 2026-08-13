// ============================================================================
// 灵墟·问剑录 · 敌人 / Boss 数据（设计稿第三节：主线十二卷章 + 秘境）
//
// 敌人「定义」结构与卡牌一致（stats / actives / passives），战斗引擎统一封装为
// combatant。makeEnemy / makeBoss 按「推荐战力」缩放属性，保证难度曲线平滑。
// ============================================================================
import { cardPower } from '../config.js';

// 按五行划分的小怪模板池（名字 + 属性分布 + 一个主动技）。
// power 为 0：实际数值由 makeEnemy 按目标战力缩放后填入。
const MINION_POOL = {
  earth: [
    { name: '岩甲傀', role: 'tank', dist: { atk: 0.10, def: 0.45, hp: 0.40, spd: 0.05 },
      active: { id: 'e1', name: '坚岩冲撞', type: 'dmg', target: 'enemy_one', mult: 1.0 } },
    { name: '砾石魔', role: 'dps', dist: { atk: 0.35, def: 0.20, hp: 0.30, spd: 0.15 },
      active: { id: 'e1', name: '飞砾', type: 'dmg', target: 'enemy_one', mult: 1.1,
        effect: { kind: 'slow', amount: 0.15, dur: 2 } } },
  ],
  wood: [
    { name: '古藤精', role: 'ctrl', dist: { atk: 0.25, def: 0.25, hp: 0.35, spd: 0.15 },
      active: { id: 'e1', name: '缠绕藤', type: 'dmg', target: 'enemy_one', mult: 0.9,
        effect: { kind: 'slow', amount: 0.20, dur: 2 } } },
    { name: '妖树苗', role: 'healer', dist: { atk: 0.15, def: 0.25, hp: 0.40, spd: 0.20 },
      active: { id: 'e1', name: '汲木', type: 'heal', target: 'ally_lowest', mult: 1.0 } },
  ],
  fire: [
    { name: '焰魔', role: 'dps', dist: { atk: 0.45, def: 0.15, hp: 0.25, spd: 0.15 },
      active: { id: 'e1', name: '烈焰吐息', type: 'dmg', target: 'enemy_one', mult: 1.0,
        effect: { kind: 'burn', dps: 0.25, dur: 2 } } },
    { name: '赤翼鸟', role: 'dps', dist: { atk: 0.40, def: 0.10, hp: 0.20, spd: 0.30 },
      active: { id: 'e1', name: '灼羽击', type: 'dmg', target: 'enemy_one', mult: 1.2 } },
  ],
  water: [
    { name: '寒霜灵', role: 'ctrl', dist: { atk: 0.30, def: 0.20, hp: 0.30, spd: 0.20 },
      active: { id: 'e1', name: '霜寒', type: 'dmg', target: 'enemy_one', mult: 0.9,
        effect: { kind: 'freeze', dur: 1 } } },
    { name: '玄水魅', role: 'healer', dist: { atk: 0.20, def: 0.25, hp: 0.40, spd: 0.15 },
      active: { id: 'e1', name: '潮汐愈', type: 'heal', target: 'ally_all', mult: 0.6 } },
  ],
  metal: [
    { name: '锋刃傀', role: 'dps', dist: { atk: 0.50, def: 0.15, hp: 0.20, spd: 0.15 },
      active: { id: 'e1', name: '利刃斩', type: 'dmg', target: 'enemy_one', mult: 1.3 } },
    { name: '铁甲卫', role: 'tank', dist: { atk: 0.15, def: 0.40, hp: 0.40, spd: 0.05 },
      active: { id: 'e1', name: '铁壁', type: 'shield', target: 'self', mult: 0,
        effect: { shieldPct: 0.25, dur: 2 } } },
  ],
  none: [
    { name: '虚空游魂', role: 'dps', dist: { atk: 0.40, def: 0.20, hp: 0.25, spd: 0.15 },
      active: { id: 'e1', name: '虚空裂', type: 'dmg', target: 'enemy_all', mult: 0.8 } },
  ],
};

// 由分布 + 总战力推导一组基础属性（power 预算按权重分配到四维）。
function distToStats(dist, power) {
  // 把 power 换算到与卡牌同量级的四维：攻击 1.0 / 防御 0.8 / 气血 0.12 / 速度 0.6
  // 反解：给定 power 预算与分布，求各项数值。
  const atkW = 1.0, defW = 0.8, hpW = 0.12, spdW = 0.6;
  const wsum = dist.atk * atkW + dist.def * defW + dist.hp * hpW + dist.spd * spdW;
  const unit = power / wsum;
  return {
    atk: Math.max(8, Math.round(dist.atk * unit * atkW / 1.0)),
    def: Math.max(5, Math.round(dist.def * unit * defW / 0.8)),
    hp: Math.max(80, Math.round(dist.hp * unit * hpW / 0.12)),
    spd: Math.max(20, Math.round(dist.spd * unit * spdW / 0.6)),
  };
}

// 生成一个小怪定义（按目标战力缩放）。
export function makeEnemy(power, element, rng, nameOverride) {
  const pool = MINION_POOL[element] || MINION_POOL.none;
  const tmpl = pool[Math.floor((rng || Math.random)() * pool.length)];
  const stats = distToStats(tmpl.dist, Math.max(120, power));
  return {
    id: `enemy_${tmpl.name}_${Math.floor((rng || Math.random)() * 100000)}`,
    name: nameOverride || tmpl.name,
    element,
    role: tmpl.role,
    stats,
    actives: [tmpl.active],
    passives: [],
  };
}

// ── 12 章 Boss（设计稿 3.1）────────────────────────────────────────────────────
// 每章一个 Boss，带双主动 + 低血狂暴被动，战力为章节推荐战力的 1.5 倍。
export const BOSSES = [
  { chapter: 1,  name: '守阵石灵',       element: 'earth', power: 500 },
  { chapter: 2,  name: '风吼兽',         element: 'wood',  power: 800 },
  { chapter: 3,  name: '熔岩巨蜥',       element: 'fire',  power: 1200 },
  { chapter: 4,  name: '冰魄蛟龙',       element: 'water', power: 1700 },
  { chapter: 5,  name: '机关战傀',       element: 'metal', power: 2300 },
  { chapter: 6,  name: '古树妖皇',       element: 'wood',  power: 3000 },
  { chapter: 7,  name: '地煞魔猿',       element: 'earth', power: 3800 },
  { chapter: 8,  name: '朱雀残羽',       element: 'fire',  power: 4700 },
  { chapter: 9,  name: '玄武虚影',       element: 'water', power: 5700 },
  { chapter: 10, name: '万剑之灵',       element: 'metal', power: 6800 },
  { chapter: 11, name: '虚空吞噬者',     element: 'none',  power: 8000 },
  { chapter: 12, name: '蚩尤残魂·完全体', element: 'fire',  power: 9500 },
];

// Boss 主动技按五行选取，保证有特色。
function bossActives(element) {
  switch (element) {
    case 'fire': return [
      { id: 'b1', name: '焚天烈焰', type: 'dmg', target: 'enemy_all', mult: 1.0,
        effect: { kind: 'burn', dps: 0.30, dur: 2 } },
      { id: 'b2', name: '狱火重击', type: 'dmg', target: 'enemy_one', mult: 1.6 },
    ];
    case 'water': return [
      { id: 'b1', name: '冰封千里', type: 'dmg', target: 'enemy_all', mult: 0.9,
        effect: { kind: 'freeze', dur: 1 } },
      { id: 'b2', name: '寒蛟噬', type: 'dmg', target: 'enemy_one', mult: 1.5 },
    ];
    case 'wood': return [
      { id: 'b1', name: '万木绞杀', type: 'dmg', target: 'enemy_all', mult: 0.9 },
      { id: 'b2', name: '汲生藤', type: 'heal', target: 'self', mult: 0.25 },
    ];
    case 'metal': return [
      { id: 'b1', name: '万剑归宗', type: 'dmg', target: 'enemy_all', mult: 1.0 },
      { id: 'b2', name: '破甲一击', type: 'dmg', target: 'enemy_one', mult: 1.7 },
    ];
    case 'earth': return [
      { id: 'b1', name: '山崩地裂', type: 'dmg', target: 'enemy_all', mult: 0.95,
        effect: { kind: 'slow', amount: 0.20, dur: 2 } },
      { id: 'b2', name: '巨岩碎', type: 'dmg', target: 'enemy_one', mult: 1.5 },
    ];
    default: return [
      { id: 'b1', name: '虚空吞噬', type: 'dmg', target: 'enemy_all', mult: 1.1 },
      { id: 'b2', name: '湮灭一击', type: 'dmg', target: 'enemy_one', mult: 1.6 },
    ];
  }
}

// 生成一个 Boss 定义（战力 = 章节推荐战力 × 1.5）。
export function makeBoss(chapterIdx, rng) {
  const b = BOSSES[Math.max(0, Math.min(BOSSES.length - 1, chapterIdx))];
  const target = b.power * 1.5;
  const stats = distToStats({ atk: 0.30, def: 0.25, hp: 0.35, spd: 0.10 }, target);
  // Boss 体积大、攻防均衡：再补一点气血让它扛得住
  stats.hp = Math.round(stats.hp * 1.4);
  return {
    id: `boss_${b.chapter}_${b.name}`,
    name: b.name,
    element: b.element,
    role: 'boss',
    stats,
    actives: bossActives(b.element),
    passives: [{ kind: 'enrage', amount: 0.6, dur: 99, threshold: 0.40 }],
    isBoss: true,
  };
}

// 为一个推荐战力生成一整支敌方阵容（小怪 / 精英 / Boss）。
// type: 'normal' | 'elite' | 'boss'；count 决定小怪数量（1~5）。
export function makeEnemyFormation(power, element, type, rng) {
  const r = rng || Math.random;
  if (type === 'boss') {
    // Boss + 2 只小怪护航
    const boss = makeBossPower(power, element, r);
    const minions = [
      makeEnemy(power * 0.5, element, r),
      makeEnemy(power * 0.5, element, r),
    ];
    return [boss, ...minions];
  }
  const count = type === 'elite' ? 3 : Math.max(1, Math.min(5, 2 + Math.floor(r() * 3)));
  const factor = type === 'elite' ? 0.7 : 0.5;
  const out = [];
  for (let i = 0; i < count; i++) out.push(makeEnemy(power * factor, element, r));
  return out;
}

// 按「章节推荐战力」生成对应 Boss（chapterIdx → BOSSES 表）。
export function makeBossPower(power, element, rng) {
  // 找到战力最接近的 Boss 模板，但沿用其五行（boss 自身五行优先）
  let tmpl = BOSSES.find((b) => Math.abs(b.power - power) <= power * 0.35);
  if (!tmpl) tmpl = BOSSES[0];
  const target = power * 1.5;
  const stats = distToStats({ atk: 0.30, def: 0.25, hp: 0.35, spd: 0.10 }, target);
  stats.hp = Math.round(stats.hp * 1.4);
  return {
    id: `boss_${tmpl.chapter}_${tmpl.name}`,
    name: tmpl.name,
    element: tmpl.element,
    role: 'boss',
    stats,
    actives: bossActives(tmpl.element),
    passives: [{ kind: 'enrage', amount: 0.6, dur: 99, threshold: 0.40 }],
    isBoss: true,
  };
}

export { distToStats };
