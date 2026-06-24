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
    // 蛇形路径：左入场 → 上行 → 下行 → 右离场
    path: [
      [-1, 2], [4, 2], [4, 6], [15, 6], [15, 2], [20, 2],
    ],
    roadSlots: [
      2, 2, 3, 2,
      6, 6, 8, 6, 10, 6, 12, 6,
      16, 2, 17, 2, 18, 2,
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
      [-1, 1], [3, 1], [3, 4], [10, 4], [10, 1], [16, 1], [16, 7], [6, 7], [6, 5], [20, 5],
    ],
    roadSlots: [
      1, 1, 2, 1,
      4, 4, 6, 4, 8, 4,
      11, 1, 13, 1,
      16, 4, 16, 6,
      8, 7, 10, 7, 12, 7,
      7, 5,
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
