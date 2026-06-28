// ============================================================================
// 宗门系统：加入宗门、每日宗门任务、宗门声望、宗门称号（境界+声望双门槛）、每日俸禄。
// 各系统在完成「主动修炼/探索/战胜/炼制/突破」时调用 recordSectActivity 上报，推进每日任务。
//
// 称号提供的修炼加成通过懒注册注入 config.cultivateSpeedMult，避免 config↔sect 循环依赖
// （沿用 config 对 items/techniques 的 _register 模式）。
// ============================================================================
import { cycleKey, clamp, _registerSectBonus } from '../config.js';
import { SECTS, SECT_TITLES, SECT_TASK_POOL, CHALLENGE_TEMPLATES, MAX_ACTIVE_CHALLENGES } from '../data/sect.js';
import { addStones, addItemOrLog } from './player.js';

// 注入修炼倍率：宗门自身加成 × 当前宗门称号加成（仅当前称号，不与低阶叠加）
export function sectCultivateBonus(player) {
  if (!player || !player.sectId) return 1;
  const sect = SECTS[player.sectId];
  let m = sect ? (sect.cultMult || 1) : 1;
  const title = currentSectTitle(player);
  if (title) m *= (title.cultMult || 1);
  return m;
}
_registerSectBonus(sectCultivateBonus);

export function sectDef(id) { return SECTS[id] || null; }

// 当前宗门称号：境界与声望同时达标中最高的那个；未入宗门返回 null。
// 记名弟子门槛为 0/0，故已入宗者至少拥有此称号。
export function currentSectTitle(player) {
  if (!player || !player.sectId) return null;
  const tier = player.tier || 0;
  const rep = player.sectRep || 0;
  let title = null;
  for (const t of SECT_TITLES) {
    if (tier >= t.minTier && rep >= t.minRep) title = t;
  }
  return title;
}

// 下一阶宗门称号（用于进度展示）；已到顶或未入宗返回 null
export function nextSectTitle(player) {
  if (!player || !player.sectId) return null;
  const cur = currentSectTitle(player);
  const idx = SECT_TITLES.indexOf(cur);
  return (idx >= 0 && idx < SECT_TITLES.length - 1) ? SECT_TITLES[idx + 1] : null;
}

// 当前称号升至下一阶还差的境界/声望（用于进度条文案）
export function titleProgress(player) {
  const cur = currentSectTitle(player);
  const next = nextSectTitle(player);
  if (!next) return { cur, next: null, repHave: player.sectRep || 0, repNeed: 0, tierOk: true, atTop: true };
  const tierOk = (player.tier || 0) >= next.minTier;
  return { cur, next, repHave: player.sectRep || 0, repNeed: next.minRep, tierOk, atTop: false };
}

// 加入（或转投）宗门：转宗保留声望，并补齐当日任务
export function joinSect(player, sectId, rng) {
  if (!SECTS[sectId]) return false;
  player.sectId = sectId;
  if (!player.sectRep) player.sectRep = 0;
  if (!Array.isArray(player.sectTasks) || player.sectTaskDate !== cycleKey()) {
    player.sectTasks = rollDailySectTasks(rng || Math.random);
    player.sectTaskDate = cycleKey();
  }
  return true;
}

// 每日任务：从池中不重复抽取 5 个（池不足则全取）
export function rollDailySectTasks(rng) {
  const r = rng || Math.random;
  const pool = SECT_TASK_POOL.slice();
  const out = [];
  const n = Math.min(5, pool.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(r() * pool.length);
    const def = pool.splice(idx, 1)[0];
    out.push({
      id: def.id, type: def.type, label: def.label, emoji: def.emoji,
      verb: def.verb, goal: def.goal, rep: def.rep,
      progress: 0, claimed: false,
    });
  }
  return out;
}

// 跨日刷新宗门任务（在线挂机跨过零点时）。返回是否刷新了任务。
export function dailySectRollover(player, rng) {
  if (!player || !player.sectId) return false;
  const today = cycleKey();
  if (player.sectTaskDate !== today) {
    player.sectTasks = rollDailySectTasks(rng || Math.random);
    player.sectTaskDate = today;
    return true;
  }
  return false;
}

// 进入游戏 / 打开宗门页时确保任务就绪（已入宗但任务为空或日期过期则补齐）
export function ensureSectTasks(player, rng) {
  if (!player || !player.sectId) return false;
  if (!Array.isArray(player.sectTasks) || player.sectTaskDate !== cycleKey()) {
    player.sectTasks = rollDailySectTasks(rng || Math.random);
    player.sectTaskDate = cycleKey();
    return true;
  }
  return false;
}

// 上报活动：各系统完成对应行为时调用，推进匹配的「未领取」任务进度
// 同时推进已接取且未领取的悬赏挑战（二者 type 体系一致，共用此函数）
export function recordSectActivity(player, type, count = 1) {
  if (!player || !type) return false;
  let changed = false;
  const buckets = [player.sectTasks, player.challengeTasks];
  for (const tasks of buckets) {
    if (!Array.isArray(tasks)) continue;
    for (const task of tasks) {
      if (task.type === type && !task.claimed) {
        task.progress = clamp((task.progress || 0) + count, 0, task.goal);
        changed = true;
      }
    }
  }
  return changed;
}

// 领取单个任务奖励（达成且未领）：奖励宗门声望
export function claimSectTask(player, taskId) {
  if (!player || !player.sectId) return { ok: false, reason: '尚未加入宗门' };
  const task = (player.sectTasks || []).find((t) => t.id === taskId);
  if (!task) return { ok: false, reason: '无此任务' };
  if (task.claimed) return { ok: false, reason: '已领取' };
  if ((task.progress || 0) < task.goal) return { ok: false, reason: '尚未完成' };
  task.claimed = true;
  player.sectRep = (player.sectRep || 0) + (task.rep || 0);
  return { ok: true, rep: task.rep, total: player.sectRep };
}

// 一键领取全部已完成未领任务，返回本次声望与笔数
export function claimAllSectTasks(player) {
  if (!player || !player.sectId) return { ok: false, rep: 0, count: 0 };
  let rep = 0;
  let count = 0;
  for (const task of player.sectTasks || []) {
    if (!task.claimed && (task.progress || 0) >= task.goal) {
      task.claimed = true;
      player.sectRep = (player.sectRep || 0) + (task.rep || 0);
      rep += task.rep;
      count += 1;
    }
  }
  return { ok: true, rep, count };
}

// ── 悬赏挑战（自主领取，难度随境界缩放）──────────────────────────────────────
// 由玩家主动接取（acceptChallenge），最多同时持有 MAX_ACTIVE_CHALLENGES 个；
// 完成对应行为推进进度，领取后获得灵石 + 宗门声望（高境界额外给物品）。
// 按玩家境界 tier 放大目标与奖励：境界越高，挑战越难、回报越丰。
export function scaleChallenge(template, tier) {
  const t = tier || 0;
  const goal = Math.max(1, Math.round(template.baseGoal * (1 + t * 0.15)));
  const rep = Math.round(template.baseRep * (1 + t * 0.2));
  const stones = Math.round(template.baseStones * (1 + t * 0.25));
  return {
    id: template.id, type: template.type, label: template.label, emoji: template.emoji,
    verb: template.verb, desc: template.desc,
    tier: t, goal, rep, stones,
    progress: 0, claimed: false,
  };
}

// 当前活跃挑战数量
export function activeChallengeCount(player) {
  return Array.isArray(player && player.challengeTasks) ? player.challengeTasks.length : 0;
}

// 接取一个挑战：从未持有的模板中随机挑一个，按当前境界缩放。返回 { ok, task } 或 { ok:false, reason }
export function acceptChallenge(player, rng) {
  const r = rng || Math.random;
  if (!player || !player.sectId) return { ok: false, reason: '尚未加入宗门' };
  if (!Array.isArray(player.challengeTasks)) player.challengeTasks = [];
  if (player.challengeTasks.length >= MAX_ACTIVE_CHALLENGES) return { ok: false, reason: `同时最多接取 ${MAX_ACTIVE_CHALLENGES} 项挑战` };
  const held = new Set(player.challengeTasks.map((t) => t.id));
  const avail = CHALLENGE_TEMPLATES.filter((t) => !held.has(t.id));
  if (!avail.length) return { ok: false, reason: '暂无可接取的新挑战' };
  const tmpl = avail[Math.floor(r() * avail.length)];
  const task = scaleChallenge(tmpl, player.tier || 0);
  player.challengeTasks.push(task);
  return { ok: true, task };
}

// 领取已完成挑战：发放灵石 + 声望（+ 高境界物品），并从活跃列表移除。
export function claimChallenge(player, taskId) {
  if (!player || !player.sectId || !Array.isArray(player.challengeTasks)) return { ok: false, reason: '无此挑战' };
  const idx = player.challengeTasks.findIndex((t) => t.id === taskId);
  if (idx < 0) return { ok: false, reason: '无此挑战' };
  const task = player.challengeTasks[idx];
  if ((task.progress || 0) < task.goal) return { ok: false, reason: '尚未完成' };
  // 发奖
  const logs = [];
  if (task.stones) { addStones(player, task.stones); logs.push({ text: `+${task.stones} 灵石`, type: 'good' }); }
  player.sectRep = (player.sectRep || 0) + (task.rep || 0);
  logs.push({ text: `宗门声望 +${task.rep}（累计 ${player.sectRep}）`, type: 'good' });
  // 高境界额外物品奖励
  if ((task.tier || 0) >= 3) {
    const r = addItemOrLog(player, 'essence_ling', 2 + Math.floor((task.tier || 0) / 2));
    logs.push(r.log);
  }
  player.challengeTasks.splice(idx, 1);
  return { ok: true, task, rep: task.rep, stones: task.stones, logs };
}

// 放弃挑战（不结算），便于玩家更换目标
export function abandonChallenge(player, taskId) {
  if (!player || !Array.isArray(player.challengeTasks)) return false;
  const idx = player.challengeTasks.findIndex((t) => t.id === taskId);
  if (idx < 0) return false;
  player.challengeTasks.splice(idx, 1);
  return true;
}

// 今日是否已领宗门俸禄
export function sectRewardClaimedToday(player) {
  return !!(player && player.sectRewardDate === cycleKey());
}

// 领取每日宗门俸禄（按当前称号发放，每日一次）
export function claimDailySectReward(player) {
  if (!player || !player.sectId) return { ok: false, reason: '尚未加入宗门' };
  const title = currentSectTitle(player);
  if (!title) return { ok: false, reason: '暂无称号' };
  if (sectRewardClaimedToday(player)) return { ok: false, reason: '今日已领取' };
  const d = title.daily || {};
  const logs = [];
  if (d.stones) { addStones(player, d.stones); logs.push({ text: `+${d.stones} 灵石`, type: 'good' }); }
  if (d.items) for (const it of d.items) {
    const r = addItemOrLog(player, it.id, it.qty);
    logs.push(r.log);
  }
  player.sectRewardDate = cycleKey();
  return { ok: true, title, logs };
}
