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
import { TECH_COST_GOLD } from '../config.js';

// 单个 AI 势力行动
export function aiTurn(state, fid, rng) {
  const r = rng || Math.random;
  const cities = citiesOf(state, fid);
  if (!cities.length) return;
  const lord = lordOf(state, fid);

  let guard = 0;
  while (cmdRemaining(state, fid) > 0 && guard++ < 30) {
    let acted = false;

    // 1) 内政：国库充盈（金钱 > 600）才升市场——有钱才投资，优于设计文档初稿"金币低于 500 升市场"的被动策略；兵不足人口 20% 则征兵
    for (const c of cities) {
      if (cmdRemaining(state, fid) <= 0) break;
      const fac = state.factions.find((f) => f.id === fid);
      if (fac.money > 600 && c.marketLevel < 5 && chance(r, 0.5)) {
        if (A.developMarket(state, c.id, fid).ok) { acted = true; break; }
      }
    }
    for (const c of cities) {
      if (cmdRemaining(state, fid) <= 0) break;
      if (c.soldiers < c.population * 0.2) {
        const recruitN = Math.min(800, Math.floor(c.population * 0.05));
        if (recruitN > 50 && A.recruit(state, c.id, recruitN, fid).ok) { acted = true; break; }
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
