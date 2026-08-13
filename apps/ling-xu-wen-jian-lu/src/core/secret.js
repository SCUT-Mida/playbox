// ============================================================================
// 秘境探索（设计稿 3.2：Roguelike 爬塔）
//   - 9 重天 × 10 层 = 90 层；每层随机一个事件节点。
//   - 节点：妖物盘踞(战斗) / 上古宝箱 / 风水奇遇 / 秘境商人 / 天道试炼 / 心魔之劫。
//   - 每 5 层发秘境宝箱；每 10 层自动存档（可中断继续）。
//   - 单次进入层数递增；离场后从存档层继续。
// ============================================================================
import { weighted, pick, chance, rangeInt } from './rng.js';
import { makeEnemy, makeBossPower } from '../data/enemies.js';
import { playerSpecsFrom, runBattle } from './battle.js';
import { addRes, addFrag } from './player.js';
import { CARDS } from '../data/cards.js';
import { ELEMENTS } from '../config.js';

export const TOTAL_FLOORS = 90;
export const FLOORS_PER_TIAN = 10;

// 节点类型权重（设计稿 3.2）
const NODE_WEIGHTS = [
  { item: 'battle',  weight: 40 },
  { item: 'treasure', weight: 20 },
  { item: 'fengshui', weight: 15 },
  { item: 'merchant', weight: 10 },
  { item: 'trial',    weight: 10 },
  { item: 'mirror',   weight: 5 },
];

export function rollNode(rng) { return weighted(rng, NODE_WEIGHTS); }

// 当前层数对应的「重天」序号（1..9）
export function tianOf(floor) { return Math.floor((floor - 1) / FLOORS_PER_TIAN) + 1; }

// 层数 → 敌方战力（随层数递增）
export function floorPower(floor) { return Math.round(400 * Math.pow(1.075, floor - 1)); }

// 随机五行（混沌虚空之后倾向无属性混合）
function randomElement(rng) {
  if (floorPower && false) {} // 占位
  return pick(rng, ELEMENTS).id;
}

// 心魔之劫：复制我方阵容为镜像敌人
function mirrorSpecs(player) {
  return playerSpecsFrom(player).map((s) => ({ ...s, name: `心魔·${s.name}`, role: s.role }));
}

// 推进一层：返回该层事件与结算。player.secret.floor 在调用后由 enterFloor 统一递增。
// 返回 { node, kind, text, rewards, battle?(run), floor, over }
export function enterFloor(player, rng) {
  const floor = player.secret.floor;
  const power = floorPower(floor);
  const node = rollNode(rng);
  const out = { floor, node, kind: 'event', text: '', rewards: { res: {}, frags: {} }, battle: null, over: false };
  const add = (id, q) => { out.rewards.res[id] = (out.rewards.res[id] || 0) + q; };
  const addFragRarity = (rarity, qty) => {
    const pool = CARDS.filter((c) => c.rarity === rarity);
    if (pool.length) { const c = pick(rng, pool); out.rewards.frags[c.id] = (out.rewards.frags[c.id] || 0) + qty; }
  };

  switch (node) {
    case 'battle': {
      const el = randomElement(rng);
      const enemies = [makeEnemy(power * 0.6, el, rng), makeEnemy(power * 0.6, el, rng), makeEnemy(power * 0.5, el, rng)];
      const run = runBattle(playerSpecsFrom(player), enemies, rng);
      out.kind = 'battle'; out.battle = run; out.text = `第 ${floor} 层 · 妖物盘踞`;
      if (run.result === 'win') {
        add('lingshi', rangeInt(rng, 40, 90));
        if (chance(rng, 0.20)) addFragRarity('R', 1);
        out.win = true;
      } else out.win = false;
      break;
    }
    case 'treasure': {
      out.text = `第 ${floor} 层 · 上古宝箱`;
      add('lingshi', rangeInt(rng, 50, 120));
      const r = (rng || Math.random)();
      if (r < 0.5) add('exp_s', 2);
      else if (r < 0.8) addFragRarity('R', 1);
      else addFragRarity('SR', 1);
      out.win = true;
      break;
    }
    case 'fengshui': {
      out.text = `第 ${floor} 层 · 风水奇遇`;
      if (chance(rng, 0.5)) add('lingshi', rangeInt(rng, 30, 80));
      else add('exp_m', 1);
      out.win = true;
      break;
    }
    case 'merchant': {
      // 商人：用灵石兑换稀有材料（此处直接给少量天道碎片，扣灵石）
      const cost = rangeInt(rng, 60, 120);
      if (player.res.lingshi >= cost) {
        player.res.lingshi -= cost;
        add('tiandao_f', 1);
        out.text = `第 ${floor} 层 · 秘境商人：以 ${cost} 灵石换得天道本源·碎片×1`;
      } else {
        out.text = `第 ${floor} 层 · 秘境商人：灵石不足，空手而归`;
      }
      out.win = true;
      break;
    }
    case 'trial': {
      // 天道试炼：高难单体 Boss，胜后必得 SSR 碎片
      const el = randomElement(rng);
      const boss = makeBossPower(power, el, rng);
      const run = runBattle(playerSpecsFrom(player), [boss], rng);
      out.kind = 'battle'; out.battle = run; out.text = `第 ${floor} 层 · 天道试炼`;
      if (run.result === 'win') { addFragRarity('SSR', 1); add('wendao', 1); out.win = true; }
      else out.win = false;
      break;
    }
    case 'mirror': {
      // 心魔之劫：镜像挑战，胜后全属性永久 +5%（以灵石/天道本源象征）
      const run = runBattle(playerSpecsFrom(player), mirrorSpecs(player), rng);
      out.kind = 'battle'; out.battle = run; out.text = `第 ${floor} 层 · 心魔之劫`;
      if (run.result === 'win') {
        add('tiandao_f', 1); add('lingshi', 100);
        out.text += '（战胜心魔，道心更坚！）';
        out.win = true;
      } else out.win = false;
      break;
    }
    default: out.win = true; break;
  }

  // 应用奖励
  if (out.win) {
    for (const [id, q] of Object.entries(out.rewards.res)) addRes(player, id, q);
    for (const [cid, q] of Object.entries(out.rewards.frags)) addFrag(player, cid, q);
    if (out.kind === 'battle') player.stats.battlesWon = (player.stats.battlesWon || 0) + 1;
    // 推进层数
    player.secret.floor = Math.min(TOTAL_FLOORS, floor + 1);
    player.secret.bestFloor = Math.max(player.secret.bestFloor || 1, player.secret.floor);
    // 每 5 层秘境宝箱
    if (player.secret.floor % 5 === 0) {
      addRes(player, 'wendao', 1);
      out.boxFloor = player.secret.floor;
    }
    // 每 10 层自动存档点
    if (player.secret.floor % FLOORS_PER_TIAN === 1 && floor % FLOORS_PER_TIAN !== 1) {
      player.secret.saveFloor = floor + 1;
      out.savedFloor = player.secret.saveFloor;
    }
    player.stats.secretFloors = player.secret.bestFloor;
    // 通关 90 层
    if (player.secret.floor >= TOTAL_FLOORS) out.over = true;
  } else {
    // 战败：回到最近存档层（不推进）
    player.secret.floor = player.secret.saveFloor || 1;
    player.stats.battlesLost = (player.stats.battlesLost || 0) + 1;
    out.defeated = true;
  }
  return out;
}

// 重置秘境（回到存档层 / 第 1 层）
export function resetSecret(player, toSave) {
  player.secret.floor = toSave ? (player.secret.saveFloor || 1) : 1;
}
