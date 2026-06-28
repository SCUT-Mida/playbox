// ============================================================================
// 物品图鉴：丹药 / 材料 / 法宝 / 功法 / 杂物
// 法宝可装备（提升攻防，附带五行与耐久）；功法学习后提供被动加成；丹药可直接使用或作为炼丹/突破材料。
// ============================================================================
import { _registerItems, _registerTechniques } from '../config.js';

// ── 丹药 ────────────────────────────────────────────────────────────────────
const PILLS = {
  pill_huitian:  { id: 'pill_huitian',  name: '回血丹',   type: 'pill', emoji: '💊', price: 30,  desc: '恢复 40% 气血。',        effect: { kind: 'heal_hp', pct: 0.40 } },
  pill_huitian2: { id: 'pill_huitian2', name: '中品回血丹', type: 'pill', emoji: '💊', price: 90,  desc: '恢复 70% 气血。',        effect: { kind: 'heal_hp', pct: 0.70 } },
  pill_buling:   { id: 'pill_buling',   name: '补灵丹',   type: 'pill', emoji: '🔮', price: 35,  desc: '恢复 50% 灵力。',        effect: { kind: 'heal_mp', pct: 0.50 } },
  pill_buling2:  { id: 'pill_buling2',  name: '中品补灵丹', type: 'pill', emoji: '🔮', price: 100, desc: '恢复全部灵力。',         effect: { kind: 'heal_mp', pct: 1.00 } },
  pill_tupo:     { id: 'pill_tupo',     name: '突破丹',   type: 'pill', emoji: '🌟', price: 60,  desc: '突破时服用，成功率 +20%。', role: 'break_boost' },
  pill_qingxin:  { id: 'pill_qingxin',  name: '清心丹',   type: 'pill', emoji: '🧿', price: 70,  desc: '渡心魔时服用，当轮必过。',  role: 'heart_pass' },
  pill_xisui:    { id: 'pill_xisui',    name: '洗髓丹',   type: 'pill', emoji: '🟢', price: 240, desc: '重塑灵根，随机提升一档资质。', effect: { kind: 'root_upgrade' } },
  pill_fuhun:    { id: 'pill_fuhun',    name: '回魂丹',   type: 'pill', emoji: '💫', price: 200, desc: '战败后服用，找回损失的修为。', effect: { kind: 'revive' } },
  // 回复活力的丹药/灵饮（坊市常售，补充每日行动力）
  pill_peiyuan:  { id: 'pill_peiyuan',  name: '培元丹',   type: 'pill', emoji: '🟢', price: 50,  desc: '温养元气，回复 30 点活力。',     effect: { kind: 'restore_vitality', amount: 30 } },
  pill_lingjiu:  { id: 'pill_lingjiu',  name: '百草灵酒', type: 'pill', emoji: '🍶', price: 110, desc: '灵药酿就，回复 60 点活力。',     effect: { kind: 'restore_vitality', amount: 60 } },
  pill_xiancha:  { id: 'pill_xiancha',  name: '玉髓仙茶', type: 'pill', emoji: '🍵', price: 220, desc: '仙人遗方，回复 100 点活力。',    effect: { kind: 'restore_vitality', amount: 100 } },
  // 境界突破所需/推荐丹药（突破时消耗，提供成功率与渡劫助力）
  pill_zhuji:    { id: 'pill_zhuji',    name: '筑基丹',   type: 'pill', emoji: '🟣', price: 150, desc: '筑基所需，稳固根基。',   role: 'break_zhuji' },
  pill_jiedan:   { id: 'pill_jiedan',   name: '结丹丹',   type: 'pill', emoji: '🟣', price: 300, desc: '结丹所需，凝聚金丹。',   role: 'break_jiedan' },
  pill_yuanying: { id: 'pill_yuanying', name: '元婴丹',   type: 'pill', emoji: '🟠', price: 600, desc: '元婴所需，孕育元婴。',   role: 'break_yuanying' },
  pill_huashen:  { id: 'pill_huashen',  name: '化神丹',   type: 'pill', emoji: '🔴', price: 1100,desc: '化神所需，元神化形。',   role: 'break_huashen' },
};

// ── 材料（炼丹/炼器原料，可出售）──────────────────────────────────────────────
const MATERIALS = {
  herb_qingmu:   { id: 'herb_qingmu',   name: '青木草',   type: 'material', emoji: '🌿', price: 12,  desc: '常见药草，性温和。',   el: 'wood' },
  herb_zihua:    { id: 'herb_zihua',    name: '紫华花',   type: 'material', emoji: '🌸', price: 22,  desc: '入药可安神。',         el: 'wood' },
  herb_lingzhi:  { id: 'herb_lingzhi',  name: '百年灵芝', type: 'material', emoji: '🍄', price: 55,  desc: '稀世灵药，药力深厚。', el: 'wood' },
  herb_hanbing:  { id: 'herb_hanbing',  name: '寒冰苔',   type: 'material', emoji: '❄️', price: 40,  desc: '生于极寒，性至阴。',   el: 'water' },
  herb_huoyan:   { id: 'herb_huoyan',   name: '赤焰果',   type: 'material', emoji: '🌶️', price: 42,  desc: '灼热如火，炼器良材。', el: 'fire' },
  ore_xuantie:   { id: 'ore_xuantie',   name: '玄铁矿',   type: 'material', emoji: '⛏️', price: 30,  desc: '坚硬沉稳的炼器矿石。', el: 'metal' },
  ore_baijin:    { id: 'ore_baijin',    name: '白金砂',   type: 'material', emoji: '✨', price: 65,  desc: '稀有金属，光泽夺目。', el: 'metal' },
  ore_longgu:    { id: 'ore_longgu',    name: '龙骨石',   type: 'material', emoji: '🦴', price: 120, desc: '蕴含远古气息的奇石。', el: 'earth' },
  essence_ling:  { id: 'essence_ling',  name: '灵气结晶', type: 'material', emoji: '💠', price: 18,  desc: '凝聚的天地灵气。',     el: null },
};

// ── 法宝（可装备，攻防加成 + 五行 + 耐久，部分附带技能）────────────────────────
// slot：装备槽位。同类(slot)法宝仅可装备一件——攻伐槽主攻击、镇御槽主防御，
// 二者可同时佩戴，让玩家兼顾攻防而非二选一。
const TREASURES = {
  fabao_feijian:  { id: 'fabao_feijian',  name: '新手飞剑',   type: 'treasure', slot: 'weapon', emoji: '🗡️', price: 80,   desc: '入门级飞剑，胜在趁手。',   stats: { atk: 8,  def: 0,  el: 'metal', dur: 30 } },
  fabao_xuangai:  { id: 'fabao_xuangai',  name: '玄龟盾',     type: 'treasure', slot: 'armor',  emoji: '🛡️', price: 90,   desc: '防御法宝，稳如磐石。',     stats: { atk: 0,  def: 14, el: 'earth', dur: 35 } },
  fabao_huoyun:   { id: 'fabao_huoyun',   name: '火云镋',     type: 'treasure', slot: 'weapon', emoji: '🔥', price: 200,  desc: '烈焰缠绕，攻伐凌厉。',     stats: { atk: 18, def: 2,  el: 'fire',  dur: 40, skill: 'fire_burst' } },
  fabao_bingpo:   { id: 'fabao_bingpo',   name: '冰魄针',     type: 'treasure', slot: 'weapon', emoji: '🧊', price: 260,  desc: '寒气逼人，伤人于无形。',   stats: { atk: 24, def: 0,  el: 'water', dur: 35, skill: 'ice_shard' } },
  fabao_leiyin:   { id: 'fabao_leiyin',   name: '雷音钟',     type: 'treasure', slot: 'armor',  emoji: '🔔', price: 420,  desc: '攻防兼备，雷音震魂。',     stats: { atk: 22, def: 18, el: 'metal', dur: 50, skill: 'thunder' } },
  fabao_qiankun:  { id: 'fabao_qiankun',  name: '乾坤圈',     type: 'treasure', slot: 'weapon', emoji: '♾️', price: 800,  desc: '高阶法宝，吞吐乾坤之力。', stats: { atk: 40, def: 25, el: null,    dur: 60, skill: 'thunder' } },
};

// 装备槽位定义：同类法宝仅可装备一件。order 决定背包/档案中的展示顺序。
export const EQUIP_SLOTS = [
  { id: 'weapon', name: '攻伐', emoji: '🗡️', desc: '攻伐法宝 · 主攻伐，附带攻击与五行' },
  { id: 'armor',  name: '镇御', emoji: '🛡️', desc: '镇御法宝 · 主镇御，附带防御与五行' },
];
export function slotDef(id) { return EQUIP_SLOTS.find((s) => s.id === id) || null; }
export function slotName(id) { const s = slotDef(id); return s ? s.name : '法宝'; }

// 法宝技能：战斗中"使用法宝"动作触发（造成额外属性伤害）
export const TREASURE_SKILLS = {
  fire_burst: { name: '烈焰爆', el: 'fire',  mult: 1.8, desc: '烈焰灼烧敌方。' },
  ice_shard:  { name: '冰魄刺', el: 'water', mult: 1.6, desc: '冰针刺骨。' },
  thunder:    { name: '雷音震', el: 'metal', mult: 2.0, desc: '雷音震荡，伤敌神魂。' },
};

// ── 功法（学习后被动生效，可叠加）─────────────────────────────────────────────
// el：功法所属属性（金木水火土 / 风雷冰）。与灵根属性契合时修炼/突破额外加成。
const TECHNIQUES = {
  gongfa_changchun: { id: 'gongfa_changchun', name: '长春功',   type: 'technique', emoji: '📖', price: 180,  desc: '基础吐纳之法，修炼速度 +10%。',         cultivate: 1.10, breakBonus: 0.00, atkPct: 0,    hpPct: 0,    el: null      },
  gongfa_xuanmu:    { id: 'gongfa_xuanmu',    name: '玄木功',   type: 'technique', emoji: '📖', price: 360,  desc: '木系功法，修炼 +15%、突破 +3%。',        cultivate: 1.15, breakBonus: 0.03, atkPct: 0,    hpPct: 0.05, el: 'wood'   },
  gongfa_leiting:   { id: 'gongfa_leiting',   name: '雷霆诀',   type: 'technique', emoji: '📖', price: 520,  desc: '雷系杀伐之术，攻击 +18%。',             cultivate: 1.00, breakBonus: 0.00, atkPct: 0.18, hpPct: 0,    el: 'thunder' },
  gongfa_taiyi:     { id: 'gongfa_taiyi',     name: '太乙仙诀', type: 'technique', emoji: '📜', price: 1500, desc: '顶级功法，修炼 +25%、突破 +5%。',       cultivate: 1.25, breakBonus: 0.05, atkPct: 0.10, hpPct: 0.10, el: null      },
};

// ── 杂物 ────────────────────────────────────────────────────────────────────
const MISC = {
  lingdust: { id: 'lingdust', name: '灵石碎', type: 'misc', emoji: '🪙', price: 5, desc: '灵石碎屑，只能出售换钱。' },
  fuchou:   { id: 'fuchou',   name: '遁地符', type: 'misc', emoji: '🟨', price: 40, desc: '战斗中"逃跑"必成（一次性）。', role: 'flee_guarantee' },
};

// 合并图鉴
export const ITEMS = { ...PILLS, ...MATERIALS, ...TREASURES, ...TECHNIQUES, ...MISC };
export const ITEM_LIST = Object.values(ITEMS);
export const PILL_LIST = Object.values(PILLS);
export const TREASURE_LIST = Object.values(TREASURES);
export const TECHNIQUE_LIST = Object.values(TECHNIQUES);
export const MATERIAL_LIST = Object.values(MATERIALS);

export function isPill(id) { return ITEMS[id] && ITEMS[id].type === 'pill'; }
export function isTreasure(id) { return ITEMS[id] && ITEMS[id].type === 'treasure'; }
export function isTechnique(id) { return ITEMS[id] && ITEMS[id].type === 'technique'; }

// 注册到 config，供公式查表
_registerItems(ITEMS);
_registerTechniques(TECHNIQUES);
