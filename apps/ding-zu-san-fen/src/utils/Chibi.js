// Chibi —— 开罗风格 Q版小人程序化绘制
// 所有图形以容器原点 (0,0) 为角色竖直中心向上/向下构建；调用方负责整体定位/缩放。
// 复用于武将(General)与敌军(Enemy)，由调用方传入颜色、头饰、配件等 opts。

import { COLORS } from '../config.js';

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

// 颜色明暗：f<1 变暗，f>1 变亮（自动钳制到 0..255）
export function shade(hex, f) {
  const r = Math.min(255, Math.max(0, Math.round(((hex >> 16) & 255) * f)));
  const g = Math.min(255, Math.max(0, Math.round(((hex >> 8) & 255) * f)));
  const b = Math.min(255, Math.max(0, Math.round((hex & 255) * f)));
  return (r << 16) | (g << 8) | b;
}

// 绘制一尊 Q版小人到 Graphics 对象 g
// opts:
//   size      总高(px)
//   skin      肤色
//   body      衣甲主色
//   accent    衣领/腰带亮色
//   shoe      鞋/裤色
//   hat       头饰主色
//   hatStyle  'cap' | 'plume' | 'wizard' | 'band' | 'crown'
//   plume     缨/羽色(plume/crown/wizard 帽尖用)
//   weapon    'sword' | 'staff' | 'shield' | null
//   mood      'happy' | 'angry' | 'glow'
//   glow      发光眼/法球色
export function drawChibi(g, opts = {}) {
  const s = opts.size || 48;
  const ink = CHIBI.ink;
  const skin = opts.skin ?? CHIBI.skins.default;
  const body = opts.body ?? 0x3a6ea5;

  const headR = s * 0.27;
  const headY = -s * 0.23;
  const bodyW = s * 0.42;
  const bodyTop = headY + headR * 0.5;
  const bodyH = s * 0.30;

  // —— 腿 ——
  g.fillStyle(opts.shoe ?? ink, 1);
  g.fillRoundedRect(-s * 0.135, bodyTop + bodyH - s * 0.02, s * 0.11, s * 0.20, s * 0.04);
  g.fillRoundedRect(s * 0.025, bodyTop + bodyH - s * 0.02, s * 0.11, s * 0.20, s * 0.04);

  // —— 躯干 ——
  g.fillStyle(body, 1);
  g.fillRoundedRect(-bodyW / 2, bodyTop, bodyW, bodyH, bodyW * 0.42);
  if (opts.accent != null) {
    g.fillStyle(opts.accent, 1);
    g.fillRoundedRect(-bodyW / 2, bodyTop, bodyW, bodyH * 0.34, bodyW * 0.42);
  }

  // —— 手臂(短桩) ——
  g.fillStyle(body, 1);
  g.fillCircle(-bodyW / 2 + s * 0.012, bodyTop + bodyH * 0.5, s * 0.10);
  g.fillCircle(bodyW / 2 - s * 0.012, bodyTop + bodyH * 0.5, s * 0.10);
  g.fillStyle(skin, 1);
  g.fillCircle(-bodyW / 2 + s * 0.012, bodyTop + bodyH * 0.56, s * 0.062);
  g.fillCircle(bodyW / 2 - s * 0.012, bodyTop + bodyH * 0.56, s * 0.062);

  // —— 脖子 ——
  g.fillStyle(skin, 1);
  g.fillRect(-s * 0.07, headY + headR * 0.6, s * 0.14, s * 0.10);

  // —— 头(大) ——
  g.fillStyle(skin, 1);
  g.fillCircle(0, headY, headR);
  g.lineStyle(Math.max(1, s * 0.018), ink, 0.22);
  g.strokeCircle(0, headY, headR);

  drawHat(g, headY, headR, s, opts);
  drawAccessory(g, bodyTop, bodyH, bodyW, s, opts);
  drawFace(g, headY, headR, s, opts);
  drawBeard(g, headY, headR, s, opts);
}

// 胡须：结合三国人物特征（关羽长髯、黄忠白须、张飞虎须）。
// opts.beard: 颜色数字 | 'white' | true(默认黑)；opts.beardLong: 关羽式长髯
function drawBeard(g, headY, headR, s, opts) {
  const b = opts.beard;
  if (!b) return;
  const col = b === 'white' ? 0xeae6d8 : (typeof b === 'number' ? b : 0x241c14);
  const top = headY + headR * 0.5;
  const len = opts.beardLong ? headR * 1.5 : headR * 0.7;
  g.fillStyle(col, 0.95);
  // 主体：下颌处下垂的须丛
  g.fillEllipse(0, top + len * 0.4, headR * (opts.beardLong ? 1.15 : 0.95), len);
  // 尖端收拢（长髯更尖）
  g.fillTriangle(-headR * 0.28, top + len * 0.5, headR * 0.28, top + len * 0.5, 0, top + len * 0.9);
}

function drawHat(g, headY, headR, s, opts) {
  const style = opts.hatStyle || 'cap';
  const col = opts.hat ?? opts.body ?? 0x4a3c2a;
  const lw = Math.max(1, s * 0.016);

  if (style === 'wizard') {
    // 法师尖帽
    g.fillStyle(col, 1);
    g.beginPath();
    g.moveTo(-headR * 0.92, headY - headR * 0.15);
    g.lineTo(headR * 0.92, headY - headR * 0.15);
    g.lineTo(s * 0.10, headY - headR * 2.1);
    g.closePath();
    g.fillPath();
    g.lineStyle(lw, 0x000000, 0.18);
    g.strokePath();
    g.fillStyle(opts.plume ?? 0xffe08a, 1);
    g.fillCircle(s * 0.10, headY - headR * 2.1, s * 0.05);
    return;
  }

  if (style === 'band') {
    // 头巾(如黄巾)：一条横带 + 飘带
    g.fillStyle(col, 1);
    g.fillRoundedRect(-headR * 0.98, headY - headR * 0.42, headR * 1.96, headR * 0.5, headR * 0.2);
    g.fillTriangle(
      -headR * 0.95, headY - headR * 0.2,
      -headR * 1.5, headY - headR * 0.6,
      -headR * 1.2, headY + headR * 0.05,
    );
    return;
  }

  // cap / plume / crown：覆盖头顶的弧形兜鍪
  g.fillStyle(col, 1);
  g.beginPath();
  g.arc(0, headY, headR + s * 0.02, Math.PI * 1.04, Math.PI * 1.96, false);
  g.lineTo(0, headY - headR * 1.12);
  g.closePath();
  g.fillPath();
  g.lineStyle(lw, 0x000000, 0.18);
  g.strokePath();

  if (style === 'plume') {
    const pc = opts.plume ?? 0xf0c040;
    if (opts.doublePlume) {
      // 吕布式双翎：头盔左右两根直立长羽（雉鸡翎）
      g.fillStyle(pc, 1);
      g.fillEllipse(-s * 0.11, headY - headR * 1.16, s * 0.05, s * 0.27);
      g.fillEllipse(s * 0.11, headY - headR * 1.16, s * 0.05, s * 0.27);
      g.fillStyle(0xffffff, 0.5);
      g.fillEllipse(-s * 0.11, headY - headR * 1.24, s * 0.018, s * 0.16);
      g.fillEllipse(s * 0.11, headY - headR * 1.24, s * 0.018, s * 0.16);
    } else {
      // 长羽缨(远程)
      g.fillStyle(pc, 1);
      g.fillEllipse(s * 0.06, headY - headR * 1.22, s * 0.055, s * 0.22);
    }
  } else if (style === 'cap') {
    // 盔顶圆缨(近战/重甲)
    if (opts.plume != null) {
      g.fillStyle(opts.plume, 1);
      g.fillCircle(0, headY - headR * 1.0, s * 0.06);
    }
  } else if (style === 'crown') {
    // BOSS 金冠锯齿
    g.fillStyle(opts.plume ?? 0xf0c040, 1);
    const cy = headY - headR * 0.78;
    for (let i = -2; i <= 2; i++) {
      g.fillTriangle(
        i * headR * 0.34 - headR * 0.15, cy + headR * 0.16,
        i * headR * 0.34 + headR * 0.15, cy + headR * 0.16,
        i * headR * 0.34, cy - headR * 0.32,
      );
    }
  }
}

function drawAccessory(g, bodyTop, bodyH, bodyW, s, opts) {
  const hx = bodyW / 2 + s * 0.03; // 右手外侧
  const hy = bodyTop + bodyH * 0.5;

  if (opts.weapon === 'bow') {
    // 弓：竖持木弧 + 弓弦（远程射手）
    const r = s * 0.15;
    g.lineStyle(Math.max(1, s * 0.035), 0x6b4a2a, 1);
    g.beginPath();
    g.arc(hx, hy, r, -Math.PI / 2, Math.PI / 2, false);
    g.strokePath();
    g.lineStyle(Math.max(1, s * 0.02), 0xeae0cc, 0.85);
    g.lineBetween(hx, hy - r, hx, hy + r);
  } else if (opts.weapon === 'sword') {
    g.lineStyle(Math.max(1, s * 0.05), 0x6b4a2a, 1);
    g.lineBetween(hx, hy + s * 0.04, hx, hy - s * 0.28);
    g.fillStyle(0xe6edf2, 1);
    g.fillTriangle(hx - s * 0.05, hy - s * 0.24, hx + s * 0.05, hy - s * 0.24, hx, hy - s * 0.52);
    g.lineStyle(Math.max(1, s * 0.018), 0x9aa6ad, 0.9);
    g.strokeTriangle(hx - s * 0.05, hy - s * 0.24, hx + s * 0.05, hy - s * 0.24, hx, hy - s * 0.52);
  } else if (opts.weapon === 'staff') {
    g.lineStyle(Math.max(1, s * 0.045), 0x6b4a2a, 1);
    g.lineBetween(hx, hy + s * 0.05, hx, hy - s * 0.40);
    g.fillStyle(opts.glow ?? 0xb08bd6, 1);
    g.fillCircle(hx, hy - s * 0.46, s * 0.085);
    g.fillStyle(0xffffff, 0.75);
    g.fillCircle(hx - s * 0.025, hy - s * 0.48, s * 0.032);
  } else if (opts.weapon === 'shield') {
    const sx = 0;
    const sy = bodyTop + bodyH * 0.5;
    g.fillStyle(opts.accent ?? 0xc7ccd1, 1);
    g.fillEllipse(sx, sy, s * 0.34, s * 0.46);
    g.lineStyle(Math.max(1, s * 0.03), 0x000000, 0.25);
    g.strokeEllipse(sx, sy, s * 0.34, s * 0.46);
    g.fillStyle(opts.body ?? 0x6b7378, 1);
    g.fillCircle(sx, sy, s * 0.06);
  } else if (opts.weapon === 'fan') {
    // 羽扇纶巾（诸葛/貂蝉）：扇柄 + 半圆扇面 + 羽骨细纹
    const fx = hx;
    const fy = hy - s * 0.10;
    g.lineStyle(Math.max(1, s * 0.028), 0x6b4a2a, 1);
    g.lineBetween(fx, fy + s * 0.08, fx, fy);
    const fanCol = opts.fanColor ?? 0xeae0cc;
    g.fillStyle(fanCol, 1);
    g.beginPath();
    g.arc(fx, fy, s * 0.16, -Math.PI * 0.92, -Math.PI * 0.08, false);
    g.lineTo(fx, fy);
    g.closePath();
    g.fillPath();
    g.lineStyle(Math.max(1, s * 0.012), shade(fanCol, 0.65), 0.85);
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI * 0.92 + (Math.PI * 0.84) * (i / 4);
      g.lineBetween(fx, fy, fx + Math.cos(a) * s * 0.16, fy + Math.sin(a) * s * 0.16);
    }
  }
}

function drawFace(g, headY, headR, s, opts) {
  const mood = opts.mood || 'happy';
  const eyeY = headY + headR * 0.12;
  const eo = headR * 0.42;
  const er = headR * 0.2;
  const ink = CHIBI.ink;

  if (mood === 'glow') {
    g.fillStyle(opts.glow ?? 0xffe08a, 1);
    g.fillCircle(-eo, eyeY, er * 1.15);
    g.fillCircle(eo, eyeY, er * 1.15);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(-eo, eyeY - er * 0.25, er * 0.4);
    g.fillCircle(eo, eyeY - er * 0.25, er * 0.4);
  } else if (mood === 'angry') {
    g.fillStyle(ink, 1);
    g.fillCircle(-eo, eyeY + er * 0.1, er * 0.85);
    g.fillCircle(eo, eyeY + er * 0.1, er * 0.85);
    g.lineStyle(Math.max(1.4, s * 0.04), ink, 1);
    g.lineBetween(-eo - er, eyeY - er * 0.9, -eo + er * 0.6, eyeY - er * 0.3);
    g.lineBetween(eo + er, eyeY - er * 0.9, eo - er * 0.6, eyeY - er * 0.3);
  } else {
    g.fillStyle(ink, 1);
    g.fillCircle(-eo, eyeY, er);
    g.fillCircle(eo, eyeY, er);
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(-eo + er * 0.35, eyeY - er * 0.35, er * 0.42);
    g.fillCircle(eo + er * 0.35, eyeY - er * 0.35, er * 0.42);
  }

  // 腮红
  g.fillStyle(0xf08a78, 0.4);
  g.fillCircle(-eo - er * 0.4, eyeY + er * 1.8, er * 0.8);
  g.fillCircle(eo + er * 0.4, eyeY + er * 1.8, er * 0.8);

  // 嘴
  g.lineStyle(Math.max(1, s * 0.022), 0x8a3a2a, 0.85);
  g.beginPath();
  g.arc(0, eyeY + er * 2.3, er * 1.0, 0.12 * Math.PI, 0.88 * Math.PI, false);
  g.strokePath();
}

// ---------- 武将 / 敌军 风格预设 ----------

// 每个武将的专属外观：覆盖阵营/职业默认配色，让 14 位武将一眼可辨
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
