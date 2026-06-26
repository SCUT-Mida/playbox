import './style.css'

// 落地页「橱窗」：把流水线产出的展品挂载进来。
// 当前展品 ——《鼎足三分》三国塔防（apps/ding-zu-san-fen）。

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
      <h2 class="section-title">当前展品</h2>
      <article class="card card--exhibit">
        <div class="card-head">
          <span class="card-emblem" aria-hidden="true">鼎</span>
          <div class="card-titles">
            <h3 class="card-title">鼎足三分</h3>
            <p class="card-subtitle">三国 · 战略塔防</p>
          </div>
        </div>
        <p class="card-desc">
          布置蜀汉武将、利用情义羁绊抵御蜂拥而至的敌军，在泼墨竹简的战场上守住阵地。
        </p>
        <button class="play-btn" id="play-dzf" type="button">
          <span class="play-btn__icon" aria-hidden="true">▶</span>
          <span class="play-btn__label">开始游戏</span>
        </button>
      </article>
    </section>

    <footer class="footer">
      <p>由 GitHub Actions 全自动构建部署</p>
    </footer>
  </main>

  <div class="game-overlay" id="game-overlay" hidden>
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

const playBtn = document.getElementById('play-dzf')
const playLabel = playBtn.querySelector('.play-btn__label')
const overlay = document.getElementById('game-overlay')
const mount = document.getElementById('game-mount')
const closeBtn = document.getElementById('game-close')
const loadingEl = document.getElementById('game-loading')

const GAME_KEY = '__PLAYBOX_DZF__' // 暴露实例便于调试 / 自动化冒烟测试
let game = null
let loading = false
let loadSeq = 0 // 取消令牌：每次 closeGame / 重新 openGame 递增，使飞行中的加载作废

async function openGame() {
  // 若游戏已存在，仅恢复 overlay 显示（不重复创建）
  if (game) {
    overlay.hidden = false
    return
  }
  if (loading) return

  const id = ++loadSeq
  loading = true
  playBtn.disabled = true
  playBtn.classList.add('is-loading')
  playLabel.textContent = '加载中…'

  overlay.hidden = false
  loadingEl.hidden = false
  try {
    // 动态 import：仅在真正游玩时才拉取 Phaser（~1.5MB），保持落地页轻量
    const { createGame } = await import('../apps/ding-zu-san-fen/src/main.js')
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
      playBtn.disabled = false
      playBtn.classList.remove('is-loading')
      return
    }
    loading = false
    playBtn.disabled = false
    playBtn.classList.remove('is-loading')
    if (game) playLabel.textContent = '继续游戏'
  }
}

function closeGame() {
  // 递增取消令牌，使飞行中的 openGame import 作废
  loadSeq++

  if (game) {
    game.destroy(true)
    game = null
  }
  window[GAME_KEY] = undefined
  mount.innerHTML = ''
  loadingEl.hidden = true
  overlay.hidden = true
  playLabel.textContent = '开始游戏'
}

playBtn.addEventListener('click', openGame)
closeBtn.addEventListener('click', closeGame)
// ESC 退出
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !overlay.hidden) closeGame()
})
