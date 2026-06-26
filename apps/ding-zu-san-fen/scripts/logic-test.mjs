// 纯逻辑自测（不依赖 Phaser / 浏览器）
import {
  computeDamage, cellKey, MAP_Y, MAP_HEIGHT, TILE,
} from '../src/config.js';
import MapManager from '../src/managers/MapManager.js';
import WaveManager from '../src/managers/WaveManager.js';
import BondManager from '../src/managers/BondManager.js';
import { LEVELS, LEVEL_LIST } from '../src/data/levels.js';
import { GENERALS, GENERAL_BY_ID, LEVEL_MULT, upgradeCost, retreatRefund } from '../src/data/generals.js';
import { ENEMIES } from '../src/data/enemies.js';
import {
  STARTER_GENERALS, DRAW_COST, LEVEL_REWARD, FIRST_CLEAR_BONUS,
  resetMeta, getMeta, isUnlocked, unlockGeneral,
  unlockedGenerals, lockedPool, drawWeights, addGold, performDraw, grantLevelClear,
} from '../src/data/meta.js';
import { BONDS, bondsForGeneral, bondPartners } from '../src/data/bonds.js';

let pass = 0;
let fail = 0;
const ok = (cond, msg) => {
  if (cond) { pass++; }
  else { fail++; console.error('  ✗ FAIL:', msg); }
};
const near = (a, b, eps = 0.001) => Math.abs(a - b) <= eps;

// ---------- 伤害公式 ----------
console.log('— computeDamage —');
ok(near(computeDamage(100, 'PHYSICAL', 'NONE'), 100), 'phys/none');
ok(near(computeDamage(100, 'PHYSICAL', 'HEAVY'), 40), 'phys/heavy 0.4');
ok(near(computeDamage(100, 'PHYSICAL', 'PHYSICAL'), 50), 'phys/phys 0.5');
ok(near(computeDamage(100, 'MAGIC', 'HEAVY'), 150), 'magic/heavy 1.5');
ok(near(computeDamage(100, 'MAGIC', 'MAGIC'), 40), 'magic/magic 0.4');
ok(near(computeDamage(100, 'MAGIC', 'NONE'), 100), 'magic/none');

// ---------- 关卡 / 地图 ----------
console.log('— MapManager —');
for (const key of LEVEL_LIST) {
  const lv = LEVELS[key];
  const m = new MapManager(lv);
  ok(m.length > 100, `${key}: path length > 100 (${Math.round(m.length)})`);
  ok(m.waypoints.length >= 2, `${key}: waypoints`);
  let roads = 0; let highs = 0;
  for (const [, t] of m.slots) { if (t === 'road') roads++; else highs++; }
  ok(roads >= 4, `${key}: road slots >= 4 (got ${roads})`);
  ok(highs >= 8, `${key}: high slots >= 8 (got ${highs})`);
  const p0 = m.pointAt(0);
  const pEnd = m.pointAt(m.length);
  ok(p0.x !== undefined && pEnd.x !== undefined, `${key}: pointAt returns coords`);
  // 中间点应在路径上
  const pMid = m.pointAt(m.length / 2);
  ok(pMid.x !== p0.x || pMid.y !== p0.y, `${key}: mid point differs from start`);
  // base 在底部（竖屏路径自上而下，终点贴近底边）
  ok(pEnd.y > MAP_Y + MAP_HEIGHT - TILE - 1, `${key}: base near bottom edge (y=${Math.round(pEnd.y)})`);
}

// ---------- 羁绊 ----------
console.log('— BondManager —');
function mkGen(id, col, row) {
  return { def: GENERAL_BY_ID[id], col, row, buffAtk: 1, buffCd: 1, buffHp: 1 };
}
let bm = new BondManager();
let active = bm.recompute([mkGen('guanyu', 1, 1), mkGen('zhangfei', 1, 2)]);
let ids = active.map((b) => b.id);
ok(ids.includes('wuhu'), 'wuhu active with 2 五虎');
ok(!ids.includes('taoyuan'), 'taoyuan NOT active without 赵云');

bm = new BondManager();
const gs = [
  mkGen('guanyu', 1, 1), mkGen('zhangfei', 1, 2), mkGen('zhaoyun', 1, 3),
  mkGen('zhuge', 2, 1), mkGen('pangtong', 2, 2),
  mkGen('lvbu', 5, 5), mkGen('diaochan', 5, 6),
];
active = bm.recompute(gs);
ids = active.map((b) => b.id);
ok(ids.includes('wuhu'), 'wuhu active (3 五虎)');
ok(ids.includes('taoyuan'), 'taoyuan active (关张赵全在场)');
ok(ids.includes('wolong'), 'wolong active (亮统相邻)');
ok(ids.includes('qunxiong'), 'qunxiong active (吕蝉相邻)');
const guanyu = gs.find((g) => g.def.id === 'guanyu');
// 五虎(+25%) * 桃园(+20%) = 1.5
ok(near(guanyu.buffAtk, 1.25 * 1.2), `guanyu atk buff = 1.5 (got ${guanyu.buffAtk})`);
const zhuge = gs.find((g) => g.def.id === 'zhuge');
ok(near(zhuge.buffCd, 0.7), `zhuge cd buff = 0.7 (got ${zhuge.buffCd})`);
const lvbu = gs.find((g) => g.def.id === 'lvbu');
ok(near(lvbu.buffAtk, 1.5), `lvbu atk buff = 1.5 (got ${lvbu.buffAtk})`);

// 不相邻的卧龙凤雏不应激活
bm = new BondManager();
active = bm.recompute([mkGen('zhuge', 1, 1), mkGen('pangtong', 9, 9)]);
ok(!active.map((b) => b.id).includes('wolong'), 'wolong NOT active when far apart');

// ---------- 波次 ----------
console.log('— WaveManager —');
for (const key of LEVEL_LIST) {
  const lv = LEVELS[key];
  let spawned = 0;
  const wm = new WaveManager(lv.waves, () => { spawned++; });
  let cleared = false;
  ok(wm.startNextWave() === true, `${key}: start wave 1`);
  // 模拟足够长时间（含波间 4s 空档），alive 恒为 0
  for (let i = 0; i < 20000; i++) {
    wm.update(1 / 20, 0);
    wm.tickBetween(1 / 20);
    if (wm.state === 'cleared') { cleared = true; break; }
  }
  ok(cleared, `${key}: all waves clearable within time`);
  // 期望总生成数 = 所有小项 count 之和
  const expected = lv.waves.reduce((sum, wave) => sum + wave.reduce((s, g) => s + g.count, 0), 0);
  ok(spawned === expected, `${key}: spawned ${spawned} === expected ${expected}`);
}

// ---------- 升级 / 撤退数值 ----------
console.log('— upgrade/retreat —');
const def = GENERAL_BY_ID.guanyu;
ok(upgradeCost(def, 1) > 0, 'upgrade cost > 0');
ok(retreatRefund(def, 1) > 0, 'retreat refund > 0');
ok(retreatRefund(def, 2) >= retreatRefund(def, 1), 'higher level refunds more');
ok(LEVEL_MULT.atk[2] > LEVEL_MULT.atk[0], 'level mult increases atk');

// ---------- 敌军数据完整性 ----------
console.log('— enemies —');
for (const [k, e] of Object.entries(ENEMIES)) {
  ok(e.hp > 0 && e.speed > 0 && e.gold > 0, `enemy ${k} valid`);
  ok(['NONE', 'PHYSICAL', 'HEAVY', 'MAGIC'].includes(e.armor), `enemy ${k} armor type valid`);
}

// ---------- 元进度 meta ----------
console.log('— meta —');
ok(STARTER_GENERALS.length >= 3, 'starter roster size >= 3');
ok([...new Set(STARTER_GENERALS)].length === STARTER_GENERALS.length, 'starter roster no dup');
// 默认阵容需覆盖三类职业，保证开局可玩
const starterClasses = new Set(STARTER_GENERALS.map((id) => GENERAL_BY_ID[id].cls));
ok(starterClasses.size === 3, 'starter covers all 3 classes');

resetMeta();
ok(unlockedGenerals().length === STARTER_GENERALS.length, 'default unlocked = starter count');
ok(isUnlocked('guanyu') && isUnlocked('zhuge'), 'starter members unlocked');
ok(!isUnlocked('lvbu'), 'lvbu locked initially');
ok(lockedPool().length === GENERALS.length - STARTER_GENERALS.length, 'locked pool size');

// 通关奖励：首通含额外奖励，重复通关仅基础
resetMeta();
const r1 = grantLevelClear('huangjin');
ok(r1.first === true, 'huangjin first clear flag');
ok(r1.bonus === FIRST_CLEAR_BONUS, 'first clear bonus amount');
ok(r1.total === LEVEL_REWARD.huangjin + FIRST_CLEAR_BONUS, 'first clear total = base + bonus');
ok(getMeta().cleared.includes('huangjin'), 'cleared recorded');
ok(getMeta().gold === r1.total, 'gold credited');
const r2 = grantLevelClear('huangjin');
ok(r2.first === false && r2.bonus === 0, 'repeat clear: no bonus');
ok(r2.total === LEVEL_REWARD.huangjin, 'repeat clear: base only');

// 抽卡：扣费 + 解锁 + 不重复
resetMeta();
addGold(10000);
const before = unlockedGenerals().length;
const d = performDraw(() => 0); // rng=0 命中池首项
ok(d && d.id, 'draw returns an id');
ok(unlockedGenerals().length === before + 1, 'draw unlocks exactly one');
ok(isUnlocked(d.id), 'drawn general becomes unlocked');
ok(getMeta().gold === 10000 - DRAW_COST, 'draw deducts DRAW_COST');

// 已集齐：抽卡返回 allCollected 且不扣费
resetMeta();
GENERALS.forEach((g) => unlockGeneral(g.id));
const goldBeforeFull = getMeta().gold;
const d2 = performDraw(() => 0);
ok(d2 && d2.allCollected === true, 'draw allCollected when roster complete');
ok(getMeta().gold === goldBeforeFull, 'no charge when allCollected');

// 金币不足：返回 null，状态不变
resetMeta();
const d3 = performDraw(() => 0);
ok(d3 === null, 'draw returns null when broke');

// 权重恒正
resetMeta();
const weights = drawWeights(lockedPool());
ok(weights.length === lockedPool().length && weights.every((w) => w >= 1), 'weights all >= 1');

// 足够金币下，反复抽可集齐全部（无重复解锁）
resetMeta();
addGold(100000);
let guard = 0;
while (lockedPool().length > 0 && guard++ < 100) performDraw(() => 0);
ok(lockedPool().length === 0, 'can collect all generals via draws');
ok(unlockedGenerals().length === GENERALS.length, 'all unlocked after full draws');

// ---------- 羁绊 match / pool（图鉴搭档） ----------
console.log('— bonds match/pool —');
const guanyuBonds = bondsForGeneral(GENERAL_BY_ID.guanyu).map((b) => b.id);
ok(guanyuBonds.includes('wuhu'), 'guanyu participates in wuhu');
ok(guanyuBonds.includes('taoyuan'), 'guanyu participates in taoyuan');
const taoyuan = BONDS.find((b) => b.id === 'taoyuan');
const partners = bondPartners(taoyuan, GENERAL_BY_ID.guanyu);
ok(partners.includes('张飞') && partners.includes('赵云'), 'taoyuan partners for guanyu');
ok(!partners.includes('关羽'), 'partners excludes self');
const zhugeBonds = bondsForGeneral(GENERAL_BY_ID.zhuge).map((b) => b.id);
ok(zhugeBonds.includes('wolong'), 'zhuge participates in wolong');
ok(!zhugeBonds.includes('wuhu'), 'zhuge NOT in wuhu');
// 每条羁绊都应能 match 到至少一个武将
ok(BONDS.every((b) => GENERALS.some((g) => b.match(g))), 'every bond matches at least one general');

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
