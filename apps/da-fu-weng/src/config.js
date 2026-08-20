// ============================================================================
// 大富翁 · 环游之城 · 全局配置与多地图棋盘数据（纯数据/纯函数，无 DOM 依赖）。
//
// 棋盘：6 张地图，72~118 格。路径不再是单纯的外环方圈：每张图在外环基础上
// 向城市腹地开辟若干「内街」（矩形绕行），棋子会拐进中路再绕回，地图中央不再空旷。
// 地图逐步解锁：在上一张地图夺冠（主角排名第一）后解锁下一张。
// 玩法：双骰前进（对子加掷、连掷三对入狱）→ 购地/升级/交租/垄断加成 →
//       机会命运事件 → 商店购物（顺风骰 / 护身符 / 均富卡）→
//       不设回合上限，破产淘汰，一家独大者胜。
// 棋盘由 buildBoard() 从地图定义确定性生成（无随机），存档只需记 mapKey。
// ============================================================================

// —— 经济常量 ——
export const START_CASH = 2400;      // 初始现金（角色天赋 cash 在此基础上增减）
export const SALARY = 220;           // 经过起点（工资）
export const SALARY_LAND_BONUS = 110; // 恰好落在起点额外奖励
export const JAIL_FINE = 120;        // 落入/被送监狱罚款
export const JAIL_SKIP_TURNS = 1;    // 监狱停掷回合数
export const HOSPITAL_FEE = 140;     // 医药费
export const TAX_RATE = 0.10;        // 税务司：现金比例税
export const TAX_MIN = 50;
export const TAX_MAX = 500;
export const MAX_LEVEL = 3;          // 地产等级（1 购入 / 2 / 3）
export const RENT_MULT = [0, 1, 1.9, 3.0];   // 等级 → 租金倍率
export const MONOPOLY_MULT = 1.5;    // 垄断整街区加成
// —— 城市繁荣（时间压力，非回合上限）：每隔数回合租金普涨一档，
//    保证淘汰制对局能自然收敛（工资不变、租金上涨，坐吃山空者终被淘汰）。
export const BOOM_EVERY = 12;   // 每 12 回合繁荣一档
export const BOOM_RATE = 0.25;  // 每档租金 +25%
export const BOOM_MAX = 10;     // 最多 10 档（封顶 ×3.5，确保残局收敛）
export function boomMult(round) {
  return 1 + BOOM_RATE * Math.min(BOOM_MAX, Math.floor(((round || 1) - 1) / BOOM_EVERY));
}
export const UPGRADE_RATE = [0, 0.6, 0.8];   // 升到 2/3 级的花费（占地价比例）
export const SELL_RATE = 0.5;        // 抵债变卖回收比例（相对累计投入）
export const AI_SAFE_CASH = 180;     // AI 买地后需保留的现金
export const AI_UPGRADE_CASH = 360;  // AI 升级后需保留的现金

// —— 通用街区配色（各地图街区引用这里的色板，保持全图视觉统一）——
export const PALETTE = {
  gray: '#8a9aa5', teal: '#4fa3a8', green: '#5fa85f',
  blue: '#4a90d9', purple: '#9b78c4', red: '#c85a4a', brown: '#a1785a', gold: '#d4a84b',
  pink: '#c47ba0', indigo: '#6a7ac0',
};

// ============================================================================
// 地图定义：cols×rows 网格。streets：内街绕行（edge = 所在外边，按行进方向；
// at = 沿边已走过的格数（含出发角），depth = 向内深入格数，width = 内街跨度）。
// 每条内街让路径多走 2×depth 格，并在外边上「让出」一段形成凹口。
// districts：街区（color 引用 PALETTE，price 为基准地价，names 为地块名池，
// 不够时回退「街区名·N号铺」）。deco：腹地空格的点缀风景。
// ============================================================================
export const MAPS = [
  {
    key: 'oldtown', name: '老城市井', subtitle: '七十二格 · 初出茅庐',
    cols: 16, rows: 11, unlock: null, deco: ['🌳', '🏡', '⛲'],
    streets: [
      { edge: 'bottom', at: 4, depth: 3, width: 6 },
      { edge: 'right', at: 5, depth: 3, width: 5 },
      { edge: 'top', at: 6, depth: 3, width: 5 },
      { edge: 'left', at: 5, depth: 2, width: 4 },
    ],
    districts: [
      { key: 'a', name: '市井坊', color: 'gray', price: 80, names: ['小吃街', '布庄', '茶馆', '钱庄', '当铺', '杂货巷', '脚店', '香烛铺'] },
      { key: 'b', name: '工匠里', color: 'brown', price: 130, names: ['铁匠铺', '木器行', '染坊', '瓷窑', '灯笼铺', '纸扎店', '铜锡铺', '皮作坊'] },
      { key: 'c', name: '文墨巷', color: 'green', price: 190, names: ['书肆', '笔墨斋', '画舫', '碑林', '琴社', '扇庄', '裱画铺'] },
      { key: 'd', name: '城心坊', color: 'gold', price: 270, names: ['钟楼街', '城隍庙', '府衙前街', '鼓楼夜市', '旗牌坊', '官井胡同'] },
      { key: 'e', name: '贵人坊', color: 'pink', price: 350, names: ['绸缎庄', '金玉阁', '大宅门', '戏楼', '脂粉铺', '绸机坊'] },
    ],
  },
  {
    key: 'port', name: '港都商埠', subtitle: '八十二格 · 通衢四海',
    cols: 18, rows: 12, unlock: 'oldtown', deco: ['⚓', '🌊', '🐟'],
    streets: [
      { edge: 'bottom', at: 5, depth: 3, width: 7 },
      { edge: 'right', at: 6, depth: 4, width: 5 },
      { edge: 'top', at: 7, depth: 3, width: 8 },
      { edge: 'left', at: 5, depth: 3, width: 6 },
    ],
    districts: [
      { key: 'a', name: '渔火湾', color: 'teal', price: 90, names: ['渔市', '灯塔下', '晒网滩', '蚝田', '船具铺', '咸鱼栈', '网匠屋'] },
      { key: 'b', name: '码头仓', color: 'brown', price: 150, names: ['一号栈桥', '货栈', '关税房', '吊塔场', '麻绳行', '驳船坞', '苦力棚'] },
      { key: 'c', name: '商馆街', color: 'blue', price: 210, names: ['商会大楼', '洋行', '银行', '保险行', '拍卖所', '电报局', '邮船公司'] },
      { key: 'd', name: '船坞区', color: 'indigo', price: 280, names: ['龙骨厂', '帆具坊', '船渠', '锚链铺', '桅杆场', '沥青工坊'] },
      { key: 'e', name: '珍珠坊', color: 'pink', price: 360, names: ['珠贝行', '香料铺', '丝绸仓', '茶库', '珊瑚阁', '蚌壳市'] },
      { key: 'f', name: '总督府', color: 'gold', price: 440, names: ['总督官邸', '海关大楼', '凯旋门', '炮台军营', '领事馆'] },
    ],
  },
  {
    key: 'academy', name: '学府文华', subtitle: '九十格 · 书香满城',
    cols: 19, rows: 13, unlock: 'port', deco: ['🌲', '📜', '⛩️'],
    streets: [
      { edge: 'bottom', at: 5, depth: 4, width: 8 },
      { edge: 'right', at: 7, depth: 4, width: 5 },
      { edge: 'top', at: 8, depth: 4, width: 8 },
      { edge: 'left', at: 6, depth: 3, width: 6 },
    ],
    districts: [
      { key: 'a', name: '蒙学巷', color: 'green', price: 100, names: ['村塾', '字铺', '幼学馆', '笔庄', '蒙童舍', '算盘行', '书童巷'] },
      { key: 'b', name: '书院区', color: 'teal', price: 170, names: ['明伦堂', '藏书楼', '碑廊', '讲经台', '号舍', '山长宅', '射圃场'] },
      { key: 'c', name: '百工坊', color: 'brown', price: 230, names: ['格物院', '算学馆', '观星台', '医馆', '药圃', '水力工坊', '浑天房'] },
      { key: 'd', name: '翰林街', color: 'purple', price: 300, names: ['翰林院', '文渊阁', '贡院', '状元坊', '侍讲宅', '兰台库'] },
      { key: 'e', name: '雅集苑', color: 'pink', price: 380, names: ['曲水亭', '诗社', '棋院', '画舫', '乐坊', '花斛斋'] },
      { key: 'f', name: '辟雍环', color: 'gold', price: 470, names: ['辟雍大殿', '祭酒府', '琉璃门', '石经林', '圜桥'] },
    ],
  },
  {
    key: 'snow', name: '北境雪原', subtitle: '九十六格 · 冰天商路',
    cols: 21, rows: 14, unlock: 'academy', deco: ['🏔️', '🌲', '❄️'],
    streets: [
      { edge: 'bottom', at: 6, depth: 4, width: 9 },
      { edge: 'right', at: 7, depth: 4, width: 6 },
      { edge: 'top', at: 8, depth: 4, width: 9 },
      { edge: 'left', at: 7, depth: 3, width: 6 },
    ],
    districts: [
      { key: 'a', name: '边哨集', color: 'gray', price: 110, names: ['皮货摊', '雪橇行', '哨站', '暖酒铺', '驿站马厩', '冰砖窖'] },
      { key: 'b', name: '松林猎场', color: 'green', price: 180, names: ['猎屋', '熏肉坊', '兽皮庄', '弓匠铺', '陷阱场', '驯鹿圈'] },
      { key: 'c', name: '冰湖渡', color: 'blue', price: 250, names: ['冰渡口', '凿冰营', '鱼仓', '雪橇驿', '暖炉驿', '冰灯集市'] },
      { key: 'd', name: '矿脉镇', color: 'brown', price: 320, names: ['铁矿场', '熔炉堡', '工匠营', '煤市', '矿工澡堂', '卷扬机房'] },
      { key: 'e', name: '温泉邑', color: 'pink', price: 400, names: ['汤泉馆', '疗养院', '雪月楼', '雾凇阁', '药浴堂'] },
      { key: 'f', name: '风雪关', color: 'indigo', price: 480, names: ['关城', '烽火台', '戍堡', '雪桥', '马面楼', '角楼哨所'] },
      { key: 'g', name: '极光台', color: 'purple', price: 560, names: ['极光祭坛', '观象台', '冰晶宫', '霜语塔'] },
    ],
  },
  {
    key: 'royal', name: '王城中枢', subtitle: '一百零八格 · 帝辇之下',
    cols: 22, rows: 16, unlock: 'snow', deco: ['🏮', '🏯', '🌳'],
    streets: [
      { edge: 'bottom', at: 6, depth: 5, width: 10 },
      { edge: 'right', at: 9, depth: 4, width: 6 },
      { edge: 'top', at: 9, depth: 5, width: 10 },
      { edge: 'left', at: 8, depth: 4, width: 7 },
    ],
    districts: [
      { key: 'a', name: '外郭市', color: 'gray', price: 130, names: ['柴市', '米市', '菜市口', '骡马巷', '瓦子棚', '夜市摊'] },
      { key: 'b', name: '皇商坊', color: 'teal', price: 200, names: ['官盐号', '皇店', '织造局', '贡品行', '铜场监', '漕运司'] },
      { key: 'c', name: '军营卫', color: 'indigo', price: 270, names: ['演武场', '兵械库', '点将台', '箭楼', '马军营', '辎重营'] },
      { key: 'd', name: '寺塔街', color: 'purple', price: 340, names: ['大相国寺', '浮屠塔', '香市', '经坊', '戒坛院', '罗汉堂'] },
      { key: 'e', name: '御沟沿', color: 'green', price: 410, names: ['金水桥', '御沟柳岸', '琼岛春荫', '芳林苑', '假山园'] },
      { key: 'f', name: '朱雀街', color: 'red', price: 490, names: ['朱雀大街', '御街千步廊', '州桥夜市', '曲苑', '酒旗楼', '相国寺桥'] },
      { key: 'g', name: '宫城根', color: 'gold', price: 580, names: ['东华门', '角楼', '秘阁', '御苑', '漏泽园', '叩阙亭'] },
    ],
  },
  {
    key: 'jiuzhou', name: '九州环游', subtitle: '一百一十八格 · 天下为棋',
    cols: 24, rows: 18, unlock: 'royal', deco: ['⛰️', '⛵', '🌾'],
    streets: [
      { edge: 'bottom', at: 7, depth: 5, width: 11 },
      { edge: 'right', at: 10, depth: 5, width: 7 },
      { edge: 'top', at: 10, depth: 5, width: 11 },
      { edge: 'left', at: 9, depth: 4, width: 8 },
    ],
    districts: [
      { key: 'a', name: '中原道', color: 'gold', price: 150, names: ['洛阳花市', '汴河堰', '嵩阳书院', '官渡栈', '河阳仓', '孟津渡'] },
      { key: 'b', name: '江南道', color: 'green', price: 220, names: ['苏杭绸庄', '金陵渡', '扬州茶社', '会稽兰亭', '钱塘潮肆', '震泽渔村', '京口烽火'] },
      { key: 'c', name: '蜀栈道', color: 'brown', price: 290, names: ['剑门关', '锦官坊', '蜀锦局', '栈桥驿', '青城观', '嘉陵渡'] },
      { key: 'd', name: '岭南道', color: 'teal', price: 360, names: ['广州蕃坊', '珠市', '荔枝庄', '香料坞', '番船澳', '椰风墟'] },
      { key: 'e', name: '朔方道', color: 'gray', price: 430, names: ['阴山牧场', '受降城', '马市', '皮毛栈', '盐池寨', '烽燧线'] },
      { key: 'f', name: '西域道', color: 'purple', price: 500, names: ['玉门关', '敦煌石窟', '丝路驼铃', '楼兰墟', '阳关邸', '蒲桃园'] },
      { key: 'g', name: '沧海事', color: 'blue', price: 570, names: ['蓬莱渡', '市舶司', '妈祖庙', '鲸波台', '盐场栅', '望海楼'] },
      { key: 'h', name: '蓬莱境', color: 'pink', price: 650, names: ['瀛洲阁', '方丈山', '瑶池圃', '紫芝田'] },
    ],
  },
];

const MAP_MAP = Object.fromEntries(MAPS.map((m) => [m.key, m]));
export function mapDefOf(key) { return MAP_MAP[key] || MAPS[0]; }

// ============================================================================
// 路径生成：外环 + 内街绕行 → 闭环格子序列（顺时针，起点在左下角）。
// 行进：下边左→右，右边下→上，上边右→左，左边上→下，首尾相接。
// 每条内街 = 「拐入腹地 → 沿内街走 → 拐回外边」，多走 2×depth 格。
// ============================================================================
const PATH_CACHE = new Map();

export function buildPath(map) {
  const m = map || MAPS[0];
  const C = m.cols, R = m.rows;
  const cells = [];
  const used = new Set();
  const push = (row, col) => {
    if (row < 1 || row > R || col < 1 || col > C) throw new Error(`越界 ${row},${col}`);
    const k = `${row}:${col}`;
    if (used.has(k)) throw new Error(`路径冲突 ${k}`);
    used.add(k);
    cells.push({ row, col });
  };
  const detourAt = (edge, at) => (m.streets || []).find((s) => s.edge === edge && s.at === at);
  const walk = () => {
    // 下边（左→右）：入口 (R, at)，上拐 depth 格 → 内街 → 下拐回 (R, at+width-1)
    for (let c = 1; c <= C; c++) {
      push(R, c);
      const d = detourAt('bottom', c);
      if (!d) continue;
      if (d.at < 2 || d.at + d.width > C || d.depth > R - 2) throw new Error('bottom 参数越界');
      for (let r = R - 1; r >= R - d.depth; r--) push(r, c);
      for (let cc = c + 1; cc <= c + d.width - 1; cc++) push(R - d.depth, cc);
      for (let r = R - d.depth + 1; r <= R; r++) push(r, c + d.width - 1);
      c = c + d.width - 1;
    }
    // 右边（下→上）：入口 (R-at, C)，左拐 depth 格 → 内街上行 → 右拐回 (R-at-width+1, C)
    for (let r = R - 1; r >= 1; r--) {
      push(r, C);
      const d = detourAt('right', R - r);
      if (!d) continue;
      if (d.at < 1 || d.at + d.width > R - 1 || d.depth > C - 2) throw new Error('right 参数越界');
      for (let c = C - 1; c >= C - d.depth; c--) push(r, c);
      for (let rr = r - 1; rr >= r - d.width + 1; rr--) push(rr, C - d.depth);
      for (let c = C - d.depth + 1; c <= C; c++) push(r - d.width + 1, c);
      r = r - d.width + 1;
    }
    // 上边（右→左）：入口 (1, C-at)，下拐 depth 格 → 内街左行 → 上拐回 (1, C-at-width+1)
    for (let c = C - 1; c >= 1; c--) {
      push(1, c);
      const d = detourAt('top', C - c);
      if (!d) continue;
      if (d.at < 1 || d.at + d.width > C - 1 || d.depth > R - 2) throw new Error('top 参数越界');
      for (let r = 2; r <= 1 + d.depth; r++) push(r, c);
      for (let cc = c - 1; cc >= c - d.width + 1; cc--) push(1 + d.depth, cc);
      for (let r = d.depth; r >= 1; r--) push(r, c - d.width + 1);
      c = c - d.width + 1;
    }
    // 左边（上→下，止于起点前一格）：入口 (1+at, 1)，右拐 depth 格 → 内街下行 → 左拐回
    for (let r = 2; r <= R - 1; r++) {
      push(r, 1);
      const d = detourAt('left', r - 1);
      if (!d) continue;
      if (d.at < 1 || d.at + d.width > R - 1 || d.depth > C - 2) throw new Error('left 参数越界');
      for (let c = 2; c <= 1 + d.depth; c++) push(r, c);
      for (let rr = r + 1; rr <= r + d.width - 1; rr++) push(rr, 1 + d.depth);
      for (let c = d.depth; c >= 1; c--) push(r + d.width - 1, c);
      r = r + d.width - 1;
    }
  };
  try {
    walk();
  } catch (_) {
    // 兜底：内街参数异常时退回纯外环（防御性，正常数据不会触发）
    return buildPath({ ...m, streets: [] });
  }
  return cells;
}

export function pathOf(map) {
  const m = map || MAPS[0];
  if (!PATH_CACHE.has(m.key)) PATH_CACHE.set(m.key, buildPath(m));
  return PATH_CACHE.get(m.key);
}
export const tileCountOf = (map) => pathOf(map).length;
export const tileGrid = (i, map) => {
  const path = pathOf(map);
  return path[((i % path.length) + path.length) % path.length];
};

// 腹地空格点缀（不参与行进，纯风景）：确定性散布，让地图中央不空
export function decoCells(map) {
  const m = map || MAPS[0];
  const path = pathOf(m);
  const used = new Set(path.map((g) => (g.row - 1) * m.cols + (g.col - 1)));
  const theme = m.deco && m.deco.length ? m.deco : ['🌳', '🏡', '⛲'];
  const out = [];
  for (let r = 2; r <= m.rows - 1; r++) {
    for (let c = 2; c <= m.cols - 1; c++) {
      if (used.has((r - 1) * m.cols + (c - 1))) continue;
      if ((r * 7 + c * 13) % 5 !== 0) continue;
      out.push({ row: r, col: c, icon: theme[(r + c) % theme.length] });
    }
  }
  return out;
}

// —— 棋盘生成（确定性，无随机）：四角特殊格，其余按固定节奏布商店/机会/命运/税，
//    剩下全是地产，按街区顺序分段、段内地价递增。——
const SPECIALS = { start: '🚩', jail: '⛓️', hospital: '🏥', park: '🌸', chance: '❓', fate: '🔮', tax: '💰', shop: '🛒' };
const SPECIAL_NAMES = { start: '起点', jail: '监狱', hospital: '医院', park: '御园', chance: '机会', fate: '命运', tax: '税务司', shop: '商店' };

export function buildBoard(mapDef) {
  const m = mapDef || MAPS[0];
  const path = pathOf(m);
  const n = path.length;
  // 四角：起点=左下（索引 0），监狱=右下，医院=右上，御园=左上（按路径坐标定位）
  const at = (row, col) => path.findIndex((g) => g.row === row && g.col === col);
  const corners = {
    0: 'start',
    [at(m.rows, m.cols)]: 'jail',
    [at(1, m.cols)]: 'hospital',
    [at(1, 1)]: 'park',
  };
  const types = new Array(n).fill('prop');
  for (const [k, t] of Object.entries(corners)) types[Number(k)] = t;
  for (let i = 0; i < n; i++) {
    if (types[i] !== 'prop') continue;
    if (i % 13 === 6) types[i] = 'shop';
    else if (i % 9 === 4) types[i] = 'chance';
    else if (i % 9 === 7) types[i] = 'fate';
    else if (i % 17 === 9) types[i] = 'tax';
  }
  // 地产分段归属街区：地产序列按街区顺序均分（余数给前面的街区）
  const propIdx = types.map((t, i) => (t === 'prop' ? i : -1)).filter((i) => i >= 0);
  const dists = m.districts;
  const per = Math.floor(propIdx.length / dists.length);
  let extra = propIdx.length - per * dists.length;
  const segOf = new Array(propIdx.length).fill(0);
  let p = 0;
  for (let d = 0; d < dists.length; d++) {
    const len = per + (extra > 0 ? 1 : 0);
    if (extra > 0) extra--;
    for (let j = 0; j < len; j++) segOf[p + j] = d;
    p += len;
  }
  const segStartAt = dists.map((_, d) => segOf.findIndex((s) => s === d));
  const nameUsed = new Map();
  return types.map((t, i) => {
    if (t !== 'prop') return { type: t, name: SPECIAL_NAMES[t], icon: SPECIALS[t] };
    const k = propIdx.indexOf(i);
    const seg = segOf[k];
    const dist = dists[seg];
    const inSeg = k - segStartAt[seg];
    const used = nameUsed.get(dist.key) || 0;
    const price = Math.round((dist.price * (1 + 0.14 * inSeg)) / 10) * 10;
    const name = used < dist.names.length ? dist.names[used] : `${dist.name}·${used + 1}号铺`;
    nameUsed.set(dist.key, used + 1);
    return { type: 'prop', name, district: seg, price };
  });
}

// 预生成全部棋盘（模块级缓存，确定性：同 key 恒同棋盘）
const BOARD_CACHE = new Map(MAPS.map((m) => [m.key, buildBoard(m)]));
export function boardOf(mapKey) { return BOARD_CACHE.get(mapKey) || BOARD_CACHE.get(MAPS[0].key); }

export function tilesOf(state) { return boardOf(state && state.mapKey); }
export const PROP_TILES = (mapKey) => boardOf(mapKey).map((t, i) => (t.type === 'prop' ? i : -1)).filter((i) => i >= 0);
export function findTile(state, type) {
  const tiles = boardOf(state && state.mapKey);
  for (let i = 0; i < tiles.length; i++) if (tiles[i].type === type) return i;
  return -1;
}

// —— 商店道具（落地商店格可购；均设上限，防止无脑堆叠）——
export const SWIFT_BONUS = 2;   // 顺风骰：每次掷骰额外步数
export const SWIFT_TURNS = 3;   // 每购一次生效的掷骰次数
export const SWIFT_CAP = 6;     // 顺风骰效果叠加上限（次数）
export const CHARM_CAP = 2;     // 护身符持有上限（枚）
export const EQUAL_CAP = 2;     // 均富卡每局限购（张）
export const SHOP_ITEMS = [
  { id: 'swift', name: '顺风骰', icon: '🌬️', price: 140, desc: `接下来 ${SWIFT_TURNS} 次掷骰各多走 ${SWIFT_BONUS} 步（最多叠加 ${SWIFT_CAP} 次）` },
  { id: 'charm', name: '护身符', icon: '🧿', price: 120, desc: `自动抵消一次落地租金（最多持有 ${CHARM_CAP} 枚）` },
  { id: 'equal', name: '均富卡', icon: '🎴', price: 260, desc: `立即与最富的对手平分双方现金（每局限购 ${EQUAL_CAP} 张）` },
];

// —— 机会卡 / 命运卡（goto 目标为象征名，运行期按地图解析）——
export const CHANCE_CARDS = [
  { id: 'c_gain', text: '路遇钱袋，拾金不昧得了谢礼', effect: { kind: 'cash', amount: 160 } },
  { id: 'c_loss', text: '钱袋破了个洞，洒了一路', effect: { kind: 'cash', amount: -110 } },
  { id: 'c_start', text: '顺风车直发起点，顺路领了工资', effect: { kind: 'goto', tile: 'start' } },
  { id: 'c_back', text: '想起东西落下了，折返三格', effect: { kind: 'move', steps: -3 } },
  { id: 'c_skip', text: '街头杂耍太精彩，看忘了时辰', effect: { kind: 'skip' } },
  { id: 'c_birthday', text: '今日生辰，众人凑了贺礼', effect: { kind: 'take_all', amount: 60 } },
  { id: 'c_treat', text: '喜从天降，请全城好友吃饭', effect: { kind: 'give_all', amount: 60 } },
  { id: 'c_award', text: '市政嘉奖：一处产业免费翻新', effect: { kind: 'upgrade_free' } },
];

export const FATE_CARDS = [
  { id: 'f_lottery', text: '彩券中奖，天降横财', effect: { kind: 'cash', amount: 220 } },
  { id: 'f_ill', text: '偶感风寒，抓药破财', effect: { kind: 'cash', amount: -160 } },
  { id: 'f_hospital', text: '旧疾复发，被送进医院', effect: { kind: 'goto', tile: 'hospital' } },
  { id: 'f_jail', text: '被误认为飞贼，押入大牢', effect: { kind: 'goto', tile: 'jail' } },
  { id: 'f_refund', text: '税务司算错账，退款到账', effect: { kind: 'cash', amount: 130 } },
  { id: 'f_rentday', text: '收租日！众人都来孝敬', effect: { kind: 'take_all', amount: 50 } },
  { id: 'f_charity', text: '慈善义卖，捐给最富的对手', effect: { kind: 'give_rich', amount: 100 } },
  { id: 'f_dividend', text: '产业分红，遍地生金', effect: { kind: 'dividend', amount: 40 } },
];

// —— 可选主角（开罗风形象引用共享素材库 _lib/kairo.js 的 preset）——
// perk 天赋（每位角色不同，选人有意义）：
//   cash  开局额外本金；luck  骰运（低点 1~2 有概率重掷一次）；
//   trade 购地折扣；tough 罚款类开支（监狱/医院）减免比例。
export const CHARACTERS = [
  {
    key: 'boy', name: '阿诚', title: '热血少年', tag: '骰运亨通',
    desc: '掷骰时点数 1~2 有 30% 概率重掷一次，天生脚程顺遂。',
    perk: { luck: 0.30 }, look: { preset: 'boy', name: '阿诚' },
  },
  {
    key: 'girl', name: '小蛮', title: '机灵少女', tag: '购地八五折',
    desc: '买地永久享受 85 折优惠，精明会过日子。',
    perk: { trade: 0.15 }, look: { preset: 'girl', name: '小蛮' },
  },
  {
    key: 'sword', name: '剑侠', title: '行侠仗义', tag: '罚金减半',
    desc: '监狱罚款与医药费一律减半，皮糙肉厚不怕事。',
    perk: { tough: 0.5 }, look: { preset: 'swordsman', body: '#3a6ea5', name: '剑侠' },
  },
  {
    key: 'lady', name: '千金', title: '商贾世家', tag: '本金 +600',
    desc: '家里有矿，开局额外携带 600 现金，家底就是底气。',
    perk: { cash: 600 }, look: { preset: 'woman', name: '千金' },
  },
];

// —— AI 对手池（同样各怀天赋，对局风味各异）——
export const AI_CHARACTERS = [
  { key: 'tycoon', name: '钱老板', tag: '家底殷实', perk: { cash: 500, trade: 0.10 }, look: { preset: 'king', body: '#6a4a9a', name: '钱老板' } },
  { key: 'ninja', name: '夜行客', tag: '身手矫健', perk: { tough: 0.6, luck: 0.10 }, look: { preset: 'ninja', name: '夜行客' } },
  { key: 'fox', name: '胡三姨', tag: '福星高照', perk: { luck: 0.35, cash: -200 }, look: { preset: 'foxSpirit', name: '胡三姨' } },
  { key: 'sage', name: '白先生', tag: '精于算计', perk: { trade: 0.15, cash: 200 }, look: { preset: 'sage', body: '#5a6a8a', name: '白先生' } },
];

// 玩家棋子底色（区分度优先，色相环取色）
export const CHIP_COLORS = ['#4a90d9', '#e06b6b', '#5fd0a0', '#d4a84b'];

// —— 纯函数：经济数值 ——
export function baseRent(tile) {
  return Math.round(tile.price * 0.3);
}
export function rentOf(tile, level, hasMonopoly) {
  const base = baseRent(tile);
  const rent = Math.round(base * (RENT_MULT[level] || 0));
  return hasMonopoly ? Math.round(rent * MONOPOLY_MULT) : rent;
}
export function upgradeCost(tile, level) {
  // level → level+1 的花费（1→2 与 2→3）
  return Math.round(tile.price * (UPGRADE_RATE[level] || 0));
}
export function taxOf(cash) {
  return Math.max(TAX_MIN, Math.min(TAX_MAX, Math.round(cash * TAX_RATE)));
}
