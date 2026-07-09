// ============================================================================
// 纯逻辑自测：不依赖浏览器，覆盖 config / player / world / battle / save 各模块。
// 运行：node scripts/logic-test.mjs
// ============================================================================
import {
  PALETTE, GRID, VISION_RADIUS, TILES, FLOOR_TILES, tileOf, isWalkable,
  EQUIP_SLOTS, MAX_PLUS, AFFIX_AT, AFFIXES, enhanceCost, starterEquipment,
  TALENTS, talentCost, floorConfig, enemyPoolFor, MEMORY_CHAPTERS, MAX_FLOOR,
  STAMINA_COST_PER_ROUND, STAMINA_TIRED, expToNext, clamp,
} from '../src/config.js';
import {
  newPlayer, migrate, maxHp, maxStamina, effectiveAtk, effectiveDef, effectiveMoveRange,
  enhanceEquipment, buyTalent, resetTalents, gainReward, healFull, regenStamina, spendStamina,
  damagePlayer, isDead, collectMemory, collectedMemoryCount,
} from '../src/core/player.js';
import {
  generateFloor, findPath, reachableTiles, entityAt, removeEntity, tileAt, descend, bfsReachable, enemyFromDef,
} from '../src/core/world.js';
import {
  STANCES, ACTIONS, COUNTERS, TELEGRAPH_CHANCE,
  pickEnemyStance, isTelegraphed, autoPickAction, resolveRound, enemyReward,
} from '../src/core/battle.js';
import {
  _setStorage, saveToSlot, loadFromSlot, deleteSlot, listSaves, hasAnySave, latestSlot,
  exportSave, importSave, SAVE_SLOTS,
} from '../src/core/save.js';
import { makeRng } from '../src/core/rng.js';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
const seq = (arr) => makeRng(arr);
const r0 = () => 0;
const r1 = () => 0.999;
const rMid = () => 0.5;

// ===================== config =====================
ok(Object.keys(PALETTE).length === 16, `调色板恰好 16 色（实际 ${Object.keys(PALETTE).length}）`);
ok(GRID === 16 && VISION_RADIUS === 2, '地图 16×16、视野半径 2（5×5）');
ok(EQUIP_SLOTS.length === 3 && EQUIP_SLOTS.includes('booster'), '装备三栏：武器/护甲/推进器');
ok(MAX_PLUS === 10 && AFFIX_AT === 5, '强化上限 +10，+5 触发词缀');
ok(AFFIXES.length >= 5 && AFFIXES.some((a) => a.id === 'lifesteal') && AFFIXES.some((a) => a.id === 'thorns'), '词缀池含吸血/反伤等');
ok(enhanceCost(0) < enhanceCost(3) && enhanceCost(3) < enhanceCost(9), '强化消耗随 plus 递增');
ok(TALENTS.length === 3 && TALENTS.some((t) => t.branch === 'survival') && TALENTS.some((t) => t.branch === 'luck'), '三天赋分支：生存/战斗/幸运');
ok(MEMORY_CHAPTERS.length === 10, `记忆章节 10 章（实际 ${MEMORY_CHAPTERS.length}）`);
ok(MAX_FLOOR === 10, '共 10 层（含 Boss）');
ok(enemyPoolFor(1).length >= 1 && enemyPoolFor(10).some((e) => e.boss), '敌人池按楼层分阶，10 层含 Boss');
ok(floorConfig(1).memory === true && floorConfig(10).memory === true, '每层含 1 枚记忆回响');
ok(expToNext(1) < expToNext(5), '升级所需经验随等级递增');
ok(tileOf('water').walkable === false && tileOf('floor').walkable === true, '地块通行性正确');
ok(isWalkable('wall') === false && isWalkable('sand') === true, 'isWalkable 辅助正确');
ok(Array.from(new Set(FLOOR_TILES)).length === FLOOR_TILES.length, '可行走地块类型无重复');

// ===================== player =====================
let p = newPlayer(seq([0.4, 0.4, 0.4, 0.4, 0.4, 0.4]), { name: '阿尔法' });
ok(p.name === '阿尔法' && p.hp === maxHp(p) && p.stamina === maxStamina(), '新角色满状态');
ok(p.floor === 1 && p.maxFloor === 1 && p.level === 1, '新角色从第 1 层、Lv1 起步');
ok(p.stardust === 0 && p.parts === 0 && p.exp === 0, '新角色零资源');
ok(p.equipment.weapon.name === '生锈砍刀' && p.equipment.booster.plus === 0, '起始装备正确');
ok(Object.keys(p.talents).length === 3 && p.talents.combat === 0, '天赋初始全 0');
ok(p.memory.length === 10 && p.memory.every((x) => x === false), '记忆初始全未收集');

// 超长姓名截断
ok(newPlayer(r0, { name: '一二三四五六七八九十' }).name.length === 8, '超长姓名截断 8 字');

// migrate 修复损坏档
{
  _setStorage(memStorage());
  const bad = { name: '', hp: -5, stamina: 999, stardust: -3, parts: 'x', level: 0, exp: -1, floor: 99, maxFloor: 0, seed: NaN, turn: -1, equipment: { weapon: { name: 1, stat: 'a', plus: 99, affix: { id: 'nope' } } }, talents: { survival: 99, combat: -1 }, memory: [true, true], ending: 'weird' };
  saveToSlot(0, bad);
  const f = loadFromSlot(0);
  ok(f.name === '旅者', 'migrate 空姓名兜底');
  ok(f.hp >= 0 && f.stamina >= 0, 'migrate HP/精力非负');
  ok(f.stardust === 0 && f.parts === 0 && f.exp === 0, 'migrate 资源非负');
  ok(f.level === 1, 'migrate 等级下限 1');
  ok(f.floor === MAX_FLOOR, 'migrate 楼层钳到上限');
  ok(Number.isFinite(f.seed), 'migrate 补种子');
  ok(f.equipment.weapon.plus === MAX_PLUS, 'migrate 强化钳到上限');
  ok(f.equipment.weapon.affix === null, 'migrate 非法词缀置空');
  ok(f.talents.survival === 5 && f.talents.combat === 0, 'migrate 天赋钳到合法档');
  ok(f.memory.length === 10 && f.memory[0] === true && f.memory[2] === false, 'migrate 记忆数组补齐');
  ok(f.ending === null, 'migrate 非法结局置空');
}

// migrate：楼层快照损坏（某行为 null / pos 越界）→ 丢弃或钳制，绝不崩溃或软锁
{
  _setStorage(memStorage());
  const grid = Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => 'floor'));
  const broken = { name: '甲', floor: 2, floorState: { grid: grid.map((r, i) => (i === 5 ? null : r)), pos: { x: 3, y: 3 }, entities: [], explored: {} } };
  saveToSlot(0, broken);
  const f1 = loadFromSlot(0);
  ok(f1.floorState === null, 'migrate：grid 含 null 行 → floorState 置空（重生成）');
  const badPos = { name: '乙', floor: 2, floorState: { grid, pos: { x: -1 }, entities: [], explored: {} } };
  saveToSlot(1, badPos);
  const f2 = loadFromSlot(1);
  ok(f2.floorState !== null && f2.floorState.pos.x === 1 && f2.floorState.pos.y === 1, 'migrate：pos 越界 → 钳到 {1,1}');
  const okPos = { name: '丙', floor: 2, floorState: { grid, pos: { x: 7, y: 9 }, entities: [], explored: {} } };
  saveToSlot(2, okPos);
  const f3 = loadFromSlot(2);
  ok(f3.floorState.pos.x === 7 && f3.floorState.pos.y === 9, 'migrate：合法 pos 原样保留');
}

// 派生数值：强化 / 天赋 / 词缀 / 等级 均生效
{
  const a = newPlayer(r0, {});
  const baseAtk = effectiveAtk(a);
  a.equipment.weapon.plus = 3;
  ok(effectiveAtk(a) > baseAtk, '武器强化提升攻击');
  a.talents.combat = 3;
  ok(effectiveAtk(a) > baseAtk + 3, '战斗天赋额外提升攻击');
  const a2 = newPlayer(r0, {});
  const baseDef = effectiveDef(a2);
  a2.equipment.armor.plus = 2;
  ok(effectiveDef(a2) > baseDef, '护甲强化提升防御');
  const a3 = newPlayer(r0, {});
  ok(effectiveMoveRange(a3) === 1, '初始移动步数 1');
  a3.equipment.booster.plus = 2;
  ok(effectiveMoveRange(a3) === 3, '推进器强化提升步数');
  a3.equipment.booster.affix = { id: 'swift' };
  ok(effectiveMoveRange(a3) === 4, '迅捷词缀 +1 步');
  // 等级提升血量上限
  const a4 = newPlayer(r0, {});
  a4.level = 5;
  ok(maxHp(a4) > maxHp(newPlayer(r0, {})), '等级提升血量上限');
}

// enhanceEquipment：消耗零件、+plus、+5 触发词缀
{
  const e = newPlayer(r0, {});
  e.parts = 100;
  const cost0 = enhanceCost(0);
  let res = enhanceEquipment(e, 'weapon', seq([0.1]));
  ok(res.ok === true && e.parts === 100 - cost0 && e.equipment.weapon.plus === 1, '强化消耗零件且 plus+1');
  // 连续强化到 +5 触发词缀
  e.equipment.weapon.plus = 4;
  res = enhanceEquipment(e, 'weapon', seq([0.2]));
  ok(res.ok && res.affixed && e.equipment.weapon.plus === 5, '强化至 +5');
  ok(e.equipment.weapon.affix && AFFIXES.some((a) => a.id === e.equipment.weapon.affix.id), '+5 触发词缀变异');
  // 达上限
  e.equipment.weapon.plus = MAX_PLUS;
  res = enhanceEquipment(e, 'weapon', r0);
  ok(res.ok === false && res.reason === 'max', '达上限不可强化');
  // 零件不足
  e.equipment.weapon.plus = 0; e.parts = 0;
  res = enhanceEquipment(e, 'weapon', r0);
  ok(res.ok === false && res.reason === 'no-parts', '零件不足不可强化');
}

// 天赋：消耗星骸、上限、重置返还
{
  const t = newPlayer(r0, {});
  t.stardust = 200;
  const c0 = talentCost('combat', 0);
  let res = buyTalent(t, 'combat');
  ok(res.ok && t.talents.combat === 1 && t.stardust === 200 - c0, '点亮战斗天赋消耗星骸');
  // 生存天赋补 HP
  const hpBefore = t.hp;
  res = buyTalent(t, 'survival');
  ok(res.ok && t.hp >= hpBefore, '生存天赋补 HP');
  // 重置全额返还
  const sdBefore = t.stardust;
  res = resetTalents(t);
  ok(res.ok && res.refund > 0 && t.stardust > sdBefore, '重置天赋返还星骸');
  ok(t.talents.combat === 0 && t.talents.survival === 0, '重置后天赋归零');
  // 星骸不足
  t.stardust = 0;
  res = buyTalent(t, 'luck');
  ok(res.ok === false && res.reason === 'no-stardust', '星骸不足不可点亮');
}

// gainReward：幸运加成 + 升级
{
  const g = newPlayer(r0, {});
  gainReward(g, { stardust: 10, parts: 4, exp: 0 }, r0);
  ok(g.stardust === 10 && g.parts === 4, '基础奖励入账');
  const lucky = newPlayer(r0, {});
  lucky.talents.luck = 3;
  gainReward(lucky, { stardust: 10, parts: 4 }, r0);
  ok(lucky.stardust > 10 && lucky.parts > 4, '幸运天赋提升掉落');
  // 升级
  const lv = newPlayer(r0, {});
  const lvBefore = lv.level;
  const need = expToNext(lv.level);
  gainReward(lv, { exp: need + 5 }, r0);
  ok(lv.level === lvBefore + 1 && lv.exp === 5, '经验达标后升级并结算剩余经验');
}

// HP / 精力 / 死亡
{
  const d = newPlayer(r0, {});
  damagePlayer(d, 1000);
  ok(d.hp === 0 && isDead(d) === true, '伤害致死判定死亡');
  healFull(d);
  ok(d.hp === maxHp(d) && d.stamina === maxStamina(d), '满状态恢复');
  spendStamina(d, 50);
  ok(d.stamina < maxStamina(d), '消耗精力');
  regenStamina(d, 10);
  ok(d.stamina <= maxStamina(d), '精力回复钳制上限');
}

// 记忆收集
{
  const m = newPlayer(r0, {});
  ok(collectedMemoryCount(m) === 0, '初始收集数 0');
  const res = collectMemory(m, 0);
  ok(res.ok && m.memory[0] === true && collectedMemoryCount(m) === 1, '收集记忆解锁章节');
  const again = collectMemory(m, 0);
  ok(again.ok === false && again.already === true, '重复收集不重复解锁');
  ok(m.hp < maxHp(m) || m.hp === maxHp(m), '收集记忆回复 HP 不报错');
}

// ===================== world =====================
{
  const st = generateFloor(seq(Array.from({ length: 64 }, (_, i) => (i % 7) / 7)), 1, newPlayer(r0, {}));
  ok(st.grid.length === GRID && st.grid[0].length === GRID, '生成 16×16 网格');
  // 边界为墙
  ok(st.grid[0][0] === 'wall' && st.grid[GRID - 1][GRID - 1] === 'wall', '边界为墙');
  // 出生点可行走
  ok(isWalkable(tileAt(st, st.pos.x, st.pos.y)), '出生点可行走');
  // 第 1 层有阶梯
  ok(st.entities.some((e) => e.type === 'memory'), '第 1 层含 1 枚记忆');
  ok(st.entities.filter((e) => e.type === 'enemy').length === floorConfig(1).enemyCount, `敌人数量符合楼层配置（${floorConfig(1).enemyCount}）`);
  ok(st.entities.filter((e) => e.type === 'chest').length === floorConfig(1).chestCount, '宝箱数量符合楼层配置');
  ok(st.entities.some((e) => ['merchant', 'drone', 'trap'].includes(e.type)), '含 1 个随机事件点');
  // 有阶梯且非 Boss 层
  let hasStairs = false;
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (tileAt(st, x, y) === 'stairs') hasStairs = true;
  ok(hasStairs, '第 1 层存在下行阶梯');
  // 实体不重叠出生点
  ok(!entityAt(st, st.pos.x, st.pos.y), '出生点无实体');
  // 出生点可达阶梯
  const reach = bfsReachable(st.grid, st.pos.x, st.pos.y);
  let stairsKey = null;
  for (let y = 0; y < GRID && !stairsKey; y++) for (let x = 0; x < GRID && !stairsKey; x++) if (tileAt(st, x, y) === 'stairs') stairsKey = `${x},${y}`;
  ok(stairsKey && reach.dist.has(stairsKey), '出生点可达阶梯（连通保证）');
}
// Boss 层：无阶梯、有 Boss
{
  const st = generateFloor(seq(Array.from({ length: 64 }, (_, i) => (i % 5) / 5)), MAX_FLOOR, newPlayer(r0, {}));
  let hasStairs = false;
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (tileAt(st, x, y) === 'stairs') hasStairs = true;
  ok(hasStairs === false, 'Boss 层无下行阶梯');
  const boss = st.entities.find((e) => e.type === 'enemy');
  ok(boss && boss.boss === true, 'Boss 层含 Boss 敌人');
  ok(st.entities.some((e) => e.type === 'memory'), 'Boss 层仍含 1 枚记忆');
}

// reachableTiles / findPath
{
  const grid = Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => 'floor'));
  for (let i = 0; i < GRID; i++) { grid[0][i] = 'wall'; grid[GRID - 1][i] = 'wall'; grid[i][0] = 'wall'; grid[i][GRID - 1] = 'wall'; }
  const st = { grid, pos: { x: 5, y: 5 }, entities: [] };
  const reach1 = reachableTiles(st, st.pos, 1);
  ok(reach1.size === 5, `步数 1 可达 5 格（实际 ${reach1.size}）`); // 自身 + 4 邻
  const reach2 = reachableTiles(st, st.pos, 2);
  ok(reach2.size === 13, `步数 2 可达 13 格（实际 ${reach2.size}）`);
  const path = findPath(st, { x: 5, y: 5 }, { x: 7, y: 5 }, 5, new Set());
  ok(Array.isArray(path) && path.length === 2, `findPath 走 2 步到 (3,1)（实际 ${path && path.length}）`);
  const tooFar = findPath(st, { x: 1, y: 1 }, { x: 5, y: 1 }, 2, new Set());
  ok(tooFar === null, '超出步数上限 findPath 返回 null');
  // 墙阻挡
  grid[1][2] = 'wall';
  const blocked = findPath(st, { x: 1, y: 1 }, { x: 3, y: 1 }, 5, new Set());
  // 直线被墙挡，但可绕行（2,1 被墙挡，可走 1,2->2,2->3,2->3,1）；仍可达
  ok(Array.isArray(blocked), '墙阻挡直线但仍可绕行抵达');
  // 敌人格视为阻挡
  const stE = { grid: grid.map((r) => r.slice()), pos: { x: 1, y: 1 }, entities: [{ id: 'e1', type: 'enemy', x: 2, y: 1 }] };
  const reachE = reachableTiles(stE, stE.pos, 2);
  ok(!reachE.has('2,1'), '敌人所在格不可达');
}
// entityAt / removeEntity / descend
{
  const st = { grid: Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => 'floor')), pos: { x: 1, y: 1 }, entities: [{ id: 'e1', type: 'chest', x: 2, y: 2 }] };
  ok(entityAt(st, 2, 2) && entityAt(st, 2, 2).id === 'e1', 'entityAt 命中');
  ok(entityAt(st, 3, 3) === null, 'entityAt 空格返回 null');
  ok(removeEntity(st, 'e1') === true && entityAt(st, 2, 2) === null, 'removeEntity 移除实体');
  ok(removeEntity(st, 'nope') === false, 'removeEntity 不存在返回 false');
  const pl = newPlayer(r0, {}); pl.floor = 5;
  ok(descend(pl) === 6 && pl.maxFloor === 6, 'descend 推进楼层并更新最远记录');
  pl.floor = MAX_FLOOR;
  ok(descend(pl) === MAX_FLOOR, 'descend 钳到上限');
}

// ===================== battle =====================
ok(Object.keys(COUNTERS).length === 3, '三组克制关系');
ok(COUNTERS.counter === 'thrust' && COUNTERS.block === 'slash' && COUNTERS.dodge === 'smash', '反击克突刺、格挡克横斩、闪避克重击');
{
  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
  ok(['thrust', 'slash', 'smash'].includes(pickEnemyStance(enemy, r0)), 'pickEnemyStance 返回合法架势');
  ok(autoPickAction('thrust') === 'counter' && autoPickAction('slash') === 'block' && autoPickAction('smash') === 'dodge', 'autoPickAction 给出正确克制');
  ok(isTelegraphed(seq([0.1])) === true && isTelegraphed(seq([0.9])) === false, 'isTelegraphed 按概率识破');
  ok(TELEGRAPH_CHANCE > 0 && TELEGRAPH_CHANCE < 1, '识破概率合法');
}
// 克制成功：敌人受伤、玩家不掉血、专注力蓄满
{
  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
  const hpBefore = enemy.hp;
  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r1); // r1 不失手
  ok(res.countered === true, '反击对突刺 → 克制成功');
  ok(res.enemyDmg > 0 && enemy.hp === hpBefore - res.enemyDmg, '敌人受到伤害');
  ok(res.playerDmg === 0, '克制成功玩家不掉血');
  ok(res.nextFocus === true, '克制成功蓄满专注力');
}
// 专注力倍率：下一击伤害更高
{
  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
  const atk = effectiveAtk(pl);
  const e1 = enemyFromDef(enemyPoolFor(1)[0], 1);
  resolveRound(pl, e1, 'counter', false, 'thrust', r1);
  const e2 = enemyFromDef(enemyPoolFor(1)[0], 1);
  const res2 = resolveRound(pl, e2, 'counter', true, 'thrust', r1); // 带专注
  ok(res2.enemyDmg > atk, '专注力下克制伤害高于基础攻击');
}
// 应对失败：玩家受伤
{
  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1); enemy.atk = 30;
  const hpBefore = pl.hp;
  const res = resolveRound(pl, enemy, 'block', false, 'thrust', r1); // 格挡不克突刺
  ok(res.countered === false, '错误应对 → 未克制');
  ok(res.playerDmg > 0 && pl.hp < hpBefore, '玩家受到伤害');
  ok(res.nextFocus === false, '失败清空专注力');
}
// 精力过低失手
{
  const pl = newPlayer(r0, {}); pl.stamina = 0; // < STAMINA_TIRED
  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r0); // r0 → 触发失手
  ok(res.fumble === true && res.countered === false, '精力过低且随机=0 → 失手');
}
// 吸血词缀
{
  const pl = newPlayer(r0, {});
  pl.stamina = maxStamina(pl); pl.hp = 10;
  pl.equipment.weapon.affix = { id: 'lifesteal' };
  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r1);
  ok(res.healed > 0 && pl.hp > 10, '吸血词缀在克制命中时回血');
}
// 反伤词缀
{
  const pl = newPlayer(r0, {});
  pl.stamina = maxStamina(pl);
  pl.equipment.armor.affix = { id: 'thorns' };
  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1); enemy.atk = 40;
  const hpBefore = enemy.hp;
  const res = resolveRound(pl, enemy, 'block', false, 'thrust', r1); // 失败受击
  ok(res.playerDmg > 0 && enemy.hp < hpBefore, '反伤词缀在受击时反弹伤害');
}
// 战斗致死与奖励
{
  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1); enemy.hp = 1; enemy.maxHp = 1;
  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r1);
  ok(res.enemyDead === true && enemy.hp === 0, '敌人 HP 归零判定死亡');
  const rw = enemyReward(enemy);
  ok(Number.isFinite(rw.stardust) && Number.isFinite(rw.parts) && Number.isFinite(rw.exp), 'enemyReward 返回奖励数值');
}
ok(STAMINA_COST_PER_ROUND > 0 && STAMINA_TIRED > 0, '战斗精力消耗 / 疲惫阈值合法');

// ===================== save（多槽位）=====================
function memStorage() {
  const m = {};
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: (k) => { delete m[k]; } };
}
ok(SAVE_SLOTS >= 5, `存档槽位 ≥ 5（实际 ${SAVE_SLOTS}）`);
_setStorage(memStorage());
ok(hasAnySave() === false && latestSlot() === null, '空存储无存档');
ok(Array.isArray(listSaves()) && listSaves().length === SAVE_SLOTS, 'listSaves 返回全部槽位');

const toSave = newPlayer(seq([0.3, 0.3, 0.3, 0.3, 0.3, 0.3]), { name: '贝塔' });
toSave.floor = 4; toSave.stardust = 30; toSave.parts = 12;
ok(saveToSlot(0, toSave) === true && hasAnySave() === true && latestSlot() === 0, 'saveToSlot 写入并可读出');
const loaded = loadFromSlot(0);
ok(loaded.name === '贝塔' && loaded.floor === 4 && loaded.stardust === 30 && loaded.parts === 12, '读档字段一致');

saveToSlot(1, newPlayer(r0, { name: '甲' }));
saveToSlot(2, newPlayer(r0, { name: '乙' }));
ok(loadFromSlot(1).name === '甲' && loadFromSlot(0).name === '贝塔', '多槽位互不干扰');
ok(listSaves().filter((s) => s.exists).length === 3, 'listSaves 标记已用槽');
{
  saveToSlot(3, newPlayer(r0, { name: '最新' }));
  ok(latestSlot() === 3, 'latestSlot 取最近游玩槽位');
}
ok(deleteSlot(3) === true && loadFromSlot(3) === null, 'deleteSlot 删除槽位');
ok(deleteSlot(999) === false, '非法槽位 deleteSlot 返回 false');

// 导入导出往返
{
  const orig = newPlayer(seq([0.2, 0.2, 0.2, 0.2, 0.2, 0.2]), { name: '伽马' });
  orig.floor = 6; orig.memory[0] = true;
  const str = exportSave(orig);
  ok(typeof str === 'string' && str.length > 0, 'exportSave 生成字符串');
  const back = importSave(str);
  ok(back !== null && back.name === '伽马' && back.floor === 6 && back.memory[0] === true, '导入后字段一致');
  ok(importSave('!!!not-base64!!!') === null, '非法导入串返回 null');
}

// 楼层快照随存档保存
{
  _setStorage(memStorage());
  const pl = newPlayer(r0, {});
  pl.floorState = generateFloor(rMid, 2, pl);
  saveToSlot(0, pl);
  const back = loadFromSlot(0);
  ok(back.floorState && back.floorState.grid.length === GRID, '楼层快照随存档保存');
}

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
