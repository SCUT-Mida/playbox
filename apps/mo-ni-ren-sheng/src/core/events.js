// ============================================================================
// 事件随机库（Event Library）：随机事件池、加权抽取、抉择结算。
// 每个事件含若干「选项」，选项的 apply(p, rng) 返回结算结果：
//   { outcome: string, changes: {health:+5,...}, logs?:[{text,type}], career?, flags? }
// 事件按生命阶段挂载，部分还有额外 cond（如已就业才能升职）。
// ============================================================================
import { stageForAge, ageYearsFromWeeks } from '../config.js';
import { weightedPick, randInt } from './rng.js';
import { applyChanges } from './player.js';

// stage 取当前阶段 key。
function stageKey(p) {
  return stageForAge(ageYearsFromWeeks(p.weeks)).key;
}

// —— 事件池 ——
// cond/pick 阶段越靠后越可能涉及事业与人际；权重决定相对出现频率。
export const EVENTS = [
  // ===================== 婴儿期 =====================
  {
    id: 'first_step', emoji: '🚼', stage: ['infant'], weight: 6,
    title: '蹒跚学步', text: '你摇摇晃晃地迈出人生第一步，扑进了大人怀里。',
    options: [
      { label: '勇敢多走几步', emoji: '💪', apply: () => ({ outcome: '跌跌撞撞却越走越稳，体格也更结实了。', changes: { health: 4, mood: 3 } }) },
      { label: '累了就爬着玩', emoji: '😴', apply: () => ({ outcome: '爬来爬去也乐在其中，心情不错。', changes: { mood: 4 } }) },
    ],
  },
  {
    id: 'infant_sick', emoji: '🤒', stage: ['infant'], weight: 5,
    title: '突发高烧', text: '半夜里你烧得滚烫，全家急成一团。',
    options: [
      { label: '连夜送医', emoji: '🏥', apply: (p, r) => {
        if (r() < 0.7) return { outcome: '及时就医，有惊无险地退了烧。', changes: { health: -2, wealth: -3, mood: -2 } };
        return { outcome: '在医院折腾一宿，好在烧退了，只是元气大伤。', changes: { health: -6, wealth: -5 } };
      } },
      { label: '在家物理降温', emoji: '🧊', apply: (p, r) => {
        if (r() < 0.5) return { outcome: '退烧贴加温水擦身，竟然熬了过来。', changes: { health: -4 } };
        return { outcome: '烧退得慢，身体吃了点亏。', changes: { health: -8, mood: -3 } };
      } },
    ],
  },
  {
    id: 'zhuazhou', emoji: '🎁', stage: ['infant'], weight: 4,
    title: '周岁抓周', text: '满周岁这天，面前摆满了书、算盘、印章……你伸手去抓。',
    options: [
      { label: '抓起一本书', emoji: '📕', apply: () => ({ outcome: '长辈笑称此子必成读书种子。', changes: { intelligence: 7, mood: 3 } }) },
      { label: '抓起算盘', emoji: '🧮', apply: () => ({ outcome: '众人都说你将来会算账管钱。', changes: { wealth: 7, intelligence: 2 } }) },
      { label: '抓起拨浪鼓', emoji: '🪈', apply: () => ({ outcome: '你咯咯笑着挥舞，逗得满堂喝彩。', changes: { mood: 8, social: 4 } }) },
    ],
  },

  // ===================== 学龄期 =====================
  {
    id: 'exam', emoji: '📝', stage: ['child'], weight: 7,
    title: '期中考试', text: '一场重要的考试近在眼前，同学都在临时抱佛脚。',
    options: [
      { label: '挑灯夜战冲刺', emoji: '🕯️', apply: () => ({ outcome: '成绩出来名列前茅，只是熬出了黑眼圈。', changes: { intelligence: 8, health: -4, mood: 2 } }) },
      { label: '保持节奏正常发挥', emoji: '😌', apply: () => ({ outcome: '不温不火，成绩中等偏上。', changes: { intelligence: 3, mood: 2 } }) },
      { label: '破罐破摔交白卷', emoji: '🫠', apply: () => ({ outcome: '被请了家长，心里很不是滋味。', changes: { intelligence: -2, mood: -5, social: -2 } }) },
    ],
  },
  {
    id: 'bully', emoji: '👊', stage: ['child'], weight: 5,
    title: '校园风波', text: '几个高年级学生堵住你讨要零花钱。',
    options: [
      { label: '硬气回击', emoji: '🥋', apply: (p, r) => {
        if (r() < 0.5) return { outcome: '你据理力争，对方竟被震住退去了，赢得同学佩服。', changes: { social: 6, health: -2, mood: 4 } };
        return { outcome: '寡不敌众挨了几下，但没交出零花钱。', changes: { health: -6, mood: -3, social: 2 } };
      } },
      { label: '破财消灾', emoji: '💸', apply: () => ({ outcome: '交出零花钱息事宁人，却闷闷不乐。', changes: { wealth: -6, mood: -4 } }) },
      { label: '告诉老师', emoji: '👩‍🏫', apply: () => ({ outcome: '老师出面处理，风波平息，你也学会求助。', changes: { mood: 3, social: 3 } }) },
    ],
  },
  {
    id: 'best_friend', emoji: '🧑‍🤝‍🧑', stage: ['child'], weight: 6,
    title: '结交挚友', text: '课间有个同学主动和你分享零食，聊得投机。',
    options: [
      { label: '回赠并以心相交', emoji: '🍬', apply: () => ({ outcome: '你们成了形影不离的好友。', changes: { social: 8, mood: 5, wealth: -2 } }) },
      { label: '客气收下保持距离', emoji: '🙂', apply: () => ({ outcome: '关系不咸不淡，算是认识。', changes: { social: 3 } }) },
    ],
  },
  {
    id: 'hobby', emoji: '🎸', stage: ['child'], weight: 5,
    title: '兴趣之门', text: '学校开了各种兴趣班，你想报名哪一个？',
    options: [
      { label: '奥数 / 编程', emoji: '🧮', apply: () => ({ outcome: '逻辑思维突飞猛进。', changes: { intelligence: 7, mood: -2 } }) },
      { label: '美术 / 音乐', emoji: '🎨', apply: () => ({ outcome: '审美与心境都得到滋养。', changes: { mood: 6, intelligence: 3 } }) },
      { label: '体育 / 球队', emoji: '⚽', apply: () => ({ outcome: '体能上来了，还结识了一帮队友。', changes: { health: 7, social: 4 } }) },
    ],
  },
  {
    id: 'transfer', emoji: '🏫', stage: ['child'], weight: 3,
    title: '转学风波', text: '因父母工作调动，你不得不转去陌生的学校。',
    options: [
      { label: '主动融入新集体', emoji: '🤗', apply: () => ({ outcome: '很快交到新朋友，适应良好。', changes: { social: 5, mood: 3 } }) },
      { label: '默默想念旧友', emoji: '🥺', apply: () => ({ outcome: '一时难以适应，成绩和心情都受影响。', changes: { mood: -4, social: -3, intelligence: -2 } }) },
    ],
  },

  // ===================== 成年期 =====================
  {
    id: 'job_interview', emoji: '💼', stage: ['adult'], weight: 8,
    cond: (p) => !p.career,
    title: '求职面试', text: '毕业在即，你坐在一间公司的面试室外，攥紧了简历。',
    options: [
      { label: '应聘大厂卷起来', emoji: '🏢', apply: (p, r) => {
        if (r() < 0.55) return { outcome: '过五关斩六将，拿到大厂 offer，从此走上快车道。', changes: { wealth: 14, intelligence: 4, health: -4, mood: 5 }, career: '大厂白领' };
        return { outcome: '竞争太激烈遗憾落选，只能再找机会。', changes: { mood: -6, intelligence: 2 } };
      } },
      { label: '考个稳定的编制', emoji: '🏛️', apply: (p, r) => {
        if (r() < 0.65) return { outcome: '上岸成功，端起了铁饭碗，安稳度日。', changes: { wealth: 8, mood: 6, social: 4 }, career: '公职人员' };
        return { outcome: '差一点点惜败，但复习的功底没白费。', changes: { intelligence: 4, mood: -3 } };
      } },
      { label: '先去小店打工糊口', emoji: '🛠️', apply: () => ({ outcome: '先谋生再谋发展，靠双手吃饭不丢人。', changes: { wealth: 5, health: -3 }, career: '打工人' }) },
    ],
  },
  {
    id: 'promotion', emoji: '📈', stage: ['adult'], weight: 6,
    cond: (p) => !!p.career,
    title: '升职机会', text: '领导暗示有个升职名额，只是要承担更多责任与加班。',
    options: [
      { label: '主动争取、加班加点', emoji: '🌙', apply: () => ({ outcome: '升职加薪到手，可健康和心情都亮了红灯。', changes: { wealth: 12, health: -6, mood: -4, social: -2 } }) },
      { label: '佛系应对、按时下班', emoji: '🧘', apply: () => ({ outcome: '升职轮不到你，但身心舒泰，家人欣慰。', changes: { mood: 5, health: 3, social: 3 } }) },
    ],
  },
  {
    id: 'startup', emoji: '🚀', stage: ['adult'], weight: 4,
    title: '创业风口', text: '朋友拉你一起创业，说是千载难逢的风口。',
    options: [
      { label: '梭哈全部积蓄入伙', emoji: '🎲', apply: (p, r) => {
        if (r() < 0.35) return { outcome: '风口真来了，公司估值暴涨，你一夜财务自由！', changes: { wealth: 30, mood: 12, social: 6 }, career: '创业老板' };
        return { outcome: '风口转眼变虎口，积蓄血本无归。', changes: { wealth: -25, mood: -12, health: -5 } };
      } },
      { label: '小额投资试水', emoji: '🪙', apply: (p, r) => {
        if (r() < 0.5) return { outcome: '小赚一笔，权当零花钱。', changes: { wealth: 8, mood: 3 } };
        return { outcome: '试水失败，亏了点小钱，长了个教训。', changes: { wealth: -6, intelligence: 2 } };
      } },
      { label: '婉拒，安稳为上', emoji: '🙅', apply: () => ({ outcome: '你守住了本分，但也错过了一场狂欢。', changes: { mood: 2, intelligence: 2 } }) },
    ],
  },
  {
    id: 'marriage', emoji: '💍', stage: ['adult'], weight: 6,
    cond: (p) => !p.flags?.married,
    title: '缘分降临', text: '相亲对象竟和你聊得格外投机，对方暗示想进一步。',
    options: [
      { label: '勇敢步入婚姻', emoji: '👰', apply: () => ({ outcome: '办了场热闹的婚礼，从此有了一个温暖的家。', changes: { mood: 14, social: 8, wealth: -10 }, flags: { married: true } }) },
      { label: '再处处看，不着急', emoji: '🐢', apply: () => ({ outcome: '保持恋爱关系，享受二人世界。', changes: { mood: 6, social: 4 } }) },
      { label: '婉拒，专注事业', emoji: '🎯', apply: () => ({ outcome: '你把心思放回工作，却也偶尔感到孤独。', changes: { wealth: 5, mood: -3, social: -3 } }) },
    ],
  },
  {
    id: 'overtime', emoji: '🏭', stage: ['adult'], weight: 7,
    cond: (p) => !!p.career,
    title: '连轴加班', text: '项目deadline逼近，已经连着加班一周。',
    options: [
      { label: '咬牙再撑几天', emoji: '🥵', apply: () => ({ outcome: '奖金到手，可身体和心情都透支了。', changes: { wealth: 10, health: -8, mood: -6 } }) },
      { label: '及时喊停休整', emoji: '🛌', apply: () => ({ outcome: '项目延期挨了批，但身体要紧。', changes: { health: 5, mood: 4, wealth: -3 } }) },
    ],
  },
  {
    id: 'loan_friend', emoji: '🤲', stage: ['adult'], weight: 5,
    title: '朋友借钱', text: '老友登门，说遇到难处想借笔钱周转。',
    options: [
      { label: '慷慨解囊', emoji: '💛', apply: (p, r) => {
        if (r() < 0.55) return { outcome: '朋友渡过难关，事后连本带利还了，情谊更深。', changes: { social: 8, mood: 4 } };
        return { outcome: '钱借出去便如泥牛入海，朋友也疏远了。', changes: { wealth: -10, social: -4, mood: -5 } };
      } },
      { label: '婉言拒绝', emoji: '🙅', apply: () => ({ outcome: '保住了钱包，但朋友心里有了芥蒂。', changes: { social: -4, mood: -2 } }) },
    ],
  },
  {
    id: 'travel', emoji: '✈️', stage: ['adult'], weight: 5,
    title: '说走就走', text: '年假还没用完，你想策划一场旅行。',
    options: [
      { label: '远行看世界', emoji: '🌍', apply: () => ({ outcome: '见了天地与众生，心境豁然开朗。', changes: { mood: 12, social: 5, wealth: -10, intelligence: 3 } }) },
      { label: '周边放松一下', emoji: '🏕️', apply: () => ({ outcome: '短途小憩，疲惫散去大半。', changes: { mood: 6, health: 3, wealth: -4 } }) },
      { label: '宅家省钱', emoji: '🏠', apply: () => ({ outcome: '省下了旅费，却觉得日子有点寡淡。', changes: { wealth: 3, mood: -2 } }) },
    ],
  },
  {
    id: 'health_scare', emoji: '🩺', stage: ['adult'], weight: 4,
    title: '体检警报', text: '体检报告上几个指标亮了红灯，医生建议你改变生活方式。',
    options: [
      { label: '严格自律、健身养生', emoji: '🏃', apply: () => ({ outcome: '半年后复查指标全绿，人也精神了。', changes: { health: 12, mood: 4, wealth: -3 } }) },
      { label: '该吃吃该喝喝', emoji: '🍖', apply: () => ({ outcome: '一时痛快，隐患却埋下了。', changes: { mood: 3, health: -6 } }) },
    ],
  },

  // ===================== 老年期 =====================
  {
    id: 'grandkids', emoji: '🧸', stage: ['elder'], weight: 6,
    title: '含饴弄孙', text: '孙辈来家里过周末，叽叽喳喳围着你转。',
    options: [
      { label: '陪他们尽情玩耍', emoji: '🤸', apply: () => ({ outcome: '天伦之乐让你返老还童，只是有点累。', changes: { mood: 12, social: 6, health: -3 } }) },
      { label: '讲讲过去的故事', emoji: '📖', apply: () => ({ outcome: '孩子们听得入神，你也被回忆温暖。', changes: { mood: 8, social: 5, intelligence: 2 } }) },
    ],
  },
  {
    id: 'reunion', emoji: '🍶', stage: ['elder'], weight: 5,
    title: '老友重逢', text: '几十年没见的老同学张罗了一场聚会。',
    options: [
      { label: '盛装赴约', emoji: '🕺', apply: () => ({ outcome: '把酒言欢忆当年，仿佛又回到少年时。', changes: { mood: 10, social: 8, health: -2, wealth: -3 } }) },
      { label: '担心身体婉拒', emoji: '🪑', apply: () => ({ outcome: '错过了重逢，夜里多少有些怅然。', changes: { mood: -4, social: -3 } }) },
    ],
  },
  {
    id: 'regimen', emoji: '🧘', stage: ['elder'], weight: 6,
    title: '养生之道', text: '公园里流行起各种养生方法，你也想试试。',
    options: [
      { label: '科学饮食、规律作息', emoji: '🥗', apply: () => ({ outcome: '气色肉眼可见地好了起来。', changes: { health: 9, mood: 3 } }) },
      { label: '听信偏方乱补一通', emoji: '⚗️', apply: (p, r) => {
        if (r() < 0.4) return { outcome: '误打误撞竟有些效果。', changes: { health: 3 } };
        return { outcome: '乱补伤身，反倒住了几天院。', changes: { health: -8, wealth: -6 } };
      } },
    ],
  },
  {
    id: 'legacy', emoji: '📜', stage: ['elder'], weight: 4,
    title: '分配遗产', text: '你想趁头脑清醒，把毕生积蓄做个安排。',
    options: [
      { label: '捐给公益机构', emoji: '🕊️', apply: () => ({ outcome: '善举传为佳话，内心无比安宁。', changes: { mood: 12, social: 8, wealth: -15 } }) },
      { label: '留给子女', emoji: '🏡', apply: () => ({ outcome: '子女感激涕零，家庭和睦。', changes: { mood: 6, social: 6 } }) },
      { label: '花在自己身上享福', emoji: '🛳️', apply: () => ({ outcome: '晚年奢靡快活，钱也花得值。', changes: { mood: 10, wealth: -12 } }) },
    ],
  },
  {
    id: 'fall', emoji: '🩼', stage: ['elder'], weight: 4,
    title: '意外跌倒', text: '雨天路滑，你在小区门口重重摔了一跤。',
    options: [
      { label: '坚持做康复训练', emoji: '💪', apply: (p, r) => {
        if (r() < 0.6) return { outcome: '咬牙复健，勉强恢复了大半行动力。', changes: { health: -3, mood: 3 } };
        return { outcome: '年纪大了恢复慢，元气大伤。', changes: { health: -10, mood: -4 } };
      } },
      { label: '静养听天由命', emoji: '🛏️', apply: () => ({ outcome: '卧床休养，身体一天不如一天。', changes: { health: -8, mood: -5, social: -3 } }) },
    ],
  },
];

// 事件挂载索引：stage -> [event]，供抽取时快速过滤。
const EVENTS_BY_STAGE = {};
for (const ev of EVENTS) {
  for (const st of (ev.stage || ['infant', 'child', 'adult', 'elder'])) {
    (EVENTS_BY_STAGE[st] ||= []).push(ev);
  }
}

// 加权抽取一个当前可触发的事件。返回事件对象或 null。
export function rollEvent(p, rng) {
  const r = rng || Math.random;
  const st = stageKey(p);
  const pool = (EVENTS_BY_STAGE[st] || []).filter((ev) => !ev.cond || ev.cond(p));
  if (!pool.length) return null;
  const weights = {};
  for (const ev of pool) weights[ev.id] = ev.weight;
  const id = weightedPick(r, weights);
  return pool.find((ev) => ev.id === id) || pool[0];
}

// 结算一个选项：应用属性变化、设置职业/标志，返回带 outcome 文本的完整结果。
// 注意：option.apply 只返回 changes，真正的属性写入集中在此（applyChanges 已钳制）。
export function applyOption(p, option, rng) {
  const r = rng || Math.random;
  const res = option.apply(p, r) || {};
  if (res.career) p.career = res.career;
  if (res.flags) p.flags = { ...(p.flags || {}), ...res.flags };
  const applied = res.changes ? applyChanges(p, res.changes) : {};
  return { ...res, applied };
}

// 生成一条不带抉择的「日常旁白」，用于没有触发事件的回合，增加沉浸感。
const AMBIENT = {
  infant: ['你咿呀学语，又学会了几个新词。', '你在摇篮里甜甜地睡了一觉。', '你被抱到户外晒太阳，好奇地四处张望。'],
  child: ['平凡的一天，照常上学、放学。', '课间和同学在操场上疯跑了一阵。', '今天的作业有点多，你咬牙写完了。'],
  adult: ['按部就班的一天，忙忙碌碌。', '通勤路上你看着窗外的车水马龙出神。', '今天的工作平淡无奇地结束了。'],
  elder: ['晨起在公园里打了一套太极。', '午后阳光正好，你在摇椅上打了个盹。', '翻看旧相册，往事历历在目。'],
};
export function ambientLine(p, rng) {
  const r = rng || Math.random;
  const arr = AMBIENT[stageKey(p)] || AMBIENT.adult;
  return arr[Math.floor(r() * arr.length)];
}
