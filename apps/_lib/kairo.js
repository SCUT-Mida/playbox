// ============================================================================
// Kairo —— 开罗风（Kairosoft 风）像素 Q 版角色共享素材库
//
// 定位（预置 · 开罗风 · 可复用）：
//   1. 预置：角色 = 一份纯数据的「形象描述 spec」，由像素网格程序化绘制，
//      零外部图片文件；预置形象表 PRESETS 内置于库，各展品引用 + 覆盖配色。
//   2. 开罗风：大头小身、扁平色块、深色块状描边、点点眼 / 腮红 / 小嘴。
//   3. 复用：同一份 spec 双后端输出——
//        kairoSVG(spec, size)  → 内联 SVG 字符串（DOM 系展品 innerHTML 注入）
//        drawKairo(g, spec, size) → Phaser Graphics 绘制（鼎足三分）
//      展品（鼎足三分 / 凡人修仙录 / 星骸旅者 / 模拟人生）共用这一套素材。
//
// 像素网格：24 宽 × 28 高，角色底边对齐第 27 行（站同一条地平线），
// 左右关于中轴线 cx=12 对称（mrect 镜像绘制），武器等单侧元素除外。
// ============================================================================

export const KAIRO = {
  W: 24,
  H: 28,
  ink: '#2e241c', // 描边墨色（暖黑，比纯黑柔和）
  skins: {
    light: '#f5cfa6',
    warm: '#eec39e',
    tan: '#d8a878',
    red: '#cf7a55', // 关羽式红脸
    pale: '#e6e0d2', // 骷髅 / 幽灵底
  },
};

// 颜色明暗：f<1 变暗，f>1 变亮。接受 '#rrggbb' 字符串或 0x 数字，返回同入参类型。
export function shade(color, f) {
  const isNum = typeof color === 'number';
  const hex = isNum ? color : parseInt(String(color).replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, Math.round(((hex >> 16) & 255) * f)));
  const g = Math.min(255, Math.max(0, Math.round(((hex >> 8) & 255) * f)));
  const b = Math.min(255, Math.max(0, Math.round((hex & 255) * f)));
  const out = (r << 16) | (g << 8) | b;
  return isNum ? out : '#' + out.toString(16).padStart(6, '0');
}

const asCss = (c) => (typeof c === 'number' ? '#' + c.toString(16).padStart(6, '0') : c);

// ----------------------------------------------------------------------------
// 像素画家：收集 (x, y, w, h, color, opacity) 色块，供两个后端消费。
// ----------------------------------------------------------------------------
class Painter {
  constructor() {
    this.rects = [];
    this.W = KAIRO.W;
  }

  rect(x, y, w, h, c, o) {
    if (!c || w <= 0 || h <= 0) return;
    this.rects.push({ x, y, w, h, c: asCss(c), o: o == null ? 1 : o });
  }

  // 镜像绘制：在 x 与中轴对称位置各画一份（居中矩形自动去重）。
  mrect(x, y, w, h, c, o) {
    this.rect(x, y, w, h, c, o);
    const mx = this.W - x - w;
    if (mx !== x) this.rect(mx, y, w, h, c, o);
  }

  // 像素圆角矩形：顶/底两行渐进收角（r=2 时 2-1-0-1-2）。
  rrect(x, y, w, h, r, c, o) {
    r = Math.max(0, Math.min(r, Math.floor((Math.min(w, h) - 1) / 2)));
    this.rect(x + r, y, w - 2 * r, 1, c, o);
    if (r > 1) this.rect(x + 1, y + 1, w - 2, 1, c, o);
    if (h - 2 > 2) this.rect(x, y + 2, w, h - 4, c, o);
    if (r > 1) this.rect(x + 1, y + h - 2, w - 2, 1, c, o);
    this.rect(x + r, y + h - 1, w - 2 * r, 1, c, o);
  }

  // 带描边块：先画放大 1px 的墨色底，再画本体色块。
  orect(x, y, w, h, r, c, ink, o) {
    this.rrect(x - 1, y - 1, w + 2, h + 2, r + 1, ink || KAIRO.ink);
    this.rrect(x, y, w, h, r, c, o);
  }

  px(x, y, c, o) {
    this.rect(x, y, 1, 1, c, o);
  }
}

// ----------------------------------------------------------------------------
// spec 规范化 + 预设
// ----------------------------------------------------------------------------
const DEFAULT_SPEC = {
  plan: 'chibi', // 'chibi' 人形 | 'beast' 兽形
  build: 'adult', // 'adult' | 'child' | 'baby'（elder 由配色表达）
  name: '角色',
  // —— 配色 ——
  skin: KAIRO.skins.light,
  hair: '#4a3728',
  body: '#5b84c4',
  body2: null, // 裙摆 / 裤色（可空）
  accent: '#f0c040', // 衣领 / 腰带亮色
  shoe: '#3a3028',
  ink: KAIRO.ink,
  // —— 头部 ——
  hairStyle: 'flat', // 'flat' | 'side' | 'long' | 'bun' | 'spiky' | 'ponytail' | 'curl' | 'bald'
  hat: 'none', // 'none'|'cap'|'helm'|'plume'|'wizard'|'band'|'crown'|'halo'|'astro'|'hood'|'flower'|'antenna'
  hatColor: null,
  plume: null,
  doublePlume: false,
  ears: 'none', // 'none' | 'fox' | 'elf'（头顶兽耳/尖耳）
  mask: 'none', // 'none' | 'visor' | 'skull' | 'ghost' | 'cyclops'
  horns: 0, // 头角数量（人形恶魔 / 兽形通用）
  // —— 表情 ——
  mood: 'happy', // 'happy' | 'angry' | 'glow' | 'sleepy' | 'smug'
  glow: null, // 发光眼 / 法球色
  blush: true,
  // —— 躯干与持物 ——
  weapon: 'none', // 'none'|'sword'|'staff'|'bow'|'shield'|'fan'|'spear'|'scythe'|'axe'
  fanColor: null,
  beard: null, // 颜色 | 'white' | true(黑)
  beardLong: false,
  backpack: false,
  packColor: null,
  tail: 'none', // 'none' | 'fox' | 'slither'
  // —— 兽形专属 ——
  beastEars: 'none', // 'none'|'rat'|'fox'|'rabbit'|'round'|'antenna'
  wings: false,
  shell: null, // 甲壳色（可空）
  shellRim: null,
  spines: false, // 背脊刺
  fangs: false,
  eyes3: false, // 第三只眼
  bigEyes: false, // 圆睁大眼（蛙类）
  spider: false, // 八足蛛形（横肢替代立腿）
  star: false, // 星形头（星骸之核）
  claws: false, // 侧螯（蟹）
};

// 通用预置形象：各展品以此为基底，仅覆盖配色 / 少量特征位。
// 覆盖方式：kairoSpec({ preset: 'mage', body: '#7a2a20', ... })
export const PRESETS = {
  // —— 百姓 / 人生阶段 ——
  villager: {},
  man: { hairStyle: 'side', body: '#4f7dc9' },
  woman: { hairStyle: 'long', hair: '#463226', body: '#c96f9a' },
  boy: { build: 'child', hairStyle: 'spiky', hair: '#3c3430', body: '#4fa3d9' },
  girl: { build: 'child', hairStyle: 'long', hair: '#4a3020', body: '#e58bb0' },
  babyBoy: { build: 'baby', hairStyle: 'curl', body: '#8fd0e8', shoe: '#e8f0f4' },
  babyGirl: { build: 'baby', hairStyle: 'curl', hair: '#4a3020', body: '#f2b8c6', shoe: '#f8e8ec' },
  elderMan: { hair: '#d8d4cc', hairStyle: 'side', beard: 'white', body: '#7a8a94' },
  elderWoman: { hair: '#e2ded6', hairStyle: 'bun', body: '#9a8ab0' },
  // —— 职业 ——
  swordsman: { hat: 'cap', weapon: 'sword', mood: 'angry' },
  mage: { hat: 'wizard', weapon: 'staff', mood: 'glow', glow: '#b89cf0', body: '#5a4a8a' },
  archer: { hat: 'plume', weapon: 'bow', body: '#3f7a52' },
  knight: { hat: 'helm', weapon: 'shield', mood: 'angry', body: '#9aa8b6' },
  guard: { hat: 'cap', weapon: 'spear', mood: 'smug', body: '#5a6f9a' },
  king: { hat: 'crown', beard: true, body: '#8a4a9a' },
  merchant: { hat: 'band', backpack: true, body: '#c9a24f' },
  sage: { hat: 'wizard', beard: 'white', beardLong: true, mood: 'glow', glow: '#ffe08a', body: '#5a6a8a' },
  swordsmanElder: { hat: 'plume', weapon: 'bow', beard: 'white', mood: 'happy' },
  // —— 星骸系 ——
  astronaut: { hat: 'astro', hatColor: '#e8ecf2', body: '#dfe7ee', backpack: true, packColor: '#c8d4e0', mood: 'happy' },
  robot: { hat: 'antenna', skin: '#b6c2ce', mask: 'visor', body: '#8a98a8', body2: '#6a7888', mood: 'glow', glow: '#7ae0ff', blush: false, shoe: '#4a545e' },
  ghosty: { mask: 'ghost', skin: KAIRO.skins.pale, body: '#cfe2ea', body2: '#bcd8e4', mood: 'sleepy', blush: true, hair: 'none' },
  reaper: { mask: 'skull', skin: KAIRO.skins.pale, hat: 'hood', hatColor: '#3a3448', weapon: 'scythe', body: '#3a3448' },
  watcher: { mask: 'cyclops', hat: 'hood', hatColor: '#4a3a6a', body: '#5a4a8a', mood: 'glow', glow: '#c060d0' },
  // —— 仙侠 / 妖系 ——
  foxSpirit: { ears: 'fox', tail: 'fox', hairStyle: 'long', hair: '#d8e0e8', body: '#c46a8a', mood: 'smug' },
  demon: { horns: 2, mood: 'angry', fangs: true, body: '#8a3a4a', skin: '#e0b090' },
  crane: { hat: 'flower', hairStyle: 'bun', hair: '#3c4a5c', body: '#8ab4d0', mood: 'happy' },
  ninja: { hat: 'hood', hatColor: '#2c2c34', body: '#2c2c34', mood: 'smug' },
  // —— 兽形 ——
  beast: { plan: 'beast', body: '#9a8a76' },
  ratBeast: { plan: 'beast', beastEars: 'rat', tail: 'slither', body: '#9a8a76', mood: 'smug' },
  serpent: { plan: 'beast', tail: 'slither', body: '#5a9a4a', fangs: true, mood: 'angry' },
  wolfBeast: { plan: 'beast', beastEars: 'round', body: '#7a7a84', fangs: true, mood: 'angry' },
  drake: { plan: 'beast', horns: 2, wings: true, beastEars: 'none', body: '#3a6a9a', fangs: true, mood: 'angry' },
  toad: { plan: 'beast', bigEyes: true, body: '#6aa860', mood: 'sleepy' },
  turtleBeast: { plan: 'beast', shell: '#5a7a4a', shellRim: '#8a9a6a', body: '#8aa890', beastEars: 'none', mood: 'happy' },
  batBeast: { plan: 'beast', wings: true, beastEars: 'round', body: '#5a4a6a', fangs: true, mood: 'angry' },
  tigerBeast: { plan: 'beast', beastEars: 'round', eyes3: true, body: '#d89a4a', fangs: true, mood: 'angry' },
  spiderBeast: { plan: 'beast', spider: true, beastEars: 'none', body: '#6a5a7a', fangs: true, mood: 'smug' },
  crabBeast: { plan: 'beast', claws: true, shell: '#d06a4a', shellRim: '#f0a070', body: '#d06a4a', beastEars: 'antenna', mood: 'angry' },
  bugBeast: { plan: 'beast', beastEars: 'antenna', spines: true, body: '#8a9a5a', mood: 'happy' },
  starBeast: { plan: 'beast', star: true, body: '#f0c050', mood: 'glow', glow: '#fff0b0', beastEars: 'none' },
};

// 归一化一份形象描述：preset 打底，显式字段覆盖（undefined 视同未指定）。
export function kairoSpec(over = {}) {
  const strip = (o) => {
    const out = {};
    for (const [k, v] of Object.entries(o)) if (v !== undefined) out[k] = v;
    return out;
  };
  const base = over.preset ? strip(PRESETS[over.preset] || {}) : {};
  const s = { ...DEFAULT_SPEC, ...base, ...strip(over) };
  if (s.build === 'elder') {
    if (!over.hair && !base.hair) s.hair = '#d8d4cc';
    if (!over.beard && !base.beard && s.plan === 'chibi') s.beard = 'white';
  }
  if (s.beard === true) s.beard = '#2e241c';
  if (s.hair === 'none') s.hairStyle = 'bald';
  if (s.hatColor == null) s.hatColor = s.body;
  if (s.plan === 'beast') s.skin = s.body; // 兽形头身同毛色
  return s;
}

// ----------------------------------------------------------------------------
// 人形（chibi）绘制。几何随体型缩放：底边一律落在第 27 行。
// ----------------------------------------------------------------------------
const CHIBI_GEOM = {
  adult: { headY: 3, headH: 13, headHalf: 8, bodyY: 16, bodyH: 8, bodyHalf: 4, legY: 24, legH: 4, armY: 17, armH: 5 },
  child: { headY: 5, headH: 12, headHalf: 7, bodyY: 17, bodyH: 6, bodyHalf: 3, legY: 24, legH: 4, armY: 18, armH: 4 },
  baby: { headY: 8, headH: 11, headHalf: 6, bodyY: 19, bodyH: 5, bodyHalf: 3, legY: 25, legH: 3, armY: 20, armH: 3 },
};

function paintChibi(p, s) {
  const G = CHIBI_GEOM[s.build] || CHIBI_GEOM.adult;
  const cx = p.W / 2;
  const hx = cx - G.headHalf; // 头左缘
  const hw = G.headHalf * 2;
  const bx = cx - G.bodyHalf; // 躯干左缘
  const bw = G.bodyHalf * 2;
  const ghost = s.mask === 'ghost';

  // —— 尾巴（躯干后）——
  if (s.tail === 'fox') drawFoxTail(p, bx, G.bodyY, s);
  if (ghost) {
    // 幽灵：无腿无臂，袍身波浪收边
    p.orect(bx - 1, G.bodyY, bw + 2, 8, 2, s.body, s.ink, 0.92);
    const wy = G.bodyY + 8;
    for (let i = 0; i < 4; i++) {
      const inset = i % 2 === 0 ? 1 : 2;
      p.rect(bx + inset - 1, wy + i, bw + 2 - inset * 2, 1, s.body, 0.92);
    }
  } else {
    // —— 腿 ——
    const legW = s.build === 'baby' ? 2 : 3;
    p.orect(bx + 1, G.legY, legW, G.legH, 1, s.shoe, s.ink);
    p.orect(bx + bw - legW - 1, G.legY, legW, G.legH, 1, s.shoe, s.ink);
  }

  // —— 背包（躯干后）——
  if (s.backpack) {
    p.orect(bx + 1, G.bodyY + 1, bw - 2, G.bodyH - 1, 1, s.packColor || shade(s.body, 0.7), s.ink);
  }

  // —— 躯干 ——
  p.orect(bx, G.bodyY, bw, G.bodyH, 2, s.body, s.ink);
  if (s.body2) p.rect(bx, G.bodyY + G.bodyH - 2, bw, 2, s.body2);
  p.rect(cx - 2, G.bodyY, 4, 1, s.accent); // 衣领
  p.rect(bx, G.bodyY + G.bodyH - 3, bw, 1, shade(s.body, 0.8)); // 底摆阴影

  // —— 手臂 + 手 ——
  if (!ghost) {
    p.orect(bx - 2, G.armY, 2, G.armH, 1, s.body, s.ink);
    p.orect(bx + bw, G.armY, 2, G.armH, 1, s.body, s.ink);
    p.mrect(bx - 2, G.armY + G.armH - 1, 2, 2, s.skin);
  }

  // —— 脖子 ——
  p.rect(cx - 1, G.bodyY - 1, 2, 1, shade(s.skin, 0.9));

  // —— 兽耳（头后）——
  if (s.ears === 'fox' || s.ears === 'elf') drawEars(p, hx, G.headY, hw, s);

  // —— 头 ——
  if (s.star) {
    drawStarHead(p, cx, G, s);
  } else {
    p.orect(hx, G.headY, hw, G.headH, 3, s.skin, s.ink);
    // 脸颊阴影行（下颌）
    p.rect(hx + 2, G.headY + G.headH - 2, hw - 4, 1, shade(s.skin, 0.93));
  }

  // —— 头发 / 帽子 / 面容 ——
  if (s.hat === 'astro' || s.mask === 'visor') drawAstroHead(p, hx, G, s);
  else {
    drawHair(p, hx, G, s);
    drawHat(p, hx, G, s);
    drawFace(p, hx, G, s);
    drawBeard(p, hx, G, s);
  }
  // 头角（恶魔）画在最上层，扎进头发
  if (s.horns > 0 && s.plan === 'chibi') drawHorns(p, hx, G.headY, hw, s);

  // —— 武器（右手侧）——
  if (s.weapon && s.weapon !== 'none' && s.weapon !== 'shield') {
    drawWeapon(p, bx + bw + 1, G.bodyY, s);
  } else if (s.weapon === 'shield') {
    p.orect(cx - 2, G.bodyY + 1, 4, 5, 1, s.accent || '#c7ccd1', s.ink);
    p.px(cx, G.bodyY + 3, s.body);
  }
}

// —— 兽形（beast）：大头 + 圆身 + 四短腿，特征位拼装出各族妖兽 ——
function paintBeast(p, s) {
  const cx = p.W / 2;
  const hy = 3;
  const hh = 12;
  const hx = 4;
  const hw = 16;
  const by = 14;
  const bh = 9;
  const bx = 6;
  const bw = 12;

  // 尾（身后）
  if (s.tail === 'slither') {
    p.rect(bx + 2, 23, bw - 4, 3, shade(s.body, 0.92));
    p.rect(bx - 2, 24, 5, 2, shade(s.body, 0.92));
    p.rect(bx - 4, 23, 3, 2, shade(s.body, 0.92));
  } else if (s.tail === 'fox') {
    drawFoxTail(p, bx, by, s);
  }

  // 翅（身后两侧）
  if (s.wings) drawWings(p, bx, by, s);

  // 蛇身：低位长身，无腿
  if (s.tail === 'slither' && !s.spider) {
    p.orect(bx - 1, by, bw + 2, bh + 3, 3, shade(s.body, 0.95), s.ink);
    p.rect(bx + 3, by + bh, bw - 6, 3, shade(s.body, 0.9));
  } else {
    p.orect(bx, by, bw, bh, 3, shade(s.body, 0.95), s.ink);
    // 腹部浅色
    p.rect(bx + 3, by + 3, bw - 6, bh - 5, shade(s.body, 1.18));
  }

  // 腿 / 蛛足 / 螯（蛇身无腿）
  if (s.spider) drawSpiderLegs(p, s);
  else if (s.tail !== 'slither') drawBeastLegs(p, s);
  if (s.claws) drawClaws(p, s);
  if (s.shell) drawShell(p, bx, by, s);

  // 头（压住身体上缘与甲壳前缘）
  if (s.star) {
    drawStarHead(p, cx, { headY: hy, headH: hh, headHalf: 8 }, s);
  } else {
    p.orect(hx, hy, hw, hh, 3, s.body, s.ink);
    p.rect(hx + 2, hy + hh - 2, hw - 4, 1, shade(s.body, 0.9));
    // 兽耳 / 头角
    if (s.beastEars !== 'none') drawBeastEars(p, hx, hy, hw, s);
    if (s.horns > 0) drawHorns(p, hx, hy, hw, s);
  }
  if (s.spines) drawSpines(p, bx, by, s);

  // 面容（兽脸更大更圆）
  drawBeastFace(p, hx, hy, hw, s);
}

// ----------------------------------------------------------------------------
// 部件绘制
// ----------------------------------------------------------------------------
function drawFoxTail(p, bx, bodyY, s) {
  const t = s.body === DEFAULT_SPEC.body ? '#e8a05a' : shade(s.body, 1.15);
  p.orect(bx + 2, bodyY + 3, 4, 4, 2, t, s.ink);
  p.px(bx + 3, bodyY + 5, '#f6ece0');
  p.rect(bx + 1, bodyY + 2, 2, 2, t);
}

function drawEars(p, hx, headY, hw, s) {
  const c = s.hair;
  if (s.ears === 'fox') {
    // 三角兽耳立在头顶两侧
    p.rect(hx + 1, headY - 3, 2, 2, c);
    p.rect(hx + 2, headY - 4, 2, 2, c);
    p.px(hx + 2, headY - 3, '#e8b0b8');
    p.rect(hx + hw - 3, headY - 3, 2, 2, c);
    p.rect(hx + hw - 4, headY - 4, 2, 2, c);
    p.px(hx + hw - 3, headY - 3, '#e8b0b8');
  } else {
    // 精灵尖耳：头侧小尖
    p.mrect(hx - 1, headY + 5, 2, 3, c);
  }
}

function drawHair(p, hx, G, s) {
  const c = s.hair;
  const y = G.headY;
  const hw = G.headHalf * 2;
  const style = s.hairStyle;
  if (style === 'bald' || (s.hat !== 'none' && s.hat !== 'band' && s.hat !== 'flower' && style === 'bald')) {
    p.rect(hx + 2, y + 1, hw - 4, 1, shade(s.skin, 0.96)); // 发际阴影
    return;
  }
  // 发顶覆盖（帽下也画，帽子会盖住）
  p.rect(hx + 1, y, hw - 2, 2, c);
  p.rect(hx, y + 2, hw, 2, c);
  switch (style) {
    case 'side':
      p.rect(hx, y + 4, 3, 2, c); // 左侧长刘海
      p.rect(hx + hw - 2, y + 4, 2, 1, c);
      break;
    case 'long':
      // 长发披肩：两侧垂落至肩
      p.rect(hx, y + 4, hw, 1, c);
      p.rect(hx, y + 5, 2, 8, c);
      p.rect(hx + hw - 2, y + 5, 2, 8, c);
      p.px(hx + 1, y + 6, shade(c, 1.3));
      p.px(hx + hw - 2, y + 7, shade(c, 1.3));
      break;
    case 'bun':
      p.rect(hx + 5, y - 3, hw - 10, 3, c); // 发髻
      p.px(hx + hw - 6, y - 2, s.accent); // 发簪
      p.rect(hx, y + 4, hw, 1, c);
      break;
    case 'spiky':
      for (let i = 0; i < hw; i += 2) p.rect(hx + i, y - 1 - (i % 4 === 0 ? 1 : 0), 1, 2, c);
      p.rect(hx, y + 4, hw, 1, c);
      break;
    case 'ponytail':
      p.rect(hx + hw - 1, y + 3, 2, 6, c); // 侧马尾
      p.rect(hx + hw, y + 9, 1, 2, c);
      p.rect(hx, y + 4, hw, 1, c);
      break;
    case 'curl':
      p.rect(hx + 4, y - 1, 2, 1, c); // 呆毛
      p.px(hx + 6, y - 2, c);
      break;
    default:
      // flat：齐刘海三段
      p.rect(hx + 1, y + 4, 3, 1, c);
      p.rect(hx + hw - 4, y + 4, 3, 1, c);
      p.rect(hx + 5, y + 4, hw - 10, 1, shade(c, 1.25));
  }
}

function drawHat(p, hx, G, s) {
  const c = s.hatColor;
  const y = G.headY;
  const hw = G.headHalf * 2;
  switch (s.hat) {
    case 'cap': {
      p.rrect(hx - 1, y - 2, hw + 2, 6, 2, c);
      p.rect(hx - 1, y + 4, hw + 2, 1, shade(c, 0.75)); // 盔沿
      if (s.plume) p.rect(hx + hw / 2 - 1, y - 4, 2, 2, s.plume);
      break;
    }
    case 'helm': {
      p.rrect(hx - 1, y - 2, hw + 2, 7, 2, c);
      p.rect(hx - 1, y + 5, hw + 2, 1, shade(c, 0.75));
      p.rect(hx + hw / 2 - 1, y + 4, 2, 3, shade(c, 0.85)); // 鼻护
      p.px(hx + 3, y + 1, shade(c, 1.35));
      break;
    }
    case 'plume': {
      p.rrect(hx - 1, y - 2, hw + 2, 6, 2, c);
      p.rect(hx - 1, y + 4, hw + 2, 1, shade(c, 0.75));
      const pc = s.plume || '#f0c040';
      if (s.doublePlume) {
        p.rect(hx - 1, y - 8, 2, 7, pc);
        p.rect(hx + hw - 1, y - 8, 2, 7, pc);
        p.px(hx, y - 9, '#ffffff');
        p.px(hx + hw - 1, y - 9, '#ffffff');
      } else {
        p.rect(hx + hw - 3, y - 7, 2, 6, pc);
        p.px(hx + hw - 2, y - 8, '#ffffff');
      }
      break;
    }
    case 'wizard': {
      // 法师尖帽：逐行加宽的三角
      const w0 = 2;
      for (let i = 0; i < 7; i++) p.rect(hx + hw / 2 - w0 / 2 - i, y - 1 - (6 - i), w0 + i * 2, 1, c);
      p.rect(hx - 2, y, hw + 4, 2, shade(c, 0.85)); // 帽檐
      p.px(hx + hw / 2, y - 8, s.glow || s.accent); // 帽尖宝珠
      break;
    }
    case 'band': {
      p.rect(hx - 1, y + 3, hw + 2, 2, c);
      p.rect(hx - 2, y + 5, 2, 3, c); // 侧飘带
      p.px(hx - 2, y + 8, shade(c, 1.2));
      break;
    }
    case 'crown': {
      const gc = s.plume || '#f0c040';
      p.rect(hx + 2, y - 2, hw - 4, 2, gc);
      for (let i = 0; i < 3; i++) p.rect(hx + 3 + i * 5, y - 4, 2, 2, gc);
      p.px(hx + hw / 2 - 1, y - 1, '#e05a5a'); // 冠珠
      break;
    }
    case 'halo': {
      const hc = s.glow || '#ffd86a';
      p.rect(hx + 2, y - 4, hw - 4, 1, hc, 0.9);
      p.px(hx + 1, y - 3, hc, 0.9);
      p.px(hx + hw - 2, y - 3, hc, 0.9);
      break;
    }
    case 'hood': {
      p.rrect(hx - 2, y - 2, hw + 4, G.headH + 3, 3, c);
      p.rect(hx - 2, y + G.headH, hw + 4, 1, shade(c, 0.75));
      p.rect(hx + 2, y + 2, hw - 4, G.headH - 5, s.skin); // 兜帽开脸
      break;
    }
    case 'flower': {
      p.px(hx + hw - 4, y + 2, s.plume || '#e88aa8');
      p.px(hx + hw - 5, y + 3, '#ffffff');
      p.px(hx + hw - 4, y + 4, s.plume || '#e88aa8');
      break;
    }
    case 'antenna': {
      p.rect(hx + hw / 2 - 1, y - 4, 1, 3, shade(c, 0.8));
      p.px(hx + hw / 2 - 1, y - 5, s.glow || '#7ae0ff');
      break;
    }
  }
}

function drawAstroHead(p, hx, G, s) {
  // 全罩头盔：盔体 + 深色护目镜 + 反光点（画在头之上，取代常规发/脸）
  const y = G.headY;
  const hw = G.headHalf * 2;
  p.orect(hx, y, hw, G.headH, 3, s.hatColor, s.ink);
  p.rect(hx + 1, y + 1, hw - 2, 1, shade(s.hatColor, 1.25));
  const v = '#20344e'; // 镜面
  p.rrect(hx + 2, y + 4, hw - 4, G.headH - 7, 2, v);
  // 镜中眼（白点）与腮红
  p.mrect(hx + 4, y + 6, 2, 2, '#eaf6ff');
  p.mrect(hx + 2, y + 8, 2, 1, '#f08a78', 0.4);
  p.rect(hx + 3, y + G.headH - 3, hw - 6, 1, shade(s.hatColor, 0.8)); // 下颌托
  // 侧耳机
  p.mrect(hx - 2, y + 5, 2, 3, shade(s.hatColor, 0.85));
  // 机器人天线
  if (s.hat === 'antenna') {
    p.rect(hx + hw / 2 - 1, y - 4, 1, 3, shade(s.hatColor, 0.7));
    p.px(hx + hw / 2 - 1, y - 5, s.glow || '#7ae0ff');
  }
}

function drawStarHead(p, cx, G, s) {
  // 星形大头（星骸之核）：五角 + 光晕 + 常规脸
  const y = G.headY;
  const hh = G.headH;
  const c = s.body;
  p.orect(4, y + 2, 16, hh - 4, 2, c, s.ink);
  // 四向星角
  p.rect(cx - 1, y - 3, 2, 6, c);
  p.rect(1, y + hh / 2 - 1, 4, 3, c);
  p.rect(p.W - 5, y + hh / 2 - 1, 4, 3, c);
  p.rect(cx - 3, y - 1, 6, 2, shade(c, 1.15));
  p.rect(3, y + hh / 2, 2, 1, shade(c, 1.2));
  p.rect(p.W - 5, y + hh / 2, 2, 1, shade(c, 1.2));
  p.rect(cx - 1, y - 2, 1, 3, shade(c, 1.3));
}

function drawFace(p, hx, G, s) {
  const hw = G.headHalf * 2;
  const eyeY = G.headY + 5 + (s.build === 'baby' ? 0 : 1);
  const l = hx + Math.floor(hw * 0.24);
  const r = hx + Math.ceil(hw * 0.64);
  const ink = '#2b211a';

  if (s.mask === 'skull') {
    // 骷髅脸：黑眶 + 鼻孔 + 齿列
    p.rect(l, eyeY, 3, 2, '#1c1814');
    p.rect(r - 1, eyeY, 3, 2, '#1c1814');
    p.px(hx + hw / 2, eyeY + 3, '#1c1814');
    p.rect(hx + hw / 2 - 2, eyeY + 4, 4, 1, '#1c1814');
    for (let i = -1; i <= 1; i++) p.px(hx + hw / 2 + i * 2, eyeY + 4, '#c8c4b8');
    return;
  }
  if (s.mask === 'cyclops') {
    // 独眼：一枚大目
    p.rect(hx + hw / 2 - 2, eyeY - 1, 4, 3, s.glow || '#c060d0');
    p.px(hx + hw / 2 - 1, eyeY, '#ffffff');
    p.rect(hx + hw / 2 - 3, eyeY - 3, 6, 1, ink); // 眼睑
    p.rect(hx + 2, eyeY + 4, 2, 1, '#f08a78', 0.4);
    p.rect(hx + hw - 4, eyeY + 4, 2, 1, '#f08a78', 0.4);
    p.rect(hx + hw / 2 - 1, eyeY + 5, 2, 1, '#7a3a30');
    return;
  }

  // 眼（2×2 点点眼 + 左上高光）
  const eyeC = s.mood === 'glow' ? s.glow || '#ffe08a' : ink;
  p.mrect(l, eyeY, 2, 2, eyeC);
  p.mrect(l, eyeY, 1, 1, s.mood === 'glow' ? '#ffffff' : '#ffffff', 0.9);
  if (s.mood === 'angry') {
    p.mrect(l - 1, eyeY - 2, 3, 1, ink); // 怒眉
  }
  if (s.mood === 'sleepy') {
    p.mrect(l - 1, eyeY + 1, 4, 1, shade(s.skin, 0.82)); // 眼睑线
    p.mrect(l, eyeY, 2, 1, ink);
  }
  if (s.mood === 'smug') {
    p.mrect(l, eyeY - 1, 3, 1, ink); // 挑眉
  }

  // 腮红
  if (s.blush) {
    p.rect(hx + 1, eyeY + 2, 2, 1, '#f08a78', 0.45);
    p.rect(hx + hw - 3, eyeY + 2, 2, 1, '#f08a78', 0.45);
  }

  // 嘴
  const my = eyeY + 4;
  if (s.mood === 'angry') {
    p.rect(hx + hw / 2 - 1, my, 2, 1, '#7a3a30');
    p.px(hx + hw / 2 - 2, my + 1, '#7a3a30');
    p.px(hx + hw / 2 + 1, my + 1, '#7a3a30');
  } else if (s.fangs) {
    p.rect(hx + hw / 2 - 1, my, 2, 1, '#7a3a30');
    p.px(hx + hw / 2 - 2, my + 1, '#ffffff');
    p.px(hx + hw / 2 + 1, my + 1, '#ffffff');
  } else {
    p.rect(hx + hw / 2 - 1, my, 2, 1, '#a04a3a');
    p.px(hx + hw / 2 - 2, my, '#a04a3a', 0.5);
    p.px(hx + hw / 2 + 1, my, '#a04a3a', 0.5);
  }
}

function drawBeastFace(p, hx, hy, hw, s) {
  const eyeY = hy + 5;
  const l = hx + 4;
  const r = hx + hw - 6;
  const ink = '#2b211a';
  if (s.bigEyes) {
    p.mrect(l - 1, eyeY - 1, 4, 4, '#ffffff');
    p.mrect(l, eyeY, 3, 3, ink);
    p.mrect(l, eyeY, 1, 1, '#ffffff');
  } else {
    const c = s.mood === 'glow' ? s.glow || '#ffe08a' : ink;
    p.mrect(l, eyeY, 3, 2, c);
    p.mrect(l, eyeY, 1, 1, s.mood === 'glow' ? '#ffffff' : '#ffffff', 0.9);
  }
  if (s.eyes3) {
    p.rect(hx + hw / 2 - 1, eyeY - 4, 2, 2, ink);
    p.px(hx + hw / 2 - 1, eyeY - 4, '#ffffff', 0.9);
  }
  if (s.mood === 'angry') {
    p.mrect(l - 1, eyeY - 2, 3, 1, ink);
  }
  // 兽腮红 + 鼻头嘴
  p.rect(hx + 1, eyeY + 3, 2, 1, '#f08a78', 0.45);
  p.rect(hx + hw - 3, eyeY + 3, 2, 1, '#f08a78', 0.45);
  const my = eyeY + 4;
  p.rect(hx + hw / 2 - 1, my, 2, 1, '#3a2a24'); // 鼻/嘴
  if (s.fangs) {
    p.px(hx + hw / 2 - 2, my + 1, '#ffffff');
    p.px(hx + hw / 2 + 1, my + 1, '#ffffff');
  } else {
    p.rect(hx + hw / 2 - 2, my + 1, 4, 1, '#7a3a30', 0.6);
  }
}

function drawBeard(p, hx, G, s) {
  if (!s.beard) return;
  const hw = G.headHalf * 2;
  const y = G.headY + G.headH - 4;
  const len = s.beardLong ? 4 : 2;
  p.rect(hx + 2, y, hw - 4, 2, s.beard);
  if (len > 2) {
    p.rect(hx + 4, y + 2, hw - 8, len - 2, s.beard);
    p.px(hx + hw / 2, y + len, s.beard);
  }
  p.mrect(hx + 2, y, 2, 1, shade(s.beard, 1.3));
}

function drawWeapon(p, wx, wy, s) {
  switch (s.weapon) {
    case 'sword':
      p.rect(wx, wy - 5, 1, 8, '#6b4a2a'); // 柄
      p.rect(wx - 1, wy - 3, 3, 1, s.accent || '#f0c040'); // 格
      p.rect(wx, wy - 11, 1, 8, '#dfe8ee'); // 刃
      p.px(wx, wy - 11, '#ffffff');
      break;
    case 'staff':
      p.rect(wx, wy - 7, 1, 11, '#6b4a2a');
      p.rect(wx - 1, wy - 10, 3, 3, s.glow || '#b89cf0');
      p.px(wx - 1, wy - 10, '#ffffff', 0.85);
      break;
    case 'bow':
      p.rect(wx, wy - 7, 1, 11, '#6b4a2a');
      p.px(wx - 1, wy - 8, '#6b4a2a');
      p.px(wx - 1, wy + 4, '#6b4a2a');
      p.rect(wx - 2, wy - 7, 1, 11, '#eae0cc'); // 弦
      break;
    case 'spear':
      p.rect(wx, wy - 8, 1, 12, '#6b4a2a');
      p.rect(wx, wy - 12, 1, 4, '#dfe8ee');
      p.rect(wx - 1, wy - 11, 3, 1, '#dfe8ee');
      break;
    case 'scythe':
      p.rect(wx, wy - 9, 1, 13, '#6b4a2a');
      p.rect(wx - 4, wy - 11, 4, 1, '#dfe8ee'); // 横刃
      p.rect(wx - 4, wy - 10, 1, 3, '#dfe8ee');
      break;
    case 'axe':
      // 双刃战斧
      p.rect(wx, wy - 6, 1, 10, '#6b4a2a');
      p.rect(wx - 3, wy - 10, 3, 4, '#c8ccd4');
      p.rect(wx + 1, wy - 10, 3, 4, '#c8ccd4');
      p.rect(wx, wy - 11, 1, 5, '#dfe8ee');
      p.px(wx - 3, wy - 10, '#ffffff', 0.7);
      p.px(wx + 3, wy - 10, '#ffffff', 0.7);
      break;
    case 'fan': {
      const fc = s.fanColor || '#eae0cc';
      for (let i = 0; i < 3; i++) p.rect(wx - 1 + i, wy - 6 + i, 1, 3, fc);
      p.rect(wx, wy - 3, 1, 3, '#6b4a2a');
      break;
    }
  }
}

function drawHorns(p, hx, headY, hw, s) {
  const c = '#e8dcc8';
  if (s.horns >= 2) {
    p.rect(hx + 1, headY - 3, 2, 3, c);
    p.px(hx, headY - 4, c);
    p.rect(hx + hw - 3, headY - 3, 2, 3, c);
    p.px(hx + hw - 1, headY - 4, c);
  }
  if (s.horns === 1 || s.horns === 3) {
    p.rect(hx + hw / 2 - 1, headY - 4, 2, 4, c);
  }
}

function drawWings(p, bx, by, s) {
  const c = shade(s.body, 0.72);
  // 左右各一扇折翼，坐标收在画布内
  for (const x0 of [bx - 3, p.W - bx - 1]) {
    p.rect(x0, by + 1, 4, 2, c);
    p.rect(x0 < p.W / 2 ? x0 - 2 : x0 + 4, by + 3, 2, 3, c);
    p.px(x0 < p.W / 2 ? x0 - 2 : x0 + 5, by + 6, c);
    p.px(x0 + 1, by + 2, shade(c, 1.3));
  }
}

function drawSpines(p, bx, by, s) {
  const c = shade(s.body, 0.7);
  for (const x of [bx + 2, bx + 5, bx + 8]) p.rect(x, by - 1, 1, 2, c);
}

function drawShell(p, bx, by, s) {
  const c = s.shell || '#5a7a4a';
  p.rrect(bx - 1, by - 2, 14, 7, 3, c);
  p.rect(bx - 1, by + 4, 14, 1, s.shellRim || shade(c, 1.3));
  for (const [dx, dy] of [[3, 1], [7, 1], [5, 3], [2, 3], [9, 3]]) p.px(bx + dx, by + dy, shade(c, 0.82));
}

function drawBeastLegs(p, s) {
  const c = shade(s.body, 0.8);
  for (const x of [7, 10, 13, 16]) p.orect(x, 23, 2, 4, 1, c, s.ink);
}

function drawSpiderLegs(p, s) {
  const c = shade(s.body, 0.7);
  for (let i = 0; i < 4; i++) {
    const y = 16 + i;
    p.rect(2, y, 4, 1, c);
    p.rect(1, y + 1, 2, 1, c);
    p.rect(p.W - 6, y, 4, 1, c);
    p.rect(p.W - 3, y + 1, 2, 1, c);
  }
}

function drawClaws(p, s) {
  const c = s.body;
  p.orect(1, 12, 4, 4, 1, c, s.ink);
  p.px(2, 13, shade(c, 1.3));
  p.orect(p.W - 5, 12, 4, 4, 1, c, s.ink);
  p.px(p.W - 3, 13, shade(c, 1.3));
}

function drawBeastEars(p, hx, hy, s) {
  const c = s.body;
  const inner = shade(c, 1.35);
  switch (s.beastEars) {
    case 'rat':
      p.mrect(hx + 2, hy - 3, 4, 4, c);
      p.mrect(hx + 3, hy - 2, 2, 2, inner);
      break;
    case 'fox':
      p.mrect(hx + 2, hy - 4, 3, 4, c);
      p.mrect(hx + 5, hy - 5, 2, 3, c);
      p.mrect(hx + 3, hy - 3, 2, 2, inner);
      break;
    case 'rabbit':
      p.mrect(hx + 4, hy - 6, 2, 6, c);
      p.mrect(hx + 5, hy - 5, 1, 4, inner);
      break;
    case 'round':
      p.mrect(hx + 2, hy - 3, 4, 4, c);
      p.mrect(hx + 3, hy - 2, 2, 2, inner);
      break;
    case 'antenna':
      p.rect(hx + 4, hy - 3, 1, 3, shade(c, 0.75));
      p.px(hx + 4, hy - 4, shade(c, 1.4));
      p.rect(hx + hw - 5, hy - 3, 1, 3, shade(c, 0.75));
      p.px(hx + hw - 5, hy - 4, shade(c, 1.4));
      break;
  }
}

// ----------------------------------------------------------------------------
// 核心：spec → 像素块列表
// ----------------------------------------------------------------------------
export function paintKairo(spec) {
  const s = kairoSpec(spec);
  const p = new Painter();
  if (s.plan === 'beast') paintBeast(p, s);
  else paintChibi(p, s);
  return { w: KAIRO.W, h: KAIRO.H, rects: p.rects };
}

// ----------------------------------------------------------------------------
// 后端一：DOM 内联 SVG 字符串（crispEdges 保证像素质感）。
// 画布上下按内容动态扩展（高帽 / 描边可能超出 0..28 基准网格），
// 像素单位固定为 size/28：所有角色同尺寸下头身一致，戴高帽者画布更高。
// ----------------------------------------------------------------------------
export function kairoSVG(spec, size = 64, opts = {}) {
  const { w, rects } = paintKairo(spec);
  const name = (spec && spec.name) || '角色';
  let yMin = 0;
  let yMax = KAIRO.H;
  for (const r of rects) {
    if (r.y < yMin) yMin = r.y;
    if (r.y + r.h > yMax) yMax = r.y + r.h;
  }
  const width = Math.round(((size * w) / KAIRO.H) * 100) / 100;
  const height = Math.round(((size * (yMax - yMin)) / KAIRO.H) * 100) / 100;
  const body = rects
    .map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${r.c}"${r.o < 1 ? ` fill-opacity="${r.o}"` : ''}/>`)
    .join('');
  const bg = opts.bg ? `<rect x="0" y="${yMin}" width="${w}" height="${yMax - yMin}" rx="${opts.bgRx != null ? opts.bgRx : 4}" fill="${asCss(opts.bg)}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${yMin} ${w} ${yMax - yMin}" width="${width}" height="${height}" shape-rendering="crispEdges" role="img" aria-label="${name}"${opts.cls ? ` class="${opts.cls}"` : ''}>${bg}${body}</svg>`;
}

// ----------------------------------------------------------------------------
// 后端二：Phaser Graphics。垂直映射与旧版 Chibi 对齐：
// 内容行 2..28 映射到 -0.5*size .. +0.385*size，水平以中轴居中。
// ----------------------------------------------------------------------------
export function drawKairo(g, spec, size = 48) {
  const { w, rects } = paintKairo(spec);
  const unit = (size * 0.885) / 26;
  const y0 = -0.5 * size - 2 * unit;
  const x0 = -(w / 2) * unit;
  const eps = unit * 0.18; // 微重叠，消除相邻色块的发丝缝
  for (const r of rects) {
    const col = r.c.replace('#', '0x');
    if (r.o < 1) g.fillStyle(col, r.o);
    else g.fillStyle(col, 1);
    g.fillRect(x0 + r.x * unit, y0 + r.y * unit, r.w * unit + eps, r.h * unit + eps);
  }
}

// 常用色板（各展品预置外观表可引用，保持整体色感统一）
export const KAIRO_COLORS = {
  gold: '#f0c040',
  jade: '#2f7d4a',
  crimson: '#c0392b',
  azure: '#3a6ea5',
  purple: '#7a5aa0',
  steel: '#9aa8b6',
  wood: '#6b4a2a',
};
