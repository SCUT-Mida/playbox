// ============================================================================
// 成就与称号：部分成就由各系统在触发瞬间授予，部分由本表按状态/统计自动检测。
// ============================================================================
import { grantAchievement } from './player.js';

// 称号：提供微弱修炼加成（见 config.titleCultivateMult）
export const TITLES = {
  title_qidao: { id: 'title_qidao', name: '筑基道子', desc: '筑基成功，修炼速度 +5%。', emoji: '🔰' },
  title_xianyuan: { id: 'title_xianyuan', name: '结丹仙缘', desc: '结丹成功，修炼速度 +8%。', emoji: '🌟' },
};

// 成就：name/desc 用于展示，check(player) 决定是否达成
export const ACHIEVEMENTS = [
  { id: 'ach_first_battle', name: '初露锋芒', desc: '赢得第一场战斗。', emoji: '⚔️', check: (p) => p.stats.battlesWon >= 1 },
  { id: 'ach_alchemy_fail', name: '万事开头难', desc: '第一次炼丹失败。', emoji: '💥', check: (p) => p.stats.alchemyFails >= 1 },
  { id: 'ach_alchemist', name: '炼丹宗师', desc: '累计成功炼丹 20 次。', emoji: '⚗️', check: (p) => (p.stats.alchemyOk || 0) >= 20 },
  { id: 'ach_lowhp_comeback', name: '空血反杀', desc: '在仅剩 1 点气血时赢得战斗。', emoji: '🩸', check: (p) => (p.stats.lowHpWins || 0) >= 1 },
  { id: 'ach_streak10', name: '势如破竹', desc: '连续 10 次突破无失败。', emoji: '🔥', check: (p) => p.stats.breakthroughStreak >= 10 },
  { id: 'ach_explore100', name: '行万里路', desc: '累计探索 100 次。', emoji: '🗺️', check: (p) => p.stats.exploreCount >= 100 },
  { id: 'ach_rich', name: '富甲一方', desc: '拥有 2000 灵石。', emoji: '💰', check: (p) => p.stones >= 2000 },
  { id: 'ach_collector', name: '法宝收藏家', desc: '同时拥有 4 种以上法宝。', emoji: '🗡️', check: (p) => treasureTypes(p) >= 4 },
  { id: 'ach_ascend', name: '白日飞升', desc: '渡过飞升天劫，得道成仙。', emoji: '⛩️', check: (p) => p.ascended },
];

function treasureTypes(player) {
  let n = 0;
  for (const id of Object.keys(player.bag)) {
    if (id.startsWith('fabao_') && player.bag[id] > 0) n += 1;
  }
  return n;
}

// 检测并授予新达成的成就，返回本次新授予列表
export function checkAchievements(player) {
  const granted = [];
  for (const a of ACHIEVEMENTS) {
    if (player.achievements.includes(a.id)) continue;
    if (a.check(player)) {
      grantAchievement(player, a.id);
      granted.push(a);
    }
  }
  return granted;
}
