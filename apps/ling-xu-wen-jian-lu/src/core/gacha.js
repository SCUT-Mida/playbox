// ============================================================================
// 问道（抽卡）系统（设计稿 5.3）：单抽 / 十连，含保底与每日免费。
//   - 累计 90 抽必出 SSR（pitySSR）
//   - 每 30 抽必出 SR（pitySR，跨池计数）
//   - 十连保底至少 1 张 SR
//   - 每日首次单抽免费
// 重复抽到同一卡 → 转为对应灵契碎片（设计稿 dupFrags）。
// ============================================================================
import { RARITIES, rarityDef, GACHA, dayKey, clamp } from '../config.js';
import { CARDS, CARD_MAP } from '../data/cards.js';
import { ownCard, addFrag, hasCard, countRes } from './player.js';
import { weighted, pick } from './rng.js';

// 今日是否可领免费单抽
export function dailyFreeAvailable(player) {
  return GACHA.dailyFree && player.dailyFreeDate !== dayKey();
}

// 按基础概率滚动稀有度（SSR 5% / SR 25% / R 70%）
function baseRollRarity(rng) {
  const r = (rng || Math.random)();
  if (r < RARITIES[2].rate) return 'SSR';          // < 0.05
  if (r < RARITIES[2].rate + RARITIES[1].rate) return 'SR'; // < 0.30
  return 'R';
}

// 在指定稀有度内随机选一张卡
function pickCard(rarity, rng) {
  const pool = CARDS.filter((c) => c.rarity === rarity);
  if (!pool.length) return CARDS[0];
  return pick(rng, pool);
}

// 执行一次抽卡（内部：已扣资源 / 已记账 pity，由 drawOne / drawTen 调用）
function doDraw(player, rng) {
  const pity = player.pity;
  pity.sinceSSR = (pity.sinceSSR || 0) + 1;
  pity.sinceSR = (pity.sinceSR || 0) + 1;
  pity.total = (pity.total || 0) + 1;

  let rarity;
  if (pity.sinceSSR >= GACHA.pitySSR) {
    rarity = 'SSR';
  } else {
    rarity = baseRollRarity(rng);
    // 每 30 抽保底 SR：抽到 R 时若已累计达标，则提升为 SR
    if (rarity === 'R' && pity.sinceSR >= GACHA.pitySR) rarity = 'SR';
  }

  if (rarity === 'SSR') { pity.sinceSSR = 0; pity.sinceSR = 0; }
  else if (rarity === 'SR') { pity.sinceSR = 0; }

  const card = pickCard(rarity, rng);
  const wasNew = !hasCard(player, card.id);
  ownCard(player, card.id);
  const frag = wasNew ? 0 : GACHA.dupFrags[rarity];
  if (frag) addFrag(player, card.id, frag);

  // 统计
  player.stats.draws = (player.stats.draws || 0) + 1;
  if (rarity === 'SSR') player.stats.ssr++;
  else if (rarity === 'SR') player.stats.sr++;
  else player.stats.r++;

  return { rarity, cardId: card.id, name: card.name, isNew: wasNew, frag };
}

// 单抽。free=true 时不消耗问道令（每日免费）。
export function drawOne(player, rng, opts = {}) {
  if (opts.free) {
    if (!dailyFreeAvailable(player)) return { error: '今日免费已用' };
    player.dailyFreeDate = dayKey();
  } else {
    if (countRes(player, 'wendao') < 1) return { error: '问道令不足' };
    player.res.wendao -= 1;
  }
  const result = doDraw(player, rng);
  return { results: [result], free: !!opts.free };
}

// 十连。消耗 问道令×10；保底至少 1 张 SR。
export function drawTen(player, rng) {
  if (countRes(player, 'wendao') < 10) return { error: '问道令不足（需 10）' };
  player.res.wendao -= 10;
  const results = [];
  for (let i = 0; i < 10; i++) results.push(doDraw(player, rng));
  // 十连保底：若无 SR/SSR，则将末张提升为 SR
  if (GACHA.tenGuaranteeSR && !results.some((r) => r.rarity === 'SR' || r.rarity === 'SSR')) {
    const last = results[results.length - 1];
    const card = pickCard('SR', rng);
    const wasNew = !hasCard(player, card.id);
    ownCard(player, card.id);
    const frag = wasNew ? 0 : GACHA.dupFrags.SR;
    if (frag) addFrag(player, card.id, frag);
    // 维持 pity 一致：保底 SR 重置 sinceSR
    player.pity.sinceSR = 0;
    player.stats.sr++;
    player.stats.r = Math.max(0, (player.stats.r || 1) - 1);
    results[results.length - 1] = { rarity: 'SR', cardId: card.id, name: card.name, isNew: wasNew, frag };
  }
  return { results };
}

// 距下个 SSR 保底还差几抽
export function pitySSRRemaining(player) {
  return Math.max(0, GACHA.pitySSR - (player.pity.sinceSSR || 0));
}
export function pitySRRemaining(player) {
  return Math.max(0, GACHA.pitySR - (player.pity.sinceSR || 0));
}
