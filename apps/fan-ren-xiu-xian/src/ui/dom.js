// ============================================================================
// 轻量 DOM 辅助：h() 创建元素，clear() 清空，避免引入框架。
// ============================================================================
export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'onClick') el.addEventListener('click', v);
      else if (k === 'onInput') el.addEventListener('input', v);
      else if (k === 'html') el.innerHTML = v; // 仅用于受控静态内容
      else if (k in el) { try { el[k] = v; } catch (_) { el.setAttribute(k, v); } }
      else el.setAttribute(k, v);
    }
  }
  appendChildren(el, children);
  return el;
}

function appendChildren(el, children) {
  for (const c of children) {
    if (c == null || c === false || c === true) continue;
    if (Array.isArray(c)) { appendChildren(el, c); continue; }
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
}

export function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

// 进度条
export function bar(value, max, opts = {}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return h('div', { class: `bar ${opts.class || ''}` },
    h('div', { class: 'bar__fill', style: { width: `${pct}%`, background: opts.color || '' } }),
    h('span', { class: 'bar__label' }, opts.label || `${Math.floor(value)}/${Math.round(max)}`),
  );
}
