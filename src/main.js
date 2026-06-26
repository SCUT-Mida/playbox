import './style.css'

// 落地页「橱窗」：把流水线产出的展品挂载进来。
// 展品按需懒加载（动态 import），不游玩不拉取，保持落地页轻量。

const GAMES = [
  {
    key: 'dzf',
    title: '鼎足三分',
    subtitle: '三国 · 战略塔防',
    emblem: '鼎',
    desc: '布置蜀汉武将、利用情义羁绊抵御蜂拥而至的敌军，在泼墨竹简的战场上守住阵地。',
    loader: () => import('../apps/ding-zu-san-fen/src/main.js'),
  },
  {
    key: 'frxx',
    title: '凡人修仙录',
    subtitle: '仙侠 · 文字修仙',
    emblem: '仙',
    desc: '从凡人起步，修炼突破、探索机缘、炼丹渡劫，直至白日飞升。一款竖屏文字挂机修仙游戏。',
    loader: () => import('../apps/fan-ren-xiu-xian/src/main.js'),
  },
]

const app = document.getElementById('app')

app.innerHTML = `
  <main class="container">
    <header>
      <h1 class="brand">Playbox</h1>
      <p class="subtitle">一个用 AI 自动化流水线驱动的创意沙盒</p>
    </header>

    <section class="description">
      <p>提 Issue → AI 自动写代码 → 自动审查 → 自动合并 → 自动部署到这里</p>
    </section>

    <section class="exhibit">
      <h2 class="section-title">展品陈列</h2>
      <div class="exhibit-list" id="exhibit-list"></div>
    </section>

    <footer class="footer">
      <p>由 GitHub Actions 全自动构建部署</p>
    </footer>
  </main>

  <div class="game-overlay" id="game-overlay" hidden>
    <div class="orientation-hint">
      <div>
        <p class="orientation-hint__title">📱 请竖屏游玩</p>
        <p class="orientation-hint__desc">展品为竖屏设计，请旋转设备以获得最佳体验。</p>
      </div>
    </div>
    <div class="game-stage">
      <button class="game-close" id="game-close" type="button" aria-label="退出游戏">✕</button>
      <div class="game-loading" id="game-loading">
        <span class="game-loading__spinner" aria-hidden="true"></span>
        <span class="game-loading__text">加载中…</span>
      </div>
      <div class="game-mount" id="game-mount"></div>
    </div>
  </div>
`

// 渲染展品卡片
const exhibitList = document.getElementById('exhibit-list')
for (const g of GAMES) {
  const card = document.createElement('article')
  card.className = 'card card--exhibit'
  card.innerHTML = `
    <div class="card-head">
      <span class="card-emblem" aria-hidden="true">${g.emblem}</span>
      <div class="card-titles">
        <h3 class="card-title">${g.title}</h3>
        <p class="card-subtitle">${g.subtitle}</p>
      </div>
    </div>
    <p class="card-desc">${g.desc}</p>
    <button class="play-btn" data-game="${g.key}" type="button">
      <span class="play-btn__icon" aria-hidden="true">▶</span>
      <span class="play-btn__label">开始游戏</span>
    </button>
  `
  exhibitList.appendChild(card)
}

const overlay = document.getElementById('game-overlay')
const mount = document.getElementById('game-mount')
const closeBtn = document.getElementById('game-close')
const loadingEl = document.getElementById('game-loading')

const GAME_KEY = '__PLAYBOX_GAME__' // 暴露实例便于调试 / 自动化冒烟测试
let game = null
let currentDef = null // 当前游玩的展品定义（用于重置按钮文案）
let loading = false
let loadSeq = 0 // 取消令牌：每次 closeGame / 重新 openGame 递增，使飞行中的加载作废

async function openGame(def, btn) {
  const playLabel = btn.querySelector('.play-btn__label')
  // 防御性守卫：当前状态机下 game 在 closeGame 后恒为 null，此分支不可达；
  // 保留以兜底未来可能的「后台保活」改动——若 game 仍存活则仅恢复显示、不重复创建。
  if (game) {
    overlay.hidden = false
    return
  }
  if (loading) return

  const id = ++loadSeq
  loading = true
  btn.disabled = true
  btn.classList.add('is-loading')
  playLabel.textContent = '加载中…'

  overlay.hidden = false
  loadingEl.hidden = false
  try {
    // 动态 import：仅在真正游玩时才拉取对应展品
    const { createGame } = await def.loader()
    // 取消令牌检查：若加载期间被 closeGame 中断，丢弃结果
    if (id !== loadSeq) return
    game = createGame(mount)
    currentDef = def
    btn._label = playLabel // 记下当前按钮，便于 close 时复位
    loadingEl.hidden = true
    window[GAME_KEY] = game
  } catch (err) {
    if (id !== loadSeq) return // 被取消，静默丢弃
    console.error('游戏加载失败：', err)
    overlay.hidden = true
    loadingEl.hidden = true
    playLabel.textContent = '加载失败，点击重试'
  } finally {
    // 取消令牌：被取消时仍需恢复按钮状态，否则 playBtn 永久 disabled
    if (id !== loadSeq) {
      loading = false
      btn.disabled = false
      btn.classList.remove('is-loading')
      return
    }
    loading = false
    btn.disabled = false
    btn.classList.remove('is-loading')
    if (game) playLabel.textContent = '继续游戏'
  }
}

function closeGame() {
  // 递增取消令牌，使飞行中的 openGame import 作废
  loadSeq++
  // 入口状态唯一收口：取消后立即释放所有按钮，不依赖飞行中的 import() 何时 settle
  loading = false
  document.querySelectorAll('.play-btn').forEach((b) => {
    b.disabled = false
    b.classList.remove('is-loading')
    const label = b.querySelector('.play-btn__label')
    if (label) label.textContent = '开始游戏'
  })

  if (game) {
    game.destroy(true)
    game = null
  }
  currentDef = null
  window[GAME_KEY] = undefined
  mount.innerHTML = ''
  loadingEl.hidden = true
  overlay.hidden = true
}

// 展品按钮统一委托
exhibitList.addEventListener('click', (e) => {
  const btn = e.target.closest('.play-btn')
  if (!btn) return
  const def = GAMES.find((g) => g.key === btn.dataset.game)
  if (def) openGame(def, btn)
})
closeBtn.addEventListener('click', closeGame)
// ESC 退出
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !overlay.hidden) closeGame()
})
