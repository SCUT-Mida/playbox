// ============================================================================
// 成就系统：达成条件 / 当前进度 / 奖励。纯逻辑。
// ============================================================================
import { collectionProgress, totalStars } from './player.js';
import { addRes } from './player.js';
import { CHAPTERS } from './stage.js';

export const ACHIEVEMENTS = [
  { id: 'ach_first_draw', cat: 'gacha', name: '初探问道', desc: '完成首次问道。',
    goal: { cur: (p) => p.stats.draws || 0, target: 1 }, reward: { wendao: 3 } },
  { id: 'ach_own_sr', cat: 'gacha', name: '紫金入袖', desc: '获得一张 SR 卡。',
    goal: { cur: (p) => p.stats.sr > 0 ? 1 : 0, target: 1 }, reward: { wendao: 5 } },
  { id: 'ach_own_ssr', cat: 'gacha', name: '彩凰降世', desc: '获得一张 SSR 卡。',
    goal: { cur: (p) => p.stats.ssr > 0 ? 1 : 0, target: 1 }, reward: { tiandao_f: 2 } },
  { id: 'ach_draw50', cat: 'gacha', name: '问道五十', desc: '累计问道 50 次。',
    goal: { cur: (p) => p.stats.draws || 0, target: 50 }, reward: { wendao: 10 } },

  { id: 'ach_stage1', cat: 'story', name: '初露锋芒', desc: '通关第一章首领。',
    goal: { cur: (p) => p.story.clearedStages['1-7'] ? 1 : 0, target: 1 }, reward: { lingshi: 500 } },
  { id: 'ach_stage3', cat: 'story', name: '峡谷之主', desc: '通关第三章首领。',
    goal: { cur: (p) => p.story.clearedStages['3-7'] ? 1 : 0, target: 1 }, reward: { lingshi: 1500 } },
  { id: 'ach_stage6', cat: 'story', name: '回廊深处', desc: '通关第六章首领。',
    goal: { cur: (p) => p.story.clearedStages['6-7'] ? 1 : 0, target: 1 }, reward: { gongfa: 5 } },
  { id: 'ach_clear_all', cat: 'story', name: '天道归墟', desc: '通关全部十二章。',
    goal: { cur: (p) => p.story.clearedStages['12-7'] ? 1 : 0, target: 1 }, reward: { tiandao: 1 } },

  { id: 'ach_secret30', cat: 'secret', name: '秘境初探', desc: '秘境爬塔抵达 30 层。',
    goal: { cur: (p) => Math.min(30, p.secret.bestFloor || 1), target: 30 }, reward: { wendao: 5 } },
  { id: 'ach_secret90', cat: 'secret', name: '九重天阙', desc: '秘境爬塔通关 90 层。',
    goal: { cur: (p) => Math.min(90, p.secret.bestFloor || 1), target: 90 }, reward: { tiandao: 1 } },

  { id: 'ach_codex_half', cat: 'codex', name: '半部天书', desc: '图鉴收集达 50%。',
    goal: { cur: (p) => Math.min(0.5, collectionProgress(p)), target: 0.5 }, reward: { wendao: 10 } },
  { id: 'ach_codex_full', cat: 'codex', name: '万剑归宗', desc: '图鉴收集 100%。',
    goal: { cur: (p) => Math.min(1, collectionProgress(p)), target: 1 }, reward: { tiandao: 2 } },

  { id: 'ach_stars20', cat: 'grow', name: '群星璀璨', desc: '卡牌累计升至 20 星。',
    goal: { cur: (p) => Math.min(20, totalStars(p)), target: 20 }, reward: { lingshi: 2000 } },
  { id: 'ach_win50', cat: 'grow', name: '百战之士', desc: '累计胜利 50 场。',
    goal: { cur: (p) => Math.min(50, p.stats.battlesWon || 0), target: 50 }, reward: { gongfa: 5 } },
];

export const ACH_CATS = [
  { id: 'gacha', name: '问道' },
  { id: 'story', name: '主线' },
  { id: 'secret', name: '秘境' },
  { id: 'codex', name: '图鉴' },
  { id: 'grow', name: '养成' },
];

export function achProgress(player, ach) {
  const cur = ach.goal.cur(player);
  const target = ach.goal.target;
  return { cur, target, done: cur >= target };
}

export function rewardDesc(reward) {
  if (!reward) return '无';
  const parts = [];
  for (const [id, q] of Object.entries(reward)) parts.push(`${resNameOf(id)}×${q}`);
  return parts.join('，') || '无';
}
// 轻量查表（避免循环依赖 config）
function resNameOf(id) {
  const map = {
    lingshi: '灵石', wendao: '问道令', exp_s: '修为丹·小', exp_m: '修为丹·中', exp_l: '修为丹·大',
    gongfa: '功法残页', tiandao_f: '天道本源·碎片', tiandao: '天道本源',
  };
  return map[id] || id;
}

// 检查并授予新达成的成就（发放奖励）。返回本次新授予的成就列表。
export function checkAchievements(player) {
  if (!Array.isArray(player.achievements)) player.achievements = [];
  const granted = [];
  for (const ach of ACHIEVEMENTS) {
    if (player.achievements.includes(ach.id)) continue;
    if (achProgress(player, ach).done) {
      player.achievements.push(ach.id);
      if (ach.reward) for (const [id, q] of Object.entries(ach.reward)) addRes(player, id, q);
      granted.push(ach);
    }
  }
  return granted;
}

// 兼容：导出 CHAPTERS 计数
export { CHAPTERS };
