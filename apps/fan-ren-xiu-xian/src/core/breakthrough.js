// ============================================================================
// 突破瓶颈：小境界（直接掷骰）+ 大境界（心魔/天劫考验）。飞升为终局。
// ============================================================================
import { REALMS, ASCEND_INDEX, breakthroughChance, clamp } from '../config.js';
import {
  recompute, fullHeal, isXpFull, addXp, xpOverflow, removeItem, hasItem, addStones,
  grantTitle, grantAchievement,
} from './player.js';
import { chance } from './rng.js';

// 下一个突破目标；返回 null 表示已飞升（到顶）
export function nextTarget(player) {
  const realm = REALMS[player.tier];
  // 同境界内晋升小层
  if (player.sub < realm.subs.length - 1) {
    return { tier: player.tier, sub: player.sub + 1, isMajor: false, trial: null };
  }
  // 跨越大境界
  if (player.tier >= ASCEND_INDEX) return null;
  const next = REALMS[player.tier + 1];
  return { tier: player.tier + 1, sub: 0, isMajor: true, trial: next.trial, reqItem: next.reqItem };
}

export function canBreakthrough(player) {
  if (player.ascended) return false;
  if (!nextTarget(player)) return false;
  return isXpFull(player);
}

// 是否需要经历考验（大境界且有 trial）
export function needsTrial(player) {
  const t = nextTarget(player);
  return !!(t && t.isMajor && t.trial);
}

// —— 小境界突破（含凡人→炼气、炼气内部）：单次掷骰 ——
export function attemptMinorBreakthrough(player, useTupo, rng) {
  if (!canBreakthrough(player) || needsTrial(player)) {
    return { ok: false, reason: '当前无法进行此突破' };
  }
  const target = nextTarget(player);
  let usedTupo = false;
  if (useTupo && hasItem(player, 'pill_tupo')) { removeItem(player, 'pill_tupo', 1); usedTupo = true; }

  const p = breakthroughChance(player, usedTupo, target.tier);
  const success = chance(rng, p);
  const log = [];
  if (success) {
    advanceRealm(player, target);
    log.push(`突破成功！迈入${REALMS[player.tier].name}${REALMS[player.tier].subs[player.sub]}。`);
    return { ok: true, success: true, usedTupo, log };
  }
  // 失败：修为回退一部分，连击中断
  player.xp = Math.floor(player.xpMax * 0.6);
  player.stats.breakthroughStreak = 0;
  recompute(player);
  log.push('突破失败，修为跌落，需蓄势再战。');
  return { ok: true, success: false, usedTupo, log };
}

// —— 大境界突破：开启考验（心魔 / 天劫 / 飞升）——
export function startMajorTrial(player, rng) {
  const target = nextTarget(player);
  if (!target || !needsTrial(player)) return null;
  const trial = REALMS[target.tier];
  // 消耗所需丹药（若有则提供加成；无亦不强求）
  let hadReq = false;
  if (target.reqItem && hasItem(player, target.reqItem)) {
    removeItem(player, target.reqItem, 1);
    hadReq = true;
  }
  const t = {
    kind: target.trial,
    target,
    tier: target.tier,
    sub: 0,
    reqItem: target.reqItem,
    hadReq,
    log: [],
    over: false,
    success: false,
  };
  if (t.kind === 'heart') {
    t.rounds = 3;
    t.round = 0;
    t.passes = 0;
    t.log.push(`【渡心魔】需通过 ${t.rounds} 轮心境考验（过半即成）。`);
  } else {
    // 天劫 / 飞升
    t.rounds = t.kind === 'ascend' ? 6 : 3 + Math.floor(target.tier / 3);
    t.round = 0;
    t.log.push(t.kind === 'ascend'
      ? `【飞升天劫】九重天劫降临，共 ${t.rounds} 道雷火，撑过即得道成仙！`
      : `【渡天劫】天劫降临，共 ${t.rounds} 轮，保住肉身方为大成。`);
  }
  return t;
}

// 心魔通过概率
function heartPassChance(player, t) {
  return clamp(0.38 + player.spirit / 250 + player.rootBonus + (t.hadReq ? 0.15 : 0), 0.3, 0.95);
}

// 考验中玩家做出选择，推进一轮
export function trialRespond(trial, player, action, rng) {
  if (trial.over) return { logs: [], over: true, success: trial.success };
  const logs = [];

  if (trial.kind === 'heart') {
    if (action.type === 'pill') {
      if (hasItem(player, 'pill_qingxin')) {
        removeItem(player, 'pill_qingxin', 1);
        trial.passes += 1;
        logs.push('你服下清心丹，心如止水，本轮稳渡。');
      } else {
        logs.push('你没有清心丹，只能强守本心。');
        if (chance(rng, heartPassChance(player, trial))) { trial.passes += 1; logs.push('神识坚定，守住本心！'); }
        else logs.push('心魔趁虚而入，本轮失守。');
      }
    } else { // stand
      if (chance(rng, heartPassChance(player, trial))) { trial.passes += 1; logs.push('你坚守本心，勘破一重魔障！'); }
      else logs.push('心魔搅动神魂，这一关你失守了。');
    }
    trial.round += 1;
    if (trial.round >= trial.rounds) {
      trial.over = true;
      trial.success = trial.passes >= Math.ceil(trial.rounds / 2);
    }
    return { logs, over: trial.over, success: trial.success };
  }

  // —— 天劫 / 飞升：每轮一道雷火 ——
  const baseDmg = player.maxHp * (trial.kind === 'ascend' ? 0.26 : 0.18 + trial.tier * 0.018);
  let dmg = baseDmg * (0.85 + (rng ? rng() : Math.random()) * 0.3);
  let instantFail = trial.kind === 'ascend' ? 0.06 : 0.02 + trial.tier * 0.004;
  if (trial.hadReq) instantFail -= 0.06;
  if (player.equipment) instantFail -= 0.03;
  instantFail = Math.max(0, instantFail);

  if (action.type === 'treasure') {
    if (player.equipment) { dmg *= 0.35; logs.push('你祭出法宝硬抗天劫，劫力被卸去大半！'); }
    else { dmg *= 0.9; logs.push('你徒手抗劫，所受不轻。'); }
  } else if (action.type === 'pill') {
    if (hasItem(player, 'pill_huitian') || hasItem(player, 'pill_huitian2')) {
      const id = hasItem(player, 'pill_huitian2') ? 'pill_huitian2' : 'pill_huitian';
      removeItem(player, id, 1);
      const heal = id === 'pill_huitian2' ? 0.7 : 0.4;
      player.hp = Math.min(player.maxHp, player.hp + Math.round(player.maxHp * heal));
      logs.push(`你服下${id === 'pill_huitian2' ? '中品回血丹' : '回血丹'}，气血回涌。`);
    } else {
      logs.push('你没有回血丹可用！只能硬扛。');
    }
    dmg *= 0.8;
  } else { // endure
    logs.push('你咬牙硬抗这一道天劫。');
  }

  // 天威：极小概率直接失败
  if (chance(rng, instantFail)) {
    player.hp = 1;
    trial.over = true; trial.success = false;
    logs.push('天威难测，劫雷直贯神魂，渡劫失败！');
    return { logs, over: true, success: false };
  }

  player.hp -= Math.round(dmg);
  logs.push(`天劫轰至，你承受 ${Math.round(dmg)} 点劫伤。`);
  if (player.hp <= 0) {
    player.hp = 1;
    trial.over = true; trial.success = false;
    logs.push('肉身难支，渡劫失败，重伤退避。');
    return { logs, over: true, success: false };
  }

  trial.round += 1;
  if (trial.round >= trial.rounds) {
    trial.over = true; trial.success = true;
    logs.push('你挺过最后一道天劫，劫云散去！');
  }
  return { logs, over: trial.over, success: trial.success };
}

// 突破成功：晋升境界 + 奖励
export function advanceRealm(player, target) {
  // 先记下"满额之外"累积的修为（闭关溢出），晋升后结转至下一境界，不再清零浪费。
  const carry = xpOverflow(player);
  player.tier = target.tier;
  player.sub = target.sub;
  recompute(player);
  // 结转溢出修为：新一境界同样允许溢出，故按上限兜底即可。
  player.xp = Math.min(player.xpMax, Math.max(0, carry));
  fullHeal(player);
  player.stats.breakthroughs += 1;
  player.stats.breakthroughStreak += 1;
  // 奖励：灵石 + 偶得配方/称号
  const reward = Math.round(30 * (player.tier + 1) * (1 + player.sub * 0.3));
  addStones(player, reward);
  // 称号：首次到筑基/结丹/飞升
  if (player.tier === 2 && !player.titles.includes('title_qidao')) grantTitle(player, 'title_qidao');
  if (player.tier === 3 && !player.titles.includes('title_xianyuan')) grantTitle(player, 'title_xianyuan');
  if (player.stats.breakthroughStreak >= 10) grantAchievement(player, 'ach_streak10');
  if (player.tier >= ASCEND_INDEX) {
    player.ascended = true;
    grantAchievement(player, 'ach_ascend');
  }
  return { stones: reward };
}

// 大境界突破失败的惩罚（心魔：修为回退；天劫：已扣血，再小幅修为回退）
export function failMajor(player, kind) {
  player.xp = Math.floor(player.xpMax * (kind === 'heart' ? 0.5 : 0.7));
  player.stats.breakthroughStreak = 0;
  recompute(player);
}
