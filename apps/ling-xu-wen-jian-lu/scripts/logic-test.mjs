// 纯逻辑自测（不依赖浏览器/DOM）。运行：npm test
import {
  counterMult, COUNTER_GAIN, COUNTER_LOSS, computeDamage, CRIT_MULT,
  effectiveStat, cardCap, expForLevel, rarityDef, RARITIES, cardPower,
  starBonusPct, starTiandaoFCost, starFragCost, STAR_TIERS, EVOLUTION,
  GACHA, PILL_EXP, BREAK_STONE,
  clamp, dayKey, initiative, POS_AGGRO, CAVE_CAP_HOURS,
} from '../src/config.js';
import { CARDS, CARD_MAP, cardDef } from '../src/data/cards.js';
import { BOSSES, makeEnemy, makeBoss, makeEnemyFormation, makeBossPower } from '../src/data/enemies.js';
import {
  newPlayer, recompute, addRes, countRes, canAfford, spendRes,
  ownCard, addFrag, countFrag, hasCard, setFormation, activeFormation, formationPower,
  collectionCount, collectionTotal, collectionProgress, totalStars,
} from '../src/core/player.js';
import { newInstance, instanceStats, instancePower, skillMult, isMaxLevel } from '../src/core/card.js';
import {
  canLevelUp, levelCeiling, feedPill, addExp, breakCost, canBreakThrough, doBreakThrough,
  starUpCost, canStarUp, doStarUp, canSkillUp, doSkillUp, MAX_SKILL_LEVEL,
} from '../src/core/cultivate.js';
import { drawOne, drawTen, dailyFreeAvailable, pitySSRRemaining, pitySRRemaining } from '../src/core/gacha.js';
import {
  buildCombatant, createBattle, stepRound, runBattle, playerSpecsFrom,
} from '../src/core/battle.js';
import {
  CHAPTERS, stagesForChapter, stageDef, canEnterStage, isStageCleared, enterStage,
} from '../src/core/stage.js';
import { enterFloor, tianOf, floorPower, TOTAL_FLOORS, resetSecret } from '../src/core/secret.js';
import { collectCave, previewCave, caveTotalLevel } from '../src/core/cave.js';
import { ACHIEVEMENTS, ACH_CATS, checkAchievements, achProgress, rewardDesc } from '../src/core/achievements.js';
import { hasSave, saveGame, loadGame, clearSave, exportSave, importSave, listSlots, _setStorage, _NUM_SLOTS } from '../src/core/save.js';
import { makeRng, weighted, pick, chance } from '../src/core/rng.js';
import { effectiveRarity } from '../src/core/card.js';
import { evoCost, canEvolve, doEvolve, canGift, doGift } from '../src/core/cultivate.js';
import { computeStageStars, prepareStageBattle, settleStage, rollDrops } from '../src/core/stage.js';
import { stageStars, stageStarOf } from '../src/core/player.js';
import { canSweep, sweepBatch, sweepUnlocked, sweepReason } from '../src/core/sweep.js';
import { staminaValue, regenStamina, spendStamina } from '../src/core/stamina.js';
import { affinityBonusPct, affinityLevel, AFFINITY_MAX, STAMINA_MAX, STAMINA_PER_SWEEP } from '../src/config.js';

let pass = 0; let fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.error('  ✗ FAIL:', msg); } };
const near = (a, b, eps = 0.001) => Math.abs(a - b) <= eps;

// ---------- 配置 / 五行 ----------
console.log('— config / elements —');
ok(RARITIES.length === 3, '3 个稀有度');
ok(rarityDef('SSR').rate === 0.05 && rarityDef('SR').rate === 0.25 && rarityDef('R').rate === 0.70, '稀有度概率 70/25/5');
ok(counterMult('metal', 'wood') === COUNTER_GAIN, '金克木 ×1.30');
ok(counterMult('wood', 'metal') === COUNTER_LOSS, '木被金克 ×0.85');
ok(counterMult('fire', 'fire') === 1, '同五行 ×1');
ok(counterMult('water', 'fire') === COUNTER_GAIN, '水克火 ×1.30');
ok(counterMult('earth', 'water') === COUNTER_GAIN, '土克水 ×1.30');
ok(counterMult('fire', 'metal') === COUNTER_GAIN, '火克金 ×1.30');
ok(counterMult('wood', 'earth') === COUNTER_GAIN, '木克土 ×1.30');
ok(counterMult('none', 'fire') === 1, '无属性不克制');

// 伤害公式（设计稿 4.4）
{
  // rng=0.5 → variance 1.0；非暴击；金克木 → 1.30
  const d = computeDamage({ atk: 100, def: 20, mult: 1.0, atkEl: 'metal', defEl: 'wood', crit: false, rng: () => 0.5 });
  // (100*1 - 20*0.5)*1.30*1*1.0 + 0 = (100-10)*1.30 = 117
  ok(d === 117, `金克木伤害 117（实际 ${d}）`);
  // 保底
  const d2 = computeDamage({ atk: 100, def: 9999, mult: 1, rng: () => 0.5 });
  ok(d2 >= 5, `伤害保底 ≥ 攻击×5%（实际 ${d2}）`);
  // 暴击
  const d3 = computeDamage({ atk: 100, def: 0, mult: 1, crit: true, rng: () => 0.5 });
  ok(d3 === Math.round(100 * 1 * CRIT_MULT * 1.0), `暴击 ×1.5（实际 ${d3}）`);
}

// 属性派生
{
  const s = effectiveStat(100, 10, 2, 3); // lvl10,br2,star3
  // 道果 3 重累计加成 = 0.08+0.08+0.10 = 0.26
  const expect = 100 * (1 + 0.05 * 9) * (1 + 0.08 * 2) * (1 + 0.26);
  ok(near(s, expect), 'effectiveStat 公式（道果分档）');
  ok(cardCap(rarityDef('R'), 0) === 30 && cardCap(rarityDef('R'), 5) === 80, 'R 等级上限 30→80');
  ok(cardCap(rarityDef('SSR'), 0) === 50 && cardCap(rarityDef('SSR'), 6) === 110, 'SSR 等级上限 50→110');
  ok(expForLevel(1) < expForLevel(10) && expForLevel(10) < expForLevel(30), '经验单调递增');
  ok(typeof PILL_EXP.exp_s === 'number' && PILL_EXP.exp_l > PILL_EXP.exp_s, '修为丹经验梯度');
}

// ---------- 卡牌数据完整性 ----------
console.log('— cards integrity —');
ok(CARDS.length === 15, `共 15 张卡（实际 ${CARDS.length}）`);
ok(CARDS.filter((c) => c.rarity === 'R').length === 9, '9 张 R 卡');
ok(CARDS.filter((c) => c.rarity === 'SR').length === 4, '4 张 SR 卡');
ok(CARDS.filter((c) => c.rarity === 'SSR').length === 2, '2 张 SSR 卡');
ok(CARDS.every((c) => c.actives && c.actives.length >= 1), '每张卡至少 1 个主动技');
ok(CARDS.every((c) => ['metal', 'wood', 'water', 'fire', 'earth'].includes(c.element)), '卡牌五行合法');
ok(CARDS.every((c) => typeof c.story === 'string' && c.story.length > 0), '每张卡有故事');
// SSR 必有被动
ok(CARDS.filter((c) => c.rarity === 'SSR').every((c) => c.passives.length >= 2), 'SSR 至少 2 个被动');

// ---------- 玩家 / 资源 ----------
console.log('— player / resources —');
let p = newPlayer();
ok(Object.keys(p.cards).length === 4, '初始 4 张 R 卡');
ok(p.formation.filter(Boolean).length === 4, '初始阵容 4 人');
ok(countRes(p, 'wendao') === 10, '初始 10 问道令');
ok(countRes(p, 'lingshi') === 3000, '初始 3000 灵石');
ok(collectionCount(p) === 4 && collectionTotal() === 15, '图鉴 4/15');
addRes(p, 'lingshi', 500);
ok(countRes(p, 'lingshi') === 3500, 'addRes 累加');
ok(canAfford(p, { lingshi: 1000 }) === true, '可负担');
ok(spendRes(p, { lingshi: 1000 }) === true && countRes(p, 'lingshi') === 2500, 'spendRes 扣除');
ok(canAfford(p, { lingshi: 99999 }) === false, '超额不可负担');
// 卡牌 / 碎片
ok(ownCard(p, 'SR001') === true, '获得 SR001（新）');
ok(hasCard(p, 'SR001') === true, '拥有 SR001');
addFrag(p, 'R001', 5);
ok(countFrag(p, 'R001') === 5, '碎片累加');
// 阵容
ok(setFormation(p, ['R001', 'SR001', 'R003', 'R006', 'R007']) === true, '设置阵容');
ok(p.formation[1] === 'SR001', '阵容记录');
ok(activeFormation(p).length === 5, '5 人有效阵容');
ok(formationPower(p) > 0, '阵容战力 > 0');
// 同卡不可重复上阵
setFormation(p, ['R001', 'R001', 'R003', 'R006', 'R007']);
ok(p.formation.filter((x) => x === 'R001').length === 1, '同卡不重复上阵');
ok(p.formation[1] === null && activeFormation(p).length === 4, '重复位被置空（4 人有效）');

// recompute 兜底（损坏档）
{
  const q = newPlayer();
  q.formation = ['NOPE', 'R001', 'R001', null, null];
  q.res.lingshi = -50;
  q.cards.R001.level = -3;
  recompute(q);
  ok(q.formation[0] === null, 'recompute 清除非法阵容引用');
  ok(q.res.lingshi === 0, 'recompute 钳制负数资源');
  ok(q.cards.R001.level === 1, 'recompute 修正非法等级');
}

// ---------- 养成 ----------
console.log('— cultivate —');
{
  const inst = p.cards.R001;
  ok(isMaxLevel(inst) === false, '初始未满级');
  ok(canLevelUp(inst) === true, '可升级');
  // 喂大丹 → 至少升若干级
  addRes(p, 'exp_l', 20);
  const lv0 = inst.level;
  const r = feedPill(p, inst, 'exp_l', 5);
  ok(r.ok === true, '喂丹成功');
  ok(inst.level > lv0, '喂丹后等级提升');
  ok(countRes(p, 'exp_l') >= 0, '丹药消耗');
  // 技能升级
  ok(canSkillUp(p, inst) === true, '可升级技能');
  const sl0 = inst.skillLv;
  doSkillUp(p, inst);
  ok(inst.skillLv === sl0 + 1, '技能等级 +1');
  ok(skillMult(inst) > skillMult({ ...inst, skillLv: 1 }), '技能倍率随等级提升');
}
// 突破：把卡升到 10 级瓶颈
{
  const q = newPlayer();
  q.res.lingshi = 1e9; q.res.exp_l = 1e9;
  const inst = q.cards.R001;
  // 把灵石/丹药灌满，升到 10 级
  while (canLevelUp(inst) && inst.level < levelCeiling(inst)) feedPill(q, inst, 'exp_l', 50);
  ok(inst.level === 10, `喂满到 10 级瓶颈（实际 ${inst.level}）`);
  ok(canLevelUp(inst) === false, '瓶颈处不可继续升级');
  // 给突破石
  const stone = BREAK_STONE[cardDef(inst.id).element];
  q.res[stone] = 99;
  ok(canBreakThrough(q, inst) === true, '可突破');
  doBreakThrough(q, inst);
  ok(inst.br === 1, '突破后 br=1');
  ok(canLevelUp(inst) === true, '突破后可继续升级');
}
// 升星
{
  const q = newPlayer();
  addFrag(q, 'R001', 99);
  q.res.tiandao_f = 99;
  const inst = q.cards.R001;
  const s0 = inst.star;
  ok(canStarUp(q, inst) === true, '可升星');
  doStarUp(q, inst);
  ok(inst.star === s0 + 1, '星级 +1');
  ok(totalStars(q) >= 1, '累计星级统计');
  // 满星不可再升
  inst.star = rarityDef('R').maxStar;
  ok(canStarUp(q, inst) === false, '满星不可再升');
}

// ---------- 问道（抽卡）----------
console.log('— gacha —');
{
  const q = newPlayer();
  q.res.wendao = 200;
  ok(dailyFreeAvailable(q) === true, '每日免费可用');
  const free = drawOne(q, makeRng(1), { free: true });
  ok(!free.error && free.results.length === 1, '免费单抽成功');
  ok(dailyFreeAvailable(q) === false, '免费单抽后当日不可再用');
  ok(q.res.wendao === 200, '免费单抽不消耗问道令');
  ok(q.stats.draws === 1, '抽卡计数 +1');
  // 问道令不足：清零后单抽应被拒
  q.res.wendao = 0;
  ok(drawOne(q, makeRng(2)).error, '问道令不足单抽被拒');
  // 十连：补回令牌后消耗 10 令
  q.res.wendao = 200;
  const ten = drawTen(q, makeRng(3));
  ok(!ten.error && ten.results.length === 10, '十连成功 10 张');
  ok(q.res.wendao === 190, '十连消耗 10 令');
  // 十连保底至少 1 张 SR
  ok(ten.results.some((r) => r.rarity === 'SR' || r.rarity === 'SSR'), '十连保底至少 1 张 SR+');
  // 重复 → 碎片
  {
    const q2 = newPlayer(); q2.res.wendao = 500;
    // 多次十连直到出现重复
    let dupSeen = false;
    for (let i = 0; i < 40 && !dupSeen; i++) {
      const r = drawTen(q2, makeRng(100 + i));
      if (r.results.some((x) => x.frag > 0)) dupSeen = true;
    }
    ok(dupSeen, '十连会出现重复并产出碎片');
  }
  // 保底 SSR：累计 90 抽必出
  {
    const q3 = newPlayer(); q3.res.wendao = 9999;
    let gotSSR = false;
    for (let i = 0; i < 100 && !gotSSR; i++) { const r = drawOne(q3, makeRng(i)); if (r.results && r.results[0].rarity === 'SSR') gotSSR = true; }
    ok(gotSSR, '100 抽内必出 SSR（90 抽保底）');
  }
}

// ---------- 战斗 ----------
console.log('— battle —');
{
  const q = newPlayer();
  // 给玩家强力卡（升星升满）
  ownCard(q, 'SSR001'); ownCard(q, 'SSR002'); ownCard(q, 'SR002');
  setFormation(q, ['SSR001', 'SR002', 'R003', 'SSR002', 'R006']);
  const specs = playerSpecsFrom(q);
  ok(specs.length === 5, '5 人阵容 spec');
  const enemies = makeEnemyFormation(300, 'fire', 'normal', makeRng(1));
  ok(enemies.length >= 1, '敌方阵容非空');
  const run = runBattle(specs, enemies, makeRng(7));
  ok(['win', 'lose'].includes(run.result), '战斗有结果');
  ok(run.rounds > 0 && run.rounds <= 60, `战斗回合数合理（${run.rounds}）`);
}
// 必胜路径：满星 SSR vs 单只弱怪
{
  const q = newPlayer();
  ownCard(q, 'SSR001');
  // 拉满
  const inst = q.cards.SSR001;
  inst.star = 6; inst.level = 110; inst.br = 11; inst.skillLv = 11;
  setFormation(q, ['SSR001', null, null, null, null]);
  const specs = playerSpecsFrom(q);
  const enemy = [makeEnemy(120, 'wood', makeRng(0))]; // 木系，被 SSR001 火系克制
  const run = runBattle(specs, enemy, makeRng(2));
  ok(run.result === 'win', `满星 SSR 应战胜弱怪（${run.result}）`);
}
// 必败路径：1 张空 R 卡 vs 高战力 Boss
{
  const q = newPlayer();
  setFormation(q, ['R001', null, null, null, null]);
  const specs = playerSpecsFrom(q);
  const boss = [makeBoss(11, makeRng(0))]; // 蚩尤完全体
  const run = runBattle(specs, boss, makeRng(5));
  ok(run.result === 'lose', `1 张空 R 卡应败给最终 Boss（${run.result}）`);
}
// SSR 被动：蚩尤濒死复活
{
  const q = newPlayer();
  ownCard(q, 'SSR001');
  setFormation(q, ['SSR001', null, null, null, null]);
  const specs = playerSpecsFrom(q);
  // 强敌但能打几回合，让 SSR 触发复活/狂暴
  const enemy = [makeBoss(6, makeRng(0))];
  let crashed = false;
  try { runBattle(specs, enemy, makeRng(9)); } catch (e) { crashed = true; console.error(e); }
  ok(!crashed, 'SSR 战斗链路不抛异常');
}
// 战斗海量随机覆盖不抛错
{
  let crashed = false;
  try {
    for (let i = 0; i < 60; i++) {
      const q = newPlayer();
      ownCard(q, pick(makeRng(i), CARDS).id);
      setFormation(q, [Object.keys(q.cards)[0], null, null, null, null]);
      const specs = playerSpecsFrom(q);
      const enemies = makeEnemyFormation(200 + i * 20, pick(makeRng(i), ['fire', 'water', 'wood', 'metal', 'earth', 'none']), i % 3 === 0 ? 'boss' : 'normal', makeRng(i));
      runBattle(specs, enemies, makeRng(i));
    }
  } catch (e) { crashed = true; console.error(e); }
  ok(!crashed, '战斗海量随机覆盖全程不抛异常');
}

// ---------- 主线关卡 ----------
console.log('— stages —');
ok(CHAPTERS.length === 12, '12 章');
ok(stagesForChapter(0).length === 7, '每章 7 关');
ok(stageDef('1-7').type === 'boss', '1-7 为首领关');
ok(stageDef('1-6').type === 'elite', '1-6 为精英关');
ok(stageDef('1-1').type === 'normal', '1-1 为普通关');
ok(canEnterStage(newPlayer(), '1-1') === true, '1-1 可进入');
ok(canEnterStage(newPlayer(), '1-2') === false, '1-2 未通关 1-1 前不可进入');
ok(canEnterStage(newPlayer(), '2-1') === false, '第二章未解锁');
{
  const q = newPlayer();
  ownCard(q, 'SSR001'); ownCard(q, 'SSR002'); ownCard(q, 'SR002'); ownCard(q, 'SR001');
  // 拉满便于通关测试
  for (const id of Object.keys(q.cards)) { const inst = q.cards[id]; inst.star = rarityDef(cardDef(id).rarity).maxStar; inst.level = 110; inst.br = 11; inst.skillLv = 11; }
  setFormation(q, ['SSR001', 'SR002', 'R003', 'SSR002', 'R006']);
  const r = enterStage(q, '1-1', makeRng(1));
  ok(r.ok === true, '进入 1-1 成功');
  ok(r.result === 'win', `满级队应胜 1-1（${r.result}）`);
  ok(isStageCleared(q, '1-1') === true, '1-1 标记通关');
  ok(canEnterStage(q, '1-2') === true, '1-1 通关后 1-2 解锁');
  // 通关首领解锁下一章
  enterStage(q, '1-6', makeRng(2));
  const boss = enterStage(q, '1-7', makeRng(3));
  if (boss.result === 'win') ok(q.story.highestChapter === 2, '通关 1-7 解锁第二章');
  ok(q.stats.stagesCleared >= 1, '通关计数');
}

// ---------- 敌人 / Boss ----------
console.log('— enemies —');
ok(BOSSES.length === 12, '12 个 Boss');
ok(BOSSES[0].element === 'earth' && BOSSES[11].name.includes('蚩尤'), '首尾 Boss 正确');
{
  const e = makeEnemy(500, 'fire', makeRng(1));
  ok(e.stats.atk > 0 && e.stats.hp > 0 && e.actives.length >= 1, '小怪属性完整');
  const b = makeBoss(2, makeRng(1));
  ok(b.isBoss === true && b.passives.length >= 1, 'Boss 标记 + 有被动');
  const form = makeEnemyFormation(1000, 'wood', 'boss', makeRng(1));
  ok(form.length >= 1 && form[0].isBoss, 'boss 阵容含 Boss');
}

// ---------- 秘境 ----------
console.log('— secret —');
ok(TOTAL_FLOORS === 90, '90 层');
ok(tianOf(1) === 1 && tianOf(10) === 1 && tianOf(11) === 2 && tianOf(90) === 9, '重天划分');
ok(floorPower(1) < floorPower(50) && floorPower(50) < floorPower(90), '战力随层数递增');
{
  const q = newPlayer();
  ownCard(q, 'SSR001'); ownCard(q, 'SSR002'); ownCard(q, 'SR002');
  for (const id of Object.keys(q.cards)) { const inst = q.cards[id]; inst.star = rarityDef(cardDef(id).rarity).maxStar; inst.level = 110; inst.br = 11; inst.skillLv = 11; }
  setFormation(q, ['SSR001', 'SR002', 'R003', 'SSR002', 'R006']);
  let crashed = false;
  try {
    for (let i = 0; i < 30; i++) enterFloor(q, makeRng(i));
  } catch (e) { crashed = true; console.error(e); }
  ok(!crashed, '秘境 30 层不抛异常');
  ok(q.secret.floor >= 1, '秘境层数有效');
}
// 秘境战败回存档层
{
  const q = newPlayer(); // 空队伍弱卡
  setFormation(q, ['R001', null, null, null, null]);
  const before = q.secret.floor;
  enterFloor(q, makeRng(3)); // 大概率战败
  ok(q.secret.floor <= before, '秘境战败不前进（回存档层）');
}

// ---------- 洞府挂机 ----------
console.log('— cave —');
{
  const q = newPlayer();
  q.cave.lastSeen = Math.floor(Date.now() / 1000) - 7200; // 2 小时前
  const stones0 = countRes(q, 'lingshi');
  const off = collectCave(q);
  ok(off.seconds > 0 && off.lingshi > 0, '离线 2 小时有灵石收益');
  ok(countRes(q, 'lingshi') === stones0 + off.lingshi, '离线灵石入账');
  // 上限
  q.cave.lastSeen = 1;
  const cap = collectCave(q);
  ok(cap.capped === true, '超 12 小时被截断');
  ok(CAVE_CAP_HOURS === 12, '离线上限 12 小时');
  ok(caveTotalLevel(q) > 0, '卡牌总等级 > 0');
  // 预览不改状态
  const v = previewCave(q);
  ok(typeof v.lingshi === 'number', 'previewCave 返回数值');
}

// ---------- 成就 ----------
console.log('— achievements —');
ok(ACHIEVEMENTS.length >= 12, `成就 >= 12（实际 ${ACHIEVEMENTS.length}）`);
ok(ACH_CATS.length >= 5, '成就分类 >= 5');
ok(ACHIEVEMENTS.every((a) => ACH_CATS.some((c) => c.id === a.cat)), '每个成就归属分类');
ok(ACHIEVEMENTS.every((a) => a.goal.target > 0), '每条成就有目标');
{
  const q = newPlayer();
  ok(checkAchievements(q).length === 0, '新角色不触发成就');
  q.stats.draws = 1;
  const g = checkAchievements(q);
  ok(g.some((a) => a.id === 'ach_first_draw'), '首次问道成就触发');
  ok(q.achievements.includes('ach_first_draw'), '成就入库');
  ok(checkAchievements(q).length === 0, '已获成就不重复授予');
  ok(typeof rewardDesc({ wendao: 5 }) === 'string' && rewardDesc({ wendao: 5 }).includes('问道令'), 'rewardDesc 含名称');
}

// ---------- 存档 ----------
console.log('— save —');
const store = {};
_setStorage({ getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } });
ok(hasSave() === false, '初始无存档');
ok(_NUM_SLOTS() === 3, '3 个存档槽');
{
  const q = newPlayer();
  ownCard(q, 'SR001');
  saveGame(q);
  ok(hasSave() === true, '存档后存在');
  const loaded = loadGame();
  ok(loaded && hasCard(loaded, 'SR001') === true, '读档往返一致');
  const str = exportSave(q);
  ok(typeof str === 'string' && str.length > 10, '导出为字符串');
  const imp = importSave(str);
  ok(imp && hasCard(imp, 'SR001'), '导入还原');
  ok(importSave('!!!not valid!!!') === null, '损坏字符串安全降级');
}
// 多槽
{
  clearSave();
  const q1 = newPlayer(); ownCard(q1, 'SR001'); saveSlot2(1, q1);
  const q2 = newPlayer(); ownCard(q2, 'SSR001'); saveSlot2(2, q2);
  const list = listSlots();
  ok(list.length === 3, '列出 3 槽');
  ok(list[0].empty === false && list[1].empty === false && list[2].empty === true, '槽 1/2 占用、槽 3 空');
  ok(list[0].cards >= 4, '槽元信息含卡牌数');
}
function saveSlot2(n, player) { player.slot = n; saveGame(player); }
clearSave();

// ---------- 道果九重天·升星（增量 2.1）----------
console.log('— star tiers / dao-fruit —');
ok(STAR_TIERS === 9, '道果九重天 = 9 重');
ok(starTiandaoFCost(2) === 2 && starTiandaoFCost(9) === 30, '本源碎片消耗表 2..30');
ok(starFragCost(2) === 0 && starFragCost(9) === 10, '同名碎片消耗表 0..10');
ok(starBonusPct(0) === 0, '0 星加成 0');
ok(near(starBonusPct(3), 0.08 + 0.08 + 0.10), '3 重累计加成 26%');
ok(starBonusPct(9) > 1, '9 重满星累计加成 > 100%');
{
  // 总计：1→9 消耗本源碎片 95、同名碎片 34（设计稿增量 2.1）
  let sumF = 0, sumD = 0;
  for (let t = 2; t <= 9; t++) { sumF += starFragCost(t); sumD += starTiandaoFCost(t); }
  ok(sumF === 34 && sumD === 95, `1→9 满星消耗：碎片${sumF}/本源${sumD}（设计 34/95）`);
  ok(RARITIES.every((r) => r.maxStar === 9), '所有稀有度上限均为 9 重');
  const q = newPlayer();
  addFrag(q, 'R001', 99); q.res.tiandao_f = 99;
  const inst = q.cards.R001;
  // 连升到 9 重
  let ups = 0;
  while (canStarUp(q, inst) && ups < 20) { doStarUp(q, inst); ups++; }
  ok(inst.star === 9, `R 卡可升满 9 重（实际 ${inst.star}，升 ${ups} 次）`);
  ok(canStarUp(q, inst) === false, '9 重满星不可再升');
}

// ---------- 化凡入圣·进化（增量 2.2）----------
console.log('— evolution —');
{
  const q = newPlayer();
  addRes(q, 'tiandao', 9999);
  addRes(q, 'essence_wood', 9999);
  addRes(q, 'dao_scroll', 9999);
  const inst = q.cards.R006; // 柳叶医仙（木系 R）
  ok(effectiveRarity(inst) === 'R', '初始有效稀有度 R');
  ok(canEvolve(q, inst) === false, '未满星不可进化');
  inst.star = 9;
  ok(canEvolve(q, inst) === false, '满星但等级未达上限不可进化');
  // 直接拉满等级上限（升级/突破链路已在 cultivate 用例覆盖）
  inst.level = cardCap(rarityDef('R'), 9);
  inst.br = 11;
  ok(isMaxLevel(inst) === true, `R 卡满星后达等级上限（Lv.${inst.level}）`);
  const ec = evoCost(inst);
  ok(ec && ec.target === 'SR', 'R 进化目标为 SR');
  ok(canEvolve(q, inst) === true, '满星满级 + 材料足 → 可进化');
  const atkBefore = instanceStats(inst).atk;
  const r = doEvolve(q, inst);
  ok(r.ok === true, '进化成功');
  ok(effectiveRarity(inst) === 'SR', '进化后有效稀有度 = SR');
  ok(instanceStats(inst).atk > atkBefore, '进化后面板攻击提升');
  ok(inst.evo === 1, '进化阶段 evo=1');
  // SSR 不可再进化
  const s = q.cards.R001; s.star = 9; s.evo = 2; // R 直接到 SSR（极端）
  ok(effectiveRarity(s) === 'SSR', 'R evo=2 → SSR');
  ok(evoCost(s) === null, 'SSR 无进化路径');
}

// ---------- 知音·好感度（增量 1.2）----------
console.log('— affinity —');
ok(affinityBonusPct(0) === 0 && affinityBonusPct(100) === 0.10, '好感加成 0..10%');
ok(affinityLevel(0).tier === 1 && affinityLevel(100).tier === 5, '好感境界 1..5');
{
  const q = newPlayer();
  addRes(q, 'gift', 20);
  const inst = q.cards.R001;
  ok((inst.affinity || 0) === 0, '初始好感 0');
  ok(canGift(q, inst) === true, '可赠礼');
  doGift(q, inst);
  ok(inst.affinity === 10, '赠礼 +10 好感');
  // 好感带来属性加成
  const a0 = instanceStats({ ...inst, affinity: 0 }).atk;
  const a100 = instanceStats({ ...inst, affinity: 100 }).atk;
  ok(a100 > a0, '满好感攻击高于 0 好感');
}

// ---------- 灵气·体力（增量 4.2）----------
console.log('— stamina —');
ok(STAMINA_MAX === 120 && STAMINA_PER_SWEEP === 10, '灵气上限 120 / 每次扫荡 10');
{
  const q = newPlayer();
  // 缺失 stamina 字段 → recompute 初始化为满
  recompute(q);
  ok(q.stamina.value === STAMINA_MAX, '新档灵气满 120');
  // 离线恢复：lastSeen 设为 10 分钟前 → 应恢复 2 点（但已满，仍满）
  q.stamina.value = 100; q.stamina.lastSeen = Math.floor(Date.now() / 1000) - 600;
  const v = staminaValue(q);
  ok(v === 102, `10 分钟恢复 2 点灵气（实际 ${v}）`);
  // 上限钳制
  q.stamina.value = STAMINA_MAX; q.stamina.lastSeen = Math.floor(Date.now() / 1000) - 99999;
  ok(staminaValue(q) === STAMINA_MAX, '灵气不超上限');
  // 消耗
  q.stamina.lastSeen = Math.floor(Date.now() / 1000);
  regenStamina(q);
  spendStamina(q, 50);
  ok(q.stamina.value === STAMINA_MAX - 50, '消耗 50 灵气');
}

// ---------- 关卡 3 星评定（增量 4.1）----------
console.log('— stage 3-star —');
{
  const q = newPlayer();
  ownCard(q, 'SSR001'); ownCard(q, 'SSR002'); ownCard(q, 'SR002');
  for (const id of Object.keys(q.cards)) { const inst = q.cards[id]; inst.star = 9; inst.level = 110; inst.br = 11; inst.skillLv = 11; }
  setFormation(q, ['SSR001', 'SR002', 'R003', 'SSR002', 'R006']);
  const prep = prepareStageBattle(q, '1-1', makeRng(1));
  ok(prep.ok === true && prep.specs.length === 5, 'prepareStageBattle 构造 5 人 spec');
  const run = runBattle(prep.specs, prep.enemies, makeRng(2));
  const settled = settleStage(q, '1-1', run, makeRng(3));
  ok(run.result === 'win', '满级队胜 1-1');
  const stars = computeStageStars(run);
  ok(stars >= 1 && stars <= 3, `3 星评定在 1..3（实际 ${stars}）`);
  ok(stageStarOf(q, '1-1') === stars, '关卡记录星数');
  ok(stageStars(q) >= 3, '累计星数 >= 3');
  // rollDrops 可独立调用（扫荡复用）
  const drops = rollDrops(stageDef('1-7'), makeRng(4));
  ok(drops && typeof drops.res === 'object', 'rollDrops 导出可复用');
}

// ---------- 一键扫荡（增量 第四节）----------
console.log('— sweep —');
{
  const q = newPlayer();
  recompute(q); // 确保 story.stars 字段存在
  // 模拟 3 星通关 1-1
  q.story.clearedStages['1-1'] = true; q.story.stars['1-1'] = 3; q.unlocks = { sweep: true };
  q.res.sweep_ticket = 20;
  ok(sweepUnlocked(q) === true, '扫荡已解锁');
  ok(sweepReason(q, '1-1') === null, '1-1 三星可扫荡');
  ok(canSweep(q, '1-1') === true, 'canSweep 通过');
  // 非三星关卡不可扫
  q.story.clearedStages['1-2'] = true; q.story.stars['1-2'] = 2;
  ok(sweepReason(q, '1-2') !== null, '2 星关卡不可扫荡');
  // 神行符不足
  q.res.sweep_ticket = 0;
  ok(sweepReason(q, '1-1') !== null, '神行符不足不可扫荡');
  // 批量扫荡 ×5：消耗 5 张符 + 50 灵气
  q.res.sweep_ticket = 5; q.stamina.value = STAMINA_MAX;
  const stam0 = q.stamina.value;
  const res = sweepBatch(q, '1-1', 5, makeRng(7));
  ok(res.done === 5, `批量扫荡完成 5 次（实际 ${res.done}）`);
  ok(q.res.sweep_ticket === 0, '批量扫荡消耗 5 张神行符');
  ok(q.stamina.value === stam0 - 50, `批量扫荡消耗 50 灵气（${stam0} → ${q.stamina.value}）`);
  // 中途灵气不足自动停止
  q.res.sweep_ticket = 10; q.stamina.value = 25; // 仅够 2 次（20 点）
  const res2 = sweepBatch(q, '1-1', 10, makeRng(8));
  ok(res2.done === 2 && res2.stopped, `灵气不足自动停止于 2 次（实际 ${res2.done}）`);
}

// ---------- 战斗结构化事件（增量 第三节，供 2.5D 回放）----------
console.log('— battle events —');
{
  const q = newPlayer();
  ownCard(q, 'SSR001'); ownCard(q, 'SSR002'); ownCard(q, 'SR002');
  setFormation(q, ['SSR001', 'SR002', 'R003', 'SSR002', 'R006']);
  const specs = playerSpecsFrom(q);
  const enemies = makeEnemyFormation(400, 'fire', 'normal', makeRng(1));
  const battle = createBattle(specs, enemies, makeRng(1));
  ok(Array.isArray(battle.events) && battle.events.length > 0, '战斗初始化生成 init 事件');
  ok(battle.events.every((e) => e.t === 'init') || battle.events.some((e) => e.t === 'init'), '含 init 事件');
  const beforeLen = battle.events.length;
  runBattle(specs, enemies, makeRng(2));
  // runBattle 内部新建了 battle，用其返回值校验事件类型覆盖
  const run = runBattle(specs, enemies, makeRng(3));
  const types = new Set(run.battle.events.map((e) => e.t));
  ok(types.has('init') && types.has('round'), '事件含 init / round');
  ok(types.has('act'), '事件含 act（出手）');
  ok(types.has('over'), '事件含 over（结束）');
  ok(run.battle.events.some((e) => e.t === 'init' && Number.isFinite(e.hp) && Number.isFinite(e.maxHp)), 'init 事件携带 hp/maxHp');
  void beforeLen;
}

// ---------- 角色人物视觉系统（增量 第一~七节：分层立绘 / 职业剪影 / 诗词）----------
console.log('— character portrait —');
{
  const {
    CLASSES, classDef, silhouetteColor, poemOf,
    RARITY_PORTRAIT, rarityPortrait, portraitConfig, portraitLayers,
  } = await import(new URL('../src/config.js', import.meta.url).href);
  ok(CLASSES.length === 5, '五大职业（剑/体/丹/阵/符）');
  ok(new Set(CARDS.map((c) => c.cls)).size === 5, '卡牌覆盖全部 5 个职业');
  ok(CARDS.every((c) => classDef(c.cls).weapon), '每张卡的职业均有核心武器');
  // 数据字段（设计稿增量 七·cards.json 扩展）
  ok(CARDS.every((c) => typeof c.poem === 'string' && c.poem.length > 0), '每张卡有专属诗词 poem');
  ok(CARDS.every((c) => typeof c.voiceQuote === 'string' && c.voiceQuote.length > 0), '每张卡有语音文案 voiceQuote');
  ok(CARDS.every((c) => /^#[0-9a-fA-F]{6}$/.test(c.silhouetteColor)), '每张卡有合法剪影色 silhouetteColor');
  // 取色 / 取诗：优先卡牌字段，缺省回退五行色 / quote
  // 用与五行色不同的自定义色断言，确保真正覆盖 override 路径
  //（历史上每张卡的 silhouetteColor 恰等于五行色，等值断言是假阳性）。
  ok(silhouetteColor({ element: 'water', silhouetteColor: '#123456' }) === '#123456', 'silhouetteColor 读卡牌驼峰字段覆盖');
  ok(silhouetteColor({ element: 'water', silhouette_color: '#654321' }) === '#654321', 'silhouetteColor 读卡牌蛇形字段覆盖');
  ok(silhouetteColor(CARD_MAP.SR001) === CARD_MAP.SR001.silhouetteColor, 'silhouetteColor 读卡牌字段');
  ok(silhouetteColor({ element: 'fire' }) === '#d4564f', 'silhouetteColor 缺省回退五行色');
  ok(poemOf(CARD_MAP.SR001) === '云鹤九霄外，仙踪不可寻', 'poemOf 取白鹤仙子诗词');
  ok(poemOf({ quote: 'Q' }) === 'Q', 'poemOf 缺省回退 quote');
  // 稀有度美术规格：R 静态 / SR 局部 / SSR 全动态
  ok(rarityPortrait('R').dynamic === 0 && rarityPortrait('SR').dynamic === 1 && rarityPortrait('SSR').dynamic === 2, '稀有度动态层级 0/1/2');
  ok(rarityPortrait('SSR').particles === true && rarityPortrait('SSR').breakFrame === true, 'SSR 启用粒子背景 + 破框');
  ok(rarityPortrait('R').inkline === true, 'R 启用墨线白描');
  // 立绘分层 + 动画配置
  const cfg = portraitConfig(CARD_MAP.SR001, 'SR');
  ok(Object.keys(cfg.layers).length >= 7 && cfg.layers.weapon.endsWith('_weapon.png'), 'portraitConfig 含分层 PSD 命名（≥7 层）');
  ok(cfg.animations.sway_parts.length >= 1, 'portraitConfig 派生飘动部件');
  ok(cfg.animations.blink_interval === 6000, 'SR 眨眼间隔 6000ms');
  ok(portraitConfig(CARD_MAP.SSR001, 'SSR').animations.blink_interval === 5000, 'SSR 眨眼间隔 5000ms');
  ok(portraitConfig(CARD_MAP.R001, 'R').animations.blink_interval === 0, 'R 不眨眼（静态）');
  ok(portraitLayers(CARD_MAP.R002).bg === 'assets/portraits/R002_bg.webp', 'portraitLayers 按卡牌 id 约定导出');
  // 战斗 init 事件携带 cls + ref（供战场剪影渲染）
  {
    const specs = playerSpecsFrom((() => { const q = newPlayer(); ownCard(q, 'SR001'); setFormation(q, ['SR001', null, null, null, null]); return q; })());
    const battle = createBattle(specs, makeEnemyFormation(100, 'fire', 'normal', makeRng(1)), makeRng(1));
    const init = battle.events.find((e) => e.t === 'init' && e.side === 'player');
    ok(init && init.cls === '丹修' && init.ref === 'SR001', 'init 事件携带职业 cls 与卡牌 ref');
  }
}

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
