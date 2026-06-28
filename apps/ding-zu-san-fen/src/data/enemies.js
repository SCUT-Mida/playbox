// 敌军数据字典
// armor: NONE | PHYSICAL(物理减伤) | HEAVY(重甲·惧法) | MAGIC(魔抗·惧物)
// speed: px/秒；dmg: 对近战武将造成的伤害；gold: 击杀奖励；morale: 气势奖励
// heal: 巫医专属 —— 周期性治疗半径内友军（radius 格 / amount / interval 秒）
// leakLives: 漏怪扣血（默认 1，BOSS/精英更高）
export const ENEMIES = {
  yellowturban: {
    name: '黄巾兵', hp: 200, speed: 55, armor: 'NONE', dmg: 8, atkCD: 1.0,
    gold: 8, morale: 3, color: 0xd9b14a,
  },
  scout: {
    name: '黄巾斥候', hp: 130, speed: 145, armor: 'NONE', dmg: 6, atkCD: 0.8,
    gold: 7, morale: 2, color: 0xd6e08a,
  },
  cavalry: {
    name: '魏国骑兵', hp: 300, speed: 100, armor: 'PHYSICAL', dmg: 16, atkCD: 0.9,
    gold: 16, morale: 4, color: 0x6f9bd6,
  },
  warlock: {
    name: '妖术军师', hp: 340, speed: 50, armor: 'MAGIC', dmg: 18, atkCD: 1.1,
    gold: 20, morale: 5, color: 0xb08bd6,
  },
  shield: {
    name: '重甲盾兵', hp: 700, speed: 40, armor: 'HEAVY', dmg: 20, atkCD: 1.2,
    gold: 26, morale: 7, color: 0x9aa0a6,
  },
  shu_soldier: {
    name: '蜀地叛军', hp: 260, speed: 70, armor: 'NONE', dmg: 12, atkCD: 1.0,
    gold: 12, morale: 4, color: 0x6bbf7f,
  },
  // 巫医：不直接进攻，但周期治疗周围友军 —— 优先击杀，否则残血兵会被奶回来
  shaman: {
    name: '黄巾巫医', hp: 300, speed: 46, armor: 'MAGIC', dmg: 10, atkCD: 1.1,
    gold: 24, morale: 6, color: 0x6fc28a,
    heal: { radius: 1.7, amount: 45, interval: 1.6 },
  },
  // 战象：重型攻坚单位，血厚甲重惧法，漏怪扣双倍 —— 需策士/燃烧应对
  elephant: {
    name: '南蛮战象', hp: 1500, speed: 38, armor: 'HEAVY', dmg: 26, atkCD: 1.3,
    gold: 42, morale: 10, color: 0xa1886f, leakLives: 2,
  },
  boss_zhangjiao: {
    name: '天公将军·张角', hp: 6000, speed: 32, armor: 'HEAVY', dmg: 45, atkCD: 1.0,
    gold: 220, morale: 80, color: 0xc8a23a, boss: true, leakLives: 5,
  },
  boss_dongzhuo: {
    name: '相国·董卓', hp: 11000, speed: 30, armor: 'HEAVY', dmg: 55, atkCD: 1.0,
    gold: 360, morale: 120, color: 0x8c6d3f, boss: true, leakLives: 8,
  },
  boss_yuanshao: {
    name: '盟主·袁绍', hp: 9500, speed: 32, armor: 'HEAVY', dmg: 50, atkCD: 1.0,
    gold: 300, morale: 110, color: 0xb89a4a, boss: true, leakLives: 6,
  },
  boss_caofleet: {
    name: '曹军旗舰', hp: 14000, speed: 28, armor: 'HEAVY', dmg: 60, atkCD: 1.0,
    gold: 420, morale: 140, color: 0x5a6a8a, boss: true, leakLives: 8,
  },
  boss_menghuo: {
    name: '蛮王·孟获', hp: 16500, speed: 30, armor: 'HEAVY', dmg: 62, atkCD: 1.0,
    gold: 480, morale: 150, color: 0x9c6b3a, boss: true, leakLives: 8,
  },
  // —— 扩展关卡首领 ——
  boss_lvbu: {
    name: '飞将·吕布', hp: 9200, speed: 34, armor: 'HEAVY', dmg: 50, atkCD: 1.0,
    gold: 320, morale: 110, color: 0xb08a3a, boss: true, leakLives: 6,
  },
  boss_yuanshu: {
    name: '仲家帝·袁术', hp: 7800, speed: 32, armor: 'HEAVY', dmg: 44, atkCD: 1.1,
    gold: 280, morale: 100, color: 0xc4a23a, boss: true, leakLives: 5,
  },
  boss_machao: {
    name: '锦马超', hp: 15000, speed: 38, armor: 'PHYSICAL', dmg: 60, atkCD: 0.9,
    gold: 440, morale: 140, color: 0x8a9ec4, boss: true, leakLives: 7,
  },
  boss_sunquan: {
    name: '吴主·孙权', hp: 15600, speed: 30, armor: 'HEAVY', dmg: 58, atkCD: 1.0,
    gold: 450, morale: 145, color: 0x3a6f9a, boss: true, leakLives: 8,
  },
  boss_simayi: {
    name: '冢虎·司马懿', hp: 17200, speed: 30, armor: 'MAGIC', dmg: 64, atkCD: 1.0,
    gold: 480, morale: 150, color: 0x7a5aa0, boss: true, leakLives: 8,
  },
};
