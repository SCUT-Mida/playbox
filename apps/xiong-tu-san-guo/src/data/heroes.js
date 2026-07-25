// ============================================================================
// 名将与势力种子数据：47 位历史名将 + 8 个 AI 势力种子。
// 每个 hero：{ id, name, stats{l,w,i,p,c}, skill, loyalty, serve|wild, lord? }
//   serve: 所属 AI 势力 key（含君主 lord:true）
//   wild : 在野所在城市 id（可被探索 / 登用）
// skill.effect 为简化 DSL：lead:0.10 / war:0.10 / trick:0.20 / def:0.20 / cap:0.10 / train:0.20
// ============================================================================

export const HEROES = [
  // —— AI 君主（serve=势力 key, lord:true）——
  { id: 'caocao', name: '曹操', serve: 'cao', lord: true, loyalty: 100,
    stats: { l: 96, w: 80, i: 94, p: 96, c: 98 }, skill: { name: '雄才大略', effect: 'cap:0.10,trick:0.10' } },
  { id: 'yuanshao', name: '袁绍', serve: 'yuan', lord: true, loyalty: 100,
    stats: { l: 84, w: 78, i: 80, p: 82, c: 90 }, skill: { name: '四世三公', effect: 'cap:0.10' } },
  { id: 'sunce', name: '孙策', serve: 'ce', lord: true, loyalty: 100,
    stats: { l: 92, w: 92, i: 80, p: 70, c: 95 }, skill: { name: '小霸王', effect: 'war:0.10' } },
  { id: 'dongzhuo', name: '董卓', serve: 'dong', lord: true, loyalty: 100,
    stats: { l: 82, w: 88, i: 60, p: 50, c: 55 }, skill: { name: '魔焰滔天', effect: 'war:0.10' } },
  { id: 'liubiao', name: '刘表', serve: 'biao', lord: true, loyalty: 100,
    stats: { l: 70, w: 60, i: 78, p: 80, c: 85 }, skill: { name: '荆襄名士', effect: 'p_grow:0.10' } },
  { id: 'mateng', name: '马腾', serve: 'teng', lord: true, loyalty: 100,
    stats: { l: 82, w: 86, i: 70, p: 68, c: 80 }, skill: { name: '西凉雄风', effect: 'war:0.08' } },
  { id: 'liuzhang', name: '刘璋', serve: 'zhang', lord: true, loyalty: 100,
    stats: { l: 60, w: 55, i: 70, p: 75, c: 78 }, skill: { name: '益州偏安', effect: 'def:0.10' } },
  { id: 'gongsunzan', name: '公孙瓒', serve: 'gongsun', lord: true, loyalty: 100,
    stats: { l: 80, w: 84, i: 65, p: 60, c: 70 }, skill: { name: '白马义从', effect: 'war:0.08' } },

  // —— 曹操势力 ——
  { id: 'zhangliao', name: '张辽', serve: 'cao', loyalty: 92,
    stats: { l: 94, w: 93, i: 78, p: 78, c: 82 }, skill: { name: '威震逍遥津', effect: 'war:0.10' } },
  { id: 'xiahoudun', name: '夏侯惇', serve: 'cao', loyalty: 95,
    stats: { l: 84, w: 88, i: 60, p: 70, c: 78 }, skill: { name: '刚烈', effect: 'war:0.08' } },
  { id: 'xiahouyuan', name: '夏侯渊', serve: 'cao', loyalty: 93,
    stats: { l: 83, w: 87, i: 65, p: 65, c: 72 }, skill: { name: '神速', effect: 'war:0.06' } },
  { id: 'xuhuang', name: '徐晃', serve: 'cao', loyalty: 90,
    stats: { l: 83, w: 88, i: 72, p: 70, c: 70 }, skill: null },
  { id: 'zhanghe', name: '张郃', serve: 'cao', loyalty: 85,
    stats: { l: 85, w: 88, i: 70, p: 68, c: 70 }, skill: null },
  { id: 'dianwei', name: '典韦', serve: 'cao', loyalty: 96,
    stats: { l: 70, w: 96, i: 40, p: 30, c: 50 }, skill: { name: '古之恶来', effect: 'war:0.12' } },
  { id: 'xuchu2', name: '许褚', serve: 'cao', loyalty: 95,
    stats: { l: 72, w: 94, i: 35, p: 30, c: 55 }, skill: { name: '虎痴', effect: 'war:0.10' } },
  { id: 'guojia', name: '郭嘉', serve: 'cao', loyalty: 90,
    stats: { l: 70, w: 40, i: 98, p: 85, c: 80 }, skill: { name: '鬼才', effect: 'trick:0.20' } },
  { id: 'xunyu', name: '荀彧', serve: 'cao', loyalty: 92,
    stats: { l: 75, w: 40, i: 95, p: 98, c: 88 }, skill: { name: '王佐之才', effect: 'p_grow:0.15' } },
  { id: 'jiaxu', name: '贾诩', serve: 'cao', loyalty: 88,
    stats: { l: 80, w: 50, i: 96, p: 80, c: 70 }, skill: { name: '毒士', effect: 'trick:0.20' } },
  { id: 'chengyu', name: '程昱', serve: 'cao', loyalty: 88,
    stats: { l: 72, w: 55, i: 90, p: 80, c: 65 }, skill: null },

  // —— 袁绍势力 ——
  { id: 'yanliang', name: '颜良', serve: 'yuan', loyalty: 82,
    stats: { l: 80, w: 92, i: 50, p: 45, c: 60 }, skill: null },
  { id: 'wenchou', name: '文丑', serve: 'yuan', loyalty: 82,
    stats: { l: 78, w: 92, i: 45, p: 40, c: 58 }, skill: null },

  // —— 孙策势力 ——
  { id: 'zhouyu', name: '周瑜', serve: 'ce', loyalty: 98,
    stats: { l: 95, w: 78, i: 97, p: 86, c: 92 }, skill: { name: '火烧赤壁', effect: 'trick:0.20' } },
  { id: 'taishici', name: '太史慈', serve: 'ce', loyalty: 90,
    stats: { l: 84, w: 93, i: 70, p: 60, c: 78 }, skill: null },
  { id: 'ganning', name: '甘宁', serve: 'ce', loyalty: 85,
    stats: { l: 86, w: 94, i: 70, p: 55, c: 75 }, skill: { name: '锦帆贼', effect: 'war:0.08' } },
  { id: 'huanggai', name: '黄盖', serve: 'ce', loyalty: 95,
    stats: { l: 80, w: 86, i: 65, p: 60, c: 78 }, skill: null },
  { id: 'lvmeng', name: '吕蒙', serve: 'ce', loyalty: 90,
    stats: { l: 88, w: 85, i: 90, p: 80, c: 75 }, skill: { name: '刮目相看', effect: 'trick:0.10' } },
  { id: 'luxun', name: '陆逊', serve: 'ce', loyalty: 92,
    stats: { l: 90, w: 75, i: 95, p: 88, c: 85 }, skill: { name: '火烧连营', effect: 'trick:0.20' } },
  { id: 'lusu', name: '鲁肃', serve: 'ce', loyalty: 93,
    stats: { l: 78, w: 50, i: 92, p: 95, c: 92 }, skill: null },

  // —— 董卓势力 ——
  { id: 'lvbu', name: '吕布', serve: 'dong', loyalty: 70,
    stats: { l: 78, w: 100, i: 35, p: 26, c: 47 }, skill: { name: '人中吕布', effect: 'war:0.15' } },
  { id: 'huaxiong', name: '华雄', serve: 'dong', loyalty: 80,
    stats: { l: 75, w: 88, i: 40, p: 35, c: 50 }, skill: null },

  // —— 马腾势力 ——
  { id: 'machao', name: '马超', serve: 'teng', loyalty: 80,
    stats: { l: 88, w: 97, i: 50, p: 40, c: 70 }, skill: { name: '锦马超', effect: 'war:0.10' } },

  // —— 在野名将（wild=城市 id，可探索登用）——
  { id: 'liubei', name: '刘备', wild: 'luoyang', loyalty: 99,
    stats: { l: 90, w: 78, i: 80, p: 85, c: 99 }, skill: { name: '仁德', effect: 'c_recruit:0.20' } },
  { id: 'guanyu', name: '关羽', wild: 'wan', loyalty: 95,
    stats: { l: 96, w: 97, i: 75, p: 62, c: 88 }, skill: { name: '威震华夏', effect: 'lead:0.10,war:0.05' } },
  { id: 'zhangfei', name: '张飞', wild: 'wan', loyalty: 90,
    stats: { l: 85, w: 98, i: 45, p: 30, c: 60 }, skill: { name: '燕人咆哮', effect: 'war:0.10' } },
  { id: 'zhaoyun', name: '赵云', wild: 'nanpi', loyalty: 92,
    stats: { l: 91, w: 96, i: 76, p: 65, c: 85 }, skill: { name: '常胜将军', effect: 'war:0.08,def:0.10' } },
  { id: 'zhugeliang', name: '诸葛亮', wild: 'xiangyang', loyalty: 100,
    stats: { l: 92, w: 40, i: 100, p: 98, c: 93 }, skill: { name: '神算', effect: 'trick:0.20,p_grow:0.10' } },
  { id: 'huangzhong', name: '黄忠', wild: 'kuaiji', loyalty: 88,
    stats: { l: 86, w: 95, i: 65, p: 60, c: 70 }, skill: null },
  { id: 'pangtong', name: '庞统', wild: 'guiyang', loyalty: 85,
    stats: { l: 80, w: 45, i: 97, p: 90, c: 80 }, skill: { name: '凤雏', effect: 'trick:0.15' } },
  { id: 'fazheng', name: '法正', wild: 'hanzhong', loyalty: 88,
    stats: { l: 75, w: 50, i: 94, p: 88, c: 75 }, skill: null },
  { id: 'weiyan', name: '魏延', wild: 'xiapi', loyalty: 78,
    stats: { l: 88, w: 92, i: 70, p: 60, c: 65 }, skill: null },
  { id: 'jiangwei', name: '姜维', wild: 'hanzhong', loyalty: 90,
    stats: { l: 91, w: 90, i: 90, p: 80, c: 80 }, skill: { name: '麒麟儿', effect: 'lead:0.08,trick:0.10' } },
  { id: 'huatuo', name: '华佗', wild: 'luoyang', loyalty: 80,
    stats: { l: 40, w: 30, i: 90, p: 85, c: 90 }, skill: { name: '神医', effect: 'def:0.10' } },
  { id: 'simayi', name: '司马懿', wild: 'wan', loyalty: 85,
    stats: { l: 93, w: 70, i: 96, p: 93, c: 88 }, skill: { name: '韬略', effect: 'trick:0.15' } },
  { id: 'dengai', name: '邓艾', wild: 'puyang', loyalty: 88,
    stats: { l: 90, w: 85, i: 89, p: 85, c: 75 }, skill: null },
  { id: 'zhonghui', name: '钟会', wild: 'guiyang', loyalty: 78,
    stats: { l: 82, w: 75, i: 88, p: 75, c: 70 }, skill: null },
  { id: 'gaoshun', name: '高顺', wild: 'jianning', loyalty: 85,
    stats: { l: 82, w: 90, i: 55, p: 50, c: 60 }, skill: { name: '陷阵营', effect: 'war:0.10' } },
  { id: 'simazhao', name: '司马昭', wild: 'xiapi', loyalty: 82,
    stats: { l: 85, w: 70, i: 90, p: 85, c: 80 }, skill: null },
];

export const HERO_MAP = Object.fromEntries(HEROES.map((h) => [h.id, h]));

// AI 势力种子：capital 为初始都城，lordId 指向 HEROES 中的君主。
// 玩家若选择某都城开局，对应势力不生成，其名将转为该城在野（玩家可登用）。
export const FACTION_SEEDS = [
  { key: 'cao', capital: 'xuchang', lordId: 'caocao' },
  { key: 'yuan', capital: 'ye', lordId: 'yuanshao' },
  { key: 'ce', capital: 'jianye', lordId: 'sunce' },
  { key: 'dong', capital: 'changan', lordId: 'dongzhuo' },
  { key: 'biao', capital: 'jiangling', lordId: 'liubiao' },
  { key: 'teng', capital: 'wuwei', lordId: 'mateng' },
  { key: 'zhang', capital: 'chengdu', lordId: 'liuzhang' },
  { key: 'gongsun', capital: 'beiping', lordId: 'gongsunzan' },
];

// 生成器：为兵力薄弱的 AI 势力补充随机「部将」（无技能，属性中等）。
// index 用于生成唯一 id，调用方负责保证其单调递增。
const GENERIC_SURNAMES = ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
const GENERIC_GIVENS = ['成', '武', '义', '忠', '安', '定', '远', '彪', '虎', '达', '凯', '平', '宁', '胜', '广'];
export function makeGenericGeneral(rng, index) {
  const r = rng || Math.random;
  const name = GENERIC_SURNAMES[Math.floor(r() * GENERIC_SURNAMES.length)]
    + GENERIC_GIVENS[Math.floor(r() * GENERIC_GIVENS.length)];
  const ri = (lo, hi) => Math.floor(lo + r() * (hi - lo));
  return {
    id: `gen_${index}`,
    name,
    generic: true,
    loyalty: ri(55, 85),
    stats: { l: ri(55, 82), w: ri(55, 85), i: ri(45, 78), p: ri(40, 72), c: ri(45, 75) },
    skill: null,
  };
}

// 在野「乡野人物」可携带的小技能池（弱化版，体现「随机人物」偶有奇才的惊喜感）
const GENERIC_WILD_SKILLS = [
  { name: '骁勇', effect: 'war:0.06' },
  { name: '善守', effect: 'def:0.08' },
  { name: '练兵', effect: 'train:0.10' },
  { name: '勤政', effect: 'p_grow:0.06' },
  { name: '机敏', effect: 'trick:0.06' },
  { name: '善御', effect: 'cap:0.06' },
];
// 生成在野随机人物：能力波动更大（既可能平庸，也可能藏龙卧虎），约三成携带一项弱技能。
// 用于开局散布各城，与名将并列，增加探索与登用的可玩度。
export function makeWildGeneral(rng, index) {
  const r = rng || Math.random;
  const name = GENERIC_SURNAMES[Math.floor(r() * GENERIC_SURNAMES.length)]
    + GENERIC_GIVENS[Math.floor(r() * GENERIC_GIVENS.length)];
  const ri = (lo, hi) => Math.floor(lo + r() * (hi - lo));
  const skill = r() < 0.3 ? GENERIC_WILD_SKILLS[Math.floor(r() * GENERIC_WILD_SKILLS.length)] : null;
  return {
    id: `genwild_${index}`,
    name,
    generic: true,
    loyalty: ri(45, 80),
    stats: { l: ri(38, 90), w: ri(38, 92), i: ri(32, 88), p: ri(32, 84), c: ri(35, 86) },
    skill: skill ? { ...skill } : null,
  };
}
