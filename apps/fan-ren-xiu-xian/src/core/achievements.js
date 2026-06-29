// ============================================================================
// 成就与称号：部分成就由各系统在触发瞬间授予，部分由本表按状态/统计自动检测。
// 成就按「类型」归类（ACH_CATS），便于在成就面板分门别类、目录式（可伸缩）呈现。
//
// 每条成就含三块信息：
//   · goal { cur(player), target } —— 达成条件：cur 达到 target 即解锁；
//     cur/player 现状用于面板里绘制「当前进度 / 目标」进度条。
//   · reward { stones, items:[[id,qty]...] } —— 达成奖励：首次授予时由
//     checkAchievements 自动入账（灵石 + 物品），rewardDesc() 生成展示文案。
//   · name / desc / emoji / cat —— 展示与归类。
// ============================================================================
import { grantAchievement, addStones, addItem } from './player.js';
import { ITEMS } from '../data/items.js';
import { NPC_LIST } from '../data/npcs.js';

// 称号：提供微弱修炼加成（见 config.titleCultivateMult）
export const TITLES = {
  title_qidao: { id: 'title_qidao', name: '筑基道子', desc: '筑基成功，修炼速度 +5%。', emoji: '🔰' },
  title_xianyuan: { id: 'title_xianyuan', name: '结丹仙缘', desc: '结丹成功，修炼速度 +8%。', emoji: '🌟' },
};

// 成就分类（目录式呈现用）：id 与成就的 cat 字段对应
export const ACH_CATS = [
  { id: 'realm',   name: '境界类',     emoji: '🌀' },
  { id: 'battle',  name: '战斗类',     emoji: '⚔️' },
  { id: 'explore', name: '探索类',     emoji: '🗺️' },
  { id: 'wealth',  name: '财富类',     emoji: '💰' },
  { id: 'alchemy', name: '炼丹炼器类', emoji: '⚗️' },
  { id: 'friend',  name: '道友好友类', emoji: '🤝' },
];

// 成就定义：name/desc 展示，cat 归类，goal 决定进度与达成，reward 决定奖励。
export const ACHIEVEMENTS = [
  // —— 战斗类 ——
  { id: 'ach_first_battle', name: '初露锋芒', emoji: '⚔️', cat: 'battle',
    desc: '赢得你的第一场战斗。',
    goal: { cur: (p) => p.stats.battlesWon, target: 1 },
    reward: { stones: 50 } },
  { id: 'ach_lowhp_comeback', name: '空血反杀', emoji: '🩸', cat: 'battle',
    desc: '在仅剩 1 点气血时赢下一场战斗。',
    goal: { cur: (p) => p.stats.lowHpWins || 0, target: 1 },
    reward: { stones: 80, items: [['pill_fuhun', 1]] } },
  { id: 'ach_battle20', name: '百战之士', emoji: '🛡️', cat: 'battle',
    desc: '累计赢得 20 场战斗。',
    goal: { cur: (p) => p.stats.battlesWon, target: 20 },
    reward: { stones: 200, items: [['pill_huitian2', 1]] } },
  { id: 'ach_battle100', name: '杀伐果断', emoji: '💀', cat: 'battle',
    desc: '累计赢得 100 场战斗，威名远扬。',
    goal: { cur: (p) => p.stats.battlesWon, target: 100 },
    reward: { stones: 600, items: [['pill_xiancha', 1]] } },
  { id: 'ach_survivor', name: '死里逃生', emoji: '🌬️', cat: 'battle',
    desc: '战败一次却未陨落（回魂丹兜底）。',
    goal: { cur: (p) => p.stats.deaths || 0, target: 1 },
    reward: { stones: 30, items: [['pill_fuhun', 1]] } },

  // —— 境界类 ——
  { id: 'ach_streak10', name: '势如破竹', emoji: '🔥', cat: 'realm',
    desc: '连续 10 次突破无失败。',
    goal: { cur: (p) => p.stats.breakthroughStreak, target: 10 },
    reward: { stones: 150, items: [['pill_tupo', 1]] } },
  { id: 'ach_breakthroughs20', name: '破而后立', emoji: '🏔️', cat: 'realm',
    desc: '累计完成 20 次境界突破。',
    goal: { cur: (p) => p.stats.breakthroughs, target: 20 },
    reward: { stones: 250 } },
  { id: 'ach_zhuji', name: '筑基大道', emoji: '🔰', cat: 'realm',
    desc: '渡过心魔，迈入筑基期。',
    goal: { cur: (p) => p.tier, target: 2 },
    reward: { stones: 100, items: [['pill_tupo', 2]] } },
  { id: 'ach_jiedan', name: '凝丹成道', emoji: '🟣', cat: 'realm',
    desc: '凝聚金丹，迈入结丹期。',
    goal: { cur: (p) => p.tier, target: 3 },
    reward: { stones: 200, items: [['pill_buling2', 1]] } },
  { id: 'ach_yuanying', name: '元婴出窍', emoji: '🟠', cat: 'realm',
    desc: '渡过天劫，孕育元婴。',
    goal: { cur: (p) => p.tier, target: 4 },
    reward: { stones: 400, items: [['pill_xisui', 1]] } },
  { id: 'ach_ascend', name: '白日飞升', emoji: '⛩️', cat: 'realm',
    desc: '渡过飞升天劫，得道成仙。',
    goal: { cur: (p) => (p.ascended ? 1 : 0), target: 1 },
    reward: { stones: 2000, items: [['gongfa_taiyi', 1]] } },

  // —— 探索类 ——
  { id: 'ach_explore30', name: '初涉江湖', emoji: '🧭', cat: 'explore',
    desc: '累计外出探索 30 次。',
    goal: { cur: (p) => p.stats.exploreCount, target: 30 },
    reward: { stones: 60, items: [['pill_peiyuan', 1]] } },
  { id: 'ach_explore100', name: '行万里路', emoji: '🗺️', cat: 'explore',
    desc: '累计外出探索 100 次。',
    goal: { cur: (p) => p.stats.exploreCount, target: 100 },
    reward: { stones: 200, items: [['pill_lingjiu', 1]] } },
  { id: 'ach_explore300', name: '踏遍九州', emoji: '🌏', cat: 'explore',
    desc: '累计外出探索 300 次，阅尽山河。',
    goal: { cur: (p) => p.stats.exploreCount, target: 300 },
    reward: { stones: 500, items: [['pill_xiancha', 2]] } },

  // —— 财富类 ——
  { id: 'ach_rich', name: '富甲一方', emoji: '💰', cat: 'wealth',
    desc: '同时持有 2000 灵石。',
    goal: { cur: (p) => p.stones, target: 2000 },
    reward: { items: [['pill_peiyuan', 3]] } },
  { id: 'ach_collector', name: '法宝收藏家', emoji: '🗡️', cat: 'wealth',
    desc: '同时拥有 4 种以上法宝。',
    goal: { cur: (p) => treasureTypes(p), target: 4 },
    reward: { stones: 150 } },
  { id: 'ach_technique2', name: '功法传承', emoji: '📖', cat: 'wealth',
    desc: '习得 2 门以上功法。',
    goal: { cur: (p) => (p.techniques || []).length, target: 2 },
    reward: { stones: 120 } },
  { id: 'ach_recipes5', name: '丹方大成', emoji: '📜', cat: 'wealth',
    desc: '掌握 5 种以上丹方 / 器图。',
    goal: { cur: (p) => (p.recipes || []).length, target: 5 },
    reward: { stones: 150, items: [['pill_lingjiu', 1]] } },

  // —— 炼丹炼器类 ——
  { id: 'ach_alchemy_fail', name: '万事开头难', emoji: '💥', cat: 'alchemy',
    desc: '第一次炼丹 / 炼器失败。',
    goal: { cur: (p) => p.stats.alchemyFails, target: 1 },
    reward: { stones: 30 } },
  { id: 'ach_alchemy5', name: '初窥丹道', emoji: '🧪', cat: 'alchemy',
    desc: '累计成功炼制 5 次。',
    goal: { cur: (p) => p.stats.alchemyOk || 0, target: 5 },
    reward: { stones: 80, items: [['pill_peiyuan', 1]] } },
  { id: 'ach_alchemist', name: '炼丹宗师', emoji: '⚗️', cat: 'alchemy',
    desc: '累计成功炼制 20 次。',
    goal: { cur: (p) => p.stats.alchemyOk || 0, target: 20 },
    reward: { stones: 300, items: [['pill_xiancha', 1]] } },
  { id: 'ach_alchemy_total', name: '炉火纯青', emoji: '🔥', cat: 'alchemy',
    desc: '炼制（成或败）累计达 50 次。',
    goal: { cur: (p) => (p.stats.alchemyOk || 0) + (p.stats.alchemyFails || 0), target: 50 },
    reward: { stones: 400 } },

  // —— 道友好友类 ——
  { id: 'ach_friends3', name: '广结善缘', emoji: '🤝', cat: 'friend',
    desc: '结识 3 位道友。',
    goal: { cur: (p) => countMetNpcs(p), target: 3 },
    reward: { stones: 80 } },
  { id: 'ach_friends_all', name: '莫逆遍九州', emoji: '💞', cat: 'friend',
    desc: '结识天下所有道友。',
    goal: { cur: (p) => countMetNpcs(p), target: NPC_LIST.length },
    reward: { stones: 500, items: [['pill_xiancha', 2]] } },
];

// —— 进度 / 奖励 辅助（供 UI 与逻辑共用）——

// 某成就当前进度：{ cur, target, done }
export function achProgress(player, a) {
  const cur = Math.max(0, Math.floor(a.goal.cur(player) || 0));
  const target = a.goal.target;
  return { cur, target, done: cur >= target };
}

// 奖励展示文案：「💎50 灵石 · 💊回血丹×1」
export function rewardDesc(reward) {
  if (!reward) return '无';
  const parts = [];
  if (reward.stones) parts.push(`💎${reward.stones} 灵石`);
  if (Array.isArray(reward.items)) {
    for (const [id, qty] of reward.items) {
      const it = ITEMS[id];
      const name = it ? `${it.emoji}${it.name}` : id;
      parts.push(`${name}×${qty}`);
    }
  }
  return parts.length ? parts.join(' · ') : '无';
}

// 把奖励入账：灵石直加；物品入袋，背包满（新种类）时折成灵石兜底，杜绝静默丢失。
// 返回本次实发明细，便于调用方记录日志。
export function applyAchievementReward(player, a) {
  const reward = a.reward;
  if (!reward) return [];
  const got = [];
  if (reward.stones) { addStones(player, reward.stones); got.push(`+${reward.stones} 灵石`); }
  if (Array.isArray(reward.items)) {
    for (const [id, qty] of reward.items) {
      const added = addItem(player, id, qty);
      const it = ITEMS[id];
      const name = it ? it.name : id;
      if (added > 0) {
        got.push(`+${added} × ${name}`);
      } else {
        // 背包满且为新种类：按售价折灵石补偿，确保奖励不凭空消失
        const comp = (it && it.price ? it.price : 20) * qty;
        addStones(player, comp);
        got.push(`+${comp} 灵石（${name} 折价）`);
      }
    }
  }
  return got;
}

function treasureTypes(player) {
  let n = 0;
  for (const id of Object.keys(player.bag)) {
    if (id.startsWith('fabao_') && player.bag[id] > 0) n += 1;
  }
  return n;
}

// 已结识道友数（直接读 player.npcs，避免引入 npc 模块造成循环依赖）
function countMetNpcs(player) {
  if (!player || !player.npcs) return 0;
  let n = 0;
  for (const id of Object.keys(player.npcs)) {
    if (player.npcs[id] && player.npcs[id].met) n += 1;
  }
  return n;
}

// 检测并授予新达成的成就：首次授予时一并入账奖励。返回本次新授予列表。
export function checkAchievements(player) {
  const granted = [];
  for (const a of ACHIEVEMENTS) {
    if (player.achievements.includes(a.id)) continue;
    const { done } = achProgress(player, a);
    if (done) {
      grantAchievement(player, a.id);
      applyAchievementReward(player, a);
      granted.push(a);
    }
  }
  return granted;
}
