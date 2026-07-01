// ============================================================================
// 纯逻辑自测：不依赖浏览器，覆盖 config / player / events / save 各模块。
// 运行：node scripts/logic-test.mjs
// ============================================================================
import {
  clampAttr, ageYearsFromWeeks, stageForAge, ageLabel, stepLabel,
  ATTRS, STAGES, MAX_AGE_MIN, MAX_AGE_MAX, WEEKS_PER_YEAR, WEEKS_PER_MONTH,
  RECENT_EVENT_COOLDOWN,
} from '../src/config.js';
import {
  newPlayer, normalizeAttrs, applyChanges, isDead, stepTime, evaluateLife, ageYears,
  clonePlayer,
} from '../src/core/player.js';
import { EVENTS, rollEvent, applyOption, ambientLine, resetRecent } from '../src/core/events.js';
import {
  _setStorage, saveToSlot, loadFromSlot, deleteSlot, listSaves, hasAnySave, latestSlot,
  exportSave, importSave, SAVE_SLOTS,
} from '../src/core/save.js';
import {
  defaultAutoPlay, normalizeAutoPlay, pickOption, AUTO_POLICIES,
} from '../src/core/autoplay.js';
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
// 整除历法：4 周 = 1 个月，12 个月 = 1 年（48 周/年），周/月/年可精确互化。
ok(WEEKS_PER_MONTH === 4 && WEEKS_PER_YEAR === 48, '时间模型为 4 周/月、48 周/年');
ok(ageYearsFromWeeks(WEEKS_PER_YEAR) === 1, '48 周 = 1 岁');
ok(ageYearsFromWeeks(2 * WEEKS_PER_YEAR) === 2, '96 周 = 2 岁');
ok(stageForAge(0).key === 'infant', '0 岁属婴儿期');
ok(stageForAge(5.9).key === 'infant', '5.9 岁仍属婴儿期');
ok(stageForAge(6).key === 'child', '6 岁进入学龄期');
ok(stageForAge(17.9).key === 'child', '17.9 岁仍属学龄期');
ok(stageForAge(18).key === 'adult', '18 岁进入成年期');
ok(stageForAge(64.9).key === 'adult', '64.9 岁仍属成年期');
ok(stageForAge(65).key === 'elder', '65 岁进入老年期');
ok(stageForAge(200).key === 'elder', '200 岁仍属老年期（末段兜底）');
// 年龄展示精确到月：20 周 = 5 个月；含剩余月份显示「X 岁 Y 个月」。
ok(/个月/.test(ageLabel(20)) === true && ageLabel(20) === '5 个月', '20 周（<1 岁）显示「5 个月」');
ok(/岁/.test(ageLabel(WEEKS_PER_YEAR * 5)) === true, '5 岁显示「岁」');
ok(ageLabel(WEEKS_PER_YEAR * 3 + WEEKS_PER_MONTH * 6) === '3 岁 6 个月', '3 岁 6 个月精确显示');
// 各阶段步长均为整月（4 的倍数）。
ok(STAGES.every((s) => s.weeksPerTurn % WEEKS_PER_MONTH === 0), '各阶段步长为整月倍数');
// 月度周期：每周目统一推进 1 个月（4 周），呼应「一个月一个周期」。
ok(STAGES.every((s) => s.weeksPerTurn === WEEKS_PER_MONTH), '各阶段步长统一为 1 个月（4 周）');
ok(stepLabel && /个月|年/.test(stepLabel(WEEKS_PER_MONTH)), 'stepLabel 标注月度步长');
ok(Number.isInteger(RECENT_EVENT_COOLDOWN) && RECENT_EVENT_COOLDOWN > 0, '事件去重冷却常数为正整数');
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
// 出身字段持久化（默认「寻常人家」），影响后续可触发事件。
ok(p.background === 'ordinary', '默认出身为「寻常人家」');
const pScholar = newPlayer(r0, { background: 'scholar' });
ok(pScholar.background === 'scholar', '可指定出身并记录');
ok(Array.isArray(p.recent) && p.recent.length === 0, '初始去重记录为空数组');
ok(p.autoplay && p.autoplay.enabled === false, '初始挂机默认关闭');
// clonePlayer 深拷贝：互不影响
const cClone = clonePlayer(p);
cClone.attrs.health = 1; cClone.recent.push('x');
ok(p.attrs.health !== 1 && p.recent.length === 0, 'clonePlayer 深拷贝互不影响');

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
p3.weeks = 80 * WEEKS_PER_YEAR;
ok(isDead(p3) === true, '达大限判定死亡');
p3.weeks = 70 * WEEKS_PER_YEAR;
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
p5.weeks = 17.98 * WEEKS_PER_YEAR;       // 学龄期末，一步（16 周）即跨入成年
const beforeStage = stageForAge(ageYears(p5)).key;
const step2 = stepTime(p5, r0);
ok(beforeStage === 'child', '跨越前为学龄期');
ok(step2.stageChanged === true, '跨越成年阶段时 stageChanged=true');
ok(stageForAge(ageYears(p5)).key === 'adult', '跨越后进入成年期');
// Bug 修复：里程碑文案由 UI 层（pushLog）统一产出，stepTime 不再直接写 p.log，
// 否则与 UI 各写一次会造成「继续游戏」时里程碑重复。
ok(p5.log.length === 0, '阶段跨越后 stepTime 不直接写里程碑日志（交由 UI 层统一产出）');

// evaluateLife：结构完整
let p6 = newPlayer(r0, { name: '李四', maxAge: 75 });
p6.attrs = { health: 20, intelligence: 90, wealth: 88, mood: 85, social: 60 };
p6.weeks = 75 * WEEKS_PER_YEAR;
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
p7.weeks = 95 * WEEKS_PER_YEAR;
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
  pe.weeks = Math.max(st.minAge + 1, (st.minAge + Math.min(st.maxAge === Infinity ? st.minAge + 10 : st.maxAge, 100)) / 2) * WEEKS_PER_YEAR;
  const ev = rollEvent(pe, r0);
  ok(ev !== null, `${st.name}阶段能抽到事件`);
  if (ev) ok(ev.stage.includes(st.key), `${st.name}阶段抽到的事件确实挂载于该阶段`);
}

// rollEvent 尊重 cond：成年有职业时求职面试不出现（抽到的成年事件若 id=job_interview 则需 !career）
{
  const pe = newPlayer(r0, {});
  pe.career = '公职人员';
  pe.weeks = 30 * WEEKS_PER_YEAR;
  // 多次抽取都不应返回 cond 不满足的 job_interview（成年 cond 类事件）
  for (let i = 0; i < 30; i++) {
    const ev = rollEvent(pe, seq([i / 30]));
    ok(!ev || ev.id !== 'job_interview', '已有职业时求职面试不出现');
  }
}

// applyOption：结婚选项设置 flags.married 并施加心情/社交增量
{
  const pe = newPlayer(r0, {});
  pe.weeks = 30 * WEEKS_PER_YEAR;
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
  peA.weeks = 22 * WEEKS_PER_YEAR;
  applyOption(peA, ev.options[0], r1);
  ok(!peA.career, '求职大厂（随机=近1）落选 → 不设职业');
  // 随机=0 → 成功分支，设置职业
  const peB = newPlayer(r0, {});
  peB.weeks = 22 * WEEKS_PER_YEAR;
  applyOption(peB, ev.options[0], r0);
  ok(peB.career === '大厂白领', '求职大厂（随机=0）成功 → 设置职业「大厂白领」');
  ok(peB.careerLevel === 2, '求职大厂成功 → 初始职级 Lv2');
}

// 职级系统：升职事件成功时 careerLevel +1
{
  const ev = EVENTS.find((e) => e.id === 'promotion');
  const pe = newPlayer(r0, {});
  pe.weeks = 30 * WEEKS_PER_YEAR;
  pe.career = '公职人员'; pe.careerLevel = 2;
  applyOption(pe, ev.options[0], r0); // 主动争取（随机=0 → 成功）
  ok(pe.careerLevel === 3, '升职成功 → 职级 +1（Lv2→Lv3）');
}

// 被动收入随职级递增：职级高的成年每回合财富增长更多
{
  const mk = (lvl) => { const p = newPlayer(r0, {}); p.weeks = 30 * WEEKS_PER_YEAR; p.attrs.wealth = 50; p.attrs.intelligence = 50; p.careerLevel = lvl; return p; };
  const lo = mk(0); const hi = mk(6);
  const dLo = stepTime(lo, r0).drift.wealth;
  const dHi = stepTime(hi, r0).drift.wealth;
  ok(Number.isFinite(dLo) && Number.isFinite(dHi) && dHi > dLo, `职级越高被动收入越多（Lv0→${dLo}，Lv6→${dHi}）`);
}

// 属性条件分支：考试「挑灯夜战」结局随智力变化
{
  const ev = EVENTS.find((e) => e.id === 'exam');
  const smart = newPlayer(r0, {}); smart.attrs.intelligence = 80; smart.weeks = 12 * WEEKS_PER_YEAR;
  const dull = newPlayer(r0, {}); dull.attrs.intelligence = 30; dull.weeks = 12 * WEEKS_PER_YEAR;
  const rs = applyOption(smart, ev.options[0], r0);
  const rd = applyOption(dull, ev.options[0], r0);
  ok(/一鸣惊人|名列前茅/.test(rs.outcome), '高智力考试冲刺 → 佳绩结局');
  ok(/事倍功半|平平/.test(rd.outcome), '低智力考试冲刺 → 平庸结局');
}

// 家庭事件：添丁需已婚（cond），且子女数累加
{
  const ev = EVENTS.find((e) => e.id === 'have_baby');
  ok(typeof ev.cond === 'function' && ev.cond(newPlayer(r0, {})) === false, '未婚不会出现「添丁」事件');
  const married = newPlayer(r0, {}); married.weeks = 30 * WEEKS_PER_YEAR; married.flags.married = true;
  ok(ev.cond(married) === true, '已婚可出现「添丁」事件');
  applyOption(married, ev.options[0], r0);
  ok(married.flags.children === 1, '添丁后子女数 = 1');
  applyOption(married, ev.options[0], r0);
  ok(married.flags.children === 2, '再次添丁子女数累加 = 2');
}

// ambientLine 返回非空字符串
{
  const pe = newPlayer(r0, {});
  ok(typeof ambientLine(pe, r0) === 'string' && ambientLine(pe, r0).length > 0, 'ambientLine 返回日常旁白');
}

// —— 事件丰富化与差异化 ——
// 事件池规模显著扩充（≥40），覆盖更多人生情境。
ok(EVENTS.length >= 40, `事件池不少于 40 条（实际 ${EVENTS.length}）`);
// 部分事件带年龄窗口 / 出身限制 / 属性 cond，体现差异化。
ok(EVENTS.some((e) => Number.isFinite(e.minAge) || Number.isFinite(e.maxAge)), '存在按年龄分段的事件');
ok(EVENTS.some((e) => Array.isArray(e.bg)), '存在按出身限制的事件');
ok(EVENTS.filter((e) => e.cond).length >= 8, '存在多条带属性/状态条件的事件');

// rollEvent 年龄窗口过滤：学龄期的「开学第一天」只在该年龄段出现。
{
  const ev = EVENTS.find((e) => e.id === 'first_day_school');
  ok(ev && Number.isFinite(ev.minAge) && Number.isFinite(ev.maxAge), '「开学第一天」定义了年龄窗口');
  const young = newPlayer(r0, {}); young.weeks = 7 * WEEKS_PER_YEAR;  // 7 岁，落在窗口
  const old = newPlayer(r0, {}); old.weeks = 15 * WEEKS_PER_YEAR;     // 15 岁，超出窗口
  let youngOk = false, oldLeak = true;
  for (let i = 0; i < 40; i++) {
    const e = rollEvent({ ...young, recent: [] }, seq([i / 40]));
    if (e && e.id === 'first_day_school') youngOk = true;
    const e2 = rollEvent({ ...old, recent: [] }, seq([i / 40]));
    if (e2 && e2.id === 'first_day_school') oldLeak = false;
  }
  ok(youngOk, '适龄可抽到「开学第一天」');
  ok(oldLeak, '超龄不会抽到「开学第一天」（年龄窗口生效）');
}

// rollEvent 出身过滤：出身专属事件只对相应 background 出现。
{
  const ev = EVENTS.find((e) => Array.isArray(e.bg) && e.bg.length > 0);
  ok(!!ev, '存在出身专属事件');
  const inBg = newPlayer(r0, {}); inBg.weeks = 30 * WEEKS_PER_YEAR; inBg.background = ev.bg[0];
  const outBg = newPlayer(r0, {}); outBg.weeks = 30 * WEEKS_PER_YEAR; outBg.background = 'ordinary';
  if (!ev.bg.includes('ordinary')) {
    let leak = true;
    for (let i = 0; i < 40; i++) {
      const e = rollEvent({ ...outBg, recent: [] }, seq([i / 40]));
      if (e && e.id === ev.id) leak = false;
    }
    ok(leak, '非该出身不会抽到出身专属事件');
  }
  void inBg;
}

// rollEvent 去重冷却：连续抽取时优先避开最近触发过的事件。
{
  const pe = newPlayer(r0, {});
  pe.weeks = 30 * WEEKS_PER_YEAR;            // 成年期，事件池较大
  resetRecent(pe);
  ok(pe.recent.length === 0, 'resetRecent 清空去重记录');
  const seen = new Set();
  for (let i = 0; i < 12; i++) {
    const e = rollEvent(pe, seq([i / 50]));
    if (e) seen.add(e.id);
  }
  ok(seen.size >= 2, `去重冷却下连续抽取得到多种事件（${seen.size} 种）`);
  ok(pe.recent.length <= RECENT_EVENT_COOLDOWN, 'recent 记录不超过冷却上限');
  // 重复回填：当池被冷却耗尽时仍能回退抽到事件（保证不空）
  let canRoll = false;
  for (let i = 0; i < 10; i++) { if (rollEvent(pe, seq([i / 10])) ) canRoll = true; }
  ok(canRoll, '即使大量冷却也能回退抽到事件');
}

// —— 挂机模式 ——
ok(defaultAutoPlay().enabled === false, '默认挂机配置为关闭');
ok(AUTO_POLICIES.length === 3 && AUTO_POLICIES.some((p) => p.id === 'cautious'), '三种挂机策略');
{
  const ap = normalizeAutoPlay({ enabled: true, intervalMs: 9999, policy: 'ambitious' });
  ok(ap.enabled === true && ap.policy === 'ambitious', 'normalizeAutoPlay 保留合法字段');
  ok(ap.intervalMs <= 3000 && ap.intervalMs >= 400, 'normalizeAutoPlay 钳制节奏区间');
  const apBad = normalizeAutoPlay({ enabled: 1, intervalMs: 'x', policy: 'nope' });
  ok(apBad.enabled === false && apBad.policy === 'balanced', 'normalizeAutoPlay 兜底非法字段');
}
// pickOption：返回事件中的合法选项；不修改真实角色属性。
{
  const ev = EVENTS.find((e) => e.id === 'exam');
  const pe = newPlayer(r0, {});
  pe.attrs.intelligence = 80; pe.weeks = 12 * WEEKS_PER_YEAR;
  const before = pe.attrs.intelligence;
  const opt = pickOption(pe, ev, 'balanced', r0);
  ok(opt && ev.options.includes(opt), 'pickOption 返回事件内的合法选项');
  ok(pe.attrs.intelligence === before, 'pickOption 不修改真实角色');
  // 无选项事件返回 null
  ok(pickOption(pe, { options: [] }, 'balanced', r0) === null, '无选项事件 pickOption 返回 null');
}
// 不同策略对高风险事件给出不同偏好（进取倾向高风险选项，稳妥倾向保守）
{
  const ev = EVENTS.find((e) => e.id === 'investment'); // 含「稳健 / 梭哈 / 定期」三档
  ok(ev && ev.options.length >= 3, 'investment 事件含多档选项');
  const pe = newPlayer(r0, {});
  pe.weeks = 35 * WEEKS_PER_YEAR; pe.attrs.wealth = 70; pe.attrs.health = 80;
  // 固定 rng=0 时，「梭哈」成功（r()<0.35 不成立当 r=0 → 0<0.35 成立 → 成功，wealth 大涨）
  const caut = pickOption(pe, ev, 'cautious', r0);
  const ambi = pickOption(pe, ev, 'ambitious', r0);
  ok(caut && ambi, '稳妥/进取策略都能给出选项');
}

// ===================== save（多槽位）=====================
// 注入内存版 storage
function memStorage() {
  const m = {};
  return {
    getItem: (k) => (k in m ? m[k] : null),
    setItem: (k, v) => { m[k] = String(v); },
    removeItem: (k) => { delete m[k]; },
  };
}
ok(SAVE_SLOTS >= 5, `存档槽位 ≥ 5（实际 ${SAVE_SLOTS}）`);
_setStorage(memStorage());
ok(hasAnySave() === false, '注入空存储后无存档');
ok(latestSlot() === null, '无存档时 latestSlot 为 null');
ok(Array.isArray(listSaves()) && listSaves().length === SAVE_SLOTS, 'listSaves 返回全部槽位');

// 写入 0 号槽并读回
const toSave = newPlayer(r0, { name: '王五', gender: 'female', background: 'merchant' });
toSave.weeks = 30 * WEEKS_PER_YEAR;
toSave.attrs.wealth = 77;
ok(saveToSlot(0, toSave) === true, 'saveToSlot(0) 成功');
ok(hasAnySave() === true, '保存后 hasAnySave=true');
ok(latestSlot() === 0, '保存后 latestSlot=0');
const loaded = loadFromSlot(0);
ok(loaded !== null, 'loadFromSlot 返回非空');
ok(loaded.name === '王五' && loaded.gender === 'female', '读档姓名/性别一致');
ok(loaded.background === 'merchant', '读档出身一致');
ok(loaded.weeks === 30 * WEEKS_PER_YEAR && loaded.attrs.wealth === 77, '读档进度/属性一致');

// 多槽位独立：写 1、2 号槽互不干扰
saveToSlot(1, newPlayer(r0, { name: '甲' }));
saveToSlot(2, newPlayer(r0, { name: '乙' }));
ok(loadFromSlot(1).name === '甲' && loadFromSlot(2).name === '乙' && loadFromSlot(0).name === '王五', '多槽位互不干扰');
const summary = listSaves();
ok(summary.filter((s) => s.exists).length === 3, `listSaves 标记 3 个已用槽（实际 ${summary.filter((s) => s.exists).length}）`);

// latestSlot 取最近游玩（lastSeen 最大）
{
  saveToSlot(3, newPlayer(r0, { name: '最新' }));
  // saveToSlot 会刷新 lastSeen，3 号槽应成为最新
  ok(latestSlot() === 3, 'latestSlot 返回最近游玩的槽位');
}
// deleteSlot
ok(deleteSlot(3) === true && loadFromSlot(3) === null, 'deleteSlot 删除指定槽');
ok(deleteSlot(999) === false, '非法槽位 deleteSlot 返回 false');

// 旧版单存档（mnrs_save）自动迁移到 0 号槽
{
  _setStorage(memStorage());
  const s = memStorage();
  _setStorage(s);
  s.setItem('mnrs_save', JSON.stringify({ name: '旧档', weeks: 0, turn: 0, maxAge: 80, attrs: {}, gender: 'male' }));
  ok(loadFromSlot(0) !== null && loadFromSlot(0).name === '旧档', '旧版单存档自动迁移到 0 号槽');
  ok(s.getItem('mnrs_save') == null, '迁移后旧 key 被清除');
}

// migrate：损坏字段被钳制修复（含 background / recent / autoplay 补齐）
{
  _setStorage(memStorage());
  const bad = { name: '坏档', weeks: -10, turn: -3, maxAge: 30, attrs: { health: 999 }, gender: '??', career: 123 };
  saveToSlot(0, bad);
  const fixed = loadFromSlot(0);
  ok(fixed.weeks === 0 && fixed.turn === 0, 'migrate 修复负数 weeks/turn');
  ok(fixed.maxAge === MAX_AGE_MIN, 'migrate 把过小 maxAge 钳到下限');
  ok(fixed.attrs.health === 100, 'migrate 钳制越界 health');
  ok(ATTRS.every((k) => Number.isFinite(fixed.attrs[k])), 'migrate 补齐全部五项属性');
  ok(fixed.gender === 'male', 'migrate 规范化非法 gender');
  ok(fixed.career === null, 'migrate 规范化非法 career');
  ok(Array.isArray(fixed.log) && typeof fixed.flags === 'object', 'migrate 补齐 log/flags');
  ok(fixed.background === 'ordinary', 'migrate 补齐 background');
  ok(Array.isArray(fixed.recent), 'migrate 补齐 recent 数组');
  ok(fixed.autoplay && fixed.autoplay.enabled === false && fixed.autoplay.policy === 'balanced', 'migrate 补齐并规范化挂机配置');
}

// migrate：与 newPlayer 一致地截断超长姓名，防止旧档/导入档撑破 UI
{
  _setStorage(memStorage());
  const longNameSave = { name: '一二三四五六七八九十', weeks: 0, turn: 0, maxAge: 80, attrs: {}, gender: 'male' };
  saveToSlot(0, longNameSave);
  const fixedLong = loadFromSlot(0);
  ok(fixedLong.name.length === 8, 'migrate 截断超长姓名为 8 字');
  // 空姓名兜底为「无名氏」
  _setStorage(memStorage());
  saveToSlot(0, { name: '', weeks: 0, turn: 0, maxAge: 80, attrs: {}, gender: 'male' });
  const fixedEmpty = loadFromSlot(0);
  ok(fixedEmpty.name === '无名氏', 'migrate 空姓名兜底为「无名氏」');
}

// 导入导出往返
{
  _setStorage(memStorage());
  const orig = newPlayer(seq([0.3, 0.3, 0.3, 0.3, 0.3, 0.3]), { name: '赵六' });
  orig.weeks = 40 * WEEKS_PER_YEAR;
  orig.flags.married = true;
  const str = exportSave(orig);
  ok(typeof str === 'string' && str.length > 0, 'exportSave 生成字符串');
  const back = importSave(str);
  ok(back !== null, 'importSave 解析成功');
  ok(back.name === '赵六' && back.weeks === 40 * WEEKS_PER_YEAR && back.flags.married === true, '导入后字段一致');
  ok(importSave('!!!not-base64!!!') === null, '非法导入串返回 null');
}

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
