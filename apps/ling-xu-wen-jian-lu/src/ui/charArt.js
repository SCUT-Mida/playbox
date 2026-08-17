// ============================================================================
// 灵墟·问剑录 · 开罗风像素人物素材层
//
// 人物形象迁移到共享素材库 apps/_lib/kairo.js（像素网格 · 双后端 · 预置体系），
// 本文件保留原有导出契约，portrait3D（卡面）/ silhouetteRenderer（战场剪影）/
// app.js（绘卷页）三处调用零改动：
//   charFigure(card, opts) → HTMLElement 全身像（span.char-art > svg）
//   charBust(card, opts)   → HTMLElement 胸像裁切（迷你卡 / 图鉴 / 问道结果）
//   charArtVars(card)      → 五行三阶色 CSS 变量（光环 / 描边沿用）
//
// 形象来源（15 人 15 面，对齐 data/artPresets.js 的形象释义）：
//   职业基底（CLS_BASE）+ 卡牌专属覆盖（CHAR_LOOKS，发式/发色/武器/兽耳/
//   狐尾/牛角/凤冠……），衣色缺省取五行代表色（可被卡牌 silhouetteColor 覆盖）。
// is-sil 模式整体塌缩为三阶墨色皮影，供战场微缩表现使用。
// ============================================================================
import { h } from './dom.js';
import { classDef, silhouetteColor, shade } from '../config.js';
import { paintKairo, kairoSpec } from '../../../_lib/kairo.js';

// —— 职业基底：仅凭姿态 / 武器 / 冠帽即可判断职业（缩略图一眼可辨）——
const CLS_BASE = {
  sword:    { weapon: 'sword', hat: 'cap', mood: 'happy' },          // 剑修：执剑兜鍪
  body:     { weapon: 'none', mood: 'angry', hairStyle: 'side' },    // 体修：赤手怒目
  alchemy:  { hat: 'wizard', weapon: 'staff', mood: 'glow' },        // 丹修：尖帽法杖
  array:    { hat: 'wizard', weapon: 'staff', mood: 'glow', hairStyle: 'bun' }, // 阵修：道冠结印
  talisman: { hat: 'band', weapon: 'fan' },                          // 符修：束带宽袖
};

// —— 15 位角色专属形象（按 data/artPresets.js 形象释义逐卡预设）——
const CHAR_LOOKS = {
  // R 卡 · 逸品青玉
  R001: { hat: 'none', hairStyle: 'ponytail', hair: '#2c3428', body: '#5fa85f', accent: '#dfe8d0', mood: 'happy' }, // 青竹剑侍：马尾竹青劲装
  R002: { ears: 'fox', tail: 'fox', hairStyle: 'long', hair: '#e8a05a', weapon: 'fan', fanColor: '#f0d090', mood: 'smug', body: '#d4564f', accent: '#f0c040' }, // 赤焰灵狐：狐耳狐尾黄符
  R003: { hat: 'helm', hatColor: '#3a5a7a', weapon: 'shield', hairStyle: 'side', hair: '#8a9298', mood: 'angry', body: '#4a6a8a' }, // 玄龟甲士：龟甲纹重铠圆盾
  R004: { hat: 'cap', hatColor: '#c8ccd4', plume: '#e8c86a', weapon: 'sword', mood: 'smug', body: '#9aa4ae', accent: '#e8c86a', hair: '#2c2824' }, // 金戈锐士：银白镶金轻甲
  R005: { weapon: 'none', mood: 'smug', hairStyle: 'side', hair: '#5a4432', body: '#a17b4a' }, // 山岩武人：石拳套褐袍
  R006: { hat: 'none', hairStyle: 'long', hair: '#1c1410', weapon: 'staff', glow: '#8ad0a0', mood: 'happy', body: '#7ab88a', accent: '#e8f0e0' }, // 青芜药姬：捧炉女医
  R007: { hat: 'band', hatColor: '#8a3a2e', hairStyle: 'spiky', hair: '#3a2c22', weapon: 'sword', mood: 'smug', body: '#c05a4a' }, // 燎原散修：破旧红衣扛剑
  R008: { hat: 'none', hairStyle: 'long', hair: '#d8e0e8', weapon: 'fan', fanColor: '#a8d0e8', mood: 'sleepy', body: '#7a9ab8', accent: '#e8f0f6' }, // 霜华符女：银发冰符
  R009: { hat: 'none', hairStyle: 'bun', plume: '#e8d08a', weapon: 'staff', glow: '#e8d08a', mood: 'smug', body: '#b89a5a' }, // 天机阵师：羽簪罗盘
  // SR 卡 · 绝品紫金
  SR001: { hat: 'flower', plume: '#ffffff', hairStyle: 'long', hair: '#1c1410', weapon: 'staff', glow: '#a8e0e8', mood: 'happy', body: '#c8e0e8', accent: '#e8d08a' }, // 白鹤仙子：羽衣玉瓶
  SR002: { hat: 'band', hatColor: '#5a1c16', hairStyle: 'bun', hair: '#8a2c22', weapon: 'sword', mood: 'angry', body: '#8a2a22', accent: '#e8c86a' }, // 赤霄剑尊：红绳束发赤剑
  SR003: { hat: 'none', hairStyle: 'long', hair: '#2c2434', weapon: 'staff', glow: '#b0a0d0', mood: 'smug', body: '#6a5a7a' }, // 玄冥蛇姬：蛇鳞紫袍盘蛇杖
  SR004: { hat: 'wizard', hatColor: '#3a6a52', hairStyle: 'bun', weapon: 'staff', glow: '#9ae8b0', mood: 'glow', body: '#4a8a6a' }, // 青莲道尊：青莲法衣
  // SSR 卡 · 至品彩凰
  SSR001: { hat: 'helm', hatColor: '#4a4034', horns: 2, weapon: 'axe', mood: 'angry', hairStyle: 'spiky', hair: '#4a2c1c', body: '#5a3428', accent: '#c8a24a' }, // 蚩尤残魂：牛角魔甲巨斧
  SSR002: { hat: 'crown', plume: '#f0c040', hairStyle: 'long', hair: '#141018', weapon: 'staff', glow: '#ffd8a0', mood: 'glow', body: '#e8d8e0', accent: '#f0c040' }, // 瑶池圣母：凤冠霓裳金莲
};

// 卡牌 → 开罗风形象（职业基底 + 五行衣色 + 专属覆盖）
export function lookForCard(card) {
  const cls = classDef(card && card.cls);
  return kairoSpec({
    plan: 'chibi',
    name: (card && card.name) || '修士',
    body: silhouetteColor(card),
    accent: '#f0e8d8',
    ...(CLS_BASE[cls.key] || CLS_BASE.sword),
    ...(CHAR_LOOKS[card && card.id] || {}),
  });
}

// —— 敌方小怪 / Boss 形象（战场单位 art 位，替代旧五行 emoji）——
// 按五行映射兽形/人形预设；Boss 附加双角怒容。
const ENEMY_LOOKS = {
  metal: { preset: 'knight', body: '#8a96a8' },        // 锋刃傀 / 铁甲卫
  earth: { preset: 'turtleBeast', body: '#a17b4a', shell: '#8a6840', shellRim: '#c8a878' }, // 岩甲傀 / 砾石魔
  wood:  { preset: 'bugBeast', body: '#5fa85f', spines: true }, // 古藤精 / 妖树苗
  fire:  { preset: 'batBeast', body: '#d4564f' },      // 焰魔 / 赤翼鸟
  water: { preset: 'ghosty', body: '#9ec8de', body2: '#8ab8d2' }, // 寒霜灵 / 玄水魅
  none:  { preset: 'ghosty', body: '#8a8a9a', body2: '#7a7a8a' }, // 虚空游魂
};
export function enemyLook(data) {
  const base = ENEMY_LOOKS[data && data.element] || ENEMY_LOOKS.none;
  const look = { ...base, name: (data && data.name) || '妖魔' };
  if (data && data.isBoss) { look.horns = 2; look.mood = 'angry'; }
  return kairoSpec(look);
}

// —— 皮影化：is-sil 时把像素色块塌缩为五行色三阶墨影 ——
function silColor(sil, rectColor) {
  const m = /#(\w\w)(\w\w)(\w\w)/.exec(rectColor);
  if (!m) return sil;
  const lum = (parseInt(m[1], 16) + parseInt(m[2], 16) + parseInt(m[3], 16)) / 3;
  if (lum < 80) return shade(sil, -0.4);
  if (lum > 210) return shade(sil, 0.3);
  return sil;
}

function figureSVG(card, opts, mode) {
  const spec = lookForCard(card);
  const { w, rects } = paintKairo(spec);
  const list = opts && opts.sil
    ? rects.map((r) => ({ ...r, c: silColor(silhouetteColor(card), r.c) }))
    : rects;
  let yMin = 0;
  let yMax = 28;
  for (const r of list) {
    if (r.y < yMin) yMin = r.y;
    if (r.y + r.h > yMax) yMax = r.y + r.h;
  }
  // 全身：整格取景（脚底贴底边）；胸像：裁到胸口（约第 19 行）
  const vbY = mode === 'bust' ? yMin : yMin;
  const vbH = mode === 'bust' ? Math.min(19 - yMin, yMax - yMin) : yMax - yMin;
  const body = list
    .map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${r.c}"${r.o < 1 ? ` fill-opacity="${r.o}"` : ''}/>`)
    .join('');
  const preserve = mode === 'bust' ? 'xMidYMin slice' : 'xMidYMax meet';
  return `<svg viewBox="0 ${vbY} ${w} ${vbH}" preserveAspectRatio="${preserve}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${body}</svg>`;
}

function figureEl(card, mode, opts) {
  const el = h('span', {
    class: `char-art${opts && opts.sil ? ' is-sil' : ''}`,
    html: figureSVG(card, opts, mode),
  });
  // 五行代表色（可被卡牌 silhouetteColor 覆盖）+ 角色发色落到画布自身，
  // 供光环 / 描边等外部部件继承（像素本体使用固定色，不依赖这些变量）。
  for (const [k, v] of Object.entries(charArtVars(card))) el.style.setProperty(k, v);
  return el;
}

// 全身立绘（修炼页卡面 / 战场剪影底稿 / 绘卷预览）。
export function charFigure(card, opts = {}) {
  return figureEl(card, 'full', opts);
}

// 胸像（阵容迷你卡 / 图鉴 / 问道结果等小图标位）。
export function charBust(card, opts = {}) {
  return figureEl(card, 'bust', opts);
}

// 五行代表色三阶（正 / 深 / 亮），供容器内联着色。
// 卡面（portrait3D）与战场剪影（silhouetteRenderer）都从这里取值，保证同屏只有一档色。
export function charArtVars(card) {
  const sil = silhouetteColor(card);
  const vars = { '--sil': sil, '--sil-d': shade(sil, -0.35), '--sil-l': shade(sil, 0.3) };
  const hair = CHAR_LOOKS[card && card.id] && CHAR_LOOKS[card && card.id].hair;
  if (hair) { vars['--hair'] = hair; vars['--hair-l'] = shade(hair, 0.3); }
  return vars;
}
