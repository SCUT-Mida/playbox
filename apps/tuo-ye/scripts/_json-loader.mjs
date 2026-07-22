// 让 Node 的 ESM 加载器处理 *.json 静态导入（Vite 项目在 Node 中运行测试用）。
// questionBank.js 使用了 Vite 风格的 JSON 静态导入（import X from './x.json'），
// 在纯 Node 环境中需要这个加载器来提供一个合法的 ESM 模块格式。
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// resolve hook：修正 questionBank.js 从 src/core/ 引用 '../data/...' 的路径。
// 实际数据位于 app 根目录 data/，而非 src/data/，需将 ../data/ → ../../data/。
export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('.json') && specifier.startsWith('../data/')) {
    const parentURL = context.parentURL;
    if (parentURL && parentURL.includes('/src/core/')) {
      const corrected = specifier.replace('../data/', '../../data/');
      return nextResolve(corrected, context);
    }
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.json')) {
    try {
      const path = fileURLToPath(url);
      const raw = readFileSync(path, 'utf-8');
      // 验证 JSON 合法性后再导出的方式：解析并重新 JSON.stringify
      const obj = JSON.parse(raw);
      return { format: 'module', source: `export default ${JSON.stringify(obj)};`, shortCircuit: true };
    } catch (_) {
      // 回退到默认加载器（可能因文件不存在等原因失败）
      return nextLoad(url, context);
    }
  }
  return nextLoad(url, context);
}
