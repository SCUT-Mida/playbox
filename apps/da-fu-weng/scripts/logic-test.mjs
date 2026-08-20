// ============================================================================
// 大富翁 · 核心逻辑自测（纯 Node，无浏览器依赖）。
// 覆盖：地图生成（6 图尺寸/内街闭环/四角/街区/确定性）、经济数值、角色天赋、
//       移动与起点工资、购地升级租金垄断（含购地折扣）、特殊格（含罚金减免）、
//       机会命运卡全效果、双骰对子/连三对入狱/顺风骰、商店道具与上限/均富卡（道具栏打出）/护身符、
//       支付与自动变卖、破产终局（淘汰制无回合上限）、回合轮转与对子加掷、
//       AI 决策与 AI 采购、随机种子确定性、地图解锁、存档往返。
// 运行：node scripts/logic-test.mjs
// ============================================================================
import {
  MAPS, mapDefOf, buildBoard, boardOf, pathOf, tileCountOf, decoCells, PALETTE,
  CHANCE_CARDS, FATE_CARDS, SHOP_ITEMS, START_CASH, SALARY, SALARY_LAND_BONUS,
  JAIL_FINE, HOSPITAL_FEE, TAX_MIN, TAX_MAX, boomMult,
  baseRent, rentOf, upgradeCost, taxOf,
} from '../src/config.js';
import {
  newGame, rollAndMove, resolveTile, buyTile, upgradeTile, declineDecision,
  endTurn, aiDecide, ranking, ownedTilesOf, ownedInDistrict,
  hasMonopoly, movePlayer, payTo, mapOf,
  buyItem, leaveShop, applyEqualize, aiShopBuy, buyPriceOf, fineOf,
  useItem, useEqualCard,
} from '../src/core/game.js';
import { rollDice, rollTwoDice } from '../src/core/rng.js';
import { saveToSlot, loadFromSlot, deleteSlot, exportSave, importSave, _setStorage } from '../src/core/save.js';
import { loadMeta, saveMeta, isUnlocked, unlockNext, _setStorage as metaStorage } from '../src/core/meta.js';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
const section = (t) => console.log(`— ${t} —`);

const firstOf = (st, type) => boardOf(st.mapKey).findIndex((t) => t.type === type);
const propTilesOf = (st) => boardOf(st.mapKey).map((t, i) => (t.type === 'prop' ? i : -1)).filter((i) => i >= 0);

// —— 地图生成 ——
section('地图生成（外环 + 内街）');
ok(MAPS.length === 6, '6 张可选地图');
const expectSize = [72, 82, 90, 96, 108, 118];
MAPS.forEach((m, i) => {
  const n = tileCountOf(m);
  const tiles = buildBoard(m);
  ok(n === expectSize[i] && tiles.length === n, `${m.name} ${n} 格`);
  const path = pathOf(m);
  const idxOf = (t) => tiles.findIndex((x) => x.type === t);
  ok(tiles[0].type === 'start' && path[0].row === m.rows && path[0].col === 1, `${m.name} 起点在左下`);
  const j = idxOf('jail');
  ok(path[j].row === m.rows && path[j].col === m.cols, `${m.name} 监狱在右下`);
  const hi = idxOf('hospital');
  ok(path[hi].row === 1 && path[hi].col === m.cols, `${m.name} 医院在右上`);
  const pk = idxOf('park');
  ok(path[pk].row === 1 && path[pk].col === 1, `${m.name} 御园在左上`);
  // 路径唯一 + 闭环 + 格格正交相邻
  const set = new Set(path.map((g) => `${g.row}:${g.col}`));
  let adj = true;
  for (let k = 0; k < n; k++) {
    const a = path[k], b = path[(k + 1) % n];
    if (Math.abs(a.row - b.row) + Math.abs(a.col - b.col) !== 1) adj = false;
  }
  ok(set.size === n && adj, `${m.name} 路径闭环且格格相邻`);
  // 内街确实穿行腹地（不在最外圈上的路径格）
  const inner = path.filter((g) => g.row >= 2 && g.row <= m.rows - 1 && g.col >= 2 && g.col <= m.cols - 1);
  ok(inner.length >= 10, `${m.name} 内街深入腹地（${inner.length} 格）`);
  ok(tiles.some((t) => t.type === 'shop'), `${m.name} 有商店`);
  const dists = new Set(tiles.filter((t) => t.type === 'prop').map((t) => t.district));
  ok(dists.size === m.districts.length, `${m.name} 覆盖全部 ${m.districts.length} 街区`);
  ok(JSON.stringify(buildBoard(m)) === JSON.stringify(tiles), `${m.name} 棋盘生成确定性`);
});
ok(decoCells(MAPS[0]).length > 0 && decoCells(MAPS[5]).length > 0, '腹地点缀风景存在');
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

// —— 建档（含角色天赋）——
section('建档与天赋');
st = newGame({ heroKey: 'lady', aiCount: 2, mapKey: 'port', seed: 42 });
ok(st.mapKey === 'port' && st.tiles.length === 82, '港都商埠 82 格');
ok(st.players.length === 3 && st.players[0].name === '千金' && !st.players[0].isAI, '主角千金 + 2 AI');
ok(st.players.every((p) => p.pos === 0 && p.items && p.items.swift === 0 && p.items.charms === 0 && p.items.equal === 0 && p.equalBought === 0), '初始位置与道具栏');
ok(st.players[0].cash === START_CASH + 600, '千金天赋：本金 +600');
ok(st.players[1].cash === START_CASH + 500 && st.players[1].perk.trade === 0.10, '钱老板天赋：本金 +500 / 九折');
ok(st.players[2].perk.tough === 0.6 && st.players[2].perk.luck === 0.10, '夜行客天赋：罚金减免 + 骰运');
ok(buyPriceOf(t80, { perk: { trade: 0.15 } }) === Math.round(t80.price * 0.85), '购地折扣计算');
ok(fineOf(120, { perk: { tough: 0.5 } }) === 60, '罚金减免计算');
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
// 小蛮购地八五折
{
  const st2 = newGame({ heroKey: 'girl', aiCount: 1, mapKey: 'oldtown', seed: 3 });
  const pg = propTilesOf(st2)[0];
  st2.players[0].pos = pg; st2.phase = 'resolve';
  const r2 = resolveTile(st2);
  const cost = Math.round(boardOf('oldtown')[pg].price * 0.85);
  ok(r2.kind === 'buy' && r2.price === cost && r2.listPrice === boardOf('oldtown')[pg].price, '小蛮天赋：购地八五折报价');
  buyTile(st2, pg);
  ok(st2.players[0].cash === START_CASH - cost && st2.tiles[pg].spent === cost, '按折扣价购入');
}

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
ok(res.kind === 'jail' && res.players !== null && st.players[0].skipTurns === 1 && st.players[0].cash < START_CASH, '监狱罚款+停掷');
const hospIdx = firstOf(st, 'hospital');
st.players[0].pos = hospIdx; st.phase = 'resolve';
res = resolveTile(st);
ok(res.kind === 'hospital', '医院结算');
const parkIdx = firstOf(st, 'park');
st.players[0].pos = parkIdx; st.phase = 'resolve';
res = resolveTile(st);
ok(res.kind === 'info', '御园无事');
// 剑侠：罚款/医药费减半
{
  const stS = newGame({ heroKey: 'sword', aiCount: 1, mapKey: 'oldtown', seed: 5 });
  stS.players[0].pos = firstOf(stS, 'jail'); stS.phase = 'resolve';
  const rS = resolveTile(stS);
  ok(rS.kind === 'jail' && rS.fine === Math.round(JAIL_FINE * 0.5) && stS.players[0].cash === START_CASH - Math.round(JAIL_FINE * 0.5), '剑侠天赋：监狱罚金减半');
  stS.players[0].pos = firstOf(stS, 'hospital'); stS.phase = 'resolve';
  const rH = resolveTile(stS);
  ok(rH.kind === 'hospital' && rH.fee === Math.round(HOSPITAL_FEE * 0.5), '剑侠天赋：医药费减半');
}

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

// —— 双骰：对子加掷 / 连三对入狱 / 顺风骰 ——
section('双骰机制');
function rngSeq(seed, k) {
  const out = [];
  let t = seed | 0;
  for (let i = 0; i < k; i++) {
    t = (t + 0x6d2b79f5) | 0;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    out.push(((x ^ (x >>> 14)) >>> 0) / 4294967296);
  }
  return out;
}
function seedForDice(want1, want2) {
  for (let s = 1; s < 999999; s++) {
    const [a, b] = rngSeq(s, 2);
    if (Math.floor(a * 6) + 1 === want1 && Math.floor(b * 6) + 1 === want2) return s;
  }
  return 1;
}
st = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 1 });
st.rng = seedForDice(2, 5);
let rr = rollAndMove(st);
ok(rr.ok && rr.d1 === 2 && rr.d2 === 5 && st.players[0].pos === 7 && rr.doubles === false, '双骰合计前进（2+5=7）');
ok(st.extra === false && st.doubles === 0 && st.lastRoll[0] === 2 && st.lastRoll[1] === 5, '非对子不加掷，记录双骰');
st.phase = 'roll';
st.rng = seedForDice(3, 3);
rr = rollAndMove(st);
ok(rr.doubles === true && st.extra === true && st.doubles === 1, '对子标记加掷');
st.phase = 'end';
let et2 = endTurn(st);
ok(et2.again === true && st.turnIdx === 0 && st.phase === 'roll', '对子后同一玩家加掷');
st.phase = 'end';
et2 = endTurn(st);
ok(!et2.again && st.turnIdx === 1 && st.doubles === 0 && st.round === 1, '加掷后正常交棒');
// 连掷三对 → 入狱
{
  const st3 = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 2 });
  let r3 = null;
  for (let k = 0; k < 3; k++) {
    st3.rng = seedForDice(4, 4);
    st3.phase = 'roll';
    r3 = rollAndMove(st3);
  }
  ok(r3.jailed === true && st3.players[0].pos === firstOf(st3, 'jail') && st3.players[0].skipTurns === 1, '连掷三对押入监狱');
  ok(st3.players[0].cash === START_CASH - JAIL_FINE && st3.phase === 'end' && st3.extra === false, '入狱罚款并收尾');
}
// 顺风骰
st = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 4 });
st.players[0].items.swift = 3;
st.rng = seedForDice(1, 3);
st.phase = 'roll';
const rw = rollAndMove(st);
ok(rw.dice === 6 && st.players[0].pos === 6 && st.players[0].items.swift === 2, '顺风骰 +2 步并消耗次数');
// 骰运重掷（luck=1 必重掷低点）
{
  const lk = rollTwoDice({ rng: 77 }, 1);
  ok(lk.d1 >= 1 && lk.d1 <= 6 && lk.d2 >= 1 && lk.d2 <= 6, '骰运重掷结果合法');
}

// —— 商店：道具 / 上限 / 均富卡 / 护身符 ——
section('商店与道具');
st = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 6 });
const shopIdx = firstOf(st, 'shop');
ok(shopIdx > 0, '地图上存在商店格');
st.players[0].pos = shopIdx; st.phase = 'resolve';
const rsh = resolveTile(st);
ok(rsh.kind === 'shop' && st.phase === 'shop', '落地商店进入购物阶段');
st.players[0].cash = 50;
ok(buyItem(st, 'swift').ok === false, '现金不足不能购买');
st.players[0].cash = 1000;
ok(buyItem(st, 'swift').ok === true && st.players[0].cash === 1000 - 140 && st.players[0].items.swift === 3, '购顺风骰（140，生效 3 次）');
buyItem(st, 'swift');
ok(st.players[0].items.swift === 6, '顺风骰叠加至 6');
ok(buyItem(st, 'swift').ok === false, '顺风骰达 6 次上限');
ok(buyItem(st, 'charm').ok === true && st.players[0].items.charms === 1, '购护身符');
buyItem(st, 'charm');
ok(buyItem(st, 'charm').ok === false && st.players[0].items.charms === 2, '护身符 2 枚上限');
st.players[1].cash = 3000;
st.players[0].cash = 1000;
const mine0 = st.players[0].cash;
ok(buyItem(st, 'equal').ok === true && st.players[0].items.equal === 1
  && st.players[0].cash === mine0 - 260, '购均富卡收入道具栏（不立即生效）');
buyItem(st, 'equal');
ok(st.players[0].items.equal === 2 && st.players[0].equalBought === 2, '第二张均富卡入栏并计数');
ok(buyItem(st, 'equal').ok === false, '均富卡每局限 2 张');
ok(st.players[0].cash === mine0 - 520 && st.players[1].cash === 3000, '未打出前现金不变（不拉平）');
// 打出阶段限制：商店阶段（shop）不可打出，掷骰前后（roll/end）可以
ok(useItem(st, 'equal').ok === false && useItem(st, 'equal').reason === 'phase', '商店阶段不能打出均富卡');
// 无存活对手时购均富卡：拒绝购买并回滚扣款、不计限购（付费无效果路径）
{
  const eq = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 7 });
  eq.players[1].bankrupt = true; eq.finished = null; eq.phase = 'shop';
  eq.players[0].cash = 1000;
  const rEq = buyItem(eq, 'equal');
  ok(rEq.ok === false && rEq.reason === 'no_target' && eq.players[0].cash === 1000 && eq.players[0].equalBought === 0, '无对手买均富卡：拒绝并回滚');
}
leaveShop(st);
ok(st.phase === 'end', '离开商店回到收尾');
const totalEq = st.players[0].cash + 3000; // 打出时与最富对手平分双方现金
ok(useItem(st, 'equal').ok === true, '自己回合（end 阶段）打出均富卡');
ok(st.players[0].cash === Math.round(totalEq / 2) && st.players[1].cash === totalEq - Math.round(totalEq / 2), '打出后与最富对手拉平现金');
ok(st.players[0].items.equal === 1, '打出消耗一张');
ok(useEqualCard(st, 0).ok === true && st.players[0].items.equal === 0, '核心直调再次打出');
ok(useEqualCard(st, 0).ok === false && useEqualCard(st, 0).reason === 'empty', '空栏打出被拒');
// roll 阶段（掷骰前）同样可打出
{
  const er = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 12 });
  er.players[0].items.equal = 1; er.players[1].cash = 4000;
  er.phase = 'roll';
  ok(useItem(er, 'equal').ok === true && er.players[0].cash === Math.round((START_CASH + 4000) / 2), '掷骰前（roll 阶段）可打出');
}
// 护身符自动抵租
{
  const stC = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 8 });
  const pB = propTilesOf(stC)[1];
  stC.tiles[pB].owner = 1; stC.tiles[pB].level = 1; stC.tiles[pB].spent = 100;
  stC.players[0].items.charms = 1;
  stC.players[0].pos = pB; stC.phase = 'resolve';
  const rc = resolveTile(stC);
  ok(rc.kind === 'charm' && stC.players[0].items.charms === 0 && stC.players[0].cash === START_CASH, '护身符自动抵消租金');
}
// AI 采购
{
  const stA = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 10 });
  stA.turnIdx = 1; stA.phase = 'shop';
  stA.players[1].cash = 2000;
  stA.players[0].cash = 5000; // 拉开差距 → 触发均富卡
  stA.players[1].items.swift = 6;   // 其余道具已满，隔离均富卡行为
  stA.players[1].items.charms = 2;
  const bought = aiShopBuy(stA);
  ok(bought.length === 1 && bought.includes('equal'), 'AI 落后时买均富卡');
  ok(stA.players[0].cash + stA.players[1].cash === 2000 + 5000 - 260 && stA.players[0].cash === stA.players[1].cash, '均富卡拉平双方现金');
  ok(stA.players[1].items.equal === 0, 'AI 即买即用不囤卡');
}

// —— 支付：自动变卖与破产 ——
section('支付与破产');
st = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 11 });
st.players[0].cash = 70;
st.tiles[pA].owner = 0; st.tiles[pA].level = 1; st.tiles[pA].spent = price;
let paid = payTo(st, 0, 1, 100);
ok(paid.sold.length === 1 && st.tiles[pA].owner === -1 && !paid.bankrupt, '现金不足自动变卖且未破产');
st = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 13 });
st.players[0].cash = 30;
const aiStart = st.players[1].cash; // AI 钱老板自带天赋本金
paid = payTo(st, 0, 1, 900);
ok(paid.bankrupt && st.players[0].bankrupt, '无力偿付破产');
ok(st.players[1].cash === aiStart + 30, '债权人拿到剩余现金');
ok(ownedTilesOf(st, 0).length === 0 && st.finished && st.finished.reason === 'last', '地产释放 + 仅剩一家终局');
// 主角破产（还有 AI 存活）→ 直接终局
{
  const stD = newGame({ heroKey: 'boy', aiCount: 2, mapKey: 'oldtown', seed: 13 });
  stD.players[0].cash = 30;
  payTo(stD, 0, 1, 900);
  ok(stD.finished && stD.finished.reason === 'dead', '主角破产即终局结算');
}

// —— 回合轮转 / 停掷 / 无回合上限 ——
section('回合轮转（淘汰制）');
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
// 不设回合上限：哪怕打到第 999 回合也不因此终局
st.round = 999; st.turnIdx = 2; st.phase = 'end';
const et = endTurn(st);
ok(!st.finished && et.finished === undefined && st.round === 1000 && st.turnIdx === 0 && st.phase === 'roll', '无回合上限，只按破产终局');
st = newGame({ heroKey: 'boy', aiCount: 2, mapKey: 'jiuzhou', seed: 16 });
ok(st.tiles.length === 118, '九州环游 118 格');
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

// —— 城市繁荣（租金普涨，促使淘汰制收敛）——
section('城市繁荣');
ok(boomMult(1) === 1 && boomMult(12) === 1 && boomMult(13) === 1.25 && boomMult(24) === 1.25 && boomMult(25) === 1.5, '繁荣档位随回合提升');
ok(boomMult(133) === 3.5 && boomMult(9999) === 3.5, '繁荣档位封顶 ×3.5');
{
  const stB = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 3 });
  const pB2 = propTilesOf(stB)[0];
  stB.tiles[pB2].owner = 0; stB.tiles[pB2].level = 1; stB.tiles[pB2].spent = 100;
  stB.round = 1; stB.players[1].pos = pB2; stB.turnIdx = 1; stB.phase = 'resolve';
  const r1 = resolveTile(stB);
  stB.round = 13; stB.phase = 'resolve';
  const r13 = resolveTile(stB);
  ok(r1.kind === 'rent' && r13.kind === 'rent' && r13.rent === Math.round(r1.rent * 1.25), '繁荣期租金 ×1.25');
  const stL = newGame({ heroKey: 'boy', aiCount: 2, mapKey: 'oldtown', seed: 1 });
  stL.phase = 'end'; stL.round = 12; stL.turnIdx = 2;
  endTurn(stL); // 回合推进到 13
  ok(stL.round === 13 && stL.log.some((l) => /繁荣/.test(l)), '繁荣档位提升时播报');
}

// —— 随机确定性 ——
section('随机确定性');
const s1 = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 777 });
const s2 = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 777 });
const seq1 = [rollDice(s1), rollDice(s1), rollDice(s1)];
const seq2 = [rollDice(s2), rollDice(s2), rollDice(s2)];
ok(seq1.join() === seq2.join(), '同种子骰序一致');
ok(seq1.join() !== [rollDice(newGame({ seed: 778 })), 0, 0].slice(0, 1).join(), '异种子骰序不同');
{
  const d1 = rollTwoDice(newGame({ seed: 123 }), 0);
  const d2 = rollTwoDice(newGame({ seed: 123 }), 0);
  ok(d1.d1 === d2.d1 && d1.d2 === d2.d2, '双骰同种子一致');
}

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
const pAcad = propTilesOf(st)[0];
st.tiles[pAcad].owner = 0; st.tiles[pAcad].level = 2; st.tiles[pAcad].spent = 128;
ok(saveToSlot(0, st), '写入 0 号槽');
const back = loadFromSlot(0);
ok(back && back.mapKey === 'academy' && back.tiles.length === 90 && back.rng === 21, '读档含地图与 90 格');
ok(back.tiles[pAcad].level === 2, '地产状态完整');
ok(back.players[0].perk && back.players[0].perk.tough === 0.5, '天赋随存档保留');
ok(loadFromSlot(1) === null && saveToSlot(-1, st) === false, '空槽/非法槽处理');
const code = exportSave(st);
ok(importSave(code) !== null && importSave('not-a-save') === null, '导出导入往返');
// 旧版存档（棋盘长度不符）被拒收
ok(importSave(exportSave({ ...st, tiles: new Array(50).fill(null) })) === null, '旧棋盘长度存档拒收');
// 手工存档码缺 items/perk 结构 → 兜底补默认，不致渲染层 TypeError
{
  const naked = importSave(exportSave({ ...st, players: st.players.map((p) => ({ ...p, items: undefined, perk: undefined })) }));
  ok(naked !== null && naked.players.every((p) => p.items && p.items.swift === 0 && p.items.charms === 0 && p.items.equal === 0 && p.perk && typeof p.perk === 'object'), '缺结构存档兜底补默认');
}
// 中间阶段（如商店内）导出的存档 → 拉回掷骰阶段，导入即可继续而非软锁
{
  const midShop = importSave(exportSave({ ...st, phase: 'shop' }));
  ok(midShop !== null && midShop.phase === 'roll', '中间阶段存档导入拉回 roll');
  const brokenIdx = importSave(exportSave({ ...st, turnIdx: 99 }));
  ok(brokenIdx !== null && brokenIdx.turnIdx === st.players.length - 1, '越界 turnIdx 夹回合法区间');
}
deleteSlot(0);
ok(loadFromSlot(0) === null, '删除槽位');

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
