// ============================================================================
// 大富翁 · 游戏状态机（纯逻辑，无 DOM 依赖）。
//
// 阶段（state.phase）：
//   roll     → 等待当前玩家掷骰（人类点按钮 / AI 自动）
//   resolve  → 已落格，待结算格子效果
//   decision → 落在可买/可升的自家产业，等待买地/升级抉择
//   shop     → 落在商店，等待选购道具
//   end      → 本回合行动完毕，等待 endTurn 交给下一位（对子加掷则再来）
//   over     → 终局（仅剩一家 / 主角破产出局）
//
// 掷双骰：对子（两骰同点）加掷一回合（state.extra），连掷三次对子直接入狱；
// 顺风骰 buff 在掷骰时自动多走 SWIFT_BONUS 步。
// 不设回合上限：破产淘汰，一家独大者胜；主角破产即终局结算。
// 所有随机（骰子/抽卡）走 core/rng.js 的确定性种子，存档可完整复现。
// ============================================================================

import {
  MAPS, mapDefOf, boardOf, tilesOf, findTile,
  CHARACTERS, AI_CHARACTERS,
  START_CASH, SALARY, SALARY_LAND_BONUS,
  JAIL_FINE, JAIL_SKIP_TURNS, HOSPITAL_FEE,
  TAX_MIN, MAX_LEVEL, SELL_RATE,
  AI_SAFE_CASH, AI_UPGRADE_CASH,
  CHANCE_CARDS, FATE_CARDS,
  SHOP_ITEMS, SWIFT_BONUS, SWIFT_TURNS, SWIFT_CAP, CHARM_CAP, EQUAL_CAP,
  rentOf, upgradeCost, taxOf, boomMult, BOOM_RATE,
} from '../config.js';
import { rngNext, rollTwoDice } from './rng.js';

const GAME_VERSION = 3;

// —— 天赋数值：购地价 / 罚款减免 ——
export const buyPriceOf = (tile, player) =>
  Math.round(tile.price * (1 - ((player && player.perk && player.perk.trade) || 0)));
export const fineOf = (base, player) =>
  Math.round(base * (1 - ((player && player.perk && player.perk.tough) || 0)));

// —— 建档：heroKey 选主角，aiCount 补 1~3 位 AI 对手，mapKey 选地图 ——
export function newGame({ heroKey, aiCount = 2, mapKey = MAPS[0].key, seed } = {}) {
  const hero = CHARACTERS.find((c) => c.key === heroKey) || CHARACTERS[0];
  const ai = AI_CHARACTERS.slice(0, Math.max(1, Math.min(3, aiCount | 0)));
  const map = mapDefOf(mapKey);
  const board = boardOf(map.key);
  const mkPlayer = (c, isAI) => ({
    key: c.key, name: c.name, look: c.look, isAI,
    perk: { ...(c.perk || {}) },                       // 角色天赋（存档随行）
    cash: START_CASH + ((c.perk && c.perk.cash) || 0), // 天赋本金
    pos: 0, laps: 0,
    skipTurns: 0, bankrupt: false,
    items: { swift: 0, charms: 0 },                    // 道具：顺风骰次数 / 护身符枚数
    equalBought: 0,                                    // 均富卡本局已购数
  });
  const players = [mkPlayer(hero, false), ...ai.map((c) => mkPlayer(c, true))];
  return {
    ver: GAME_VERSION,
    mapKey: map.key,
    round: 1,
    turnIdx: 0,
    phase: 'roll',
    rng: seed | 0,
    lastDice: 0,
    lastRoll: [0, 0],
    doubles: 0,   // 当前玩家连续对子数
    extra: false, // 对子加掷标记（endTurn 消化）
    players,
    tiles: board.map((t) => (t.type === 'prop' ? { owner: -1, level: 0, spent: 0 } : null)),
    log: [],
    finished: null,
  };
}

// —— 查询 ——
export const alivePlayers = (st) => st.players.filter((p) => !p.bankrupt);
export const cur = (st) => st.players[st.turnIdx];
export const tileState = (st, i) => st.tiles[i];
export const boardTiles = (st) => tilesOf(st);
export const mapOf = (st) => mapDefOf(st.mapKey);
export const ownedTilesOf = (st, pIdx) =>
  st.tiles.map((t, i) => (t && t.owner === pIdx ? i : -1)).filter((i) => i >= 0);

export function ownedInDistrict(st, district, owner) {
  let n = 0, total = 0;
  tilesOf(st).forEach((t, i) => {
    if (t.type !== 'prop' || t.district !== district) return;
    total++;
    if (st.tiles[i].owner === owner) n++;
  });
  return { n, total };
}

export function hasMonopoly(st, district, owner) {
  const { n, total } = ownedInDistrict(st, district, owner);
  return n === total;
}

// 总资产 = 现金 + 地产累计投入（近似市值）
export function assetsOf(st, pIdx) {
  const p = st.players[pIdx];
  if (!p) return 0;
  const invested = ownedTilesOf(st, pIdx).reduce((s, i) => s + st.tiles[i].spent, 0);
  return Math.max(0, p.cash) + invested;
}

export function ranking(st) {
  return st.players
    .map((p, idx) => ({ idx, name: p.name, assets: assetsOf(st, idx), bankrupt: p.bankrupt }))
    .sort((a, b) => (a.bankrupt === b.bankrupt ? b.assets - a.assets : a.bankrupt ? 1 : -1));
}

// 现金最富的存活对手（均富卡 / AI 判断用）
export function richestOther(st, pIdx) {
  let rich = -1;
  for (let i = 0; i < st.players.length; i++) {
    if (i === pIdx || st.players[i].bankrupt) continue;
    if (rich < 0 || st.players[i].cash > st.players[rich].cash) rich = i;
  }
  return rich;
}

// —— 日志 ——
export function log(st, text) {
  st.log.push(`[R${st.round}] ${text}`);
  if (st.log.length > 80) st.log.splice(0, st.log.length - 80);
}

// —— 移动（steps 可为负）——
export function movePlayer(st, pIdx, steps) {
  const p = st.players[pIdx];
  const count = st.tiles.length;
  const from = p.pos;
  let dest = ((from + steps) % count + count) % count;
  const passedStart = steps > 0 && from + steps >= count;
  const landedStart = dest === 0;
  if (passedStart) {
    p.cash += SALARY;
    p.laps++;
    log(st, `${p.name} 经过起点，领工资 ${SALARY}`);
  }
  if (landedStart && steps > 0) {
    p.cash += SALARY_LAND_BONUS;
    log(st, `${p.name} 恰落起点，额外奖励 ${SALARY_LAND_BONUS}`);
  }
  p.pos = dest;
  return { passedStart, landedStart, from, dest };
}

// —— 支付：to 为玩家下标或 null（银行）。现金不足时按投入升序自动变卖地产，
//    仍不足则破产（地产全部释放归零，债权人拿到剩余全部现金）。
export function payTo(st, fromIdx, toIdx, amount) {
  const from = st.players[fromIdx];
  const to = toIdx == null ? null : st.players[toIdx];
  const paid = { amount: 0, sold: [], bankrupt: false };
  if (amount <= 0) return paid;
  // 自动变卖：先卖投入最小的地产，尽量保住大头产业
  while (from.cash < amount) {
    const owned = ownedTilesOf(st, fromIdx).sort((a, b) => st.tiles[a].spent - st.tiles[b].spent);
    if (!owned.length) break;
    const i = owned[0];
    const ts = st.tiles[i];
    const refund = Math.round(ts.spent * SELL_RATE);
    from.cash += refund;
    paid.sold.push(i);
    ts.owner = -1; ts.level = 0; ts.spent = 0;
    log(st, `${from.name} 变卖「${tilesOf(st)[i].name}」抵债，回收 ${refund}`);
  }
  if (from.cash >= amount) {
    from.cash -= amount;
    if (to) to.cash += amount;
    paid.amount = amount;
  } else {
    // 破产：清空现金给债权人，释放名下全部地产
    paid.amount = from.cash;
    if (to) to.cash += from.cash;
    from.cash = 0;
    for (const i of ownedTilesOf(st, fromIdx)) {
      const ts = st.tiles[i];
      ts.owner = -1; ts.level = 0; ts.spent = 0;
    }
    from.bankrupt = true;
    paid.bankrupt = true;
    log(st, `${from.name} 无力偿付，宣告破产！`);
    checkGameOver(st);
  }
  return paid;
}

// 终局判定：仅剩一家 → 一家独大；主角破产 → 直接结算（观战无意义）。
export function checkGameOver(st) {
  if (st.finished) return;
  if (alivePlayers(st).length <= 1) {
    finishGame(st, 'last');
  } else if (st.players[0].bankrupt) {
    finishGame(st, 'dead');
  }
}

export function finishGame(st, reason) {
  st.phase = 'over';
  st.finished = { reason, ranking: ranking(st) };
}

// —— 买地 / 升级（decision 阶段）——
export function buyTile(st, tileIdx) {
  const p = cur(st);
  const t = tilesOf(st)[tileIdx];
  const ts = st.tiles[tileIdx];
  if (st.phase !== 'decision' || !ts || ts.owner !== -1) return { ok: false };
  const cost = buyPriceOf(t, p);
  if (p.cash < cost) return { ok: false };
  p.cash -= cost;
  ts.owner = st.turnIdx;
  ts.level = 1;
  ts.spent = cost;
  st.phase = 'end';
  log(st, `${p.name} 以 ${cost} 买下「${t.name}」${cost < t.price ? `（原价 ${t.price}）` : ''}`);
  return { ok: true };
}

export function upgradeTile(st, tileIdx) {
  const p = cur(st);
  const t = tilesOf(st)[tileIdx];
  const ts = st.tiles[tileIdx];
  if (st.phase !== 'decision' || !ts || ts.owner !== st.turnIdx || ts.level >= MAX_LEVEL) return { ok: false };
  const cost = upgradeCost(t, ts.level);
  if (p.cash < cost) return { ok: false };
  p.cash -= cost;
  ts.level += 1;
  ts.spent += cost;
  st.phase = 'end';
  log(st, `${p.name} 花费 ${cost} 将「${t.name}」升到 ${ts.level} 级`);
  return { ok: true };
}

export function declineDecision(st) {
  if (st.phase !== 'decision') return;
  st.phase = 'end';
}

// —— 商店（shop 阶段）——
export function buyItem(st, itemId) {
  const p = cur(st);
  if (st.phase !== 'shop' || st.finished) return { ok: false, reason: 'phase' };
  const item = SHOP_ITEMS.find((s) => s.id === itemId);
  if (!item) return { ok: false, reason: 'item' };
  if (p.cash < item.price) return { ok: false, reason: 'cash' };
  if (itemId === 'swift' && p.items.swift >= SWIFT_CAP) return { ok: false, reason: 'cap' };
  if (itemId === 'charm' && p.items.charms >= CHARM_CAP) return { ok: false, reason: 'cap' };
  if (itemId === 'equal' && p.equalBought >= EQUAL_CAP) return { ok: false, reason: 'cap' };
  p.cash -= item.price;
  if (itemId === 'swift') {
    p.items.swift = Math.min(SWIFT_CAP, p.items.swift + SWIFT_TURNS);
    log(st, `${p.name} 购入顺风骰（生效 ${p.items.swift} 次掷骰）`);
  } else if (itemId === 'charm') {
    p.items.charms += 1;
    log(st, `${p.name} 购入护身符（持有 ${p.items.charms} 枚）`);
  } else if (itemId === 'equal') {
    // 无存活对手可平分时回滚扣款、不计限购（避免付费无效果）
    if (!applyEqualize(st, st.turnIdx)) {
      p.cash += item.price;
      return { ok: false, reason: 'no_target' };
    }
    p.equalBought += 1;
  }
  return { ok: true };
}

export function leaveShop(st) {
  if (st.phase !== 'shop') return;
  st.phase = 'end';
}

// 均富卡：与现金最多的存活对手平分双方现金
export function applyEqualize(st, pIdx) {
  const p = st.players[pIdx];
  const richIdx = richestOther(st, pIdx);
  if (richIdx < 0) return false;
  const rich = st.players[richIdx];
  const total = p.cash + rich.cash;
  p.cash = Math.round(total / 2);
  rich.cash = total - p.cash;
  log(st, `均富卡生效：${p.name} 与 ${rich.name} 现金拉平（${p.cash} / ${rich.cash}）`);
  return true;
}

// AI 进店采购：均富卡（明显落后时翻盘）＞ 顺风骰 ＞ 护身符，一次至多买两件
export function aiShopBuy(st) {
  const p = cur(st);
  const bought = [];
  for (let round = 0; round < 2; round++) {
    const richIdx = richestOther(st, st.turnIdx);
    const gap = richIdx >= 0 ? st.players[richIdx].cash - p.cash : 0;
    let want = null;
    if (p.equalBought < EQUAL_CAP && gap >= 600 && p.cash - 260 >= AI_SAFE_CASH) want = 'equal';
    else if (p.items.swift < SWIFT_CAP && p.cash - 140 >= AI_SAFE_CASH) want = 'swift';
    else if (p.items.charms < CHARM_CAP && p.cash - 120 >= AI_SAFE_CASH) want = 'charm';
    if (!want) break;
    const r = buyItem(st, want);
    if (!r.ok) break;
    bought.push(want);
  }
  return bought;
}

// —— 抽卡结算 ——
function applyCard(st, pIdx, card) {
  const p = st.players[pIdx];
  const eff = card.effect || {};
  let resolveAgain = false;
  switch (eff.kind) {
    case 'cash':
      if (eff.amount >= 0) { p.cash += eff.amount; log(st, `${p.name} ${card.text}，+${eff.amount}`); }
      else { payTo(st, pIdx, null, -eff.amount); log(st, `${p.name} ${card.text}，${eff.amount}`); }
      break;
    case 'goto': {
      // 目标可为象征名（start/jail/hospital）或数字索引
      const target = typeof eff.tile === 'string' ? findTile(st, eff.tile) : (eff.tile | 0);
      if (target < 0 || target === p.pos) break;
      // 传送：向前绕行（跨过起点照发工资）
      const forward = (target - p.pos + st.tiles.length) % st.tiles.length;
      if (forward > 0) movePlayer(st, pIdx, forward);
      // 落点效果（监狱/医院）直接结算，不再触发买地抉择
      applyLandingInstant(st, pIdx);
      break;
    }
    case 'move':
      movePlayer(st, pIdx, eff.steps);
      resolveAgain = true; // 退到的格子照常结算（可能是机会/地产）
      break;
    case 'skip':
      p.skipTurns += 1;
      log(st, `${p.name} ${card.text}，停一回合`);
      break;
    case 'take_all':
      for (let i = 0; i < st.players.length; i++) {
        if (i === pIdx || st.players[i].bankrupt) continue;
        payTo(st, i, pIdx, eff.amount);
      }
      log(st, `${p.name} ${card.text}，每位对手付 ${eff.amount}`);
      break;
    case 'give_all': {
      for (let i = 0; i < st.players.length; i++) {
        if (i === pIdx || st.players[i].bankrupt) continue;
        payTo(st, pIdx, i, eff.amount);
        if (p.bankrupt) break; // 破产后无钱可付
      }
      log(st, `${p.name} ${card.text}，给每位对手 ${eff.amount}`);
      break;
    }
    case 'give_rich': {
      const rich = richestOther(st, pIdx);
      if (rich >= 0) { payTo(st, pIdx, rich, eff.amount); log(st, `${p.name} ${card.text}，付 ${eff.amount}`); }
      break;
    }
    case 'upgrade_free': {
      const owned = ownedTilesOf(st, pIdx).filter((i) => st.tiles[i].level < MAX_LEVEL);
      if (owned.length) {
        const i = owned[0];
        st.tiles[i].level += 1;
        log(st, `${p.name} ${card.text}：「${tilesOf(st)[i].name}」升至 ${st.tiles[i].level} 级`);
      } else {
        p.cash += 50;
        log(st, `${p.name} 名下无可翻新产业，折现 +50`);
      }
      break;
    }
    case 'dividend': {
      const n = ownedTilesOf(st, pIdx).length;
      p.cash += n * eff.amount;
      log(st, `${p.name} ${card.text}，${n} 处产业 +${n * eff.amount}`);
      break;
    }
    default: break;
  }
  return { resolveAgain };
}

// 传送落点即时效果（监狱罚款停掷 / 医院医药费；起点工资已在 movePlayer 发放）
function applyLandingInstant(st, pIdx) {
  const p = st.players[pIdx];
  const t = tilesOf(st)[p.pos];
  if (t.type === 'jail') {
    const fine = fineOf(JAIL_FINE, p);
    payTo(st, pIdx, null, fine);
    p.skipTurns = Math.max(p.skipTurns, JAIL_SKIP_TURNS);
    log(st, `${p.name} 被押入监狱，罚款 ${fine} 并停 ${JAIL_SKIP_TURNS} 回合`);
  } else if (t.type === 'hospital') {
    const fee = fineOf(HOSPITAL_FEE, p);
    payTo(st, pIdx, null, fee);
    log(st, `${p.name} 住进医院，医药费 ${fee}`);
  }
}

export function drawCard(st, kind) {
  const pool = kind === 'fate' ? FATE_CARDS : CHANCE_CARDS;
  return pool[Math.floor(rngNext(st) * pool.length)];
}

// —— 掷骰 + 移动（roll 阶段；停掷回合在此自动消化）——
export function rollAndMove(st) {
  if (st.phase !== 'roll' || st.finished) return { ok: false };
  const p = cur(st);
  if (p.skipTurns > 0) {
    p.skipTurns -= 1;
    st.phase = 'end';
    log(st, `${p.name} 停掷一回合（剩余 ${p.skipTurns}）`);
    return { ok: true, skipped: true };
  }
  const luck = (p.perk && p.perk.luck) || 0;
  const { d1, d2 } = rollTwoDice(st, luck);
  st.lastRoll = [d1, d2];
  const doubles = d1 === d2;
  st.doubles = doubles ? (st.doubles || 0) + 1 : 0;
  // 连掷三次对子：疑为出千，直接押入大牢（不发工资）
  if (doubles && st.doubles >= 3) {
    st.extra = false;
    st.lastDice = 0;
    const jailIdx = findTile(st, 'jail');
    if (jailIdx >= 0) p.pos = jailIdx;
    const fine = fineOf(JAIL_FINE, p);
    payTo(st, st.turnIdx, null, fine);
    p.skipTurns = Math.max(p.skipTurns, JAIL_SKIP_TURNS);
    st.phase = 'end';
    log(st, `${p.name} 连掷三次对子被疑出千，押入大牢（罚款 ${fine}，停 ${JAIL_SKIP_TURNS} 回合）`);
    return { ok: true, jailed: true, d1, d2 };
  }
  st.extra = doubles;
  let steps = d1 + d2;
  if (p.items.swift > 0) {
    p.items.swift -= 1;
    steps += SWIFT_BONUS;
    log(st, `${p.name} 的顺风骰助推 +${SWIFT_BONUS} 步`);
  }
  st.lastDice = steps;
  const mv = movePlayer(st, st.turnIdx, steps);
  log(st, `${p.name} 掷出 ${d1}+${d2}${doubles ? '（对子！）' : ''}，前进到「${tilesOf(st)[mv.dest].name}」`);
  st.phase = 'resolve';
  return { ok: true, dice: steps, d1, d2, doubles, dest: mv.dest };
}

// —— 结算当前落格（resolve 阶段）——
export function resolveTile(st) {
  if (st.phase !== 'resolve' || st.finished) return { kind: 'none' };
  const p = cur(st);
  const i = p.pos;
  const t = tilesOf(st)[i];
  const ts = st.tiles[i];
  switch (t.type) {
    case 'prop': {
      if (ts.owner === -1) {
        st.phase = 'decision';
        return { kind: 'buy', tile: i, price: buyPriceOf(t, p), listPrice: t.price };
      }
      if (ts.owner === st.turnIdx) {
        if (ts.level < MAX_LEVEL) {
          st.phase = 'decision';
          return { kind: 'upgrade', tile: i, cost: upgradeCost(t, ts.level), level: ts.level };
        }
        st.phase = 'end';
        return { kind: 'info', text: `「${t.name}」已是满级产业，安心收租` };
      }
      // 交租（护身符可自动抵消一次）
      if (p.items.charms > 0) {
        p.items.charms -= 1;
        st.phase = 'end';
        log(st, `${p.name} 的护身符碎裂，免除了一笔租金`);
        return { kind: 'charm', tile: i };
      }
      const owner = ts.owner;
      const mono = hasMonopoly(st, t.district, owner);
      const rent = Math.round(rentOf(t, ts.level, mono) * boomMult(st.round));
      const paid = payTo(st, st.turnIdx, owner, rent);
      st.phase = 'end';
      return { kind: 'rent', tile: i, rent, owner, mono, ...paid };
    }
    case 'shop':
      st.phase = 'shop';
      return { kind: 'shop', tile: i };
    case 'chance':
    case 'fate': {
      const card = drawCard(st, t.type);
      const r = applyCard(st, st.turnIdx, card);
      if (st.finished) { st.phase = 'over'; return { kind: 'card', card, gameOver: true }; }
      if (r.resolveAgain) return { kind: 'card', card, resolveAgain: true };
      st.phase = 'end';
      return { kind: 'card', card };
    }
    case 'tax': {
      const amount = Math.max(TAX_MIN, taxOf(p.cash));
      payTo(st, st.turnIdx, null, amount);
      st.phase = 'end';
      return { kind: 'tax', amount };
    }
    case 'jail': {
      const fine = fineOf(JAIL_FINE, p);
      payTo(st, st.turnIdx, null, fine);
      p.skipTurns = Math.max(p.skipTurns, JAIL_SKIP_TURNS);
      st.phase = 'end';
      log(st, `${p.name} 误入监狱，罚款 ${fine} 并停 ${JAIL_SKIP_TURNS} 回合`);
      return { kind: 'jail', fine };
    }
    case 'hospital': {
      const fee = fineOf(HOSPITAL_FEE, p);
      payTo(st, st.turnIdx, null, fee);
      st.phase = 'end';
      log(st, `${p.name} 就医，医药费 ${fee}`);
      return { kind: 'hospital', fee };
    }
    case 'park':
      st.phase = 'end';
      log(st, `${p.name} 在御园赏花，安然无恙`);
      return { kind: 'info', text: '御园漫步，身心舒畅' };
    default:
      st.phase = 'end';
      return { kind: 'info', text: '回到起点，整装再发' };
  }
}

// —— 交棒（end 阶段）：对子加掷优先；随后轮到下一位存活玩家。
//    不设回合上限——对局只以破产淘汰收场。
export function endTurn(st) {
  if (st.phase !== 'end' || st.finished) return { ok: false };
  const p = st.players[st.turnIdx];
  if (st.extra && !p.bankrupt) {
    st.extra = false;
    st.phase = 'roll';
    log(st, `${p.name} 掷出对子，再加掷一次`);
    return { ok: true, again: true };
  }
  st.extra = false;
  st.doubles = 0;
  const n = st.players.length;
  do {
    st.turnIdx = (st.turnIdx + 1) % n;
    if (st.turnIdx === 0) {
      st.round += 1;
      // 城市繁荣：租金档位提升时播报（时间压力，促使对局收敛）
      if (boomMult(st.round) > boomMult(st.round - 1)) {
        log(st, `城市繁荣，百业兴旺——全城租金普涨 ${Math.round(BOOM_RATE * 100)}%（当前 ×${boomMult(st.round).toFixed(2)}）`);
      }
    }
  } while (st.players[st.turnIdx].bankrupt);
  st.phase = 'roll';
  return { ok: true };
}

// —— AI 决策：买地/升级的现金保留阈值 ——
export function aiDecide(st, decision) {
  const p = cur(st);
  if (decision.kind === 'buy') return p.cash - decision.price >= AI_SAFE_CASH;
  if (decision.kind === 'upgrade') return p.cash - decision.cost >= AI_UPGRADE_CASH;
  return false;
}
