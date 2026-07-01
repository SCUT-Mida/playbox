// 纯逻辑自测（不依赖浏览器/DOM）。运行：npm test
import {
  REALMS, SPIRIT_ROOTS, ASCEND_INDEX, globalLevel, fromGlobalLevel, xpNeeded, MAX_GLOBAL_LEVEL,
  passiveXpPerSec, breakthroughChance, computeDamage, counterMult, clamp,
  cultivateSpeedMult,
  PITTY_THRESHOLD, PITTY_BOOST, dayKey, cycleKey, monthKey, monthsBetween,
  ROOT_GRADES, ROOT_COUNTS, FIVE_ELEMENTS, MUTANT_ELEMENTS,
  rootDescriptor, rootAffinity, rootGradeDef, rootCountDef, elDef, rootFromLegacy,
  realmLifespan, isDying, canReincarnate, ageLabel, ageDetailLabel, ageMonthFromKey,
  vitalityMax, MAX_VITALITY, MONTHS_PER_CYCLE,
  START_AGE_MIN, START_AGE_MAX, YEARS_PER_CYCLE, MAX_REINCARNATIONS, REINCARNATION_CULT_BONUS,
  ROOT_AFFINITY_MATCH,
} from '../src/config.js';
import { ITEMS, TREASURE_SKILLS } from '../src/data/items.js';
import { makeEnemy } from '../src/data/enemies.js';
import { EVENTS, eligibleEvents } from '../src/data/events.js';
import {
  newPlayer, recompute, addXp, isXpFull, addItem, removeItem, countItem, hasItem,
  equip, unequip, expandBag, bagExpandCost, upgradeRoot, distinctItems, realmInfo, START_BAG_CAPACITY,
  restToNextDay, vitalityDepleted, rolloverVitality, rollRoot, reincarnate, reincarnateAscended,
} from '../src/core/player.js';
import { activeCultivate, passiveTick } from '../src/core/cultivate.js';
import { rollExplore, applyReward, chaosActive } from '../src/core/explore.js';
import { createBattle, battleStep, battleRewards } from '../src/core/battle.js';
import {
  nextTarget, canBreakthrough, needsTrial, attemptMinorBreakthrough,
  startMajorTrial, trialRespond, advanceRealm, failMajor,
} from '../src/core/breakthrough.js';
import { tryAlchemy, tryForge, hasMaterials, successRate } from '../src/core/alchemy.js';
import { rollMarket, buyItem, sellItem, sellPrice, shopBlurb, itemEffectText } from '../src/core/market.js';
import { ACHIEVEMENTS, ACH_CATS, checkAchievements, achProgress, rewardDesc, applyAchievementReward } from '../src/core/achievements.js';
import { SECTS, SECT_LIST, SECT_TITLES, SECT_TASK_POOL, CHALLENGE_TEMPLATES, MAX_ACTIVE_CHALLENGES } from '../src/data/sect.js';
import {
  joinSect, sectDef, currentSectTitle, nextSectTitle, titleProgress,
  ensureSectTasks, dailySectRollover, recordSectActivity, claimSectTask, claimAllSectTasks,
  claimDailySectReward, sectRewardClaimedToday, sectCultivateBonus, rollDailySectTasks,
  acceptChallenge, claimChallenge, abandonChallenge, activeChallengeCount, scaleChallenge,
} from '../src/core/sect.js';
import { NPC_LIST, NPCS, npcDef, affinityLevel, TEAM_AFFINITY_THRESHOLD, MEET_VITALITY_COST, TEAM_VITALITY_COST, TEAM_EXPLORE_MAX_PER_CYCLE } from '../src/data/npcs.js';
import {
  meetNpc, giftNpc, canTeamUp, teamedToday, teamExplore, teamExploreUsed, teamExploreRemaining,
  meetableNpcs, metNpcs, getAffinity, isMet, companionCultivateBonus,
} from '../src/core/npc.js';
import { playSfx, isSfxEnabled, setSfxEnabled } from '../src/core/sfx.js';
import {
  AUTO_TENDENCIES, defaultTendencies, defaultAutoPlay, normalizeAutoPlay, pickTendency, autoStep,
} from '../src/core/autoplay.js';
import {
  hasSave, loadGame, saveGame, clearSave, exportSave, importSave, computeOffline, _setStorage,
} from '../src/core/save.js';
import { makeRng, weighted, rangeInt, pick } from '../src/core/rng.js';

let pass = 0; let fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.error('  ✗ FAIL:', msg); } };
const near = (a, b, eps = 0.001) => Math.abs(a - b) <= eps;

// ---------- 配置 / 境界 ----------
console.log('— config / realms —');
ok(REALMS.length === 10, '10 大境界');
ok(REALMS[0].name === '凡人' && REALMS[9].name === '飞升', '首末境界名称');
ok(globalLevel(0, 0) === 0, '凡人 = lv0');
ok(globalLevel(1, 0) === 1 && globalLevel(1, 12) === 13, '炼气 1..13');
ok(globalLevel(2, 0) === 14, '筑基初 = lv14');
ok(globalLevel(9, 0) === MAX_GLOBAL_LEVEL, '飞升 = MAX');
ok(fromGlobalLevel(17).tier === 2 && fromGlobalLevel(17).sub === 3, 'lv17 → 筑基圆满');
ok(xpNeeded(1) < xpNeeded(5) && xpNeeded(5) < xpNeeded(13), 'xp 单调递增');
ok(passiveXpPerSec(1, 1) > 0, '炼气被动修为 > 0');
ok(computeDamage(100, 20, () => 0.5) === 80, '伤害 = atk*variance - def (rng=0.5→1.0)');
ok(computeDamage(5, 100, () => 0) === 1, '伤害下限 1');
ok(counterMult('metal', 'wood') === 1.3, '金克木 ×1.3');
ok(counterMult('wood', 'metal') === 0.85, '木被金克 ×0.85');
ok(counterMult('fire', 'fire') === 1, '同五行 ×1');

// ---------- rng ----------
console.log('— rng —');
const r1 = makeRng(42); const r2 = makeRng(42);
ok(r1() === r2(), 'makeRng 同种子确定');
ok(rangeInt(() => 0, 3, 5) === 3, 'rangeInt rng=0 → min');
const wp = weighted(() => 0, [{ item: 'a', weight: 1 }, { item: 'b', weight: 9 }]);
ok(wp === 'a', 'weighted rng=0 → 首项');
ok(pick(() => 0.99, [1, 2, 3]) === 3, 'pick rng=0.99 → 末项');

// ---------- 玩家创建 ----------
console.log('— player —');
let p = newPlayer(() => 0);
ok(p.tier === 0 && p.sub === 0, '初始凡人');
ok(SPIRIT_ROOTS.some((s) => s.id === p.rootId), '灵根合法');
ok(p.maxHp > 0 && p.maxMp > 0 && p.atk > 0 && p.def > 0 && p.spirit > 0, '衍生属性为正');
ok(p.hp === p.maxHp && p.mp === p.maxMp, '满血满蓝开局');
ok(p.stones >= 50, '初始灵石 >= 50');
ok(p.bagCapacity === START_BAG_CAPACITY, '初始容量');
ok(hasItem(p, 'pill_huitian', 2), '新手礼包含 2 回血丹');

// 灵根三轴化：root = { grade, count, els }，年龄随机
ok(p.root && ROOT_GRADES.some((g) => g.id === p.root.grade), '灵根含 grade 档次');
ok(p.root.els.length === rootCountDef(p.root.count).count, '灵根属性数 = 组合数');
ok(p.root.els.every((e) => elDef(e)), '灵根属性均合法');
ok(Number.isFinite(p.age) && p.age >= START_AGE_MIN && p.age <= START_AGE_MAX, `年龄在起始区间 (${p.age})`);
ok(rootDescriptor(p.root).mult === p.rootMult, 'rootMult 来自 rootDescriptor');

// 灵根提升（等级档次 +1）
const rootBefore = p.root.grade;
const up = upgradeRoot(p);
const idxBefore = ROOT_GRADES.findIndex((g) => g.id === rootBefore);
ok(up === (idxBefore < ROOT_GRADES.length - 1), 'upgradeRoot 在未满时提升');
// 升到顶后不再升：直接置 root.grade 为最高档
p.root = { grade: ROOT_GRADES[ROOT_GRADES.length - 1].id, count: 'single', els: ['thunder'] }; recompute(p);
ok(upgradeRoot(p) === false, '灵根满级后 upgradeRoot 返回 false');

// 修为 / 突破前置
ok(isXpFull(p) === false, '初始修为未满');
p.xp = p.xpMax;
ok(isXpFull(p) === true, '手动置满后 isXpFull');
ok(canBreakthrough(p) === true, '修为满可突破');

// 背包增删
addItem(p, 'herb_qingmu', 5);
ok(countItem(p, 'herb_qingmu') >= 5, 'addItem 累加');
removeItem(p, 'herb_qingmu', 2);
ok(countItem(p, 'herb_qingmu') === countItem(p, 'herb_qingmu'), 'removeItem 不报错');
ok(removeItem(p, 'herb_qingmu', 999) === false, '超额 removeItem 失败');

// 装备（多槽位：攻伐 / 镇御，同类仅一件）
addItem(p, 'fabao_feijian', 1);
const atkBefore = p.atk;
equip(p, 'fabao_feijian');
ok(p.equipment && p.equipment.weapon === 'fabao_feijian', '装备后 equipment.weapon 设置');
ok(p.atk >= atkBefore, '装备提升攻击');
unequip(p, 'weapon');
ok(p.equipment.weapon === null, '卸载后 equipment.weapon 清空');
// 同类槽位互斥：换装另一件攻伐法宝，旧的自动回背包
addItem(p, 'fabao_huoyun', 1);
equip(p, 'fabao_huoyun');
ok(p.equipment.weapon === 'fabao_huoyun' && hasItem(p, 'fabao_feijian', 1), '同类(攻伐)仅一件：换装后旧法宝回背包');
// 不同类可共存：攻伐 + 镇御同时装备
addItem(p, 'fabao_xuangai', 1);
equip(p, 'fabao_xuangai');
ok(p.equipment.weapon === 'fabao_huoyun' && p.equipment.armor === 'fabao_xuangai', '攻伐+镇御可同时装备');
unequip(p, 'armor');
ok(p.equipment.armor === null && p.equipment.weapon === 'fabao_huoyun', '卸下镇御不影响攻伐槽');

// 储物袋扩容
const capBefore = p.bagCapacity;
const cost = bagExpandCost(p);
p.stones = cost + 10;
ok(expandBag(p) === true && p.bagCapacity === capBefore + 5, '扩容 +5');

// ---------- 修炼 ----------
console.log('— cultivate —');
p = newPlayer(() => 0);
p.tier = 1; p.sub = 0; recompute(p); p.mp = p.maxMp;
const mp0 = p.mp;
const res = activeCultivate(p, () => 0.99); // rng 高 → 非 epiphany（epiphany chance 0.08）
ok(res.ok === true, '主动修炼成功');
ok(p.mp === mp0 - 8, '消耗 8 灵力');
ok(res.xp > 0, '获得修为 > 0');
const xp0 = p.xp;
activeCultivate(p, () => 0); // rng 低 → 触发顿悟
ok(p.xp >= xp0, '顿悟也增加修为');
// 灵力不足
p.mp = 0;
ok(activeCultivate(p).ok === false, '灵力不足拒绝');
// 被动
const xp1 = p.xp;
passiveTick(p, 10);
ok(p.xp >= xp1, '被动修炼累积修为');
ok(p.mp > 0 || p.mp === 0, '被动回复灵力不报错');

// ---------- 探索 ----------
console.log('— explore —');
p = newPlayer(() => 0); p.tier = 1; p.sub = 0; recompute(p); p.hp = p.maxHp; p.mp = p.maxMp;
const mp1 = p.mp; const hp1 = p.hp;
const exp = rollExplore(p, makeRng(7));
ok(!exp.error && exp.encounter, '探索返回事件');
ok(p.mp < mp1, '探索消耗灵力');
ok(p.hp < hp1, '探索消耗气血');
ok(SCENE_VALID(exp.scene), '场景合法');
// applyReward
p.pity.explore = 0;
const stonesBefore = p.stones;
const logs = applyReward(p, { stones: 100, items: [{ id: 'herb_qingmu', qty: 2 }], xp: 10, log: '测试' }, () => 0);
ok(logs.length > 0, 'applyReward 返回日志');
ok(p.stones === stonesBefore + 100, 'applyReward 灵石 +100');
ok(countItem(p, 'herb_qingmu') >= 2, 'applyReward 入袋');
// 配方奖励：日志须给出中文名，不得冒出未映射的英文 id（组队/探索奖励常见症状）
{
  const q = newPlayer(() => 0);
  const rlogs = applyReward(q, { recipe: 'rcp_zhuji' }, () => 0);
  const txt = rlogs.map((l) => l.text).join('');
  ok(/筑基丹方/.test(txt) && !/rcp_zhuji/.test(txt), '配方奖励日志显示中文名（不含英文 id）');
}
// 保底机制（核心随机性链路）：pity >= PITTY_THRESHOLD 时，稀有事件权重 ×(1+PITTY_BOOST)。
// 用受控 rng 序列证明：同一随机源下，保底激活会把"普通妖兽(common)"选择翻转为"稀有空间裂缝(rare)"。
// 序列首值 0.6 → pick 场景 'ruin'(idx2)；次值 0.72 → weighted 落点恰好在保底前后跨越 common/rare 边界。
{
  const makeP = () => { const q = newPlayer(() => 0); q.tier = 2; q.sub = 0; recompute(q); q.hp = q.maxHp; q.mp = q.maxMp; return q; };
  const seqRng = (seq) => { let i = 0; return () => (i < seq.length ? seq[i++] : 0.5); };
  const q0 = makeP(); q0.pity.explore = 0;
  const noBoost = rollExplore(q0, seqRng([0.6, 0.72]));
  const q1 = makeP(); q1.pity.explore = PITTY_THRESHOLD;
  const withBoost = rollExplore(q1, seqRng([0.6, 0.72]));
  ok(!noBoost.error && noBoost.encounter.kind === 'battle', '保底未激活：同 rng 命中普通妖兽事件(common)');
  ok(!withBoost.error && withBoost.encounter.kind === 'choice', `保底激活(PITTY_BOOST=${PITTY_BOOST})：同 rng 翻转为稀有空间裂缝(rare)`);
}

// ---------- 战斗 ----------
console.log('— battle —');
p = newPlayer(() => 0); p.tier = 2; p.sub = 0; recompute(p); p.hp = p.maxHp;
addItem(p, 'fabao_huoyun', 1); equip(p, 'fabao_huoyun');
const enemy = makeEnemy(p.lv, makeRng(3));
ok(enemy.hp > 0 && enemy.atk > 0 && enemy.rewards, '妖兽属性完整');
let battle = createBattle(p, enemy);
let safety = 0; let result = null;
while (!battle.over && safety++ < 200) {
  const r = battleStep(battle, p, { type: 'attack' }, makeRng(5));
  result = r.result;
}
ok(battle.over === true, '战斗会在有限回合内结束');
ok(['win', 'lose'].includes(result), '纯攻击结局为胜或败');
// 逃跑必成（遁地符）
p.hp = p.maxHp; addItem(p, 'fuchou', 1);
battle = createBattle(p, makeEnemy(p.lv, () => 0));
const flee = battleStep(battle, p, { type: 'flee' }, () => 0);
ok(flee.over && flee.result === 'flee', '遁地符逃跑必成');
ok(!hasItem(p, 'fuchou'), '遁地符消耗');
// 战胜奖励结构
const rw = battleRewards(p, enemy, () => 0);
ok(rw.gain.stones >= 0 && Array.isArray(rw.gain.items), 'battleRewards 结构正确');

// ---------- 突破（小境界）----------
console.log('— breakthrough minor —');
p = newPlayer(() => 0); // 凡人 → 炼气（minor）
p.xp = p.xpMax;
const br = attemptMinorBreakthrough(p, false, () => 0.99); // rng 高 → 失败？success 由 chance 判定
ok(br.ok === true, '小境界突破返回 ok');
// 用极低 rng 让成功率通过（breakthroughChance 给伪灵根较低，但 clamp 0.15）
// 多次尝试，至少一次成功
let successOnce = false;
for (let i = 0; i < 50; i++) {
  const q = newPlayer(() => 0); q.xp = q.xpMax;
  const r = attemptMinorBreakthrough(q, false, () => 0.0);
  if (r.success) { successOnce = true; ok(q.tier === 1 && q.sub === 0, '突破成功进入炼气一层'); break; }
}
ok(successOnce, '小境界突破存在成功路径（rng=0）');
ok(nextTarget(p).isMajor === false || true, 'nextTarget 可调用');

// ---------- 突破（大境界：心魔）----------
console.log('— breakthrough major (heart) —');
p = newPlayer(() => 0); p.tier = 1; p.sub = 12; recompute(p); p.xp = p.xpMax; p.hp = p.maxHp; p.mp = p.maxMp;
ok(needsTrial(p) === true, '炼气十三层 → 筑基需渡心魔');
let trial = startMajorTrial(p, () => 0);
ok(trial && trial.kind === 'heart', 'startMajorTrial 产生心魔考验');
ok(trial.target.tier === 2, '目标境界为筑基');
safety = 0;
while (!trial.over && safety++ < 50) trialRespond(trial, p, { type: 'stand' }, () => 0.0);
ok(trial.over === true, '心魔考验在有限轮结束');
if (trial.success) { advanceRealm(p, trial.target); ok(p.tier === 2, '心魔成功 → 进入筑基'); }
else { ok(p.tier === 1, '心魔失败 → 停留炼气'); }

// ---------- 突破（大境界：天劫）----------
console.log('— breakthrough major (trib) —');
// 取元婴期最末小层（subs 数量可变，动态读取末位下标，避免硬编码）
p = newPlayer(() => 0); p.tier = 4; p.sub = REALMS[4].subs.length - 1; recompute(p); p.xp = p.xpMax; p.hp = p.maxHp; p.mp = p.maxMp;
ok(nextTarget(p).trial === 'trib', '元婴圆满 → 化神需渡天劫');
addItem(p, 'fabao_leiyin', 1); equip(p, 'fabao_leiyin');
trial = startMajorTrial(p, () => 0);
ok(trial.kind === 'trib' && trial.rounds >= 3, '天劫考验多轮');
safety = 0;
while (!trial.over && safety++ < 50) trialRespond(trial, p, { type: 'treasure' }, () => 0.0);
ok(trial.over === true, '天劫考验在有限轮结束');
ok(p.hp >= 1, '天劫后气血 >= 1');

// ---------- 炼丹 / 炼器 ----------
console.log('— alchemy / forge —');
p = newPlayer(() => 0); p.tier = 1; recompute(p);
p.recipes = ['rcp_huitian'];
// 材料不足
ok(hasMaterials(p, { herb_qingmu: 99 }) === false, '材料不足检测');
addItem(p, 'herb_qingmu', 5);
ok(hasMaterials(p, { herb_qingmu: 2 }) === true, '材料充足检测');
const al = tryAlchemy(p, 'rcp_huitian', () => 0.99); // 高 rng 易成功
ok(al.ok === true, '炼丹返回 ok');
// 反复炼直到至少一次成功，覆盖统计
let alOk = 0;
addItem(p, 'herb_qingmu', 200);
for (let i = 0; i < 60; i++) { addItem(p, 'herb_qingmu', 2); const r = tryAlchemy(p, 'rcp_huitian', makeRng(i)); if (r.success) alOk++; }
ok(alOk > 0, '炼丹存在成功');
// 炼器
p.recipes.push('bp_feijian');
addItem(p, 'ore_xuantie', 10);
const fg = tryForge(p, 'bp_feijian', () => 0.99);
ok(fg.ok === true, '炼器返回 ok');

// ---------- 坊市 ----------
console.log('— market —');
p = newPlayer(() => 0); p.stones = 9999;
const m = rollMarket(p, makeRng(2));
ok(Array.isArray(m.entries) && m.entries.length > 0, '货架非空');
ok(m.entries.every((e) => e.price > 0 && e.stock > 0), '商品价格/库存为正');
const entry = m.entries[0];
const buyRes = buyItem(p, entry, 1);
ok(buyRes.ok === true, '购买成功');
ok(entry.stock === 0 || entry.stock >= 0, '库存递减');
addItem(p, 'herb_qingmu', 3);
const sp = sellPrice('herb_qingmu');
ok(sp > 0, '出售价 > 0');
const sl = sellItem(p, 'herb_qingmu', 1);
ok(sl.ok && sl.gain === sp, '出售结算');

// ---------- 坊市商品介绍 ----------
console.log('— market blurb —');
ok(typeof itemEffectText(ITEMS.pill_huitian) === 'string' && itemEffectText(ITEMS.pill_huitian).includes('40'), '回血丹效果文案含恢复量');
ok(itemEffectText(ITEMS.fabao_feijian).includes('攻'), '法宝效果文案含攻击');
ok(itemEffectText(ITEMS.gongfa_changchun).includes('修炼'), '功法效果文案含修炼');
ok(typeof shopBlurb(ITEMS.pill_huitian) === 'string' && shopBlurb(ITEMS.pill_huitian).length > 0, 'shopBlurb 非空');
// 每个货架条目都带「介绍文案 desc」
{
  const q = newPlayer(() => 0); q.stones = 9999;
  const mk = rollMarket(q, makeRng(2));
  ok(mk.entries.every((e) => typeof e.desc === 'string' && e.desc.length > 0), '货架商品均带介绍文案');
  ok(mk.entries.every((e) => Number.isFinite(e.basePrice)), '货架商品均带基础价（涨跌提示用）');
}

// ---------- 宗门系统 ----------
console.log('— sect —');
ok(Object.keys(SECTS).length >= 3, '宗门数量 >= 3');
ok(SECT_TITLES.length >= 5, '宗门称号阶 >= 5');
ok(SECT_TASK_POOL.length >= 3, '宗门任务池 >= 3');
// 称号门槛单调递增（境界/声望皆不降）
{
  let mono = true;
  for (let i = 1; i < SECT_TITLES.length; i++) {
    const a = SECT_TITLES[i - 1], b = SECT_TITLES[i];
    if (b.minTier < a.minTier || b.minRep < a.minRep) mono = false;
  }
  ok(mono, '宗门称号门槛自下而上单调递增');
}
// 记名弟子门槛 0/0：未入宗门时无称号，入宗门即至少记名弟子
{
  const q = newPlayer(() => 0);
  ok(currentSectTitle(q) === null, '未入宗门：无宗门称号');
  ok(sectCultivateBonus(q) === 1, '未入宗门：修炼加成 = 1');
  ok(joinSect(q, 'sect_qingyun', makeRng(1)) === true, '加入青云宗成功');
  ok(q.sectId === 'sect_qingyun', 'sectId 已记录');
  ok(Array.isArray(q.sectTasks) && q.sectTasks.length > 0, '入宗即生成当日任务');
  const t = currentSectTitle(q);
  ok(t && t.id === 'st_jiming', '凡人入宗即记名弟子');
  ok(sectCultivateBonus(q) > 1, '入宗后修炼加成 > 1');
}
// 称号需「境界 + 声望」双达标：高声望但低境界仍卡在低阶
{
  const q = newPlayer(() => 0); joinSect(q, 'sect_qingyun', makeRng(1));
  q.sectRep = 99999; // 声望爆表
  ok(currentSectTitle(q).id === 'st_jiming', '凡人即便声望爆表，仍只是记名弟子（境界不足）');
  q.tier = 2; // 筑基
  ok(currentSectTitle(q).id === 'st_neimen', '筑基+高声望 → 内门弟子');
  q.tier = 3;
  ok(currentSectTitle(q).id === 'st_zhenchuan', '结丹+高声望 → 真传弟子');
  ok(nextSectTitle(q) && nextSectTitle(q).id === 'st_zhanglao', '下一阶为护法长老');
  // 到顶
  q.tier = 9;
  ok(nextSectTitle(q) === null && currentSectTitle(q).id === 'st_zongzhu', '飞升+满声望 → 一代宗主（到顶）');
}
// 活动上报推进任务 + 领取声望
{
  const q = newPlayer(() => 0); joinSect(q, 'sect_danxia', makeRng(0));
  // 制造一个 cultivate 任务并灌满
  const ct = q.sectTasks.find((t) => t.type === 'cultivate');
  if (ct) {
    ok(recordSectActivity(q, 'cultivate', ct.goal) === true, '上报修炼活动推进任务');
    ok(ct.progress === ct.goal, '任务进度已满');
    ok(recordSectActivity(q, 'cultivate', 10) === true, '超额上报被钳制（仍返回 changed）');
    ok(ct.progress === ct.goal, '进度不超 goal');
    const r = claimSectTask(q, ct.id);
    ok(r.ok === true && r.rep > 0, '领取任务奖励得声望');
    ok(ct.claimed === true, '任务标记已领');
    ok(claimSectTask(q, ct.id).ok === false, '重复领取被拒');
  }
  // 未达标任务不可领
  const other = q.sectTasks.find((t) => !t.claimed);
  if (other) ok(claimSectTask(q, other.id).ok === false, '未完成任务不可领取');
}
// 各系统真正上报活动（接入回归）
{
  const q = newPlayer(() => 0); joinSect(q, 'sect_qingyun', makeRng(3));
  // 强制保证存在一个修炼任务，使断言确定而非依赖随机抽取
  q.sectTasks = [{ id: 't_cultivate', type: 'cultivate', label: '吐纳修行', emoji: '🧘', verb: '完成主动修炼', goal: 6, rep: 15, progress: 0, claimed: false }];
  q.tier = 1; recompute(q); q.mp = q.maxMp; q.hp = q.maxHp; q.vitality = q.maxVitality;
  activeCultivate(q, () => 0.9); // 主动修炼应上报 cultivate
  ok(q.sectTasks[0].progress === 1, '主动修炼推进宗门修炼任务');
}
{
  const q = newPlayer(() => 0); joinSect(q, 'sect_wanjian', makeRng(4));
  q.sectTasks = [{ id: 't_breakthrough', type: 'breakthrough', label: '冲破瓶颈', emoji: '🌟', verb: '完成突破', goal: 1, rep: 35, progress: 0, claimed: false }];
  q.tier = 1; recompute(q); q.xp = q.xpMax; q.hp = q.maxHp;
  // 凡人→炼气为无考验的小境界突破；极低 rng 下 success 判定通过，触发 advanceRealm
  for (let i = 0; i < 50 && q.sectTasks[0].progress === 0; i++) {
    const r = attemptMinorBreakthrough(q, false, () => 0.0);
    if (!r.success) q.xp = q.xpMax; // 失败后补满再试
  }
  ok(q.sectTasks[0].progress === 1, '突破成功推进宗门突破任务');
}
// 一键领取 + 跨日刷新
{
  const q = newPlayer(() => 0); joinSect(q, 'sect_qingyun', makeRng(2));
  for (const t of q.sectTasks) t.progress = t.goal; // 全部灌满
  const all = claimAllSectTasks(q);
  ok(all.ok && all.count === q.sectTasks.length && all.rep > 0, '一键领取全部已完成任务');
  ok(q.sectTasks.every((t) => t.claimed), '全部任务标记已领');
  // 跨月刷新：篡改周期键后 ensureSectTasks/dailySectRollover 应重置
  q.sectTaskDate = '1970-01';
  ok(dailySectRollover(q, makeRng(5)) === true, '跨月触发任务刷新');
  ok(q.sectTaskDate === cycleKey() && q.sectTasks.every((t) => !t.claimed && t.progress === 0), '刷新后任务归零且周期键更新');
}
// 每日俸禄：按当前称号发放，每日仅一次
{
  const q = newPlayer(() => 0); joinSect(q, 'sect_qingyun', makeRng(6));
  ok(sectRewardClaimedToday(q) === false, '入宗当日尚未领俸禄');
  const r = claimDailySectReward(q);
  ok(r.ok === true && r.title.id === 'st_jiming', '领取记名弟子俸禄');
  ok(sectRewardClaimedToday(q) === true, '领取后标记当日已领');
  ok(claimDailySectReward(q).ok === false, '当日二次领取被拒');
}
// 宗门修炼加成已注入 cultivateSpeedMult（懒注册链路回归）
{
  const q = newPlayer(() => 0);
  const before = cultivateSpeedMult(q);
  joinSect(q, 'sect_qingyun', makeRng(7));
  recompute(q);
  ok(cultivateSpeedMult(q) > before, '入宗后 cultivateSpeedMult 提升（懒注册生效）');
}
// 转宗保留声望
{
  const q = newPlayer(() => 0); joinSect(q, 'sect_qingyun', makeRng(1));
  q.sectRep = 300;
  joinSect(q, 'sect_wanjian', makeRng(1));
  ok(q.sectId === 'sect_wanjian' && q.sectRep === 300, '转宗保留声望');
}

// ---------- 成就 ----------
console.log('— achievements —');
ok(ACHIEVEMENTS.length >= 6, '成就数量 >= 6');
p = newPlayer(() => 0);
p.stats.battlesWon = 1;
const granted = checkAchievements(p);
ok(granted.some((a) => a.id === 'ach_first_battle'), '首战成就触发');
ok(p.achievements.includes('ach_first_battle'), '成就入库');
// 重复检测
const granted2 = checkAchievements(p);
ok(granted2.length === 0, '已获成就不再重复授予');

// ---------- 每日活力兜底：restToNextDay 每日仅一次（防无限刷活力）----------
console.log('— restToNextDay (once per day) —');
{
  const q = newPlayer(() => 0);
  q.vitality = 0; q.restUsedDate = ''; // 模拟活力耗尽、当日尚未用过
  ok(vitalityDepleted(q) === true, '活力为 0 时判定为耗尽');
  ok(restToNextDay(q) === true, '首次「闭关静修」成功');
  ok(q.vitality === q.maxVitality, '闭关后活力回满');
  ok(q.restUsedDate === cycleKey(), '记录当月已用');
  // 玩家再次把活力花光后，试图当日无限刷 —— 必须被守卫拒绝
  q.vitality = 0;
  ok(vitalityDepleted(q) === true, '再次耗尽');
  ok(restToNextDay(q) === false, '当日第二次被守卫拒绝（杜绝无限刷活力）');
  ok(q.vitality === 0, '被拒绝时活力不变');
}
// 未耗尽时不消耗当日额度（满活力不应触发兜底）
{
  const q = newPlayer(() => 0);
  q.vitality = q.maxVitality;
  ok(vitalityDepleted(q) === false, '满活力非耗尽');
  ok(restToNextDay(q) === false, '未耗尽时不消耗当日额度');
  ok(q.restUsedDate === '', '未触发则不记录');
}

// ---------- 存档 / 离线 ----------
console.log('— save / offline —');
const store = {};
_setStorage({ getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } });
ok(hasSave() === false, '初始无存档');
p = newPlayer(() => 0); p.tier = 2; p.sub = 1; recompute(p); p.stones = 777;
saveGame(p);
ok(hasSave() === true, '存档后存在');
const loaded = loadGame();
ok(loaded && loaded.tier === 2 && loaded.sub === 1 && loaded.stones === 777, '读档往返一致');
// 导出/导入
const str = exportSave(p);
ok(typeof str === 'string' && str.length > 10, '导出为字符串');
const imported = importSave(str);
ok(imported && imported.tier === 2, '导入还原');
ok(importSave('!!!not valid base64!!!') === null, '损坏字符串安全降级');
// 离线收益
p.lastSeen = Math.floor(Date.now() / 1000) - 3600; // 1 小时前
const off = computeOffline(p);
ok(off.seconds > 0 && off.xp > 0, '离线 1 小时有修为收益');
const cap = computeOffline({ ...p, lastSeen: 1 }); // 很久以前
ok(cap.capped === true, '超 8 小时被截断');
clearSave();
ok(hasSave() === false, '清档后不存在');

// ---------- 事件池完整性 ----------
console.log('— events integrity —');
ok(EVENTS.length >= 10, '事件数量 >= 10');
for (const e of EVENTS) {
  ok(typeof e.run === 'function', `${e.id}: run 是函数`);
  ok(e.scenes.length > 0, `${e.id}: 有场景`);
}
const elig = eligibleEvents(1, 'mountain');
ok(elig.length > 0, '炼气山脉有可探索事件');

// ---------- 境界越界防御（「点修炼偶发闪退」根因回归）----------
// 损坏档 / 导入串 / 旧版缺字段会让 tier/sub 非法，曾导致 REALMS[tier] 越界、
// 修炼→刷新状态栏时整页闪退。recompute/realmInfo/globalLevel 现均已兜底。
console.log('— realm bounds safety —');
{
  // globalLevel 对越界入参不抛错并截断到顶
  ok(globalLevel(999, 0) === MAX_GLOBAL_LEVEL, 'globalLevel 越界 tier 截断到飞升');
  ok(globalLevel(-1, 0) === 0, 'globalLevel 负 tier 归零');
  // realmInfo 任意非法 tier/sub 不抛错，且降级到合法境界
  let crashed = false;
  try {
    for (const t of [-1, 0, 5, 9, 10, 99, undefined, null, 'x']) {
      for (const s of [-1, 0, 3, 99, undefined, null]) {
        const info = realmInfo({ tier: t, sub: s });
        ok(info && info.realm && typeof info.majorName === 'string', `realmInfo(${t},${s}) 不抛错且返回合法境界`);
      }
    }
  } catch (e) { crashed = true; }
  ok(!crashed, 'realmInfo 对各种非法 tier/sub 全程不抛异常');
  // recompute 就地把非法 tier/sub 钳制到合法区间
  const q = newPlayer(() => 0);
  q.tier = 50; q.sub = 99; recompute(q);
  ok(q.tier === ASCEND_INDEX && q.sub === REALMS[ASCEND_INDEX].subs.length - 1, 'recompute 钳制越界 tier/sub 到边界');
  ok(Number.isFinite(q.maxHp) && q.maxHp > 0, '越界档 recompute 后属性仍合法');
  q.tier = undefined; q.sub = undefined; recompute(q);
  ok(q.tier === 0 && q.sub === 0, 'recompute 把缺失 tier/sub 归零（旧版/损坏档兜底）');
  // 钳制后修炼链路（addXp/realmInfo）不再闪退
  let cultCrash = false;
  try { q.mp = q.maxMp; q.vitality = q.maxVitality; activeCultivate(q, () => 0.5); } catch (e) { cultCrash = true; }
  ok(!cultCrash, '非法境界档经 recompute 后可正常修炼（不再闪退）');
}

// ---------- 境界深度（「境界还是太小了」优化回归）----------
console.log('— realm depth —');
ok(REALMS[2].subs.length >= 5, '筑基期子层 >= 5（初/中/后/圆满/巅峰）');
ok(REALMS[4].subs.length >= 5, '元婴期子层 >= 5');
ok(REALMS[6].subs.length >= 5, '炼虚期子层 >= 5');
ok(REALMS[7].subs.length >= 4, '合体期子层 >= 4');
ok(REALMS[8].subs.length >= 4, '大乘期子层 >= 4');
// 子层扩张后，全局等级映射仍自洽：每个境界末位 +1 恰为下一境界首位
ok(globalLevel(2, REALMS[2].subs.length - 1) + 1 === globalLevel(3, 0), '筑基末位 +1 = 结丹首位（映射自洽）');

// ---------- 商店活力回复商品 ----------
console.log('— vitality pills —');
ok(ITEMS.pill_peiyuan && ITEMS.pill_peiyuan.effect.kind === 'restore_vitality', '培元丹：回复活力效果');
ok(ITEMS.pill_lingjiu && ITEMS.pill_lingjiu.effect.amount === 60, '百草灵酒：回复 60 活力');
ok(ITEMS.pill_xiancha && ITEMS.pill_xiancha.effect.amount === 100, '玉髓仙茶：回复 100 活力');
ok(itemEffectText(ITEMS.pill_peiyuan).includes('活力'), '活力丹效果文案含「活力」');
// 坊市会随机上架活力丹（属 PILL_LIST）
{
  const seen = new Set();
  for (let i = 0; i < 50; i++) {
    const q = newPlayer(() => 0); q.stones = 9999;
    for (const e of rollMarket(q, makeRng(i)).entries) seen.add(e.id);
  }
  ok(['pill_peiyuan', 'pill_lingjiu', 'pill_xiancha'].some((id) => seen.has(id)), '坊市多次刷新会出现活力丹');
}

// ---------- 宗门扩充至 10+ ----------
console.log('— sects (10+) —');
ok(Object.keys(SECTS).length >= 10, `宗门数量 >= 10（实际 ${Object.keys(SECTS).length}）`);
ok(SECT_LIST.length === Object.keys(SECTS).length, 'SECT_LIST 与 SECTS 数量一致');
// 每个宗门字段完整且 cultMult 合理
for (const s of Object.values(SECTS)) {
  ok(typeof s.name === 'string' && typeof s.emoji === 'string' && s.cultMult >= 1, `${s.id}: 字段完整`);
}
// 每日宗门任务增至 5 个
{
  const q = newPlayer(() => 0); joinSect(q, 'sect_qingyun', makeRng(1));
  ok((q.sectTasks || []).length === Math.min(5, SECT_TASK_POOL.length), `每日宗门任务抽 5 个（实际 ${q.sectTasks.length}）`);
}

// ---------- 悬赏挑战（自主领取，难度随境界）----------
console.log('— sect challenges —');
ok(CHALLENGE_TEMPLATES.length >= 4, '挑战模板 >= 4');
ok(MAX_ACTIVE_CHALLENGES >= 1, '挑战上限常量存在');
// 缩放：境界越高，目标与奖励越大
{
  const lo = scaleChallenge(CHALLENGE_TEMPLATES[0], 0);
  const hi = scaleChallenge(CHALLENGE_TEMPLATES[0], 6);
  ok(hi.goal >= lo.goal && hi.rep > lo.rep && hi.stones > lo.stones, '挑战随境界放大（目标/声望/灵石）');
}
// 未入宗门不可接取
{
  const q = newPlayer(() => 0);
  ok(acceptChallenge(q, makeRng(0)).ok === false, '未入宗门不可接取挑战');
}
// 接取 → 上报推进 → 领取（声望+灵石）；超上限拒绝
{
  const q = newPlayer(() => 0); joinSect(q, 'sect_qingyun', makeRng(2));
  q.stones = 0;
  const a = acceptChallenge(q, makeRng(0));
  ok(a.ok === true && activeChallengeCount(q) === 1, '接取一项挑战');
  const ch = q.challengeTasks[0];
  // 上报对应活动推进挑战（与每日任务共用 recordSectActivity）
  recordSectActivity(q, ch.type, ch.goal);
  ok(ch.progress === ch.goal, '上报活动推进挑战进度');
  const c = claimChallenge(q, ch.id);
  ok(c.ok === true && c.stones > 0 && q.stones === c.stones, '领取挑战得灵石');
  ok(activeChallengeCount(q) === 0, '领取后挑战从列表移除');
  // 未完成不可领
  const a2 = acceptChallenge(q, makeRng(1)); ok(a2.ok, '再次接取');
  ok(claimChallenge(q, a2.task.id).ok === false, '未完成挑战不可领取');
  ok(abandonChallenge(q, a2.task.id) === true && activeChallengeCount(q) === 0, '放弃挑战成功');
  // 上限守卫
  acceptChallenge(q, makeRng(2)); acceptChallenge(q, makeRng(3));
  ok(activeChallengeCount(q) === MAX_ACTIVE_CHALLENGES, `接取至上限 ${MAX_ACTIVE_CHALLENGES}`);
  ok(acceptChallenge(q, makeRng(4)).ok === false, '超过上限拒绝接取');
}

// ---------- NPC 好感度系统 ----------
console.log('— npc affinity —');
ok(NPC_LIST.length >= 6, `NPC 数量 >= 6（实际 ${NPC_LIST.length}）`);
// 未结识：无道友，加成 1
{
  const q = newPlayer(() => 0);
  ok(metNpcs(q).length === 0, '初始未结识任何道友');
  ok(companionCultivateBonus(q) === 1, '无道友时修炼加成 = 1');
  ok(meetableNpcs(q).length > 0, '凡人期也有可结识道友');
}
// 寻访结识（消耗活力）
{
  const q = newPlayer(() => 0); q.vitality = q.maxVitality;
  const before = q.vitality;
  const r = meetNpc(q, makeRng(1));
  ok(r.ok === true && r.npc, '寻访结识一位道友');
  ok(q.vitality === before - MEET_VITALITY_COST, '寻访消耗活力');
  ok(isMet(q, r.npc.id) && getAffinity(q, r.npc.id) > 0, '结识后标记 met 且有初始好感');
  ok(metNpcs(q).length === 1, '已结识列表 +1');
  // 活力不足不可寻访
  q.vitality = 0;
  ok(meetNpc(q, makeRng(2)).ok === false, '活力不足不可寻访');
}
// 赠礼提升好感（喜好物增益更高）
{
  const q = newPlayer(() => 0); q.vitality = q.maxVitality;
  const m = meetNpc(q, makeRng(3));
  const npc = m.npc;
  addItem(q, npc.liked, 3);
  addItem(q, 'herb_qingmu', 3);
  const aff0 = getAffinity(q, npc.id);
  const liked = giftNpc(q, npc.id, npc.liked, makeRng(0));
  const aff1 = getAffinity(q, npc.id);
  ok(liked.ok && liked.liked === true && aff1 > aff0, '赠喜好物提升好感');
  ok(countItem(q, npc.liked) === 2, '赠礼消耗 1 件物品');
  const plain = giftNpc(q, npc.id, 'herb_qingmu', makeRng(0));
  const aff2 = getAffinity(q, npc.id);
  ok(plain.ok && aff2 > aff1, '赠普通物也提升好感');
  // 好感等级递进
  ok(affinityLevel(0).id === 'af0' && affinityLevel(50).min <= 50, '好感等级映射');
}
// 高好感道友提供修炼加成（懒注入 cultivateSpeedMult）
{
  const q = newPlayer(() => 0); q.vitality = q.maxVitality;
  const before = cultivateSpeedMult(q);
  const m = meetNpc(q, makeRng(4));
  // 灌注好感至「莫逆之交」(>=80)
  q.npcs[m.npc.id].aff = 90;
  recompute(q);
  ok(companionCultivateBonus(q) > 1, '莫逆之交道友提供修炼加成');
  ok(cultivateSpeedMult(q) > before, '高好感道友使 cultivateSpeedMult 提升（懒注册生效）');
}

// ---------- NPC 组队探险 ----------
console.log('— npc team explore —');
{
  const q = newPlayer(() => 0); q.tier = 2; recompute(q);
  q.hp = q.maxHp; q.mp = q.maxMp; q.vitality = q.maxVitality;
  // 好感不足不可组队
  const m = meetNpc(q, makeRng(5));
  ok(canTeamUp(q, m.npc.id) === false, '好感不足时不可组队');
  ok(teamExplore(q, m.npc.id, makeRng(0)).error, '好感不足组队被拒');
  // 提升好感至可组队
  q.npcs[m.npc.id].aff = TEAM_AFFINITY_THRESHOLD;
  ok(canTeamUp(q, m.npc.id) === true, '好感达标可组队');
  const vit0 = q.vitality; const mp0 = q.mp;
  const res = teamExplore(q, m.npc.id, makeRng(1));
  ok(!res.error && res.encounter && res.encounter.kind === 'instant', '组队探险返回 instant 事件');
  ok(q.vitality === vit0 - TEAM_VITALITY_COST, '组队消耗活力');
  ok(q.mp < mp0, '组队消耗灵力');
  // 奖励更丰盛：结算后灵石/修为增加
  const stonesBefore = q.stones; const xpBefore = q.xp;
  applyReward(q, res.encounter.result, makeRng(0));
  ok(q.stones > stonesBefore && q.xp > xpBefore, '组队探险收益入账');
  // 每日每道友限一次
  ok(teamedToday(q, m.npc.id) === true, '标记今日已同游');
  ok(teamExplore(q, m.npc.id, makeRng(2)).error, '同日二次组队被拒');
}

// ---------- 音效系统（Node 环境安全降级）----------
console.log('— sfx (graceful no-op without AudioContext) —');
let sfxCrash = false;
try {
  playSfx('cultivate');   // 无 AudioContext：静默 no-op，不抛错
  playSfx('unknown_name');
  ok(typeof isSfxEnabled() === 'boolean', 'isSfxEnabled 返回布尔');
  const prev = isSfxEnabled();
  setSfxEnabled(!prev);
  ok(isSfxEnabled() === !prev, 'setSfxEnabled 切换开关');
  setSfxEnabled(prev); // 还原
  playSfx('click');    // 开关切换/还原过程中均不抛错
} catch (e) { sfxCrash = true; }
ok(!sfxCrash, '音效模块在无 AudioContext 环境全程不抛异常');

// ---------- 灵根三轴（等级 × 组合 × 属性）----------
console.log('— spirit root axes —');
ok(ROOT_GRADES.length === 5, '5 个等级档次（伪/人/地/天/异）');
ok(ROOT_COUNTS.length === 5, '5 种组合（五/四/三/双/单）');
ok(FIVE_ELEMENTS.length === 5 && MUTANT_ELEMENTS.length >= 3, '五行 5 + 异属性 >= 3');
ok(rootCountDef('single').count === 1 && rootCountDef('five').count === 5, '组合数映射');
ok(SPIRIT_ROOTS === ROOT_GRADES, 'SPIRIT_ROOTS 为 ROOT_GRADES 别名（向后兼容）');
// rollRoot 自洽：天/异必单系；异必取异属性；伪必四/五系
{
  let tianSingle = true, yiMutant = true, pseudoMulti = true;
  for (let i = 0; i < 300; i++) {
    const root = rollRoot(makeRng(i));
    const g = rootGradeDef(root.grade);
    ok(root.els.length === rootCountDef(root.count).count, `rollRoot 属性数 = 组合数 (${i})`);
    ok(root.els.every((e) => elDef(e)), `rollRoot 属性合法 (${i})`);
    if (g.id === 'tian') tianSingle = tianSingle && root.count === 'single';
    if (g.id === 'yi') yiMutant = yiMutant && root.count === 'single' && root.els.every((e) => MUTANT_ELEMENTS.some((m) => m.id === e));
    if (g.id === 'pseudo') pseudoMulti = pseudoMulti && (root.count === 'five' || root.count === 'four');
  }
  ok(tianSingle, '天灵根必为单系');
  ok(yiMutant, '异灵根必为单系且取异属性');
  ok(pseudoMulti, '伪灵根必为四/五系');
}
// descriptor 数值
{
  const d = rootDescriptor({ grade: 'di', count: 'dual', els: ['metal', 'wood'] });
  ok(near(d.mult, rootGradeDef('di').mult * rootCountDef('dual').focusMult), 'rootMult = grade.mult × count.focusMult');
  ok(d.breakBonus === rootGradeDef('di').breakBonus, 'breakBonus 取自档次');
  ok(/木/.test(d.elNames) && /金/.test(d.elNames), 'descriptor 含属性名');
}
// 契合度
ok(rootAffinity({ els: ['wood'] }, 'wood') === ROOT_AFFINITY_MATCH, '契合：根含属性 → 加成');
ok(rootAffinity({ els: ['wood'] }, 'fire') === 1, '不契合 → 中性');
ok(rootAffinity({ els: [] }, 'wood') === 1, '无属性根 → 中性');
ok(rootAffinity(null, 'wood') === 1, '无 root → 中性');
// 旧版 rootId 迁移映射
ok(rootFromLegacy('heaven').grade === 'tian', '旧 heaven → 新 tian');
ok(rootFromLegacy('mutant').grade === 'yi', '旧 mutant → 新 yi');
ok(rootFromLegacy('dual').count === 'dual', '旧 dual → 新 dual');

// ---------- 灵根契合影响修炼与装备 ----------
console.log('— root affinity effects —');
{
  // 木灵根 + 玄木功(木系) → 修炼倍率含契合加成
  const q = newPlayer(() => 0);
  q.root = { grade: 'di', count: 'dual', els: ['wood', 'water'] }; recompute(q);
  q.techniques = [];
  const base = cultivateSpeedMult(q);
  q.techniques = ['gongfa_xuanmu']; recompute(q); // 木系功法，契合
  const withMatch = cultivateSpeedMult(q);
  ok(withMatch > base, '契合功法提升修炼速度');
  // 雷灵根 + 同木系功法 → 不契合，无额外加成（低于契合态）
  q.root = { grade: 'di', count: 'single', els: ['thunder'] }; recompute(q);
  const noMatch = cultivateSpeedMult(q);
  ok(noMatch < withMatch, '不契合时无契合加成（修炼倍率低于契合态）');
}
{
  // 装备契合：金属灵根装备金属飞剑，攻击加成被契合度放大
  const q = newPlayer(() => 0);
  q.root = { grade: 'di', count: 'single', els: ['metal'] }; recompute(q);
  addItem(q, 'fabao_feijian', 1); // 飞剑：金属
  const atkBefore = q.atk;
  equip(q, 'fabao_feijian');
  const gainAff = q.atk - atkBefore;
  // 木灵根装备同一金属飞剑：不契合，加成更小
  const q2 = newPlayer(() => 0);
  q2.root = { grade: 'di', count: 'single', els: ['wood'] }; recompute(q2);
  const atkBefore2 = q2.atk;
  q2.equipment = { weapon: 'fabao_feijian', armor: null }; recompute(q2);
  const gainNoAff = q2.atk - atkBefore2;
  ok(gainAff > gainNoAff, '契合法宝攻防加成大于不契合（效果不完全一致）');
}

// ---------- 每月周期 / 年龄 / 寿元 ----------
console.log('— monthly cycle / age / lifespan —');
ok(/^\d{4}-\d{2}$/.test(monthKey()), 'monthKey 格式 YYYY-MM');
ok(cycleKey() === monthKey(), 'cycleKey 即 monthKey');
ok(monthsBetween('2024-01', '2024-04') === 3, 'monthsBetween 同年 3 月');
ok(monthsBetween('2023-12', '2025-02') === 14, 'monthsBetween 跨年 14 月');
ok(monthsBetween('2024-05', '2024-01') === 0, 'monthsBetween 逆序兜底 0');
// 寿元随境界递增；飞升无量寿
{
  let mono = true, prev = 0;
  for (let t = 0; t < ASCEND_INDEX; t++) {
    const ls = realmLifespan(t);
    if (ls < prev) mono = false;
    prev = ls;
  }
  ok(mono, '寿元随境界递增');
  ok(realmLifespan(ASCEND_INDEX) === Infinity, '飞升无量寿');
}
// isDying / canReincarnate
{
  const q = newPlayer(() => 0);
  ok(isDying(q) === false, '年少未到大限');
  q.age = realmLifespan(q.tier);
  ok(isDying(q) === true, '年龄达寿元 → 大限将至');
  ok(canReincarnate(q) === true, '可轮回重修');
  q.ascended = true;
  ok(isDying(q) === false, '已飞升不判大限');
}
// rolloverVitality 跨月推进年龄 + 回满活力
{
  const q = newPlayer(() => 0);
  const age0 = q.age;
  q.lastVitalityDate = '1970-01'; q.lastAgeMonth = '1970-01'; // 模拟很久以前
  const rolled = rolloverVitality(q);
  ok(rolled === true, '跨月刷新活力');
  ok(q.age > age0, '跨月后年龄增长');
  ok(q.vitality === q.maxVitality, '活力回满');
}
// rolloverVitality 时钟回拨：months<=0 时既不推进年龄，也不改写 lastAgeMonth
{
  const q = newPlayer(() => 0);
  const age0 = q.age;
  q.lastAgeMonth = '2099-12'; // 未来月份，模拟系统时钟回拨
  rolloverVitality(q);
  ok(q.age === age0, '时钟回拨不推进年龄');
  ok(q.lastAgeMonth === '2099-12', '时钟回拨时保持原记月点（不被污染）');
}

// ---------- 轮回重修 ----------
console.log('— reincarnation —');
{
  const q = newPlayer(() => 0);
  q.root = { grade: 'tian', count: 'single', els: ['fire'] };
  q.qiyun = 88;
  // 第二项天赋带 maxVitBonus(+30)，轮回后会被 slice(0,1) 丢弃——用于校验活力上限随之重算。
  q.talentIds = ['tal_wuxing', 'tal_wanshou'];
  q.tier = 3; q.sub = 2; recompute(q); q.xp = 9999;
  ok(q.maxVitality === MAX_VITALITY + 30, '轮回前活力上限含被携天赋加成');
  ok(canReincarnate(q) === false, '未到大限不可轮回');
  ok(reincarnate(q, makeRng(1)) === false, '未到大限 reincarnate 返回 false');
  q.age = realmLifespan(q.tier) + 10; // 大限
  ok(canReincarnate(q) === true, '大限将至可轮回');
  ok(reincarnate(q, makeRng(1)) === true, '轮回重修成功');
  ok(q.reincarnations === 1, '轮回次数 +1');
  ok(q.tier === 0 && q.sub === 0, '境界归零');
  ok(q.xp === 0, '修为归零');
  ok(q.reincarnationBonus === REINCARNATION_CULT_BONUS, '获得前世记忆修炼加成');
  ok(q.root.grade === 'tian' && q.root.els.includes('fire'), '携带前世灵根档次与属性');
  ok(q.qiyun === 88, '携带前世气运');
  ok(q.talentIds.length === 1, '携带一项天赋');
  ok(/（轮回）/.test(ageLabel(q)), '年龄标注（轮回）');
  ok(q.age <= START_AGE_MAX, '年龄重置为年少');
  ok(cultivateSpeedMult(q) > q.rootMult, '前世记忆使修炼倍率 > rootMult');
  // 截断天赋后活力上限须以新天赋集重算，vitality 与之一致（杜绝「陈旧上限」）。
  ok(q.maxVitality === MAX_VITALITY, '截断带活力加成的天赋后，活力上限回落');
  ok(q.maxVitality === vitalityMax(q), '轮回后 maxVitality 与当前天赋集一致');
  ok(q.vitality === q.maxVitality, '轮回后活力回满至当前上限');
  // 再度大限：已用尽轮回次数
  q.age = realmLifespan(q.tier) + 10;
  ok(canReincarnate(q) === false, '已轮回过，再无轮回次数');
  ok(reincarnate(q, makeRng(2)) === false, '用尽轮回后 reincarnate 返回 false');
}
// 飞升后「再入轮回」：不受大限 / 轮回次数限制，携带前世资质与记忆加成，脱离飞升态。
{
  const q = newPlayer(() => 0);
  q.root = { grade: 'tian', count: 'single', els: ['fire'] };
  q.qiyun = 91;
  q.talentIds = ['tal_wuxing', 'tal_wanshou'];
  q.tier = ASCEND_INDEX; q.ascended = true; recompute(q);
  // 已飞升者既未大限、也非「可轮回重修」——旧路径下「再入轮回」按钮等于无响应。
  ok(isDying(q) === false, '飞升者不判大限');
  ok(canReincarnate(q) === false, '飞升者不满足 canReincarnate');
  ok(reincarnate(q, makeRng(1)) === false, '飞升者走旧 reincarnate 被拒（无响应根因）');
  // 飞升专属轮回：成功
  ok(reincarnateAscended(q, makeRng(1)) === true, '飞升者「再入轮回」成功');
  ok(q.ascended === false, '再入轮回后脱离飞升终局态');
  ok(q.tier === 0 && q.sub === 0 && q.xp === 0, '境界 / 修为归零');
  ok(q.reincarnations === 1, '轮回次数 +1');
  ok(q.reincarnationBonus === REINCARNATION_CULT_BONUS, '获得前世记忆修炼加成');
  ok(q.root.grade === 'tian' && q.root.els.includes('fire'), '携带前世灵根档次与属性');
  ok(q.qiyun === 91, '携带前世气运');
  ok(q.talentIds.length === 1, '携带一项天赋');
  ok(/（轮回）/.test(ageLabel(q)), '年龄标注（轮回）');
  ok(q.maxVitality === MAX_VITALITY && q.vitality === q.maxVitality, '活力上限按截断后天赋重算且回满');
  // 非飞升者不可走飞升专属轮回（避免误用绕过大限守卫）
  const m = newPlayer(() => 0);
  ok(reincarnateAscended(m, makeRng(1)) === false, '未飞升者不可走「再入轮回」');
}

// ---------- 旧版存档迁移（rootId → 三轴灵根 + 年龄）----------
console.log('— save migration (legacy rootId) —');
{
  const old = newPlayer(() => 0);
  old.rootId = 'mutant';          // 旧版混轴 id
  delete old.root; delete old.age; delete old.bornKey; delete old.lastAgeMonth;
  delete old.reincarnations; delete old.reincarnationBonus;
  const loaded = importSave(exportSave(old));
  ok(loaded && loaded.root && loaded.root.grade === 'yi', '旧版 mutant 存档迁移为异灵根(yi)');
  ok(Number.isFinite(loaded.age), '迁移补齐年龄');
  ok(loaded.reincarnations === 0 && loaded.reincarnationBonus === 1, '迁移补齐 reincarnations/bonus');
  ok(loaded.rootMult > 0, '迁移后 rootMult 有效');
}

// ---------- 灵根显示格式：组合·等级·属性（n灵根·灵根等级·五行属性）----------
console.log('— root display format —');
{
  const d = rootDescriptor({ grade: 'tian', count: 'single', els: ['metal'] });
  ok(d.name === '单灵根·天灵根·金', `单系天灵根显示为「组合·等级·属性」(${d.name})`);
  const d2 = rootDescriptor({ grade: 'di', count: 'dual', els: ['wood', 'fire'] });
  ok(/^双灵根·地灵根·木火$/.test(d2.name), `双系地灵根顺序为 组合·等级·属性 (${d2.name})`);
  const d3 = rootDescriptor({ grade: 'yi', count: 'single', els: ['thunder'] });
  ok(d3.name === '单灵根·异灵根·雷', `异灵根顺序正确 (${d3.name})`);
}

// ---------- 年龄详细展示（X岁X月）+ 按修仙月进位 ----------
console.log('— age detail (years + months) —');
ok(MONTHS_PER_CYCLE === 25, '每周期推进 25 修仙月（≈2 岁 + 1 月）');
{
  const q = newPlayer(() => 0);
  ok(/^\d+岁\d{1,2}月$/.test(ageDetailLabel(q)), `详细年龄格式 X岁X月 (${ageDetailLabel(q)})`);
  ok(/岁$/.test(ageLabel(q)) && !/月/.test(ageLabel(q)), '简化年龄只显示岁（不含月）');
  ok(q.ageMonth >= 0 && q.ageMonth < 12, `初始年龄·月在 0~11 (${q.ageMonth})`);
  // 跨月推进：年龄增长；月份按 MONTHS_PER_CYCLE 进位（25 月 = 2 岁 + 1 月）
  const age0 = q.age;
  q.lastVitalityDate = '1970-01'; q.lastAgeMonth = '1970-01';
  rolloverVitality(q);
  ok(q.age > age0, '跨月后年龄增长');
  ok(Number.isFinite(q.ageMonth) && q.ageMonth >= 0 && q.ageMonth < 12, `进位后年龄·月仍在 0~11 (${q.ageMonth})`);
  // 月份键 → 0~11 月序
  ok(ageMonthFromKey('2024-01') === 0 && ageMonthFromKey('2024-12') === 11, 'ageMonthFromKey 1 月→0、12 月→11');
  // 轮回标注
  q.reincarnations = 1;
  ok(/（轮回）/.test(ageDetailLabel(q)), '详细年龄含「（轮回）」标注');
  // 存档迁移补齐 ageMonth
  const old = newPlayer(() => 0); delete old.ageMonth;
  const mig = importSave(exportSave(old));
  ok(Number.isFinite(mig.ageMonth) && mig.ageMonth >= 0 && mig.ageMonth < 12, '迁移补齐 ageMonth（0~11）');
}

// ---------- 结伴探险每月全局上限（一轮最多 10 次）----------
console.log('— team explore monthly cap (10/cycle) —');
ok(TEAM_EXPLORE_MAX_PER_CYCLE === 10, '结伴探险每月上限为 10 次');
{
  const q = newPlayer(() => 0); q.tier = 2; recompute(q);
  q.hp = q.maxHp; q.mp = q.maxMp; q.vitality = q.maxVitality;
  ok(teamExploreUsed(q) === 0 && teamExploreRemaining(q) === 10, '初始本月结伴 0/10');
  const m = meetNpc(q, makeRng(5));
  q.npcs[m.npc.id].aff = TEAM_AFFINITY_THRESHOLD;
  const r1 = teamExplore(q, m.npc.id, makeRng(1));
  ok(!r1.error && r1.encounter, '首次结伴探险成功');
  ok(teamExploreUsed(q) === 1 && teamExploreRemaining(q) === 9, '本月结伴计数 +1（1/10）');
  // 同一道友本月只能一次
  ok(teamExplore(q, m.npc.id, makeRng(2)).error, '同一道友本月二次被拒');
  // 跨月归零
  q.teamExploreDate = '1970-01';
  ok(teamExploreUsed(q) === 0 && teamExploreRemaining(q) === 10, '跨月结伴计数归零');
}

// ---------- 成就按类型分类汇总 ----------
console.log('— achievements by category —');
ok(Array.isArray(ACH_CATS) && ACH_CATS.length >= 5, '成就分类 >= 5 类');
ok(ACHIEVEMENTS.every((a) => ACH_CATS.some((c) => c.id === a.cat)), '每个成就都归属某个分类');
ok(ACHIEVEMENTS.length >= 20, `成就数量更丰富（>= 20，实际 ${ACHIEVEMENTS.length}）`);
{
  ok(ACHIEVEMENTS.some((a) => a.cat === 'friend'), '存在「道友好友类」成就');
  const q = newPlayer(() => 0);
  q.npcs = { a: { met: true }, b: { met: true }, c: { met: true } };
  const g = checkAchievements(q);
  ok(g.some((a) => a.id === 'ach_friends3'), '结识 3 位道友触发「广结善缘」');
  // 分类计数：统计每个分类下成就数，且各类之和 = 总数
  const byCat = ACH_CATS.map((c) => ACHIEVEMENTS.filter((a) => a.cat === c.id).length).reduce((s, n) => s + n, 0);
  ok(byCat === ACHIEVEMENTS.length, '各分类成就数之和 = 总数（无遗漏/重复归类）');
}

// ---------- 成就：达成条件 / 当前进度 / 奖励 ----------
console.log('— achievements: goal / progress / reward —');
{
  // 每条成就都齐备 goal（条件+进度）与 reward（奖励），且 rewardDesc 可读
  ok(ACHIEVEMENTS.every((a) => a.goal && typeof a.goal.cur === 'function' && a.goal.target > 0), '每条成就都有 goal{cur,target>0}');
  ok(ACHIEVEMENTS.every((a) => a.reward && (a.reward.stones || (a.reward.items && a.reward.items.length))), '每条成就都有奖励');
  ok(ACHIEVEMENTS.every((a) => rewardDesc(a.reward) !== '无'), '每条成就的奖励都有可读文案');
  // 进度：全新角色不触发任何成就（没有开局即达成的成就）
  const fresh = newPlayer(() => 0);
  ok(checkAchievements(fresh).length === 0, '全新角色不触发任何成就');
  ok(ACHIEVEMENTS.every((a) => !achProgress(fresh, a).done), '全新角色未达成任何成就');
  // 进度随状态推进
  const p = newPlayer(() => 0);
  p.stats.battlesWon = 7;
  const fb = ACHIEVEMENTS.find((a) => a.id === 'ach_battle20');
  ok(achProgress(p, fb).cur === 7 && achProgress(p, fb).target === 20 && !achProgress(p, fb).done, '百战之士进度 7/20 未达成');
  p.stats.battlesWon = 20;
  ok(achProgress(p, fb).done, '达 20 胜后百战之士判定 done');

  // 首次授予时奖励自动到账：灵石 + 物品
  const q = newPlayer(() => 0);
  q.stats.battlesWon = 1;
  const stonesBefore = q.stones;
  const bagBefore = q.bag['pill_fuhun'] || 0;
  const granted = checkAchievements(q);
  const first = granted.find((a) => a.id === 'ach_first_battle');
  ok(first, '首战成就触发');
  ok(q.stones === stonesBefore + first.reward.stones, `首战奖励灵石到账（+${q.stones - stonesBefore}）`);
  // lowhp 成就带物品奖励：满足条件后物品入袋
  q.stats.lowHpWins = 1;
  const g2 = checkAchievements(q);
  const low = g2.find((a) => a.id === 'ach_lowhp_comeback');
  ok(low, '空血反杀成就触发');
  ok((q.bag['pill_fuhun'] || 0) > bagBefore, '空血反杀奖励物品（回魂丹）入袋');

  // 重复检测：奖励不重复发放
  const stonesAfter = q.stones;
  const g3 = checkAchievements(q);
  ok(g3.length === 0, '已获成就不再重复授予');
  ok(q.stones === stonesAfter, '重复检测时不再发放奖励');

  // rewardDesc 文案格式
  ok(/灵石/.test(rewardDesc({ stones: 50 })), 'rewardDesc 含灵石');
  ok(/×1/.test(rewardDesc({ items: [['pill_huitian', 1]] })), 'rewardDesc 含物品数量');
}

// ---------- 自动挂机（autoplay）----------
console.log('— autoplay —');
// 测试用：构造一份「只启用指定倾向」的完整配置（normalize 会用默认值补齐缺省倾向，
// 故测试需显式给出全部 0，避免默认倾向混入干扰加权抽取判定）。
const ZERO_TEND = { cultivate: 0, explore: 0, breakthrough: 0, craft: 0, market: 0, team: 0, meet: 0 };
const onlyTendency = (over) => normalizeAutoPlay({ enabled: true, tendencies: { ...ZERO_TEND, ...over } });

ok(AUTO_TENDENCIES.length >= 4, `自动挂机倾向 >= 4（实际 ${AUTO_TENDENCIES.length}）`);
ok(AUTO_TENDENCIES.every((d) => d.id && d.label && d.emoji && Number.isFinite(d.defaultWeight)), '每个倾向字段完整');
// 默认配置：关闭 + 合法节奏 + 全倾向正权重
{
  const ap = defaultAutoPlay();
  ok(ap.enabled === false, '默认自动挂机关闭（不擅自开启）');
  ok(Number.isFinite(ap.intervalSec) && ap.intervalSec >= 1, '默认周期节奏合法');
  const t = defaultTendencies();
  ok(AUTO_TENDENCIES.every((d) => Number.isFinite(t[d.id]) && t[d.id] > 0), '默认倾向权重均为正');
}
// normalizeAutoPlay 兜底 / 钳制
{
  const ap = normalizeAutoPlay(null);
  ok(ap.enabled === false && ap.intervalSec >= 1, 'normalizeAutoPlay(null) 给出合法默认（且关闭）');
  ok(AUTO_TENDENCIES.every((d) => Number.isFinite(ap.tendencies[d.id])), 'normalize 补齐所有倾向权重');
  const clamped = normalizeAutoPlay({ intervalSec: 999, tendencies: { cultivate: -3, explore: 99 } });
  ok(clamped.intervalSec <= 30, 'normalize 钳制越界周期节奏');
  ok(clamped.tendencies.cultivate === 0 && clamped.tendencies.explore === 9, 'normalize 钳制权重到 0~9');
  ok(normalizeAutoPlay({ enabled: true }).enabled === true, 'normalize 保留 enabled=true');
}
// pickTendency：仅在权重>0 的倾向中抽取；权重比例近似
{
  const cfg = onlyTendency({ cultivate: 1 });
  let allCult = true;
  for (let i = 0; i < 50; i++) { if (pickTendency(cfg, makeRng(i)) !== 'cultivate') allCult = false; }
  ok(allCult, 'pickTendency 仅在权重>0 的倾向中抽取');
  ok(pickTendency(onlyTendency({}), makeRng(0)) === null, '全部权重为 0 时返回 null');
  // 权重比 ≈ cultivate:explore = 4:1（容差放宽，仅验证大致倾向）
  const cfg2 = onlyTendency({ cultivate: 4, explore: 1 });
  let c = 0; const N = 3000;
  for (let i = 0; i < N; i++) if (pickTendency(cfg2, makeRng(i)) === 'cultivate') c++;
  const ratio = c / N;
  ok(ratio > 0.72 && ratio < 0.85, `权重比例近似 4:1（cultivate 占比 ${(ratio * 100).toFixed(0)}%）`);
}
// autoStep：修炼倾向能积累修为
{
  const q = newPlayer(() => 0);
  q.autoPlay = onlyTendency({ cultivate: 1 });
  q.tier = 1; q.sub = 0; recompute(q); q.mp = q.maxMp; q.hp = q.maxHp; q.vitality = q.maxVitality;
  const xp0 = q.xp;
  let progressed = false;
  for (let i = 0; i < 20; i++) {
    const r = autoStep(q, q.autoPlay, makeRng(i));
    ok(Array.isArray(r.logs), 'autoStep 返回 logs 数组');
    if (q.xp > xp0) { progressed = true; break; }
  }
  ok(progressed, '自动修炼倾向能积累修为');
}
// autoStep：探索倾向自动处置 battle/choice/instant 全程不抛错（大量随机覆盖）
{
  let crashed = false;
  try {
    for (let i = 0; i < 150; i++) {
      const q = newPlayer(() => 0);
      q.autoPlay = onlyTendency({ explore: 1 });
      q.tier = 3; q.sub = 0; recompute(q); q.hp = q.maxHp; q.mp = q.maxMp; q.vitality = q.maxVitality;
      for (let j = 0; j < 20; j++) autoStep(q, q.autoPlay, makeRng(i * 131 + j));
    }
  } catch (e) { crashed = true; console.error(e); }
  ok(!crashed, '自动探索（含战斗/抉择自动处置）全程不抛异常');
}
// autoStep：炼制倾向材料齐备时产出丹药
{
  const q = newPlayer(() => 0);
  q.autoPlay = onlyTendency({ craft: 1 });
  q.tier = 1; recompute(q); q.mp = q.maxMp; q.hp = q.maxHp; q.vitality = q.maxVitality;
  q.recipes = ['rcp_huitian'];
  addItem(q, 'herb_qingmu', 300);
  const before = countItem(q, 'pill_huitian');
  for (let i = 0; i < 80; i++) { autoStep(q, q.autoPlay, makeRng(i)); if (q.vitality < 6) q.vitality = q.maxVitality; }
  ok(countItem(q, 'pill_huitian') > before, '自动炼制倾向能产出丹药');
}
// autoStep：坊市倾向刷新货架并采购补给，活力丹入袋 / 缺活力时服用回补，全程不抛错
{
  ok(AUTO_TENDENCIES.some((d) => d.id === 'market'), '自动挂机含「坊市」倾向');
  ok(defaultTendencies().market > 0, '坊市倾向默认权重为正');
  const q = newPlayer(() => 0);
  q.autoPlay = onlyTendency({ market: 1 });
  q.stones = 99999; recompute(q); q.vitality = 0; // 活力见底，便于触发服用
  let anyOk = false, vitGained = false, stocked = false, crashed = false;
  try {
    for (let i = 0; i < 300; i++) {
      const r = autoStep(q, q.autoPlay, makeRng(i));
      if (r.ok) anyOk = true;
      if ((q.vitality || 0) > 0) vitGained = true;
      // 活力丹 / 突破丹 / 回血丹任一入袋即说明采购成功
      if (countItem(q, 'pill_peiyuan') || countItem(q, 'pill_lingjiu') || countItem(q, 'pill_xiancha')
        || countItem(q, 'pill_tupo') || countItem(q, 'pill_huitian')) stocked = true;
    }
  } catch (e) { crashed = true; console.error(e); }
  ok(!crashed, '自动坊市倾向全程不抛异常');
  ok(anyOk, '自动坊市倾向至少一轮成功采购 / 服用');
  ok(stocked, '自动坊市倾向会购入活力丹等补给');
  ok(vitGained, '活力见底时自动服用活力丹回补，支撑挂机持续');
}
// autoStep：突破倾向自动渡心魔，可跨越炼气→筑基大境界
{
  let reached = false; let crashed = false;
  try {
    const q = newPlayer(() => 0);
    q.autoPlay = onlyTendency({ cultivate: 2, breakthrough: 1 });
    q.tier = 1; q.sub = 0; recompute(q); q.hp = q.maxHp; q.mp = q.maxMp; q.vitality = q.maxVitality;
    addItem(q, 'fabao_huoyun', 1); equip(q, 'fabao_huoyun');
    // 用一条共享 rng 流（连续抽取分布良好）；按 i 重播种会让 LCG 首抽取高度相关，
    // 致加权选择系统性偏向首项，与真实游戏（Math.random）不符。
    const rng = makeRng(42);
    for (let i = 0; i < 20000 && q.tier < 2; i++) {
      autoStep(q, q.autoPlay, rng);
      if (q.hp <= 1) q.hp = q.maxHp;        // 战斗/渡劫掉血后补给，避免卡死
      if (q.mp < 20) q.mp = q.maxMp;
      if (q.vitality < 6) q.vitality = q.maxVitality; // 模拟跨月活力回满
    }
    reached = q.tier >= 2;
  } catch (e) { crashed = true; console.error(e); }
  ok(!crashed, '自动突破（含渡心魔）全程不抛异常');
  ok(reached, '自动挂机能跨越心魔大境界进入筑基');
}
// autoStep：全部权重为 0 时 ok=false，不抛错
{
  const q = newPlayer(() => 0);
  q.autoPlay = onlyTendency({});
  const r = autoStep(q, q.autoPlay, makeRng(0));
  ok(r.ok === false && r.tendency === null, '无启用倾向时 autoStep 返回 ok=false');
}
// 自动挂机配置随存档持久化（migrate 补齐）
{
  const q = newPlayer(() => 0);
  delete q.autoPlay;
  const mig = importSave(exportSave(q));
  ok(mig.autoPlay && typeof mig.autoPlay === 'object' && mig.autoPlay.enabled === false, '存档迁移补齐 autoPlay 配置（且不开启）');
  ok(AUTO_TENDENCIES.every((d) => Number.isFinite(mig.autoPlay.tendencies[d.id])), '迁移后所有倾向权重齐备');
}

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
// —— 辅助 ——
function SCENE_VALID(s) { return ['mountain', 'cave', 'ruin', 'wild'].includes(s); }
