// ============================================================================
// 坊市系统：随机刷新商品（价格浮动），支持买入/卖出；魔劫入侵时物价飙升。
// ============================================================================
import { ITEMS, PILL_LIST, MATERIAL_LIST, TREASURE_LIST, TECHNIQUE_LIST } from '../data/items.js';
import { ALL_RECIPES } from '../data/recipes.js';
import { chaosActive } from './explore.js';
import { addStones, spendStones, addItem, removeItem, countItem, hasItem, bagFull, learnTechnique, learnRecipe } from './player.js';
import { pick, chance } from './rng.js';

// 商品价格：基础 × (0.9~1.15 浮动) × (魔劫 ? 1.5 : 1)
function priced(base, rng, mojie) {
  const fluct = 0.9 + (rng || Math.random)() * 0.25;
  return Math.max(1, Math.round(base * fluct * (mojie ? 1.5 : 1)));
}

// 刷新坊市货架
export function rollMarket(player, rng) {
  const mojie = chaosActive(player) === 'mojie';
  const entries = [];
  const addEntry = (id, maxStock) => {
    const def = ITEMS[id] || (ALL_RECIPES.find((r) => r.id === id));
    if (!def) return;
    const base = def.price || 40;
    entries.push({
      id,
      name: def.name || id,
      emoji: def.emoji || '📦',
      kind: def.type || 'recipe',
      price: priced(base, rng, mojie),
      stock: 1 + Math.floor((rng || Math.random)() * maxStock),
      isRecipe: !ITEMS[id],
    });
  };

  // 2~3 丹药
  const pills = pickN(rng, PILL_LIST, 2 + Math.floor((rng || Math.random)() * 2));
  pills.forEach((p) => addEntry(p.id, 3));
  // 2~3 材料
  const mats = pickN(rng, MATERIAL_LIST, 2 + Math.floor((rng || Math.random)() * 2));
  mats.forEach((m) => addEntry(m.id, 4));
  // 法宝（较低概率上架）
  if (chance(rng, 0.6)) addEntry(pick(rng, TREASURE_LIST).id, 1);
  // 功法（更低概率）
  if (chance(rng, 0.3)) addEntry(pick(rng, TECHNIQUE_LIST).id, 1);
  // 配方（低概率）
  if (chance(rng, 0.35)) {
    const rcp = pick(rng, ALL_RECIPES);
    entries.push({ id: rcp.id, name: rcp.name, emoji: '📜', kind: 'recipe', price: priced(Math.round(rcp.diff * 80), rng, mojie), stock: 1, isRecipe: true });
  }
  return { entries, mojie };
}

// 购买：成功返回 true 并结算；entry 来自当前货架快照
export function buyItem(player, entry, qty = 1) {
  qty = Math.min(qty, entry.stock);
  if (qty <= 0) return { ok: false, reason: '库存不足' };
  const cost = entry.price * qty;
  if (!spendStones(player, cost)) return { ok: false, reason: '灵石不足' };
  entry.stock -= qty;
  // 配方/功法直接学习（不占背包）
  if (entry.isRecipe) { learnRecipe(player, entry.id); return { ok: true, learned: true, qty: 1, cost }; }
  const def = ITEMS[entry.id];
  if (def && def.type === 'technique') { learnTechnique(player, entry.id); return { ok: true, learned: true, qty: 1, cost }; }
  if (bagFull(player) && !countItem(player, entry.id)) { addStones(player, cost); return { ok: false, reason: '背包已满' }; }
  addItem(player, entry.id, qty);
  return { ok: true, qty, cost };
}

// 出售价 ≈ 基础价 × 0.5
export function sellPrice(id) {
  const def = ITEMS[id];
  if (!def) return 1;
  return Math.max(1, Math.round(def.price * 0.5));
}
export function sellItem(player, id, qty = 1) {
  const have = countItem(player, id);
  qty = Math.min(qty, have);
  if (qty <= 0) return { ok: false, reason: '无此物品' };
  removeItem(player, id, qty);
  const gain = sellPrice(id) * qty;
  addStones(player, gain);
  return { ok: true, qty, gain };
}

function pickN(rng, arr, n) {
  const pool = arr.slice();
  const out = [];
  for (let i = 0; i < n && pool.length; i++) {
    const idx = Math.floor((rng || Math.random)() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}
