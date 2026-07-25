// ============================================================================
// 游戏状态：新局初始化（势力 / 城市 / 名将部署）、回合结算（经济·人口·科技·AI）、
// 胜负判定与各类查询辅助。纯数据 + 纯函数，便于单测。
// ============================================================================
import {
  CITIES, CITY_MAP,
} from '../data/cities.js';
import { HEROES, HERO_MAP, FACTION_SEEDS, makeGenericGeneral, makeWildGeneral } from '../data/heroes.js';
import {
  GAME_VERSION, CMD_BASE, CMD_PER_CITY, TRAINING_BASE,
  FACTION_COLORS, PLAYER_COLOR, GRAIN_UPKEEP_PER_SOLDIER, TECH_COST_TURNS, TECH_MAX_LEVEL,
  CITY_OFFICES, officeField,
} from '../config.js';
import { skillBonus, techMult, ensureTechLevels } from './tech.js';
import { chance } from './rng.js';
import {
  citiesOf, cityGoldIncome, cityGrainIncome, cityPopGrowth, cityDefenseValue,
} from './economy.js';
import { effLead, effWar } from './combat.js';

// —— 查询辅助 ——
export const cityById = (state, id) => state.cities.find((c) => c.id === id);
export const heroById = (state, id) => state.heroes.find((h) => h.id === id);
export const factionById = (state, id) => state.factions.find((f) => f.id === id);
export const playerFaction = (state) => factionById(state, state.playerFactionId);
export const neighbors = (state, cityId) => {
  const c = cityById(state, cityId);
  return c ? c.adjacent.map((id) => cityById(state, id)).filter(Boolean) : [];
};
export const heroesOfFaction = (state, fid) => state.heroes.filter((h) => h.factionId === fid && h.status !== 'prisoner');
export const prisonersOfFaction = (state, fid) => state.heroes.filter((h) => h.prisonerOf === fid);
export const lordOf = (state, fid) => state.heroes.find((h) => h.factionId === fid && (h.isPlayerLord || h.lord));

// —— 城市职官 ——
// 取某城某职官在任武将（不在任 / 不在本城 / 被俘 均视为空）。
export function officeHolder(state, city, key) {
  if (!city) return null;
  const id = city[officeField(key)];
  if (!id) return null;
  const h = heroById(state, id);
  if (!h || h.status === 'prisoner' || h.cityId !== city.id) return null;
  return h;
}
// 卸除某武将的一切职官（调遣 / 被俘 / 城陷时调用，杜绝悬挂引用）。
export function clearHeroOffices(state, heroId) {
  for (const c of state.cities) {
    for (const o of CITY_OFFICES) {
      if (c[o.field] === heroId) c[o.field] = null;
    }
  }
}

// 一座城市内的己方在岗武将（free / deployed，排除俘虏、在野）
export function heroesInCity(state, cityId, fid) {
  return state.heroes.filter((h) => h.cityId === cityId && h.status !== 'prisoner' && !h.wild
    && (fid == null || h.factionId === fid));
}
// 城市内的在野名将（可探索 / 登用）
export function wildHeroesInCity(state, cityId) {
  return state.heroes.filter((h) => h.wild && h.cityId === cityId && h.status !== 'gone');
}

// 带兵上限：统率 × 100 × (1 + 统御技能) × 统御科技
export function troopCap(state, hero) {
  if (!hero) return 0;
  return Math.round(hero.stats.l * 100 * (1 + skillBonus(hero).cap) * techMult(state, hero.factionId, 'leadership', 0.1));
}

// 指令点数：基础 + 每多一城 + 君主政治加成（政治 / 20，使高政治君主确有更多指令）
export function cmdPoints(state, fid) {
  const n = citiesOf(state, fid).length;
  const lord = lordOf(state, fid);
  const pol = lord ? lord.stats.p : 50;
  return CMD_BASE + CMD_PER_CITY * Math.max(0, n - 1) + Math.floor(pol / 20);
}
export function cmdRemaining(state, fid) {
  return Math.max(0, cmdPoints(state, fid) - (state.cmdUsedByFaction?.[fid] || 0));
}

// 当前期望守城主将（统率最高）
export function bestDefender(state, cityId) {
  const city = cityById(state, cityId);
  if (!city) return null;
  const roster = heroesInCity(state, cityId, city.ownerFactionId);
  if (!roster.length) return null;
  return roster.reduce((a, b) => (effLead(a) >= effLead(b) ? a : b));
}

// 城防上限
export function maxDefense(state, city) {
  return Math.round(cityDefenseValue(state, city));
}

// ============================================================================
// 新局初始化
// ============================================================================
export function newGame({ lordName, startCity, stats, rng } = {}) {
  const r = rng || Math.random;
  if (!lordName || !CITY_MAP[startCity]) throw new Error('newGame: 参数缺失');

  const state = {
    version: GAME_VERSION,
    turn: 1,
    playerFactionId: 0,
    factions: [],
    cities: [],
    heroes: [],
    techLevelsByFaction: {}, // { [fid]: { key: level } } —— 科技等级按势力独立存储
    researchByFaction: {}, // { [fid]: { key, turnsLeft } } —— 研究进度槽按势力独立
    cmdUsedByFaction: {},
    log: [],
    turnLog: [],
    over: null,
  };

  // —— 势力：玩家（id=0）+ AI ——
  state.factions.push({
    id: 0, name: `${lordName}势力`, color: PLAYER_COLOR,
    money: 0, grain: 0, aiControlled: false, lordName,
  });
  const facIdByKey = {}; // 势力 key → factionId（被玩家占都则缺省）
  let fid = 1;
  for (const seed of FACTION_SEEDS) {
    if (seed.capital === startCity) continue; // 玩家占了都城，该势力不生成
    const lordDef = HERO_MAP[seed.lordId];
    state.factions.push({
      id: fid, name: `${lordDef.name}势力`, color: FACTION_COLORS[fid % FACTION_COLORS.length],
      money: 0, grain: 0, aiControlled: true, lordName: lordDef.name,
    });
    facIdByKey[seed.key] = fid;
    fid += 1;
  }

  // —— 城市 ——
  for (const c of CITIES) {
    state.cities.push({
      id: c.id, name: c.name, x: c.x, y: c.y, trait: c.trait,
      ownerFactionId: null,
      population: c.pop0, maxPopulation: c.popMax,
      soldiers: c.soldiers0, defenseBase: c.defense0, defense: c.defense0,
      gold: c.gold0, grain: c.grain0, // 城库（攻陷时被缴获）
      farmLevel: 1, marketLevel: 1, wallLevel: 1,
      governorHeroId: null, generalHeroId: null, strategistHeroId: null,
      adjacent: c.adjacent.slice(),
      training: TRAINING_BASE,
    });
  }
  // 玩家初始城市
  const start = cityById(state, startCity);
  start.ownerFactionId = 0;
  const player = playerFaction(state);
  player.money = Math.round(start.gold + 3000);
  player.grain = Math.round(start.grain + 5000);

  // —— 玩家君主（第一武将）——
  const lord = {
    id: 'player_lord', name: lordName, isPlayerLord: true, lord: true,
    factionId: 0, cityId: startCity, status: 'free', loyalty: 100,
    stats: { ...stats }, skill: { name: '雄主', effect: 'cap:0.05' }, wild: false,
  };
  state.heroes.push(lord);
  start.governorHeroId = lord.id;

  // —— AI 都城归属 + 太守 ——
  for (const seed of FACTION_SEEDS) {
    const f = facIdByKey[seed.key];
    if (f == null) continue;
    const cap = cityById(state, seed.capital);
    cap.ownerFactionId = f;
    const fac = factionById(state, f);
    fac.money = Math.round(cap.gold + 2000);
    fac.grain = Math.round(cap.grain + 4000);
  }

  // —— 名将部署 ——
  for (const h of HEROES) {
    const copy = {
      id: h.id, name: h.name, isPlayerLord: false,
      factionId: null, cityId: null, status: 'free',
      loyalty: h.loyalty, stats: { ...h.stats },
      skill: h.skill ? { ...h.skill } : null, generic: !!h.generic, wild: false,
    };
    let demotedToWild = false; // 势力未生成（都城被玩家所占）→ 君主降为在野，不再视作君主
    if (h.serve) {
      const f = facIdByKey[h.serve];
      if (f != null) {
        const seed = FACTION_SEEDS.find((s) => s.key === h.serve);
        copy.factionId = f;
        copy.cityId = seed.capital;
        copy.status = 'free';
      } else {
        // 势力未生成（都城被玩家所占）→ 转为该城在野，玩家可登用
        const seed = FACTION_SEEDS.find((s) => s.key === h.serve);
        copy.factionId = null;
        copy.cityId = seed.capital; // == startCity
        copy.status = 'free';
        copy.wild = true;
        copy.discovered = true; // 名义上原属此城，直接可见
        demotedToWild = true;
      }
    } else if (h.wild) {
      copy.factionId = null;
      copy.cityId = h.wild;
      copy.status = 'free';
      copy.wild = true;
      copy.discovered = false;
    } else {
      continue;
    }
    if (h.lord && !demotedToWild) copy.lord = true;
    state.heroes.push(copy);
  }

  // —— AI 太守（君主坐镇都城）——
  for (const seed of FACTION_SEEDS) {
    const f = facIdByKey[seed.key];
    if (f == null) continue;
    cityById(state, seed.capital).governorHeroId = seed.lordId;
  }

  // —— 为兵微将寡的 AI 势力补充部将（每势力至少 3 名）——
  let genIdx = 0;
  for (const seed of FACTION_SEEDS) {
    const f = facIdByKey[seed.key];
    if (f == null) continue;
    const roster = heroesOfFaction(state, f);
    const need = Math.max(0, 3 - roster.length);
    for (let i = 0; i < need; i++) {
      const g = makeGenericGeneral(r, ++genIdx);
      g.id = `gen_${seed.key}_${i}`;
      g.factionId = f;
      g.cityId = seed.capital;
      g.status = 'free';
      state.heroes.push(g);
    }
  }

  // —— 在野随机人物：每座城散布 1 名（约三成概率再多 1 名）能力随机的乡野豪杰 ——
  // 与名将并列于在野池，可探索 / 登用，弥补「在野只有名将」的单调，提升可玩度。
  let wildIdx = 0;
  for (const c of state.cities) {
    const n = 1 + (chance(r, 0.3) ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const g = makeWildGeneral(r, ++wildIdx);
      g.id = `genwild_${c.id}_${i}`; // 城内唯一
      g.wild = true;
      g.factionId = null;
      g.cityId = c.id;
      g.status = 'free';
      g.discovered = false;
      state.heroes.push(g);
    }
  }

  // 初始城防归位
  for (const c of state.cities) c.defense = maxDefense(state, c);

  // 起兵之城的在野名将预先「风闻」（已发现，可直接登用），帮助玩家平稳开局
  for (const h of state.heroes) {
    if (h.wild && h.cityId === startCity) h.discovered = true;
  }

  state.turnLog = [`公元初年，${lordName} 于 ${start.name} 起兵，群雄并起，逐鹿天下！`];
  return state;
}

// ============================================================================
// 回合结算（玩家点「结束回合」后调用）
// 顺序：城防回满 → 经济·人口结算 → 科技推进 → AI 行动 → 回合 +1 → 胜负判定
// 返回本回合事件摘要（state.turnLog）
// ============================================================================
export function resolveTurn(state, aiModule, rng) {
  const r = rng || Math.random;
  state.turnLog = [];

  for (const c of state.cities) {
    if (c.ownerFactionId != null) c.defense = maxDefense(state, c);
  }

  // —— 经济 / 人口结算（逐势力）——
  for (const fac of state.factions) {
    const fid = fac.id;
    let goldIn = 0;
    let grainIn = 0;
    let grainEat = 0;
    for (const c of citiesOf(state, fid)) {
      goldIn += cityGoldIncome(state, c);
      grainIn += cityGrainIncome(state, c);
      grainEat += c.soldiers * GRAIN_UPKEEP_PER_SOLDIER;
    }
    fac.money += Math.round(goldIn);
    fac.grain += Math.round(grainIn - grainEat);

    // 人口增长（太守或君主政治）
    const lord = lordOf(state, fid);
    const basePol = lord ? lord.stats.p : 50;
    for (const c of citiesOf(state, fid)) {
      const gov = c.governorHeroId ? heroById(state, c.governorHeroId) : null;
      const pol = gov ? gov.stats.p : basePol;
      const growth = cityPopGrowth(state, c, pol);
      c.population = Math.min(c.maxPopulation, c.population + Math.round(growth));
    }

    // 军粮不足 → 士兵逃亡（最多逃 10%）
    if (fac.grain < 0) {
      const owned = citiesOf(state, fid).slice().sort((a, b) => b.soldiers - a.soldiers);
      let deficitSoldiers = Math.ceil(-fac.grain / GRAIN_UPKEEP_PER_SOLDIER);
      const total = owned.reduce((s, c) => s + c.soldiers, 0);
      deficitSoldiers = Math.min(deficitSoldiers, Math.ceil(total * 0.1));
      for (const c of owned) {
        if (deficitSoldiers <= 0) break;
        const take = Math.min(c.soldiers, deficitSoldiers);
        c.soldiers -= take;
        deficitSoldiers -= take;
      }
      fac.grain = 0;
      if (!fac.aiControlled) state.turnLog.push(`⚠️ 军粮告竭，士兵逃亡（本城损失兵力）。`);
    }
  }

  // —— 科技推进（逐势力独立研究槽、独立等级，互不阻塞、互不共享）——
  state.researchByFaction = state.researchByFaction || {};
  for (const fac of state.factions) {
    const res = state.researchByFaction[fac.id];
    if (!res) continue;
    res.turnsLeft -= 1;
    if (res.turnsLeft <= 0) {
      // 仅对本势力加级；其他势力（含同时研究同项科技者）的等级不受影响
      const tbl = ensureTechLevels(state, fac.id);
      tbl[res.key] = Math.min(TECH_MAX_LEVEL, (tbl[res.key] || 0) + 1);
      if (fac.id === state.playerFactionId) {
        state.turnLog.push(`🔬 科技突破：研究完成（${res.key} 升至 ${tbl[res.key]} 级）。`);
      }
      delete state.researchByFaction[fac.id];
    }
  }

  // —— AI 行动 ——
  if (aiModule && typeof aiModule.aiTurnAll === 'function') {
    aiModule.aiTurnAll(state, r);
  }

  // —— 名将忠诚度自然漂移（轻微）——
  for (const h of state.heroes) {
    if (h.status === 'prisoner' || h.wild) continue;
    if (chance(r, 0.5)) h.loyalty = Math.max(0, Math.min(100, h.loyalty + (chance(r, 0.5) ? 1 : -1)));
  }

  state.turn += 1;
  state.cmdUsedByFaction = {};
  checkGameOver(state);
  return state.turnLog;
}

// ============================================================================
// 胜负判定
// ============================================================================
export function checkGameOver(state) {
  const playerCities = citiesOf(state, state.playerFactionId);
  if (playerCities.length === 0) { state.over = 'lose'; return; }
  const allOwned = state.cities.every((c) => c.ownerFactionId === state.playerFactionId);
  if (allOwned) state.over = 'win';
}

export { effLead, effWar };
