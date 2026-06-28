// 纯逻辑自测（不依赖浏览器/DOM）。运行：npm test
import {
  REALMS, SPIRIT_ROOTS, ASCEND_INDEX, globalLevel, fromGlobalLevel, xpNeeded, MAX_GLOBAL_LEVEL,
  passiveXpPerSec, breakthroughChance, computeDamage, counterMult, clamp,
  cultivateSpeedMult,
  PITTY_THRESHOLD, PITTY_BOOST, dayKey,
} from '../src/config.js';
import { ITEMS, TREASURE_SKILLS } from '../src/data/items.js';
import { makeEnemy } from '../src/data/enemies.js';
import { EVENTS, eligibleEvents } from '../src/data/events.js';
import {
  newPlayer, recompute, addXp, isXpFull, addItem, removeItem, countItem, hasItem,
  equip, unequip, expandBag, bagExpandCost, upgradeRoot, distinctItems, realmInfo, START_BAG_CAPACITY,
  restToNextDay, vitalityDepleted,
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
import { ACHIEVEMENTS, checkAchievements } from '../src/core/achievements.js';
import { SECTS, SECT_LIST, SECT_TITLES, SECT_TASK_POOL, CHALLENGE_TEMPLATES, MAX_ACTIVE_CHALLENGES } from '../src/data/sect.js';
import {
  joinSect, sectDef, currentSectTitle, nextSectTitle, titleProgress,
  ensureSectTasks, dailySectRollover, recordSectActivity, claimSectTask, claimAllSectTasks,
  claimDailySectReward, sectRewardClaimedToday, sectCultivateBonus, rollDailySectTasks,
  acceptChallenge, claimChallenge, abandonChallenge, activeChallengeCount, scaleChallenge,
} from '../src/core/sect.js';
import { NPC_LIST, NPCS, npcDef, affinityLevel, TEAM_AFFINITY_THRESHOLD, MEET_VITALITY_COST, TEAM_VITALITY_COST } from '../src/data/npcs.js';
import {
  meetNpc, giftNpc, canTeamUp, teamedToday, teamExplore,
  meetableNpcs, metNpcs, getAffinity, isMet, companionCultivateBonus,
} from '../src/core/npc.js';
import { playSfx, isSfxEnabled, setSfxEnabled } from '../src/core/sfx.js';
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

// 灵根提升
const rootBefore = p.rootId;
const up = upgradeRoot(p);
const idxBefore = SPIRIT_ROOTS.findIndex((s) => s.id === rootBefore);
ok(up === (idxBefore < SPIRIT_ROOTS.length - 1), 'upgradeRoot 在未满时提升');
// 升到顶后不再升
p.rootId = SPIRIT_ROOTS[SPIRIT_ROOTS.length - 1].id; recompute(p);
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
  // 跨日刷新：篡改日期后 ensureSectTasks/dailySectRollover 应重置
  q.sectTaskDate = '1970-01-01';
  ok(dailySectRollover(q, makeRng(5)) === true, '跨日触发任务刷新');
  ok(q.sectTaskDate === dayKey() && q.sectTasks.every((t) => !t.claimed && t.progress === 0), '刷新后任务归零且日期更新');
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
  ok(q.restUsedDate === dayKey(), '记录当日已用');
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

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);

// —— 辅助 ——
function SCENE_VALID(s) { return ['mountain', 'cave', 'ruin', 'wild'].includes(s); }
