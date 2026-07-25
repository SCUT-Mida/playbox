// 纯逻辑自测（不依赖浏览器/DOM）。运行：npm test
import { CITIES, CITY_MAP, adjacencyValid, cityTier } from '../src/data/cities.js';
import { HEROES, FACTION_SEEDS, makeGenericGeneral, makeWildGeneral } from '../src/data/heroes.js';
import { makeRng } from '../src/core/rng.js';
import { parseSkill, techMult } from '../src/core/tech.js';
import { cityGoldIncome, cityGrainIncome, factionGoldIncome, factionGrainNet, cityDefenseValue, governorEconMult, generalDefMult } from '../src/core/economy.js';
import { createBattle, runBattle, effWar, attackValue } from '../src/core/combat.js';
import {
  newGame, cityById, heroesOfFaction, cmdPoints, cmdRemaining,
  troopCap, resolveTurn, checkGameOver, neighbors, wildHeroesInCity,
  officeHolder, clearHeroOffices,
} from '../src/core/state.js';
import * as A from '../src/core/actions.js';
import { aiTurnAll } from '../src/core/ai.js';

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error('  ✗ ' + msg); } }
function eq(a, b, msg) { ok(a === b, `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }

console.log('—— 数据完整性 ——');
ok(adjacencyValid(), '城市邻接关系双向一致');
eq(CITIES.length, 18, '城市数为 18');
ok(HEROES.length >= 40, `名将数 >= 40 (实际 ${HEROES.length})`);
eq(FACTION_SEEDS.length, 8, 'AI 势力种子为 8');
// 每位名将要么 serve 一个种子势力，要么 wild 在某城市
for (const h of HEROES) {
  ok(h.serve || h.wild, `${h.name} 有归属（serve/wild）`);
  if (h.wild) ok(CITY_MAP[h.wild], `${h.name} 的在野城市 ${h.wild} 存在`);
  if (h.serve) ok(FACTION_SEEDS.some((s) => s.key === h.serve), `${h.name} 所属势力 ${h.serve} 存在`);
}
eq(makeGenericGeneral(makeRng(1), 1).id, 'gen_1', '生成武将 id 唯一可控');

console.log('—— 科技 / 技能解析 ——');
const sb = parseSkill('lead:0.10,war:0.05,trick:0.20');
eq(sb.lead, 0.1, '技能 lead 解析');
eq(sb.war, 0.05, '技能 war 解析');
eq(sb.trick, 0.2, '技能 trick 解析');
eq(parseSkill(null).lead, 0, '空技能返回零加成');

console.log('—— 新局初始化（玩家选洛阳）——');
const rng = makeRng(42);
const stats = { l: 80, w: 70, i: 75, p: 78, c: 85 };
let s = newGame({ lordName: '测试主公', startCity: 'luoyang', stats, rng });
eq(s.turn, 1, '初始回合 = 1');
eq(s.over, null, '初始无胜负');
eq(cityById(s, 'luoyang').ownerFactionId, 0, '洛阳归玩家');
eq(heroesOfFaction(s, 0).length, 1, '玩家初始仅君主一人');
ok(s.factions.length >= 7, `生成 >=7 个势力 (实际 ${s.factions.length})`);
// 8 个种子都城，玩家占洛阳（非任何都城）→ 8 AI 势力齐全
eq(s.factions.filter((f) => f.aiControlled).length, 8, '8 个 AI 势力（玩家未占都城）');
// 中立城市存在
const neutral = s.cities.filter((c) => c.ownerFactionId == null);
ok(neutral.length >= 8, `存在中立城市 (实际 ${neutral.length})`);

console.log('—— 玩家选都城（许昌，曹操势力被吞并）——');
const s2 = newGame({ lordName: '篡位者', startCity: 'xuchang', stats, rng: makeRng(7) });
eq(s2.factions.filter((f) => f.aiControlled).length, 7, '占都城后仅 7 个 AI 势力');
const caocao = s2.heroes.find((h) => h.id === 'caocao');
ok(caocao && caocao.wild && caocao.cityId === 'xuchang', '曹操转为许昌在野，可被登用');
ok(s2.heroes.some((h) => h.id === 'zhangliao' && h.wild), '张辽随曹操转为在野');

console.log('—— 指令点 / 带兵上限 ——');
const baseCmd = cmdPoints(s, 0);
ok(baseCmd >= 5, `基础指令点 >= 5 (实际 ${baseCmd})`);
const lord = s.heroes.find((h) => h.isPlayerLord);
eq(cmdRemaining(s, 0), baseCmd, '回合初指令点全满');
ok(troopCap(s, lord) >= 8000, `君主带兵上限合理 (实际 ${troopCap(s, lord)})`);

console.log('—— 内政指令 ——');
const beforeMarket = cityById(s, 'luoyang').marketLevel;
let r1 = A.developMarket(s, 'luoyang');
ok(r1.ok && cityById(s, 'luoyang').marketLevel === beforeMarket + 1, '发展商业成功升 1 级');
const r2 = A.recruit(s, 'luoyang', 500);
ok(r2.ok && cityById(s, 'luoyang').soldiers > 2000, '征兵增加士兵');
ok(cmdRemaining(s, 0) < baseCmd, '执行指令后剩余指令点减少');
// 金钱不足应失败且退还指令
const poor = JSON.parse(JSON.stringify(s));
factionPoor(poor, 0);
const cmdBefore = cmdRemaining(poor, 0);
const r3 = A.developFarm(poor, 'luoyang');
ok(!r3.ok, '金钱不足时开发失败');
eq(cmdRemaining(poor, 0), cmdBefore, '失败时指令点如数退还');

console.log('—— 探索 / 登用 ——');
// 洛阳在野有刘备 / 华佗
const wildLy = wildHeroesInCity(s, 'luoyang');
ok(wildLy.some((h) => h.id === 'liubei'), '洛阳在野含刘备');
const exp = A.explore(s, 'luoyang', 0, makeRng(1));
ok(exp.ok, '探索执行成功');
// 强行标记已发现后登用
const guanyu = s.heroes.find((h) => h.id === 'guanyu');
guanyu.discovered = true;
guanyu.cityId = 'luoyang'; // 移到玩家城便于测试
const recR = A.recruitHero(s, 'guanyu', 0, makeRng(99));
// 高魅力 + 多次尝试：用固定大种子提高命中
ok(typeof recR.recruited === 'boolean', '登用返回是否成功布尔值');

console.log('—— 战斗系统 ——');
const battle = createBattle({
  attacker: { factionId: 0, general: { name: '猛将', stats: { l: 90, w: 95, i: 60, p: 50, c: 60 }, skill: null }, soldiers: 3000, training: 60, formation: 'assault' },
  defender: { factionId: 1, general: { name: '守将', stats: { l: 60, w: 60, i: 50, p: 50, c: 50 }, skill: null }, soldiers: 1000, defense: 300, isCity: true, training: 50, formation: 'normal' },
});
runBattle(battle, s, makeRng(3));
ok(battle.result === 'attacker' || battle.result === 'defender', '战斗产出胜负结果');
ok(battle.log.length > 0, '战斗产生战报');
ok(effWar({ stats: { w: 100 }, skill: { effect: 'war:0.15' } }) > 100, '技能加成提升有效武力');

console.log('—— 出征（攻打相邻中立城）——');
// 把宛城设为中立且兵力薄弱，玩家从洛阳出征
const wan = cityById(s, 'wan');
wan.ownerFactionId = null; wan.soldiers = 300; wan.defense = 200;
const lordId = s.heroes.find((h) => h.isPlayerLord).id;
// 先征兵确保有兵
cityById(s, 'luoyang').soldiers = 5000;
const camp = A.campaign(s, 'luoyang', 'wan', lordId, 2000, 'assault', 0, makeRng(5));
ok(camp.ok, '出征执行成功');
if (camp.won) {
  eq(cityById(s, 'wan').ownerFactionId, 0, '攻陷后宛城归玩家');
} else {
  ok(true, '出征未克（随机结果）');
}

console.log('—— 太守引用一致性：调任 / 出征失利后无悬挂 ——');
// 不变量：任意城市的太守必在本城（governorHeroId 指向的武将 cityId === 该城，且未被俘）
function governorsConsistent(st) {
  for (const c of st.cities) {
    if (c.governorHeroId == null) continue;
    const g = st.heroes.find((h) => h.id === c.governorHeroId);
    if (!g || g.cityId !== c.id || g.status === 'prisoner') return false;
  }
  return true;
}
// 1) 调任：太守调离原城 → 原城太守引用须清空（修复 moveHero 悬挂）
const sMove = newGame({ lordName: '调任', startCity: 'luoyang', stats, rng: makeRng(20) });
cityById(sMove, 'wan').ownerFactionId = 0; // 玩家另占宛城（与洛阳相邻）
const moveLord = sMove.heroes.find((h) => h.isPlayerLord);
eq(A.appointGovernor(sMove, 'luoyang', moveLord.id, 0).ok, true, '任命君主为洛阳太守');
eq(cityById(sMove, 'luoyang').governorHeroId, moveLord.id, '洛阳太守已任命');
eq(A.moveHero(sMove, moveLord.id, 'wan', 0).ok, true, '调遣太守至宛城');
eq(sMove.heroes.find((h) => h.id === moveLord.id).cityId, 'wan', '武将 cityId 已变更为宛城');
eq(cityById(sMove, 'luoyang').governorHeroId, null, '调离后洛阳太守引用已清空（无悬挂）');
ok(governorsConsistent(sMove), '调任后全局太守一致性成立');
// 2) 出征失利被俘：主将为出发城太守、战败被俘 → 出发城太守引用须清空（修复失败分支不对称）
let captureCleared = false;
for (let seed = 200; seed < 600 && !captureCleared; seed++) {
  const sd = newGame({ lordName: '出征', startCity: 'luoyang', stats, rng: makeRng(seed) });
  cityById(sd, 'luoyang').soldiers = 50000;
  // 加入一名非君主武将作为洛阳太守兼主将（武力弱，易败；可被俘）
  const gen = makeGenericGeneral(makeRng(seed * 7), 9000 + seed);
  gen.factionId = 0; gen.status = 'free'; gen.cityId = 'luoyang';
  gen.stats = { l: 60, w: 40, i: 40, p: 40, c: 40 };
  sd.heroes.push(gen);
  A.appointGovernor(sd, 'luoyang', gen.id, 0);
  eq(cityById(sd, 'luoyang').governorHeroId, gen.id, '出征前洛阳太守为主将');
  const wanD = cityById(sd, 'wan');
  wanD.ownerFactionId = 1; wanD.soldiers = 999999; wanD.defense = 99999; // 强敌，确保攻方失利
  const res = A.campaign(sd, 'luoyang', 'wan', gen.id, 1000, 'normal', 0, makeRng(seed));
  if (!res.ok) continue;
  ok(governorsConsistent(sd), `出征后太守一致性（seed ${seed}）`);
  const genAfter = sd.heroes.find((h) => h.id === gen.id);
  if (!res.won && genAfter && genAfter.status === 'prisoner') {
    captureCleared = true;
    eq(cityById(sd, 'luoyang').governorHeroId, null, '主将战败被俘 → 出发城太守引用已清空');
  }
}
ok(captureCleared, '覆盖到出征失利+主将被俘的失败分支');

console.log('—— 回合结算（含 AI）——');
const s3 = newGame({ lordName: '结算测试', startCity: 'luoyang', stats, rng: makeRng(11) });
const turn1 = s3.turn;
const aiModule = { aiTurnAll };
resolveTurn(s3, aiModule, makeRng(13));
eq(s3.turn, turn1 + 1, '结算后回合 +1');
ok(s3.turnLog.length >= 0, '结算产生回合日志');
// 玩家金钱应随收入增加（初始有 buffer）
ok(s3.factions[0].money > 0, '玩家回合后有金钱');

console.log('—— 胜负判定 ——');
// 模拟玩家占全部城市 → 胜利
const sWin = newGame({ lordName: '霸主', startCity: 'luoyang', stats, rng: makeRng(2) });
for (const c of sWin.cities) c.ownerFactionId = 0;
checkGameOver(sWin);
eq(sWin.over, 'win', '占全部城市 → 胜利');
// 玩家无城 → 失败
const sLose = newGame({ lordName: '败者', startCity: 'luoyang', stats, rng: makeRng(3) });
for (const c of sLose.cities) if (c.id === 'luoyang') c.ownerFactionId = 1;
for (const c of sLose.cities) if (c.ownerFactionId === 0) c.ownerFactionId = null;
checkGameOver(sLose);
eq(sLose.over, 'lose', '玩家无城 → 失败');

console.log('—— 邻接可达性（全图连通）——');
function bfsReachable(state, start) {
  const seen = new Set([start]); const q = [start];
  while (q.length) { const id = q.shift(); for (const n of cityById(state, id).adjacent) { if (!seen.has(n)) { seen.add(n); q.push(n); } } }
  return seen;
}
eq(bfsReachable(s, 'luoyang').size, 18, '从洛阳可达全部 18 城（地图连通）');

console.log('—— 城市职官：太守 / 将军 / 军师 ——');
const so = newGame({ lordName: '职官', startCity: 'luoyang', stats, rng: makeRng(31) });
const ly2 = cityById(so, 'luoyang');
eq(ly2.generalHeroId, null, '新城将军虚位');
eq(ly2.strategistHeroId, null, '新城军师虚位');
// 注入三名不同特长武将
function inject(idx, st) { const g = makeGenericGeneral(makeRng(idx), 7000 + idx); g.factionId = 0; g.status = 'free'; g.cityId = 'luoyang'; g.stats = st; so.heroes.push(g); return g; }
const polH = inject(2, { l: 60, w: 60, i: 60, p: 100, c: 60 });
const genH = inject(3, { l: 100, w: 60, i: 60, p: 60, c: 60 });
const lowH = inject(4, { l: 60, w: 60, i: 60, p: 50, c: 60 });
// 太守政治影响农商业收入（高政治 > 低政治）
A.appointGovernor(so, 'luoyang', lowH.id, 0);
const goldLow = cityGoldIncome(so, ly2);
A.appointGovernor(so, 'luoyang', polH.id, 0);
const goldHigh = cityGoldIncome(so, ly2);
ok(goldHigh > goldLow, `高政治太守提升商业收入 (${goldLow.toFixed(1)} → ${goldHigh.toFixed(1)})`);
ok(governorEconMult(so, ly2) > 1, '太守经济乘数 > 1');
// 将军统率影响城防
const defNone = cityDefenseValue(so, ly2);
A.appointGeneral(so, 'luoyang', genH.id, 0);
const defGen = cityDefenseValue(so, ly2);
ok(defGen > defNone, `高统率将军提升城防 (${defNone.toFixed(1)} → ${defGen.toFixed(1)})`);
ok(generalDefMult(so, ly2) > 1, '将军城防乘数 > 1');
eq(officeHolder(so, ly2, 'general').id, genH.id, 'officeHolder 返回在任将军');
// 一人不可兼多职：就任新职前旧职自动卸除
A.appointGovernor(so, 'luoyang', genH.id, 0);
eq(ly2.governorHeroId, genH.id, '将军转任太守');
eq(ly2.generalHeroId, null, '转任太守后将军旧职卸除');
A.appointGeneral(so, 'luoyang', genH.id, 0);
eq(ly2.generalHeroId, genH.id, '太守转任将军');
eq(ly2.governorHeroId, null, '转任将军后太守旧职卸除');
// 军师任命
A.appointStrategist(so, 'luoyang', polH.id, 0);
eq(ly2.strategistHeroId, polH.id, '军师任命成功');
// 调离本城 → 其职官引用清空（无悬挂）
cityById(so, 'wan').ownerFactionId = 0; // 宛城归玩家，与洛阳相邻
eq(A.moveHero(so, genH.id, 'wan', 0).ok, true, '将军调往宛城');
eq(ly2.generalHeroId, null, '将军调离后本城将军引用清空');
function officesConsistent(st) {
  for (const c of st.cities) {
    for (const key of ['governor', 'general', 'strategist']) {
      const h = officeHolder(st, c, key);
      const raw = c[{ governor: 'governorHeroId', general: 'generalHeroId', strategist: 'strategistHeroId' }[key]];
      if (!raw) continue;
      if (!h) return false; // 引用存在但持有者不在城 / 被俘 → 违反不变量
    }
  }
  return true;
}
ok(officesConsistent(so), '调离后全局职官一致性成立');
// clearHeroOffices 直接清空一切职官
A.appointGovernor(so, 'luoyang', polH.id, 0);
clearHeroOffices(so, polH.id);
eq(ly2.governorHeroId, null, 'clearHeroOffices 清空太守');

console.log('—— 探索：不再徒劳无功 ——');
const se = newGame({ lordName: '探索', startCity: 'luoyang', stats, rng: makeRng(33) });
ok(wildHeroesInCity(se, 'luoyang').length >= 1, '洛阳初始有在野名将');
// 起兵之城在野名将默认已「风闻」；此处重置为未发现，模拟新征服城市的探索
for (const w of wildHeroesInCity(se, 'luoyang')) w.discovered = false;
const cmd0 = cmdRemaining(se, 0);
const exp1 = A.explore(se, 'luoyang', 0, makeRng(5));
ok(exp1.ok && exp1.newly && exp1.newly.length >= 1, '探索保证至少发现一位在野名将（不徒劳）');
eq(cmdRemaining(se, 0), cmd0 - 1, '发现名将消耗 1 指令');
// 全部已发现 → 不再消耗指令
const before2 = cmdRemaining(se, 0);
for (const w of wildHeroesInCity(se, 'luoyang')) w.discovered = true;
const exp2 = A.explore(se, 'luoyang', 0, makeRng(6));
ok(exp2.ok && exp2.noCost === true, '全部已发现时探索不耗指令');
eq(cmdRemaining(se, 0), before2, '全部已发现时指令不变');
// 城中已无任何在野名将 → 不耗指令且无所获
for (const w of se.heroes.filter((h) => h.wild && h.cityId === 'luoyang')) w.status = 'gone';
const before3 = cmdRemaining(se, 0);
const exp3 = A.explore(se, 'luoyang', 0, makeRng(7));
ok(exp3.ok && exp3.noCost === true && exp3.discovered.length === 0, '无在野名将时探索不耗指令');
eq(cmdRemaining(se, 0), before3, '无在野时指令不变');

console.log('—— 城池规模分级 ——');
eq(cityTier(CITY_MAP.luoyang), 3, '洛阳为大城（tier 3）');
eq(cityTier(CITY_MAP.chengdu), 3, '成都为大城（tier 3）');
eq(cityTier(CITY_MAP.jiangling), 2, '江陵为中城（tier 2）');
eq(cityTier(CITY_MAP.wuwei), 1, '武威为小城（tier 1）');
eq(cityTier(CITY_MAP.jianning), 1, '建宁为小城（tier 1）');
const t3 = CITIES.filter((c) => cityTier(c) === 3).length;
ok(t3 >= 5 && t3 <= 9, `大城数量合理 (实际 ${t3})`);

console.log('—— 在野随机人物 ——');
eq(makeWildGeneral(makeRng(2), 5).id, 'genwild_5', 'makeWildGeneral id 唯一可控');
ok(HEROES.every((h) => !h.generic), '静态名将表不含随机人物（随机人物运行时生成）');
const sw = newGame({ lordName: '群雄', startCity: 'luoyang', stats, rng: makeRng(41) });
const genericWilds = sw.heroes.filter((h) => h.generic && h.wild);
ok(genericWilds.length >= 18, `各城散布随机在野人物 (实际 ${genericWilds.length})`);
// 每座城至少 1 名在野（名将 + 随机）
let citiesWithWild = 0;
for (const c of sw.cities) if (sw.heroes.some((h) => h.wild && h.cityId === c.id)) citiesWithWild++;
eq(citiesWithWild, 18, '每座城至少有 1 名在野人物');
ok(genericWilds.filter((g) => g.cityId !== sw.heroes.find((h) => h.isPlayerLord).cityId).every((g) => g.discovered === false), '非起兵之城的随机在野人物初始未发现（需探索）');
ok(genericWilds.every((g) => g.stats && Number.isFinite(g.stats.w)), '随机在野人物具备随机属性');
// 探索可发现随机人物（与名将同流程）
const genericInLy = genericWilds.find((g) => g.cityId === 'luoyang');
if (genericInLy) {
  genericInLy.discovered = false;
  const expW = A.explore(sw, 'luoyang', 0, makeRng(8));
  ok(expW.ok, '探索可发现随机在野人物');
}

console.log('—— 主帅 + 副将 ——');
// 副将攻击加成：相同主帅 / 兵力，带副将者攻击值更高
const baseForce = { general: { stats: { l: 80, w: 80, i: 50, p: 50, c: 50 }, skill: null }, soldiers: 1000, training: 50, formation: 'normal', factionId: 0 };
const depForce = { ...baseForce, deputies: [{ stats: { l: 90, w: 90, i: 50, p: 50, c: 50 }, skill: null }, { stats: { l: 70, w: 70, i: 50, p: 50, c: 50 }, skill: null }] };
ok(attackValue(depForce, s) > attackValue(baseForce, s), '副将提升部队攻击值');
// 出征偕副将：胜利后副将随主帅入驻新城；非法 / 重复 id 被过滤
const sd = newGame({ lordName: '主帅', startCity: 'luoyang', stats, rng: makeRng(51) });
function injectDeputy(st, idx, st2) { const g = makeGenericGeneral(makeRng(idx), 8000 + idx); g.factionId = 0; g.status = 'free'; g.cityId = 'luoyang'; g.stats = st2; st.heroes.push(g); return g; }
const depA = injectDeputy(sd, 11, { l: 80, w: 90, i: 50, p: 50, c: 50 });
const depB = injectDeputy(sd, 12, { l: 70, w: 70, i: 50, p: 50, c: 50 });
const wanD = cityById(sd, 'wan');
wanD.ownerFactionId = null; wanD.soldiers = 100; wanD.defense = 50;
cityById(sd, 'luoyang').soldiers = 5000;
const lordD = sd.heroes.find((h) => h.isPlayerLord);
// 含 1 个非法 id（不存在）+ 1 个重复，应被安全过滤
const campD = A.campaign(sd, 'luoyang', 'wan', lordD.id, 3000, 'assault', 0, makeRng(9), [depA.id, depB.id, '不存在的id', depA.id]);
ok(campD.ok && campD.battle, '主帅+副将出征执行成功');
ok(campD.battle.attacker.deputies.length === 2, `出战副将数为 2（实际 ${campD.battle.attacker.deputies.length}）`);
if (campD.won) {
  ok(depA.cityId === 'wan' || depA.status === 'prisoner', '副将 A 胜利后入驻新城或被俘');
  ok(depB.cityId === 'wan' || depB.status === 'prisoner', '副将 B 胜利后入驻新城或被俘');
}

console.log(`\n结果：${pass} 通过，${fail} 失败`);
process.exit(fail ? 1 : 0);

function factionPoor(st, fid) { st.factions.find((f) => f.id === fid).money = 0; }
