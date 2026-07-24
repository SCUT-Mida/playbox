// ============================================================================
// 战斗系统：简化自动回合制（骰子模型 + 城防 + 单挑）。
// createBattle() 构造战局，runBattle() 自动结算至胜负，产生文字战报 log。
// ============================================================================
import { FORMATIONS, DUEL_THRESHOLD, DUEL_CHANCE, DUEL_ROUT_RATIO } from '../config.js';
import { skillBonus, techMult } from './tech.js';
import { chance, range } from './rng.js';

// 有效武力 / 统率（含技能加成）
export function effWar(hero) {
  if (!hero) return 50;
  return hero.stats.w * (1 + skillBonus(hero).war);
}
export function effLead(hero) {
  if (!hero) return 50;
  return hero.stats.l * (1 + skillBonus(hero).lead);
}

// 训练度系数：50 → 1.0，100 → 1.5，0 → 0.5
function trainingCoeff(training) {
  return 0.5 + (Number.isFinite(training) ? training : 50) / 100;
}

// 一支部队的攻击值
export function attackValue(force, state) {
  const g = force.general;
  const war = effWar(g);
  const lead = effLead(g);
  const soldiers = Math.max(0, force.soldiers);
  const forge = techMult(state, 'forge', 0.05);
  const form = FORMATIONS[force.formation] || FORMATIONS.normal;
  return (war * 0.4 + lead * 0.3 + soldiers * 0.01) * forge * trainingCoeff(force.training) * form.atk;
}

// 构造战局
export function createBattle({ attacker, defender }) {
  return {
    attacker: { ...attacker },
    defender: { ...defender },
    round: 0,
    log: [],
    result: null,
    prisoner: null,
    duel: null,
  };
}

// 单回合：双方同时对对方造成伤害（攻方先结算，守方城防优先承受）
function resolveRound(b, state, rng) {
  const aVal = attackValue(b.attacker, state);
  const dVal = attackValue(b.defender, state);

  // —— 攻方 → 守方 ——（城防优先承受，溢出转入士兵）
  let aDmg = aVal * range(rng, 0.85, 1.15);
  if (b.defender.isCity && b.defender.defense > 0) {
    const soaked = Math.min(b.defender.defense, aDmg);
    b.defender.defense = Math.max(0, b.defender.defense - soaked);
    aDmg -= soaked;
    if (soaked > 0) {
      b.log.push(`回合 ${b.round}：${b.attacker.general.name} 攻城，城防承受 ${Math.round(soaked)} 点（余 ${Math.round(b.defender.defense)}）。`);
    }
  }
  if (aDmg > 0) {
    b.defender.soldiers = Math.max(0, b.defender.soldiers - aDmg);
    b.log.push(`回合 ${b.round}：${b.attacker.general.name} 部队杀伤敌军 ${Math.round(aDmg)} 人（敌余 ${Math.round(b.defender.soldiers)}）。`);
  }

  // —— 守方 → 攻方 ——（攻方无城防，直接削减士兵）
  const dDmg = dVal * range(rng, 0.85, 1.15);
  if (dDmg > 0) {
    b.attacker.soldiers = Math.max(0, b.attacker.soldiers - dDmg);
    b.log.push(`回合 ${b.round}：${b.defender.general.name} 反击杀伤我军 ${Math.round(dDmg)} 人（我余 ${Math.round(b.attacker.soldiers)}）。`);
  }
}

// 单挑判定（每回合最多一次，触发后决出胜负）
function tryDuel(b, rng) {
  if (b.duel) return false;
  const ag = b.attacker.general;
  const dg = b.defender.general;
  if (!ag || !dg) return false;
  const diff = Math.abs(effWar(ag) - effWar(dg));
  if (diff <= DUEL_THRESHOLD) return false;
  if (!chance(rng, DUEL_CHANCE)) return false;
  const attackerWins = effWar(ag) > effWar(dg);
  b.duel = { winner: attackerWins ? 'attacker' : 'defender', loser: attackerWins ? 'defender' : 'attacker' };
  b.log.push(`⚔️ ${ag.name} 与 ${dg.name} 阵前单挑！${(attackerWins ? ag : dg).name} 武艺更胜一筹，一合斩将，败军溃散！`);
  return true;
}

// 跑完整场战斗（最多 30 回合，避免死循环）
export function runBattle(b, state, rng) {
  b.round = 0;
  while (b.result == null && b.round < 30) {
    b.round += 1;

    // 单挑（前置，可一击定胜负）
    if (tryDuel(b, rng)) {
      const loserSide = b.duel.loser;
      const winnerSide = b.duel.winner;
      const loserGen = b[loserSide].general;
      b[loserSide].soldiers = Math.round(b[loserSide].soldiers * (1 - DUEL_ROUT_RATIO));
      // 君主不可被俘（仅败走），避免势力因失主而僵死
      b.prisoner = loserGen && !isLord(loserGen) ? loserGen.id : null;
      b.result = winnerSide;
      b.log.push(`${b[winnerSide].general.name} 赢下单挑，${loserGen.name}${b.prisoner ? ' 被俘' : ' 败走'}，敌军溃败！`);
      break;
    }

    resolveRound(b, state, rng);

    if (b.defender.soldiers <= 0) { b.result = 'attacker'; break; }
    if (b.attacker.soldiers <= 0) { b.result = 'defender'; break; }
  }
  // 超时未分胜负：以残兵多者胜
  if (b.result == null) {
    b.result = b.attacker.soldiers >= b.defender.soldiers ? 'attacker' : 'defender';
    b.log.push(`战至日暮，双方力竭。${b.result === 'attacker' ? '攻方' : '守方'} 残兵更众，勉强占得上风。`);
  }
  // 败方主将被俘（君主除外）
  if (!b.prisoner) {
    const loser = b.result === 'attacker' ? b.defender : b.attacker;
    if (loser.general && !isLord(loser.general) && loser.general.id !== '__militia__' && chance(rng, 0.5)) {
      b.prisoner = loser.general.id;
    }
  }
  return b;
}

function isLord(g) { return !!(g && (g.lord || g.isPlayerLord)); }
