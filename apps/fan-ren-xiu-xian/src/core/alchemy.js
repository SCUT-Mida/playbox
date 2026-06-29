// ============================================================================
// 炼丹 / 炼器：消耗材料按配方掷骰，产出受神识与难度影响，品质随机波动。
// ============================================================================
import { clamp } from '../config.js';
import { ALCHEMY_RECIPES, FORGE_BLUEPRINTS, RECIPE_BY_ID } from '../data/recipes.js';
import { ITEMS } from '../data/items.js';
import { removeItem, hasItem, addItemOrLog, addStones, countItem, talentAlchemyBonus } from './player.js';
import { recordSectActivity } from './sect.js';
import { chance } from './rng.js';

// 是否拥有配方所需全部材料
export function hasMaterials(player, inputs) {
  return Object.entries(inputs).every(([id, n]) => countItem(player, id) >= n);
}
export function consumeMaterials(player, inputs) {
  for (const [id, n] of Object.entries(inputs)) removeItem(player, id, n);
}

// 成功率：神识越高越易成，难度越高越难；天赋（丹道天才/神识通明）额外加成
export function successRate(player, diff) {
  return clamp(0.55 + (player.spirit - 10) / 220 - (diff - 1) * 0.13 + talentAlchemyBonus(player), 0.15, 0.95);
}

// 炼丹
export function tryAlchemy(player, recipeId, rng) {
  const recipe = RECIPE_BY_ID[recipeId];
  if (!recipe) return { ok: false, reason: '无此丹方' };
  if (!player.recipes.includes(recipeId)) return { ok: false, reason: '尚未掌握此丹方' };
  if (!hasMaterials(player, recipe.inputs)) return { ok: false, reason: '材料不足' };

  consumeMaterials(player, recipe.inputs);
  const rate = successRate(player, recipe.diff);
  const success = chance(rng, rate);
  const logs = [];

  if (!success) {
    player.stats.alchemyFails += 1;
    // 「万事开头难」成就由 checkAchievements 统一按 alchemyFails 检测授予（UI 各动作后调用）
    logs.push({ text: `炼制【${recipe.name}】失败，丹炉炸裂，材料化为灰烬。`, type: 'bad' });
    return { ok: true, success: false, logs };
  }

  // 品质掷骰：低阶 / 正常 / 极品
  const r = (rng || Math.random)();
  let quality = 'normal';
  let qty = 1;
  if (r < 0.2) { quality = 'low'; qty = 1; }
  else if (r > 0.8) { quality = 'high'; qty = 2; }
  player.stats.alchemyOk += 1;
  recordSectActivity(player, 'craft'); // 宗门任务：成功炼丹 +1
  const { added, log: addLog } = addItemOrLog(player, recipe.out, qty);
  const name = ITEMS[recipe.out] ? ITEMS[recipe.out].name : recipe.out;
  // 背包满且为新种类时产物无法入袋：提示遗失，避免“成功炼制 0 ×”的静默丢物
  if (added === 0) logs.push(addLog);
  else if (quality === 'high') logs.push({ text: `🔥 极品成丹！炼出 ${added} × ${name}。`, type: 'epic' });
  else if (quality === 'low') logs.push({ text: `成丹品质平平，得 ${added} × ${name}。`, type: 'normal' });
  else logs.push({ text: `成功炼制 ${added} × ${name}。`, type: 'good' });
  return { ok: true, success: true, quality, qty: added, out: recipe.out, logs };
}

// 炼器（产出法宝；品质影响是否附带额外灵石/结晶）
export function tryForge(player, blueprintId, rng) {
  const bp = RECIPE_BY_ID[blueprintId];
  if (!bp) return { ok: false, reason: '无此器图' };
  if (!player.recipes.includes(blueprintId)) return { ok: false, reason: '尚未掌握此器图' };
  if (!hasMaterials(player, bp.inputs)) return { ok: false, reason: '材料不足' };

  consumeMaterials(player, bp.inputs);
  const rate = successRate(player, bp.diff);
  const success = chance(rng, rate);
  const logs = [];

  if (!success) {
    logs.push({ text: `锻造【${bp.name}】失败，矿石损毁。`, type: 'bad' });
    addStones(player, 5); // 残渣折价
    return { ok: true, success: false, logs };
  }
  const r = (rng || Math.random)();
  const quality = r > 0.8 ? 'high' : r < 0.2 ? 'low' : 'normal';
  recordSectActivity(player, 'craft'); // 宗门任务：成功炼器 +1
  const { added, log: addLog } = addItemOrLog(player, bp.out, 1);
  const name = ITEMS[bp.out] ? ITEMS[bp.out].name : bp.out;
  // 背包满且为新种类时法宝无法入袋：提示遗失，避免“神兵出炉”却凭空消失
  if (added === 0) {
    logs.push(addLog);
  } else if (quality === 'high') {
    addStones(player, 30);
    logs.push({ text: `✨ 神兵出炉！锻得【${name}】，另得余料灵石。`, type: 'epic' });
  } else if (quality === 'low') {
    logs.push({ text: `勉强锻成【${name}】，品相一般。`, type: 'normal' });
  } else {
    logs.push({ text: `成功锻得【${name}】。`, type: 'good' });
  }
  return { ok: true, success: true, quality, out: bp.out, logs };
}

export const ALCHEMY_LIST = ALCHEMY_RECIPES;
export const FORGE_LIST = FORGE_BLUEPRINTS;
