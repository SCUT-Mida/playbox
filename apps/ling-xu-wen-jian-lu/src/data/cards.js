// ============================================================================
// 灵墟·问剑录 · 卡牌数据库（设计稿 第二节：15 张基础卡）
//
// 技能（skill）统一 DSL，供战斗引擎通用解析：
//   { id, name, type: 'dmg'|'heal'|'buff'|'shield'|'cleanse'|'ctrl',
//     target: 'enemy_one'|'enemy_all'|'ally_lowest'|'ally_all'|'self',
//     mult, fixed, effect?, selfEffect? }
//   effect 可为：
//     { kind:'burn'|'poison', dps, dur }      — 持续伤害（dps = 施法者攻击的比例/回合）
//     { kind:'stun'|'silence'|'freeze', dur } — 控制（stun 跳过回合；silence/freeze 仅普攻）
//     { kind:'slow', amount, dur }            — 减速（速度 -amount）
//     { kind:'invuln', dur }                  — 无敌
//     { stat:'atk'|'def'|'spd'|'crit', amount, dur } — 属性增益（amount 为加成比例）
//     { shieldPct, dur, taunt? }              — 护盾（占最大气血比例）+ 可选嘲讽
//     { dispel:'debuff'|'buff' }              — 净化 / 驱散
//
// 被动（passive）DSL：
//   { kind:'crit'|'atk'|'def'|'spd'|'resist'|'heal_in'|'lifesteal'|'thorns',
//     amount }
//   { kind:'aura_enemy_down', amount }   — 开场敌方全属性 -amount
//   { kind:'heal_aura', amount }         — 全队受治疗 +amount
//   { kind:'revive', hpPct }             — 濒死复活一次
//   { kind:'deathsave', hpPct }          — 致命伤害免疫并回血一次
//   { kind:'enrage', amount, dur }       — 血量低于阈值时全属性 ×（1+amount）持续 dur 回合
//   { kind:'team_revive', hpPct }        — 阵亡时全队复活并回血一次
// ============================================================================

export const CARDS = [
  // ── R 卡（9）逸品·青玉 ──────────────────────────────────────────────────────
  {
    id: 'R001', name: '青竹剑侍', rarity: 'R', element: 'wood', cls: '剑修',
    stats: { atk: 75, def: 40, hp: 320, spd: 70 }, role: 'dps',
    actives: [{ id: 'a1', name: '竹影三叠', type: 'dmg', target: 'enemy_one', mult: 1.20 }],
    passives: [],
    story: '青云山外门的执剑童子，以竹为剑，招式朴素却暗合剑理。',
    quote: '一竹一剑，亦可问道。',
    poem: '青竹三尺剑，问道一峰云',
    voiceQuote: '师弟，今日剑谱可练熟了？',
    silhouetteColor: '#5fa85f',
  },
  {
    id: 'R002', name: '赤焰灵狐', rarity: 'R', element: 'fire', cls: '符修',
    stats: { atk: 60, def: 35, hp: 280, spd: 85 }, role: 'dps',
    actives: [{ id: 'a1', name: '狐火灼烧', type: 'dmg', target: 'enemy_one', mult: 1.0,
      effect: { kind: 'burn', dps: 0.30, dur: 2 } }],
    passives: [],
    story: '生于赤焰峡谷的灵狐，尾火不熄，灼敌于无形。',
    quote: '可别被我的尾巴燎到了。',
    poem: '尾火燃千岭，灵狐过九原',
    voiceQuote: '嘻，别踩到我的尾巴哦。',
    silhouetteColor: '#d4564f',
  },
  {
    id: 'R003', name: '玄龟甲士', rarity: 'R', element: 'water', cls: '体修',
    stats: { atk: 30, def: 85, hp: 520, spd: 30 }, role: 'tank',
    actives: [{ id: 'a1', name: '龟甲护盾', type: 'shield', target: 'self', mult: 0,
      effect: { shieldPct: 0.30, dur: 2, taunt: true } }],
    passives: [],
    story: '寒潭深处的玄龟一族，背甲坚逾玄铁，世代为阵前盾卫。',
    quote: '有我在，谁也越不过此阵。',
    poem: '玄甲沉渊底，一盾定江山',
    voiceQuote: '阵在我前，谁敢越雷池？',
    silhouetteColor: '#4a90c2',
  },
  {
    id: 'R004', name: '金戈锐士', rarity: 'R', element: 'metal', cls: '剑修',
    stats: { atk: 85, def: 45, hp: 300, spd: 65 }, role: 'dps',
    actives: [{ id: 'a1', name: '金戈破阵', type: 'dmg', target: 'enemy_one', mult: 1.40 }],
    passives: [],
    story: '金戈铁壁的守关锐士，一柄长戈可破百甲。',
    quote: '破阵，只在须臾。',
    poem: '金戈横大漠，一破百甲开',
    voiceQuote: '破阵只在须臾，你看好了。',
    silhouetteColor: '#c8a951',
  },
  {
    id: 'R005', name: '厚土力士', rarity: 'R', element: 'earth', cls: '体修',
    stats: { atk: 40, def: 80, hp: 500, spd: 30 }, role: 'tank',
    actives: [{ id: 'a1', name: '撼地践踏', type: 'dmg', target: 'enemy_all', mult: 0.60,
      effect: { kind: 'slow', amount: 0.20, dur: 2 } }],
    passives: [],
    story: '地煞迷宫中修土行的大汉，一步撼地，万夫迟滞。',
    quote: '大地，皆为我臂助。',
    poem: '厚土承千钧，撼地万夫迟',
    voiceQuote: '脚下这片地，都听我的。',
    silhouetteColor: '#a17b4a',
  },
  {
    id: 'R006', name: '柳叶医仙', rarity: 'R', element: 'wood', cls: '丹修',
    stats: { atk: 30, def: 50, hp: 350, spd: 60 }, role: 'healer',
    actives: [{ id: 'a1', name: '回春术', type: 'heal', target: 'ally_lowest', mult: 1.20 }],
    passives: [],
    story: '万木回廊采药的医仙，以柳叶为针，回春续命。',
    quote: '且安心，伤可愈。',
    poem: '柳叶为针细，回春续寸心',
    voiceQuote: '且安心，伤总能好的。',
    silhouetteColor: '#5fa85f',
  },
  {
    id: 'R007', name: '流火散修', rarity: 'R', element: 'fire', cls: '剑修',
    stats: { atk: 70, def: 40, hp: 300, spd: 75 }, role: 'dps',
    actives: [{ id: 'a1', name: '烈焰斩', type: 'dmg', target: 'enemy_one', mult: 1.10 }],
    passives: [],
    story: '游历四方的散修剑客，剑走偏锋，烈焰裹刃。',
    quote: '我的剑，烫得很。',
    poem: '流火焚长夜，孤剑走天涯',
    voiceQuote: '我这剑烫得很，小心些。',
    silhouetteColor: '#d4564f',
  },
  {
    id: 'R008', name: '霜月散修', rarity: 'R', element: 'water', cls: '符修',
    stats: { atk: 55, def: 45, hp: 320, spd: 70 }, role: 'ctrl',
    actives: [{ id: 'a1', name: '寒冰咒', type: 'dmg', target: 'enemy_one', mult: 0.90,
      effect: { kind: 'freeze', dur: 1 } }],
    passives: [],
    story: '寒潭月下修符的散修，一咒凝冰，封敌于瞬。',
    quote: '且在这霜寒中静一静。',
    poem: '霜月凝寒露，一符锁千秋',
    voiceQuote: '在这霜寒里，静一静吧。',
    silhouetteColor: '#4a90c2',
  },
  {
    id: 'R009', name: '飞羽散修', rarity: 'R', element: 'metal', cls: '阵修',
    stats: { atk: 50, def: 40, hp: 300, spd: 80 }, role: 'support',
    actives: [{ id: 'a1', name: '聚灵阵', type: 'buff', target: 'ally_all', mult: 0,
      effect: { stat: 'atk', amount: 0.10, dur: 2 } }],
    passives: [],
    story: '布阵如飞的散修道人，一聚灵，全队锋芒更盛。',
    quote: '灵气已聚，放手施为。',
    poem: '飞羽布灵阵，一气聚锋芒',
    voiceQuote: '灵气已聚，放手施为便是。',
    silhouetteColor: '#c8a951',
  },

  // ── SR 卡（4）绝品·紫金 ──────────────────────────────────────────────────────
  {
    id: 'SR001', name: '白鹤仙子', rarity: 'SR', element: 'water', cls: '丹修',
    stats: { atk: 65, def: 55, hp: 450, spd: 65 }, role: 'healer',
    actives: [
      { id: 'a1', name: '云鹤回春', type: 'heal', target: 'ally_all', mult: 1.0 },
      { id: 'a2', name: '甘霖普降', type: 'heal', target: 'ally_all', mult: 0.80,
        effect: { dispel: 'debuff' } },
    ],
    passives: [{ kind: 'heal_in', amount: 0.15 }], // 鹤羽护体：受治疗 +15%
    story: '云鹤化形的仙子，仙羽轻拂，百病皆消。',
    quote: '愿这甘霖，洗净诸般苦厄。',
    poem: '云鹤九霄外，仙踪不可寻',
    voiceQuote: '道友，可愿与我共饮一杯？',
    silhouetteColor: '#4a90c2',
  },
  {
    id: 'SR002', name: '赤霄剑尊', rarity: 'SR', element: 'fire', cls: '剑修',
    stats: { atk: 110, def: 50, hp: 400, spd: 72 }, role: 'dps',
    actives: [
      { id: 'a1', name: '赤霄九式', type: 'dmg', target: 'enemy_one', mult: 1.80 },
      { id: 'a2', name: '燎原斩', type: 'dmg', target: 'enemy_all', mult: 1.20 },
    ],
    passives: [{ kind: 'crit', amount: 0.10 }], // 剑心通明：暴击率 +10%
    story: '执赤霄神剑的剑道尊者，九式连环，星火燎原。',
    quote: '剑出赤霄，万里燎原。',
    poem: '赤霄横万里，一剑燎中原',
    voiceQuote: '剑出赤霄，便无回头之路。',
    silhouetteColor: '#d4564f',
  },
  {
    id: 'SR003', name: '玄冥蛇姬', rarity: 'SR', element: 'earth', cls: '符修',
    stats: { atk: 80, def: 60, hp: 480, spd: 60 }, role: 'ctrl',
    actives: [
      { id: 'a1', name: '毒雾弥漫', type: 'dmg', target: 'enemy_all', mult: 0.80,
        effect: { kind: 'poison', dps: 0.25, dur: 3 } },
      { id: 'a2', name: '石化之瞳', type: 'ctrl', target: 'enemy_one', mult: 0,
        effect: { kind: 'silence', dur: 2 } },
    ],
    passives: [{ kind: 'thorns', amount: 0.15 }], // 蛇鳞反噬：受击反伤 15%
    story: '玄冥深处的蛇姬，一瞥石化，毒雾蚀骨。',
    quote: '与我斗，先问问我的鳞。',
    poem: '玄冥蛇影晦，毒雾蚀枯骨',
    voiceQuote: '与我斗？先问过我的鳞。',
    silhouetteColor: '#a17b4a',
  },
  {
    id: 'SR004', name: '青莲道尊', rarity: 'SR', element: 'wood', cls: '阵修',
    stats: { atk: 55, def: 70, hp: 500, spd: 55 }, role: 'support',
    actives: [
      { id: 'a1', name: '青莲法阵', type: 'buff', target: 'ally_all', mult: 0,
        effect: { stat: 'def', amount: 0.20, dur: 2 } },
      { id: 'a2', name: '灵气汇聚', type: 'buff', target: 'ally_all', mult: 0,
        effect: { stat: 'spd', amount: 0.10, dur: 2 } },
    ],
    passives: [{ kind: 'resist', amount: 0.20 }], // 道法自然：效果抵抗 +20%
    story: '青莲峰上的道尊，一念成阵，万法自然。',
    quote: '道法自然，何须强求。',
    poem: '青莲生一念，万法自成阵',
    voiceQuote: '道法自然，何须强求。',
    silhouetteColor: '#5fa85f',
  },

  // ── SSR 卡（2）至品·彩凰 ─────────────────────────────────────────────────────
  {
    id: 'SSR001', name: '蚩尤残魂', rarity: 'SSR', element: 'fire', cls: '体修',
    stats: { atk: 120, def: 100, hp: 900, spd: 50 }, role: 'tank',
    actives: [
      { id: 'a1', name: '九黎战吼', type: 'dmg', target: 'enemy_all', mult: 1.50,
        selfEffect: { kind: 'invuln', dur: 1 } },
      { id: 'a2', name: '魔化之躯', type: 'heal', target: 'self', mult: 0.20,
        effect: { stat: 'atk', amount: 0.30, dur: 3 } },
    ],
    passives: [
      { kind: 'aura_enemy_down', amount: 0.05 }, // 兵主威压：开场敌方全属性 -5%
      { kind: 'revive', hpPct: 0.30 },           // 不屈战魂：濒死复活
      { kind: 'enrage', amount: 1.0, dur: 2, threshold: 0.30 }, // 兵主降临
    ],
    story: '上古兵主蚩尤的一缕残魂，重聚九黎战意，所向披靡。',
    quote: '吾乃九黎之主，战魂不灭！',
    poem: '九黎图腾起，战魂燃苍穹',
    voiceQuote: '吾乃九黎之主，战魂不灭！',
    silhouetteColor: '#d4564f',
  },
  {
    id: 'SSR002', name: '瑶池圣母', rarity: 'SSR', element: 'water', cls: '丹修',
    stats: { atk: 70, def: 90, hp: 800, spd: 60 }, role: 'healer',
    actives: [
      { id: 'a1', name: '天水净世', type: 'heal', target: 'ally_all', mult: 1.50,
        effect: { dispel: 'debuff' } },
      { id: 'a2', name: '瑶池仙露', type: 'heal', target: 'ally_lowest', mult: 2.0,
        effect: { stat: 'atk', amount: 0.50, dur: 3 } },
    ],
    passives: [
      { kind: 'heal_aura', amount: 0.20 }, // 慈航普度：全队受治疗 +20%
      { kind: 'deathsave', hpPct: 0.30 },  // 水月镜花：致命伤害免疫并回血
      { kind: 'team_revive', hpPct: 0.50 }, // 天泽万物：阵亡时全队复活
    ],
    story: '瑶池之主，慈航普度，一滴仙露可活白骨。',
    quote: '天泽万物，生生不息。',
    poem: '瑶池金母降，一滴活白骨',
    voiceQuote: '天泽万物，生生不息。',
    silhouetteColor: '#4a90c2',
  },
];

export const CARD_MAP = Object.fromEntries(CARDS.map((c) => [c.id, c]));
export function cardDef(id) { return CARD_MAP[id] || null; }

// ── 化凡入圣·进化路径（设计稿增量 2.2）──────────────────────────────────────────
// 按稀有度标注本卡可走的品质进化链（用于灵犀阁展示）。SSR 已至顶，无可进化路径。
// 对应 config.EVOLUTION 的材料消耗；卡牌实例经 instance.evo 在同一条链上逐阶跃迁。
export const EVOLUTION_PATH = {
  R:   ['逸品·青玉', '绝品·紫金', '至品·彩凰'],
  SR:  ['绝品·紫金', '至品·彩凰'],
  SSR: ['至品·彩凰'],
};
export function cardEvolutionPath(card) {
  return EVOLUTION_PATH[(card && card.rarity) || 'R'] || ['逸品·青玉'];
}
