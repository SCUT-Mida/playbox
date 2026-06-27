// ============================================================================
// 妖兽生成：依据玩家境界动态生成敌方，属性、五行、掉落均随机浮动。
// ============================================================================

// 妖兽原型：hp/atk/def 为相对基准（最终按玩家等级缩放），el 五行，drops 掉落池
const ENEMY_ARCHETYPES = [
  { name: '灵鼠',     hpR: 0.7, atkR: 0.8, defR: 0.5, el: 'wood',  drops: ['herb_qingmu', 'herb_qingmu', 'lingdust'] },
  { name: '青竹蛇',   hpR: 0.8, atkR: 0.9, defR: 0.5, el: 'wood',  drops: ['herb_qingmu', 'herb_zihua', 'lingdust'] },
  { name: '独角狼妖', hpR: 0.9, atkR: 1.1, defR: 0.6, el: 'metal', drops: ['ore_xuantie', 'lingdust', 'herb_zihua'] },
  { name: '赤焰蜥',   hpR: 0.9, atkR: 1.0, defR: 0.7, el: 'fire',  drops: ['herb_huoyan', 'essence_ling', 'lingdust'] },
  { name: '冰蟾',     hpR: 1.0, atkR: 0.9, defR: 0.8, el: 'water', drops: ['herb_hanbing', 'essence_ling', 'lingdust'] },
  { name: '玄甲龟',   hpR: 1.4, atkR: 0.8, defR: 1.3, el: 'earth', drops: ['ore_xuantie', 'ore_longgu', 'lingdust'] },
  { name: '黑翼蝠',   hpR: 0.8, atkR: 1.3, defR: 0.5, el: 'metal', drops: ['ore_baijin', 'herb_zihua', 'lingdust'] },
  { name: '百年妖蛇', hpR: 1.2, atkR: 1.2, defR: 0.9, el: 'wood',  drops: ['herb_lingzhi', 'essence_ling', 'herb_zihua'] },
  { name: '三眼妖虎', hpR: 1.3, atkR: 1.4, defR: 1.0, el: 'fire',  drops: ['ore_baijin', 'herb_huoyan', 'essence_ling'] },
  { name: '寒潭蛟龙', hpR: 1.6, atkR: 1.5, defR: 1.2, el: 'water', drops: ['herb_lingzhi', 'ore_longgu', 'ore_baijin'] },
  { name: '赤炎妖尊', hpR: 1.7, atkR: 1.7, defR: 1.2, el: 'fire',  drops: ['herb_lingzhi', 'ore_longgu', 'ore_baijin'] },
];

// 高境界出现更强的"妖王"（前缀 + 全属性提升）
const ELITE_PREFIX = ['千年', '化形', '妖王', '上古'];

// 根据玩家全局等级生成一只妖兽
export function makeEnemy(lv, rng) {
  const r = rng || Math.random;
  // 随境界解锁更多原型：等级越高，可选池越大
  const maxIdx = Math.min(ENEMY_ARCHETYPES.length, 3 + Math.floor(lv / 4));
  const arc = ENEMY_ARCHETYPES[Math.floor(r() * maxIdx)];
  // 等级越高，越可能遇上精英
  const eliteChance = clamp01(0.05 + lv * 0.012);
  const elite = r() < eliteChance;
  const variance = 0.85 + r() * 0.3; // 0.85~1.15 浮动

  const hp = Math.round((40 + lv * 12) * arc.hpR * variance * (elite ? 1.6 : 1));
  const atk = Math.round((5 + lv * 2.6) * arc.atkR * variance * (elite ? 1.4 : 1));
  const def = Math.round((2 + lv * 1.8) * arc.defR * variance * (elite ? 1.3 : 1));
  const stones = Math.round((8 + lv * 3) * (0.8 + r() * 0.6) * (elite ? 2.2 : 1));

  const dropId = arc.drops[Math.floor(r() * arc.drops.length)];
  const dropQty = 1 + Math.floor(r() * 2);
  // 小概率掉落法宝/丹方（高等级）
  const rareDrop = lv >= 6 && r() < 0.12 ? rareDropFor(lv, r) : null;

  const name = elite ? `${ELITE_PREFIX[Math.floor(r() * ELITE_PREFIX.length)]}${arc.name}` : arc.name;
  return {
    name,
    hp, maxHp: hp, atk, def, el: arc.el,
    elite,
    rewards: { stones, drops: [{ id: dropId, qty: dropQty }], rare: rareDrop },
  };
}

function rareDropFor(lv, r) {
  // 高级妖兽有几率掉落法宝或丹方残卷
  if (r() < 0.5) {
    const pool = ['fabao_feijian', 'fabao_xuangai', 'fabao_huoyun', 'fabao_leiyin'];
    const idx = Math.min(pool.length - 1, Math.floor(r() * (1 + lv / 8)));
    return { kind: 'treasure', id: pool[idx] };
  }
  const rcpPool = ['rcp_tupo', 'rcp_zhuji', 'rcp_huitian2', 'rcp_qingxin'];
  return { kind: 'recipe', id: rcpPool[Math.floor(r() * rcpPool.length)] };
}

function clamp01(v) { return Math.max(0, Math.min(1, v)); }
