// 敌军数据字典
// armor: NONE | PHYSICAL(物理减伤) | HEAVY(重甲·惧法) | MAGIC(魔抗·惧物)
// speed: px/秒；dmg: 对近战武将造成的伤害；gold: 击杀奖励；morale: 气势奖励
export const ENEMIES = {
  yellowturban: {
    name: '黄巾兵', hp: 200, speed: 55, armor: 'NONE', dmg: 8, atkCD: 1.0,
    gold: 8, morale: 3, color: 0xd9b14a, shape: 'tri',
  },
  scout: {
    name: '黄巾斥候', hp: 130, speed: 145, armor: 'NONE', dmg: 6, atkCD: 0.8,
    gold: 7, morale: 2, color: 0xd6e08a, shape: 'tri',
  },
  cavalry: {
    name: '魏国骑兵', hp: 300, speed: 100, armor: 'PHYSICAL', dmg: 16, atkCD: 0.9,
    gold: 16, morale: 4, color: 0x6f9bd6, shape: 'diamond',
  },
  warlock: {
    name: '妖术军师', hp: 340, speed: 50, armor: 'MAGIC', dmg: 18, atkCD: 1.1,
    gold: 20, morale: 5, color: 0xb08bd6, shape: 'circle',
  },
  shield: {
    name: '重甲盾兵', hp: 780, speed: 40, armor: 'HEAVY', dmg: 20, atkCD: 1.2,
    gold: 26, morale: 7, color: 0x9aa0a6, shape: 'rect',
  },
  shu_soldier: {
    name: '蜀地叛军', hp: 260, speed: 70, armor: 'NONE', dmg: 12, atkCD: 1.0,
    gold: 12, morale: 4, color: 0x6bbf7f, shape: 'diamond',
  },
  boss_zhangjiao: {
    name: '天公将军·张角', hp: 6000, speed: 32, armor: 'HEAVY', dmg: 45, atkCD: 1.0,
    gold: 220, morale: 80, color: 0xc8a23a, shape: 'hex', boss: true, leakLives: 5,
  },
  boss_dongzhuo: {
    name: '相国·董卓', hp: 11000, speed: 30, armor: 'HEAVY', dmg: 55, atkCD: 1.0,
    gold: 360, morale: 120, color: 0x8c6d3f, shape: 'hex', boss: true, leakLives: 8,
  },
};
