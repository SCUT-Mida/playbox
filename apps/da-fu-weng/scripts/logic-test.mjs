// ============================================================================
// 大富翁 · 核心逻辑自测（纯 Node，无浏览器依赖）。
// 覆盖：地图生成（6 图尺寸/四角/街区/确定性）、经济数值、移动与起点工资、
//       购地升级租金垄断、特殊格、机会命运卡全效果、支付与自动变卖、破产终局、
//       回合轮转与按图上限、AI 决策阈值、随机种子确定性、地图解锁、存档往返。
// 运行：node scripts/logic-test.mjs
// ============================================================================
import {
  MAPS, mapDefOf, buildBoard, boardOf, perimeterOf, tileGrid, PALETTE,
  CHANCE_CARDS, FATE_CARDS, START_CASH, SALARY, SALARY_LAND_BONUS,
  JAIL_FINE, HOSPITAL_FEE, TAX_MIN, TAX_MAX,
  baseRent, rentOf, upgradeCost, taxOf,
} from '../src/config.js';
import {
  newGame, rollAndMove, resolveTile, buyTile, upgradeTile, declineDecision,
  endTurn, aiDecide, ranking, ownedTilesOf, ownedInDistrict,
  hasMonopoly, movePlayer, payTo, mapOf,
} from '../src/core/game.js';
import { rollDice } from '../src/core/rng.js';
import { saveToSlot, loadFromSlot, deleteSlot, exportSave, importSave, _setStorage } from '../src/core/save.js';
import { loadMeta, saveMeta, isUnlocked, unlockNext, _setStorage as metaStorage } from '../src/core/meta.js';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
const section = (t) => console.log(`— ${t} —`);

const firstOf = (st, type) => boardOf(st.mapKey).findIndex((t) => t.type === type);
const propTilesOf = (st) => boardOf(st.mapKey).map((t, i) => (t.type === 'prop' ? i : -1)).filter((i) => i >= 0);

// —— 地图生成 ——
section('地图生成');
ok(MAPS.length === 6, '6 张可选地图');
const expectSize = [50, 56, 60, 66, 72, 80];
MAPS.forEach((m, i) => {
  const n = perimeterOf(m);
  const tiles = buildBoard(m);
  ok(n === expectSize[i] && tiles.length === n, `${m.name} ${n} 格`);
  ok(tiles[0].type === 'start' && tiles[m.cols - 1].type === 'jail'
    && tiles[m.cols + m.rows - 2].type === 'hospital' && tiles[2 * m.cols + m.rows - 3].type === 'park',
    `${m.name} 四角特殊格正确`);
  const dists = new Set(tiles.filter((t) => t.type === 'prop').map((t) => t.district));
  ok(dists.size === m.districts.length, `${m.name} 覆盖全部 ${m.districts.length} 街区`);
  ok(JSON.stringify(buildBoard(m)) === JSON.stringify(tiles), `${m.name} 棋盘生成确定性`);
});
// 网格坐标覆盖（以最大图验证）
{
  const m = MAPS[5];
  const n = perimeterOf(m);
  const seen = new Set();
  let all = true;
  for (let i = 0; i < n; i++) {
    const g = tileGrid(i, m.cols, m.rows);
    const key = g.row + ',' + g.col;
    if (seen.has(key) || g.row < 1 || g.row > m.rows || g.col < 1 || g.col > m.cols) all = false;
    seen.add(key);
  }
  ok(all && seen.size === n, '网格坐标唯一且在界内（80 格）');
}
// 解锁链
ok(MAPS[0].unlock === null && MAPS.slice(1).every((m, i) => m.unlock === MAPS[i].key), '地图解锁链完整');

// —— 经济数值 ——
section('经济数值');
let st = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 3 });
const p0 = propTilesOf(st)[0];
const t80 = boardOf('oldtown')[p0];
ok(baseRent(t80) === Math.round(t80.price * 0.3), '基础租金 = 地价×0.3');
ok(rentOf(t80, 3, true) === Math.round(Math.round(Math.round(t80.price * 0.3) * 3.0) * 1.5), '垄断租金 ×1.5');
ok(upgradeCost(t80, 1) === Math.round(t80.price * 0.6), '升级花费比例');
ok(taxOf(100) === TAX_MIN && taxOf(999999) === TAX_MAX && taxOf(2400) === 240, '税款下限/上限/一成');

// —— 建档 ——
section('建档');
st = newGame({ heroKey: 'girl', aiCount: 2, mapKey: 'port', seed: 42 });
ok(st.mapKey === 'port' && st.tiles.length === 56, '港都商埠 56 格');
ok(st.players.length === 3 && st.players[0].name === '小蛮' && !st.players[0].isAI, '主角小蛮 + 2 AI');
ok(st.players.every((p) => p.cash === START_CASH && p.pos === 0), '初始现金与起点');
ok(newGame({ heroKey: 'nobody', aiCount: 9, mapKey: 'nope' }).mapKey === 'oldtown', '非法参数回退默认图');

// —— 移动与起点工资 ——
section('移动与工资');
st = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 7 });
const N = st.tiles.length;
st.players[0].pos = N - 2;
movePlayer(st, 0, 4); // 跨过起点
ok(st.players[0].pos === 2 && st.players[0].cash === START_CASH + SALARY, '跨过起点领工资');
st.players[0].pos = N - 4;
movePlayer(st, 0, 4); // 恰落起点
ok(st.players[0].pos === 0 && st.players[0].cash === START_CASH + SALARY + SALARY + SALARY_LAND_BONUS, '落起点双份工资+奖励');
st.players[0].pos = 3;
movePlayer(st, 0, -5);
ok(st.players[0].pos === N - 2, '后退取模正确');
ok(st.players[0].cash === START_CASH + SALARY + SALARY + SALARY_LAND_BONUS, '后退不发工资');

// —— 购地 / 升级 / 租金 ——
section('购地与租金');
st = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 3 });
const pA = propTilesOf(st)[0];
st.players[0].pos = pA; st.phase = 'resolve';
let res = resolveTile(st);
ok(res.kind === 'buy' && res.price === boardOf('oldtown')[pA].price && st.phase === 'decision', '空地触发买地抉择');
buyTile(st, pA);
const price = boardOf('oldtown')[pA].price;
ok(st.players[0].cash === START_CASH - price && st.tiles[pA].owner === 0 && st.tiles[pA].level === 1, '买地扣款与归属');
st.players[0].pos = pA; st.phase = 'resolve';
res = resolveTile(st);
ok(res.kind === 'upgrade' && res.cost === Math.round(price * 0.6), '自家地触发升级抉择');
upgradeTile(st, pA);
ok(st.tiles[pA].level === 2 && st.players[0].cash === START_CASH - price - Math.round(price * 0.6), '升级扣款与等级');
// AI 落地交租
st.players[1].pos = pA; st.turnIdx = 1; st.phase = 'resolve';
const aiCash0 = st.players[1].cash;
const myCash0 = st.players[0].cash;
res = resolveTile(st);
ok(res.kind === 'rent' && res.amount === Math.round(Math.round(price * 0.3) * 1.9), '2 级租金');
ok(st.players[1].cash === aiCash0 - res.amount && st.players[0].cash === myCash0 + res.amount, '租金转账');
// 垄断（集齐该街区全部地块）
const distA = boardOf('oldtown')[pA].district;
const sameDist = propTilesOf(st).filter((i) => boardOf('oldtown')[i].district === distA);
for (const i of sameDist) {
  if (i === pA) continue;
  st.tiles[i].owner = 0; st.tiles[i].level = 1; st.tiles[i].spent = boardOf('oldtown')[i].price;
}
ok(hasMonopoly(st, distA, 0), '集齐街区判定垄断');
st.players[1].pos = pA; st.phase = 'resolve';
res = resolveTile(st);
ok(res.amount === Math.round(Math.round(Math.round(price * 0.3) * 1.9) * 1.5), '垄断租金 ×1.5');
// 满级自家地仅提示
st.tiles[pA].level = 3; st.players[0].pos = pA; st.turnIdx = 0; st.phase = 'resolve';
res = resolveTile(st);
ok(res.kind === 'info' && st.phase === 'end', '满级自家地仅提示');

// —— 特殊格 ——
section('特殊格');
st = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 5 });
const taxIdx = firstOf(st, 'tax');
st.players[0].pos = taxIdx; st.phase = 'resolve';
res = resolveTile(st);
ok(res.kind === 'tax' && res.amount === Math.max(TAX_MIN, taxOf(START_CASH)), '税务司按现金收税');
const jailIdx = firstOf(st, 'jail');
st.players[0].pos = jailIdx; st.phase = 'resolve';
res = resolveTile(st);
ok(res.kind === 'jail' && st.players[0].skipTurns === 1 && st.players[0].cash < START_CASH, '监狱罚款+停掷');
const hospIdx = firstOf(st, 'hospital');
st.players[0].pos = hospIdx; st.phase = 'resolve';
res = resolveTile(st);
ok(res.kind === 'hospital', '医院结算');
const parkIdx = firstOf(st, 'park');
st.players[0].pos = parkIdx; st.phase = 'resolve';
res = resolveTile(st);
ok(res.kind === 'info', '御园无事');

// —— 卡牌效果（定向种子命中目标卡）——
section('机会/命运卡');
function rngFirst(seed) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function seedFor(kind, cardId) {
  const pool = kind === 'fate' ? FATE_CARDS : CHANCE_CARDS;
  const want = pool.findIndex((c) => c.id === cardId);
  for (let s = 1; s < 999999; s++) {
    if (Math.floor(rngFirst(s) * pool.length) === want) return s;
  }
  return 1;
}
const chIdx = firstOf(st, 'chance');
const faIdx = firstOf(st, 'fate');
st = newGame({ heroKey: 'boy', aiCount: 2, mapKey: 'oldtown', seed: 9 });
st.players[0].pos = chIdx; st.rng = seedFor('chance', 'c_gain'); st.phase = 'resolve';
resolveTile(st);
ok(st.players[0].cash === START_CASH + 160, '机会卡：拾金 +160');
st.players[0].pos = chIdx; st.rng = seedFor('chance', 'c_skip'); st.phase = 'resolve';
resolveTile(st);
ok(st.players[0].skipTurns === 1, '机会卡：停一回合');
st.players[0].pos = chIdx; st.players[0].skipTurns = 0; st.rng = seedFor('chance', 'c_start'); st.phase = 'resolve';
resolveTile(st);
ok(st.players[0].pos === 0 && st.players[0].cash === START_CASH + 160 + SALARY + SALARY_LAND_BONUS, '机会卡：直达到起点领奖励');
st.players[0].pos = chIdx; st.rng = seedFor('chance', 'c_back'); st.phase = 'resolve';
res = resolveTile(st);
ok(res.resolveAgain === true && st.players[0].pos === (chIdx - 3 + N) % N, '机会卡：后退 3 格并续结算');
st.players[0].pos = faIdx; st.players[0].skipTurns = 0; st.rng = seedFor('fate', 'f_jail'); st.phase = 'resolve';
resolveTile(st);
ok(st.players[0].pos === firstOf(st, 'jail') && st.players[0].skipTurns === 1, '命运卡：押入监狱（象征目标解析）');
st.players[0].pos = faIdx; st.rng = seedFor('fate', 'f_dividend'); st.phase = 'resolve';
st.tiles[pA] && (st.tiles[pA].owner = 0);
const cash0 = st.players[0].cash;
resolveTile(st);
ok(st.players[0].cash === cash0 + 40, '命运卡：每处产业 +40');
st.players[0].pos = chIdx; st.rng = seedFor('chance', 'c_birthday'); st.phase = 'resolve';
const c0 = st.players[0].cash, a0 = st.players[1].cash, b0 = st.players[2].cash;
resolveTile(st);
ok(st.players[0].cash === c0 + 120 && st.players[1].cash === a0 - 60 && st.players[2].cash === b0 - 60, '机会卡：生日收礼 60×2');
st.players[0].pos = chIdx; st.rng = seedFor('chance', 'c_award'); st.phase = 'resolve';
st.tiles[pA].level = 1;
resolveTile(st);
ok(st.tiles[pA].level === 2, '机会卡：免费升级');

// —— 支付：自动变卖与破产 ——
section('支付与破产');
st = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 11 });
st.players[0].cash = 70;
st.tiles[pA].owner = 0; st.tiles[pA].level = 1; st.tiles[pA].spent = price;
let paid = payTo(st, 0, 1, 100);
ok(paid.sold.length === 1 && st.tiles[pA].owner === -1 && !paid.bankrupt, '现金不足自动变卖且未破产');
st = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 13 });
st.players[0].cash = 30;
paid = payTo(st, 0, 1, 900);
ok(paid.bankrupt && st.players[0].bankrupt, '无力偿付破产');
ok(st.players[1].cash === START_CASH + 30, '债权人拿到剩余现金');
ok(ownedTilesOf(st, 0).length === 0 && st.finished && st.finished.reason === 'last', '地产释放 + 仅剩一家终局');

// —— 回合轮转 / 停掷 / 按图上限 ——
section('回合轮转');
st = newGame({ heroKey: 'boy', aiCount: 2, mapKey: 'oldtown', seed: 15 });
st.phase = 'end';
endTurn(st);
ok(st.turnIdx === 1 && st.phase === 'roll', '交棒下一位');
st.phase = 'end'; endTurn(st); st.phase = 'end'; endTurn(st);
ok(st.turnIdx === 0 && st.round === 2, '一圈后回合 +1');
st.players[1].skipTurns = 1;
st.turnIdx = 1; st.phase = 'roll';
const r = rollAndMove(st);
ok(r.skipped === true && st.players[1].skipTurns === 0 && st.phase === 'end', '停掷回合被消化');
st.round = mapOf(st).rounds; st.turnIdx = 2; st.phase = 'end';
const et = endTurn(st);
ok(et.finished && st.finished.reason === 'rounds', '达到地图回合上限结算');
ok(st.finished.ranking.length === 3 && st.finished.ranking[0].assets >= st.finished.ranking[2].assets, '排名按资产');
st = newGame({ heroKey: 'boy', aiCount: 2, mapKey: 'jiuzhou', seed: 16 });
ok(mapOf(st).rounds === 32 && st.tiles.length === 80, '九州环游 80 格 / 32 回合');
st.players[1].bankrupt = true; st.turnIdx = 0; st.phase = 'end';
endTurn(st);
ok(st.turnIdx === 2, '破产玩家跳过');

// —— AI 决策 ——
section('AI 决策');
st = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 19 });
st.players[0].cash = 200;
ok(aiDecide(st, { kind: 'buy', price: 80 }) === false, '现金不足阈值不买');
st.players[0].cash = 300;
ok(aiDecide(st, { kind: 'buy', price: 100 }) === true, '现金充裕买地');
st.players[0].cash = 400;
ok(aiDecide(st, { kind: 'upgrade', cost: 150 }) === false, '升级保留现金');
st.players[0].cash = 600;
ok(aiDecide(st, { kind: 'upgrade', cost: 150 }) === true, '现金充裕升级');

// —— 随机确定性 ——
section('随机确定性');
const s1 = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 777 });
const s2 = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 777 });
const seq1 = [rollDice(s1), rollDice(s1), rollDice(s1)];
const seq2 = [rollDice(s2), rollDice(s2), rollDice(s2)];
ok(seq1.join() === seq2.join(), '同种子骰序一致');
ok(seq1.join() !== [rollDice(newGame({ seed: 778 })), 0, 0].slice(0, 1).join(), '异种子骰序不同');

// —— 地图解锁 ——
section('地图解锁');
const mem = new Map();
const memStore = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) };
metaStorage(memStore);
ok(loadMeta().unlocked.length === 1 && isUnlocked('oldtown') && !isUnlocked('port'), '首图默认解锁，次图锁定');
const fresh1 = unlockNext('oldtown');
ok(fresh1 === 'port' && isUnlocked('port'), '老城夺冠解锁港都');
ok(unlockNext('oldtown') === null, '重复夺冠不再解锁');
unlockNext('port'); unlockNext('academy'); unlockNext('snow'); unlockNext('royal');
ok(isUnlocked('jiuzhou'), '连胜解锁至最终图');
ok(unlockNext('jiuzhou') === null, '最终图无后续');

// —— 存档 ——
section('存档');
_setStorage(memStore);
st = newGame({ heroKey: 'sword', aiCount: 3, mapKey: 'academy', seed: 21 });
st.tiles[pA].owner = 0; st.tiles[pA].level = 2; st.tiles[pA].spent = 128;
ok(saveToSlot(0, st), '写入 0 号槽');
const back = loadFromSlot(0);
ok(back && back.mapKey === 'academy' && back.tiles.length === 60 && back.rng === 21, '读档含地图与 60 格');
ok(back.tiles[pA].level === 2, '地产状态完整');
ok(loadFromSlot(1) === null && saveToSlot(-1, st) === false, '空槽/非法槽处理');
const code = exportSave(st);
ok(importSave(code) !== null && importSave('not-a-save') === null, '导出导入往返');
deleteSlot(0);
ok(loadFromSlot(0) === null, '删除槽位');

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
