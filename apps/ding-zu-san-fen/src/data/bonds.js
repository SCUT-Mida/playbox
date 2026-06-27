// 羁绊 / 阵法 数据
// 每条羁绊：
//   name, desc: 名称与说明
//   test(ctx): 是否激活（ctx 提供 countTag / countFaction / areAdjacent）
//   effect(generals): 激活时给对应武将叠加 buff（修改 g.buffAtk / g.buffCd）
//   match(def): 该武将是否参与此羁绊（供武将图鉴展示"跟谁一同上场有加成"）
//   pool(): 此羁绊的全部成员 id（供图鉴展示搭档）
import { GENERALS } from './generals.js';

export const BONDS = [
  {
    id: 'wuhu',
    name: '五虎上将',
    desc: '2 名及以上【五虎】在场：蜀军攻击 +25%',
    test: (c) => c.countTag('五虎') >= 2,
    effect: (gs) => {
      for (const g of gs) if (g.def.faction === '蜀') g.buffAtk *= 1.25;
    },
    match: (d) => !!(d.tags && d.tags.includes('五虎')),
    pool: () => GENERALS.filter((g) => g.tags && g.tags.includes('五虎')).map((g) => g.id),
  },
  {
    id: 'wolong',
    name: '卧龙凤雏',
    desc: '诸葛亮与庞统相邻：技能冷却 -30%',
    test: (c) => c.areAdjacent(['zhuge', 'pangtong']),
    effect: (gs) => {
      for (const g of gs) if (g.def.id === 'zhuge' || g.def.id === 'pangtong') g.buffCd *= 0.7;
    },
    match: (d) => ['zhuge', 'pangtong'].includes(d.id),
    pool: () => ['zhuge', 'pangtong'],
  },
  {
    id: 'weiwu',
    name: '魏武强兵',
    desc: '2 名及以上【魏】将在场：魏军攻击 +15%',
    test: (c) => c.countFaction('魏') >= 2,
    effect: (gs) => {
      for (const g of gs) if (g.def.faction === '魏') g.buffAtk *= 1.15;
    },
    match: (d) => d.faction === '魏',
    pool: () => GENERALS.filter((g) => g.faction === '魏').map((g) => g.id),
  },
  {
    id: 'dongwu',
    name: '东吴水战',
    desc: '2 名及以上【吴】将在场：吴军攻击 +12%、攻速 +10%',
    test: (c) => c.countFaction('吴') >= 2,
    effect: (gs) => {
      for (const g of gs) if (g.def.faction === '吴') {
        g.buffAtk *= 1.12;
        g.buffCd *= 0.9;
      }
    },
    match: (d) => d.faction === '吴',
    pool: () => GENERALS.filter((g) => g.faction === '吴').map((g) => g.id),
  },
  {
    id: 'qunxiong',
    name: '群雄逐鹿',
    desc: '吕布与貂蝉相邻：吕布攻击 +50%',
    test: (c) => c.areAdjacent(['lvbu', 'diaochan']),
    effect: (gs) => {
      for (const g of gs) if (g.def.id === 'lvbu') g.buffAtk *= 1.5;
    },
    match: (d) => ['lvbu', 'diaochan'].includes(d.id),
    pool: () => ['lvbu', 'diaochan'],
  },
  {
    id: 'taoyuan',
    name: '桃园之义',
    desc: '关羽、张飞、赵云同时在场：三将攻击 +20%、血量 +20%',
    test: (c) => c.byId['guanyu'] && c.byId['zhangfei'] && c.byId['zhaoyun'],
    effect: (gs) => {
      for (const g of gs) if (['guanyu', 'zhangfei', 'zhaoyun'].includes(g.def.id)) {
        g.buffAtk *= 1.2;
        g.buffHp *= 1.2;
      }
    },
    match: (d) => ['guanyu', 'zhangfei', 'zhaoyun'].includes(d.id),
    pool: () => ['guanyu', 'zhangfei', 'zhaoyun'],
  },
  {
    // 三国鼎立：蜀魏吴三国各有 ≥1 将在场 —— 呼应"鼎足三分"主题的全局激励
    id: 'dingzu',
    name: '三国鼎立',
    desc: '蜀、魏、吴三国各有一将在场：全军攻击 +15%、血量 +15%',
    test: (c) => c.countFaction('蜀') >= 1 && c.countFaction('魏') >= 1 && c.countFaction('吴') >= 1,
    effect: (gs) => {
      for (const g of gs) {
        g.buffAtk *= 1.15;
        g.buffHp *= 1.15;
      }
    },
    match: (d) => d.faction === '蜀' || d.faction === '魏' || d.faction === '吴',
    pool: () => GENERALS.filter((g) => ['蜀', '魏', '吴'].includes(g.faction)).map((g) => g.id),
  },
];

// 该武将参与（可触发）的全部羁绊
export function bondsForGeneral(def) {
  return BONDS.filter((b) => {
    try {
      return b.match(def);
    } catch {
      return false;
    }
  });
}

// 该武将在某羁绊中的搭档（pool 中除自身外的成员名）
export function bondPartners(bond, def) {
  let ids = [];
  try {
    ids = bond.pool() || [];
  } catch {
    ids = [];
  }
  return ids
    .filter((id) => id !== def.id)
    .map((id) => {
      const g = GENERALS.find((x) => x.id === id);
      return g ? g.name : id;
    });
}
