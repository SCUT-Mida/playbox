// Chibi —— 开罗风格 Q版小人（三国皮肤层）
// 底层绘制已迁移到共享素材库 apps/_lib/kairo.js（像素网格 + 双后端），
// 本文件只保留三国语境：武将/敌军的外观预设表与 opts 组装。
// 对外 API（drawChibi / optsForGeneral / optsForEnemy / CHIBI / shade）不变，
// General / Enemy 与各场景的调用代码无需改动。

import { COLORS } from '../config.js';
import { drawKairo, kairoSpec, shade } from '../../../_lib/kairo.js';

export { shade };

export const CHIBI = {
  // 按阵营微调的暖肤色
  skins: {
    蜀: 0xf3c8a0,
    魏: 0xf5d3b6,
    吴: 0xefc39e,
    群: 0xe9b494,
    default: 0xf1c6a0,
  },
  ink: 0x2c2418,
};

// 旧 opts（十六进制数字）→ kairo spec（'#rrggbb' 字符串 + 共享库字段名）
export function chibiSpec(opts = {}) {
  const css = (v) => (typeof v === 'number' ? '#' + v.toString(16).padStart(6, '0') : v);
  return kairoSpec({
    plan: 'chibi',
    skin: css(opts.skin ?? CHIBI.skins.default),
    hair: css(opts.hair),
    body: css(opts.body ?? 0x3a6ea5),
    body2: css(opts.body2),
    accent: css(opts.accent),
    shoe: css(opts.shoe ?? 0x3a3028),
    hat: opts.hatStyle || 'none',
    hatColor: css(opts.hat ?? opts.body),
    plume: css(opts.plume),
    doublePlume: !!opts.doublePlume,
    weapon: opts.weapon || 'none',
    mood: opts.mood || 'happy',
    glow: css(opts.glow),
    fanColor: css(opts.fanColor),
    beard: opts.beard === 'white' ? '#eae6d8' : css(opts.beard),
    beardLong: !!opts.beardLong,
  });
}

// 绘制一尊 Q版小人到 Phaser Graphics 对象 g（垂直映射与旧版对齐：脚底 ≈ +0.385×size）
export function drawChibi(g, opts = {}) {
  const size = opts.size || 48;
  drawKairo(g, chibiSpec(opts), size);
}

// ---------- 武将 / 敌军 风格预设 ----------

// 每个武将的专属外观：覆盖阵营/职业默认配色，让 16 位武将一眼可辨
// （关羽红脸长髯、张飞黑甲、赵云银甲、吕布双翎……）
// 仅做外观覆盖，不触碰 generals.js 的纯数值数据。
const APPEARANCE = {
  // —— 蜀 ——
  // 关羽：红脸长髯（美髯公）—— 标志性特征
  guanyu: { skin: 0xcf6a48, body: 0x2f7d4a, accent: 0xf0c040, hatStyle: 'plume', hat: 0x246a3c, plume: 0x2f7d4a, weapon: 'sword', mood: 'angry', beard: 0x241c14, beardLong: true },
  // 张飞：豹头环眼、虎须——黑甲、浓须
  zhangfei: { skin: 0xa97852, body: 0x3a3340, accent: 0x8a8a96, hatStyle: 'cap', hat: 0x2a2a30, plume: 0x2a2a30, weapon: 'sword', mood: 'angry', beard: 0x241c14 },
  zhaoyun: { skin: 0xf0d2b4, body: 0xb9c4cf, accent: 0xc0392b, hatStyle: 'cap', hat: 0xaebcca, plume: 0xf0f0f0, weapon: 'sword', mood: 'happy' },
  machao: { skin: 0xeec6a4, body: 0xa6b8c8, accent: 0x3f6f9a, hatStyle: 'plume', hat: 0x8aa0b4, plume: 0x4a7fa0, weapon: 'sword', mood: 'happy' },
  // 黄忠：老将——白须
  huangzhong: { skin: 0xd8a878, body: 0x9a7430, accent: 0xf0c040, hatStyle: 'plume', hat: 0x7a5a24, plume: 0xf0c040, weapon: 'bow', mood: 'happy', beard: 'white' },
  // 诸葛亮：羽扇纶巾——持羽扇
  zhuge: { skin: 0xeec8a4, body: 0x566070, accent: 0xb0b8c0, hatStyle: 'wizard', hat: 0x42424d, glow: 0x9ec4e6, weapon: 'fan', fanColor: 0xdfe7ee, mood: 'glow' },
  pangtong: { skin: 0xd8a878, body: 0x7a4636, accent: 0xd08a3a, hatStyle: 'wizard', hat: 0x5a3a2a, glow: 0xff9a3a, weapon: 'staff', mood: 'glow' },
  // —— 魏 ——
  caocao: { skin: 0xe8c0a0, body: 0x33415c, accent: 0xf0c040, hatStyle: 'plume', hat: 0x28344a, plume: 0xf0c040, mood: 'angry', beard: 0x2a2620 },
  sima: { skin: 0xd8b0a0, body: 0x473a5a, accent: 0x8a6aa0, hatStyle: 'wizard', hat: 0x362a45, glow: 0xa06fd0, weapon: 'staff', mood: 'glow' },
  // 张辽：魏之良将，持弓急射
  zhangliao: { skin: 0xe2b48a, body: 0x3a4a6a, accent: 0xf0c040, hatStyle: 'plume', hat: 0x28344a, plume: 0xf0c040, weapon: 'bow', mood: 'angry', beard: 0x2a2620 },
  xiahou: { skin: 0xc89878, body: 0x3a4a6a, accent: 0xb0b8c0, hatStyle: 'cap', hat: 0x2a3850, plume: 0x8a3a2a, weapon: 'sword', mood: 'angry', beard: 0x2a2620 },
  // —— 吴 ——
  zhouyu: { skin: 0xeec6a4, body: 0xb04030, accent: 0xf0c040, hatStyle: 'wizard', hat: 0x7a2a20, glow: 0xff7a3a, weapon: 'staff', mood: 'glow' },
  // 陆逊：儒将火计，持法杖
  luxun: { skin: 0xeec8a4, body: 0x9a3a2a, accent: 0xf0c040, hatStyle: 'wizard', hat: 0x6a2a20, glow: 0xff8a3a, weapon: 'staff', mood: 'glow' },
  sunce: { skin: 0xe0b080, body: 0xcc4f36, accent: 0xf0c040, hatStyle: 'cap', hat: 0x8a2f20, plume: 0xf0c040, weapon: 'sword', mood: 'angry' },
  // —— 群雄 ——
  // 吕布：头戴双翎（雉鸡翎）——三国第一猛将标志
  lvbu: { skin: 0xb07a52, body: 0x8a6a3a, accent: 0xd0a040, hatStyle: 'plume', hat: 0x6a4f2a, plume: 0xf0e8d0, doublePlume: true, weapon: 'sword', mood: 'angry' },
  // 貂蝉：持羽扇、粉衣
  diaochan: { skin: 0xf2d2c0, body: 0xc46a8a, accent: 0xf0d0e0, hatStyle: 'wizard', hat: 0xa04a66, glow: 0xff9ec4, weapon: 'fan', fanColor: 0xf6d8e2, mood: 'happy' },
};

export function optsForGeneral(def) {
  const fac = COLORS.faction[def.faction] || 0x6b5a40;
  const base = {
    skin: CHIBI.skins[def.faction] || CHIBI.skins.default,
    body: fac,
    accent: 0xf0c040,
    shoe: shade(fac, 0.6),
    hat: shade(fac, 0.7),
    plume: 0xf0c040,
  };
  if (def.cls === 'MELEE') {
    base.hatStyle = 'cap';
    base.weapon = 'sword';
  } else if (def.cls === 'RANGE') {
    base.hatStyle = 'plume';
  } else {
    base.hatStyle = 'wizard';
    base.weapon = 'staff';
    base.glow = def.faction === '蜀' ? 0xb08bd6 : shade(fac, 1.25);
  }
  const style = APPEARANCE[def.id];
  return style ? { ...base, ...style } : base;
}

export function optsForEnemy(def) {
  const c = def.color;
  const o = {
    body: c,
    accent: shade(c, 1.3),
    shoe: CHIBI.ink,
    hat: shade(c, 0.7),
    skin: 0xeab69a,
  };
  if (def.boss) {
    o.hatStyle = 'crown';
    o.mood = 'angry';
    o.plume = 0xf0c040;
    o.skin = 0xd8a87a;
  } else if (def.armor === 'HEAVY') {
    o.hatStyle = 'cap';
    o.weapon = 'shield';
    o.mood = 'angry';
    o.plume = shade(c, 1.2);
    o.body = shade(c, 0.95);
  } else if (def.armor === 'MAGIC') {
    o.hatStyle = 'wizard';
    o.mood = 'glow';
    o.glow = 0xffd24a;
    o.plume = 0xffd24a;
  } else if (def.armor === 'PHYSICAL') {
    o.hatStyle = 'cap';
    o.plume = shade(c, 1.2);
    o.mood = 'angry';
  } else {
    o.hatStyle = 'band';
    o.mood = 'happy';
  }
  return o;
}
