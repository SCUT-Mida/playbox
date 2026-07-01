// ============================================================================
// 事件随机库（Event Library）：随机事件池、加权抽取、抉择结算。
// 每个事件含若干「选项」，选项的 apply(p, rng) 返回结算结果：
//   { outcome: string, changes: {health:+5,...}, logs?:[{text,type}], career?, flags? }
// 事件按生命阶段挂载，部分还有额外 cond（如已就业才能升职）。
// ============================================================================
import { stageForAge, ageYearsFromWeeks, RECENT_EVENT_COOLDOWN } from '../config.js';
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
  {
    id: 'vaccine', emoji: '💉', stage: ['infant'], weight: 4,
    title: '预防接种', text: '到了打疫苗的日子，社区医院里一片此起彼伏的哭声。',
    options: [
      { label: '按时接种', emoji: '✅', apply: (p, r) => {
        if (r() < 0.85) return { outcome: '哭了一阵便好了，换来了结实的免疫力。', changes: { health: 5, mood: -2 } };
        return { outcome: '接种后低烧了一两天，所幸无碍。', changes: { health: 2, mood: -4 } };
      } },
      { label: '心疼孩子先缓缓', emoji: '😣', apply: () => ({ outcome: '一拖再拖，抵抗力反倒没跟上。', changes: { health: -3 } }) },
    ],
  },
  {
    id: 'daycare', emoji: '🧸', stage: ['infant'], weight: 4,
    title: '送托儿所', text: '父母都要上班，商量着要不要把你送去托儿所。',
    options: [
      { label: '早送早适应', emoji: '🏫', apply: (p, r) => {
        if (r() < 0.6) return { outcome: '虽然开头哭闹，但很快交到了小伙伴，社交开窍。', changes: { social: 7, mood: 3, health: -1 } };
        return { outcome: '分离焦虑严重，闹了好一阵子才适应。', changes: { social: 3, mood: -4 } };
      } },
      { label: '留在长辈身边', emoji: '👵', apply: () => ({ outcome: '被宠着长大，安全感满满，却少了些玩伴。', changes: { mood: 5, social: -2 } }) },
    ],
  },
  {
    id: 'night_cry', emoji: '🌙', stage: ['infant'], weight: 3,
    title: '夜啼闹觉', text: '一连几晚你都在半夜哭醒，全家人都被熬成了熊猫眼。',
    options: [
      { label: '耐心哄睡、调整作息', emoji: '🍼', apply: () => ({ outcome: '慢慢养成了好作息，大人也松了口气。', changes: { health: 3, mood: 3 } }) },
      { label: '随哭随喂图省事', emoji: '😴', apply: () => ({ outcome: '暂时止住了哭，却养成了奶睡的坏习惯。', changes: { mood: 2, health: -2 } }) },
    ],
  },

  // ===================== 学龄期 =====================
  {
    id: 'exam', emoji: '📝', stage: ['child'], weight: 7,
    title: '期中考试', text: '一场重要的考试近在眼前，同学都在临时抱佛脚。',
    options: [
      { label: '挑灯夜战冲刺', emoji: '🕯️', apply: (p) => {
        // 底子好的冲刺如虎添翼，底子差的多半事倍功半。
        const smart = p.attrs.intelligence;
        if (smart >= 70) return { outcome: '厚积薄发，成绩一鸣惊人，被老师当众表扬。', changes: { intelligence: 8, mood: 5, social: 3, health: -3 } };
        if (smart >= 45) return { outcome: '成绩出来名列前茅，只是熬出了黑眼圈。', changes: { intelligence: 6, health: -4, mood: 2 } };
        return { outcome: '临时抱佛脚收效甚微，成绩平平，还累得够呛。', changes: { intelligence: 2, health: -5, mood: -2 } };
      } },
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
  {
    id: 'first_crush', emoji: '💘', stage: ['child'], weight: 4,
    title: '青涩心事', text: '你对班里一个同学生出朦胧的好感，心里小鹿乱撞。',
    options: [
      { label: '递张小纸条表白', emoji: '📝', apply: (p, r) => {
        if (r() < 0.45) return { outcome: '对方竟也红着脸回了信，少年心事甜得发慌。', changes: { mood: 9, social: 5 } };
        return { outcome: '被婉拒了，窘得几天抬不起头。', changes: { mood: -5, social: 2, intelligence: 1 } };
      } },
      { label: '默默喜欢就好', emoji: '🤫', apply: () => ({ outcome: '把心事藏在日记里，化作学习的动力。', changes: { intelligence: 4, mood: 1 } }) },
    ],
  },
  {
    id: 'contest', emoji: '🏆', stage: ['child'], weight: 4,
    title: '学科竞赛', text: '老师推荐你代表班级参加市里的学科竞赛。',
    options: [
      { label: '闭关特训冲刺奖牌', emoji: '🥇', apply: (p, r) => {
        const win = r() < (p.attrs.intelligence >= 65 ? 0.8 : 0.4);
        if (win) return { outcome: '一鸣惊人拿了奖，成了学校的小名人！', changes: { intelligence: 8, social: 6, mood: 7, health: -3 } };
        return { outcome: '高强度备战却铩羽而归，累得脱了层皮。', changes: { intelligence: 3, health: -5, mood: -3 } };
      } },
      { label: '量力而行重在参与', emoji: '😌', apply: () => ({ outcome: '开阔了眼界，名次不重要，收获不少。', changes: { intelligence: 3, mood: 2, social: 2 } }) },
    ],
  },
  {
    id: 'puberty', emoji: '🔀', stage: ['child'], weight: 3,
    title: '青春叛逆', text: '进入青春期，你开始嫌父母唠叨，动不动就顶嘴。',
    options: [
      { label: '和父母好好沟通', emoji: '🤝', apply: () => ({ outcome: '一番长谈后互相理解，家里恢复了笑声。', changes: { mood: 5, social: 4 } }) },
      { label: '关门把自己关起来', emoji: '🚪', apply: () => ({ outcome: '谁也不理，沉浸在自己的小世界里。', changes: { mood: -3, social: -3, intelligence: 2 } }) },
    ],
  },

  // ===================== 成年期 =====================
  {
    id: 'job_interview', emoji: '💼', stage: ['adult'], weight: 8,
    cond: (p) => !p.career,
    title: '求职面试', text: '毕业在即，你坐在一间公司的面试室外，攥紧了简历。',
    options: [
      { label: '应聘大厂卷起来', emoji: '🏢', apply: (p, r) => {
        // 学历（智力）越高，越容易卷进大厂。
        const win = r() < (p.attrs.intelligence >= 70 ? 0.78 : p.attrs.intelligence >= 45 ? 0.55 : 0.32);
        if (win) return { outcome: '过五关斩六将，拿到大厂 offer，从此走上快车道。', changes: { wealth: 14, intelligence: 4, health: -4, mood: 5 }, career: '大厂白领', careerLevel: 2 };
        return { outcome: '竞争太激烈遗憾落选，只能再找机会。', changes: { mood: -6, intelligence: 2 } };
      } },
      { label: '考个稳定的编制', emoji: '🏛️', apply: (p, r) => {
        const win = r() < (p.attrs.intelligence >= 60 ? 0.78 : 0.6);
        if (win) return { outcome: '上岸成功，端起了铁饭碗，安稳度日。', changes: { wealth: 8, mood: 6, social: 4 }, career: '公职人员', careerLevel: 1 };
        return { outcome: '差一点点惜败，但复习的功底没白费。', changes: { intelligence: 4, mood: -3 } };
      } },
      { label: '先去小店打工糊口', emoji: '🛠️', apply: () => ({ outcome: '先谋生再谋发展，靠双手吃饭不丢人。', changes: { wealth: 5, health: -3 }, career: '打工人', careerLevel: 1 }) },
    ],
  },
  {
    id: 'promotion', emoji: '📈', stage: ['adult'], weight: 6,
    cond: (p) => !!p.career,
    title: '升职机会', text: '领导暗示有个升职名额，只是要承担更多责任与加班。',
    options: [
      { label: '主动争取、加班加点', emoji: '🌙', apply: (p, r) => {
        // 能力（智力）过硬更可能拿下名额；拿到则职级 +1，后续被动收入随之水涨船高。
        const win = r() < (p.attrs.intelligence >= 65 ? 0.85 : 0.55);
        if (win) return { outcome: '升职加薪到手，职级更上一层，可健康和心情都亮了红灯。', changes: { wealth: 12, health: -6, mood: -4, social: -2 }, careerLevel: (p.careerLevel || 1) + 1 };
        return { outcome: '拼尽全力却惜败，竹篮打水一场空，身心俱疲。', changes: { health: -5, mood: -5 } };
      } },
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
  {
    id: 'buy_home', emoji: '🏠', stage: ['adult'], weight: 5,
    cond: (p) => !p.flags?.homeowner,
    title: '安家置业', text: '看了半年的房，中介催你赶紧下手，可首付不是小数目。',
    options: [
      { label: '咬牙贷款买下来', emoji: '🔑', apply: (p, r) => {
        if (p.attrs.wealth < 30) return { outcome: '首付东拼西凑仍不够，白忙一场。', changes: { mood: -5, wealth: -4 } };
        if (r() < 0.7) return { outcome: '终于有了自己的小窝，累并快乐着。', changes: { mood: 12, social: 4, wealth: -20 }, flags: { homeowner: true } };
        return { outcome: '房价阴跌，账面浮亏，但好歹安了家。', changes: { mood: 3, wealth: -22 }, flags: { homeowner: true } };
      } },
      { label: '继续观望租房', emoji: '🧾', apply: () => ({ outcome: '把钱留在手里更灵活，心里却也少份踏实。', changes: { wealth: 3, mood: -1 } }) },
    ],
  },
  {
    id: 'have_baby', emoji: '👶', stage: ['adult'], weight: 5,
    cond: (p) => !!p.flags?.married && (p.flags?.children || 0) < 2,
    title: '添丁之喜', text: '伴侣和你商量，是不是该迎接一个小生命了。',
    options: [
      { label: '满心欢喜迎接新生命', emoji: '🍼', apply: (p) => ({ outcome: '孩子的啼哭让这个家热闹又幸福，开销也大增。', changes: { mood: 12, social: 6, wealth: -10, health: -3 }, flags: { children: (p.flags?.children || 0) + 1 } }) },
      { label: '再享受几年二人世界', emoji: '👫', apply: () => ({ outcome: '决定先把日子过好，孩子的事往后放放。', changes: { mood: 3, wealth: 2 } }) },
    ],
  },
  {
    id: 'layoff', emoji: '📉', stage: ['adult'], weight: 4,
    cond: (p) => !!p.career,
    title: '裁员风暴', text: '行业寒冬，公司传出了裁员的消息，人人自危。',
    options: [
      { label: '主动争取留下来的机会', emoji: '🛡️', apply: (p, r) => {
        const keep = r() < (p.attrs.intelligence >= 60 ? 0.7 : 0.4);
        if (keep) return { outcome: '凭实力留了下来，还接手了更多业务。', changes: { wealth: 4, intelligence: 3, health: -3 } };
        return { outcome: '还是没躲过裁员，拿着赔偿金开始找下家。', changes: { wealth: -8, mood: -8, social: -2 }, careerLevel: Math.max(1, (p.careerLevel || 1) - 1) };
      } },
      { label: '趁机拿赔偿歇一阵', emoji: '🎒', apply: () => ({ outcome: '给自己放了个长假，调整状态再出发。', changes: { mood: 4, health: 4, wealth: -6 } }) },
    ],
  },
  {
    id: 'further_study', emoji: '🎓', stage: ['adult'], weight: 4,
    cond: (p) => !!p.career,
    title: '在职深造', text: '单位有在职读研 / 考证的名额，要占用不少业余时间。',
    options: [
      { label: '咬牙坚持拿下学位', emoji: '📚', apply: (p, r) => {
        if (r() < (p.attrs.intelligence >= 55 ? 0.8 : 0.5)) return { outcome: '顺利毕业，专业能力大涨，职级也跟着上调。', changes: { intelligence: 10, wealth: -6, mood: 4, health: -3 }, careerLevel: (p.careerLevel || 1) + 1 };
        return { outcome: '工学矛盾太突出，没能坚持下来。', changes: { intelligence: 3, mood: -4, wealth: -4 } };
      } },
      { label: '安于现状不折腾', emoji: '☕', apply: () => ({ outcome: '把业余时间留给家人和自己，岁月静好。', changes: { mood: 3, social: 2 } }) },
    ],
  },
  {
    id: 'midlife', emoji: '🧭', stage: ['adult'], weight: 3,
    title: '中年危机', text: '人到中年，你望着天花板出神：这一切究竟是不是自己想要的生活？',
    options: [
      { label: '重拾年轻时的爱好', emoji: '🎸', apply: () => ({ outcome: '久违的热情被点燃，仿佛又活过来了。', changes: { mood: 9, health: 2, intelligence: 2 } }) },
      { label: '和爱人朋友倾诉', emoji: '🗨️', apply: () => ({ outcome: '把心里话说出来，卸下了大半包袱。', changes: { mood: 6, social: 6 } }) },
      { label: '一个人硬扛', emoji: '🥃', apply: () => ({ outcome: '借酒消愁愁更愁，身体也跟着垮了。', changes: { mood: -6, health: -4, wealth: -3 } }) },
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
  {
    id: 'elder_college', emoji: '🎓', stage: ['elder'], weight: 4,
    title: '老年大学', text: '社区开了老年大学，书法、摄影、合唱班应有尽有。',
    options: [
      { label: '报名学点新东西', emoji: '🖌️', apply: () => ({ outcome: '结识了一帮老同学，每天都过得很充实。', changes: { intelligence: 5, social: 7, mood: 6 } }) },
      { label: '觉得自己学不动了', emoji: '🪑', apply: () => ({ outcome: '错失了热闹，日子更添几分寂寥。', changes: { mood: -3, social: -2 } }) },
    ],
  },
  {
    id: 'pet', emoji: '🐕', stage: ['elder'], weight: 4,
    cond: (p) => !p.flags?.pet,
    title: '毛茸茸的陪伴', text: '孩子不在身边，你考虑养只宠物解解闷。',
    options: [
      { label: '领养一只猫狗', emoji: '🐾', apply: () => ({ outcome: '小家伙蹭着你撒娇，屋子重新热闹起来。', changes: { mood: 10, social: 4, health: 2 }, flags: { pet: true } }) },
      { label: '怕照顾不来算了', emoji: '🚶', apply: () => ({ outcome: '继续一个人发呆，偶尔觉得空落落的。', changes: { mood: -2 } }) },
    ],
  },
  {
    id: 'chronic', emoji: '💊', stage: ['elder'], weight: 4,
    title: '慢性病找上门', text: '体检确诊了高血压、糖尿病之类的慢性病，需要长期控制。',
    options: [
      { label: '严格遵医嘱管理', emoji: '🥗', apply: () => ({ outcome: '指标控制得不错，带病也能颐养天年。', changes: { health: 4, wealth: -4, mood: 2 } }) },
      { label: '想起来才吃点药', emoji: '🍪', apply: () => ({ outcome: '管不住嘴也迈不开腿，病情慢慢加重。', changes: { health: -8, mood: -2 } }) },
    ],
  },
  {
    id: 'mentor', emoji: '🧑‍🏫', stage: ['elder'], weight: 3,
    title: '发挥余热', text: '社区请你给年轻人讲讲自己这一行的经验。',
    options: [
      { label: '欣然受邀、倾囊相授', emoji: '🎙️', apply: () => ({ outcome: '看到后辈成长，成就感满满，人也精神了。', changes: { social: 8, mood: 7, intelligence: 2 } }) },
      { label: '婉拒、清闲度日', emoji: '🍵', apply: () => ({ outcome: '落得清闲，只是少了几分被需要的踏实。', changes: { mood: 1, health: 1 } }) },
    ],
  },

  // ===================== 婴儿期 · 扩充（细分月龄 / 出身）=====================
  {
    id: 'first_words', emoji: '🗣️', stage: ['infant'], weight: 5, minAge: 1, maxAge: 4,
    title: '牙牙学语', text: '你含混不清地蹦出了人生第一个完整的词，全家人都屏住了呼吸。',
    options: [
      { label: '指着东西反复念', emoji: '👉', apply: (p) => ({ outcome: p.attrs.mood >= 60 ? '大人越夸你越爱说，词汇量蹭蹭涨。' : '虽说得磕巴，慢慢也学会了表达。', changes: { intelligence: 5, social: 3, mood: 2 } }) },
      { label: '懒得多说，靠哼哼', emoji: '😗', apply: () => ({ outcome: '表达欲不强，但动作机灵得很。', changes: { health: 2, mood: 2 } }) },
    ],
  },
  {
    id: 'new_sibling', emoji: '👶', stage: ['infant'], weight: 3, minAge: 1,
    title: '添了弟妹', text: '家里迎来了新的小生命，大人的注意力一下被分走大半。',
    options: [
      { label: '好奇地凑过去看', emoji: '👀', apply: (p, r) => {
        if (r() < 0.6) return { outcome: '你成了护着弟妹的小大人，社交早早开窍。', changes: { social: 6, mood: 3 }, flags: { sibling: true } };
        return { outcome: '虽有点失落，但也慢慢接受了新成员。', changes: { mood: -2, social: 3 }, flags: { sibling: true } };
      } },
      { label: '闹脾气争宠', emoji: '😤', apply: () => ({ outcome: '一阵子的醋意，安全感受了点影响。', changes: { mood: -4, social: 1 }, flags: { sibling: true } }) },
    ],
  },
  {
    id: 'food_allergy', emoji: '🥜', stage: ['infant'], weight: 3, minAge: 0, maxAge: 5,
    title: '辅食过敏', text: '第一次尝某样辅食，你起了满脸红疹，急坏了大人。',
    options: [
      { label: '立刻停食就医排查', emoji: '🩺', apply: () => ({ outcome: '查清了过敏原，以后小心避开就好。', changes: { health: 2, wealth: -2, intelligence: 1 } }) },
      { label: '以为是上火，观察观察', emoji: '🌶️', apply: (p, r) => {
        if (r() < 0.5) return { outcome: '红疹自行退了，所幸无大碍。', changes: { health: -1 } };
        return { outcome: '拖成了较重的反应，住进了医院。', changes: { health: -7, wealth: -4 } };
      } },
    ],
  },
  {
    id: 'infant_music', emoji: '🎶', stage: ['infant'], weight: 3, bg: ['artisan', 'scholar'],
    title: '耳濡目染', text: '家里常年丝竹管弦 / 书声琅琅，你也跟着咿呀哼唱。',
    options: [
      { label: '跟着节拍手舞足蹈', emoji: '💃', apply: () => ({ outcome: '乐感与性情都被悄悄滋养。', changes: { mood: 6, intelligence: 3 } }) },
      { label: '听一会儿就睡着', emoji: '😴', apply: () => ({ outcome: '在乐声里酣睡，格外安稳。', changes: { health: 3, mood: 2 } }) },
    ],
  },

  // ===================== 学龄期 · 扩充（细分年级 / 属性 / 出身）=====================
  {
    id: 'first_day_school', emoji: '🎒', stage: ['child'], weight: 5, minAge: 6, maxAge: 9,
    title: '开学第一天', text: '背着崭新的小书包，你第一次走进校园，既兴奋又紧张。',
    options: [
      { label: '主动找同桌搭话', emoji: '🤝', apply: () => ({ outcome: '很快就交到了第一个朋友。', changes: { social: 6, mood: 4 } }) },
      { label: '乖乖坐好等老师', emoji: '🪑', apply: () => ({ outcome: '被夸懂事，却错过了一些玩伴。', changes: { intelligence: 2, mood: 1, social: -1 } }) },
    ],
  },
  {
    id: 'science_fair', emoji: '🔬', stage: ['child'], weight: 4, minAge: 9, maxAge: 15,
    title: '科技小发明', text: '学校举办科技节，你想做个什么样的小作品？',
    options: [
      { label: '做个精巧的机械装置', emoji: '⚙️', apply: (p) => ({ outcome: p.attrs.intelligence >= 60 ? '一举拿下最佳创意奖！' : '虽没获奖，但动手能力大涨。', changes: { intelligence: 6, mood: 3, health: -1 } }) },
      { label: '做个好看的手抄报', emoji: '🖍️', apply: () => ({ outcome: '图文并茂，得了个参与奖。', changes: { mood: 3, intelligence: 2 } }) },
    ],
  },
  {
    id: 'part_time', emoji: '🧹', stage: ['child'], weight: 3, minAge: 14, maxAge: 18,
    title: '暑期打工', text: '暑假漫长，同学都去打零工赚零花钱了。',
    options: [
      { label: '去发传单 / 端盘子', emoji: '💵', apply: () => ({ outcome: '尝到了挣钱的不易，也攒下第一桶金。', changes: { wealth: 6, social: 3, health: -3, intelligence: 1 } }) },
      { label: '在家专心学习', emoji: '📖', apply: () => ({ outcome: '弯道超车，成绩提升不少。', changes: { intelligence: 5, mood: 1 } }) },
    ],
  },
  {
    id: 'online_world', emoji: '💻', stage: ['child'], weight: 4, minAge: 11, maxAge: 18,
    title: '网络世界', text: '你迷上了上网，一有空就盯着屏幕。',
    options: [
      { label: '沉迷游戏短视频', emoji: '🎮', apply: (p) => ({ outcome: '一时快乐，视力成绩双双下滑。', changes: { mood: 5, health: -5, intelligence: -3 } }) },
      { label: '用它学编程 / 看纪录片', emoji: '🌐', apply: () => ({ outcome: '打开了新世界的大门，见识大涨。', changes: { intelligence: 7, mood: 2, social: 2 } }) },
      { label: '克制使用，多去户外', emoji: '🌳', apply: () => ({ outcome: '作息规律，身心都健康。', changes: { health: 4, mood: 3 } }) },
    ],
  },
  {
    id: 'bookworm', emoji: '📚', stage: ['child'], weight: 3, minAge: 7,
    cond: (p) => p.attrs.intelligence >= 60 || p.background === 'scholar',
    title: '手不释卷', text: '你迷上了读书，走到哪都揣着一本。',
    options: [
      { label: '广泛涉猎各科', emoji: '🧠', apply: () => ({ outcome: '知识面与思辨力都远超同龄人。', changes: { intelligence: 8, mood: 3, social: -1 } }) },
      { label: '只读喜欢的类型', emoji: '🔖', apply: () => ({ outcome: '乐在其中，性情也沉静下来。', changes: { intelligence: 4, mood: 4 } }) },
    ],
  },
  {
    id: 'athletic_talent', emoji: '🏃', stage: ['child'], weight: 3, minAge: 8,
    cond: (p) => p.attrs.health >= 65,
    title: '运动天赋', text: '体育老师发现你跑得比谁都快，建议进校队。',
    options: [
      { label: '加入校队刻苦训练', emoji: '🏅', apply: () => ({ outcome: '体能突飞猛进，还结识了一帮铁哥们。', changes: { health: 8, social: 5, intelligence: -1 } }) },
      { label: '当作业余爱好', emoji: '🚲', apply: () => ({ outcome: '劳逸结合，身心舒展。', changes: { health: 4, mood: 3 } }) },
    ],
  },
  {
    id: 'art_gift', emoji: '🎨', stage: ['child'], weight: 3, minAge: 7,
    cond: (p) => p.background === 'artisan' || p.attrs.mood >= 70,
    title: '艺术天分', text: '你的画作 / 乐声被老师大加赞赏，说是块好料子。',
    options: [
      { label: '拜师系统学习', emoji: '🎭', apply: () => ({ outcome: '审美与心境都上了个台阶。', changes: { mood: 7, intelligence: 4, social: 2, wealth: -2 } }) },
      { label: '只当自娱自乐', emoji: '🖌️', apply: () => ({ outcome: '保留了纯粹的快乐。', changes: { mood: 5, intelligence: 2 } }) },
    ],
  },
  {
    id: 'act_out', emoji: '💢', stage: ['child'], weight: 3, minAge: 9,
    cond: (p) => p.attrs.social < 35 || p.attrs.mood < 30,
    title: '情绪外溢', text: '因为不太合群 / 心情低落，你开始对同学恶作剧甚至起冲突。',
    options: [
      { label: '被点醒后主动道歉', emoji: '🙏', apply: () => ({ outcome: '诚恳认错，反而赢回了一些好感。', changes: { social: 5, mood: 3, intelligence: 1 } }) },
      { label: '变本加厉', emoji: '😤', apply: () => ({ outcome: '被请家长、被孤立，心情更糟了。', changes: { social: -5, mood: -4, intelligence: -1 } }) },
    ],
  },
  {
    id: 'poor_kid', emoji: '🥪', stage: ['child'], weight: 3, minAge: 7,
    cond: (p) => p.attrs.wealth < 30,
    title: '家境拮据', text: '同学们都有零花钱买零食，你只能默默啃自家带的馒头。',
    options: [
      { label: '把委屈化作动力', emoji: '💪', apply: () => ({ outcome: '人穷志不短，学习格外拼命。', changes: { intelligence: 5, mood: -1, social: -1 } }) },
      { label: '自卑寡言', emoji: '🥺', apply: () => ({ outcome: '越发内向，总觉得自己低人一等。', changes: { mood: -5, social: -3 } }) },
    ],
  },
  {
    id: 'rich_kid', emoji: '🧧', stage: ['child'], weight: 3, minAge: 7,
    cond: (p) => p.attrs.wealth >= 75,
    title: '零花钱自由', text: '你兜里总有不少零花钱，成了同学围着的中心。',
    options: [
      { label: '大方请客分享', emoji: '🤲', apply: () => ({ outcome: '朋友多了起来，可也交了些酒肉朋友。', changes: { social: 6, mood: 3, wealth: -4 } }) },
      { label: '把钱攒着买大件', emoji: '🧸', apply: () => ({ outcome: '学会了延迟满足，买到心仪已久的宝贝。', changes: { mood: 5, intelligence: 2 } }) },
    ],
  },

  // ===================== 成年期 · 扩充（细分早/中/晚期 + 属性 + 出身）=====================
  // —— 青年期 18~30 ——
  {
    id: 'college', emoji: '🎓', stage: ['adult'], weight: 5, minAge: 18, maxAge: 24,
    cond: (p) => !p.career,
    title: '升学深造', text: '高考放榜，是去读大学还是直接工作？',
    options: [
      { label: '考取理想大学', emoji: '🏛️', apply: (p, r) => {
        const win = r() < (p.attrs.intelligence >= 60 ? 0.8 : 0.45);
        if (win) return { outcome: '四年苦读，学识与人脉都上了大台阶。', changes: { intelligence: 12, social: 5, wealth: -6, mood: 5 } };
        return { outcome: '落榜了，只能先谋生。', changes: { mood: -6, intelligence: 3 } };
      } },
      { label: '读个专科早就业', emoji: '🛠️', apply: () => ({ outcome: '学了门手艺，早早踏入社会。', changes: { intelligence: 4, wealth: 4, career: '技术工人', careerLevel: 1 } }) },
    ],
  },
  {
    id: 'first_apartment', emoji: '🧳', stage: ['adult'], weight: 4, minAge: 18, maxAge: 32,
    cond: (p) => !p.flags?.homeowner,
    title: '独居生活', text: '你搬出了家门，第一次拥有自己的小窝（哪怕是合租）。',
    options: [
      { label: '精心布置收拾', emoji: '🛋️', apply: () => ({ outcome: '独居的自在让心情飞扬，也学会照顾自己。', changes: { mood: 7, health: 2, wealth: -3 } }) },
      { label: '将就着住', emoji: '🧹', apply: () => ({ outcome: '省了钱，可生活品质一般。', changes: { wealth: 2, mood: 1 } }) },
    ],
  },
  {
    id: 'dating_app', emoji: '📱', stage: ['adult'], weight: 4, minAge: 18, maxAge: 35,
    cond: (p) => !p.flags?.married,
    title: '社交软件', text: '朋友撺掇你装个交友软件，说是能认识更多人。',
    options: [
      { label: '认真筛选、真诚交友', emoji: '💌', apply: (p, r) => {
        if (r() < (p.attrs.social >= 55 ? 0.55 : 0.3)) return { outcome: '聊得投机，约出来后颇有好感。', changes: { mood: 6, social: 5 } };
        return { outcome: '聊了一圈都不了了之，略感疲惫。', changes: { mood: -3, social: 1 } };
      } },
      { label: '觉得不靠谱，卸载了', emoji: '🗑️', apply: () => ({ outcome: '宁缺毋滥，把时间留给自己。', changes: { mood: 2, intelligence: 1 } }) },
    ],
  },
  {
    id: 'side_hustle', emoji: '🛵', stage: ['adult'], weight: 4, minAge: 18, maxAge: 40,
    title: '副业开源', text: '主业之外，你琢磨着搞点副业增加收入。',
    options: [
      { label: '利用专长接私活', emoji: '💼', apply: (p) => ({ outcome: p.attrs.intelligence >= 55 ? '凭借本事，副业收入渐成规模。' : '辛苦折腾，赚点辛苦钱。', changes: { wealth: 8, health: -3, intelligence: 1 } }) },
      { label: '下班跑网约车 / 外卖', emoji: '🛵', apply: () => ({ outcome: '体力活换钱，累但实在。', changes: { wealth: 6, health: -5, social: 1 } }) },
      { label: '太累了算了', emoji: '🛌', apply: () => ({ outcome: '保住了休息，收入也就那样。', changes: { health: 2, mood: 2 } }) },
    ],
  },
  // —— 中年期 28~50 ——
  {
    id: 'investment', emoji: '📊', stage: ['adult'], weight: 4, minAge: 28,
    cond: (p) => p.attrs.wealth >= 55,
    title: '理财投资', text: '手里有些积蓄，朋友劝你别让钱闲着。',
    options: [
      { label: '稳健配置基金定投', emoji: '🏦', apply: (p, r) => {
        if (r() < 0.65) return { outcome: '长期持有收益可观，财富稳步增值。', changes: { wealth: 10, intelligence: 2 } };
        return { outcome: '行情低迷，浮亏了一阵。', changes: { wealth: -5, mood: -2 } };
      } },
      { label: '梭哈热门股票', emoji: '🎲', apply: (p, r) => {
        if (r() < 0.35) return { outcome: '踩中风口，账面瞬间大涨！', changes: { wealth: 18, mood: 6 } };
        return { outcome: '高位接盘，被深套割肉。', changes: { wealth: -16, mood: -7 } };
      } },
      { label: '只存定期保本', emoji: '🐷', apply: () => ({ outcome: '安稳无虞，收益微薄。', changes: { wealth: 2, mood: 1 } }) },
    ],
  },
  {
    id: 'home_renovation', emoji: '🔨', stage: ['adult'], weight: 3, minAge: 28,
    cond: (p) => !!p.flags?.homeowner,
    title: '装修翻新', text: '住久了的房子想翻新一下，可好装修不便宜。',
    options: [
      { label: '咬牙精装升级', emoji: '✨', apply: (p, r) => {
        if (p.attrs.wealth < 35) return { outcome: '预算超标，装到一半捉襟见肘。', changes: { wealth: -8, mood: -3 } };
        return { outcome: '焕然一新，住着舒心，家人也开心。', changes: { mood: 8, wealth: -10, social: 2 } };
      } },
      { label: '简单收拾就好', emoji: '🧽', apply: () => ({ outcome: '花小钱办大事，居家环境改善不少。', changes: { mood: 4, wealth: -3 } }) },
    ],
  },
  {
    id: 'aging_parent', emoji: '🦽', stage: ['adult'], weight: 4, minAge: 30,
    title: '父母年迈', text: '父母身体大不如前，越来越需要人照看。',
    options: [
      { label: '接到身边悉心照料', emoji: '👨‍👩‍👦', apply: () => ({ outcome: '尽孝的同时，家庭开支与精力都大增。', changes: { mood: 5, social: 4, wealth: -8, health: -2 } }) },
      { label: '请护工 / 送养老机构', emoji: '🏥', apply: (p) => ({ outcome: p.attrs.wealth >= 50 ? '专业照护，父母安适，你也安心。' : '费用吃紧，心里五味杂陈。', changes: { wealth: -10, mood: 1 } }) },
      { label: '兄弟姐妹分担', emoji: '🤝', apply: () => ({ outcome: '大家轮流照看，压力均摊。', changes: { social: 3, wealth: -4, mood: 2 } }) },
    ],
  },
  {
    id: 'social_club', emoji: '🎪', stage: ['adult'], weight: 3, minAge: 25,
    cond: (p) => p.attrs.social >= 60,
    title: '加入社团', text: '朋友拉你加入一个兴趣社团，活动丰富多彩。',
    options: [
      { label: '积极投身活动', emoji: '🎉', apply: () => ({ outcome: '结识了一群志同道合的朋友，生活多了色彩。', changes: { social: 7, mood: 5, wealth: -2 } }) },
      { label: '偶尔露个面', emoji: '👋', apply: () => ({ outcome: '保持联系但不深交。', changes: { social: 2, mood: 1 } }) },
    ],
  },
  {
    id: 'debt_trap', emoji: '📉', stage: ['adult'], weight: 3, minAge: 20,
    cond: (p) => p.attrs.wealth < 30,
    title: '债务泥潭', text: '入不敷出，你动了借网贷 / 刷信用卡透支的念头。',
    options: [
      { label: '克制消费、量入为出', emoji: '✂️', apply: () => ({ outcome: '咬牙还清欠款，理财观念也成熟了。', changes: { wealth: 4, intelligence: 3, mood: -1 } }) },
      { label: '拆东墙补西墙', emoji: '🕳️', apply: () => ({ outcome: '利滚利越陷越深，身心俱疲。', changes: { wealth: -12, mood: -8, health: -3 } }) },
    ],
  },
  {
    id: 'lawsuit', emoji: '⚖️', stage: ['adult'], weight: 2, minAge: 25,
    cond: (p) => p.attrs.wealth >= 80,
    title: '官司纠纷', text: '一桩合作 / 合同出了岔子，对方扬言要告你。',
    options: [
      { label: '请好律师据理力争', emoji: '🧑‍⚖️', apply: (p, r) => {
        if (r() < 0.6) return { outcome: '胜诉，捍卫了权益，只是律师费不菲。', changes: { wealth: -8, mood: 4, social: 2 } };
        return { outcome: '败诉赔钱，心情跌入谷底。', changes: { wealth: -18, mood: -7 } };
      } },
      { label: '破财私了', emoji: '🤝', apply: () => ({ outcome: '花钱消灾，尽快了结。', changes: { wealth: -10, mood: -1 } }) },
    ],
  },
  {
    id: 'charity', emoji: '🕊️', stage: ['adult'], weight: 2, minAge: 30,
    cond: (p) => p.attrs.wealth >= 70,
    title: '回馈社会', text: '事业有成，你想为公益出一份力。',
    options: [
      { label: '捐建一所希望小学', emoji: '🏫', apply: () => ({ outcome: '善举传扬，内心获得巨大的满足。', changes: { mood: 10, social: 9, wealth: -16 } }) },
      { label: '低调定期小额捐助', emoji: '🤲', apply: () => ({ outcome: '细水长流，心安理得。', changes: { mood: 5, social: 3, wealth: -5 } }) },
    ],
  },
  {
    id: 'scholar_research', emoji: '🔬', stage: ['adult'], weight: 3, minAge: 25, maxAge: 55,
    cond: (p) => p.background === 'scholar' && p.attrs.intelligence >= 60,
    title: '学术钻研', text: '凭借家学功底，你在某个领域深耕，有望出成果。',
    options: [
      { label: '埋头攻关发论文', emoji: '📝', apply: (p, r) => {
        if (r() < (p.attrs.intelligence >= 75 ? 0.7 : 0.4)) return { outcome: '成果发表，在学界崭露头角！', changes: { intelligence: 10, social: 4, mood: 6, wealth: 4 } };
        return { outcome: '研究受阻，进展缓慢。', changes: { intelligence: 4, mood: -3, health: -2 } };
      } },
      { label: '兼顾应用变现', emoji: '💸', apply: () => ({ outcome: '把学问转化成了收入。', changes: { intelligence: 5, wealth: 8, mood: 3 } }) },
    ],
  },
  {
    id: 'merchant_deal', emoji: '🤝', stage: ['adult'], weight: 3, minAge: 22, maxAge: 60,
    cond: (p) => p.background === 'merchant',
    title: '生意经', text: '自小耳濡目染的商贾直觉，让你嗅到一桩好买卖。',
    options: [
      { label: '果断出手做大单', emoji: '📈', apply: (p, r) => {
        if (r() < 0.55) return { outcome: '眼光精准，狠赚一笔！', changes: { wealth: 14, social: 3, mood: 5 } };
        return { outcome: '判断失误，亏了本。', changes: { wealth: -10, mood: -4 } };
      } },
      { label: '稳扎稳打做长线', emoji: '🐢', apply: () => ({ outcome: '不温不火，但细水长流。', changes: { wealth: 6, intelligence: 2 } }) },
    ],
  },
  // —— 中老年期 45~65 ——
  {
    id: 'empty_nest', emoji: '🏠', stage: ['adult'], weight: 4, minAge: 45,
    cond: (p) => (p.flags?.children || 0) > 0,
    title: '空巢来临', text: '孩子们相继离家求学工作，家里一下冷清了下来。',
    options: [
      { label: '培养新爱好充实自己', emoji: '🌾', apply: () => ({ outcome: '重新找到生活重心，自在惬意。', changes: { mood: 6, intelligence: 2, health: 1 } }) },
      { label: '整天惦记儿女', emoji: '🥹', apply: () => ({ outcome: '思念成疾，心情低落。', changes: { mood: -5, health: -2 } }) },
    ],
  },
  {
    id: 'retirement_plan', emoji: '🏦', stage: ['adult'], weight: 3, minAge: 50,
    title: '退休规划', text: '退休在望，你开始盘算晚年的财务与生活。',
    options: [
      { label: '提前储备养老金', emoji: '💰', apply: () => ({ outcome: '未雨绸缪，晚年更有底气。', changes: { wealth: -5, mood: 4, intelligence: 2 } }) },
      { label: '走一步看一步', emoji: '🤷', apply: () => ({ outcome: '没有规划，心里隐隐不安。', changes: { mood: -2 } }) },
    ],
  },
  {
    id: 'mentor_junior', emoji: '🧑‍🏫', stage: ['adult'], weight: 3, minAge: 40,
    cond: (p) => (p.careerLevel || 0) >= 3,
    title: '提携后辈', text: '作为资深前辈，有年轻人想拜你为师求指点。',
    options: [
      { label: '倾囊相授、甘当人梯', emoji: '🎓', apply: () => ({ outcome: '桃李满门，声望与人脉大涨。', changes: { social: 7, mood: 5, intelligence: 2 } }) },
      { label: '怕被取代而藏私', emoji: '🔒', apply: () => ({ outcome: '保住了位置，却失了人心。', changes: { social: -3, mood: -1 } }) },
    ],
  },

  // ===================== 老年期 · 扩充（细分兴趣 / 属性 / 家庭）=====================
  {
    id: 'garden', emoji: '🌻', stage: ['elder'], weight: 5, minAge: 65,
    title: '侍弄花草', text: '你在阳台 / 院子开辟了一方小花园，整日乐此不疲。',
    options: [
      { label: '精心培育稀奇品种', emoji: '🌷', apply: () => ({ outcome: '花开满园，心情与身体都被治愈。', changes: { mood: 7, health: 2, social: 2 } }) },
      { label: '随便种点好养活的', emoji: '🪴', apply: () => ({ outcome: '绿意盎然，日子悠然。', changes: { mood: 4, health: 1 } }) },
    ],
  },
  {
    id: 'memoir', emoji: '✍️', stage: ['elder'], weight: 3, minAge: 68,
    cond: (p) => p.attrs.intelligence >= 55,
    title: '撰写回忆录', text: '你想把这一生的故事写下来，留给后人。',
    options: [
      { label: '认真伏案写作', emoji: '📖', apply: () => ({ outcome: '回望来路，心境通透，头脑也更灵光。', changes: { intelligence: 4, mood: 6, social: 2 } }) },
      { label: '记了几页就搁笔', emoji: '🖊️', apply: () => ({ outcome: '兴致来得快去得也快。', changes: { mood: 2 } }) },
    ],
  },
  {
    id: 'will_dispute', emoji: '📜', stage: ['elder'], weight: 3, minAge: 70,
    cond: (p) => (p.flags?.children || 0) > 0,
    title: '遗产风波', text: '子女们对你将来的财产分配各有想法，气氛微妙。',
    options: [
      { label: '尽早立下公正遗嘱', emoji: '⚖️', apply: () => ({ outcome: '把话挑明，反倒避免了日后的纷争。', changes: { mood: 4, social: 3, wealth: -3 } }) },
      { label: '含糊其辞拖着', emoji: '🙊', apply: () => ({ outcome: '隐患埋下，家庭关系暗生嫌隙。', changes: { mood: -3, social: -4 } }) },
    ],
  },
  {
    id: 'elder_tech', emoji: '📲', stage: ['elder'], weight: 4, minAge: 65,
    title: '学用智能机', text: '孙辈教你用智能手机，视频通话、刷短视频样样新鲜。',
    options: [
      { label: '认真学会常用功能', emoji: '🧑‍🎓', apply: () => ({ outcome: '跟上时代，和远方亲人随时联系，不再孤单。', changes: { intelligence: 3, social: 5, mood: 4 } }) },
      { label: '觉得太复杂放弃了', emoji: '🤷', apply: () => ({ outcome: '与新时代隔了一层，愈发落伍。', changes: { mood: -2, social: -2 } }) },
    ],
  },
  {
    id: 'elder_travel', emoji: '🚂', stage: ['elder'], weight: 3, minAge: 65,
    cond: (p) => p.attrs.wealth >= 50,
    title: '夕阳红旅行', text: '老友们张罗报个老年旅行团，趁走得动去看看世界。',
    options: [
      { label: '结伴出游尽兴玩', emoji: '🏖️', apply: (p, r) => {
        if (r() < 0.8) return { outcome: '一路欢声笑语，留下了珍贵的回忆。', changes: { mood: 9, social: 5, health: -1, wealth: -8 } };
        return { outcome: '舟车劳顿闪了腰，扫了兴。', changes: { mood: -2, health: -5, wealth: -6 } };
      } },
      { label: '怕折腾婉拒', emoji: '🪑', apply: () => ({ outcome: '守着安稳，却也错过风景。', changes: { mood: -1, health: 1 } }) },
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
// 过滤维度（让抉择更丰富、不重复）：
//   1) 阶段 stage（必含）；2) 年龄窗口 minAge/maxAge（细分阶段内的早/中/晚期）；
//   3) cond(p) 自定义条件（如已就业、已婚、属性阈值）；4) bg 家庭出身（出身专属事件）。
// 去重冷却：优先排除「最近 RECENT_EVENT_COOLDOWN 个」已触发事件（若仍有其他可选），
// 缓解连续回合抽到同一事件的重复感；冷却记录写入 p.recent，由本函数集中维护。
export function rollEvent(p, rng) {
  const r = rng || Math.random;
  const st = stageKey(p);
  const age = ageYearsFromWeeks(p.weeks);
  const bg = p.background || 'ordinary';
  const pool = (EVENTS_BY_STAGE[st] || []).filter((ev) => {
    if (ev.cond && !ev.cond(p)) return false;
    if (Number.isFinite(ev.minAge) && age < ev.minAge) return false;
    if (Number.isFinite(ev.maxAge) && age >= ev.maxAge) return false;
    if (Array.isArray(ev.bg) && !ev.bg.includes(bg)) return false;
    return true;
  });
  if (!pool.length) return null;
  // 去重：优先未最近触发过的；全都被冷却时回退到整池（保证总有事件可抽）。
  const recent = Array.isArray(p.recent) ? p.recent : [];
  const fresh = pool.filter((ev) => !recent.includes(ev.id));
  const usePool = fresh.length ? fresh : pool;
  const weights = {};
  for (const ev of usePool) weights[ev.id] = ev.weight;
  const id = weightedPick(r, weights);
  const picked = usePool.find((ev) => ev.id === id) || usePool[0];
  if (picked) {
    if (!Array.isArray(p.recent)) p.recent = [];
    p.recent.push(picked.id);
    while (p.recent.length > RECENT_EVENT_COOLDOWN) p.recent.shift();
  }
  return picked;
}

// 手动清空「最近事件」冷却记录（调试 / 换阶段时调用）。
export function resetRecent(p) {
  if (p) p.recent = [];
  return p;
}

// 结算一个选项：应用属性变化、设置职业/职级/标志，返回带 outcome 文本的完整结果。
// 注意：option.apply 只返回 changes，真正的属性写入集中在此（applyChanges 已钳制）。
export function applyOption(p, option, rng) {
  const r = rng || Math.random;
  const res = option.apply(p, r) || {};
  if (res.career) { p.career = res.career; if (!p.careerLevel) p.careerLevel = 1; }
  if (Number.isFinite(res.careerLevel)) p.careerLevel = Math.max(1, Math.round(res.careerLevel));
  if (res.flags) p.flags = { ...(p.flags || {}), ...res.flags };
  const applied = res.changes ? applyChanges(p, res.changes) : {};
  return { ...res, applied };
}

// 生成一条不带抉择的「日常旁白」，用于没有触发事件的回合，增加沉浸感。
const AMBIENT = {
  infant: ['你咿呀学语，又学会了几个新词。', '你在摇篮里甜甜地睡了一觉。', '你被抱到户外晒太阳，好奇地四处张望。', '你抓着大人的手指咯咯直笑，又长大了一点点。', '辅食的滋味让你皱起了小脸。'],
  child: ['平凡的一天，照常上学、放学。', '课间和同学在操场上疯跑了一阵。', '今天的作业有点多，你咬牙写完了。', '放学路上你蹲在路边看蚂蚁搬家。', '你在日记本里写下了今天的小确幸。'],
  adult: ['按部就班的一天，忙忙碌碌。', '通勤路上你看着窗外的车水马龙出神。', '今天的工作平淡无奇地结束了。', '深夜加班完，你望着写字楼的灯火发愣。', '周末大扫除，把屋子收拾得井井有条。'],
  elder: ['晨起在公园里打了一套太极。', '午后阳光正好，你在摇椅上打了个盹。', '翻看旧相册，往事历历在目。', '你去早市挑了把新鲜的青菜，和小贩讨价还价。', '收音机里咿咿呀呀唱着老戏，你跟着哼了两句。'],
};
export function ambientLine(p, rng) {
  const r = rng || Math.random;
  const arr = AMBIENT[stageKey(p)] || AMBIENT.adult;
  return arr[Math.floor(r() * arr.length)];
}
