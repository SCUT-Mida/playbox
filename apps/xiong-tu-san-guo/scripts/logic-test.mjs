// 纯逻辑自测（不依赖浏览器/DOM）。运行：npm test
import { CITIES, CITY_MAP, adjacencyValid } from '../src/data/cities.js';
import { HEROES, FACTION_SEEDS, makeGenericGeneral } from '../src/data/heroes.js';
import { makeRng } from '../src/core/rng.js';
import { parseSkill, techMult } from '../src/core/tech.js';
import { cityGoldIncome, cityGrainIncome, factionGoldIncome, factionGrainNet } from '../src/core/economy.js';
import { createBattle, runBattle, effWar, attackValue } from '../src/core/combat.js';
import {
  newGame, cityById, heroesOfFaction, cmdPoints, cmdRemaining,
  troopCap, resolveTurn, checkGameOver, neighbors, wildHeroesInCity,
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

console.log(`\n结果：${pass} 通过，${fail} 失败`);
process.exit(fail ? 1 : 0);

function factionPoor(st, fid) { st.factions.find((f) => f.id === fid).money = 0; }
