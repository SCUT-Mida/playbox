// ============================================================================
// 宗门系统数据：宗门 / 宗门称号 / 每日宗门任务池。纯数据，不依赖其它模块。
// 境界门槛用 tier 整数（0=凡人 … 9=飞升）表示，避免引入 config 造成循环依赖。
// ============================================================================

// ── 宗门（创角后可加入其一；提供微量修炼加成 + 主题文案）──────────────────────
// cultMult: 入宗后自身的修炼速度倍率（与「宗门称号」倍率叠加）
export const SECTS = {
  sect_qingyun: { id: 'sect_qingyun', name: '青云宗',   emoji: '☁️', cultMult: 1.04, desc: '云水为宗，重吐纳根基，门下弟子修炼速度略胜一筹。' },
  sect_wanjian: { id: 'sect_wanjian', name: '万剑宗',   emoji: '⚔️', cultMult: 1.03, desc: '以剑入道，杀伐凌厉，历练妖兽时更得心应手。' },
  sect_danxia:  { id: 'sect_danxia',  name: '丹霞谷',   emoji: '🔥', cultMult: 1.03, desc: '丹道闻名天下，门人精于炼制，材料源源不绝。' },
  sect_lingjiu: { id: 'sect_lingjiu', name: '灵鹫宫',   emoji: '🦅', cultMult: 1.04, desc: '立于绝巅，轻身御风，门下身法独步天下。' },
  sect_qiankun:{ id: 'sect_qiankun', name: '乾坤阁',   emoji: '☯️', cultMult: 1.04, desc: '阴阳并修，博采众长，弟子根基浑厚。' },
  sect_moyun:   { id: 'sect_moyun',   name: '墨云门',   emoji: '🌧️', cultMult: 1.03, desc: '行事隐秘，善隐匿潜行，所获机缘常多于他人。' },
  sect_bingpo:  { id: 'sect_bingpo',  name: '冰魄殿',   emoji: '❄️', cultMult: 1.04, desc: '极寒之地立宗，法术凛冽，攻伐冰寒彻骨。' },
  sect_leiyin:  { id: 'sect_leiyin',  name: '雷音寺',   emoji: '🔔', cultMult: 1.04, desc: '禅武双修，雷音护体，弟子体魄坚不可摧。' },
  sect_xingchen:{ id: 'sect_xingchen',name: '星辰宗',   emoji: '✨', cultMult: 1.05, desc: '观星悟道，推演天机，修炼事半功倍。' },
  sect_baimang: { id: 'sect_baimang', name: '百蛮教',   emoji: '🗿', cultMult: 1.03, desc: '南疆蛮荒立教，擅御蛊驱兽，行事不拘常理。' },
  sect_taiyi:   { id: 'sect_taiyi',   name: '太乙门',   emoji: '🌫️', cultMult: 1.05, desc: '上古传承，道法正宗，门人根骨非凡。' },
};
export const SECT_LIST = Object.values(SECTS);

// ── 宗门称号：需同时满足「最低境界 minTier」与「最低声望 minRep」方可获得 ──────
// 自下而上递进；取「已达标」中最高的那一个作为当前称号。
// cultMult: 该称号提供的修炼速度倍率（仅当前称号生效，不与低阶称号叠加）
// daily:    每日可领取一次的宗门俸禄（灵石 / 物品）
export const SECT_TITLES = [
  { id: 'st_jiming',    name: '记名弟子',   minTier: 0, minRep: 0,    emoji: '🏷️', cultMult: 1.00, desc: '初入宗门，尚在记名。',         daily: { stones: 12 } },
  { id: 'st_waimen',    name: '外门弟子',   minTier: 1, minRep: 60,   emoji: '🟢', cultMult: 1.02, desc: '执掌外门杂务，初窥门径。',     daily: { stones: 24, items: [{ id: 'pill_huitian', qty: 1 }] } },
  { id: 'st_neimen',    name: '内门弟子',   minTier: 2, minRep: 220,  emoji: '🔵', cultMult: 1.05, desc: '得传核心功法，修炼日进。',     daily: { stones: 45, items: [{ id: 'pill_buling', qty: 1 }] } },
  { id: 'st_zhenchuan', name: '真传弟子',   minTier: 3, minRep: 560,  emoji: '🟣', cultMult: 1.08, desc: '衣钵传人，深得宗门真传。',     daily: { stones: 85, items: [{ id: 'pill_tupo', qty: 1 }] } },
  { id: 'st_zhanglao',  name: '护法长老',   minTier: 4, minRep: 1200, emoji: '🟠', cultMult: 1.10, desc: '执掌护法之职，威望日隆。',     daily: { stones: 150, items: [{ id: 'herb_lingzhi', qty: 1 }] } },
  { id: 'st_taishang',  name: '太上长老',   minTier: 5, minRep: 2600, emoji: '🔴', cultMult: 1.12, desc: '退居太上，宗门大事皆可参决。', daily: { stones: 260, items: [{ id: 'ore_longgu', qty: 1 }] } },
  { id: 'st_zongzhu',   name: '一代宗主',   minTier: 6, minRep: 5200, emoji: '👑', cultMult: 1.15, desc: '执掌一宗，号令群修。',         daily: { stones: 420, items: [{ id: 'pill_xisui', qty: 1 }] } },
];

// ── 每日宗门任务池（每日从中抽取若干，完成后提升宗门声望）──────────────────────
// type 与各系统上报的活动类型对齐：cultivate / explore / battle / craft / breakthrough
export const SECT_TASK_POOL = [
  { id: 't_cultivate',    type: 'cultivate',    label: '吐纳修行', emoji: '🧘', verb: '完成主动修炼', goal: 6, rep: 15 },
  { id: 't_explore',      type: 'explore',      label: '行走历练', emoji: '🗺️', verb: '外出探索',     goal: 4, rep: 20 },
  { id: 't_battle',       type: 'battle',       label: '降妖除魔', emoji: '⚔️', verb: '战胜妖兽',     goal: 3, rep: 25 },
  { id: 't_craft',        type: 'craft',        label: '丹器双修', emoji: '⚗️', verb: '成功炼制',     goal: 2, rep: 20 },
  { id: 't_breakthrough', type: 'breakthrough', label: '冲破瓶颈', emoji: '🌟', verb: '完成突破',     goal: 1, rep: 35 },
];

// ── 悬赏挑战模板（自主领取，难度与境界挂钩）──────────────────────────────────
// type 复用活动上报类型，故完成对应行为时同样推进挑战进度（与每日任务共用 recordSectActivity）。
// baseGoal/baseRep/baseStones 为凡人期基准；core/sect.js 的 rollChallenge 会按 tier 放大。
// reward：额外物品奖励（可选，高境界挑战发放）
export const CHALLENGE_TEMPLATES = [
  { id: 'ct_battle',       type: 'battle',       label: '清剿妖巢', emoji: '🗡️', verb: '战胜妖兽',     baseGoal: 5,  baseRep: 60,  baseStones: 90,  desc: '受命清剿为祸一方的妖兽群。' },
  { id: 'ct_explore',      type: 'explore',      label: '深入秘境', emoji: '🧭', verb: '外出探索',     baseGoal: 6,  baseRep: 60,  baseStones: 100, desc: '探寻人迹罕至的秘境深处。' },
  { id: 'ct_cultivate',    type: 'cultivate',    label: '百日苦修', emoji: '🧘', verb: '完成主动修炼', baseGoal: 12, baseRep: 55,  baseStones: 110, desc: '闭关苦修，磨砺道心。' },
  { id: 'ct_craft',        type: 'craft',        label: '炼制供奉', emoji: '⚗️', verb: '成功炼制',     baseGoal: 4,  baseRep: 70,  baseStones: 130, desc: '为宗门炼制一批丹器供奉。' },
  { id: 'ct_breakthrough', type: 'breakthrough', label: '冲击瓶颈', emoji: '🌟', verb: '完成突破',     baseGoal: 2,  baseRep: 90,  baseStones: 160, desc: '突破在即，受宗门加持冲击瓶颈。' },
];
// 同时可持有的悬赏挑战数量上限
export const MAX_ACTIVE_CHALLENGES = 2;
