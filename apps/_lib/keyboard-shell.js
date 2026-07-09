// ============================================================================
// 共享：移动端软键盘「悬浮于页面」收口器
//
// 问题：展品根容器（.daka-root / .frxx / .mnrs / .xhlz）以 position:absolute;
// inset:0 填满 .game-mount。当输入框聚焦、软键盘弹起时，原生行为会把输入框推到
// 屏幕中部甚至键盘背后，或（部分 WebView）把整个舞台等比缩小。
//
// 目标（见 .ai-tasks/issue-73/context.md）：键盘悬浮于页面、只占据下半部分，
// 输入框落在「键盘以上可见区」的垂直中部（即屏幕上半部分的中间）。
//
// 做法：监听 visualViewport.resize，键盘弹起时把根容器收口到「视觉视口（键盘以上
// 可见区）与父容器的交集」——根容器变矮后，其内部居中布局会自动把输入框上移到
// 可见区中部；再辅助把输入框滚动到最近可滚动祖先的中部，覆盖非居中/超长表单。
// 配合主框架的 navigator.virtualKeyboard.overlaysContent=true，键盘不再挤压布局视口，
// 舞台保持原尺寸（不等比缩小），仅本收口器调整根容器的可见高度。
//
// 用法：const detach = attachKeyboardShell(this.root); 销毁时 detach()。
// 该模块自包含，与各展品内部结构解耦，仅依赖根容器及其父容器。
// ============================================================================

const TAG_INPUT = 'INPUT';
const TAG_TEXTAREA = 'TEXTAREA';

function isTypingElement(el) {
  return !!el && (el.tagName === TAG_INPUT || el.tagName === TAG_TEXTAREA);
}

// 是否处于「键盘弹起」状态：视觉视口高度明显小于布局视口高度。
// overlaysContent 下布局视口保持完整，故该比较稳定生效。
function isKeyboardUp() {
  const vv = window.visualViewport;
  if (!vv) return false;
  const layoutH = document.documentElement.clientHeight;
  return vv.height < layoutH - 1;
}

/**
 * @param {HTMLElement} root 展品根容器（position:absolute; inset:0 填满挂载点）
 * @returns {() => void} detach 销毁函数：解绑事件并还原 inline 样式
 */
export function attachKeyboardShell(root) {
  if (!root) return () => {};
  let focusTarget = null;

  function clearShell() {
    if (!root) return;
    root.style.top = '';
    root.style.height = '';
  }

  // 把根容器收口到「视觉视口（键盘以上可见区）与父容器的交集」。
  // getBoundingClientRect 与 visualViewport.offsetTop 同处一个坐标系
  // （iOS 均相对布局视口；Chrome 上 offsetTop≈0、bcr 相对视觉视口），可直接相减。
  function syncShell() {
    if (!root) return;
    const vv = window.visualViewport;
    const parent = root.parentElement;
    if (!vv || !parent) { clearShell(); return; }
    // 键盘未弹起（桌面端、或移动端无输入聚焦）时无需收口，清空 inline 尺寸走回退，
    // 避免窗口后续 resize 没有 vv 事件、容器停留在陈旧值。
    if (!isKeyboardUp()) { clearShell(); return; }

    const pRect = parent.getBoundingClientRect();
    const visTop = vv.offsetTop - pRect.top;
    const visBottom = vv.offsetTop + vv.height - pRect.top;
    const top = Math.max(0, visTop);
    const bottom = Math.min(parent.clientHeight, visBottom);
    const height = Math.max(0, bottom - top);
    root.style.top = top + 'px';
    root.style.height = height + 'px';
    if (focusTarget && root.contains(focusTarget)) scrollFocusVisible(focusTarget);
  }

  // 把聚焦的输入框滚到「最近可滚动祖先（含根容器）」的垂直中部。
  // 取相对 bcr（元素 - 滚动容器），坐标系互相抵消，规避各浏览器坐标系不一致问题。
  function scrollFocusVisible(el) {
    if (!root || !root.contains(el)) return;
    let scroller = el.parentElement;
    while (scroller && scroller !== root) {
      const s = getComputedStyle(scroller);
      const oy = s.overflowY;
      if ((oy === 'auto' || oy === 'scroll') && scroller.scrollHeight > scroller.clientHeight + 1) break;
      scroller = scroller.parentElement;
    }
    if (!scroller) scroller = root;
    if (scroller.scrollHeight <= scroller.clientHeight + 1) return; // 无溢出，无需滚动
    const elTop = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    const target = elTop - (scroller.clientHeight - el.offsetHeight) / 2;
    scroller.scrollTo({ top: Math.max(0, scroller.scrollTop + target) });
  }

  function onFocusIn(e) {
    const el = e.target;
    if (!isTypingElement(el)) return;
    focusTarget = el;
    // 先按当前视觉视口收口容器，再延后两帧修正滚动（等键盘动画 / 容器重排落定）。
    syncShell();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (focusTarget === el) scrollFocusVisible(el);
    }));
  }
  function onFocusOut(e) { if (e.target === focusTarget) focusTarget = null; }

  root.addEventListener('focusin', onFocusIn);
  root.addEventListener('focusout', onFocusOut);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', syncShell);
  // 兜底：部分 WebView 键盘弹起只触发 window resize、不触发 visualViewport.resize。
  window.addEventListener('resize', syncShell);

  return function detach() {
    if (!root) return;
    root.removeEventListener('focusin', onFocusIn);
    root.removeEventListener('focusout', onFocusOut);
    if (window.visualViewport) window.visualViewport.removeEventListener('resize', syncShell);
    window.removeEventListener('resize', syncShell);
    clearShell();
    focusTarget = null;
  };
}
