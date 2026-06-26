import './style.css'

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
      <div class="card">
        <div class="card-placeholder">
          <span class="card-icon">◻</span>
          <p class="card-text">等待第一个 Issue 诞生的作品</p>
        </div>
      </div>
    </section>

    <footer class="footer">
      <p>由 GitHub Actions 全自动构建部署</p>
    </footer>
  </main>
`
