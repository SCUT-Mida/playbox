// ============================================================================
// 坊市·商城（issue #100）：给灵石一个消费出口。
// 主线 / 秘境 / 洞府产出的灵石可在此兑换修炼物资与灵气。
// 纯逻辑：商品表 + 购买校验 + 结算，货币统一为灵石（lingshi）。
// ============================================================================
import { STAMINA_MAX } from '../config.js';
import { countRes, spendRes, addRes } from './player.js';
import { staminaValue } from './stamina.js';

// 商品定义：
//   kind 'res'     → 兑换资源包（give: {资源id: 数量}）
//   kind 'stamina' → 灵气恢复（give: 点数，已满时不可购买）
//   price → 单价（灵石）；tag → 坊市分类标签；desc → 一句话说明。
export const SHOP_GOODS = [
  {
    id: 'wendao', kind: 'res', give: { wendao: 1 }, price: 300, tag: '问道',
    desc: '问道抽卡凭证，一令一抽。',
  },
  {
    id: 'exp_s', kind: 'res', give: { exp_s: 5 }, price: 240, tag: '修炼',
    desc: '修为丹·小 ×5，共 250 经验。',
  },
  {
    id: 'exp_m', kind: 'res', give: { exp_m: 3 }, price: 500, tag: '修炼',
    desc: '修为丹·中 ×3，共 600 经验。',
  },
  {
    id: 'exp_l', kind: 'res', give: { exp_l: 1 }, price: 800, tag: '修炼',
    desc: '修为丹·大 ×1，共 1000 经验。',
  },
  {
    id: 'break_pack', kind: 'res',
    give: { break_metal: 1, break_wood: 1, break_water: 1, break_fire: 1, break_earth: 1 },
    price: 500, tag: '修炼',
    desc: '五行突破石各一，突破瓶颈必备。',
  },
  {
    id: 'gongfa', kind: 'res', give: { gongfa: 2 }, price: 400, tag: '修炼',
    desc: '功法残页 ×2，参悟技能所需。',
  },
  {
    id: 'tiandao_f', kind: 'res', give: { tiandao_f: 1 }, price: 600, tag: '升星',
    desc: '天道本源·碎片 ×1，道果升星所需。',
  },
  {
    id: 'gift', kind: 'res', give: { gift: 2 }, price: 260, tag: '知音',
    desc: '灵犀佩 ×2，赠礼提升好感度。',
  },
  {
    id: 'sweep_ticket', kind: 'res', give: { sweep_ticket: 5 }, price: 350, tag: '云游',
    desc: '神行符 ×5，一键扫荡所需。',
  },
  {
    id: 'stamina', kind: 'stamina', give: 60, price: 150, tag: '云游',
    desc: '聚灵露，即刻恢复 60 点灵气（上限 120）。',
  },
];

export function goodsById(id) { return SHOP_GOODS.find((g) => g.id === id) || null; }

// 是否可购买：灵石足够；灵气类商品还需未达上限（买满无意义）。
export function canBuy(player, goods, qty = 1) {
  if (!goods || !Number.isFinite(qty) || qty < 1) return false;
  if (goods.kind === 'stamina' && staminaValue(player) >= STAMINA_MAX) return false;
  return countRes(player, 'lingshi') >= goods.price * qty;
}

// 不可购买原因（用于 UI 禁用提示 / toast）。
export function buyReason(player, goods, qty = 1) {
  if (!goods) return '无此商品';
  if (goods.kind === 'stamina' && staminaValue(player) >= STAMINA_MAX) return '灵气已满，无需购买';
  if (countRes(player, 'lingshi') < goods.price * qty) return '灵石不足';
  return '';
}

// 结算购买：扣灵石 → 发放资源 / 恢复灵气。返回 { ok, text | reason }。
export function buyGoods(player, goods, qty = 1) {
  if (!goods) return { ok: false, reason: '无此商品' };
  if (!canBuy(player, goods, qty)) return { ok: false, reason: buyReason(player, goods, qty) || '不可购买' };
  spendRes(player, { lingshi: goods.price * qty });
  let text;
  if (goods.kind === 'stamina') {
    // 先结算离线恢复再叠加，确保不越过 STAMINA_MAX。
    const cur = staminaValue(player);
    player.stamina.value = Math.min(STAMINA_MAX, cur + goods.give);
    text = `灵气 ${cur} → ${player.stamina.value}`;
  } else {
    for (const [id, n] of Object.entries(goods.give)) addRes(player, id, n * qty);
    text = goods.desc;
  }
  return { ok: true, text: `购得：${text}` };
}
