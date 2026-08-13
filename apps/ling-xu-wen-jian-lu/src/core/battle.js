// ============================================================================
// 战斗引擎（设计稿第四节：2.5D 回合制）
//
// 核心特性：
//   - 5v5 回合制，按 速度×±5%浮动 决定出手顺序（每回合重算）。
//   - 五行克制（克制 +30% / 被克 -15%）。
//   - 站位受击权重（1 号位 +30%、2 号位 +10%），嘲讽可强制集火。
//   - 通用技能 DSL：单攻 / 群攻 / 治疗 / 增益 / 护盾 / 净化 / 控制 / 持续伤害。
//   - 被动：暴击 / 反伤 / 吸血 / 抵抗 / 复活 / 致命免疫 / 低血狂暴 / 开场光环。
//
// 战斗自动结算（设计稿 4.5：自动回合制，玩家默认观战）。
// ============================================================================
import {
  computeDamage, counterMult, initiative, POS_AGGRO, clamp,
} from '../config.js';
import { chance } from './rng.js';
import { instanceStats, skillMult } from './card.js';
import { cardDef } from '../data/cards.js';

// ── 构建参战单位 ──────────────────────────────────────────────────────────────
// spec 形如 { name, element, stats:{atk,def,hp,spd}, actives, passives, skillMult }
export function buildCombatant(spec, side, pos) {
  const s = spec.stats || { atk: 0, def: 0, hp: 1, spd: 0 };
  const c = {
    ref: spec.ref || null,
    side, pos,
    name: spec.name || '无名',
    element: spec.element || null,
    role: spec.role || 'dps',
    baseAtk: s.atk, baseDef: s.def, baseSpd: s.spd,
    maxHp: Math.max(1, Math.round(s.hp)), hp: Math.max(1, Math.round(s.hp)),
    baseCrit: 0.05,
    actives: (spec.actives || []).map((a) => ({ ...a, mult: (a.mult || 0) * (spec.skillMult || 1) })),
    passives: spec.passives || [],
    // 运行时状态
    buffs: [], dots: [], controls: [],
    shield: 0, invuln: 0, taunt: 0,
    resist: 0, healBonusIn: 0, lifesteal: 0, thorns: 0,
    // 被动一次性标记
    revive: null, reviveUsed: false,
    deathsave: null, deathsaveUsed: false,
    teamRevive: null, teamReviveUsed: false,
    enrage: null, enrageActive: false,
    skillIdx: 0,
    alive: true,
  };
  // 解析静态被动（属性修饰 + 标记）
  for (const p of c.passives) {
    switch (p.kind) {
      case 'crit': c.baseCrit += p.amount; break;
      case 'atk': c.baseAtk = Math.round(c.baseAtk * (1 + p.amount)); break;
      case 'def': c.baseDef = Math.round(c.baseDef * (1 + p.amount)); break;
      case 'spd': c.baseSpd = Math.round(c.baseSpd * (1 + p.amount)); break;
      case 'resist': c.resist += p.amount; break;
      case 'heal_in': c.healBonusIn += p.amount; break;
      case 'lifesteal': c.lifesteal += p.amount; break;
      case 'thorns': c.thorns += p.amount; break;
      case 'revive': c.revive = p; break;
      case 'deathsave': c.deathsave = p; break;
      case 'team_revive': c.teamRevive = p; break;
      case 'enrage': c.enrage = p; break;
      default: break; // aura_enemy_down / heal_aura 在 createBattle 跨队处理
    }
  }
  return c;
}

// 由玩家阵容实例列表构造 player 侧 spec
export function playerSpecsFrom(player) {
  const out = [];
  for (let i = 0; i < 5; i++) {
    const id = player.formation[i];
    if (!id || !player.cards[id]) continue;
    const inst = player.cards[id];
    const def = cardDef(id);
    if (!def) continue;
    out.push({
      ref: id, name: def.name, element: def.element, role: def.role,
      stats: instanceStats(inst), actives: def.actives, passives: def.passives,
      skillMult: skillMult(inst),
    });
  }
  return out;
}

export function createBattle(playerSpecs, enemySpecs, rng) {
  const players = playerSpecs.map((s, i) => buildCombatant(s, 'player', i + 1));
  const enemies = enemySpecs.map((s, i) => buildCombatant(s, 'enemy', i + 1));
  // 开场光环：兵主威压（敌方全属性 -amount）、慈航普度（全队受治疗 +amount）
  for (const c of players) {
    for (const p of c.passives) {
      if (p.kind === 'aura_enemy_down') {
        for (const e of enemies) {
          e.baseAtk = Math.round(e.baseAtk * (1 - p.amount));
          e.baseDef = Math.round(e.baseDef * (1 - p.amount));
        }
      }
      if (p.kind === 'heal_aura') {
        for (const a of players) a.healBonusIn += p.amount;
      }
    }
  }
  // 重置受开场影响后的当前气血
  for (const c of [...players, ...enemies]) c.hp = c.maxHp;
  return {
    players, enemies,
    round: 0, log: [], over: false, result: null,
    _rng: rng || Math.random,
  };
}

// ── 当前属性（含临时增益）──────────────────────────────────────────────────────
function buffAmount(c, stat) {
  let sum = 0;
  for (const b of c.buffs) if (b.stat === stat && b.dur > 0) sum += b.amount;
  return sum;
}
function curAtk(c) { return Math.max(1, Math.round(c.baseAtk * (1 + buffAmount(c, 'atk')))); }
function curDef(c) { return Math.max(0, Math.round(c.baseDef * (1 + buffAmount(c, 'def')))); }
function curSpd(c) { return Math.max(1, Math.round(c.baseSpd * (1 + buffAmount(c, 'spd')))); }
function curCrit(c) { return clamp(c.baseCrit + buffAmount(c, 'crit'), 0, 0.95); }

function isStunned(c) { return c.controls.some((x) => x.kind === 'stun' && x.dur > 0); }
function isSilenced(c) { return c.controls.some((x) => (x.kind === 'silence' || x.kind === 'freeze') && x.dur > 0); }

// 治疗强度：攻击 + 最大气血的 20%
function healPower(c) { return curAtk(c) + Math.round(c.maxHp * 0.20); }

// ── 目标选择 ──────────────────────────────────────────────────────────────────
function enemyTeam(battle, side) { return side === 'player' ? battle.enemies : battle.players; }
function allyTeam(battle, side) { return side === 'player' ? battle.players : battle.enemies; }

function aliveOf(arr) { return arr.filter((c) => c.alive); }

// 选择一个敌方目标（优先嘲讽，否则按站位权重）
function pickEnemyTarget(battle, c, rng) {
  const foes = aliveOf(enemyTeam(battle, c.side));
  if (!foes.length) return null;
  const taunts = foes.filter((f) => f.taunt > 0);
  if (taunts.length) return taunts[Math.floor((rng || Math.random)() * taunts.length)];
  const weights = foes.map((f) => POS_AGGRO[f.pos - 1] || 1);
  let total = 0; for (const w of weights) total += w;
  let r = (rng || Math.random)() * total;
  for (let i = 0; i < foes.length; i++) { r -= weights[i]; if (r <= 0) return foes[i]; }
  return foes[foes.length - 1];
}
function pickLowestAlly(battle, c) {
  const allies = aliveOf(allyTeam(battle, c.side));
  if (!allies.length) return null;
  return allies.reduce((lo, a) => (a.hp / a.maxHp < lo.hp / lo.maxHp ? a : lo), allies[0]);
}

// ── 伤害 / 治疗 / 死亡 ─────────────────────────────────────────────────────────
function pushLog(battle, text) { battle.log.push(text); }

function directHpDamage(battle, target, amount, source) {
  target.hp -= amount;
  if (target.hp <= 0) handleDeath(battle, target, source);
}

function dealDamage(battle, target, source, mult, fixed, rng) {
  if (!target.alive || target.invuln > 0) {
    if (target.invuln > 0) pushLog(battle, `${target.name} 身泛金光，免疫了伤害！`);
    return 0;
  }
  const crit = chance(rng, curCrit(source));
  const dmg = computeDamage({
    atk: curAtk(source), def: curDef(target), mult, fixed,
    atkEl: source.element, defEl: target.element, crit, rng,
  });
  let remaining = dmg;
  if (target.shield > 0) {
    const absorbed = Math.min(target.shield, remaining);
    target.shield -= absorbed; remaining -= absorbed;
    if (absorbed > 0) pushLog(battle, `${target.name} 护盾抵挡 ${absorbed} 点。`);
  }
  target.hp -= remaining;
  pushLog(battle, `${source.name} → ${target.name} 造成 ${remaining} 点${crit ? '（暴击！）' : ''}伤害。`);
  // 反伤
  if (target.thorns > 0 && remaining > 0 && source !== target && source.alive) {
    const refl = Math.round(remaining * target.thorns);
    if (refl > 0) { pushLog(battle, `${target.name} 蛇鳞反噬 ${source.name} ${refl} 点。`); directHpDamage(battle, source, refl, target); }
  }
  // 吸血
  if (source.lifesteal > 0 && remaining > 0 && source.alive) {
    const hl = Math.round(remaining * source.lifesteal);
    if (hl > 0) healUnit(battle, source, hl, source, true);
  }
  if (target.hp <= 0) handleDeath(battle, target, source);
  return remaining;
}

function healUnit(battle, target, amount, source, suppressAura) {
  if (!target.alive) return;
  let eff = amount;
  if (!suppressAura) eff = Math.round(amount * (1 + target.healBonusIn));
  const before = target.hp;
  target.hp = Math.min(target.maxHp, target.hp + eff);
  const real = target.hp - before;
  if (real > 0) pushLog(battle, `${source.name} 治疗 ${target.name} ${real} 点。`);
}

function handleDeath(battle, target, source) {
  if (target.hp > 0) return;
  // 致命免疫（水月镜花）
  if (target.deathsave && !target.deathsaveUsed) {
    target.deathsaveUsed = true;
    target.hp = Math.round(target.maxHp * (target.deathsave.hpPct || 0.30));
    pushLog(battle, `${target.name} 水月镜花！免疫致命一击并回复气血。`);
    return;
  }
  // 濒死复活（不屈战魂）
  if (target.revive && !target.reviveUsed) {
    target.reviveUsed = true;
    target.hp = Math.round(target.maxHp * (target.revive.hpPct || 0.30));
    pushLog(battle, `${target.name} 不屈战魂，浴火复活！`);
    return;
  }
  // 全队复活（天泽万物）
  if (target.teamRevive && !target.teamReviveUsed) {
    target.teamReviveUsed = true;
    const team = allyTeam(battle, target.side);
    for (const a of team) {
      a.alive = true;
      a.hp = Math.max(a.hp, Math.round(a.maxHp * (target.teamRevive.hpPct || 0.50)));
      a.hp = a.hp <= 0 ? Math.round(a.maxHp * 0.5) : a.hp;
    }
    target.hp = Math.round(target.maxHp * (target.teamRevive.hpPct || 0.50));
    pushLog(battle, `${target.name} 天泽万物！全队死而复生！`);
    return;
  }
  target.hp = 0; target.alive = false;
  pushLog(battle, `${target.name} 倒下了。`);
}

// ── 技能效果施加 ──────────────────────────────────────────────────────────────
function applyEffectTo(battle, c, effect, source, rng) {
  if (!effect) return;
  // 抵抗：debuff 类效果可被抵抗
  const isDebuff = ['burn', 'poison', 'stun', 'silence', 'freeze', 'slow'].includes(effect.kind);
  if (isDebuff && c.resist > 0 && chance(rng, c.resist)) {
    pushLog(battle, `${c.name} 抵抗了 ${effect.kind}！`);
    return;
  }
  switch (effect.kind) {
    case 'burn':
    case 'poison':
      c.dots.push({ kind: effect.kind, dps: effect.dps, dur: effect.dur, srcAtk: curAtk(source) });
      pushLog(battle, `${c.name} 陷入${effect.kind === 'burn' ? '灼烧' : '中毒'}。`);
      break;
    case 'stun':
    case 'silence':
    case 'freeze':
      c.controls.push({ kind: effect.kind, dur: effect.dur });
      pushLog(battle, `${c.name} 陷入${effect.kind === 'stun' ? '眩晕' : effect.kind === 'freeze' ? '冰冻' : '沉默'}。`);
      break;
    case 'slow':
      c.buffs.push({ stat: 'spd', amount: -effect.amount, dur: effect.dur });
      pushLog(battle, `${c.name} 被减速。`);
      break;
    case 'invuln':
      c.invuln = Math.max(c.invuln, effect.dur);
      pushLog(battle, `${c.name} 进入无敌状态！`);
      break;
    default:
      if (effect.stat) { // 属性增益
        c.buffs.push({ stat: effect.stat, amount: effect.amount, dur: effect.dur });
        pushLog(battle, `${c.name} 获得增益（${effect.stat} +${Math.round(effect.amount * 100)}%）。`);
      } else if (effect.shieldPct != null) {
        const sh = Math.round(c.maxHp * effect.shieldPct);
        c.shield += sh;
        if (effect.taunt) { c.taunt = Math.max(c.taunt, effect.dur); pushLog(battle, `${c.name} 龟甲护盾加身并嘲讽敌方！`); }
        else pushLog(battle, `${c.name} 获得护盾 ${sh} 点。`);
      } else if (effect.dispel === 'debuff') {
        const n = c.dots.length + c.controls.length;
        c.dots = []; c.controls = [];
        if (n) pushLog(battle, `${c.name} 身上 ${n} 项负面状态被净化。`);
      }
      break;
  }
}

// ── 单位行动 ──────────────────────────────────────────────────────────────────
function act(battle, c, rng) {
  // 控制判定
  if (isStunned(c)) { pushLog(battle, `${c.name} 被震慑，无法行动。`); return; }
  const silenced = isSilenced(c);
  // 选择技能：被沉默 → 普攻；否则轮换主动技
  let skill;
  if (silenced) {
    skill = { type: 'dmg', target: 'enemy_one', mult: 1.0, name: '普攻' };
    pushLog(battle, `${c.name} 被封印，只能普通攻击。`);
  } else if (c.actives.length) {
    skill = c.actives[c.skillIdx % c.actives.length];
    c.skillIdx = (c.skillIdx + 1) % c.actives.length;
  } else {
    skill = { type: 'dmg', target: 'enemy_one', mult: 1.0, name: '普攻' };
  }

  // 低血狂暴触发（兵主降临 / Boss enrage）
  if (c.enrage && !c.enrageActive && c.hp / c.maxHp < (c.enrage.threshold || 0.30)) {
    c.enrageActive = true;
    c.baseAtk = Math.round(c.baseAtk * (1 + c.enrage.amount));
    c.baseDef = Math.round(c.baseDef * (1 + c.enrage.amount));
    c.buffs.push({ stat: 'atk', amount: 0, dur: c.enrage.dur }); // 占位记 dur（狂暴持续）
    c._enrageDur = c.enrage.dur;
    pushLog(battle, `${c.name} 怒意爆发，全属性暴增！`);
  }

  const mult = skill.mult || 0;
  const fixed = skill.fixed || 0;

  switch (skill.type) {
    case 'dmg': {
      if (skill.target === 'enemy_all') {
        for (const t of aliveOf(enemyTeam(battle, c.side))) dealDamage(battle, t, c, mult, fixed, rng);
        if (skill.effect) for (const t of aliveOf(enemyTeam(battle, c.side))) applyEffectTo(battle, t, skill.effect, c, rng);
      } else {
        const t = pickEnemyTarget(battle, c, rng);
        if (t) {
          dealDamage(battle, t, c, mult, fixed, rng);
          if (skill.effect) applyEffectTo(battle, t, skill.effect, c, rng);
        }
      }
      if (skill.selfEffect) applyEffectTo(battle, c, skill.selfEffect, c, rng);
      break;
    }
    case 'ctrl': {
      const t = pickEnemyTarget(battle, c, rng);
      if (t) {
        pushLog(battle, `${c.name} 施展【${skill.name}】！`);
        if (skill.effect) applyEffectTo(battle, t, skill.effect, c, rng);
      }
      break;
    }
    case 'heal': {
      const amount = healPower(c) * mult;
      if (skill.target === 'ally_all') {
        for (const t of aliveOf(allyTeam(battle, c.side))) healUnit(battle, t, amount, c);
      } else if (skill.target === 'self') {
        healUnit(battle, c, amount, c);
      } else {
        const t = pickLowestAlly(battle, c);
        if (t) healUnit(battle, t, amount, c);
      }
      if (skill.effect) {
        // 增益附在治疗目标上：全队 / 单体
        const targets = skill.target === 'ally_all' ? aliveOf(allyTeam(battle, c.side))
          : skill.target === 'self' ? [c]
          : (pickLowestAlly(battle, c) ? [pickLowestAlly(battle, c)] : []);
        for (const t of targets) applyEffectTo(battle, t, skill.effect, c, rng);
      }
      break;
    }
    case 'buff': {
      const targets = skill.target === 'ally_all' ? aliveOf(allyTeam(battle, c.side))
        : skill.target === 'self' ? [c]
        : (pickLowestAlly(battle, c) ? [pickLowestAlly(battle, c)] : []);
      pushLog(battle, `${c.name} 布下【${skill.name}】。`);
      for (const t of targets) applyEffectTo(battle, t, skill.effect, c, rng);
      break;
    }
    case 'shield': {
      applyEffectTo(battle, c, skill.effect, c, rng);
      break;
    }
    case 'cleanse': {
      const targets = skill.target === 'ally_all' ? aliveOf(allyTeam(battle, c.side)) : [c];
      for (const t of targets) if (skill.effect) applyEffectTo(battle, t, skill.effect, c, rng);
      break;
    }
    default: break;
  }
}

// ── 回合推进 ──────────────────────────────────────────────────────────────────
function endRound(battle, rng) {
  for (const c of [...battle.players, ...battle.enemies]) {
    if (!c.alive) continue;
    // 持续伤害（灼烧 / 中毒），绕过护盾
    for (const d of c.dots) {
      if (d.dur <= 0) continue;
      const dmg = Math.round(d.srcAtk * d.dps);
      pushLog(battle, `${c.name} 受${d.kind === 'burn' ? '灼烧' : '中毒'}损失 ${dmg} 点。`);
      directHpDamage(battle, c, dmg, null);
      if (!c.alive) break;
    }
    // 计时器递减
    for (const d of c.dots) d.dur -= 1;
    c.dots = c.dots.filter((d) => d.dur > 0);
    for (const b of c.buffs) b.dur -= 1;
    c.buffs = c.buffs.filter((b) => b.dur > 0);
    for (const k of c.controls) k.dur -= 1;
    c.controls = c.controls.filter((k) => k.dur > 0);
    if (c.invuln > 0) c.invuln -= 1;
    if (c.taunt > 0) c.taunt -= 1;
    if (c._enrageDur != null) { c._enrageDur -= 1; if (c._enrageDur <= 0) c.enrageActive = false; }
  }
}

function checkOver(battle) {
  const pAlive = aliveOf(battle.players).length;
  const eAlive = aliveOf(battle.enemies).length;
  if (eAlive === 0) { battle.over = true; battle.result = 'win'; pushLog(battle, '★ 敌方全军覆没，你获胜了！'); return true; }
  if (pAlive === 0) { battle.over = true; battle.result = 'lose'; pushLog(battle, '★ 我方全军覆没，败北……'); return true; }
  return false;
}

// 推进一回合。返回 { logs, over, result }
export function stepRound(battle, rng) {
  const r = rng || battle._rng || Math.random;
  if (battle.over) return { logs: [], over: true, result: battle.result };
  battle.round += 1;
  // 出手顺序：速度 × ±5% 浮动
  const all = [...battle.players, ...battle.enemies].filter((c) => c.alive);
  all.sort((a, b) => initiative(curSpd(b), r) - initiative(curSpd(a), r));
  for (const c of all) {
    if (!c.alive) continue;
    act(battle, c, r);
    if (checkOver(battle)) return { logs: battle.log.slice(), over: true, result: battle.result };
  }
  endRound(battle, r);
  if (checkOver(battle)) return { logs: battle.log.slice(), over: true, result: battle.result };
  return { logs: battle.log.slice(), over: false, result: null };
}

// 自动跑完整场战斗（带回合上限保护：超时按剩余气血比例判定）。
export function runBattle(playerSpecs, enemySpecs, rng, maxRounds = 60) {
  const battle = createBattle(playerSpecs, enemySpecs, rng);
  let guard = 0;
  while (!battle.over && guard++ < maxRounds) stepRound(battle, rng || battle._rng);
  if (!battle.over) {
    // 超时判定：按各方剩余气血百分比之和
    const pHp = aliveOf(battle.players).reduce((s, c) => s + c.hp / c.maxHp, 0);
    const eHp = aliveOf(battle.enemies).reduce((s, c) => s + c.hp / c.maxHp, 0);
    battle.result = pHp >= eHp ? 'win' : 'lose';
    battle.over = true;
    pushLog(battle, battle.result === 'win' ? '★ 限时已到，你以微弱优势取胜！' : '★ 限时已到，遗憾落败……');
  }
  return {
    result: battle.result,
    rounds: battle.round,
    log: battle.log,
    survivors: aliveOf(battle.players).length,
    enemySurvivors: aliveOf(battle.enemies).length,
    battle,
  };
}
