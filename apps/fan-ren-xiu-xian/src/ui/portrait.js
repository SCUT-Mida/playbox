// ============================================================================
// 仙侠人物头像（开罗风像素 Q 版）
// 底层形象来自共享素材库 apps/_lib/kairo.js；本文件负责仙侠语境：
// 按修炼方向（剑/药/体/玄/神/散/飞升）配色与持物，男女发型有别，
// 外面套一层圆形头像框（灵气渐变底 + 描边圆环）。返回可注入 DOM 的 SVG 字符串。
// ============================================================================

import { paintKairo, kairoSpec, KAIRO } from '../../../_lib/kairo.js';

// 头像序号：同一文档内可能并存多张相同 tag/gender/size 的头像，
// 用单调递增序号为 <radialGradient>/<clipPath> 的 id 追加唯一后缀，避免重复 id（非法 HTML）。
let portraitSeq = 0;

// 修炼方向 → 开罗风形象（配色沿用旧版仙侠色板，robe→衣色 / trim→衣领亮色 / accent→点缀）
const LOOK = {
  剑修: { body: '#3a5a78', accent: '#d7e6f2', weapon: 'sword', mood: 'happy', aura: '#bfe2ff' },
  药修: { body: '#2f7d57', accent: '#d6f0dd', weapon: 'staff', glow: '#9be8b6', mood: 'glow', hat: 'band', aura: '#bff3d2' },
  体修: { body: '#8a3a2a', accent: '#f0c98a', mood: 'angry', hairStyle: 'spiky', aura: '#ffd9b0' },
  玄修: { body: '#5a3a8a', accent: '#ddccf2', hat: 'wizard', weapon: 'staff', glow: '#b89cf0', mood: 'glow', aura: '#d2bcf5' },
  神修: { body: '#2f6f80', accent: '#cdeef2', hat: 'wizard', glow: '#86e0ec', mood: 'glow', aura: '#b6ecf2' },
  散修: { body: '#5a4a36', accent: '#dccda6', hat: 'band', mood: 'happy', aura: '#e3d6b0' },
  飞升仙尊: { body: '#9a7a2a', accent: '#ffe9a8', hat: 'halo', weapon: 'staff', glow: '#ffd86a', mood: 'glow', aura: '#fff0b8' },
};

/**
 * 生成头像 SVG 字符串（圆形开罗风像素小人）。
 * @param {{gender?:string, tag?:string}} def 头像定义（来自 portraitDef）
 * @param {number} size 渲染像素尺寸（正方形）
 */
export function portraitSVG(def, size = 80) {
  const gender = def && def.gender === 'female' ? 'female' : 'male';
  const tag = (def && def.tag) || '散修';
  const look = LOOK[tag] || LOOK.散修;
  const isF = gender === 'female';
  const isAscend = tag === '飞升仙尊';

  const spec = kairoSpec({
    plan: 'chibi',
    name: `${tag}头像`,
    // 女修长发披肩、男修束发髻；体修例外已在 LOOK 指定
    hairStyle: look.hairStyle || (isF ? 'long' : 'bun'),
    hair: isAscend ? '#e8dfc0' : isF ? '#3c2a46' : '#17120f',
    ...look,
  });
  const { rects } = paintKairo(spec);

  const gid = `pg_${portraitSeq++}`;
  const R = 27;
  // 人物绘制在 28×28 圆形画布中：横向居中（左移 2），纵向下移 4 呈半身像取景
  const body = rects
    .map((r) => `<rect x="${(r.x + 2).toFixed(2)}" y="${(r.y + 4).toFixed(2)}" width="${r.w}" height="${r.h}" fill="${r.c}"${r.o < 1 ? ` fill-opacity="${r.o}"` : ''}/>`)
    .join('');
  const ring = look.accent || '#dccda6';
  const halo = isAscend
    ? `<g stroke="${look.aura}" stroke-width="0.8" opacity="0.9">
         <line x1="14" y1="1" x2="14" y2="4"/><line x1="1" y1="14" x2="4" y2="14"/>
         <line x1="24" y1="14" x2="27" y2="14"/><line x1="4" y1="4" x2="6" y2="6"/>
         <line x1="20" y1="20" x2="22" y2="22"/><line x1="22" y1="4" x2="20" y2="6"/>
         <line x1="4" y1="20" x2="6" y2="22"/></g>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="${size}" height="${size}" role="img" aria-label="${tag}头像">
    <defs>
      <radialGradient id="${gid}" cx="50%" cy="36%" r="70%">
        <stop offset="0%" stop-color="${look.aura}" stop-opacity="0.6"/>
        <stop offset="62%" stop-color="${KAIRO.ink}" stop-opacity="0.92"/>
        <stop offset="100%" stop-color="#0c0906"/>
      </radialGradient>
      <clipPath id="clip_${gid}"><circle cx="14" cy="14" r="${R - 0.5}"/></clipPath>
    </defs>
    <circle cx="14" cy="14" r="${R - 0.5}" fill="#0c0906"/>
    <g clip-path="url(#clip_${gid})">
      <rect x="0" y="0" width="28" height="28" fill="url(#${gid})"/>
      ${halo}
      ${body}
    </g>
    <circle cx="14" cy="14" r="${R - 0.6}" fill="none" stroke="${ring}" stroke-opacity="0.55" stroke-width="1"/>
  </svg>`;
}
