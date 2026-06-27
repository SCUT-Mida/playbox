// ============================================================================
// 人物设定：天赋 / 出身 / 形象（头像）。
// 创角时随机生成，影响修炼、战斗、炼丹、气运与每日活力；纯数据，不依赖其它模块，
// 供 config / player / ui 查表（避免与 config 形成循环依赖）。
// ============================================================================

// ── 天赋（创角随机获得 1~3 个，可后天不变；提供各类被动加成）──────────────────
// 字段含义（在 player.recompute / config 公式 / alchemy 中读取）：
//   cultMult      修炼速度倍率（乘算）
//   breakBonus    突破成功率（加算）
//   hpPct/mpPct   气血/灵力上限倍率（加算基底）
//   atkFlat/defFlat/spiritFlat  攻/防/神识（加算）
//   alchemyBonus  炼丹/炼器成率（加算）
//   qiyunBonus    气运（加算，影响奇遇保底与稀有加成）
//   maxVitBonus   每日活力上限（加算）
export const TALENTS = {
  tal_wuxing:   { id: 'tal_wuxing',   name: '悟性奇高', emoji: '🧠', desc: '修炼速度 +12%。',                cultMult: 1.12 },
  tal_shenshi:  { id: 'tal_shenshi',  name: '神识通明', emoji: '👁️', desc: '神识 +30，炼丹成率 +10%。',     spiritFlat: 30, alchemyBonus: 0.10 },
  tal_xianling: { id: 'tal_xianling', name: '仙灵之体', emoji: '💧', desc: '灵力上限 +15%。',                mpPct: 0.15 },
  tal_tiegu:    { id: 'tal_tiegu',    name: '铁骨铜皮', emoji: '🪨', desc: '气血上限 +15%，防御 +8。',       hpPct: 0.15, defFlat: 8 },
  tal_wuqu:     { id: 'tal_wuqu',     name: '武曲照命', emoji: '⚔️', desc: '攻击 +8。',                      atkFlat: 8 },
  tal_dandao:   { id: 'tal_dandao',   name: '丹道天才', emoji: '⚗️', desc: '炼丹/炼器成率 +18%。',           alchemyBonus: 0.18 },
  tal_xionghua: { id: 'tal_xionghua', name: '逢凶化吉', emoji: '🍀', desc: '气运 +20，奇遇更易降临。',       qiyunBonus: 20 },
  tal_tianyan:  { id: 'tal_tianyan',  name: '天衍之资', emoji: '🌌', desc: '突破成功率 +10%。',              breakBonus: 0.10 },
  tal_wanshou:  { id: 'tal_wanshou',  name: '万寿无疆', emoji: '🐢', desc: '气血上限 +10%，每日活力 +30。',  hpPct: 0.10, maxVitBonus: 30 },
  tal_lingxin:  { id: 'tal_lingxin',  name: '灵心慧质', emoji: '✨', desc: '灵力上限 +10%，神识 +15。',      mpPct: 0.10, spiritFlat: 15 },
  tal_cangqiong:{ id: 'tal_cangqiong',name: '苍穹之体', emoji: '🌠', desc: '攻击 +6、防御 +6（罕有）。',     atkFlat: 6, defFlat: 6 },
  tal_fuyuan:   { id: 'tal_fuyuan',   name: '福缘深厚', emoji: '🎋', desc: '气运 +30，每日活力 +20。',       qiyunBonus: 30, maxVitBonus: 20 },
};
export const TALENT_LIST = Object.values(TALENTS);

// ── 出身（创角随机一个，提供微量初始资源 + 文案）──────────────────────────────
// bonus: { stones, items:[{id,qty}] }
export const BACKGROUNDS = {
  bg_liumin:   { id: 'bg_liumin',   name: '流落街头', emoji: '🏚️', desc: '少时家破，颠沛流离，磨练出坚韧心性。', bonus: { stones: 25 } },
  bg_shanyao:  { id: 'bg_shanyao',  name: '山野樵子', emoji: '🪓', desc: '长于山野，自幼识得百草。',           bonus: { items: [{ id: 'herb_qingmu', qty: 3 }] } },
  bg_guanxian: { id: 'bg_guanxian', name: '官宦之后', emoji: '🏯', desc: '家道中落，尚余薄财傍身。',           bonus: { stones: 70 } },
  bg_sengru:   { id: 'bg_sengru',   name: '寺庙沙弥', emoji: '🛕', desc: '随僧习静，略通丹理医道。',           bonus: { items: [{ id: 'pill_huitian', qty: 1 }] } },
  bg_hunter:   { id: 'bg_hunter',   name: '猎户之子', emoji: '🏹', desc: '自幼弓马，胆识过人。',               bonus: { items: [{ id: 'ore_xuantie', qty: 2 }] } },
  bg_guzhong:  { id: 'bg_guzhong',  name: '谷中遗孤', emoji: '🌾', desc: '幽谷长大，与灵药为伴。',             bonus: { items: [{ id: 'herb_zihua', qty: 2 }] } },
};
export const BACKGROUND_LIST = Object.values(BACKGROUNDS);

// ── 形象 / 头像（根据性别 × 修炼方向预设，共 12 + 飞升特例）────────────────────
// path 关联到某个天赋：拥有该天赋则匹配对应形象（"根据属性"）；无匹配则取散修默认。
const PORTRAIT_DEFS = [
  // [后缀, 标签, emoji男, emoji女, 关联天赋]
  ['wuqu',    '剑修', '🤺', '🧝‍♀️', 'tal_wuqu'],
  ['dandao',  '药修', '🧪', '🌸',   'tal_dandao'],
  ['tiegu',   '体修', '🛡️', '🪨',   'tal_tiegu'],
  ['xianling','玄修', '🧙', '🧚‍♀️', 'tal_xianling'],
  ['shenshi', '神修', '👁️', '🔮',   'tal_shenshi'],
  ['default', '散修', '🧑', '👩',   null],
];
export const PORTRAITS = (() => {
  const map = {};
  for (const [suf, tag, mEmoji, fEmoji, tal] of PORTRAIT_DEFS) {
    map[`pt_m_${suf}`] = { id: `pt_m_${suf}`, gender: 'male', emoji: mEmoji, tag, talent: tal };
    map[`pt_f_${suf}`] = { id: `pt_f_${suf}`, gender: 'female', emoji: fEmoji, tag, talent: tal };
  }
  map.pt_ascend = { id: 'pt_ascend', gender: null, emoji: '⛩️', tag: '飞升仙尊', talent: null };
  return map;
})();
export const PORTRAIT_LIST = Object.values(PORTRAITS);

// 根据性别与已得天赋，匹配最贴切的形象（无匹配取散修默认）
export function pickPortrait(gender, talentIds = []) {
  const g = gender === 'female' ? 'f' : 'm';
  for (const [suf, , , , tal] of PORTRAIT_DEFS) {
    if (tal && talentIds.includes(tal)) {
      const p = PORTRAITS[`pt_${g}_${suf}`];
      if (p) return p;
    }
  }
  return PORTRAITS[`pt_${g}_default`];
}

export function portraitDef(id) {
  return PORTRAITS[id] || PORTRAITS.pt_m_default;
}

// 气运档次文案
export function qiyunLabel(q) {
  const v = Math.max(0, Math.min(100, q | 0));
  if (v >= 90) return { text: '天命之选', cls: 'epic' };
  if (v >= 75) return { text: '大吉', cls: 'good' };
  if (v >= 60) return { text: '吉', cls: 'good' };
  if (v >= 45) return { text: '平平', cls: 'normal' };
  return { text: '多舛', cls: 'bad' };
}
