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
  {
    key: 'mnrs',
    title: '模拟人生',
    subtitle: '模拟 · 文字人生',
    emblem: '生',
    desc: '从呱呱坠地到垂垂老矣，一周一周推进岁月，在健康、智力、财富、心情、社交间权衡抉择，过完这一生。',
    loader: () => import('../apps/mo-ni-ren-sheng/src/main.js'),
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
    <div class="game-frame">
      <div class="game-topbar">
        <span class="game-topbar__title" id="game-topbar-title">展品</span>
        <button class="game-close" id="game-close" type="button" aria-label="退出游戏">✕</button>
      </div>
      <div class="game-stage">
        <div class="game-loading" id="game-loading">
          <span class="game-loading__spinner" aria-hidden="true"></span>
          <span class="game-loading__text">加载中…</span>
        </div>
        <div class="game-mount" id="game-mount"></div>
      </div>
    </div>
  </div>
`

// 渲染展品卡片
const exhibitList = document.getElementById('exhibit-list')
const prefetched = new Set()
// 预取某展品的代码分片（动态 import 结果会被打包器缓存）：
// 在玩家悬停/聚焦卡片时就后台拉取，等真正点击时 import() 已就绪，首屏近乎秒开。
function prefetch(def) {
  if (!def || prefetched.has(def.key)) return
  prefetched.add(def.key)
  // loader() 返回动态 import 的 Promise，其异步 rejection 无法被同步 try/catch 捕获，
  // 必须用 .catch() 兜底，否则预取失败会变成 unhandled rejection。
  def.loader().catch(() => { /* 预取失败不影响后续正常点击加载 */ })
}
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
  // 悬停 / 聚焦 / 触摸开始时预取，缩短点击后的等待
  card.addEventListener('pointerenter', () => prefetch(g), { once: true })
  card.addEventListener('focusin', () => prefetch(g), { once: true })
  card.addEventListener('touchstart', () => prefetch(g), { once: true, passive: true })
  exhibitList.appendChild(card)
}
// 不在首屏后一次性预取全部展品——那会拉取所有代码分片，实质抵消代码分割，
// 并制造首屏后的带宽/内存峰值。改为只依赖上方「悬停 / 聚焦 / 触摸」这种用户意图驱动的预取，
// 真正点击时再 import()（已有 loading 占位），分片按需加载。

const overlay = document.getElementById('game-overlay')
const mount = document.getElementById('game-mount')
const closeBtn = document.getElementById('game-close')
const loadingEl = document.getElementById('game-loading')

const GAME_KEY = '__PLAYBOX_GAME__' // 暴露实例便于调试 / 自动化冒烟测试
let game = null
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

  // 顶栏展示当前展品名（关闭✕已移入顶栏，不再压住游戏右上角的控件）
  const topbarTitle = document.getElementById('game-topbar-title')
  if (topbarTitle) topbarTitle.textContent = def.title

  overlay.hidden = false
  loadingEl.hidden = false
  try {
    // 动态 import：仅在真正游玩时才拉取对应展品
    const { createGame } = await def.loader()
    // 取消令牌检查：若加载期间被 closeGame 中断，丢弃结果
    if (id !== loadSeq) return
    game = createGame(mount)
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
  window[GAME_KEY] = undefined
  mount.innerHTML = ''
  loadingEl.hidden = true
  overlay.hidden = true
  // 重置关闭按钮的二次确认态
  closeArmed = false
  closeBtn.classList.remove('is-armed')
  closeBtn.textContent = '✕'
  closeBtn.setAttribute('aria-label', '退出游戏')
}

// 关闭按钮防误触：游戏内右上角悬浮 ✕ 与 HUD 操作区贴近，单点即退容易误触。
// 改为二次确认——首次点击进入"再按一次退出" armed 态并限时；限时内再次点击才真正退出。
let closeArmed = false
let closeArmTimer = null
function armClose() {
  closeArmed = true
  closeBtn.classList.add('is-armed')
  closeBtn.textContent = '再按退出'
  closeBtn.setAttribute('aria-label', '再按一次确认退出')
  if (closeArmTimer) clearTimeout(closeArmTimer)
  // 1.6s 内未二次确认则自动撤销，回到普通态
  closeArmTimer = setTimeout(() => {
    closeArmed = false
    closeBtn.classList.remove('is-armed')
    closeBtn.textContent = '✕'
    closeBtn.setAttribute('aria-label', '退出游戏')
  }, 1600)
}
function handleCloseClick() {
  if (closeArmed) {
    if (closeArmTimer) { clearTimeout(closeArmTimer); closeArmTimer = null }
    closeGame()
  } else {
    armClose()
  }
}

// 展品按钮统一委托
exhibitList.addEventListener('click', (e) => {
  const btn = e.target.closest('.play-btn')
  if (!btn) return
  const def = GAMES.find((g) => g.key === btn.dataset.game)
  if (def) openGame(def, btn)
})
closeBtn.addEventListener('click', handleCloseClick)
// ESC 退出
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !overlay.hidden) closeGame()
})
