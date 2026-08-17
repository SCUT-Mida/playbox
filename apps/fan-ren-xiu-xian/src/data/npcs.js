// ============================================================================
// NPC 名册与好感度设定。纯数据，不依赖其它模块（避免循环依赖）。
// 每个 NPC：id / name / emoji / 身份 / 性格文案 / 喜好礼物(liked) / 结识所需境界(meetTier)
//   / 组队奖励倍率(teamMult，组队探险时放大收益)。
// liked 为物品 id：赠予喜好物好感增益更高。
// look：开罗风形象（引用共享素材库 _lib/kairo.js 的 preset + 配色覆盖），
//       emoji 仅作行文点缀保留。
// ============================================================================
export const NPCS = {
  npc_murong:  { id: 'npc_murong',  name: '慕容师兄', emoji: '🤺', title: '青云剑修', meetTier: 0, liked: 'ore_baijin',  teamMult: 1.7, desc: '寡言重义的剑修，常独行深山磨砺剑心。', line: '剑道漫漫，能与你同行一程，亦是缘分。',
    look: { preset: 'swordsman', body: '#3a5a78', accent: '#d7e6f2', hair: '#17120f', hairStyle: 'bun', mood: 'happy', name: '慕容师兄' } },
  npc_xuanye:  { id: 'npc_xuanye',  name: '玄烨真人', emoji: '⚗️', title: '丹道宗师', meetTier: 0, liked: 'herb_lingzhi', teamMult: 1.6, desc: '痴迷丹道的老者，一身药香，出手阔绰。', line: '小友若肯助我采药，老夫自有重谢。',
    look: { preset: 'sage', body: '#2f7d57', accent: '#d6f0dd', glow: '#9be8b6', name: '玄烨真人' } },
  npc_muyan:   { id: 'npc_muyan',   name: '沐烟师妹', emoji: '🧚', title: '玄门女修', meetTier: 1, liked: 'essence_ling', teamMult: 1.9, desc: '天赋异禀的玄修少女，机敏灵动，善破阵法。', line: '师兄，这次秘境我也要去！',
    look: { preset: 'mage', gender: 'female', hairStyle: 'long', hair: '#3c2a46', body: '#5a3a8a', accent: '#ddccf2', glow: '#b89cf0', name: '沐烟师妹' } },
  npc_chiyan:  { id: 'npc_chiyan',  name: '赤炎老怪', emoji: '🔥', title: '散修体修', meetTier: 1, liked: 'herb_huoyan',  teamMult: 1.8, desc: '脾气火爆的体修，崇尚以力破巧，嗜战如命。', line: '打一架再说！赢了分你一半。',
    look: { preset: 'demon', horns: 0, body: '#8a3a2a', accent: '#f0c98a', hairStyle: 'spiky', mood: 'angry', name: '赤炎老怪' } },
  npc_yinyue:  { id: 'npc_yinyue',  name: '银月姑娘', emoji: '🦊', title: '灵狐妖修', meetTier: 2, liked: 'herb_lingzhi', teamMult: 2.0, desc: '化形未久的灵狐，狡黠多智，嗅觉灵敏能寻重宝。', line: '藏宝之处，我比你先嗅到哦。',
    look: { preset: 'foxSpirit', body: '#c46a8a', hair: '#d8e0e8', name: '银月姑娘' } },
  npc_qingluan:{ id: 'npc_qingluan',name: '青鸾仙子', emoji: '🦢', title: '御兽仙子', meetTier: 3, liked: 'essence_ling', teamMult: 2.1, desc: '驾驭青鸾的仙子，见识广博，所到之处机缘不断。', line: '随我云端巡游，自有奇遇。',
    look: { preset: 'crane', body: '#8ab4d0', accent: '#f0e8d8', plume: '#8ad0e8', name: '青鸾仙子' } },
  npc_moyi:    { id: 'npc_moyi',    name: '墨衣客',   emoji: '🥷', title: '神秘散修', meetTier: 3, liked: 'ore_longgu',  teamMult: 2.1, desc: '来历成谜的黑衣修士，身法诡谲，常出入险地。', line: '各取所需，莫问出处。',
    look: { preset: 'ninja', name: '墨衣客' } },
  npc_guxian:  { id: 'npc_guxian',  name: '谷隐仙翁', emoji: '🧙', title: '隐世高人', meetTier: 5, liked: 'ore_longgu',  teamMult: 2.4, desc: '隐居深谷的世外高人，境界莫测，随手之劳便是机缘。', line: '小友根骨不俗，老朽愿指点一二。',
    look: { preset: 'sage', body: '#7a8a94', accent: '#e8e0c8', glow: '#ffe08a', beardLong: true, name: '谷隐仙翁' } },
};
export const NPC_LIST = Object.values(NPCS);

export function npcDef(id) { return NPCS[id] || null; }

// ── 好感度等级（自下而上递进，取已达标中最高的那一个）──────────────────────────
// min：达到该好感值即晋升此阶。cultMult：达到「莫逆之交」及以上的道友提供修炼加成
// （详见 core/npc.js 注入的 companionCultivateBonus）。
export const AFFINITY_LEVELS = [
  { id: 'af0', name: '点头之交', emoji: '👋', min: 0,   cultMult: 1.00, desc: '仅有一面之缘。' },
  { id: 'af1', name: '相识一场', emoji: '🤝', min: 15,  cultMult: 1.00, desc: '彼此记住了名号。' },
  { id: 'af2', name: '投缘之交', emoji: '💛', min: 40,  cultMult: 1.00, desc: '可结伴同游，共探秘境。' },
  { id: 'af3', name: '莫逆之交', emoji: '💞', min: 80,  cultMult: 1.03, desc: '肝胆相照，互为助力。' },
  { id: 'af4', name: '生死道侣', emoji: '❤️‍🔥', min: 160, cultMult: 1.05, desc: '生死相托，大道同行。' },
];

// 结伴探险所需的好感门槛（达到「投缘之交」即可组队）
export const TEAM_AFFINITY_THRESHOLD = 40;

// 寻访结识消耗的活力
export const MEET_VITALITY_COST = 6;
// 组队探险消耗（与普通探索一致，但奖励大幅放大）
export const TEAM_VITALITY_COST = 10;
// 每轮（自然月）结伴探险的全局次数上限：一轮最多 10 次（与单道友「每月一次」并存）
export const TEAM_EXPLORE_MAX_PER_CYCLE = 10;

// 由好感值映射当前等级（已达标中最高的）
export function affinityLevel(aff) {
  let lv = AFFINITY_LEVELS[0];
  for (const l of AFFINITY_LEVELS) if ((aff || 0) >= l.min) lv = l;
  return lv;
}

// 下一阶等级（用于进度展示）；已到顶返回 null
export function nextAffinityLevel(aff) {
  let next = null;
  for (const l of AFFINITY_LEVELS) if ((aff || 0) < l.min) { next = l; break; }
  return next;
}
