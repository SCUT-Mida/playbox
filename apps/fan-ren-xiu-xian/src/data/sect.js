// ============================================================================
// 宗门系统数据：宗门 / 宗门称号 / 每日宗门任务池。纯数据，不依赖其它模块。
// 境界门槛用 tier 整数（0=凡人 … 9=飞升）表示，避免引入 config 造成循环依赖。
// ============================================================================

// ── 宗门（创角后可加入其一；提供微量修炼加成 + 主题文案）──────────────────────
// cultMult: 入宗后自身的修炼速度倍率（与「宗门称号」倍率叠加）
export const SECTS = {
  sect_qingyun: { id: 'sect_qingyun', name: '青云宗', emoji: '☁️', cultMult: 1.04, desc: '云水为宗，重吐纳根基，门下弟子修炼速度略胜一筹。' },
  sect_wanjian: { id: 'sect_wanjian', name: '万剑宗', emoji: '⚔️', cultMult: 1.03, desc: '以剑入道，杀伐凌厉，历练妖兽时更得心应手。' },
  sect_danxia:  { id: 'sect_danxia',  name: '丹霞谷', emoji: '🔥', cultMult: 1.03, desc: '丹道闻名天下，门人精于炼制，材料源源不绝。' },
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
