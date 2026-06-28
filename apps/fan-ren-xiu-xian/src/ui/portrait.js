// ============================================================================
// 仙侠人物头像（SVG 程序化绘制）
// 取代原先的 emoji 头像：以「人」为形象，男女有别，按修炼方向（剑/药/体/玄/神/散/飞升）
// 配色与点缀，呈现统一的仙侠画风。返回可直接注入 DOM 的 SVG 字符串。
// ============================================================================
// 男：束发髻 + 发簪，剑眉，肩线宽厚；
// 女：长发披肩 + 额饰花钿，柳眉，肩线柔和 —— 男女一眼可辨。

// 修炼方向 → 配色与点缀
const PALETTES = {
  剑修: { robe: '#3a5a78', robeDark: '#27425b', trim: '#d7e6f2', accent: '#9fd0ff', aura: '#bfe2ff', motif: 'sword' },
  药修: { robe: '#2f7d57', robeDark: '#1f5a3e', trim: '#d6f0dd', accent: '#9be8b6', aura: '#bff3d2', motif: 'leaf' },
  体修: { robe: '#8a3a2a', robeDark: '#5e271c', trim: '#f0c98a', accent: '#ffb27a', aura: '#ffd9b0', motif: 'fist' },
  玄修: { robe: '#5a3a8a', robeDark: '#3e2762', trim: '#ddccf2', accent: '#b89cf0', aura: '#d2bcf5', motif: 'orb' },
  神修: { robe: '#2f6f80', robeDark: '#1f4d5a', trim: '#cdeef2', accent: '#86e0ec', aura: '#b6ecf2', motif: 'eye' },
  散修: { robe: '#5a4a36', robeDark: '#3e3324', trim: '#dccda6', accent: '#cdb888', aura: '#e3d6b0', motif: 'star' },
  飞升仙尊: { robe: '#9a7a2a', robeDark: '#6a5418', trim: '#ffe9a8', accent: '#ffd86a', aura: '#fff0b8', motif: 'halo' },
};

// 胸前小点缀（按修炼方向），写意而非抢戏
function motifSvg(pal) {
  const c = pal.accent;
  switch (pal.motif) {
    case 'sword':
      return `<g transform="translate(50,80) rotate(20)">
        <rect x="-1.2" y="-9" width="2.4" height="14" rx="1" fill="${c}"/>
        <rect x="-3.5" y="3" width="7" height="2" rx="1" fill="${pal.trim}"/>
      </g>`;
    case 'leaf':
      return `<path d="M44,82 q6,-9 12,-2 q-6,9 -12,2 z" fill="${c}" opacity="0.85"/><path d="M44,82 l12,-2" stroke="${pal.robeDark}" stroke-width="0.6"/>`;
    case 'orb':
      return `<circle cx="50" cy="80" r="4" fill="${c}"/><circle cx="48.6" cy="78.6" r="1.3" fill="#ffffff" opacity="0.8"/>`;
    case 'eye':
      return `<path d="M44,80 q6,-5 12,0 q-6,5 -12,0 z" fill="none" stroke="${c}" stroke-width="1.4"/><circle cx="50" cy="80" r="1.6" fill="${c}"/>`;
    case 'fist':
      return `<circle cx="50" cy="80" r="4" fill="none" stroke="${c}" stroke-width="1.6"/><circle cx="50" cy="80" r="1.4" fill="${c}"/>`;
    case 'halo':
      return ''; // 飞升用头顶光环，不画胸饰
    default:
      return `<path d="M47,82 l3,-4 l3,4 l-3,2 z" fill="${c}" opacity="0.8"/>`;
  }
}

/**
 * 生成头像 SVG 字符串。
 * @param {{gender?:string, tag?:string}} def 头像定义（来自 portraitDef）
 * @param {number} size 渲染像素尺寸（正方形）
 */
export function portraitSVG(def, size = 80) {
  const gender = def && def.gender === 'female' ? 'female' : 'male';
  const tag = (def && def.tag) || '散修';
  const pal = PALETTES[tag] || PALETTES.散修;
  const isF = gender === 'female';
  const isAscend = tag === '飞升仙尊';

  const skin = '#f2cda4';
  const skinShade = '#e2b48a';
  const hair = '#17120f';
  const hairHi = '#2a2018';
  const ink = '#241a14';

  // —— 背景光环（飞升更亮）——
  const halo = isAscend
    ? `<circle cx="50" cy="42" r="34" fill="none" stroke="${pal.accent}" stroke-width="2" opacity="0.9"/>
       <g stroke="${pal.trim}" stroke-width="1.4" opacity="0.85">
         <line x1="50" y1="2" x2="50" y2="10"/>
         <line x1="50" y1="74" x2="50" y2="82"/>
         <line x1="10" y1="42" x2="18" y2="42"/>
         <line x1="82" y1="42" x2="90" y2="42"/>
         <line x1="22" y1="14" x2="28" y2="20"/>
         <line x1="72" y1="64" x2="78" y2="70"/>
         <line x1="78" y1="14" x2="72" y2="20"/>
         <line x1="28" y1="64" x2="22" y2="70"/>
       </g>`
    : '';

  // —— 头发（男女有别）——
  let hairShape;
  if (isF) {
    // 长发披肩：两侧长发垂落 + 额前刘海
    hairShape = `
      <path d="M30,46 Q26,70 30,100 L40,100 Q40,70 40,50 Z" fill="${hair}"/>
      <path d="M70,46 Q74,70 70,100 L60,100 Q60,70 60,50 Z" fill="${hair}"/>
      <path d="M33,40 Q34,22 50,20 Q66,22 67,40 Q66,30 50,29 Q34,30 33,40 Z" fill="${hair}"/>
      <path d="M33,40 Q36,30 50,30 Q64,30 67,40 Q60,34 50,34 Q40,34 33,40 Z" fill="${hairHi}"/>
      <rect x="34" y="38" width="32" height="6" rx="3" fill="${hair}"/>
      <!-- 额饰花钿 -->
      <g transform="translate(58,30)">
        <circle r="2.4" fill="${pal.accent}"/>
        <circle r="1" fill="#fff" opacity="0.85"/>
      </g>`;
  } else {
    // 男：束发髻 + 发簪
    hairShape = `
      <ellipse cx="50" cy="22" rx="9" ry="6.5" fill="${hair}"/>
      <ellipse cx="50" cy="20.5" rx="6.5" ry="3" fill="${hairHi}"/>
      <line x1="40" y1="22" x2="60" y2="22" stroke="${pal.accent}" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="60" cy="22" r="1.6" fill="${pal.trim}"/>
      <path d="M34,42 Q34,24 50,23 Q66,24 66,42 Q62,32 50,32 Q38,32 34,42 Z" fill="${hair}"/>
      <path d="M34,42 Q38,33 50,33 Q62,33 66,42 Q60,36 50,36 Q40,36 34,42 Z" fill="${hairHi}"/>
      <rect x="34" y="39" width="32" height="5" rx="2.5" fill="${hair}"/>`;
  }

  // —— 面部 ——
  const brows = isF
    ? `<path d="M40,40 Q44,38 47,40" stroke="${ink}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
       <path d="M53,40 Q56,38 60,40" stroke="${ink}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`
    : `<path d="M40,40 L47,39" stroke="${ink}" stroke-width="1.7" fill="none" stroke-linecap="round"/>
       <path d="M53,39 L60,40" stroke="${ink}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
  // 眼：含蓄半阖（仙侠静修神态）
  const eyes = `
    <path d="M40,46 Q44,48 48,46" stroke="${ink}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M52,46 Q56,48 60,46" stroke="${ink}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  const mouth = `<path d="M47,55 Q50,57 53,55" stroke="${ink}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
  const blush = `
    <circle cx="40" cy="51" r="2.6" fill="#f08a78" opacity="0.32"/>
    <circle cx="60" cy="51" r="2.6" fill="#f08a78" opacity="0.32"/>`;

  // —— 衣袍（肩线男女有别）——
  const shoulderY = 64;
  const shoulderX = isF ? 24 : 20; // 女肩略窄
  const collar = isAscend
    ? `<path d="M${50 - 7},${shoulderY} L50,${shoulderY + 18} L${50 + 7},${shoulderY}" fill="${pal.robeDark}"/>
       <path d="M${50 - 7},${shoulderY} L50,${shoulderY + 18} L${50 + 7},${shoulderY}" fill="none" stroke="${pal.trim}" stroke-width="1.6"/>`
    : `<path d="M${50 - 8},${shoulderY} L50,${shoulderY + 20} L${50 + 8},${shoulderY}" fill="${pal.robeDark}"/>
       <path d="M${50 - 8},${shoulderY} L50,${shoulderY + 20} L${50 + 8},${shoulderY}" fill="none" stroke="${pal.trim}" stroke-width="1.6"/>`;

  const robe = `
    <path d="M${50 - shoulderX},100 Q${50 - shoulderX},${shoulderY + 4} ${50 - 9},${shoulderY + 2}
             L${50 - 6},${shoulderY} L50,${shoulderY + 18} L${50 + 6},${shoulderY}
             L${50 + 9},${shoulderY + 2} Q${50 + shoulderX},${shoulderY + 4} ${50 + shoulderX},100 Z"
          fill="${pal.robe}"/>
    <path d="M${50 - shoulderX},100 Q${50 - shoulderX},${shoulderY + 4} ${50 - 9},${shoulderY + 2}"
          fill="none" stroke="${pal.robeDark}" stroke-width="2"/>
    <path d="M${50 + shoulderX},100 Q${50 + shoulderX},${shoulderY + 4} ${50 + 9},${shoulderY + 2}"
          fill="none" stroke="${pal.robeDark}" stroke-width="2"/>
    ${collar}`;

  // 颈部
  const neck = `<path d="M${50 - 5},${shoulderY - 8} L${50 - 5},${shoulderY + 2} Q50,${shoulderY + 5} ${50 + 5},${shoulderY + 2} L${50 + 5},${shoulderY - 8} Z" fill="${skinShade}"/>`;

  const gid = `pg_${tag}_${gender}_${size}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${tag}头像">
    <defs>
      <radialGradient id="${gid}" cx="50%" cy="38%" r="65%">
        <stop offset="0%" stop-color="${pal.aura}" stop-opacity="0.55"/>
        <stop offset="60%" stop-color="${pal.robeDark}" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#1a1208"/>
      </radialGradient>
      <clipPath id="clip_${gid}"><circle cx="50" cy="50" r="49"/></clipPath>
    </defs>
    <circle cx="50" cy="50" r="49" fill="#1a1208"/>
    <g clip-path="url(#clip_${gid})">
      <rect x="0" y="0" width="100" height="100" fill="url(#${gid})"/>
      ${halo}
      ${robe}
      ${neck}
      <!-- 耳 -->
      <circle cx="35" cy="46" r="2.2" fill="${skinShade}"/>
      <circle cx="65" cy="46" r="2.2" fill="${skinShade}"/>
      <!-- 脸 -->
      <ellipse cx="50" cy="44" rx="14.5" ry="16.5" fill="${skin}"/>
      <ellipse cx="50" cy="50" rx="13" ry="11" fill="${skinShade}" opacity="0.25"/>
      ${blush}
      ${eyes}
      ${brows}
      ${mouth}
      ${hairShape}
      ${motifSvg(pal)}
    </g>
    <circle cx="50" cy="50" r="49" fill="none" stroke="${pal.trim}" stroke-opacity="0.5" stroke-width="2"/>
  </svg>`;
}
