// ============================================================================
// 大富翁 · 环游之城 · 全局配置与多地图棋盘数据（纯数据/纯函数，无 DOM 依赖）。
//
// 棋盘：6 张地图，外环 50~80 格（列×行网格的周长），顺时针从左下角「起点」出发。
// 地图逐步解锁：在上一张地图夺冠（主角排名第一）后解锁下一张。
// 棋盘由 buildBoard() 从地图定义确定性生成（无随机），存档只需记 mapKey。
// 玩法：掷骰前进 → 购地/升级/交租 → 机会命运事件 → 破产淘汰或回合上限结算首富。
// ============================================================================

// —— 经济常量 ——
export const START_CASH = 2400;      // 初始现金
export const SALARY = 260;           // 经过起点（工资）
export const SALARY_LAND_BONUS = 120; // 恰好落在起点额外奖励
export const JAIL_FINE = 120;        // 落入/被送监狱罚款
export const JAIL_SKIP_TURNS = 1;    // 监狱停掷回合数
export const HOSPITAL_FEE = 140;     // 医药费
export const TAX_RATE = 0.10;        // 税务司：现金比例税
export const TAX_MIN = 50;
export const TAX_MAX = 500;
export const MAX_LEVEL = 3;          // 地产等级（1 购入 / 2 / 3）
export const RENT_MULT = [0, 1, 1.9, 3.0];   // 等级 → 租金倍率
export const MONOPOLY_MULT = 1.5;    // 垄断整街区加成
export const UPGRADE_RATE = [0, 0.6, 0.8];   // 升到 2/3 级的花费（占地价比例）
export const SELL_RATE = 0.5;        // 抵债变卖回收比例（相对累计投入）
export const AI_SAFE_CASH = 180;     // AI 买地后需保留的现金
export const AI_UPGRADE_CASH = 360;  // AI 升级后需保留的现金

// —— 通用街区配色（各地图街区引用这里的色板，保持全图视觉统一）——
export const PALETTE = {
  gray: '#8a9aa5', teal: '#4fa3a8', green: '#5fa85f', blue: '#4a90d9',
  purple: '#9b78c4', red: '#c85a4a', brown: '#a1785a', gold: '#d4a84b',
  pink: '#c47ba0', indigo: '#6a7ac0',
};

// ============================================================================
// 地图定义：cols×rows 网格外环 = 2*(cols+rows)-4 格。
// rounds：回合上限；districts：街区（color 引用 PALETTE，price 为基准地价，
// names 为地块名池，不够时回退「街区名·N号铺」）。
// ============================================================================
export const MAPS = [
  {
    key: 'oldtown', name: '老城市井', subtitle: '五十格 · 初出茅庐',
    cols: 16, rows: 11, rounds: 22, unlock: null,
    districts: [
      { key: 'a', name: '市井坊', color: 'gray', price: 80, names: ['小吃街', '布庄', '茶馆', '钱庄', '当铺', '杂货巷'] },
      { key: 'b', name: '工匠里', color: 'brown', price: 130, names: ['铁匠铺', '木器行', '染坊', '瓷窑', '灯笼铺', '纸扎店'] },
      { key: 'c', name: '文墨巷', color: 'green', price: 190, names: ['书肆', '笔墨斋', '画舫', '碑林', '琴社'] },
      { key: 'd', name: '城心坊', color: 'gold', price: 270, names: ['钟楼街', '城隍庙', '府衙前街', '鼓楼夜市'] },
      { key: 'e', name: '贵人坊', color: 'pink', price: 350, names: ['绸缎庄', '金玉阁', '大宅门', '戏楼'] },
    ],
  },
  {
    key: 'port', name: '港都商埠', subtitle: '五十六格 · 通衢四海',
    cols: 18, rows: 12, rounds: 24, unlock: 'oldtown',
    districts: [
      { key: 'a', name: '渔火湾', color: 'teal', price: 90, names: ['渔市', '灯塔下', '晒网滩', '蚝田', '船具铺'] },
      { key: 'b', name: '码头仓', color: 'brown', price: 150, names: ['一号栈桥', '货栈', '关税房', '吊塔场', '麻绳行'] },
      { key: 'c', name: '商馆街', color: 'blue', price: 210, names: ['商会大楼', '洋行', '银行', '保险行', '拍卖所'] },
      { key: 'd', name: '船坞区', color: 'indigo', price: 280, names: ['龙骨厂', '帆具坊', '船渠', '锚链铺'] },
      { key: 'e', name: '珍珠坊', color: 'pink', price: 360, names: ['珠贝行', '香料铺', '丝绸仓', '茶库'] },
      { key: 'f', name: '总督府', color: 'gold', price: 440, names: ['总督官邸', '海关大楼', '凯旋门'] },
    ],
  },
  {
    key: 'academy', name: '学府文华', subtitle: '六十格 · 书香满城',
    cols: 19, rows: 13, rounds: 26, unlock: 'port',
    districts: [
      { key: 'a', name: '蒙学巷', color: 'green', price: 100, names: ['村塾', '字铺', '幼学馆', '笔庄'] },
      { key: 'b', name: '书院区', color: 'teal', price: 170, names: ['明伦堂', '藏书楼', '碑廊', '讲经台', '号舍'] },
      { key: 'c', name: '百工坊', color: 'brown', price: 230, names: ['格物院', '算学馆', '观星台', '医馆', '药圃'] },
      { key: 'd', name: '翰林街', color: 'purple', price: 300, names: ['翰林院', '文渊阁', '贡院', '状元坊'] },
      { key: 'e', name: '雅集苑', color: 'pink', price: 380, names: ['曲水亭', '诗社', '棋院', '画舫'] },
      { key: 'f', name: '辟雍环', color: 'gold', price: 470, names: ['辟雍大殿', '祭酒府', '琉璃门'] },
    ],
  },
  {
    key: 'snow', name: '北境雪原', subtitle: '六十六格 · 冰天商路',
    cols: 21, rows: 14, rounds: 28, unlock: 'academy',
    districts: [
      { key: 'a', name: '边哨集', color: 'gray', price: 110, names: ['皮货摊', '雪橇行', '哨站', '暖酒铺'] },
      { key: 'b', name: '松林猎场', color: 'green', price: 180, names: ['猎屋', '熏肉坊', '兽皮庄', '弓匠铺', '陷阱场'] },
      { key: 'c', name: '冰湖渡', color: 'blue', price: 250, names: ['冰渡口', '凿冰营', '鱼仓', '雪橇驿', '暖炉驿'] },
      { key: 'd', name: '矿脉镇', color: 'brown', price: 320, names: ['铁矿场', '熔炉堡', '工匠营', '煤市'] },
      { key: 'e', name: '温泉邑', color: 'pink', price: 400, names: ['汤泉馆', '疗养院', '雪月楼'] },
      { key: 'f', name: '风雪关', color: 'indigo', price: 480, names: ['关城', '烽火台', '戍堡', '雪桥'] },
      { key: 'g', name: '极光台', color: 'purple', price: 560, names: ['极光祭坛', '观象台', '冰晶宫'] },
    ],
  },
  {
    key: 'royal', name: '王城中枢', subtitle: '七十二格 · 帝辇之下',
    cols: 22, rows: 16, rounds: 30, unlock: 'snow',
    districts: [
      { key: 'a', name: '外郭市', color: 'gray', price: 130, names: ['柴市', '米市', '菜市口', '骡马巷'] },
      { key: 'b', name: '皇商坊', color: 'teal', price: 200, names: ['官盐号', '皇店', '织造局', '贡品行'] },
      { key: 'c', name: '军营卫', color: 'indigo', price: 270, names: ['演武场', '兵械库', '点将台', '箭楼'] },
      { key: 'd', name: '寺塔街', color: 'purple', price: 340, names: ['大相国寺', '浮屠塔', '香市', '经坊'] },
      { key: 'e', name: '御沟沿', color: 'green', price: 410, names: ['金水桥', '御沟柳岸', '琼岛春荫'] },
      { key: 'f', name: '朱雀街', color: 'red', price: 490, names: ['朱雀大街', '御街千步廊', '州桥夜市', '曲苑'] },
      { key: 'g', name: '宫城根', color: 'gold', price: 580, names: ['东华门', '角楼', '秘阁', '御苑'] },
    ],
  },
  {
    key: 'jiuzhou', name: '九州环游', subtitle: '八十格 · 天下为棋',
    cols: 24, rows: 18, rounds: 32, unlock: 'royal',
    districts: [
      { key: 'a', name: '中原道', color: 'gold', price: 150, names: ['洛阳花市', '汴河堰', '嵩阳书院', '官渡栈'] },
      { key: 'b', name: '江南道', color: 'green', price: 220, names: ['苏杭绸庄', '金陵渡', '扬州茶社', '会稽兰亭', '钱塘潮肆'] },
      { key: 'c', name: '蜀栈道', color: 'brown', price: 290, names: ['剑门关', '锦官坊', '蜀锦局', '栈桥驿'] },
      { key: 'd', name: '岭南道', color: 'teal', price: 360, names: ['广州蕃坊', '珠市', '荔枝庄', '香料坞'] },
      { key: 'e', name: '朔方道', color: 'gray', price: 430, names: ['阴山牧场', '受降城', '马市', '皮毛栈'] },
      { key: 'f', name: '西域道', color: 'purple', price: 500, names: ['玉门关', '敦煌石窟', '丝路驼铃', '楼兰墟'] },
      { key: 'g', name: '沧海事', color: 'blue', price: 570, names: ['蓬莱渡', '市舶司', '妈祖庙', '鲸波台'] },
      { key: 'h', name: '蓬莱境', color: 'pink', price: 650, names: ['瀛洲阁', '方丈山', '瑶池圃'] },
    ],
  },
];

const MAP_MAP = Object.fromEntries(MAPS.map((m) => [m.key, m]));
export function mapDefOf(key) { return MAP_MAP[key] || MAPS[0]; }
export const perimeterOf = (m) => 2 * (m.cols + m.rows) - 4;

// 棋盘索引 → 网格坐标（顺时针：下排左→右、右列下→上、上排右→左、左列上→下）
export function tileGrid(i, cols = MAPS[0].cols, rows = MAPS[0].rows) {
  const perim = 2 * (cols + rows) - 4;
  const k = ((i % perim) + perim) % perim;
  if (k < cols) return { row: rows, col: k + 1 };                          // 下排（左→右）
  if (k < cols + rows - 2) return { row: rows - (k - cols) - 1, col: cols }; // 右列（下→上）
  if (k < 2 * cols + rows - 2) return { row: 1, col: 2 * cols + rows - 2 - k }; // 上排（右→左）
  return { row: k - (2 * cols + rows - 2) + 2, col: 1 };                   // 左列（上→下）
}

// —— 棋盘生成（确定性，无随机）：四角特殊格，其余按固定节奏布机会/命运/税，
//    剩下全是地产，按街区顺序分段、段内地价递增。——
const SPECIALS = { start: '🚩', jail: '⛓️', hospital: '🏥', park: '🌸', chance: '❓', fate: '🔮', tax: '💰' };
const SPECIAL_NAMES = { start: '起点', jail: '监狱', hospital: '医院', park: '御园', chance: '机会', fate: '命运', tax: '税务司' };

export function buildBoard(mapDef) {
  const m = mapDef || MAPS[0];
  const n = perimeterOf(m);
  const corners = {
    0: 'start',                                  // 左下角：起点
    [m.cols - 1]: 'jail',                        // 右下角：监狱
    [m.cols + m.rows - 2]: 'hospital',           // 右上角：医院
    [2 * m.cols + m.rows - 3]: 'park',           // 左上角：御园
  };
  const types = new Array(n).fill('prop');
  for (const [k, t] of Object.entries(corners)) types[Number(k)] = t;
  for (let i = 0; i < n; i++) {
    if (types[i] !== 'prop') continue;
    if (i % 9 === 4) types[i] = 'chance';
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
export const TILES = BOARD_CACHE.get(MAPS[0].key); // 兼容旧引用（默认地图）
export const TILE_COUNT = TILES.length;

export function tilesOf(state) { return boardOf(state && state.mapKey); }
export const PROP_TILES = (mapKey) => boardOf(mapKey).map((t, i) => (t.type === 'prop' ? i : -1)).filter((i) => i >= 0);
export function findTile(state, type) {
  const tiles = boardOf(state && state.mapKey);
  for (let i = 0; i < tiles.length; i++) if (tiles[i].type === type) return i;
  return -1;
}

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
export const CHARACTERS = [
  { key: 'boy', name: '阿诚', title: '热血少年', look: { preset: 'boy', name: '阿诚' } },
  { key: 'girl', name: '小蛮', title: '机灵少女', look: { preset: 'girl', name: '小蛮' } },
  { key: 'sword', name: '剑侠', title: '行侠仗义', look: { preset: 'swordsman', body: '#3a6ea5', name: '剑侠' } },
  { key: 'lady', name: '千金', title: '商贾世家', look: { preset: 'woman', name: '千金' } },
];

// —— AI 对手池 ——
export const AI_CHARACTERS = [
  { key: 'tycoon', name: '钱老板', look: { preset: 'king', body: '#6a4a9a', name: '钱老板' } },
  { key: 'ninja', name: '夜行客', look: { preset: 'ninja', name: '夜行客' } },
  { key: 'fox', name: '胡三姨', look: { preset: 'foxSpirit', name: '胡三姨' } },
  { key: 'sage', name: '白先生', look: { preset: 'sage', body: '#5a6a8a', name: '白先生' } },
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
