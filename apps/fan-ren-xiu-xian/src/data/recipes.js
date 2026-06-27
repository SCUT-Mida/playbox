// ============================================================================
// 丹方与器图：炼丹 / 炼器 配方
// inputs: 所需材料 {id: count}；out: 产出物品 id；diff: 难度（1~4，影响成丹率）
// 产出品质随机：失败 / 低阶 / 正常 / 极品（极品附带额外效果）。
// ============================================================================

// ── 丹方 ────────────────────────────────────────────────────────────────────
export const ALCHEMY_RECIPES = [
  { id: 'rcp_huitian',  name: '回血丹方',     inputs: { herb_qingmu: 2 },                       out: 'pill_huitian',  diff: 1, desc: '最基础的疗伤丹方。' },
  { id: 'rcp_buling',   name: '补灵丹方',     inputs: { herb_zihua: 2 },                        out: 'pill_buling',   diff: 1, desc: '凝神聚灵的丹方。' },
  { id: 'rcp_qingxin',  name: '清心丹方',     inputs: { herb_hanbing: 2 },                      out: 'pill_qingxin',  diff: 2, desc: '清心定神，渡心魔良药。' },
  { id: 'rcp_huitian2', name: '中品回血丹方', inputs: { herb_lingzhi: 1, herb_qingmu: 2 },      out: 'pill_huitian2', diff: 2, desc: '药力更胜回血丹。' },
  { id: 'rcp_tupo',     name: '突破丹方',     inputs: { herb_zihua: 3, essence_ling: 2 },       out: 'pill_tupo',     diff: 2, desc: '助人冲破瓶颈。' },
  { id: 'rcp_zhuji',    name: '筑基丹方',     inputs: { herb_lingzhi: 1, herb_zihua: 2, essence_ling: 3 }, out: 'pill_zhuji', diff: 3, desc: '筑基所需，不可轻传。' },
  { id: 'rcp_xisui',    name: '洗髓丹方',     inputs: { herb_lingzhi: 2, ore_longgu: 1 },       out: 'pill_xisui',    diff: 4, desc: '洗毛伐髓，逆天改命。' },
];

// ── 器图 ────────────────────────────────────────────────────────────────────
export const FORGE_BLUEPRINTS = [
  { id: 'bp_feijian', name: '飞剑图谱', inputs: { ore_xuantie: 3 },                out: 'fabao_feijian', diff: 1, desc: '入门飞剑的炼制之法。' },
  { id: 'bp_xuangai', name: '玄龟盾图', inputs: { ore_xuantie: 2, ore_longgu: 1 }, out: 'fabao_xuangai', diff: 1, desc: '防御法宝锻造图。' },
  { id: 'bp_huoyun',  name: '火云镋图', inputs: { ore_baijin: 2, herb_huoyan: 2 }, out: 'fabao_huoyun',  diff: 2, desc: '火属性攻伐法宝。' },
  { id: 'bp_leiyin',  name: '雷音钟图', inputs: { ore_baijin: 3, ore_longgu: 1 }, out: 'fabao_leiyin',  diff: 3, desc: '高阶攻防法宝。' },
];

// 所有配方（炼丹 + 炼器）统一索引，用于解锁/背包展示
export const ALL_RECIPES = [...ALCHEMY_RECIPES, ...FORGE_BLUEPRINTS];
export const RECIPE_BY_ID = Object.fromEntries(ALL_RECIPES.map((r) => [r.id, r]));
