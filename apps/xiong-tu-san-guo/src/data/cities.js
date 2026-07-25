// ============================================================================
// 城市（地图节点）初始数据：18 座核心城市，含坐标、特性、初始资源、邻接关系。
// trait.type 取值：commerce(商业) / grain(粮食) / defense(城防) / growth(人口) / recruit(征兵)
// 坐标基于 viewBox "0 0 1000 760"（西→东，北→南）。
// ============================================================================
export const CITIES = [
  { id: 'luoyang', name: '洛阳', x: 500, y: 320,
    trait: { type: 'commerce', value: 0.2, name: '天下之中', desc: '商业收入 +20%' },
    popMax: 100000, pop0: 80000, gold0: 3000, grain0: 8000, soldiers0: 2000, defense0: 1200,
    adjacent: ['changan', 'xuchang', 'ye', 'wan'] },
  { id: 'changan', name: '长安', x: 250, y: 330,
    trait: { type: 'defense', value: 0.2, name: '关中险固', desc: '城防值 +20%' },
    popMax: 90000, pop0: 60000, gold0: 2000, grain0: 6000, soldiers0: 1800, defense0: 1100,
    adjacent: ['luoyang', 'wuwei', 'hanzhong'] },
  { id: 'ye', name: '邺城', x: 600, y: 270,
    trait: { type: 'growth', value: 0.15, name: '河北要冲', desc: '人口增长 +15%' },
    popMax: 95000, pop0: 70000, gold0: 2500, grain0: 7000, soldiers0: 2200, defense0: 1000,
    adjacent: ['nanpi', 'puyang', 'luoyang'] },
  { id: 'xuchang', name: '许昌', x: 620, y: 430,
    trait: { type: 'commerce', value: 0.15, name: '中原通衢', desc: '商业收入 +15%' },
    popMax: 85000, pop0: 55000, gold0: 2500, grain0: 7000, soldiers0: 1800, defense0: 1000,
    adjacent: ['luoyang', 'puyang', 'xiapi', 'wan'] },
  { id: 'chengdu', name: '成都', x: 250, y: 550,
    trait: { type: 'grain', value: 0.2, name: '天府之国', desc: '粮食产量 +20%' },
    popMax: 100000, pop0: 70000, gold0: 2000, grain0: 10000, soldiers0: 1600, defense0: 1000,
    adjacent: ['hanzhong', 'jianning'] },
  { id: 'jianye', name: '建业', x: 800, y: 500,
    trait: { type: 'commerce', value: 0.15, name: '江东形胜', desc: '商业收入 +15%' },
    popMax: 90000, pop0: 60000, gold0: 2200, grain0: 6500, soldiers0: 1700, defense0: 1100,
    adjacent: ['xiapi', 'kuaiji', 'xiangyang', 'jiangling'] },
  { id: 'xiangyang', name: '襄阳', x: 540, y: 520,
    trait: { type: 'defense', value: 0.15, name: '荆楚咽喉', desc: '城防值 +15%' },
    popMax: 85000, pop0: 55000, gold0: 2200, grain0: 6500, soldiers0: 1700, defense0: 1100,
    adjacent: ['wan', 'jiangling', 'jianye'] },
  { id: 'hanzhong', name: '汉中', x: 320, y: 430,
    trait: { type: 'defense', value: 0.3, name: '易守难攻', desc: '城防值 +30%' },
    popMax: 70000, pop0: 40000, gold0: 1500, grain0: 5000, soldiers0: 1400, defense0: 1300,
    adjacent: ['changan', 'chengdu', 'wan'] },
  { id: 'beiping', name: '北平', x: 760, y: 130,
    trait: { type: 'recruit', value: 0.15, name: '幽燕边塞', desc: '征兵效率 +15%' },
    popMax: 80000, pop0: 50000, gold0: 1800, grain0: 5500, soldiers0: 2000, defense0: 1000,
    adjacent: ['nanpi'] },
  { id: 'xiapi', name: '下邳', x: 800, y: 400,
    trait: { type: 'commerce', value: 0.1, name: '泗水商埠', desc: '商业收入 +10%' },
    popMax: 75000, pop0: 45000, gold0: 2000, grain0: 5500, soldiers0: 1500, defense0: 900,
    adjacent: ['puyang', 'xuchang', 'jianye'] },
  { id: 'wan', name: '宛城', x: 460, y: 430,
    trait: { type: 'defense', value: 0.1, name: '南阳要冲', desc: '城防值 +10%' },
    popMax: 72000, pop0: 42000, gold0: 1700, grain0: 5200, soldiers0: 1400, defense0: 1100,
    adjacent: ['luoyang', 'xuchang', 'hanzhong', 'xiangyang'] },
  { id: 'nanpi', name: '南皮', x: 660, y: 200,
    trait: { type: 'grain', value: 0.25, name: '产粮大郡', desc: '粮食产量 +25%' },
    popMax: 78000, pop0: 48000, gold0: 1700, grain0: 7000, soldiers0: 1500, defense0: 950,
    adjacent: ['beiping', 'ye'] },
  { id: 'puyang', name: '濮阳', x: 690, y: 340,
    trait: { type: 'growth', value: 0.1, name: '中原沃野', desc: '人口增长 +10%' },
    popMax: 76000, pop0: 46000, gold0: 1800, grain0: 5600, soldiers0: 1500, defense0: 950,
    adjacent: ['ye', 'xiapi', 'xuchang'] },
  { id: 'jiangling', name: '江陵', x: 480, y: 620,
    trait: { type: 'grain', value: 0.15, name: '云梦粮仓', desc: '粮食产量 +15%' },
    popMax: 78000, pop0: 47000, gold0: 1800, grain0: 6800, soldiers0: 1500, defense0: 950,
    adjacent: ['xiangyang', 'guiyang', 'jianye'] },
  { id: 'kuaiji', name: '会稽', x: 860, y: 600,
    trait: { type: 'commerce', value: 0.2, name: '海盐通商', desc: '商业收入 +20%' },
    popMax: 72000, pop0: 42000, gold0: 2000, grain0: 5200, soldiers0: 1300, defense0: 900,
    adjacent: ['jianye'] },
  { id: 'jianning', name: '建宁', x: 360, y: 660,
    trait: { type: 'grain', value: 0.1, name: '南中屯田', desc: '粮食产量 +10%' },
    popMax: 68000, pop0: 36000, gold0: 1400, grain0: 5400, soldiers0: 1200, defense0: 900,
    adjacent: ['chengdu', 'guiyang'] },
  { id: 'wuwei', name: '武威', x: 120, y: 250,
    trait: { type: 'recruit', value: 0.2, name: '西凉铁骑', desc: '征兵效率 +20%' },
    popMax: 64000, pop0: 32000, gold0: 1300, grain0: 4800, soldiers0: 1800, defense0: 950,
    adjacent: ['changan'] },
  { id: 'guiyang', name: '桂阳', x: 560, y: 690,
    trait: { type: 'growth', value: 0.1, name: '岭南烟瘴', desc: '人口增长 +10%' },
    popMax: 66000, pop0: 34000, gold0: 1400, grain0: 5000, soldiers0: 1200, defense0: 850,
    adjacent: ['jianning', 'jiangling'] },
];

export const CITY_MAP = Object.fromEntries(CITIES.map((c) => [c.id, c]));

// 地图背景的地理标注（viewBox 0 0 1000 760 坐标）：河流与州郡名，
// 仅作方位参考、提升地图可读性，不参与任何逻辑。
export const MAP_RIVERS = [
  { name: '黄河', d: 'M 60 250 C 220 205, 360 260, 500 220 S 760 175, 950 205' },
  { name: '长江', d: 'M 80 615 C 240 575, 400 625, 560 588 S 800 555, 960 590' },
];
export const MAP_REGIONS = [
  { name: '关西', x: 175, y: 345 },
  { name: '河北', x: 645, y: 195 },
  { name: '中原', x: 560, y: 405 },
  { name: '江东', x: 835, y: 470 },
  { name: '荆楚', x: 515, y: 565 },
  { name: '益州', x: 270, y: 525 },
  { name: '南中', x: 360, y: 650 },
];

// 八路诸侯旧都（玩家占据时其旧部转为在野）。派生自 FACTION_SEEDS，集中导出便于 UI 标注。
export const CAPITAL_IDS = [
  'xuchang', 'ye', 'jianye', 'changan', 'jiangling', 'wuwei', 'chengdu', 'beiping',
];

// 邻接关系自检：确保双向一致（开发期辅助，构建期不抛错）
export function adjacencyValid() {
  for (const c of CITIES) {
    for (const n of c.adjacent) {
      const nb = CITY_MAP[n];
      if (!nb) return false;
      if (!nb.adjacent.includes(c.id)) return false;
    }
  }
  return true;
}
