// ============================================================================
// 主线关卡（设计稿 3.1：十二卷章 × 每章 7 关 = 84 战斗节点）。
//   每章：5 普通 + 1 精英 + 1 首领；推荐战力逐章递增；Boss 战力 = 推荐 ×1.5。
//   通关解锁下一关 / 下一章，并按掉落表（设计稿 5.2）发放资源与碎片。
// ============================================================================
import { rangeInt, chance, pick } from './rng.js';
import { makeEnemyFormation } from '../data/enemies.js';
import { playerSpecsFrom, runBattle } from './battle.js';
import { addRes, addFrag } from './player.js';
import { CARDS } from '../data/cards.js';
import { BREAK_STONE } from '../config.js';

// 设计稿 3.1 章节表
export const CHAPTERS = [
  { chapter: 1,  name: '初入灵墟',   power: 500,  element: 'earth', core: 'lingshi',   rarityDrop: 'R' },
  { chapter: 2,  name: '青云古道',   power: 800,  element: 'wood',  core: 'exp_s',     rarityDrop: 'R' },
  { chapter: 3,  name: '赤焰峡谷',   power: 1200, element: 'fire',  core: 'lingshi',   rarityDrop: 'SR' },
  { chapter: 4,  name: '寒潭幽境',   power: 1700, element: 'water', core: 'break',     rarityDrop: 'R' },
  { chapter: 5,  name: '金戈铁壁',   power: 2300, element: 'metal', core: 'gongfa',    rarityDrop: 'R' },
  { chapter: 6,  name: '万木回廊',   power: 3000, element: 'wood',  core: 'lingshi',   rarityDrop: 'SR' },
  { chapter: 7,  name: '地煞迷宫',   power: 3800, element: 'earth', core: 'break',     rarityDrop: 'SR' },
  { chapter: 8,  name: '天火熔炉',   power: 4700, element: 'fire',  core: 'gongfa',    rarityDrop: 'SR' },
  { chapter: 9,  name: '玄水冰窟',   power: 5700, element: 'water', core: 'tiandao_f', rarityDrop: 'SR' },
  { chapter: 10, name: '太初剑冢',   power: 6800, element: 'metal', core: 'gongfa',    rarityDrop: 'SSR' },
  { chapter: 11, name: '混沌虚空',   power: 8000, element: 'none',  core: 'tiandao',   rarityDrop: 'SSR' },
  { chapter: 12, name: '天道归墟',   power: 9500, element: 'fire',  core: 'tiandao',   rarityDrop: 'SSR' },
];

const NORMAL_FACTORS = [0.70, 0.75, 0.80, 0.85, 0.90];

// 构造某章 7 个关卡（按 stage 序号 1..7）
export function stagesForChapter(chapterIdx) {
  const ch = CHAPTERS[Math.max(0, Math.min(CHAPTERS.length - 1, chapterIdx))];
  const stages = [];
  for (let i = 0; i < 5; i++) {
    stages.push({
      id: `${ch.chapter}-${i + 1}`, chapter: ch.chapter, idx: i + 1,
      type: 'normal', power: Math.round(ch.power * NORMAL_FACTORS[i]),
      element: ch.element, name: `${ch.name} · 第${i + 1}阵`,
    });
  }
  stages.push({
    id: `${ch.chapter}-6`, chapter: ch.chapter, idx: 6,
    type: 'elite', power: Math.round(ch.power * 1.0),
    element: ch.element, name: `${ch.name} · 精英`,
  });
  stages.push({
    id: `${ch.chapter}-7`, chapter: ch.chapter, idx: 7,
    type: 'boss', power: Math.round(ch.power * 1.0),
    element: ch.element, name: `${ch.name} · 首领`,
  });
  return stages;
}

export function stageDef(stageId) {
  const [c, s] = String(stageId).split('-').map((x) => parseInt(x, 10));
  if (!Number.isFinite(c) || !Number.isFinite(s)) return null;
  const list = stagesForChapter(c - 1);
  return list.find((st) => st.idx === s) || null;
}

// 章节是否解锁（最高已解锁章节）
export function isChapterUnlocked(player, chapter) {
  return chapter <= (player.story.highestChapter || 1);
}

// 关卡是否可进入：章节解锁 & 上一关已通关（首关只需章节解锁）
export function canEnterStage(player, stageId) {
  const st = stageDef(stageId);
  if (!st) return false;
  if (!isChapterUnlocked(player, st.chapter)) return false;
  if (st.idx === 1) return true;
  const prev = `${st.chapter}-${st.idx - 1}`;
  return !!player.story.clearedStages[prev];
}
export function isStageCleared(player, stageId) { return !!player.story.clearedStages[stageId]; }

// 掉落表（设计稿 5.2）
function rollDrops(st, rng) {
  const ch = CHAPTERS[st.chapter - 1];
  const rewards = { res: {}, frags: {} }; // frags: {cardId: qty}
  const add = (id, q) => { rewards.res[id] = (rewards.res[id] || 0) + q; };
  const addFragRarity = (rarity, qty) => {
    const pool = CARDS.filter((c) => c.rarity === rarity);
    if (!pool.length) return;
    const c = pick(rng, pool);
    rewards.frags[c.id] = (rewards.frags[c.id] || 0) + qty;
  };

  if (st.type === 'normal') {
    add('lingshi', rangeInt(rng, 20, 50));
    if (chance(rng, 0.30)) add('exp_s', 1);
  } else if (st.type === 'elite') {
    add('lingshi', rangeInt(rng, 80, 150));
    if (ch.element !== 'none') add(BREAK_STONE[st.element], 1);
    if (chance(rng, 0.15)) addFragRarity('R', 1);
  } else { // boss
    add('lingshi', 200 + st.chapter * 20);
    add('exp_m', 2);
    // 核心掉落
    if (ch.core === 'lingshi') add('lingshi', 150);
    else if (ch.core === 'exp_s') add('exp_s', 3);
    else if (ch.core === 'exp_m' || ch.core === 'gongfa') add('gongfa', st.chapter >= 8 ? 2 : 1);
    else if (ch.core === 'break' && st.element !== 'none') add(BREAK_STONE[st.element], 2);
    else if (ch.core === 'tiandao_f') add('tiandao_f', 1);
    else if (ch.core === 'tiandao') add('tiandao', 1);
    // 稀有碎片
    const r = ch.rarityDrop;
    if (r === 'R') { if (chance(rng, 0.25)) addFragRarity('R', 1); }
    else if (r === 'SR') {
      if (chance(rng, 0.20)) addFragRarity('SR', 1);
      if (st.chapter >= 10 && chance(rng, 0.02)) addFragRarity('SSR', 1);
    } else if (r === 'SSR') {
      if (chance(rng, 0.30)) addFragRarity('SR', 2);
      if (chance(rng, 0.05)) addFragRarity('SSR', 1);
    }
    add('wendao', 1); // 首领必给 1 问道令
  }
  return rewards;
}

// 进入关卡 → 自动战斗 → 结算。返回 { ok, result, rewards, log }
export function enterStage(player, stageId, rng) {
  const st = stageDef(stageId);
  if (!st) return { ok: false, reason: '无此关卡' };
  if (!canEnterStage(player, stageId)) return { ok: false, reason: '尚未解锁' };
  const specs = playerSpecsFrom(player);
  if (!specs.length) return { ok: false, reason: '阵容为空' };
  const enemies = makeEnemyFormation(st.power, st.element, st.type, rng);
  const run = runBattle(specs, enemies, rng);
  const rewards = { res: {}, frags: {} };
  const logs = run.log.slice();
  if (run.result === 'win') {
    const drops = rollDrops(st, rng);
    rewards.res = drops.res;
    rewards.frags = drops.frags;
    for (const [id, q] of Object.entries(drops.res)) addRes(player, id, q);
    for (const [cid, q] of Object.entries(drops.frags)) addFrag(player, cid, q);
    // 记录通关 / 解锁
    player.story.clearedStages[stageId] = true;
    player.stats.stagesCleared = (player.stats.stagesCleared || 0) + 1;
    player.stats.battlesWon = (player.stats.battlesWon || 0) + 1;
    if (st.idx === 7 && st.chapter === (player.story.highestChapter || 1) && st.chapter < CHAPTERS.length) {
      player.story.highestChapter = st.chapter + 1;
    }
    // 通关 12 章首领会额外奖励限定天道本源
    if (st.chapter === 12 && st.idx === 7) addRes(player, 'tiandao', 1);
  } else {
    player.stats.battlesLost = (player.stats.battlesLost || 0) + 1;
  }
  return { ok: true, result: run.result, rewards, rounds: run.rounds, log: logs };
}
