// 让 Node 的 ESM 加载器把 *.css 视作空模块（仅冒烟测试用）。
export async function load(url, context, nextLoad) {
  if (url.endsWith('.css')) {
    return { format: 'module', source: '', shortCircuit: true };
  }
  return nextLoad(url, context);
}
