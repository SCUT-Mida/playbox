// 程序化音效合成（Web Audio API）—— 无需任何外部音频资源，
// 与本项目"全部素材程序化绘制"的理念保持一致。
// 所有调用均包裹在 try/catch 中：音效是锦上添花，绝不能影响游戏逻辑。

let ctx = null;
let master = null;
let muted = false;

function ensure() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.45;
    master.connect(ctx.destination);
  } catch {
    ctx = null;
  }
  return ctx;
}

// 浏览器策略：AudioContext 必须在用户手势后才能发声。在首次点击时调用。
export function unlock() {
  const c = ensure();
  if (!c) return;
  try {
    if (c.state === 'suspended') c.resume();
  } catch {
    /* noop */
  }
}

export function setMuted(v) {
  muted = !!v;
  if (master) {
    try {
      master.gain.value = muted ? 0 : 0.45;
    } catch {
      /* noop */
    }
  }
}

export function isMuted() {
  return muted;
}

// 单个音符：freq 起始频率，slideTo 滑音终点
function tone({ freq, type = 'sine', dur = 0.12, vol = 0.3, attack = 0.005, slideTo = null, delay = 0 }) {
  const c = ensure();
  if (!c || muted) return;
  try {
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  } catch {
    /* noop */
  }
}

// 噪声 burst：用于劈砍/部署/火焰等
function noise({ dur = 0.15, vol = 0.22, filterType = 'highpass', freq = 1000, delay = 0 }) {
  const c = ensure();
  if (!c || muted) return;
  try {
    const t0 = c.currentTime + delay;
    const frames = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, frames, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const src = c.createBufferSource();
    src.buffer = buf;
    const filt = c.createBiquadFilter();
    filt.type = filterType;
    filt.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filt).connect(g).connect(master);
    src.start(t0);
    src.stop(t0 + dur + 0.03);
  } catch {
    /* noop */
  }
}

// —— 具名音效 ——
const SFX = {
  click() {
    tone({ freq: 520, type: 'square', dur: 0.05, vol: 0.12 });
  },
  tab() {
    tone({ freq: 660, type: 'triangle', dur: 0.07, vol: 0.14, slideTo: 880 });
  },
  place() {
    // 落地"咚"
    tone({ freq: 240, type: 'sine', dur: 0.16, vol: 0.32, slideTo: 110 });
    noise({ dur: 0.08, vol: 0.12, filterType: 'lowpass', freq: 600 });
  },
  slash() {
    noise({ dur: 0.09, vol: 0.18, filterType: 'highpass', freq: 2600 });
    tone({ freq: 720, type: 'sawtooth', dur: 0.08, vol: 0.1, slideTo: 420 });
  },
  shoot() {
    tone({ freq: 1100, type: 'sawtooth', dur: 0.07, vol: 0.09, slideTo: 620 });
  },
  magic() {
    tone({ freq: 880, type: 'triangle', dur: 0.12, vol: 0.12, slideTo: 1320 });
  },
  skill() {
    // 上扬 + 微光
    tone({ freq: 420, type: 'triangle', dur: 0.22, vol: 0.2, slideTo: 1240 });
    tone({ freq: 840, type: 'sine', dur: 0.22, vol: 0.1, delay: 0.04 });
  },
  kill() {
    tone({ freq: 520, type: 'triangle', dur: 0.12, vol: 0.16, slideTo: 180 });
  },
  hurt() {
    tone({ freq: 180, type: 'square', dur: 0.12, vol: 0.16, slideTo: 90 });
  },
  wave() {
    // 号角
    tone({ freq: 320, type: 'sawtooth', dur: 0.4, vol: 0.16 });
    tone({ freq: 240, type: 'sawtooth', dur: 0.4, vol: 0.12, delay: 0.02 });
  },
  ult() {
    // 火烧连营：噪声 + 下行铜管
    noise({ dur: 0.5, vol: 0.22, filterType: 'bandpass', freq: 800 });
    tone({ freq: 440, type: 'sawtooth', dur: 0.5, vol: 0.22, slideTo: 160 });
    tone({ freq: 220, type: 'square', dur: 0.5, vol: 0.12, slideTo: 80, delay: 0.05 });
  },
  win() {
    // 上行琶音 C E G C
    [523, 659, 784, 1047].forEach((f, i) => {
      tone({ freq: f, type: 'triangle', dur: 0.22, vol: 0.2, delay: i * 0.12 });
    });
  },
  lose() {
    [392, 330, 262, 196].forEach((f, i) => {
      tone({ freq: f, type: 'sawtooth', dur: 0.3, vol: 0.16, delay: i * 0.16 });
    });
  },
  coin() {
    tone({ freq: 1180, type: 'square', dur: 0.07, vol: 0.14 });
    tone({ freq: 1560, type: 'square', dur: 0.1, vol: 0.14, delay: 0.06 });
  },
  error() {
    tone({ freq: 200, type: 'square', dur: 0.12, vol: 0.14, slideTo: 140 });
  },
  gacha() {
    // 抽卡光效
    [659, 880, 1175, 1568].forEach((f, i) => {
      tone({ freq: f, type: 'triangle', dur: 0.18, vol: 0.16, delay: i * 0.07 });
    });
  },
  reveal() {
    // 揭晓和弦
    [523, 659, 784].forEach((f) => {
      tone({ freq: f, type: 'sine', dur: 0.4, vol: 0.14 });
    });
  },
  unlock() {
    [784, 1047, 1568].forEach((f, i) => {
      tone({ freq: f, type: 'triangle', dur: 0.25, vol: 0.18, delay: i * 0.08 });
    });
  },
  // —— 战斗事件音效（丰富反馈）——
  boss() {
    // BOSS 出场：低沉双层铜锣 + 警报感下行
    tone({ freq: 160, type: 'sawtooth', dur: 0.7, vol: 0.24, slideTo: 70 });
    tone({ freq: 110, type: 'square', dur: 0.7, vol: 0.16, slideTo: 55, delay: 0.04 });
    noise({ dur: 0.5, vol: 0.16, filterType: 'lowpass', freq: 500, delay: 0.02 });
  },
  ready() {
    // 大招就绪：清亮上行双音 + 闪烁
    tone({ freq: 988, type: 'triangle', dur: 0.16, vol: 0.18 });
    tone({ freq: 1319, type: 'sine', dur: 0.28, vol: 0.16, delay: 0.1 });
  },
  bond() {
    // 羁绊激活：大三和弦（C E G）齐鸣，明亮
    [523, 659, 784].forEach((f) => {
      tone({ freq: f, type: 'triangle', dur: 0.34, vol: 0.15 });
    });
    tone({ freq: 1047, type: 'sine', dur: 0.2, vol: 0.1, delay: 0.08 });
  },
  select() {
    // 选中武将：柔和上挑，区别于普通 click
    tone({ freq: 600, type: 'triangle', dur: 0.08, vol: 0.14, slideTo: 900 });
  },
  early() {
    // 提前迎战奖励：金币 + 拨弦亮音
    tone({ freq: 1047, type: 'square', dur: 0.07, vol: 0.13 });
    tone({ freq: 1568, type: 'triangle', dur: 0.14, vol: 0.14, delay: 0.06 });
    tone({ freq: 2093, type: 'sine', dur: 0.12, vol: 0.1, delay: 0.12 });
  },
  countdown() {
    // 倒计时滴答：短促木鱼
    tone({ freq: 440, type: 'square', dur: 0.04, vol: 0.1 });
  },
};

export function play(name) {
  const fn = SFX[name];
  if (fn) {
    try { fn(); } catch {
      /* noop */
    }
  }
}

export default { unlock, setMuted, isMuted, play };
