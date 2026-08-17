// ============================================================================
// 雄图三国 · 武将开罗风像素形象（共享素材库 _lib/kairo.js）
//
// 47 位名将逐人预设（LOOKS，对齐 data/heroes.js；配色与鼎足三分的阵营色
// 呼应——魏蓝 / 蜀绿 / 吴红 / 群棕紫，跨展品视觉统一）；
// 随机在野武将（wildSeq 生成）无预设，按五维最高项推导职业装束：
//   统率 l → 羽缨将盔 | 武力 w → 兜鍪佩剑 | 智力 i → 军师尖帽法杖
//   政治 p → 束发纶巾 | 魅力 c → 缨冠羽扇
// 再以名字哈希微调发色 / 胡须 / 表情，保证随机人物也互不撞脸。
// ============================================================================
import { kairoSpec } from '../../../_lib/kairo.js';

// 发色小调色板（随机武将按名字哈希取用）
const HAIRS = ['#17120f', '#2c2018', '#3c3430', '#4a3020', '#5a4432', '#6a5a48'];

// —— 47 位名将专属形象（衣甲色 / 冠帽 / 武器 / 须髯 / 神态）——
const LOOKS = {
  // AI 君主
  caocao:     { body: '#33415c', accent: '#f0c040', hat: 'plume', plume: '#f0c040', beard: '#2a2620', mood: 'angry' },
  yuanshao:   { body: '#6a5a8a', accent: '#f0c040', hat: 'crown', beard: '#2a2620', mood: 'smug' },
  sunce:      { body: '#cc4f36', accent: '#f0c040', hat: 'cap', plume: '#f0c040', weapon: 'sword', mood: 'angry' },
  dongzhuo:   { body: '#5a3a5a', accent: '#c8a24a', hat: 'crown', beard: '#241c14', beardLong: true, mood: 'smug' },
  liubiao:    { body: '#4a7a5a', accent: '#d8d0c0', hat: 'band', mood: 'happy' },
  mateng:     { body: '#8a5a3a', accent: '#e8d0a0', hat: 'plume', weapon: 'spear', mood: 'angry', beard: '#3a2c22' },
  liuzhang:   { body: '#7a7a4a', accent: '#d8d0c0', hat: 'wizard', mood: 'sleepy' },
  gongsunzan: { body: '#4a6a8a', accent: '#e8e8f0', hat: 'cap', plume: '#f0f0f0', weapon: 'spear', mood: 'smug' },
  // 曹操势力
  zhangliao:  { body: '#33415c', accent: '#f0c040', hat: 'plume', weapon: 'bow', mood: 'angry', beard: '#2a2620' },
  xiahoudun:  { body: '#33415c', accent: '#b0b8c0', hat: 'cap', weapon: 'sword', mood: 'angry', beard: '#2a2620' },
  xiahouyuan: { body: '#33415c', accent: '#b0b8c0', hat: 'plume', weapon: 'bow', mood: 'happy' },
  xuhuang:    { body: '#33415c', accent: '#b0b8c0', hat: 'cap', weapon: 'axe', mood: 'angry' },
  zhanghe:    { body: '#33415c', accent: '#b0b8c0', hat: 'plume', weapon: 'spear', mood: 'smug' },
  dianwei:    { body: '#3a3340', accent: '#8a8a96', hat: 'band', weapon: 'axe', mood: 'angry', hair: '#1c1814' },
  xuchu2:     { body: '#3a3340', accent: '#c8a24a', hat: 'band', weapon: 'axe', mood: 'happy', beard: '#2c241c' },
  guojia:     { body: '#476a9a', accent: '#d8e4f0', hat: 'wizard', weapon: 'fan', glow: '#9ec4e6', mood: 'glow', hairStyle: 'bun' },
  xunyu:      { body: '#476a9a', accent: '#d8e4f0', hat: 'band', mood: 'happy', hairStyle: 'bun' },
  jiaxu:      { body: '#473a5a', accent: '#b0a0c8', hat: 'wizard', weapon: 'staff', glow: '#a06fd0', mood: 'glow' },
  chengyu:    { body: '#476a9a', accent: '#d8e4f0', hat: 'wizard', mood: 'glow', glow: '#a8c8e0', beard: '#2a2620' },
  // 袁绍势力
  yanliang:   { body: '#6a5a8a', accent: '#e8d0a0', hat: 'cap', weapon: 'sword', mood: 'angry', beard: '#2c241c' },
  wenchou:    { body: '#6a5a8a', accent: '#e8d0a0', hat: 'cap', weapon: 'axe', mood: 'angry' },
  // 孙策势力（东吴）
  zhouyu:     { body: '#b04030', accent: '#f0c040', hat: 'wizard', weapon: 'staff', glow: '#ff8a3a', mood: 'glow', hairStyle: 'bun' },
  taishici:   { body: '#b04030', accent: '#f0c040', hat: 'plume', weapon: 'bow', mood: 'angry', beard: '#2a2620' },
  ganning:    { body: '#2f6f8a', accent: '#e8e0c8', hat: 'band', weapon: 'sword', mood: 'smug', hairStyle: 'spiky' },
  huanggai:   { body: '#b04030', accent: '#e8d0a0', hat: 'cap', weapon: 'shield', mood: 'angry', beard: '#eae6d8' },
  lvmeng:     { body: '#b04030', accent: '#f0c040', hat: 'cap', weapon: 'sword', mood: 'smug' },
  luxun:      { body: '#9a3a2a', accent: '#f0c040', hat: 'wizard', weapon: 'staff', glow: '#ff8a3a', mood: 'glow' },
  lusu:       { body: '#4a7a5a', accent: '#d8d0c0', hat: 'band', mood: 'happy', beard: '#2a2620' },
  // 群雄（在野 / 董卓系）
  lvbu:       { body: '#8a6a3a', accent: '#d0a040', hat: 'plume', plume: '#f0e8d0', doublePlume: true, weapon: 'spear', mood: 'angry' },
  huaxiong:   { body: '#5a3a5a', accent: '#c8a24a', hat: 'cap', weapon: 'sword', mood: 'angry', beard: '#2c241c' },
  gaoshun:    { body: '#5a3a5a', accent: '#b0b8c0', hat: 'cap', weapon: 'spear', mood: 'smug' },
  // 刘备势力（蜀）
  machao:     { body: '#a6b8c8', accent: '#3f6f9a', hat: 'plume', plume: '#4a7fa0', weapon: 'spear', mood: 'angry' },
  liubei:     { body: '#3da563', accent: '#f0c040', hat: 'crown', beard: '#2a2620', mood: 'happy' },
  guanyu:     { skin: '#cf7a55', body: '#2f7d4a', accent: '#f0c040', hat: 'plume', hatColor: '#246a3c', plume: '#2f7d4a', weapon: 'sword', mood: 'angry', beard: '#241c14', beardLong: true },
  zhangfei:   { skin: '#a97852', body: '#3a3340', accent: '#8a8a96', hat: 'cap', hatColor: '#2a2a30', weapon: 'sword', mood: 'angry', beard: '#241c14' },
  zhaoyun:    { body: '#b9c4cf', accent: '#c0392b', hat: 'cap', hatColor: '#aebcca', plume: '#f0f0f0', weapon: 'spear', mood: 'happy' },
  zhugeliang: { body: '#566070', accent: '#b0b8c0', hat: 'wizard', hatColor: '#42424d', glow: '#9ec4e6', weapon: 'fan', fanColor: '#dfe7ee', mood: 'glow' },
  huangzhong: { body: '#9a7430', accent: '#f0c040', hat: 'plume', weapon: 'bow', mood: 'happy', beard: '#eae6d8' },
  pangtong:   { skin: '#d8a878', body: '#7a4636', accent: '#d08a3a', hat: 'wizard', glow: '#ff9a3a', weapon: 'staff', mood: 'glow' },
  fazheng:    { body: '#3f6f5a', accent: '#d8e4d0', hat: 'wizard', mood: 'glow', glow: '#a8d0b8', beard: '#2a2620' },
  weiyan:     { body: '#8a5a3a', accent: '#c8a24a', hat: 'cap', weapon: 'sword', mood: 'angry', beard: '#241c14' },
  jiangwei:   { body: '#3da563', accent: '#f0c040', hat: 'plume', weapon: 'spear', mood: 'smug' },
  // 特殊 / 后期
  huatuo:     { body: '#7ab88a', accent: '#e8f0e0', hat: 'none', weapon: 'staff', glow: '#8ad0a0', mood: 'happy', beard: '#eae6d8', hair: '#d8d4cc' },
  simayi:     { body: '#473a5a', accent: '#8a6aa0', hat: 'wizard', weapon: 'staff', glow: '#a06fd0', mood: 'glow' },
  dengai:     { body: '#33415c', accent: '#b0b8c0', hat: 'cap', weapon: 'spear', mood: 'smug' },
  zhonghui:   { body: '#6a5a8a', accent: '#f0c040', hat: 'plume', weapon: 'sword', mood: 'smug' },
  simazhao:   { body: '#33415c', accent: '#f0c040', hat: 'crown', mood: 'smug', beard: '#2a2620' },
};

// 名字哈希：随机武将的发色 / 胡须 / 表情微调来源（确定性，同名单稳定同脸）
function hashName(name) {
  let h = 5381;
  for (let i = 0; i < (name || '').length; i++) h = ((h << 5) + h + name.charCodeAt(i)) >>> 0;
  return h;
}

// 随机武将：按五维最高项推导装束
function derivedLook(hero) {
  const st = hero.stats || {};
  const best = ['l', 'w', 'i', 'p', 'c'].reduce((a, k) => ((st[k] || 0) > (st[a] || 0) ? k : a), 'w');
  const base = {
    l: { hat: 'plume', weapon: 'sword', mood: 'smug' },   // 统帅：羽缨将盔
    w: { hat: 'cap', weapon: 'sword', mood: 'angry' },     // 猛将：兜鍪佩剑
    i: { hat: 'wizard', weapon: 'staff', mood: 'glow' },   // 军师：尖帽法杖
    p: { hat: 'band', mood: 'happy' },                     // 文官：束发纶巾
    c: { hat: 'cap', plume: '#f0c040', weapon: 'fan', mood: 'happy' }, // 名士：缨冠羽扇
  }[best];
  const h = hashName(hero.name || hero.id || '');
  return {
    body: '#5a6f9a',
    accent: '#f0c040',
    hair: HAIRS[h % HAIRS.length],
    beard: (h % 3 === 0) ? '#2c241c' : null,
    ...base,
  };
}

// 武将 → 开罗风形象描述
export function heroLook(hero) {
  if (!hero) return kairoSpec({ plan: 'chibi', name: '武将' });
  const o = LOOKS[hero.id];
  return kairoSpec({ plan: 'chibi', name: hero.name || '武将', ...(o || derivedLook(hero)) });
}
