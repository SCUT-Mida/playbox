// ============================================================================
// 战斗系统：文字回合制。动作：attack / defend / skill(法宝) / item(丹药) / flee
// battleStep 返回每回合日志与是否结束；胜负奖励由调用方按 enemy.rewards 结算。
// ============================================================================
import { computeDamage, counterMult } from '../config.js';
import { ITEMS, TREASURE_SKILLS } from '../data/items.js';
import { chance } from './rng.js';

export function createBattle(player, enemy) {
  return {
    enemy: { ...enemy },
    round: 0,
    log: [`【遭遇】${enemy.name}（气血 ${enemy.hp}/${enemy.maxHp}）现身！`],
    over: false,
    result: null,
    defending: false,
    fled: false,
  };
}

// 玩家执行一个动作；返回 { logs, over, result }
export function battleStep(battle, player, action, rng) {
  if (battle.over) return { logs: [], over: true, result: battle.result };
  const logs = [];
  battle.round += 1;
  battle.defending = false; // 每回合重置防御态（defend 动作会在本回合内重新置位）

  const enemy = battle.enemy;

  // —— 玩家行动 ——
  switch (action.type) {
    case 'attack': {
      const dmg = computeDamage(player.atk, enemy.def, rng, counterMult(player.element, enemy.el));
      enemy.hp -= dmg;
      logs.push(`你出招攻击，对${enemy.name}造成 ${dmg} 点伤害。`);
      break;
    }
    case 'defend': {
      battle.defending = true;
      logs.push('你凝神防御，减少本回合所受伤害。');
      break;
    }
    case 'skill': {
      const eq = player.equipment ? ITEMS[player.equipment] : null;
      const skillId = eq && eq.stats && eq.stats.skill;
      const skill = skillId ? TREASURE_SKILLS[skillId] : null;
      if (!skill) {
        logs.push('你未装备带技能的法宝，改为普通攻击。');
        const dmg = computeDamage(player.atk, enemy.def, rng, counterMult(player.element, enemy.el));
        enemy.hp -= dmg;
        logs.push(`对${enemy.name}造成 ${dmg} 点伤害。`);
      } else {
        const dmg = computeDamage(player.atk * skill.mult, enemy.def, rng, counterMult(skill.el, enemy.el));
        enemy.hp -= dmg;
        logs.push(`你催动${eq.name}使出【${skill.name}】，对${enemy.name}造成 ${dmg} 点伤害！`);
      }
      break;
    }
    case 'item': {
      const pill = ITEMS[action.itemId];
      if (!pill || pill.type !== 'pill' || !player.bag[action.itemId]) {
        logs.push('没有可用的丹药，你错失良机！');
        break;
      }
      // 战斗中只允许使用恢复类丹药
      if (pill.effect && (pill.effect.kind === 'heal_hp' || pill.effect.kind === 'heal_mp')) {
        applyPillEffect(player, pill);
        player.bag[action.itemId] -= 1;
        if (player.bag[action.itemId] <= 0) delete player.bag[action.itemId];
        logs.push(`你服下一颗${pill.name}。`);
      } else {
        logs.push(`${pill.name}无法在战斗中使用！`);
      }
      break;
    }
    case 'flee': {
      // 遁地符必成（消耗一张）
      if (player.bag.fuchou) {
        player.bag.fuchou -= 1;
        if (player.bag.fuchou <= 0) delete player.bag.fuchou;
        logs.push('你祭出遁地符，化作流光远遁！');
        battle.over = true; battle.result = 'flee'; battle.fled = true;
        return { logs, over: true, result: 'flee' };
      }
      if (chance(rng, 0.55)) {
        logs.push('你成功脱战，逃离了战场。');
        battle.over = true; battle.result = 'flee'; battle.fled = true;
        return { logs, over: true, result: 'flee' };
      }
      logs.push('你试图逃跑，却被截住了去路！');
      break;
    }
    default:
      logs.push('未知动作。');
  }

  // —— 判定敌方是否被击败 ——
  if (enemy.hp <= 0) {
    enemy.hp = 0;
    battle.over = true; battle.result = 'win';
    logs.push(`你击败了${enemy.name}！`);
    return { logs, over: true, result: 'win' };
  }

  // —— 敌方反击 ——
  const incoming = computeDamage(enemy.atk, player.def, rng, counterMult(enemy.el, player.element));
  const final = battle.defending ? Math.max(1, Math.round(incoming * 0.5)) : incoming;
  player.hp -= final;
  logs.push(`${enemy.name}反击，对你造成 ${final} 点伤害。`);

  if (player.hp <= 0) {
    player.hp = 1; // 保留 1 点气血，不真正死亡
    battle.over = true; battle.result = 'lose';
    logs.push('你寡不敌众，重伤败退……');
    return { logs, over: true, result: 'lose' };
  }
  return { logs, over: false, result: null };
}

function applyPillEffect(player, pill) {
  const e = pill.effect;
  if (e.kind === 'heal_hp') player.hp = Math.min(player.maxHp, player.hp + Math.round(player.maxHp * e.pct));
  if (e.kind === 'heal_mp') player.mp = Math.min(player.maxMp, player.mp + Math.round(player.maxMp * e.pct));
}

// 结算胜利奖励：返回 { logs, gain }。gain 描述「掉落了什么」，由调用方落库并按实际入袋情况
// （背包满可能遗失）打印日志；此处不再断言「获得 N × 物品 / 意外掉落法宝」，以免与背包满
// 致遗失的真实结果自相矛盾。仅灵石恒定获得，可在此直接日志。
export function battleRewards(player, enemy, rng) {
  const r = enemy.rewards || {};
  const logs = [];
  const gain = { stones: 0, items: [], treasure: null, recipe: null };
  if (r.stones) { gain.stones = r.stones; logs.push(`获得 ${r.stones} 灵石。`); }
  for (const d of (r.drops || [])) gain.items.push(d);
  if (r.rare) {
    if (r.rare.kind === 'treasure') gain.treasure = r.rare.id;
    if (r.rare.kind === 'recipe') gain.recipe = r.rare.id;
  }
  return { logs, gain };
}
