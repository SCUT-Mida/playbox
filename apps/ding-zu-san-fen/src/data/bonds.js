// 羁绊 / 阵法 数据
// 每条羁绊：
//   name, desc: 名称与说明
//   test(ctx): 是否激活（ctx 提供 countTag / countFaction / areAdjacent）
//   effect(generals): 激活时给对应武将叠加 buff（修改 g.buffAtk / g.buffCd）
export const BONDS = [
  {
    id: 'wuhu',
    name: '五虎上将',
    desc: '2 名及以上【五虎】在场：蜀军攻击 +25%',
    test: (c) => c.countTag('五虎') >= 2,
    effect: (gs) => {
      for (const g of gs) if (g.def.faction === '蜀') g.buffAtk *= 1.25;
    },
  },
  {
    id: 'wolong',
    name: '卧龙凤雏',
    desc: '诸葛亮与庞统相邻：技能冷却 -30%',
    test: (c) => c.areAdjacent(['zhuge', 'pangtong']),
    effect: (gs) => {
      for (const g of gs) if (g.def.id === 'zhuge' || g.def.id === 'pangtong') g.buffCd *= 0.7;
    },
  },
  {
    id: 'weiwu',
    name: '魏武强兵',
    desc: '2 名及以上【魏】将在场：魏军攻击 +15%',
    test: (c) => c.countFaction('魏') >= 2,
    effect: (gs) => {
      for (const g of gs) if (g.def.faction === '魏') g.buffAtk *= 1.15;
    },
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
  },
  {
    id: 'qunxiong',
    name: '群雄逐鹿',
    desc: '吕布与貂蝉相邻：吕布攻击 +50%',
    test: (c) => c.areAdjacent(['lvbu', 'diaochan']),
    effect: (gs) => {
      for (const g of gs) if (g.def.id === 'lvbu') g.buffAtk *= 1.5;
    },
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
  },
];
