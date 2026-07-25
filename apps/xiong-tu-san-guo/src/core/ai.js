// ============================================================================
// AI 势力回合：按设计文档优先级消耗指令点。
//   1) 内政（升市场 / 征兵） 2) 招募在野名将 3) 科技研究
//   4) 侵略相邻弱敌 5) 输送平衡防御 6) 赏赐稳忠诚
// 直接复用 actions.js 的命令函数（与玩家同规则）。
// ============================================================================
import * as A from './actions.js';
import {
  cmdRemaining, heroesOfFaction, neighbors, lordOf,
} from './state.js';
import { citiesOf } from './economy.js';
import { effLead } from './combat.js';
import { chance } from './rng.js';
import { TECH_COST_GOLD, buildCapForCity, cityUpgradeGoldCost, CITY_MAX_LEVEL } from '../config.js';

// 单个 AI 势力行动
export function aiTurn(state, fid, rng) {
  const r = rng || Math.random;
  const cities = citiesOf(state, fid);
  if (!cities.length) return;
  const lord = lordOf(state, fid);

  let guard = 0;
  while (cmdRemaining(state, fid) > 0 && guard++ < 30) {
    let acted = false;

    // 1) 内政：国库充盈（金钱 > 600）才投资开发。市场 / 农田 / 城墙三项资源须均衡轮动升级——
    //    只升市场会让 farmLevel / wallLevel 长期停在 1，而 upgradeCity 的前置要求三项资源
    //    均满当前上限（cap 至少 5），ready 永远为 false，于是 AI 既无法升级城池，也无法借
    //    城池等级抬高科技上限（本次新增的「城池等级解锁科技上限 / 城池升级加成」对 AI 完全
    //    失效，玩家获得非预期优势）。故每轮优先补齐三项中等级最低者，尽快同时触顶解锁升城。
    const fac = state.factions.find((f) => f.id === fid);
    const developOpts = [
      { fn: (cid) => A.developMarket(state, cid, fid), lv: 'marketLevel' },
      { fn: (cid) => A.developFarm(state, cid, fid), lv: 'farmLevel' },
      { fn: (cid) => A.buildWall(state, cid, fid), lv: 'wallLevel' },
    ];
    for (const c of cities) {
      if (cmdRemaining(state, fid) <= 0 || fac.money <= 600) break;
      if (!chance(r, 0.5)) continue; // 与原逻辑一致：约半数概率投资
      const cap = buildCapForCity(c);
      const lowest = developOpts
        .filter((o) => c[o.lv] < cap)
        .sort((a, b) => c[a.lv] - c[b.lv])[0];
      if (lowest && lowest.fn(c.id).ok) { acted = true; break; }
    }
    for (const c of cities) {
      if (cmdRemaining(state, fid) <= 0) break;
      if (c.soldiers < c.population * 0.2) {
        const recruitN = Math.min(800, Math.floor(c.population * 0.05));
        if (recruitN > 50 && A.recruit(state, c.id, recruitN, fid).ok) { acted = true; break; }
      }
    }
    // 城池升级：富余金钱 + 三项资源已满当前上限 + 未到顶 → 升城（解锁更高上限 / 收益）
    if (!acted) {
      const fac = state.factions.find((f) => f.id === fid);
      for (const c of cities) {
        if (cmdRemaining(state, fid) <= 0) break;
        c.level = c.level || 1;
        if (c.level >= CITY_MAX_LEVEL) continue;
        const cap = buildCapForCity(c);
        const ready = c.farmLevel >= cap && c.marketLevel >= cap && c.wallLevel >= cap;
        if (ready && fac.money >= cityUpgradeGoldCost(c.level) + 500 && chance(r, 0.6)) {
          if (A.upgradeCity(state, c.id, fid).ok) { acted = true; break; }
        }
      }
    }

    // 2) 招募在野名将（魅力 > 70 的武将空闲时探索 + 登用）
    if (!acted) {
      const charmHero = heroesOfFaction(state, fid).find((h) => h.stats.c > 70);
      if (charmHero) {
        for (const c of cities) {
          if (cmdRemaining(state, fid) <= 0) break;
          const res = A.explore(state, c.id, fid, r);
          if (res.ok && res.discovered && res.discovered.length) {
            const target = res.discovered[0];
            A.recruitHero(state, target.id, fid, r);
            acted = true;
            break;
          }
        }
      }
    }

    // 3) 科技研究（本势力独立研究槽）
    if (!acted && !(state.researchByFaction && state.researchByFaction[fid]) && chance(r, 0.3)) {
      const fac = state.factions.find((f) => f.id === fid);
      if (fac.money >= TECH_COST_GOLD) {
        const keys = ['agri', 'commerce', 'forge', 'wall', 'trick', 'leadership'];
        const k = keys[Math.floor(r() * keys.length)];
        if (A.research(state, k, fid).ok) acted = true;
      }
    }

    // 4) 侵略：相邻非己方城市，军力占优（兵力比 > 1.3）则出征
    if (!acted) {
      outer: for (const c of cities) {
        const attacker = heroesOfFaction(state, fid).find((h) => h.cityId === c.id && h.status === 'free');
        if (!attacker) continue;
        for (const n of neighbors(state, c.id)) {
          if (cmdRemaining(state, fid) <= 0) break outer;
          if (n.ownerFactionId === fid) continue;
          const myPow = c.soldiers + effLead(attacker) * 5;
          const foePow = n.soldiers + (n.defense || 0) * 0.5;
          if (myPow > foePow * 1.5 && c.soldiers > 800) {
            const troops = Math.min(c.soldiers - 200, Math.floor(c.soldiers * 0.7));
            // 武将众多时主帅偕副将出征（择城中武力 / 统率较高者最多 2 名）
            const deputies = heroesOfFaction(state, fid)
              .filter((h) => h.cityId === c.id && h.status === 'free' && h.id !== attacker.id)
              .sort((x, y) => ((y.stats.w || 0) + (y.stats.l || 0)) - ((x.stats.w || 0) + (x.stats.l || 0)))
              .slice(0, 2)
              .map((h) => h.id);
            const res = A.campaign(state, c.id, n.id, attacker.id, troops, 'assault', fid, r, deputies);
            if (res.ok) {
              state.turnLog.push(`⚔️ ${state.factions.find((f) => f.id === fid).name} 出兵攻打 ${n.name}${res.won ? '并攻陷之' : '，未能攻克'}。`);
              acted = true;
              break outer;
            }
          }
        }
      }
    }

    // 5) 赏赐稳忠诚
    if (!acted) {
      const low = heroesOfFaction(state, fid).find((h) => h.loyalty < 60);
      if (low) { A.reward(state, low.id, fid); acted = true; }
    }

    if (!acted) break; // 无事可做，结束本势力回合
  }
}

export function aiTurnAll(state, rng) {
  const r = rng || Math.random;
  for (const f of state.factions) {
    if (!f.aiControlled) continue;
    aiTurn(state, f.id, r);
  }
}
