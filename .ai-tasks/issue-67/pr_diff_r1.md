diff --git a/.ai-tasks/issue-67/ai-coder-prompt.md b/.ai-tasks/issue-67/ai-coder-prompt.md
new file mode 100644
index 0000000..155f365
--- /dev/null
+++ b/.ai-tasks/issue-67/ai-coder-prompt.md
@@ -0,0 +1,8 @@
+你是一个资深开发者。请解决以下 GitHub Issue：
+【任务标题】: 整体优化
+【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-67/context.md 文件获取。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
+
+请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-67/context.md b/.ai-tasks/issue-67/context.md
new file mode 100644
index 0000000..31c4958
--- /dev/null
+++ b/.ai-tasks/issue-67/context.md
@@ -0,0 +1,2 @@
+- 当前在点击输入时，页面的缩放都变得很奇怪，因为输入法会占据屏幕下半部分（约5分2），上面因为页面自动向上滑动，让输入框部分居然上方部分的中间（或者参考业界优秀实践），而不是整个页面缩放
+- 主菜单样式建议偏轻奢一些
diff --git a/apps/da-ka/src/ui/app.js b/apps/da-ka/src/ui/app.js
index adff6f0..fbd47d0 100644
--- a/apps/da-ka/src/ui/app.js
+++ b/apps/da-ka/src/ui/app.js
@@ -79,6 +79,11 @@ export class CheckInUI {
       window.removeEventListener('keydown', this._keyHandler);
       this._keyHandler = null;
     }
+    if (this._vvHandler && window.visualViewport) {
+      window.visualViewport.removeEventListener('resize', this._vvHandler);
+      this._vvHandler = null;
+    }
+    this._focusTarget = null;
     if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
     this.root = null;
   }
@@ -138,6 +143,65 @@ export class CheckInUI {
       }
     };
     this.root.addEventListener('submit', this._submitHandler);
+    // 视觉视口（键盘）跟踪 + 聚焦滚动修正：键盘弹起时把根容器收口到「键盘以上的可见区」，
+    // 并把聚焦的输入框滚到可见区内，避免 iOS 默认把输入框推到屏幕上半部分的中间。
+    this._focusTarget = null;
+    this._focusInHandler = (e) => this._onFocusIn(e);
+    this._focusOutHandler = (e) => { if (e.target === this._focusTarget) this._focusTarget = null; };
+    this.root.addEventListener('focusin', this._focusInHandler);
+    this.root.addEventListener('focusout', this._focusOutHandler);
+    this._vvHandler = () => this._syncShell();
+    if (window.visualViewport) window.visualViewport.addEventListener('resize', this._vvHandler);
+  }
+
+  // 把根容器收口到「视觉视口（键盘以上可见区）与父容器的交集」。
+  // getBoundingClientRect 与 visualViewport.offsetTop 同处一个坐标系
+  // （iOS 均相对布局视口；Chrome 上 offsetTop≈0、bcr 相对视觉视口），可直接相减。
+  _syncShell() {
+    if (!this.root) return;
+    const vv = window.visualViewport;
+    const parent = this.root.parentElement;
+    if (!vv || !parent) {
+      this.root.style.top = '';
+      this.root.style.height = '';
+      return;
+    }
+    const pRect = parent.getBoundingClientRect();
+    const visTop = vv.offsetTop - pRect.top;
+    const visBottom = vv.offsetTop + vv.height - pRect.top;
+    const top = Math.max(0, visTop);
+    const bottom = Math.min(parent.clientHeight, visBottom);
+    const height = Math.max(0, bottom - top);
+    this.root.style.top = top + 'px';
+    this.root.style.height = height + 'px';
+    if (this._focusTarget && this.root.contains(this._focusTarget)) {
+      this._scrollFocusVisible(this._focusTarget);
+    }
+  }
+
+  _onFocusIn(e) {
+    const el = e.target;
+    if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
+    this._focusTarget = el;
+    // 先按当前视觉视口收口容器，再延后两帧修正滚动（等键盘动画 / 容器重排落定）。
+    this._syncShell();
+    requestAnimationFrame(() => requestAnimationFrame(() => {
+      if (this._focusTarget === el) this._scrollFocusVisible(el);
+    }));
+  }
+
+  // 把聚焦的输入框滚到根容器（即键盘以上可见区）的中部。
+  // 用 offsetTop 链累加，规避 getBoundingClientRect 在不同浏览器间坐标系不一致的问题。
+  _scrollFocusVisible(el) {
+    if (!this.root || !this.root.contains(el)) return;
+    let top = 0, node = el;
+    while (node && node !== this.root) {
+      top += node.offsetTop;
+      node = node.offsetParent;
+    }
+    if (node !== this.root) return;
+    const target = top - (this.root.clientHeight - el.offsetHeight) / 2;
+    this.root.scrollTo({ top: Math.max(0, target) });
   }
 
   // ===================== 渲染入口 =====================
diff --git a/apps/da-ka/src/ui/style.css b/apps/da-ka/src/ui/style.css
index c14b885..410d3e0 100644
--- a/apps/da-ka/src/ui/style.css
+++ b/apps/da-ka/src/ui/style.css
@@ -7,9 +7,11 @@
    ========================================================================== */
 
 .daka-root {
-  position: relative;
-  width: 100%;
-  height: 100%;
+  /* position:absolute 让 top/height 可被 JS 按视觉视口（键盘）精确收口：
+     键盘弹起时把容器高度限定在「键盘以上的可见区」，原生聚焦滚动才会落在真正可见区内，
+     而不是把输入框推到屏幕上半部分的中间。默认 inset:0 仍填满父容器。 */
+  position: absolute;
+  inset: 0;
   overflow-y: auto;
   -webkit-overflow-scrolling: touch;
   background:
@@ -550,7 +552,8 @@
   padding: 0.5rem 0.7rem;
   border: 1px solid var(--pink-200);
   border-radius: 8px;
-  font-size: 0.92rem;
+  /* ≥16px：iOS Safari 在聚焦小于 16px 的输入框时会自动放大整页且不回弹，是「页面缩放变奇怪」的主因。 */
+  font-size: 1rem;
   color: var(--ink);
   outline: none;
   background: var(--white);
@@ -576,7 +579,8 @@
   padding: 0.65rem 0.8rem;
   border: 1.5px solid var(--pink-200);
   border-radius: 12px;
-  font-size: 0.92rem;
+  /* ≥16px：避免 iOS 聚焦时自动放大整页（同 .sheet-rename__input）。 */
+  font-size: 1rem;
   color: var(--ink);
   outline: none;
   background: var(--white);
diff --git a/apps/fan-ren-xiu-xian/src/ui/app.js b/apps/fan-ren-xiu-xian/src/ui/app.js
index 59c4bb5..70b9c4a 100644
--- a/apps/fan-ren-xiu-xian/src/ui/app.js
+++ b/apps/fan-ren-xiu-xian/src/ui/app.js
@@ -1937,14 +1937,14 @@ export class GameUI {
       h('div', { class: 'card' },
         h('h4', null, '存档导出'),
         h('div', { class: 'muted', style: { marginBottom: '0.3rem' } }, '复制下方字符串，可在他处导入恢复。'),
-        h('textarea', { dataset: { id: 'exp' }, style: { width: '100%', height: '60px', background: '#0a0703', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '0.7rem', resize: 'none' } }, exportStr),
+        h('textarea', { dataset: { id: 'exp' }, style: { width: '100%', height: '60px', background: '#0a0703', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '1rem', resize: 'none' } }, exportStr),
         h('div', { class: 'row', style: { marginTop: '0.3rem' } },
           h('button', { class: 'btn-ghost', style: { flex: 1 }, onClick: () => { this.copyText(exportStr); } }, '复制'),
         ),
       ),
       h('div', { class: 'card' },
         h('h4', null, '存档导入'),
-        h('textarea', { dataset: { id: 'imp' }, placeholder: '粘贴存档字符串…', style: { width: '100%', height: '50px', background: '#0a0703', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '0.7rem', resize: 'none' } }),
+        h('textarea', { dataset: { id: 'imp' }, placeholder: '粘贴存档字符串…', style: { width: '100%', height: '50px', background: '#0a0703', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '1rem', resize: 'none' } }),
         h('button', { class: 'btn-primary', style: { width: '100%', marginTop: '0.3rem' }, onClick: () => this.doImport() }, '导入并覆盖'),
       ),
       h('div', { class: 'card' },
diff --git a/apps/fan-ren-xiu-xian/src/ui/style.css b/apps/fan-ren-xiu-xian/src/ui/style.css
index 6923dd9..b4f553c 100644
--- a/apps/fan-ren-xiu-xian/src/ui/style.css
+++ b/apps/fan-ren-xiu-xian/src/ui/style.css
@@ -510,7 +510,8 @@
 .frxx .talent-chip .nm { font-weight: 600; font-size: 0.82rem; }
 
 .frxx .name-input {
-  width: 100%; padding: 0.55rem 0.7rem; font-size: 0.95rem;
+  /* ≥16px：避免 iOS 聚焦输入框时自动放大整页且不回弹。 */
+  width: 100%; padding: 0.55rem 0.7rem; font-size: 1rem;
   background: #0a0703; color: var(--text); border: 1px solid var(--line); border-radius: 8px;
   font-family: inherit;
 }
diff --git a/apps/mo-ni-ren-sheng/src/ui/style.css b/apps/mo-ni-ren-sheng/src/ui/style.css
index 0bbc9c8..2b989f0 100644
--- a/apps/mo-ni-ren-sheng/src/ui/style.css
+++ b/apps/mo-ni-ren-sheng/src/ui/style.css
@@ -250,7 +250,8 @@
 .mnrs .save-io {
   width: 100%; height: 64px; resize: vertical; padding: 0.5rem; border-radius: 8px;
   border: 1px solid var(--line); background: var(--bg); color: var(--text);
-  font-family: ui-monospace, monospace; font-size: 0.72rem; word-break: break-all;
+  /* ≥16px：避免 iOS 聚焦输入框时自动放大整页且不回弹。 */
+  font-family: ui-monospace, monospace; font-size: 1rem; word-break: break-all;
 }
 
 /* —— 多槽位存档管理 —— */
diff --git a/src/style.css b/src/style.css
index fe768d2..f10225d 100644
--- a/src/style.css
+++ b/src/style.css
@@ -9,11 +9,18 @@
 :root {
   --bg: #0b0b0e;
   --bg-card: #141417;
-  --text: #e8e6e3;
+  --bg-card-hi: #1b1a20;
+  --text: #ece9e3;
   --text-muted: #8a8883;
-  --accent: #d4a84b;
+  --accent: #d4a84b;       /* 香槟金 */
+  --accent-hi: #ecc878;
   --accent-dim: #b8912e;
   --border: #222227;
+  --line: #24232b;
+  --gold-line: rgba(212, 168, 75, 0.32);
+  --gold-glow: rgba(212, 168, 75, 0.14);
+  --shadow-card: 0 12px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.03);
+  --shadow-card-hi: 0 20px 48px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(212, 168, 75, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.05);
   --font-display: 'Playfair Display', Georgia, serif;
   --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
 }
@@ -26,7 +33,10 @@ html {
 }
 
 body {
-  background: var(--bg);
+  /* 顶部一抹香槟金辉光，营造轻奢氛围；其余维持近黑底，凸显金字与卡片质感。 */
+  background:
+    radial-gradient(125% 80% at 50% -12%, rgba(212, 168, 75, 0.10), rgba(212, 168, 75, 0) 55%),
+    var(--bg);
   color: var(--text);
   font-family: var(--font-body);
   font-weight: 400;
@@ -64,9 +74,14 @@ header {
   font-style: italic;
   font-size: 3.5rem;
   line-height: 1.1;
-  color: var(--accent);
   letter-spacing: -0.02em;
   margin-bottom: 0.75rem;
+  /* 香槟金竖向渐变描色，保留 color 作旧浏览器回退。 */
+  color: var(--accent);
+  background: linear-gradient(180deg, #f3d98a 0%, #d4a84b 58%, #b1892c 100%);
+  -webkit-background-clip: text;
+  background-clip: text;
+  -webkit-text-fill-color: transparent;
 }
 
 .subtitle {
@@ -81,9 +96,23 @@ header {
 .description {
   margin-bottom: 2.5rem;
   padding: 1rem 0;
-  border-top: 1px solid var(--border);
-  border-bottom: 1px solid var(--border);
+  border-top: 1px solid var(--line);
+  border-bottom: 1px solid var(--line);
+  position: relative;
+}
+
+/* 上下细金线（两端淡出），替代纯灰描边，更精致。 */
+.description::before,
+.description::after {
+  content: "";
+  position: absolute;
+  left: 0;
+  right: 0;
+  height: 1px;
+  background: linear-gradient(90deg, transparent, var(--gold-line), transparent);
 }
+.description::before { top: 0; }
+.description::after { bottom: 0; }
 
 .description p {
   font-size: 0.875rem;
@@ -109,8 +138,23 @@ header {
   font-weight: 700;
   font-size: 1.125rem;
   color: var(--text);
-  letter-spacing: 0.05em;
+  letter-spacing: 0.14em;
   text-transform: uppercase;
+  position: relative;
+  padding-left: 0.85rem;
+}
+
+/* 标题左侧一道短金竖线，作为轻奢的克制度量点缀。 */
+.section-title::before {
+  content: "";
+  position: absolute;
+  left: 0;
+  top: 50%;
+  transform: translateY(-50%);
+  width: 2px;
+  height: 0.95em;
+  background: linear-gradient(180deg, var(--accent-hi), var(--accent-dim));
+  border-radius: 2px;
 }
 
 /* 返回大类按钮：首页视图下隐藏，进入大类后出现 */
@@ -121,19 +165,20 @@ header {
   justify-content: center;
   width: 28px;
   height: 28px;
-  border: 1px solid var(--border);
+  border: 1px solid var(--line);
   border-radius: 50%;
   background: var(--bg-card);
   color: var(--accent);
   font-size: 1rem;
   line-height: 1;
   cursor: pointer;
-  transition: background 0.15s ease, border-color 0.15s ease;
+  transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
 }
 
 .back-btn:hover {
   background: #1f1d18;
   border-color: var(--accent-dim);
+  box-shadow: 0 0 0 3px var(--gold-glow);
 }
 
 .back-btn[hidden] {
@@ -142,32 +187,60 @@ header {
 
 .card {
   background: var(--bg-card);
-  border: 1px solid var(--border);
-  border-radius: 8px;
+  border: 1px solid var(--line);
+  border-radius: 10px;
   padding: 2rem 1.5rem;
 }
 
 /* ── Exhibit card（展品卡片）── */
 .card--exhibit {
   padding: 1.5rem;
+  background: linear-gradient(155deg, var(--bg-card-hi) 0%, var(--bg-card) 72%);
+  box-shadow: var(--shadow-card);
 }
 
 /* 大类卡片：可点击的导航磁贴，整体可点进入子列表 */
 .card--category {
-  padding: 1.5rem;
+  position: relative;
+  overflow: hidden;
+  padding: 1.75rem 1.5rem;
   cursor: pointer;
-  transition: border-color 0.15s ease, transform 0.12s ease, background 0.15s ease;
+  background: linear-gradient(155deg, #1b1a21 0%, #131317 72%);
+  border: 1px solid var(--line);
+  border-radius: 14px;
+  box-shadow: var(--shadow-card);
+  transition: border-color 0.2s ease, transform 0.18s ease, box-shadow 0.25s ease, background 0.25s ease;
+}
+
+/* 卡顶一道两端淡出的金线，hover 时加亮——克制的轻奢细节。 */
+.card--category::before {
+  content: "";
+  position: absolute;
+  left: 1.25rem;
+  right: 1.25rem;
+  top: 0;
+  height: 1px;
+  background: linear-gradient(90deg, transparent, var(--gold-line), transparent);
+  opacity: 0.65;
+  transition: opacity 0.25s ease;
 }
 
 .card--category:hover,
 .card--category:focus-visible {
-  border-color: var(--accent-dim);
-  background: #18171b;
+  border-color: rgba(212, 168, 75, 0.42);
+  background: linear-gradient(155deg, #211f28 0%, #171619 72%);
+  box-shadow: var(--shadow-card-hi);
+  transform: translateY(-2px);
   outline: none;
 }
 
+.card--category:hover::before,
+.card--category:focus-visible::before {
+  opacity: 1;
+}
+
 .card--category:active {
-  transform: translateY(1px);
+  transform: translateY(0);
 }
 
 /* 大类标题右侧的箭头，提示可进入下一级 */
@@ -179,19 +252,28 @@ header {
   font-weight: 700;
   line-height: 1;
   opacity: 0.8;
+  transition: transform 0.2s ease, opacity 0.2s ease, color 0.2s ease;
+}
+
+.card--category:hover .card-chevron,
+.card--category:focus-visible .card-chevron {
+  color: var(--accent-hi);
+  opacity: 1;
+  transform: translateX(3px);
 }
 
 /* 大类底部的进入提示，复用主按钮视觉但非独立按钮（整卡可点） */
 .enter-btn {
   display: inline-block;
   margin-top: 0.25rem;
-  padding: 0.4rem 0.9rem;
+  padding: 0.42rem 1rem;
   border-radius: 999px;
-  background: rgba(212, 168, 75, 0.12);
-  color: var(--accent);
+  background: linear-gradient(135deg, rgba(236, 200, 120, 0.16), rgba(212, 168, 75, 0.10));
+  color: var(--accent-hi);
   font-size: 0.8rem;
   font-weight: 600;
-  letter-spacing: 0.04em;
+  letter-spacing: 0.06em;
+  border: 1px solid var(--gold-line);
 }
 
 /* 多展品纵向堆叠 */
@@ -210,17 +292,19 @@ header {
 
 .card-emblem {
   flex: none;
-  width: 48px;
-  height: 48px;
+  width: 52px;
+  height: 52px;
   display: flex;
   align-items: center;
   justify-content: center;
-  background: linear-gradient(145deg, #3a2e22, #1f1812);
-  border: 1px solid #6b5430;
-  border-radius: 10px;
-  color: #ead9b6;
+  /* 金边深底的小铭牌：内高光 + 暖色描边，质感更精致。 */
+  background: linear-gradient(150deg, #4a3a26 0%, #2a2016 60%, #1b140d 100%);
+  border: 1px solid rgba(212, 168, 75, 0.36);
+  border-radius: 12px;
+  box-shadow: inset 0 1px 0 rgba(255, 224, 160, 0.20), 0 6px 16px rgba(0, 0, 0, 0.45);
+  color: #f1dca0;
   font-family: serif;
-  font-size: 1.6rem;
+  font-size: 1.65rem;
   line-height: 1;
 }
 
@@ -233,14 +317,16 @@ header {
 .card-title {
   font-family: var(--font-display);
   font-weight: 700;
-  font-size: 1.25rem;
+  font-size: 1.3rem;
   color: var(--text);
+  letter-spacing: 0.005em;
 }
 
 .card-subtitle {
-  font-size: 0.8rem;
+  font-size: 0.78rem;
   color: var(--accent);
-  letter-spacing: 0.08em;
+  letter-spacing: 0.12em;
+  text-transform: uppercase;
 }
 
 .card-desc {
@@ -251,25 +337,34 @@ header {
 }
 
 .play-btn {
+  position: relative;
   width: 100%;
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 0.5rem;
-  padding: 0.75rem 1rem;
+  padding: 0.8rem 1rem;
   border: none;
-  border-radius: 8px;
-  background: var(--accent);
+  border-radius: 10px;
+  /* 金色渐变面 + 顶部内高光，呈现金属质感的「轻奢」主按钮。 */
+  background: linear-gradient(180deg, #ecc878 0%, #d4a84b 55%, #bd9333 100%);
   color: #1a1410;
   font-family: var(--font-body);
   font-weight: 600;
   font-size: 0.95rem;
+  letter-spacing: 0.02em;
   cursor: pointer;
-  transition: background 0.15s ease, opacity 0.15s ease;
+  box-shadow: inset 0 1px 0 rgba(255, 240, 200, 0.45), 0 8px 20px rgba(212, 168, 75, 0.22);
+  transition: filter 0.18s ease, box-shadow 0.22s ease, opacity 0.15s ease, transform 0.12s ease;
 }
 
 .play-btn:hover:not(:disabled) {
-  background: #e6ba5a;
+  filter: brightness(1.05);
+  box-shadow: inset 0 1px 0 rgba(255, 240, 200, 0.5), 0 10px 26px rgba(212, 168, 75, 0.32);
+}
+
+.play-btn:active:not(:disabled) {
+  transform: translateY(1px);
 }
 
 .play-btn:disabled {
@@ -456,9 +551,19 @@ header {
 
 /* ── Footer ── */
 .footer {
+  position: relative;
   text-align: center;
   padding-top: 1.5rem;
-  border-top: 1px solid var(--border);
+}
+
+.footer::before {
+  content: "";
+  position: absolute;
+  left: 0;
+  right: 0;
+  top: 0;
+  height: 1px;
+  background: linear-gradient(90deg, transparent, var(--line), transparent);
 }
 
 .footer p {
