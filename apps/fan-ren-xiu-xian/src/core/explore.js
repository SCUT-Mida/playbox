// ============================================================================
// 探索系统：随机场景 + 加权事件抽取（含保底机制）。applyReward 统一结算奖励规约。
// ============================================================================
import { pick, weighted } from './rng.js';
import { eligibleEvents, SCENES, SCENE_NAMES } from '../data/events.js';
import { makeEnemy } from '../data/enemies.js';
import {
  EXPLORE_MP_COST, EXPLORE_HP_COST, PITTY_THRESHOLD, PITTY_BOOST, nowSec,
  pityThresholdForQiyun, rareBoostForQiyun,
} from '../config.js';
import {
  addStones, addXp, addItem, addItemOrLog, learnTechnique, learnRecipe, grantTitle,
  upgradeRoot, bagFull, removeItem, hasItem, effectiveQiyun,
} from './player.js';
import { recordSectActivity } from './sect.js';
import { ITEMS } from '../data/items.js';
import { RECIPE_BY_ID } from '../data/recipes.js';

// 执行一次探索：返回 { encounter, scene } 或 { error }
export function rollExplore(player, rng) {
  if (player.mp < EXPLORE_MP_COST) return { error: '灵力不足，无法探索' };
  if (player.hp <= EXPLORE_HP_COST) return { error: '气血过低，不宜探索' };

  // 先校验事件池再扣消耗，避免“付费（扣 mp/hp）却无事件可遇”
  const scene = pick(rng, SCENES);
  const events = eligibleEvents(player.tier, scene);
  if (!events.length) return { error: '此处无可探索之事', scene };

  player.mp -= EXPLORE_MP_COST;
  player.hp = Math.max(1, player.hp - EXPLORE_HP_COST);

  // 构造权重表；保底机制：连续多次无稀有事件则提升稀有权重
  // 气运影响：气运越高 → 保底阈值越低（更早触发奇遇加成）、稀有事件权重越高
  const pity = player.pity.explore;
  const qy = effectiveQiyun(player);
  const threshold = pityThresholdForQiyun(qy);
  const rareBoost = rareBoostForQiyun(qy);
  const entries = events.map((e) => ({
    item: e,
    weight: e.rare ? e.weight * (pity >= threshold ? 1 + PITTY_BOOST : 1) * rareBoost : e.weight,
  }));
  const event = weighted(rng, entries);

  const encounter = event.run(player, rng);
  player.stats.exploreCount += 1;
  if (event.rare) player.pity.explore = 0;
  else player.pity.explore = pity + 1;
  recordSectActivity(player, 'explore'); // 宗门任务：外出探索 +1

  return { encounter, scene, sceneName: SCENE_NAMES[scene] };
}

// 结算奖励规约：返回日志条目数组 [{text, type}]
export function applyReward(player, reward, rng) {
  const logs = [];
  const push = (text, type = 'normal') => logs.push({ text, type });
  if (!reward) return logs;
  if (reward.stones) { addStones(player, reward.stones); push(`+${reward.stones} 灵石`, 'good'); }
  if (reward.items) {
    for (const it of reward.items) {
      const { log } = addItemOrLog(player, it.id, it.qty);
      push(log.text, log.type);
    }
  }
  if (reward.xp) { const g = addXp(player, reward.xp); push(`+${g} 修为`, 'good'); }
  if (reward.hp) {
    player.hp = Math.max(1, Math.min(player.maxHp, player.hp + reward.hp));
    push(`${reward.hp > 0 ? '+' : ''}${reward.hp} 气血`, reward.hp > 0 ? 'good' : 'bad');
  }
  if (reward.mp) {
    player.mp = Math.max(0, Math.min(player.maxMp, player.mp + reward.mp));
    push(`${reward.mp > 0 ? '+' : ''}${reward.mp} 灵力`, reward.mp > 0 ? 'good' : 'bad');
  }
  if (reward.fullHeal) { player.hp = player.maxHp; player.mp = player.maxMp; push('气血灵力全复', 'good'); }
  if (reward.treasure) {
    const added = addItem(player, reward.treasure, 1);
    push(added ? `获得法宝【${ITEMS[reward.treasure].name}】` : `背包已满，遗失【${ITEMS[reward.treasure].name}】`, added ? 'epic' : 'bad');
  }
  if (reward.technique) {
    const learned = learnTechnique(player, reward.technique);
    push(learned ? `习得功法【${ITEMS[reward.technique].name}】` : `已有功法【${ITEMS[reward.technique].name}】，折为灵石`, learned ? 'epic' : 'normal');
    if (!learned) addStones(player, 100);
  }
  if (reward.recipe) {
    const learned = learnRecipe(player, reward.recipe);
    // 配方名映射：奖励里给的是配方 id（rcp_xxx / bp_xxx），需查表转中文名，
    // 否则日志会冒出未映射的英文 id（组队探险奖励的常见症状）。
    const rname = (RECIPE_BY_ID[reward.recipe] && RECIPE_BY_ID[reward.recipe].name) || reward.recipe;
    push(learned ? `获得配方【${rname}】` : `已有配方【${rname}】，折为灵石`, learned ? 'good' : 'normal');
    if (!learned) addStones(player, 40);
  }
  if (reward.title) { grantTitle(player, reward.title); push(`获得称号`, 'epic'); }
  if (reward.rootUp) {
    const up = upgradeRoot(player);
    push(up ? '灵根提升！资质更上一层' : '灵根已至极境，无法再升', up ? 'epic' : 'normal');
  }
  if (reward.chaos) {
    applyChaos(player, reward.chaos);
  }
  if (reward.log) push(reward.log, reward.logType || 'normal');
  return logs;
}

// 世界级混沌事件 buff
export function applyChaos(player, chaos) {
  if (!player.chaos) player.chaos = {};
  if (chaos.kind === 'lingchao') player.chaos.speedBoostUntil = nowSec() + chaos.speedBoostSec;
  if (chaos.kind === 'mojie') player.chaos.priceBoostUntil = nowSec() + chaos.priceBoostSec;
}

export function chaosActive(player) {
  if (!player.chaos) return null;
  const now = nowSec();
  if (player.chaos.speedBoostUntil > now) return 'lingchao';
  if (player.chaos.priceBoostUntil > now) return 'mojie';
  return null;
}
