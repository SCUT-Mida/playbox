// ============================================================================
// 经济结算：每座城市的金钱 / 粮食收入、军粮消耗、人口增长。
// 资源池（金钱 / 军粮）为势力级共享；人口 / 士兵 / 城防 / 建筑为城市级。
// ============================================================================
import {
  GOLD_PER_MARKET, GOLD_PER_POP, GRAIN_PER_FARM, GRAIN_UPKEEP_PER_SOLDIER,
  POP_GROWTH_RATE, POP_GROWTH_POL_DIVISOR, TRAINING_BASE,
  RECRUIT_GOLD_PER_SOLDIER, RECRUIT_POP_PER_SOLDIER,
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

// 取本城某职官武将（须在城、非俘虏），用于结算职官加成。
// 此处不 import state.js（避免与 state↔economy 循环依赖），就地查表。
function officeHero(state, city, field) {
  const id = city && city[field];
  if (!id || !state || !state.heroes) return null;
  const h = state.heroes.find((x) => x.id === id);
  if (!h || h.status === 'prisoner' || h.cityId !== city.id) return null;
  return h;
}

// 太守政治对经济收益的加成：政治 50 为基准，每点约 +0.25%，满 100 约 +12.5%。
export function governorEconMult(state, city) {
  const gov = officeHero(state, city, 'governorHeroId');
  if (!gov) return 1;
  return 1 + Math.max(0, (gov.stats.p || 50) - 50) / 400;
}
// 将军统率对城防的加成：统率 50 为基准，满 100 约 +12.5%。
export function generalDefMult(state, city) {
  const gen = officeHero(state, city, 'generalHeroId');
  if (!gen) return 1;
  return 1 + Math.max(0, (gen.stats.l || 50) - 50) / 400;
}

// 商业收入（每回合，单城）
export function cityGoldIncome(state, city) {
  const base = city.marketLevel * GOLD_PER_MARKET + city.population * GOLD_PER_POP;
  return base * traitMult(city, 'commerce') * techMult(state, city.ownerFactionId, 'commerce', 0.1) * governorEconMult(state, city);
}

// 粮食产量（每回合，单城）
export function cityGrainIncome(state, city) {
  const base = city.farmLevel * GRAIN_PER_FARM;
  return base * traitMult(city, 'grain') * techMult(state, city.ownerFactionId, 'agri', 0.1) * governorEconMult(state, city);
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

// 城防值（基础 × 城防特性 × 筑城科技 × 城墙等级加成 × 将军统率加成）
export function cityDefenseValue(state, city) {
  const base = city.defenseBase || 0;
  const wallBoost = 1 + (city.wallLevel - 1) * 0.15;
  return base * traitMult(city, 'defense') * techMult(state, city.ownerFactionId, 'wall', 0.2) * wallBoost * generalDefMult(state, city);
}

// 单城人口增长（依赖太守或君主政治）
export function cityPopGrowth(state, city, politics) {
  const pol = Number.isFinite(politics) ? politics : 50;
  const factor = (pol / POP_GROWTH_POL_DIVISOR) * POP_GROWTH_RATE;
  return city.population * factor * traitMult(city, 'growth');
}

// 征兵消耗：金钱 / 人口（受征兵特性影响——人口消耗降低）
export function recruitCost(city, count) {
  const traitBonus = city.trait && city.trait.type === 'recruit' ? city.trait.value : 0;
  const popCost = (count * RECRUIT_POP_PER_SOLDIER) / (1 + traitBonus);
  return { gold: count * RECRUIT_GOLD_PER_SOLDIER, pop: popCost };
}

export { TRAINING_BASE };
