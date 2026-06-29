// ============================================================================
// NPC 好感度 + 组队探险：寻访结识、赠礼提升好感、好感达标的道友可结伴探险（奖励更丰厚）。
// 高好感（莫逆之交及以上）的道友额外提供修炼加成，通过懒注册注入 config.cultivateSpeedMult，
// 沿用 sect 的注入模式，避免 config↔npc 循环依赖。
// ============================================================================
import {
  cycleKey, _registerCompanionBonus, EXPLORE_MP_COST, EXPLORE_HP_COST, xpNeeded, clamp,
} from '../config.js';
import {
  NPCS, NPC_LIST, npcDef, AFFINITY_LEVELS, affinityLevel, nextAffinityLevel,
  TEAM_AFFINITY_THRESHOLD, MEET_VITALITY_COST, TEAM_VITALITY_COST, TEAM_EXPLORE_MAX_PER_CYCLE,
} from '../data/npcs.js';
import {
  addXp, removeItem, hasItem, countItem, canAffordVitality, spendVitality,
} from './player.js';
import { recordSectActivity } from './sect.js';
import { pick, chance, rangeInt } from './rng.js';

// —— 道友修炼加成：每个「莫逆之交」及以上道友提供倍率（仅取最高档，不与低阶叠加）——
// 未结识任何道友时返回 1（无加成）。由 config 在 cultivateSpeedMult 中调用。
export function companionCultivateBonus(player) {
  if (!player || !player.npcs) return 1;
  let m = 1;
  for (const id of Object.keys(player.npcs)) {
    const st = player.npcs[id];
    if (!st || !st.met) continue;
    const lv = affinityLevel(st.aff || 0);
    if (lv.cultMult && lv.cultMult > m) m = lv.cultMult;
  }
  return m;
}
_registerCompanionBonus(companionCultivateBonus);

// —— 状态读取 ——
export function npcState(player, id) {
  if (!player || !player.npcs) return null;
  return player.npcs[id] || null;
}
export function getAffinity(player, id) {
  const st = npcState(player, id);
  return st ? (st.aff || 0) : 0;
}
export function isMet(player, id) {
  const st = npcState(player, id);
  return !!(st && st.met);
}
// 当前好感等级（未结识返回最低档 af0）
export function curAffinityLevel(player, id) {
  return affinityLevel(getAffinity(player, id));
}

// 按境界可结识、且尚未结识的道友
export function meetableNpcs(player) {
  const tier = (player && player.tier) || 0;
  return NPC_LIST.filter((n) => n.meetTier <= tier && !isMet(player, n.id));
}
// 已结识的道友列表（保持名册顺序）
export function metNpcs(player) {
  return NPC_LIST.filter((n) => isMet(player, n.id));
}

// 寻访结识：消耗活力，随机结识一位可结识的道友。返回 { ok, npc, logs } 或 { ok:false, reason }
export function meetNpc(player, rng) {
  const r = rng || Math.random;
  if (!canAffordVitality(player, MEET_VITALITY_COST)) return { ok: false, reason: '活力不足，无力寻访' };
  const pool = meetableNpcs(player);
  if (!pool.length) return { ok: false, reason: '暂无可结识的新道友（提升境界或会有奇遇）' };
  spendVitality(player, MEET_VITALITY_COST);
  const npc = pick(r, pool);
  ensureNpc(player, npc.id);
  const st = player.npcs[npc.id];
  st.met = true;
  st.aff = Math.max(st.aff || 0, 6); // 初识赠 6 好感
  return {
    ok: true,
    npc,
    logs: [
      { text: `🍃 你云游寻访，结识了${npc.title}「${npc.name}」。`, type: 'epic' },
      { text: `${npc.emoji} ${npc.name}：「${npc.line}」`, type: 'normal' },
    ],
  };
}

// 赠礼：消耗 1 件物品，提升好感（喜好物增益更高）。返回 { ok, logs, affGain, level }
export function giftNpc(player, npcId, itemId, rng) {
  const r = rng || Math.random;
  const npc = npcDef(npcId);
  if (!npc) return { ok: false, reason: '无此道友' };
  if (!isMet(player, npcId)) return { ok: false, reason: '尚未结识此人' };
  if (!itemId || !hasItem(player, itemId, 1)) return { ok: false, reason: '没有此物可赠' };
  removeItem(player, itemId, 1);
  ensureNpc(player, npcId);
  const st = player.npcs[npcId];
  const liked = itemId === npc.liked;
  // 喜好物：+10~16；普通物：+3~6。越高好感越难再升（边际递减）。
  const base = liked ? rangeInt(r, 10, 16) : rangeInt(r, 3, 6);
  const dim = clamp(1 - (st.aff || 0) / 320, 0.35, 1);
  const affGain = Math.max(1, Math.round(base * dim));
  const before = st.aff || 0;
  st.aff = before + affGain;
  const lvBefore = affinityLevel(before).name;
  const lvAfter = affinityLevel(st.aff).name;
  const logs = [];
  logs.push({ text: liked
    ? `${npc.emoji} 你将心仪之物赠予${npc.name}，对方喜出望外！好感 +${affGain}。`
    : `${npc.emoji} 你赠${npc.name}一份薄礼。好感 +${affGain}。`, type: liked ? 'epic' : 'good' });
  if (lvAfter !== lvBefore) logs.push({ text: `💖 你与${npc.name}的关系晋升为「${lvAfter}」！`, type: 'epic' });
  return { ok: true, affGain, level: lvAfter, liked, logs };
}

// 是否可结伴探险（好感达「投缘之交」）
export function canTeamUp(player, npcId) {
  if (!isMet(player, npcId)) return false;
  return getAffinity(player, npcId) >= TEAM_AFFINITY_THRESHOLD;
}

// 今日是否已与此道友结伴（每道友每日限一次，守住奖励上限）
export function teamedToday(player, npcId) {
  const st = npcState(player, npcId);
  return !!(st && st.teamedDate === cycleKey());
}

// 本轮（自然月）已结伴探险的次数（跨月自动归零；teamExploreDate 为月份键）
export function teamExploreUsed(player) {
  if (!player || player.teamExploreDate !== cycleKey()) return 0;
  return player.teamExploreCount || 0;
}
// 本轮剩余可结伴次数
export function teamExploreRemaining(player) {
  return Math.max(0, TEAM_EXPLORE_MAX_PER_CYCLE - teamExploreUsed(player));
}

// 结伴探险：消耗灵力/气血/活力，奖励随境界与道友 teamMult 大幅放大。
// 返回 { encounter, sceneName }（encounter 为 instant，交由 UI 的 applyReward 结算）或 { error }。
export function teamExplore(player, npcId, rng) {
  const r = rng || Math.random;
  const npc = npcDef(npcId);
  if (!npc) return { error: '无此道友' };
  if (!isMet(player, npcId)) return { error: '尚未结识此人' };
  if (!canTeamUp(player, npcId)) return { error: `需「${affinityLevel(TEAM_AFFINITY_THRESHOLD).name}」方可结伴` };
  if (teamedToday(player, npcId)) return { error: `${npc.name}本月已与你同游，下月再约` };
  if (teamExploreUsed(player) >= TEAM_EXPLORE_MAX_PER_CYCLE) {
    return { error: `本月结伴探险已达上限（${TEAM_EXPLORE_MAX_PER_CYCLE} 次/月），下月再约` };
  }
  if (player.mp < EXPLORE_MP_COST) return { error: '灵力不足，无法探险' };
  if (player.hp <= EXPLORE_HP_COST) return { error: '气血过低，不宜探险' };
  if (!canAffordVitality(player, TEAM_VITALITY_COST)) return { error: '活力不足，明日恢复' };

  // 先扣消耗，再结算（与 rollExplore「先校验再扣」一致）
  player.mp -= EXPLORE_MP_COST;
  player.hp = Math.max(1, player.hp - EXPLORE_HP_COST);
  spendVitality(player, TEAM_VITALITY_COST);

  const lv = player.lv || 0;
  const aff = getAffinity(player, npcId);
  const affMult = 1 + clamp(aff / 400, 0, 0.3); // 好感越高，奖励再小幅加成
  const mult = npc.teamMult * affMult;
  const stoneBase = Math.round((45 + lv * 11) * mult * (0.9 + r() * 0.5));
  const xpGain = Math.max(1, Math.round(xpNeeded(lv) * 0.13 * mult));

  // 物品：2~3 份材料，按境界抽池
  const matPool = lv >= 6
    ? ['herb_lingzhi', 'ore_longgu', 'ore_baijin', 'essence_ling']
    : ['herb_zihua', 'ore_xuantie', 'herb_qingmu', 'essence_ling', 'herb_hanbing'];
  const itemCount = 2 + (r() < 0.5 ? 1 : 0);
  const items = [];
  for (let i = 0; i < itemCount; i++) {
    const id = matPool[Math.floor(r() * matPool.length)];
    const qty = 1 + Math.floor(r() * 2);
    items.push({ id, qty });
  }

  // 高境界有概率额外爆法宝 / 配方
  let treasure = null;
  let recipe = null;
  if (lv >= 4 && chance(r, 0.25 + clamp(lv / 80, 0, 0.2))) {
    if (r() < 0.5) {
      const pool = ['fabao_huoyun', 'fabao_bingpo', 'fabao_leiyin', 'fabao_qiankun'];
      treasure = pool[Math.min(pool.length - 1, Math.floor(r() * (1 + lv / 8)))];
    } else {
      const rp = ['rcp_zhuji', 'rcp_huitian2', 'rcp_xisui', 'bp_leiyin'];
      recipe = rp[Math.floor(r() * rp.length)];
    }
  }

  // 好感小幅增进（同游增进情谊）
  ensureNpc(player, npcId);
  const st = player.npcs[npcId];
  const affGain = 2 + Math.floor(r() * 2);
  st.aff = (st.aff || 0) + affGain;
  st.teamedDate = cycleKey();

  // 全局「每月结伴上限」计数（与单道友「每月一次」并存）：跨月自动归零
  if (player.teamExploreDate !== cycleKey()) { player.teamExploreDate = cycleKey(); player.teamExploreCount = 0; }
  player.teamExploreCount = (player.teamExploreCount || 0) + 1;

  // 上报宗门「外出探索」任务
  recordSectActivity(player, 'explore');

  const result = {
    stones: stoneBase,
    xp: xpGain,
    items,
    treasure,
    recipe,
    log: `🤝 与${npc.name}结伴探险大有收获！好感 +${affGain}。`,
    logType: 'epic',
  };
  const encounter = {
    kind: 'instant',
    title: `结伴探险 · ${npc.name}`,
    emoji: npc.emoji,
    text: `你与${npc.title}「${npc.name}」联手闯入秘境深处，默契配合，斩获颇丰！`,
    result,
  };
  return { encounter, sceneName: '秘境深处' };
}

// 确保玩家身上存在某 NPC 的状态对象（内部用）
export function ensureNpc(player, id) {
  if (!player.npcs) player.npcs = {};
  if (!player.npcs[id]) player.npcs[id] = { met: false, aff: 0, teamedDate: '' };
  return player.npcs[id];
}

// 进度展示用：当前等级 + 距下一阶差距
export function affinityProgress(player, id) {
  const aff = getAffinity(player, id);
  const cur = affinityLevel(aff);
  const next = nextAffinityLevel(aff);
  return { aff, cur, next };
}
