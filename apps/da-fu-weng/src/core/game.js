// ============================================================================
// 大富翁 · 游戏状态机（纯逻辑，无 DOM 依赖）。
//
// 阶段（state.phase）：
//   roll     → 等待当前玩家掷骰（人类点按钮 / AI 自动）
//   resolve  → 已落格，待结算格子效果
//   decision → 落在可买/可升的自家产业，等待买地/升级抉择
//   end      → 本回合行动完毕，等待 endTurn 交给下一位
//   over     → 终局（仅剩一家 / 达到回合上限）
//
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
  rentOf, upgradeCost, taxOf,
} from '../config.js';
import { rngNext, rollDice } from './rng.js';

const GAME_VERSION = 2;

// —— 建档：heroKey 选主角，aiCount 补 1~3 位 AI 对手，mapKey 选地图 ——
export function newGame({ heroKey, aiCount = 2, mapKey = MAPS[0].key, seed } = {}) {
  const hero = CHARACTERS.find((c) => c.key === heroKey) || CHARACTERS[0];
  const ai = AI_CHARACTERS.slice(0, Math.max(1, Math.min(3, aiCount | 0)));
  const map = mapDefOf(mapKey);
  const board = boardOf(map.key);
  const players = [hero, ...ai].map((c) => ({
    key: c.key, name: c.name, look: c.look,
    isAI: false, // hero 恒为 0 号
    cash: START_CASH, pos: 0, laps: 0,
    skipTurns: 0, bankrupt: false,
  }));
  players[0].isAI = false;
  for (let i = 1; i < players.length; i++) players[i].isAI = true;
  return {
    ver: GAME_VERSION,
    mapKey: map.key,
    round: 1,
    turnIdx: 0,
    phase: 'roll',
    rng: seed | 0,
    lastDice: 0,
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

// 仅剩一家 → 终局
export function checkGameOver(st) {
  if (st.finished) return;
  if (alivePlayers(st).length <= 1) {
    finishGame(st, 'last');
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
  if (p.cash < t.price) return { ok: false };
  p.cash -= t.price;
  ts.owner = st.turnIdx;
  ts.level = 1;
  ts.spent = t.price;
  st.phase = 'end';
  log(st, `${p.name} 以 ${t.price} 买下「${t.name}」`);
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
      let rich = -1;
      for (let i = 0; i < st.players.length; i++) {
        if (i === pIdx || st.players[i].bankrupt) continue;
        if (rich < 0 || st.players[i].cash > st.players[rich].cash) rich = i;
      }
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
    payTo(st, pIdx, null, JAIL_FINE);
    p.skipTurns = Math.max(p.skipTurns, JAIL_SKIP_TURNS);
    log(st, `${p.name} 被押入监狱，罚款 ${JAIL_FINE} 并停 ${JAIL_SKIP_TURNS} 回合`);
  } else if (t.type === 'hospital') {
    payTo(st, pIdx, null, HOSPITAL_FEE);
    log(st, `${p.name} 住进医院，医药费 ${HOSPITAL_FEE}`);
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
  const dice = rollDice(st);
  st.lastDice = dice;
  const mv = movePlayer(st, st.turnIdx, dice);
  log(st, `${p.name} 掷出 ${dice} 点，前进到「${tilesOf(st)[mv.dest].name}」`);
  st.phase = 'resolve';
  return { ok: true, dice, dest: mv.dest };
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
        return { kind: 'buy', tile: i, price: t.price };
      }
      if (ts.owner === st.turnIdx) {
        if (ts.level < MAX_LEVEL) {
          st.phase = 'decision';
          return { kind: 'upgrade', tile: i, cost: upgradeCost(t, ts.level), level: ts.level };
        }
        st.phase = 'end';
        return { kind: 'info', text: `「${t.name}」已是满级产业，安心收租` };
      }
      // 交租
      const owner = ts.owner;
      const mono = hasMonopoly(st, t.district, owner);
      const rent = rentOf(t, ts.level, mono);
      const paid = payTo(st, st.turnIdx, owner, rent);
      st.phase = 'end';
      return { kind: 'rent', tile: i, rent, owner, mono, ...paid };
    }
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
    case 'jail':
      payTo(st, st.turnIdx, null, JAIL_FINE);
      p.skipTurns = Math.max(p.skipTurns, JAIL_SKIP_TURNS);
      st.phase = 'end';
      log(st, `${p.name} 误入监狱，罚款 ${JAIL_FINE} 并停 ${JAIL_SKIP_TURNS} 回合`);
      return { kind: 'jail' };
    case 'hospital':
      payTo(st, st.turnIdx, null, HOSPITAL_FEE);
      st.phase = 'end';
      log(st, `${p.name} 就医，医药费 ${HOSPITAL_FEE}`);
      return { kind: 'hospital' };
    case 'park':
      st.phase = 'end';
      log(st, `${p.name} 在御园赏花，安然无恙`);
      return { kind: 'info', text: '御园漫步，身心舒畅' };
    default:
      st.phase = 'end';
      return { kind: 'info', text: '回到起点，整装再发' };
  }
}

// —— 交棒（end 阶段）——
export function endTurn(st) {
  if (st.phase !== 'end' || st.finished) return { ok: false };
  const n = st.players.length;
  const maxRound = mapOf(st).rounds;
  do {
    st.turnIdx = (st.turnIdx + 1) % n;
    if (st.turnIdx === 0) {
      st.round += 1;
      if (st.round > maxRound) {
        finishGame(st, 'rounds');
        return { ok: true, finished: true };
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
