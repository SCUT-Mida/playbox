// ============================================================================
// 经济结算：每座城市的金钱 / 粮食收入、军粮消耗、人口增长。
// 资源池（金钱 / 军粮）为势力级共享；人口 / 士兵 / 城防 / 建筑为城市级。
// ============================================================================
import {
  GOLD_PER_MARKET, GOLD_PER_POP, GRAIN_PER_FARM, GRAIN_UPKEEP_PER_SOLDIER,
  POP_GROWTH_RATE, POP_GROWTH_POL_DIVISOR, TRAINING_BASE,
} from '../config.js';
import { techMult } from './tech.js';

export function isOwnedBy(city, factionId) {
  return city.ownerFactionId === factionId;
}

export function citiesOf(state, factionId) {
  return state.cities.filter((c) => isOwnedBy(c, factionId));
}

function traitMult(city, type) {
  return city.trait && city.trait.type === type ? 1 + city.trait.value : 1;
}

// 商业收入（每回合，单城）
export function cityGoldIncome(state, city) {
  const base = city.marketLevel * GOLD_PER_MARKET + city.population * GOLD_PER_POP;
  return base * traitMult(city, 'commerce') * techMult(state, 'commerce', 0.1);
}

// 粮食产量（每回合，单城）
export function cityGrainIncome(state, city) {
  const base = city.farmLevel * GRAIN_PER_FARM;
  return base * traitMult(city, 'grain') * techMult(state, 'agri', 0.1);
}

// 势力每回合金钱总收入（含特性 / 科技）
export function factionGoldIncome(state, factionId) {
  let sum = 0;
  for (const c of state.cities) if (isOwnedBy(c, factionId)) sum += cityGoldIncome(state, c);
  return sum;
}

// 势力每回合粮食净变化（产量 - 士兵吃粮）
export function factionGrainNet(state, factionId) {
  let prod = 0;
  let upkeep = 0;
  for (const c of state.cities) {
    if (!isOwnedBy(c, factionId)) continue;
    prod += cityGrainIncome(state, c);
    upkeep += c.soldiers * GRAIN_UPKEEP_PER_SOLDIER;
  }
  return { prod, upkeep, net: prod - upkeep };
}

// 城防值（基础 × 城防特性 × 筑城科技 × 城墙等级加成）
export function cityDefenseValue(state, city) {
  const base = city.defenseBase || 0;
  const wallBoost = 1 + (city.wallLevel - 1) * 0.15;
  return base * traitMult(city, 'defense') * techMult(state, 'wall', 0.2) * wallBoost;
}

// 单城人口增长（依赖太守或君主政治）
export function cityPopGrowth(state, city, politics) {
  const pol = Number.isFinite(politics) ? politics : 50;
  const factor = (pol / POP_GROWTH_POL_DIVISOR) * POP_GROWTH_RATE;
  return city.population * factor * traitMult(city, 'growth');
}

// 征兵消耗：金钱 / 人口（受征兵特性影响——人口消耗降低）
export function recruitCost(city, count) {
  const popCost = count * (1 / (1 + (city.trait && city.trait.type === 'recruit' ? city.trait.value : 0)));
  return { gold: count * 1.5, pop: popCost };
}

export { TRAINING_BASE };
