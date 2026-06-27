// ============================================================================
// 探索事件池：按场景类型与境界权重抽取，是随机性的核心载体。
// 每个事件 run(player, rng) 返回一个 encounter，由 explore 负责挑选、UI 负责呈现与结算。
//   encounter.kind: 'battle' | 'instant' | 'choice' | 'world'
// reward 规约（applyReward 解析）：
//   { stones, items:[{id,qty}], xp, hp, mp, fullHeal, treasure, technique, recipe, title, rootUp, chaos, log, logType }
// ============================================================================

// 场景类型
export const SCENES = ['mountain', 'cave', 'ruin', 'wild'];
export const SCENE_NAMES = { mountain: '灵山脉地', cave: '仙人洞府', ruin: '上古遗迹', wild: '坊市野外' };

// common = 普通事件；rare = 稀有/高回报（受保底机制影响）
export const EVENTS = [
  // —— 资源类（common）——
  {
    id: 'evt_herb', name: '发现药草', scenes: ['mountain', 'wild', 'ruin'], minTier: 0, weight: 20, rare: false, emoji: '🌿',
    run: (_p, rng) => {
      const herb = rng() < 0.7 ? 'herb_qingmu' : 'herb_zihua';
      const qty = 1 + Math.floor(rng() * 3);
      return { kind: 'instant', title: '发现药草', emoji: '🌿', text: '路旁发现一丛灵气盎然的药草，采之。', result: { items: [{ id: herb, qty }], log: `采得${qty}株药草。`, logType: 'good' } };
    },
  },
  {
    id: 'evt_ore', name: '发现矿石', scenes: ['mountain', 'cave'], minTier: 0, weight: 16, rare: false, emoji: '⛏️',
    run: (_p, rng) => {
      const ore = rng() < 0.7 ? 'ore_xuantie' : 'ore_baijin';
      const qty = 1 + Math.floor(rng() * 2);
      return { kind: 'instant', title: '发现矿石', emoji: '⛏️', text: '岩壁间隐有矿脉闪光，敲下几块矿石。', result: { items: [{ id: ore, qty }], log: `采得${qty}块矿石。`, logType: 'good' } };
    },
  },
  {
    id: 'evt_lingstone', name: '灵石矿脉', scenes: ['mountain', 'cave', 'ruin'], minTier: 0, weight: 12, rare: false, emoji: '💎',
    run: (p, rng) => {
      const stones = Math.round((15 + p.lv * 4) * (0.8 + rng() * 0.6));
      return { kind: 'instant', title: '灵石矿脉', emoji: '💎', text: '你寻得一处小型灵石矿脉，收获颇丰。', result: { stones, log: `获得 ${stones} 灵石。`, logType: 'good' } };
    },
  },
  {
    id: 'evt_spring', name: '灵泉', scenes: ['mountain'], minTier: 0, weight: 10, rare: false, emoji: '⛲',
    run: () => ({ kind: 'instant', title: '天然灵泉', emoji: '⛲', text: '一汪灵泉沁人心脾，气血灵力尽复。', result: { fullHeal: true, xp: 5, log: '沐浴灵泉，气血灵力恢复，略有感悟。', logType: 'good' } }),
  },
  {
    id: 'evt_epiphany', name: '顿悟奇遇', scenes: ['mountain', 'cave', 'ruin', 'wild'], minTier: 0, weight: 7, rare: false, emoji: '✨',
    run: (p, rng) => {
      const xp = Math.round(xpNeeded(p.lv) * (0.1 + rng() * 0.15));
      return { kind: 'instant', title: '顿悟', emoji: '✨', text: '观天地之变，忽有所悟，修为大进！', result: { xp, log: `顿悟！修为 +${xp}。`, logType: 'epic' } };
    },
  },
  {
    id: 'evt_trap', name: '陷阱', scenes: ['ruin', 'wild', 'cave'], minTier: 0, weight: 9, rare: false, emoji: '⚠️',
    run: (p, rng) => {
      const hp = Math.round(p.maxHp * (0.1 + rng() * 0.15));
      return { kind: 'instant', title: '触发陷阱', emoji: '⚠️', text: '一道禁制突然激发，你躲闪不及。', result: { hp: -hp, log: `触发陷阱，损失 ${hp} 气血。`, logType: 'bad' } };
    },
  },

  // —— 战斗类 ——
  {
    id: 'evt_beast', name: '遭遇妖兽', scenes: ['mountain', 'cave', 'ruin', 'wild'], minTier: 0, weight: 18, rare: false, emoji: '🐉',
    run: (p, rng) => {
      const enemy = makeEnemyForEvent(p, rng);
      return { kind: 'battle', title: '遭遇妖兽', emoji: '🐉', text: `一只${enemy.name}拦住去路，獠牙森森！`, enemy };
    },
  },

  // —— 选择类 ——
  {
    id: 'evt_duel', name: '修士争斗', scenes: ['wild', 'mountain'], minTier: 1, weight: 10, rare: false, emoji: '⚔️',
    run: (p, rng) => ({
      kind: 'choice', title: '修士争斗', emoji: '⚔️',
      text: '前方两名修士正为一件宝物斗法，你驻足观望……',
      options: [
        { label: '观战不语', emoji: '👁️', resolve: (r) => {
          if (r() < 0.5) { const xp = Math.round(xpNeeded(p.lv) * 0.08); return { xp, log: '观摩斗法，颇有启发。', logType: 'good' }; }
          return { log: '二人势均力敌，你悄然离去。', logType: 'normal' };
        } },
        { label: '上前争抢', emoji: '🗡️', resolve: (r) => {
          if (r() < 0.5) return { battle: makeEnemyForEvent(p, r), text: '你贸然出手，反被对方联手围攻！' };
          const stones = Math.round((20 + p.lv * 5) * (0.8 + r() * 0.8));
          return { stones, log: `你渔翁得利，夺得 ${stones} 灵石。`, logType: 'good' };
        } },
        { label: '转身离开', emoji: '🏃', resolve: () => ({ log: '多一事不如少一事，你远遁而去。', logType: 'normal' }) },
      ],
    }),
  },
  {
    id: 'evt_rift', name: '空间裂缝', scenes: ['ruin', 'cave'], minTier: 2, weight: 6, rare: true, emoji: '🌀',
    run: (p, rng) => ({
      kind: 'choice', title: '空间裂缝', emoji: '🌀',
      text: '虚空忽现一道裂缝，内里灵气翻涌，似藏重宝，又似凶险万分。',
      options: [
        { label: '纵身探入', emoji: '🌀', resolve: (r) => {
          if (r() < 0.45) {
            const stones = Math.round((60 + p.lv * 12) * (1 + r()));
            return { stones, items: [{ id: 'essence_ling', qty: 2 }], log: `空间裂缝中大有收获！获得 ${stones} 灵石与灵气结晶。`, logType: 'epic' };
          }
          const hp = Math.round(p.maxHp * 0.4);
          return { hp: -hp, log: `空间乱流卷过，损失 ${hp} 气血，险些陨落！`, logType: 'bad' };
        } },
        { label: '谨慎封印', emoji: '🔒', resolve: () => ({ stones: 15, xp: Math.round(xpNeeded(p.lv) * 0.05), log: '你以法力封印裂缝，略有消耗，也小有收获。', logType: 'good' }) },
      ],
    }),
  },
  {
    id: 'evt_heartmirage', name: '心魔幻境', scenes: ['cave', 'ruin'], minTier: 3, weight: 6, rare: true, emoji: '👁️‍🗨️',
    run: (p, rng) => ({
      kind: 'choice', title: '心魔幻境', emoji: '👁️‍🗨️',
      text: '周遭景色诡变，似真似幻，神识一阵恍惚——这是心魔作祟！',
      options: [
        { label: '坚守本心', emoji: '🧘', resolve: (r) => {
          const success = r() < clamp01(0.4 + p.spirit / 250);
          if (success) { const xp = Math.round(xpNeeded(p.lv) * 0.12); return { xp, log: '你神识坚定，勘破幻境，修为精进！', logType: 'epic' }; }
          return { hp: -Math.round(p.maxHp * 0.2), log: '心魔入侵，神识受创，气血折损。', logType: 'bad' };
        } },
        { label: '以力破之', emoji: '💥', resolve: (r) => {
          if (r() < 0.35) return { battle: makeEnemyForEvent(p, r), text: '幻境化作实形，化为妖魔扑来！' };
          return { log: '你强攻幻境，幻象溃散。', logType: 'normal' };
        } },
      ],
    }),
  },

  // —— 发现类（rare）——
  {
    id: 'evt_cave_legacy', name: '仙人洞府', scenes: ['cave', 'ruin'], minTier: 1, weight: 5, rare: true, emoji: '🏯',
    run: (p, rng) => {
      const roll = rng();
      if (roll < 0.4) {
        const treasures = ['fabao_feijian', 'fabao_xuangai', 'fabao_huoyun', 'fabao_bingpo', 'fabao_leiyin'];
        const id = treasures[Math.min(treasures.length - 1, Math.floor(rng() * (2 + p.lv / 6)))];
        return { kind: 'instant', title: '仙人遗府', emoji: '🏯', text: '洞府深处，你寻得一件前人遗宝！', result: { treasure: id, log: '获得一件法宝！', logType: 'epic' } };
      }
      if (roll < 0.7) {
        const techs = ['gongfa_changchun', 'gongfa_xuanmu', 'gongfa_leiting', 'gongfa_taiyi'];
        const id = techs[Math.min(techs.length - 1, Math.floor(rng() * (1 + p.lv / 7)))];
        return { kind: 'instant', title: '仙人遗府', emoji: '🏯', text: '石壁上刻着一门功法残卷，你细细参悟。', result: { technique: id, log: '习得一门功法！', logType: 'epic' } };
      }
      const recipes = ['rcp_tupo', 'rcp_zhuji', 'rcp_huitian2', 'bp_huoyun'];
      const id = recipes[Math.floor(rng() * recipes.length)];
      return { kind: 'instant', title: '仙人遗府', emoji: '🏯', text: '案上有一卷丹方/器图，你收入囊中。', result: { recipe: id, log: '获得一份配方！', logType: 'good' } };
    },
  },
  {
    id: 'evt_chest', name: '遗迹宝箱', scenes: ['ruin'], minTier: 0, weight: 7, rare: false, emoji: '🧰',
    run: (p, rng) => {
      const stones = Math.round((25 + p.lv * 6) * (0.8 + rng() * 0.8));
      const r = rng();
      if (r < 0.15) return { kind: 'instant', title: '遗迹宝箱', emoji: '🧰', text: '宝箱内有前人遗留的法宝！', result: { stones, treasure: 'fabao_feijian', log: `宝箱开启：${stones} 灵石 + 一件法宝！`, logType: 'epic' } };
      if (r < 0.4) return { kind: 'instant', title: '遗迹宝箱', emoji: '🧰', text: '宝箱里是满满的灵石与材料。', result: { stones, items: [{ id: 'essence_ling', qty: 2 }], log: `宝箱开启：${stones} 灵石 + 灵气结晶。`, logType: 'good' } };
      return { kind: 'instant', title: '遗迹宝箱', emoji: '🧰', text: '宝箱锈蚀，所剩无几。', result: { stones, log: `宝箱开启：${stones} 灵石。`, logType: 'good' } };
    },
  },

  // —— 世界级混沌事件（极稀有）——
  {
    id: 'evt_lingchao', name: '灵潮爆发', scenes: ['mountain', 'cave', 'ruin', 'wild'], minTier: 1, weight: 2, rare: true, emoji: '🌊',
    run: () => ({ kind: 'world', title: '灵潮爆发', emoji: '🌊', text: '天地灵潮骤起，灵气浓郁欲滴！', result: { chaos: { kind: 'lingchao', speedBoostSec: 600 }, log: '【灵潮爆发】未来 10 分钟修炼速度翻倍！', logType: 'epic' } }),
  },
  {
    id: 'evt_mojie', name: '魔劫入侵', scenes: ['wild', 'ruin'], minTier: 2, weight: 2, rare: true, emoji: '👿',
    run: () => ({ kind: 'world', title: '魔劫入侵', emoji: '👿', text: '魔气冲天，坊市物价紊乱，妖兽躁动！', result: { chaos: { kind: 'mojie', priceBoostSec: 600 }, log: '【魔劫入侵】坊市物价飙升，妖兽更凶！', logType: 'bad' } }),
  },
];

// —— 工具：让 events 模块自洽 ——
import { makeEnemy } from './enemies.js';
import { xpNeeded } from '../config.js';
function makeEnemyForEvent(p, rng) { return makeEnemy(p.lv, rng); }
function clamp01(v) { return Math.max(0, Math.min(1, v)); }

// 当前场景可用事件（按境界过滤）
export function eligibleEvents(playerTier, scene) {
  return EVENTS.filter((e) => e.minTier <= playerTier && e.scenes.includes(scene));
}
