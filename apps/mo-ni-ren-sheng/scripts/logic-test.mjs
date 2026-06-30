// ============================================================================
// 纯逻辑自测：不依赖浏览器，覆盖 config / player / events / save 各模块。
// 运行：node scripts/logic-test.mjs
// ============================================================================
import {
  clampAttr, ageYearsFromWeeks, stageForAge, ageLabel,
  ATTRS, STAGES, MAX_AGE_MIN, MAX_AGE_MAX,
} from '../src/config.js';
import {
  newPlayer, normalizeAttrs, applyChanges, isDead, stepTime, evaluateLife, ageYears,
} from '../src/core/player.js';
import { EVENTS, rollEvent, applyOption, ambientLine } from '../src/core/events.js';
import {
  _setStorage, saveGame, loadGame, hasSave, clearSave, exportSave, importSave,
} from '../src/core/save.js';
import { makeRng } from '../src/core/rng.js';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
// 确定性随机：依次返回数组元素，回绕
const seq = (arr) => makeRng(arr);
const r0 = () => 0;   // 恒为最小
const r1 = () => 0.999; // 恒为近最大

// ===================== config =====================
ok(clampAttr(-5) === 0, 'clampAttr 下界为 0');
ok(clampAttr(150) === 100, 'clampAttr 上界为 100');
ok(clampAttr(42.6) === 43, 'clampAttr 四舍五入');
ok(ageYearsFromWeeks(104) === 2, '104 周 = 2 岁');
ok(stageForAge(0).key === 'infant', '0 岁属婴儿期');
ok(stageForAge(5.9).key === 'infant', '5.9 岁仍属婴儿期');
ok(stageForAge(6).key === 'child', '6 岁进入学龄期');
ok(stageForAge(17.9).key === 'child', '17.9 岁仍属学龄期');
ok(stageForAge(18).key === 'adult', '18 岁进入成年期');
ok(stageForAge(64.9).key === 'adult', '64.9 岁仍属成年期');
ok(stageForAge(65).key === 'elder', '65 岁进入老年期');
ok(stageForAge(200).key === 'elder', '200 岁仍属老年期（末段兜底）');
ok(/个月/.test(ageLabel(20)) === true, '20 周（<1 岁）显示「个月」');
ok(/岁/.test(ageLabel(52 * 5)) === true, '5 岁显示「岁」');
ok(ATTRS.length === 5 && ATTRS.includes('health') && ATTRS.includes('social'), '五大属性齐全');
ok(STAGES.length === 4, '四个生命阶段');

// ===================== player =====================
let p = newPlayer(seq([0.5, 0.5, 0.5, 0.5, 0.5, 0.5]), { name: '张三丰', gender: 'male' });
ok(p.name === '张三丰', '姓名记录正确');
ok(p.name.length <= 8, '姓名长度受限');
ok(p.gender === 'male', '性别记录正确');
ok(p.weeks === 0 && p.turn === 0, '初始 weeks/turn 为 0');
ok(p.maxAge >= MAX_AGE_MIN && p.maxAge <= MAX_AGE_MAX, `大限在 [70,100]（实际 ${p.maxAge}）`);
ok(Object.keys(p.attrs).length === 5, '属性对象含五项');
ok(ATTRS.every((k) => p.attrs[k] >= 0 && p.attrs[k] <= 100), '初始属性均在 [0,100]');
ok(p.career === null && p.log.length === 0, '初始无职业、无大事记');

// newPlayer 姓名截断
const longName = newPlayer(r0, { name: '一二三四五六七八九十' });
ok(longName.name.length === 8, '超长姓名被截断为 8 字');

// applyChanges 钳制与实际增量
let p2 = newPlayer(r0, {});
p2.attrs.health = 98;
const d1 = applyChanges(p2, { health: 10, mood: -5, wealth: 0 });
ok(p2.attrs.health === 100, 'health 增益被钳制到 100');
ok(d1.health === 2, 'applyChanges 返回实际增量（+10→实际+2）');
ok(d1.mood === -5, 'mood 实际增量 -5');
ok(!('wealth' in d1), 'delta=0 不计入实际增量');
p2.attrs.mood = 3;
const d2 = applyChanges(p2, { mood: -10 });
ok(p2.attrs.mood === 0, 'mood 减益被钳制到 0');
ok(d2.mood === -3, 'mood 实际增量 -3');

// normalizeAttrs 补齐
const na = normalizeAttrs({ health: 200, intelligence: -5 });
ok(na.health === 100 && na.intelligence === 0, 'normalizeAttrs 钳制并补齐五项');
ok(na.social === 50, 'normalizeAttrs 缺失项默认 50');

// isDead
let p3 = newPlayer(r0, { maxAge: 80 });
p3.attrs.health = 0;
ok(isDead(p3) === true, '健康归零判定死亡');
p3.attrs.health = 50;
p3.weeks = 80 * 52;
ok(isDead(p3) === true, '达大限判定死亡');
p3.weeks = 70 * 52;
ok(isDead(p3) === false, '健康>0 且未达大限存活');

// stepTime：推进周数 + 回合 + 阶段跨越
let p4 = newPlayer(r0, {});
const beforeWeeks = p4.weeks;
const beforeTurn = p4.turn;
const infantStep = stageForAge(0).weeksPerTurn;
const step1 = stepTime(p4, r0);
ok(p4.weeks === beforeWeeks + infantStep, `婴儿期推进 ${infantStep} 周`);
ok(p4.turn === beforeTurn + 1, '回合数 +1');
ok(step1.drift && typeof step1.drift === 'object', 'stepTime 返回漂移对象');
ok(ATTRS.every((k) => p4.attrs[k] >= 0 && p4.attrs[k] <= 100), '漂移后属性仍在 [0,100]');

// 阶段跨越：从学龄期末（17.98 岁）推进一步应进入成年期
let p5 = newPlayer(r0, {});
p5.weeks = 17.98 * 52;       // 学龄期末，一步（26 周）即跨入成年
const beforeStage = stageForAge(ageYears(p5)).key;
const step2 = stepTime(p5, r0);
ok(beforeStage === 'child', '跨越前为学龄期');
ok(step2.stageChanged === true, '跨越成年阶段时 stageChanged=true');
ok(stageForAge(ageYears(p5)).key === 'adult', '跨越后进入成年期');
ok(p5.log.some((l) => /步入社会|告别校园/.test(l.text)), '阶段跨越写入里程碑大事记');

// evaluateLife：结构完整
let p6 = newPlayer(r0, { name: '李四', maxAge: 75 });
p6.attrs = { health: 20, intelligence: 90, wealth: 88, mood: 85, social: 60 };
p6.weeks = 75 * 52;
const life = evaluateLife(p6);
ok(life.name === '李四', '结算含姓名');
ok(typeof life.age === 'number' && life.age === 75, '结算含年龄');
ok(typeof life.cause === 'string' && life.cause.length > 0, '结算含死因');
ok(Array.isArray(life.tags) && life.tags.length >= 4, '结算含至少 4 个评价标签');
ok(typeof life.score === 'number', '结算含综合评分');
ok(life.grade && typeof life.grade.label === 'string', '结算含综合评级');
ok(typeof life.summary === 'string' && life.summary.length > 0, '结算含人生总结');
ok(life.attrs && ATTRS.every((k) => life.attrs[k] >= 0 && life.attrs[k] <= 100), '结算含属性快照');

// 评级随属性提升而上升
let p7 = newPlayer(r0, { maxAge: 95 });
p7.attrs = { health: 95, intelligence: 95, wealth: 95, mood: 95, social: 95 };
p7.weeks = 95 * 52;
const life7 = evaluateLife(p7);
ok(['传奇人生', '精彩一生'].includes(life7.grade.label), `高属性高寿 → 高评级（${life7.grade.label}）`);

// ===================== events =====================
ok(EVENTS.length >= 20, `事件池不少于 20 条（实际 ${EVENTS.length}）`);
// 每个事件至少 2 个选项，且有 stage 与 weight
ok(EVENTS.every((e) => Array.isArray(e.options) && e.options.length >= 2), '每个事件至少 2 个选项');
ok(EVENTS.every((e) => Array.isArray(e.stage) && e.stage.length >= 1), '每个事件都挂载到阶段');
ok(EVENTS.every((e) => e.weight > 0), '每个事件权重>0');

// rollEvent：各阶段都能抽到合法事件
for (const st of STAGES) {
  const pe = newPlayer(r0, {});
  // 把角色年龄拨到该阶段中段
  pe.weeks = Math.max(st.minAge + 1, (st.minAge + Math.min(st.maxAge === Infinity ? st.minAge + 10 : st.maxAge, 100)) / 2) * 52;
  const ev = rollEvent(pe, r0);
  ok(ev !== null, `${st.name}阶段能抽到事件`);
  if (ev) ok(ev.stage.includes(st.key), `${st.name}阶段抽到的事件确实挂载于该阶段`);
}

// rollEvent 尊重 cond：成年有职业时求职面试不出现（抽到的成年事件若 id=job_interview 则需 !career）
{
  const pe = newPlayer(r0, {});
  pe.career = '公职人员';
  pe.weeks = 30 * 52;
  // 多次抽取都不应返回 cond 不满足的 job_interview（成年 cond 类事件）
  for (let i = 0; i < 30; i++) {
    const ev = rollEvent(pe, seq([i / 30]));
    ok(!ev || ev.id !== 'job_interview', '已有职业时求职面试不出现');
  }
}

// applyOption：结婚选项设置 flags.married 并施加心情/社交增量
{
  const pe = newPlayer(r0, {});
  pe.weeks = 30 * 52;
  const ev = EVENTS.find((e) => e.id === 'marriage');
  const moodBefore = pe.attrs.mood;
  const res = applyOption(pe, ev.options[0], r0); // 勇敢步入婚姻
  ok(pe.flags.married === true, '结婚选项设置 flags.married=true');
  ok(pe.attrs.mood > moodBefore, '结婚选项提升心情');
  ok(typeof res.outcome === 'string', 'applyOption 返回结局文本');
}

// applyOption：求职选项据随机性设置职业
{
  const ev = EVENTS.find((e) => e.id === 'job_interview');
  // 随机=近1（0.999）→ 落选分支，无职业
  const peA = newPlayer(r0, {});
  peA.weeks = 22 * 52;
  applyOption(peA, ev.options[0], r1);
  ok(!peA.career, '求职大厂（随机=近1）落选 → 不设职业');
  // 随机=0 → 成功分支，设置职业
  const peB = newPlayer(r0, {});
  peB.weeks = 22 * 52;
  applyOption(peB, ev.options[0], r0);
  ok(peB.career === '大厂白领', '求职大厂（随机=0）成功 → 设置职业「大厂白领」');
}

// ambientLine 返回非空字符串
{
  const pe = newPlayer(r0, {});
  ok(typeof ambientLine(pe, r0) === 'string' && ambientLine(pe, r0).length > 0, 'ambientLine 返回日常旁白');
}

// ===================== save =====================
// 注入内存版 storage
function memStorage() {
  const m = {};
  return {
    getItem: (k) => (k in m ? m[k] : null),
    setItem: (k, v) => { m[k] = String(v); },
    removeItem: (k) => { delete m[k]; },
  };
}
_setStorage(memStorage());
ok(hasSave() === false, '注入空存储后无存档');
const toSave = newPlayer(r0, { name: '王五', gender: 'female' });
toSave.weeks = 30 * 52;
toSave.attrs.wealth = 77;
ok(saveGame(toSave) === true, 'saveGame 成功');
ok(hasSave() === true, '保存后 hasSave=true');
const loaded = loadGame();
ok(loaded !== null, 'loadGame 返回非空');
ok(loaded.name === '王五' && loaded.gender === 'female', '读档姓名/性别一致');
ok(loaded.weeks === 30 * 52 && loaded.attrs.wealth === 77, '读档进度/属性一致');

// migrate：损坏字段被钳制修复
{
  _setStorage(memStorage());
  const bad = { name: '坏档', weeks: -10, turn: -3, maxAge: 30, attrs: { health: 999 }, gender: '??', career: 123 };
  saveGame(bad);
  const fixed = loadGame();
  ok(fixed.weeks === 0 && fixed.turn === 0, 'migrate 修复负数 weeks/turn');
  ok(fixed.maxAge === MAX_AGE_MIN, 'migrate 把过小 maxAge 钳到下限');
  ok(fixed.attrs.health === 100, 'migrate 钳制越界 health');
  ok(ATTRS.every((k) => Number.isFinite(fixed.attrs[k])), 'migrate 补齐全部五项属性');
  ok(fixed.gender === 'male', 'migrate 规范化非法 gender');
  ok(fixed.career === null, 'migrate 规范化非法 career');
  ok(Array.isArray(fixed.log) && typeof fixed.flags === 'object', 'migrate 补齐 log/flags');
}

// 导入导出往返
{
  _setStorage(memStorage());
  const orig = newPlayer(seq([0.3, 0.3, 0.3, 0.3, 0.3, 0.3]), { name: '赵六' });
  orig.weeks = 40 * 52;
  orig.flags.married = true;
  const str = exportSave(orig);
  ok(typeof str === 'string' && str.length > 0, 'exportSave 生成字符串');
  const back = importSave(str);
  ok(back !== null, 'importSave 解析成功');
  ok(back.name === '赵六' && back.weeks === 40 * 52 && back.flags.married === true, '导入后字段一致');
  ok(importSave('!!!not-base64!!!') === null, '非法导入串返回 null');
}

// clearSave
{
  _setStorage(memStorage());
  saveGame(newPlayer(r0, { name: '临时' }));
  ok(hasSave() === true, '存档存在');
  clearSave();
  ok(hasSave() === false, 'clearSave 后存档消失');
}

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
