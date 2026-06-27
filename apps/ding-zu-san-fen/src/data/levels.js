// 关卡数据
// difficulty: 1~5 的难度星级（用于关卡选择展示与渐进解锁感）
// path: 敌军行进航点（网格 col/row，首尾可越界用于入场/离场）
// roadSlots: 路面槽位（近战可部署，位于路径上）—— 格式 [col,row,...]
//   高地槽位由 MapManager 自动依据"邻近路径且非路径"生成
// waves: 每波由若干 {enemy, count, interval, start(秒)} 组构成，按时间轴生成
//
// 难度曲线（8 关，循序渐进）：
//   黄巾之乱(★) → 汜水关(★★) → 虎牢关(★★★) → 徐州之战(★★★) →
//   官渡之战(★★★★) → 长坂坡(★★★★) → 赤壁之战(★★★★★) → 南蛮之乱(★★★★★)
export const LEVELS = {
  huangjin: {
    key: 'huangjin',
    name: '黄巾之乱',
    subtitle: '初出茅庐 · 教学关卡',
    difficulty: 1,
    startGold: 320,
    startLives: 12,
    bgTone: 0x3a3326,
    // 竖屏蛇形路径：顶部入场 → 蛇形下行 → 底部主营
    path: [
      [2, 0], [2, 3], [6, 3], [6, 6], [2, 6], [2, 10], [6, 10], [6, 13],
    ],
    roadSlots: [
      2, 1, 2, 2, 4, 3,
      6, 4, 6, 5, 4, 6,
      2, 8, 2, 9, 4, 10,
      6, 12,
    ],
    waves: [
      [{ enemy: 'yellowturban', count: 6, interval: 1.2, start: 0 }],
      [{ enemy: 'yellowturban', count: 8, interval: 1.0, start: 0 }],
      [{ enemy: 'yellowturban', count: 6, interval: 0.9, start: 0 }, { enemy: 'scout', count: 4, interval: 0.7, start: 4 }],
      [{ enemy: 'shu_soldier', count: 8, interval: 1.0, start: 0 }],
      [{ enemy: 'cavalry', count: 5, interval: 1.4, start: 0 }, { enemy: 'yellowturban', count: 6, interval: 0.8, start: 3 }],
      [{ enemy: 'warlock', count: 4, interval: 1.6, start: 0 }, { enemy: 'shield', count: 3, interval: 2.0, start: 2 }],
      [{ enemy: 'cavalry', count: 8, interval: 1.0, start: 0 }, { enemy: 'scout', count: 8, interval: 0.5, start: 5 }],
      [{ enemy: 'shield', count: 5, interval: 1.8, start: 0 }, { enemy: 'warlock', count: 4, interval: 1.4, start: 3 }, { enemy: 'boss_zhangjiao', count: 1, interval: 1, start: 9 }],
    ],
  },

  sishui: {
    key: 'sishui',
    name: '汜水关',
    subtitle: '华雄逞威 · 入门进阶',
    difficulty: 2,
    startGold: 340,
    startLives: 12,
    bgTone: 0x38302a,
    // 舒缓 S 弯：转角更少，新手易于布防
    path: [
      [3, 0], [3, 3], [5, 3], [5, 7], [3, 7], [3, 10], [6, 10], [6, 13],
    ],
    roadSlots: [
      3, 1, 3, 2, 5, 5, 5, 6, 4, 7, 3, 9, 5, 10, 6, 12,
    ],
    waves: [
      [{ enemy: 'yellowturban', count: 8, interval: 1.1, start: 0 }],
      [{ enemy: 'shu_soldier', count: 6, interval: 1.0, start: 0 }, { enemy: 'scout', count: 4, interval: 0.8, start: 3 }],
      [{ enemy: 'cavalry', count: 4, interval: 1.4, start: 0 }, { enemy: 'yellowturban', count: 6, interval: 0.9, start: 2 }],
      [{ enemy: 'shu_soldier', count: 8, interval: 0.9, start: 0 }],
      [{ enemy: 'warlock', count: 3, interval: 1.6, start: 0 }, { enemy: 'scout', count: 6, interval: 0.6, start: 2 }],
      [{ enemy: 'cavalry', count: 6, interval: 1.0, start: 0 }, { enemy: 'shu_soldier', count: 6, interval: 0.8, start: 3 }],
      // 收官：战象小试牛刀 + 重甲压阵（无 BOSS 血牛，节奏明快）
      [{ enemy: 'shield', count: 3, interval: 1.6, start: 0 }, { enemy: 'cavalry', count: 4, interval: 1.2, start: 2 }, { enemy: 'elephant', count: 1, interval: 1, start: 6 }],
    ],
  },

  hulao: {
    key: 'hulao',
    name: '虎牢关',
    subtitle: '三英战吕布 · 进阶挑战',
    difficulty: 3,
    startGold: 380,
    startLives: 12,
    bgTone: 0x39302a,
    path: [
      [1, 0], [1, 2], [7, 2], [7, 5], [3, 5], [3, 8], [7, 8], [7, 11], [1, 11], [1, 13],
    ],
    roadSlots: [
      1, 1, 4, 2,
      7, 3, 7, 4, 5, 5,
      3, 6, 3, 7, 5, 8,
      7, 9, 7, 10, 4, 11,
      1, 12,
    ],
    waves: [
      [{ enemy: 'yellowturban', count: 10, interval: 0.9, start: 0 }],
      [{ enemy: 'cavalry', count: 6, interval: 1.1, start: 0 }, { enemy: 'scout', count: 6, interval: 0.6, start: 2 }],
      [{ enemy: 'shu_soldier', count: 12, interval: 0.8, start: 0 }, { enemy: 'warlock', count: 3, interval: 1.8, start: 3 }],
      [{ enemy: 'shield', count: 5, interval: 1.6, start: 0 }, { enemy: 'cavalry', count: 6, interval: 1.0, start: 4 }],
      [{ enemy: 'warlock', count: 6, interval: 1.2, start: 0 }, { enemy: 'yellowturban', count: 10, interval: 0.6, start: 2 }],
      [{ enemy: 'cavalry', count: 12, interval: 0.7, start: 0 }],
      [{ enemy: 'shield', count: 7, interval: 1.4, start: 0 }, { enemy: 'warlock', count: 5, interval: 1.2, start: 3 }, { enemy: 'scout', count: 10, interval: 0.4, start: 6 }],
      [{ enemy: 'cavalry', count: 8, interval: 0.8, start: 0 }, { enemy: 'shield', count: 6, interval: 1.5, start: 4 }, { enemy: 'boss_dongzhuo', count: 1, interval: 1, start: 10 }],
    ],
  },

  xuzhou: {
    key: 'xuzhou',
    name: '徐州之战',
    subtitle: '群雄逐鹿 · 巫医现世',
    difficulty: 3,
    startGold: 390,
    startLives: 12,
    bgTone: 0x36302a,
    path: [
      [4, 0], [4, 2], [1, 2], [1, 5], [7, 5], [7, 8], [1, 8], [1, 11], [4, 11], [4, 13],
    ],
    roadSlots: [
      4, 1, 2, 2, 1, 4, 4, 5, 7, 7, 5, 8, 1, 10, 3, 11, 4, 12,
    ],
    waves: [
      [{ enemy: 'shu_soldier', count: 10, interval: 0.9, start: 0 }],
      [{ enemy: 'cavalry', count: 6, interval: 1.0, start: 0 }, { enemy: 'scout', count: 6, interval: 0.6, start: 2 }],
      // 巫医首秀：残血兵会被奶回来，逼玩家集火后排
      [{ enemy: 'shaman', count: 2, interval: 2.0, start: 0 }, { enemy: 'yellowturban', count: 10, interval: 0.7, start: 1 }],
      [{ enemy: 'shield', count: 4, interval: 1.6, start: 0 }, { enemy: 'warlock', count: 3, interval: 1.4, start: 2 }],
      [{ enemy: 'cavalry', count: 8, interval: 0.9, start: 0 }, { enemy: 'shaman', count: 2, interval: 2.0, start: 4 }],
      [{ enemy: 'warlock', count: 5, interval: 1.2, start: 0 }, { enemy: 'shu_soldier', count: 10, interval: 0.6, start: 2 }],
      // 收官：巫医撑线 + 重甲骑兵混编
      [{ enemy: 'shield', count: 5, interval: 1.4, start: 0 }, { enemy: 'shaman', count: 3, interval: 1.8, start: 3 }, { enemy: 'cavalry', count: 6, interval: 0.8, start: 6 }],
    ],
  },

  guandu: {
    key: 'guandu',
    name: '官渡之战',
    subtitle: '以少胜多 · 焚烬粮草',
    difficulty: 4,
    startGold: 400,
    startLives: 12,
    bgTone: 0x35302a,
    // 蛇形蜿蜒：自顶部入，迂回下行至底部主营
    path: [
      [4, 0], [4, 3], [1, 3], [1, 7], [7, 7], [7, 10], [3, 10], [3, 13],
    ],
    roadSlots: [
      4, 1, 4, 2, 2, 3, 3, 3,
      1, 4, 1, 5, 1, 6, 3, 7, 4, 7, 5, 7,
      7, 8, 7, 9, 4, 10, 5, 10, 6, 10,
      3, 11, 3, 12,
    ],
    waves: [
      // 前两波放缓，平滑"第三关偏难"的旧手感
      [{ enemy: 'shu_soldier', count: 8, interval: 1.0, start: 0 }],
      [{ enemy: 'cavalry', count: 6, interval: 1.0, start: 0 }, { enemy: 'scout', count: 6, interval: 0.6, start: 3 }],
      [{ enemy: 'shield', count: 5, interval: 1.6, start: 0 }, { enemy: 'warlock', count: 4, interval: 1.4, start: 2 }],
      [{ enemy: 'cavalry', count: 10, interval: 0.8, start: 0 }, { enemy: 'shu_soldier', count: 8, interval: 0.7, start: 4 }],
      [{ enemy: 'warlock', count: 6, interval: 1.2, start: 0 }, { enemy: 'scout', count: 12, interval: 0.4, start: 2 }],
      [{ enemy: 'shield', count: 7, interval: 1.3, start: 0 }, { enemy: 'cavalry', count: 8, interval: 0.9, start: 3 }],
      [{ enemy: 'warlock', count: 7, interval: 1.0, start: 0 }, { enemy: 'shield', count: 6, interval: 1.4, start: 3 }, { enemy: 'cavalry', count: 10, interval: 0.6, start: 6 }],
      [{ enemy: 'shield', count: 8, interval: 1.3, start: 0 }, { enemy: 'warlock', count: 6, interval: 1.2, start: 3 }, { enemy: 'boss_yuanshao', count: 1, interval: 1, start: 11 }],
    ],
  },

  changban: {
    key: 'changban',
    name: '长坂坡',
    subtitle: '单骑救主 · 急袭突围',
    difficulty: 4,
    startGold: 420,
    startLives: 13,
    bgTone: 0x342c26,
    // 长蛇奔袭：横向贯穿多折返，高速斥候压境
    path: [
      [1, 0], [1, 2], [7, 2], [7, 5], [1, 5], [1, 8], [7, 8], [7, 11], [4, 11], [4, 13],
    ],
    roadSlots: [
      1, 1, 4, 2, 7, 4, 4, 5, 1, 7, 4, 8, 7, 10, 5, 11, 4, 12,
    ],
    waves: [
      [{ enemy: 'scout', count: 14, interval: 0.5, start: 0 }],
      [{ enemy: 'cavalry', count: 8, interval: 0.8, start: 0 }, { enemy: 'scout', count: 8, interval: 0.5, start: 2 }],
      [{ enemy: 'shu_soldier', count: 12, interval: 0.7, start: 0 }, { enemy: 'shaman', count: 2, interval: 2.0, start: 3 }],
      [{ enemy: 'cavalry', count: 10, interval: 0.7, start: 0 }],
      [{ enemy: 'warlock', count: 6, interval: 1.0, start: 0 }, { enemy: 'scout', count: 12, interval: 0.4, start: 2 }],
      [{ enemy: 'shield', count: 6, interval: 1.2, start: 0 }, { enemy: 'cavalry', count: 8, interval: 0.8, start: 3 }],
      [{ enemy: 'warlock', count: 6, interval: 1.0, start: 0 }, { enemy: 'shaman', count: 3, interval: 1.6, start: 3 }, { enemy: 'shu_soldier', count: 10, interval: 0.6, start: 6 }],
      // 收官：洪流 + 双战象殿后
      [{ enemy: 'cavalry', count: 10, interval: 0.7, start: 0 }, { enemy: 'shield', count: 6, interval: 1.3, start: 3 }, { enemy: 'scout', count: 12, interval: 0.4, start: 6 }, { enemy: 'elephant', count: 2, interval: 3, start: 8 }],
    ],
  },

  chibi: {
    key: 'chibi',
    name: '赤壁之战',
    subtitle: '火烧连营 · 决战江畔',
    difficulty: 5,
    startGold: 420,
    startLives: 14,
    bgTone: 0x332a2a,
    // 赤壁火阵：多重折返的长蛇径
    path: [
      [2, 0], [2, 2], [6, 2], [6, 5], [2, 5], [2, 8], [7, 8], [7, 11], [4, 11], [4, 13],
    ],
    roadSlots: [
      2, 1, 3, 2, 4, 2, 5, 2,
      6, 3, 6, 4, 3, 5, 4, 5, 5, 5,
      2, 6, 2, 7, 3, 8, 4, 8, 5, 8, 6, 8,
      7, 9, 7, 10, 5, 11, 6, 11, 4, 12,
    ],
    waves: [
      [{ enemy: 'cavalry', count: 10, interval: 0.8, start: 0 }],
      [{ enemy: 'warlock', count: 6, interval: 1.0, start: 0 }, { enemy: 'scout', count: 10, interval: 0.4, start: 2 }],
      [{ enemy: 'shield', count: 6, interval: 1.4, start: 0 }, { enemy: 'cavalry', count: 10, interval: 0.7, start: 3 }],
      [{ enemy: 'warlock', count: 8, interval: 0.9, start: 0 }, { enemy: 'shu_soldier', count: 12, interval: 0.5, start: 2 }],
      [{ enemy: 'shield', count: 8, interval: 1.2, start: 0 }, { enemy: 'cavalry', count: 12, interval: 0.6, start: 3 }],
      [{ enemy: 'warlock', count: 10, interval: 0.8, start: 0 }, { enemy: 'scout', count: 14, interval: 0.35, start: 3 }],
      [{ enemy: 'shield', count: 10, interval: 1.0, start: 0 }, { enemy: 'warlock', count: 8, interval: 1.0, start: 3 }, { enemy: 'cavalry', count: 12, interval: 0.5, start: 6 }],
      [{ enemy: 'cavalry', count: 12, interval: 0.7, start: 0 }, { enemy: 'shield', count: 8, interval: 1.3, start: 3 }, { enemy: 'warlock', count: 8, interval: 1.0, start: 6 }, { enemy: 'boss_caofleet', count: 1, interval: 1, start: 12 }],
    ],
  },

  nanman: {
    key: 'nanman',
    name: '南蛮之乱',
    subtitle: '七擒孟获 · 蛮荒鏖战',
    difficulty: 5,
    startGold: 440,
    startLives: 14,
    bgTone: 0x2c3026,
    // 南蛮密林：蜿蜒深邃，战象与蛮兵并起
    path: [
      [4, 0], [4, 2], [1, 2], [1, 4], [7, 4], [7, 7], [2, 7], [2, 10], [6, 10], [6, 13],
    ],
    roadSlots: [
      4, 1, 2, 2, 1, 3, 4, 4, 7, 6, 5, 7, 2, 9, 4, 10, 6, 12,
    ],
    waves: [
      [{ enemy: 'cavalry', count: 12, interval: 0.7, start: 0 }],
      [{ enemy: 'warlock', count: 6, interval: 1.0, start: 0 }, { enemy: 'scout', count: 12, interval: 0.4, start: 2 }],
      [{ enemy: 'shield', count: 6, interval: 1.2, start: 0 }, { enemy: 'shaman', count: 3, interval: 1.6, start: 3 }],
      // 战象群压境：惧法，需策士/燃烧集火
      [{ enemy: 'elephant', count: 3, interval: 2.5, start: 0 }, { enemy: 'shu_soldier', count: 12, interval: 0.6, start: 2 }],
      [{ enemy: 'warlock', count: 8, interval: 0.9, start: 0 }, { enemy: 'cavalry', count: 12, interval: 0.6, start: 2 }],
      [{ enemy: 'shield', count: 8, interval: 1.0, start: 0 }, { enemy: 'warlock', count: 6, interval: 1.0, start: 3 }, { enemy: 'shaman', count: 3, interval: 1.6, start: 6 }],
      [{ enemy: 'cavalry', count: 12, interval: 0.6, start: 0 }, { enemy: 'shield', count: 8, interval: 1.2, start: 3 }, { enemy: 'scout', count: 14, interval: 0.35, start: 6 }],
      // 终局：战象开路 + 三军合围 + 蛮王孟获
      [{ enemy: 'elephant', count: 2, interval: 3, start: 0 }, { enemy: 'shield', count: 8, interval: 1.2, start: 3 }, { enemy: 'warlock', count: 8, interval: 1.0, start: 6 }, { enemy: 'boss_menghuo', count: 1, interval: 1, start: 12 }],
    ],
  },
};

export const LEVEL_LIST = ['huangjin', 'sishui', 'hulao', 'xuzhou', 'guandu', 'changban', 'chibi', 'nanman'];
