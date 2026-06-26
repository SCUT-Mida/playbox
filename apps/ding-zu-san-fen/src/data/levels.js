// 关卡数据
// path: 敌军行进航点（网格 col/row，首尾可越界用于入场/离场）
// roadSlots: 路面槽位（近战可部署，位于路径上）—— 格式 [col,row,...]
//   高地槽位由 MapManager 自动依据"邻近路径且非路径"生成
// waves: 每波由若干 {enemy, count, interval, start(秒)} 组构成，按时间轴生成
export const LEVELS = {
  huangjin: {
    key: 'huangjin',
    name: '黄巾之乱',
    subtitle: '初出茅庐 · 教学关卡',
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

  hulao: {
    key: 'hulao',
    name: '虎牢关',
    subtitle: '三英战吕布 · 进阶挑战',
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
};

export const LEVEL_LIST = ['huangjin', 'hulao'];
